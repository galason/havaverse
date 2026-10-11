# HavaVerse Identity — API Contract (v1)

**Status:** authoritative. Derived from `services/authApi.ts`, which is the frontend's compiled
source of truth. A backend that satisfies this document works with the existing React application
with **zero frontend changes** — flip `USE_IN_BROWSER_BACKEND` to `false` in `services/index.ts`
and nothing else moves.

This document does not introduce a second contract. Where the brief used different route names
(e.g. `/auth/forgot-password`), the shipped client routes are used instead and the difference is
called out in §9.

---

## 1. Conventions

| Concern | Value |
| --- | --- |
| Base path | `/api` (same origin as the SPA, or a reverse-proxied path — never a third-party origin) |
| Content type | `application/json; charset=utf-8` on both directions |
| Credentials | `credentials: "include"` on every request; session travels in an HTTP-only cookie |
| CSRF | Double-submit. Client mirrors readable `csrf_token` cookie into `X-CSRF-Token` header on every mutating request |
| Success (with body) | `200` + the resource JSON **directly** (not wrapped in `{ data: … }`) |
| Success (no body) | `204 No Content` |
| Failure | Non-2xx + `{ "code": "<wire_code>", "requestId": "<uuid>" }` |
| Rate limited | `429` + `Retry-After: <seconds>` header |
| Time | All timestamps ISO-8601 UTC |

> **Client parsing contract.** `request()` in `services/authApi.ts` reads `body.code` on failure and
> `Retry-After` on 429. It treats a 204 as `{ ok: true, data: null }`. Any other envelope shape
> breaks the client. Do not wrap success bodies.

---

## 2. Error model

The client's `AuthErrorCode` union defines the **wire codes**. The backend must emit exactly these
strings in `code`. The `AUTH_*` constants are the internal/log taxonomy and must be mapped down on
the way out.

| Internal constant | Wire `code` | HTTP | User-visible message (rendered by client) |
| --- | --- | --- | --- |
| `AUTH_INVALID_CREDENTIALS` | `invalid_credentials` | 401 | "We couldn't sign you in with those details…" |
| `AUTH_UNAUTHORIZED` | `invalid_credentials` | 401 | same |
| `AUTH_SESSION_EXPIRED` | `invalid_credentials` | 401 | same |
| `AUTH_EMAIL_NOT_VERIFIED` | `validation_failed` | 403 | "Check the highlighted fields and try again." |
| `AUTH_RATE_LIMITED` | `rate_limited` | 429 | "Too many attempts. Try again in a few minutes." |
| `AUTH_INVALID_OTP` / `AUTH_INVALID_VERIFICATION` | `invalid_code` | 400 | "That code is not correct. Try again." |
| `AUTH_OTP_EXPIRED` / `AUTH_RESET_EXPIRED` | `expired_code` | 400 | "That code has expired. Request a new one." |
| `AUTH_RESET_INVALID` | `expired_code` | 400 | same (invalid and expired are deliberately indistinguishable) |
| `AUTH_WEAK_PASSWORD` | `weak_password` | 422 | "Choose a stronger password." |
| `AUTH_USERNAME_TAKEN` | `username_taken` | 409 | "That username is already taken." |
| `AUTH_VALIDATION_ERROR` | `validation_failed` | 422 | "Check the highlighted fields and try again." |
| `AUTH_CSRF_FAILED` | `validation_failed` | 403 | same (never hint at CSRF to the caller) |
| any unhandled | `server_error` | 500 | "Something went wrong on our side." |

Never returned to the browser: database errors, stack traces, ORM messages, provider errors,
internal hostnames, whether an account exists, why a credential failed, remaining attempt counts on
enumeration-sensitive paths.

`requestId` is safe to return and must appear in server logs for support correlation.

---

## 3. The public identity object

Returned by every endpoint that resolves to an identity. Shape must match `HavaIdentity` in
`types/identity.ts` exactly.

```jsonc
{
  "id": "usr_01HZ…",
  "email": "daniel@havaverse.com",
  "phone": "+234 801 234 5678",
  "username": "danielokafor",
  "emailVerified": true,
  "phoneVerified": true,
  "accountType": "both",              // "viewer" | "creator" | "both"
  "profileComplete": true,
  "profile": {
    "firstName": "Daniel", "lastName": "Okafor", "displayName": "Daniel Okafor",
    "avatar": "https://cdn…", "bio": "…", "country": "Nigeria",
    "language": "English", "dateOfBirth": "1994-04-12",
    "interests": ["Movies", "Sports", "Music"]
  },
  "capabilities": ["watch","comment","follow","purchase","wallet","create","publish","monetize"],
  "sessions": [
    { "id": "ses_…", "device": "Chrome · macOS", "location": "Lagos, Nigeria",
      "lastActive": "Active now", "current": true }
  ]
}
```

**Must never appear on this object:** `passwordHash`, session secrets, CSRF secrets, reset or
verification tokens, OAuth access/refresh tokens, internal role rows, raw IP addresses, risk scores.

`capabilities` is a *derived, advisory* projection of server-side roles — it drives what the UI
offers, never what the server allows. Every privileged call is re-authorised server-side (§13 of the
architecture doc).

---

## 4. Endpoints

### 4.1 `GET /api/auth/session`
Resolve the caller from the session cookie. This is the **only** way the SPA learns who is signed
in, because the session cookie is HTTP-only and unreadable from JavaScript.

- **Auth:** optional. **CSRF:** not required (safe method).
- **Request:** none.
- **200:** `HavaIdentity`
- **200 with `null` body:** no session. *(The client accepts `null` and renders signed-out. Returning
  401 also works — the client maps it to signed-out — but `200 null` avoids console noise.)*
- **Side effects:** slide the session idle window; update `user_sessions.last_seen_at`; rotate the
  `csrf_token` cookie if it is missing.
- **Rate limit:** 120 / minute / IP.

### 4.2 `POST /api/auth/register`
- **Auth:** none. **CSRF:** required.
- **Body:** `{ firstName, lastName, username, email, password }`
- **201:** `HavaIdentity` (new user, `emailVerified: false`, `accountType: "viewer"`, `profileComplete: false`) **and** a fresh session cookie — the client navigates straight to `/choose-account-type`.
- **Errors:** `validation_failed` (422), `weak_password` (422), `username_taken` (409), `rate_limited` (429).
- **Enumeration:** if the email already exists, do **not** return a distinguishing error. Return `201`
  with the same timing, create no account, and send a "someone tried to register with your address"
  email to the real owner. The user proceeds to the verification screen and simply never receives a
  new-account link.
- **Server duties:** normalise email (lowercase, strip dots only where the provider warrants it — do
  not over-normalise), Argon2id the password, create `users` + `user_profiles` + `user_credentials` +
  first `user_sessions` row in one transaction, issue email verification token, emit
  `security_events: registration`.
- **Rate limit:** 5 / hour / IP, 3 / hour / email hash.

### 4.3 `POST /api/auth/login`
- **Auth:** none. **CSRF:** required.
- **Body:** `{ identifier, password }` — `identifier` is email **or** username.
- **200:** `HavaIdentity`; sets a new session cookie (session id rotated, never reused from a
  pre-login anonymous session).
- **Errors:** `invalid_credentials` (401), `rate_limited` (429).
- **Server duties:** constant-time compare; always run a dummy Argon2id verify when the account does
  not exist so timing does not leak; record `login_attempts`; on success clear the account's failure
  counter, create `user_sessions`, emit `security_events: login`; on failure emit `login_failed`.
- **Rate limit:** 5 failures / 15 min / account **and** 20 / 15 min / IP. Lockout is silent — the
  response is still `invalid_credentials` until the IP limit trips, then `rate_limited`.

### 4.4 `POST /api/auth/oauth/:provider`
`provider ∈ { google | apple | microsoft }`.

- **Auth:** none (or authenticated, when *linking* to an existing account). **CSRF:** required.
- **Body:** `{ code, redirectUri, codeVerifier }` (Authorization Code + PKCE).
- **200:** `HavaIdentity` + session cookie.
- **Errors:** `invalid_credentials` (401), `validation_failed` (422), `rate_limited` (429).
- **Linking rules (account-takeover critical):**
  1. Match on `social_accounts(provider, provider_user_id)` first — never on email alone.
  2. If no link exists and the provider asserts `email_verified: true` for an email that matches an
     existing local account, **do not auto-merge**. Create a pending link and require the user to
     authenticate with their existing password (or email magic-link) before the link is written.
  3. If the provider does not assert a verified email, always create a new account.
  4. Apple private-relay addresses are stored as-is and never used as a merge key.
- **Token handling:** exchange server-side only. Discard provider access tokens after profile
  fetch unless a product feature needs them; if stored, encrypt at rest with envelope encryption.

### 4.5 `POST /api/auth/logout`
- **Auth:** required. **CSRF:** required.
- **204.** Destroy the server-side session row, clear the session cookie with an expired
  `Set-Cookie`, rotate `csrf_token`, emit `security_events: logout`.
- **Optional body:** `{ "scope": "all" }` to revoke every session for the user (used by a future
  "sign out everywhere" control).

### 4.6 `GET /api/identity/username/:name`
- **Auth:** none. **CSRF:** n/a.
- **200:** `{ "available": true }`
- **Server duties:** normalise (casefold, trim), check reserved-word list, check `users.username`
  unique index. Answer in constant time and rate limit hard — this endpoint is an enumeration
  surface by design, so it must never reveal *why* a name is unavailable.
- **Rate limit:** 30 / minute / IP; 429 returns `{ "available": false }`-equivalent error, not a hint.

### 4.7 `POST /api/auth/email/resend`
- **Auth:** required. **CSRF:** required.
- **204** always (even if already verified — do not confirm state changes to a stale tab).
- **Server duties:** invalidate outstanding tokens for that user, issue a new one, send mail.
- **Rate limit:** 3 / hour / account, 10 / hour / IP. The client already shows a 42-second countdown;
  the server limit is independent and authoritative.

### 4.8 `POST /api/auth/email/verify`
- **Auth:** none (the link may be opened in a different browser). **CSRF:** required.
- **Body:** `{ token }` — the raw token from the emailed link.
- **200:** `HavaIdentity` with `emailVerified: true`. Issue a session **only if** the caller was
  already authenticated; verifying from a cold browser must not create a session.
- **Errors:** `expired_code` (400) for expired, consumed, unknown or malformed tokens — all four are
  indistinguishable.
- **Server duties:** hash the presented token, look up by hash, consume atomically
  (`UPDATE … SET consumed_at = now() WHERE id = $1 AND consumed_at IS NULL RETURNING …`), set
  `users.email_verified_at`, emit `email_verified`.

### 4.9 `POST /api/auth/phone/send`
- **Auth:** required. **CSRF:** required.
- **Body:** `{ phone }` — E.164.
- **204.** Generate a 6-digit OTP from a CSPRNG, store **only** its hash, 10-minute TTL, invalidate
  prior unconsumed OTPs for that user.
- **Errors:** `validation_failed` (422) for unparseable numbers, `rate_limited` (429).
- **Rate limit:** 3 / hour / account, 5 / hour / phone number, 10 / day / account. Apply a
  destination-country cost guard against SMS pumping fraud.
- **Never log the OTP.** Not in application logs, not in provider request logs, not in traces.

### 4.10 `POST /api/auth/phone/verify`
- **Auth:** required. **CSRF:** required.
- **Body:** `{ code }`
- **200:** `HavaIdentity` with `phoneVerified: true`.
- **Errors:** `invalid_code` (400), `expired_code` (400), `rate_limited` (429 after 5 attempts on one
  code — the code is then destroyed and a fresh send is required).
- **Server duties:** increment `phone_verifications.attempts` before comparing; constant-time hash
  compare; consume atomically; emit `phone_verified`.

### 4.11 `POST /api/auth/password/forgot`
> The brief calls this `/auth/forgot-password`. The client ships `/auth/password/forgot`. Keep the
> client's route; renaming it would require a frontend change for no benefit.

- **Auth:** none. **CSRF:** required.
- **Body:** `{ email }`
- **204 always**, in ~constant time, whether or not the account exists. Queue the email
  asynchronously so a hit and a miss cannot be distinguished by response latency.
- **Rate limit:** 3 / hour / email hash, 10 / hour / IP. Exceeding the limit still returns 204 to the
  caller where possible; only IP-level abuse returns 429.
- **Server duties:** 32-byte CSPRNG token, store SHA-256 hash only, 15-minute TTL, single-use,
  invalidate the user's prior reset tokens, emit `password_reset_requested`.

### 4.12 `POST /api/auth/password/reset`
- **Auth:** none. **CSRF:** required.
- **Body:** `{ token, password }`
- **204.**
- **Errors:** `expired_code` (400) for invalid/expired/consumed, `weak_password` (422),
  `rate_limited` (429).
- **Server duties (transactional):** consume token → re-hash password with Argon2id → **revoke every
  session for that user including the current one** → invalidate outstanding email/phone
  verification tokens → emit `password_reset_completed` → send a "your password changed" notice to
  the account email. The user must sign in again; the client already routes to `/login`.

### 4.13 `PATCH /api/identity/profile`
- **Auth:** required. **CSRF:** required.
- **Body:** `Partial<HavaProfile>` — any subset of the profile fields.
- **200:** full `HavaIdentity`.
- **Errors:** `validation_failed` (422).
- **Server duties:** whitelist fields (never mass-assign), sanitise `bio` (strip HTML, cap 180
  chars), validate `country`/`language` against controlled vocabularies, validate `dateOfBirth` and
  derive the under-13/under-16 flags that gate Kids profiles and personalised advertising. Avatar
  uploads go through a separate signed-upload endpoint, not this one.

### 4.14 `PATCH /api/identity/account-type`
- **Auth:** required. **CSRF:** required.
- **Body:** `{ accountType: "viewer" | "creator" | "both" }`
- **200:** `HavaIdentity` with recomputed `capabilities`.
- **Server duties:** account type is a *presentation preference plus a role grant*. Moving to
  `creator`/`both` grants the `CREATOR` role; it must **not** grant `PRO_CREATOR`, `STUDIO`,
  `MODERATOR` or anything above. Monetisation stays gated behind verification and payout onboarding
  regardless of this value. Emit `account_type_changed`.

### 4.15 `POST /api/devices/activate`
- **Auth:** required. **CSRF:** required.
- **Body:** `{ code }` — the 8-character code shown on the TV, e.g. `ABCD-1234`.
- **204.**
- **Errors:** `invalid_code` (400), `expired_code` (400), `rate_limited` (429 — 5 attempts / 10 min /
  account; device codes are brute-forceable by nature).
- **Server duties:** see §19 of the architecture document. Bind the pending device code to this
  user, mark it approved, and let the TV's polling call collect its own session. Emit
  `device_authorised` with the device fingerprint.

### 4.16 `DELETE /api/identity/sessions/:id`
- **Auth:** required. **CSRF:** required. **Authz:** the session must belong to the caller.
- **204.**
- **Errors:** `invalid_credentials` (401) if the session is not the caller's — never `404`, which
  would confirm the id exists.
- **Server duties:** delete the `user_sessions` row and its Redis entry so the revocation is
  immediate, not lazy. Emit `session_revoked`. Revoking the current session is allowed and behaves
  like logout.

---

## 5. Authentication requirement summary

| Endpoint | Session required | CSRF | Public rate limit |
| --- | --- | --- | --- |
| `GET /auth/session` | optional | no | 120/min/IP |
| `POST /auth/register` | no | yes | 5/h/IP · 3/h/email |
| `POST /auth/login` | no | yes | 5/15min/account · 20/15min/IP |
| `POST /auth/oauth/:provider` | optional (linking) | yes | 20/h/IP |
| `POST /auth/logout` | yes | yes | 60/h/session |
| `GET /identity/username/:name` | no | no | 30/min/IP |
| `POST /auth/email/resend` | yes | yes | 3/h/account |
| `POST /auth/email/verify` | no | yes | 10/h/IP |
| `POST /auth/phone/send` | yes | yes | 3/h/account · 5/h/number |
| `POST /auth/phone/verify` | yes | yes | 5/code · 20/h/account |
| `POST /auth/password/forgot` | no | yes | 3/h/email · 10/h/IP |
| `POST /auth/password/reset` | no | yes | 5/h/IP |
| `PATCH /identity/profile` | yes | yes | 30/h/account |
| `PATCH /identity/account-type` | yes | yes | 10/h/account |
| `POST /devices/activate` | yes | yes | 5/10min/account |
| `DELETE /identity/sessions/:id` | yes | yes | 30/h/account |

---

## 6. Cookies

| Cookie | Flags | Contents | Lifetime |
| --- | --- | --- | --- |
| `__Host-hv_session` | `HttpOnly; Secure; SameSite=Lax; Path=/` (no `Domain`) | opaque 32-byte session id, server-side lookup | 30 days absolute, 14 days idle |
| `csrf_token` | `Secure; SameSite=Lax; Path=/` — **readable by JS on purpose** | 32-byte random, bound to the session | matches session |

`__Host-` forbids a `Domain` attribute, so it only works when the API is same-origin with the SPA
(e.g. `havaverse.com` serving both `/` and `/api`). If Identity must live on
`id.havaverse.com`, drop to `__Secure-hv_session` with `Domain=.havaverse.com; SameSite=Lax` and
document the widened blast radius. **Prefer same-origin via reverse proxy.**

`SameSite=Lax` is chosen over `Strict` so that following an emailed verification link into the app
does not appear signed-out. It is safe here because every mutation additionally requires the CSRF
header, which a cross-site form post cannot set.

---

## 7. CSRF validation rule

For every `POST`/`PATCH`/`PUT`/`DELETE`:

1. Read `X-CSRF-Token` header. Missing → `403 validation_failed`.
2. Read `csrf_token` cookie. Missing → `403 validation_failed`.
3. Constant-time compare the two. Mismatch → `403`, emit `csrf_failed` security event.
4. Additionally verify the token is bound to the current session id (store the pairing server-side
   or HMAC the session id into the token). This defeats cookie-injection attacks that a naive
   double-submit misses.
5. Verify `Origin`/`Sec-Fetch-Site` as a second layer; reject cross-site origins outright.

Rotate `csrf_token` on login, logout and password change.

---

## 8. Versioning

The path is `/api/...` today. Introduce `/api/v2/...` only for breaking changes; additive fields on
`HavaIdentity` are non-breaking because the client destructures known keys. Removing or renaming any
field in §3 **is** breaking and requires a coordinated frontend release.

---

## 9. Deviations from the brief (and why)

| Brief said | Contract uses | Reason |
| --- | --- | --- |
| `POST /auth/forgot-password` | `POST /auth/password/forgot` | Already shipped in `services/authApi.ts`; renaming needs a pointless frontend change. |
| `POST /auth/reset-password` | `POST /auth/password/reset` | As above. |
| `POST /auth/resend-verification`, `/auth/resend-otp` | `POST /auth/email/resend`, `POST /auth/phone/send` | Same behaviour; resend and initial send are one idempotent endpoint per channel. |
| `AUTH_*` error strings on the wire | snake_case wire codes + `AUTH_*` internally | The shipped client's `AuthErrorCode` union is the parser. Emitting `AUTH_*` on the wire would collapse every error to `server_error`. Mapping table in §2. |

No other deviations. Everything else in the brief is satisfied by this contract as written.
