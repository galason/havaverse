# HavaVerse Identity — Service Architecture & Delivery Spec (v1)

Companion to `identity-api-contract.md` (the wire contract) and `identity-database-schema.md` (the
data model). This document covers topology, flows, security controls, environment, deployment,
testing and the exact cutover steps.

**Scope boundary.** Nothing in this document is implemented inside the React application, and
nothing here should be. The React app's only responsibility is calling the typed contract.

---

## 1. Service responsibilities

**HavaVerse Identity** owns, and is the only service permitted to write:

registration · login · logout · session lifecycle · email verification · phone verification ·
password reset · social authentication · account profile · account type · device and session
management · security events · the role/permission grants that authorisation reads.

It explicitly does **not** own: content, payments, communities, recommendations, or any product
state. Those services consume identity; they never reach into its tables.

### Coupling rules

1. No product service queries Identity's database directly. They call the API or read a
   signed, short-lived introspection response.
2. Identity emits domain events (`user.registered`, `user.email_verified`,
   `user.account_type_changed`, `session.revoked`) onto the platform bus. Products subscribe.
   Identity never calls a product service synchronously during authentication — a degraded
   HavaPay must never be able to block sign-in.
3. Identity has no knowledge of Studio, Play, Live, Market or HavaPay concepts beyond a role name.

### Internal module layout

```
identity-service/
  http/          route handlers, request validation (zod), error mapping
  domain/        registration, login, verification, reset, oauth, sessions, roles
  security/      argon2, tokens, csrf, rate-limit, risk scoring, redaction
  data/          repositories, migrations
  events/        outbound bus publisher, security event writer
  providers/     email (transactional), sms, oauth clients
```

Handlers contain no security logic; they delegate to `domain`, which delegates to `security`. This
keeps every control in one auditable place.

---

## 2. Deployment topology

```
                         Browser / TV / Mobile
                                  │  HTTPS, cookies
                                  ▼
                    ┌──────────────────────────┐
                    │  CDN  +  WAF / bot mgmt  │
                    └──────────────┬───────────┘
                                   ▼
                    ┌──────────────────────────┐
                    │  API Gateway / Reverse    │  same-origin routing:
                    │  Proxy  (havaverse.com)   │   /        → SPA (static)
                    └───────┬──────────┬────────┘   /api/*   → Identity
                            │          │
              ┌─────────────┘          └──────────────┐
              ▼                                       ▼
   ┌────────────────────┐                  ┌────────────────────┐
   │ HavaVerse Identity │                  │ Other HavaVerse    │
   │  (stateless, N≥2)  │                  │ domain services    │
   └───┬───────┬────────┘                  └────────────────────┘
       │       │
       │       └──────────────► Redis  (sessions cache, rate limits, OTP throttles, locks)
       │
       ├──────────────────────► PostgreSQL (primary + read replica, PITR)
       │
       ├──────────────────────► Email provider  (transactional: verify, reset, security notices)
       ├──────────────────────► SMS provider    (OTP; per-country cost guard)
       └──────────────────────► Secrets manager (KMS-backed)
```

**Same-origin is a security requirement, not a convenience.** Serving the SPA and `/api` from one
origin is what allows `__Host-` cookies with `SameSite=Lax` and no CORS surface. If Identity must
be split onto `id.havaverse.com`, you lose `__Host-`, must configure strict CORS with an explicit
allow-list and `Access-Control-Allow-Credentials: true`, and widen cookie scope to
`Domain=.havaverse.com`. Prefer the proxy.

Identity instances are stateless and horizontally scaled. All shared state is Redis or Postgres.

---

## 3. Authentication sequences

### 3.1 Registration → verification

```
Browser                  Identity                 Postgres        Email
   │  POST /auth/register    │                        │              │
   │────────────────────────►│                        │              │
   │                         │ validate + zxcvbn      │              │
   │                         │ argon2id(password)     │              │
   │                         │──── TX: users,         │              │
   │                         │      profiles, prefs,  │              │
   │                         │      credentials,      │              │
   │                         │      session ─────────►│              │
   │                         │ token = CSPRNG(32)     │              │
   │                         │ store sha256(token) ──►│              │
   │                         │ enqueue mail ─────────────────────────►│
   │  201 HavaIdentity       │                        │              │
   │  Set-Cookie: __Host-hv_session                   │              │
   │  Set-Cookie: csrf_token │                        │              │
   │◄────────────────────────│                        │              │
   │                                                                  │
   │  (user clicks link) POST /auth/email/verify { token }            │
   │────────────────────────►│ UPDATE … consumed_at = now()           │
   │                         │   WHERE token_hash AND NOT consumed    │
   │                         │   AND not expired  RETURNING user_id   │
   │  200 HavaIdentity       │ set email_verified_at; event           │
   │◄────────────────────────│                                        │
```

If the email already exists, the response is byte-identical and equally timed; the *real* owner
receives a "someone tried to sign up with your address" notice instead of a verification link.

### 3.2 Login with lockout and rotation

```
Browser                Identity                Redis            Postgres
   │ POST /auth/login     │                       │                 │
   │─────────────────────►│ check rl:login:ip ───►│                 │
   │                      │ check rl:login:acct ─►│                 │
   │                      │  (either exceeded → 429 + Retry-After)  │
   │                      │ load credentials ─────────────────────► │
   │                      │ argon2.verify (dummy verify if no user) │
   │                      │ ── fail: incr counters, log attempt,    │
   │                      │          event login_failed, 401        │
   │                      │ ── ok:   clear counters                 │
   │                      │          revoke pre-auth session        │
   │                      │          INSERT user_sessions (rotate)  │
   │                      │          SET redis session:<hash> ─────►│
   │                      │          rotate csrf_token              │
   │                      │          risk score → maybe step-up     │
   │ 200 HavaIdentity     │                                         │
   │ Set-Cookie ×2        │                                         │
   │◄─────────────────────│                                         │
```

Both the "no such account" and "wrong password" branches run an Argon2id verification against a
fixed dummy hash so response timing carries no signal.

### 3.3 Password reset

```
POST /auth/password/forgot { email }
  → 204 immediately (constant time), mail queued asynchronously
  → if account exists: invalidate prior tokens, store sha256(CSPRNG(32)), TTL 15 min

POST /auth/password/reset { token, password }
  → TX: consume token atomically
       ↳ argon2id rehash, push old hash into previous_hashes (max 5, block reuse)
       ↳ REVOKE ALL user_sessions for the user (including the caller's)
       ↳ DEL every redis session key for the user
       ↳ invalidate outstanding email/phone verification tokens
       ↳ events: password_reset_completed
  → send "your password was changed" notice
  → 204; client routes to /login and the user re-authenticates
```

### 3.4 OAuth / OIDC (Authorization Code + PKCE)

```
Browser          Identity                      Provider
   │ GET /auth/oauth/google/start │                  │
   │─────────────────────────────►│ state + PKCE     │
   │                              │ stored in Redis  │
   │  302 → provider consent ─────┼─────────────────►│
   │◄──── redirect with code ─────┼──────────────────│
   │ POST /auth/oauth/google      │                  │
   │  { code, redirectUri, codeVerifier }            │
   │─────────────────────────────►│ verify state     │
   │                              │ exchange code ──►│  (server-side only)
   │                              │ validate id_token: iss, aud, exp, nonce, signature via JWKS
   │                              │ look up social_accounts(provider, sub)
   │                              │  ├─ found      → sign in
   │                              │  ├─ not found, email unverified → new account
   │                              │  └─ not found, email verified & matches local account
   │                              │        → PENDING LINK, require password/magic-link proof
   │ 200 HavaIdentity             │                  │
```

Rule 3 is the account-takeover defence: an attacker who controls a provider account asserting a
victim's email address must still prove control of the HavaVerse account before a link is written.

### 3.5 TV / device activation

```
 TV                    Identity                 Browser (signed-in user)
  │ POST /devices/code    │                            │
  │──────────────────────►│ user_code "HVXK-7R2M"      │
  │                       │ device_code (secret)       │
  │  { user_code,         │ TTL 10 min, interval 5s    │
  │    verification_uri,  │                            │
  │    interval }         │                            │
  │◄──────────────────────│                            │
  │                       │                            │
  │ poll POST /devices/token { device_code }           │
  │──────────────────────►│ authorization_pending      │
  │◄──────────────────────│ (or slow_down / expired)   │
  │                       │                            │
  │                       │  POST /devices/activate { code }  ◄──────│
  │                       │  bind approved_by = user, approved_at    │
  │                       │  204 ────────────────────────────────────►
  │                       │                            │
  │ poll POST /devices/token                           │
  │──────────────────────►│ create user_session (kind=tv)
  │  session established  │ consume authorization      │
  │◄──────────────────────│                            │
```

This is RFC 8628 (OAuth Device Authorization Grant) shaped to our session model. Only
`POST /devices/activate` exists in the current frontend contract; `/devices/code` and
`/devices/token` are TV-client endpoints and are additive — they do not change the browser contract.
The resulting TV session is an ordinary `user_sessions` row, so it appears in Security → Devices and
is revocable through `DELETE /identity/sessions/:id`.

---

## 4. Security controls

| Control | Implementation |
| --- | --- |
| Password hashing | Argon2id, `m=64MiB, t=3, p=4`, 16-byte salt, 32-byte output. Params stored per row; transparent rehash on login when policy moves. Never bcrypt for new hashes. |
| Password policy | Minimum 8 with composition guidance in the UI; server additionally runs zxcvbn ≥ 3 and a breached-password check (k-anonymity range query against HIBP, fail-open on provider outage). Block reuse of last 5. |
| Token generation | `crypto.randomBytes(32)`, base64url. Stored as SHA-256. Compared with `timingSafeEqual`. |
| OTP | 6 digits from `crypto.randomInt`, per-row salt + SHA-256, 10-minute TTL, 5 attempts, single use, never logged. |
| Session cookie | `__Host-hv_session`, HttpOnly, Secure, SameSite=Lax, Path=/, opaque 32-byte id. 14-day idle / 30-day absolute. Rotated on login, password change, privilege change. |
| CSRF | Double-submit with session binding + `Origin`/`Sec-Fetch-Site` check. See contract §7. |
| Rate limiting | Redis sliding window at IP, account, email-hash, phone, device and endpoint scope. Limits in contract §5. Distributed, not per-instance. |
| Brute-force | Per-account exponential backoff after 5 failures; silent to the caller until the IP limit trips. |
| Enumeration | Identical bodies, statuses and timings on `/login`, `/register`, `/password/forgot`. Username availability is constant-time and hard-limited. |
| Input validation | zod schemas at the edge, allow-list only, no mass assignment. Frontend validation is UX, never a control. |
| Output safety | A single response serialiser produces `HavaIdentity`; hashes and tokens are not in the model's default projection at all. |
| Logging redaction | Shared filter strips `password`, `token`, `code`, `otp`, `secret`, `authorization`, `cookie`, `set-cookie` at any depth, applied to logs, traces and `security_events.metadata`. |
| Transport | TLS 1.2+ only, HSTS with preload, secure headers (CSP, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`). |
| Secrets | KMS-backed secrets manager, no secret in an image, env file or repo. Rotation runbook per secret. |
| Suspicious login | Risk score from new device fingerprint + new country + impossible travel + failed-attempt history. High risk → require email OTP step-up and emit `suspicious_login`; always send a notice email. |

### Authorization is separate from authentication

Authentication answers *who*; authorisation answers *may they*. Roles live in `account_roles` and
are evaluated server-side on every privileged call via a policy layer:

```
can(user, 'publish', { contentId })       → CREATOR|STUDIO role AND ownership AND rights cleared
can(user, 'moderate', { communityId })    → MODERATOR scoped to that community, or ADMIN
can(user, 'configure_platform')           → ADMIN | SUPER_ADMIN, MFA-required session
```

`capabilities[]` on the API response exists so the UI can hide what the user cannot do. It is never
trusted. An attacker editing it in devtools changes nothing, because no endpoint reads it.

`ADMIN`/`SUPER_ADMIN` sessions additionally require MFA and carry a shorter idle window.

---

## 5. Environment variables

Server-side only. **None of these may ever appear in a Vite/React `VITE_*` variable — those are
compiled into the browser bundle and are public.**

```bash
# Runtime
NODE_ENV=production
PORT=8080
APP_BASE_URL=https://havaverse.com
API_BASE_PATH=/api
TRUST_PROXY=1                        # honour X-Forwarded-For from the gateway only

# Data
DATABASE_URL=postgres://…            # via secrets manager, TLS required
DATABASE_READ_URL=postgres://…       # replica for read-heavy endpoints
DATABASE_POOL_MAX=20
REDIS_URL=rediss://…

# Crypto
SESSION_COOKIE_NAME=__Host-hv_session
SESSION_IDLE_TTL_DAYS=14
SESSION_ABSOLUTE_TTL_DAYS=30
TOKEN_PEPPER=                        # HMAC pepper for token hashes; rotate with dual-read
ARGON2_MEMORY_KIB=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=4

# OAuth
GOOGLE_CLIENT_ID= / GOOGLE_CLIENT_SECRET=
APPLE_TEAM_ID= / APPLE_KEY_ID= / APPLE_PRIVATE_KEY= / APPLE_CLIENT_ID=
MICROSOFT_CLIENT_ID= / MICROSOFT_CLIENT_SECRET= / MICROSOFT_TENANT=
OAUTH_REDIRECT_URI=https://havaverse.com/api/auth/oauth/callback

# Providers
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM="HavaVerse <no-reply@havaverse.com>"
SMS_PROVIDER_SID= / SMS_PROVIDER_TOKEN= / SMS_FROM=
SMS_ALLOWED_COUNTRIES=NG,GH,KE,ZA,GB,US

# Policy
RATE_LIMIT_LOGIN_PER_ACCOUNT=5/15m
RATE_LIMIT_LOGIN_PER_IP=20/15m
HIBP_ENABLED=true

# Observability
LOG_LEVEL=info
OTEL_EXPORTER_OTLP_ENDPOINT=
SENTRY_DSN=
```

---

## 6. Operations

**Migrations.** Forward-only, versioned, run as a pre-deploy job with an advisory lock so only one
instance migrates. Expand/contract for breaking changes: add column → backfill → dual-write → cut
reads → drop old column in a later release. Never mix a destructive migration with an app deploy.

**Logging.** Structured JSON, one line per request, with `requestId`, route, status, duration,
user id (never email), hashed IP. Redaction filter applied globally. Auth failures log the
*category*, never the submitted credential.

**Monitoring & alerts.**

| Signal | Alert threshold |
| --- | --- |
| Login failure ratio | > 40 % over 5 min |
| 429 rate on `/auth/*` | sudden 10× increase (credential stuffing) |
| `csrf_failed` events | > 20 / min |
| Argon2 p99 latency | > 400 ms (capacity or param drift) |
| Email/SMS provider errors | > 2 % over 10 min |
| Session store availability | any Redis failover |
| Verification completion rate | drop > 30 % day-over-day (deliverability) |

**Health checks.** `GET /healthz` — process liveness, no dependencies. `GET /readyz` — Postgres
`SELECT 1`, Redis `PING`, migration version match. Gateway routes traffic on `/readyz` only.

**Backups.** Postgres PITR with 7-day WAL retention plus nightly full snapshots held 35 days.
Quarterly restore drills to a scratch environment, timed and documented. Redis is a cache and
throttle store — it is *not* backed up, and the service must survive a cold Redis (sessions
degrade to a Postgres lookup, rate-limit windows reset).

**Deployment strategy.** Blue/green or rolling with health gating and automatic rollback. Because
sessions are server-side and opaque, instances are interchangeable and a rollback never invalidates
user sessions. Run a canary at 5 % for 15 minutes watching the alert table above.

**Incident runbooks.** Credential-stuffing surge, provider outage (email/SMS), suspected token
leak (rotate `TOKEN_PEPPER` with dual-read, mass-revoke sessions), and mass session revocation.

---

## 7. Test plan

**Unit** — Argon2 wrapper (verify, rehash-on-policy-change), token generate/hash/compare, OTP
generation distribution, CSRF comparison, rate-limit window maths, capability projection, redaction
filter (asserts that a payload containing `password`/`otp`/`token` emerges clean).

**Integration (per endpoint)** — happy path, validation failure, auth failure, CSRF failure, rate
limit, and the exact response envelope the client parses.

**Security-focused integration — these are the ones that matter:**

1. **Enumeration.** `/password/forgot` with a real and a fake address: assert identical status,
   identical body, and response-time distributions overlapping within tolerance across 100 runs.
2. **Enumeration on login.** Same assertion for unknown-account vs wrong-password.
3. **Brute force.** 6 rapid failures → 429 with `Retry-After`; account counter isolated from other
   accounts; correct password during lockout still refused.
4. **CSRF.** Mutation with no header → 403; with mismatched header → 403; with a header valid for a
   *different* session → 403 (this is the one naive double-submit fails).
5. **Session expiry.** Idle past the window → `/auth/session` returns null; absolute expiry cannot
   be extended by activity.
6. **Session revocation.** Revoke in tab A, next request in tab B is unauthenticated *immediately*,
   not after TTL.
7. **Rotation.** Session id after login ≠ session id before (fixation); after password reset every
   prior session is dead, including the initiating one.
8. **Token single-use.** Replay a consumed verification/reset token → `expired_code`. Race two
   concurrent redemptions → exactly one succeeds.
9. **OTP.** Wrong code 5× destroys the code; expired code rejected; correct code after expiry
   rejected; OTP absent from every log sink.
10. **OAuth linking.** Provider identity asserting an existing verified email does **not** auto-merge;
    forged `id_token` signature rejected; replayed `state` rejected; missing PKCE verifier rejected.
11. **Authorization.** A `viewer` calling a creator-only endpoint → 403 even with a tampered
    `capabilities` array; scoped `MODERATOR` cannot moderate another community; no public path
    grants `ADMIN`.
12. **Concurrent sessions.** Five devices sign in; all appear in the Devices list; revoking one
    leaves the other four intact.
13. **Password change.** Reuse of a previous hash rejected; weak/breached password rejected;
    notice email dispatched.
14. **Suspicious login.** New country + new device triggers step-up and a `suspicious_login` event.
15. **Contract conformance.** A generated suite that drives the real `httpAuthApi` against a
    running backend and asserts every method returns the shape `services/authApi.ts` expects.

**Load** — login at expected peak with Argon2 at production parameters (this is the CPU bound;
size instances from it), and a credential-stuffing simulation to confirm limits hold under
distributed source IPs.

---

## 8. Backend implementation checklist

- [ ] Postgres provisioned; migrations `0001`–`0012` applied; replica + PITR configured
- [ ] Redis provisioned with failover; separate logical DBs for sessions and rate limits
- [ ] Argon2id wrapper with policy params and transparent rehash
- [ ] Token service: CSPRNG generate, pepper + SHA-256 store, timing-safe compare, atomic consume
- [ ] Session service: create, resolve, slide, rotate, revoke-one, revoke-all; Redis + Postgres dual write
- [ ] CSRF middleware with session binding and `Origin` check
- [ ] Distributed rate limiter with the limits in contract §5
- [ ] All 16 contract endpoints, returning the exact envelopes in contract §4
- [ ] Error mapper emitting the snake_case wire codes in contract §2
- [ ] Global redaction filter wired into logger, tracer and `security_events`
- [ ] Email templates: verify, reset, password-changed, new-device, attempted-signup
- [ ] SMS OTP with country allow-list and cost guard
- [ ] OAuth clients for Google, Apple, Microsoft with PKCE + strict linking rules
- [ ] Role/permission policy layer; `capabilities` projection derived server-side
- [ ] Security event writer on all 20+ event types
- [ ] Device authorization endpoints (`/devices/code`, `/devices/token`) for TV clients
- [ ] Retention jobs scheduled
- [ ] `/healthz`, `/readyz`, metrics, alerts
- [ ] Security test suite §7 green in CI; deploy blocked on failure
- [ ] Third-party penetration test before public launch

## 9. Frontend integration checklist

- [ ] Backend reachable at `/api` **same-origin** with the SPA (reverse proxy configured)
- [ ] `GET /api/auth/session` returns `HavaIdentity` or `null` and sets `csrf_token` when absent
- [ ] Set `USE_IN_BROWSER_BACKEND = false` in `services/index.ts`
- [ ] Delete `services/mockAuthBackend.ts` and its export from `services/index.ts`
- [ ] Verify each page against the live service: Login, Register, Choose account type, Complete
      profile, Verify email, Verify phone, Forgot password, Reset password, Activate
- [ ] Confirm `RequireAuth` holds protected routes during bootstrap and preserves `?redirect=`
- [ ] Confirm no `Authorization` header, token or user id is written to `localStorage`/`sessionStorage`
- [ ] Replace the prototype hints ("any 8+ character password", "Prototype code: 123456") in
      `pages/auth/Login.tsx` and `pages/auth/VerifyPhone.tsx`
- [ ] Wire the real email-link token: `/verify-email?token=…` → read the query param and pass it to
      `authApi.verifyEmail(token)` instead of the placeholder string in `AuthContext`
- [ ] Same for `/reset-password?token=…` → `authApi.resetPassword(token, password)`
- [ ] Point `SocialAuthButtons` at `/api/auth/oauth/:provider/start` (full-page redirect) rather
      than the direct POST the mock accepts

## 10. Cutover — exact steps

1. **Deploy Identity** behind the gateway at `/api`, with migrations applied and `/readyz` green.
2. **Smoke test with curl**, not the app: register → verify → login → session → logout, confirming
   `Set-Cookie` flags are `HttpOnly; Secure; SameSite=Lax` and `__Host-` prefixed.
3. **Flip one flag** — `USE_IN_BROWSER_BACKEND = false` in `services/index.ts`. This is the only
   required code change in the React application.
4. **Add the two token reads** (items 9 and 10 in the frontend checklist) so emailed links carry
   their token through to the API instead of the placeholder.
5. **Run the contract conformance suite** (test §15) against staging.
6. **Canary** 5 % of traffic for 15 minutes against the alert table in §6.
7. **Promote**, then delete `services/mockAuthBackend.ts` so it can never be re-enabled in
   production by accident.

Nothing in `pages/auth/*`, `components/auth/*` or the authentication visual design changes at any
point in this sequence. That is the whole purpose of the typed boundary.

---

## 11. Why this stays a platform service

Every HavaVerse product — AI, Director, Studio, Play, Live, Community, Market, HavaPay — resolves
the *same* `users.id`. The consumer, creator, studio, community, HavaPay and security identities in
the product model are projections over one record plus scoped roles, not separate accounts. A
viewer who starts creating gains a role; a creator who opens a studio gains a scoped role; a user
who links HavaPay gains a payment profile keyed to the same id.

That is what makes "one account, one entertainment universe" true in the data rather than just in
the copy — and it is why Identity must ship before, and independently of, everything that depends
on it.
