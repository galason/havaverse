# HavaVerse Identity — PostgreSQL Schema (v1)

Target: PostgreSQL 15+. Extensions: `pgcrypto` (UUIDv4 / `digest`), `citext` (case-insensitive
email and username).

Principles applied throughout:

- **No plaintext secrets.** Passwords are Argon2id. Every token (email, reset, OTP, device code,
  session) is stored only as a SHA-256 digest of a CSPRNG value. The raw value exists exactly once,
  in the message sent to the user.
- **Single identity, many products.** One `users` row backs the consumer, creator, studio,
  community and HavaPay experiences. Product-specific data lives in those products' own schemas and
  references `users.id`.
- **Deletion is soft then hard.** `deleted_at` tombstones the row for the grace period, then a
  scheduled job hard-deletes PII and retains only an anonymised audit trail.

---

## 1. Enumerations

```sql
CREATE TYPE account_type       AS ENUM ('viewer', 'creator', 'both');
CREATE TYPE user_status        AS ENUM ('active', 'pending', 'suspended', 'locked', 'deleted');
CREATE TYPE auth_role          AS ENUM (
  'USER','CREATOR','PRO_CREATOR','STUDIO','ORGANIZATION','MODERATOR','ADMIN','SUPER_ADMIN'
);
CREATE TYPE oauth_provider     AS ENUM ('google', 'apple', 'microsoft');
CREATE TYPE security_event_type AS ENUM (
  'registration','login','login_failed','logout','session_created','session_revoked',
  'password_changed','password_reset_requested','password_reset_completed',
  'email_verification_sent','email_verified','phone_code_sent','phone_verified',
  'social_linked','social_unlinked','account_type_changed','role_granted','role_revoked',
  'device_authorised','device_revoked','csrf_failed','suspicious_login','account_locked'
);
```

---

## 2. Core identity

```sql
CREATE TABLE users (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email              CITEXT NOT NULL,
  email_verified_at  TIMESTAMPTZ,
  phone              TEXT,                         -- E.164
  phone_verified_at  TIMESTAMPTZ,
  username           CITEXT NOT NULL,
  account_type       account_type NOT NULL DEFAULT 'viewer',
  status             user_status  NOT NULL DEFAULT 'pending',
  profile_complete   BOOLEAN NOT NULL DEFAULT FALSE,
  locked_until       TIMESTAMPTZ,                  -- soft lock from failed logins
  last_login_at      TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ
);

-- Uniqueness ignores soft-deleted rows so a freed username can be reclaimed after purge.
CREATE UNIQUE INDEX users_email_unique    ON users (email)    WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX users_username_unique ON users (username) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX users_phone_unique    ON users (phone)    WHERE deleted_at IS NULL AND phone IS NOT NULL;
CREATE INDEX users_status_idx ON users (status) WHERE deleted_at IS NULL;
```

`username` additionally passes a reserved-word denylist in application code (`admin`, `support`,
`havaverse`, `havapay`, `billing`, `security`, …).

```sql
CREATE TABLE user_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT NOT NULL DEFAULT '',
  display_name  TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  bio           VARCHAR(180) NOT NULL DEFAULT '',
  country       TEXT,                    -- ISO 3166-1 alpha-2
  language      TEXT NOT NULL DEFAULT 'en',
  date_of_birth DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

```sql
CREATE TABLE user_preferences (
  user_id            UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  interests          TEXT[] NOT NULL DEFAULT '{}',
  content_languages  TEXT[] NOT NULL DEFAULT '{}',
  maturity_ceiling   TEXT   NOT NULL DEFAULT 'PG-16',
  marketing_opt_in   BOOLEAN NOT NULL DEFAULT FALSE,
  reduced_motion     BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX user_preferences_interests_idx ON user_preferences USING GIN (interests);
```

---

## 3. Credentials

```sql
CREATE TABLE user_credentials (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash        TEXT NOT NULL,          -- Argon2id encoded string, includes salt + params
  algorithm            TEXT NOT NULL DEFAULT 'argon2id',
  params               JSONB NOT NULL,         -- { m: 65536, t: 3, p: 4 } — for transparent rehash
  password_changed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  must_change          BOOLEAN NOT NULL DEFAULT FALSE,
  previous_hashes      TEXT[] NOT NULL DEFAULT '{}',  -- last 5, to block reuse
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX user_credentials_user_unique ON user_credentials (user_id);
```

Rules: rehash transparently on login when `params` are below current policy. A user created purely
through OAuth has **no** row here until they set a password. Never `SELECT password_hash` into any
response serialiser — keep it out of the default ORM projection.

---

## 4. Sessions and devices

```sql
CREATE TABLE user_devices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fingerprint   TEXT NOT NULL,           -- hash of UA + platform + client id; not a tracking id
  device_name   TEXT NOT NULL,           -- "Chrome · macOS", "HavaVerse on Android TV"
  device_kind   TEXT NOT NULL,           -- browser | mobile | tv | console
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  trusted       BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at    TIMESTAMPTZ
);
CREATE UNIQUE INDEX user_devices_user_fingerprint ON user_devices (user_id, fingerprint);

CREATE TABLE user_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id       UUID REFERENCES user_devices(id) ON DELETE SET NULL,
  token_hash      BYTEA NOT NULL,        -- SHA-256 of the opaque cookie value
  ip_hash         BYTEA,                 -- hashed, not raw: minimise PII
  approx_location TEXT,                  -- "Lagos, Nigeria" — city granularity only
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  idle_expires_at TIMESTAMPTZ NOT NULL,  -- now() + 14 days, slid on each request
  absolute_expires_at TIMESTAMPTZ NOT NULL, -- created_at + 30 days, never extended
  revoked_at      TIMESTAMPTZ,
  revoked_reason  TEXT                   -- logout | password_reset | admin | user_revoked | expired
);
CREATE UNIQUE INDEX user_sessions_token_hash ON user_sessions (token_hash);
CREATE INDEX user_sessions_user_active ON user_sessions (user_id)
  WHERE revoked_at IS NULL;
CREATE INDEX user_sessions_expiry ON user_sessions (absolute_expires_at)
  WHERE revoked_at IS NULL;
```

Lifecycle: the session id is also written to Redis (`session:<token_hash>` → user id + roles, TTL =
idle window) so the hot path is a single Redis `GET`. Postgres is the durable record and the source
for the Devices screen. **Revocation deletes the Redis key first, then updates Postgres**, so a
revoked session dies immediately rather than at next TTL.

Rotation: on login, password change and any privilege change, insert a new session row and revoke
the old one in the same transaction.

---

## 5. Social accounts

```sql
CREATE TABLE social_accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider          oauth_provider NOT NULL,
  provider_user_id  TEXT NOT NULL,       -- the `sub` claim; the ONLY safe join key
  provider_email    CITEXT,              -- informational; never a merge key
  email_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  linked_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at      TIMESTAMPTZ,
  refresh_token_enc BYTEA                -- NULL unless a product genuinely needs it; envelope-encrypted
);
CREATE UNIQUE INDEX social_accounts_provider_subject ON social_accounts (provider, provider_user_id);
CREATE UNIQUE INDEX social_accounts_user_provider    ON social_accounts (user_id, provider);
```

A user may link at most one identity per provider, and one provider identity maps to at most one
HavaVerse user. Unlinking is blocked when it would leave an account with no password **and** no
other provider.

---

## 6. Verification and reset tokens

All three tables share the same discipline: store a hash, expire fast, consume once.

```sql
CREATE TABLE email_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email       CITEXT NOT NULL,            -- the address being proven, may differ from users.email
  token_hash  BYTEA NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,       -- created_at + 15 min
  consumed_at TIMESTAMPTZ,
  created_ip_hash BYTEA,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX email_verifications_token ON email_verifications (token_hash);
CREATE INDEX email_verifications_open ON email_verifications (user_id)
  WHERE consumed_at IS NULL;

CREATE TABLE phone_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone       TEXT NOT NULL,
  code_hash   BYTEA NOT NULL,             -- SHA-256 of the 6 digits + per-row salt
  salt        BYTEA NOT NULL,
  attempts    SMALLINT NOT NULL DEFAULT 0,
  max_attempts SMALLINT NOT NULL DEFAULT 5,
  expires_at  TIMESTAMPTZ NOT NULL,       -- created_at + 10 min
  consumed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX phone_verifications_open ON phone_verifications (user_id)
  WHERE consumed_at IS NULL;

CREATE TABLE password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  BYTEA NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,       -- created_at + 15 min
  consumed_at TIMESTAMPTZ,
  requested_ip_hash BYTEA,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX password_reset_tokens_token ON password_reset_tokens (token_hash);
CREATE INDEX password_reset_tokens_open ON password_reset_tokens (user_id)
  WHERE consumed_at IS NULL;
```

Atomic consumption pattern (used by all three — never read-then-write):

```sql
UPDATE password_reset_tokens
   SET consumed_at = now()
 WHERE token_hash = $1
   AND consumed_at IS NULL
   AND expires_at > now()
RETURNING user_id;
```

A zero-row result is reported as `expired_code` regardless of cause.

Because a 6-digit OTP has only 10⁶ possibilities, its hash must be salted per row and the
`attempts` guard is the real defence — hashing alone is not sufficient against an offline dump.

---

## 7. Login attempts and rate limiting

```sql
CREATE TABLE login_attempts (
  id           BIGSERIAL PRIMARY KEY,
  identifier_hash BYTEA NOT NULL,      -- hash of submitted email/username; never the raw value
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,   -- NULL when no such account
  ip_hash      BYTEA NOT NULL,
  successful   BOOLEAN NOT NULL,
  failure_kind TEXT,                   -- bad_password | no_account | locked | rate_limited
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX login_attempts_identifier_window ON login_attempts (identifier_hash, created_at DESC);
CREATE INDEX login_attempts_ip_window         ON login_attempts (ip_hash, created_at DESC);
```

Postgres is the **forensic** record. The **enforcement** counters live in Redis
(`rl:login:acct:<hash>`, `rl:login:ip:<hash>`) as sliding windows, because per-request writes to
Postgres will not hold up. Retain `login_attempts` for 90 days, then aggregate and drop.

---

## 8. Roles and authorisation

```sql
CREATE TABLE account_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        auth_role NOT NULL,
  scope_type  TEXT,        -- NULL = global | 'organization' | 'project' | 'community'
  scope_id    UUID,        -- the org/project/community this role applies within
  granted_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ,
  revoked_at  TIMESTAMPTZ
);
CREATE UNIQUE INDEX account_roles_unique_grant
  ON account_roles (user_id, role, COALESCE(scope_type,''), COALESCE(scope_id,'00000000-0000-0000-0000-000000000000'))
  WHERE revoked_at IS NULL;
CREATE INDEX account_roles_user_active ON account_roles (user_id) WHERE revoked_at IS NULL;
```

Scoped roles are what make `ORGANIZATION` and `STUDIO` work later: a user can be `MODERATOR` inside
one community and a plain `USER` everywhere else. `capabilities` in the API response is computed
from active, unexpired grants — it is a **projection**, and the server re-derives it on every
privileged call rather than trusting the client's copy.

`ADMIN` and `SUPER_ADMIN` are never grantable through any public endpoint.

---

## 9. Security events

```sql
CREATE TABLE security_events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id  UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  event_type  security_event_type NOT NULL,
  ip_hash     BYTEA,
  approx_location TEXT,
  user_agent  TEXT,
  risk_score  SMALLINT,                 -- 0-100, internal only
  metadata    JSONB NOT NULL DEFAULT '{}',
  request_id  UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX security_events_user_time ON security_events (user_id, created_at DESC);
CREATE INDEX security_events_type_time ON security_events (event_type, created_at DESC);
```

`metadata` is a **denylist-enforced** column. A shared serialiser strips `password`, `code`, `otp`,
`token`, `secret`, `authorization`, `cookie` keys at any depth before insert. The same filter wraps
the application logger. Raw IPs, OTPs and tokens never reach this table.

Retention: 13 months hot, then archived to cold storage for regulatory need, then deleted.

---

## 10. Device activation (TV)

```sql
CREATE TABLE device_authorizations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code      TEXT NOT NULL,          -- "ABCD-1234", from an unambiguous 24-char alphabet
  device_code_hash BYTEA NOT NULL,       -- the secret the TV polls with
  client_kind    TEXT NOT NULL,          -- androidtv | appletv | tizen | webos | console
  device_label   TEXT,                   -- "Living room TV"
  approved_by    UUID REFERENCES users(id) ON DELETE CASCADE,
  approved_at    TIMESTAMPTZ,
  session_id     UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  poll_interval_s SMALLINT NOT NULL DEFAULT 5,
  attempts       SMALLINT NOT NULL DEFAULT 0,
  expires_at     TIMESTAMPTZ NOT NULL,   -- created_at + 10 min
  consumed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX device_auth_user_code ON device_authorizations (user_code)
  WHERE consumed_at IS NULL AND expires_at > now();
CREATE UNIQUE INDEX device_auth_device_code ON device_authorizations (device_code_hash);
```

The user code alphabet excludes `0/O`, `1/I/L`, `5/S`, `2/Z` so it is readable across a room and
resistant to transcription errors. Entropy is deliberately low (8 chars), which is why §4.15 rate
limits entry to 5 attempts per 10 minutes per account and the code lives only 10 minutes.

---

## 11. Data lifecycle

| Table | Retention | Purge job |
| --- | --- | --- |
| `email_verifications`, `phone_verifications`, `password_reset_tokens` | delete 24 h after `expires_at` | hourly |
| `device_authorizations` | delete 1 h after `expires_at` | hourly |
| `user_sessions` | delete 30 days after `revoked_at`/expiry | nightly |
| `login_attempts` | 90 days | nightly |
| `security_events` | 13 months hot, archive, then delete | monthly |
| `users` (soft-deleted) | 30-day grace, then PII purge — email/phone/name/avatar nulled, row retained with `status='deleted'` for referential integrity | nightly |

Right-to-erasure requests resolve through the same PII purge path, leaving content-graph foreign
keys intact via the tombstoned `users` row.

---

## 12. Migration ordering

```
0001_extensions            pgcrypto, citext
0002_enums
0003_users_profiles_prefs
0004_credentials
0005_devices_sessions
0006_social_accounts
0007_verification_tokens
0008_login_attempts
0009_account_roles
0010_security_events
0011_device_authorizations
0012_retention_jobs        pg_cron schedules
```

Every migration is forward-only and reversible in the same release window. Indexes on populated
tables are created `CONCURRENTLY` outside the transaction.
