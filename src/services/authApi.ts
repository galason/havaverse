import type {
  AccountType,
  AuthErrorCode,
  AuthResult,
  ConnectedAccount,
  DataExportRequest,
  HavaIdentity,
  HavaProfile,
  ProfilePrivacy,
  RegistrationDraft,
  SecurityEvent,
  SignInProvider } from
'../types/identity';

/* ------------------------------------------------------------------------ *
 * HavaVerse Identity — client/server contract
 * ------------------------------------------------------------------------ *
 *
 * Every method below maps to exactly one HTTP endpoint. The browser never
 * holds a token: the server issues an HTTP-only, Secure, SameSite=Lax session
 * cookie and the client simply sends credentials with each request.
 *
 *  POST   /api/auth/register            { firstName,lastName,username,email,password }
 *  POST   /api/auth/login               { identifier, password }
 *  POST   /api/auth/oauth/:provider     { code, redirectUri }          (PKCE)
 *  POST   /api/auth/logout              -
 *  GET    /api/auth/session             -> HavaIdentity | 401
 *  POST   /api/auth/email/resend        -
 *  POST   /api/auth/email/verify        { token }
 *  POST   /api/auth/phone/send          { phone }
 *  POST   /api/auth/phone/verify        { code }
 *  POST   /api/auth/password/forgot     { email }   (always 202, never reveals)
 *  POST   /api/auth/password/reset      { token, password }
 *  PATCH  /api/identity/profile         Partial<HavaProfile>
 *  PATCH  /api/identity/account-type    { accountType }
 *  GET    /api/identity/username/:name  -> { available: boolean }
 *  POST   /api/devices/activate         { code }
 *  DELETE /api/identity/sessions/:id    -                              (revoke)
 *  PATCH  /api/identity/privacy         Partial<ProfilePrivacy>
 *  GET    /api/identity/security-events -> SecurityEvent[]  (newest first, append-only)
 *  GET    /api/identity/connections     -> ConnectedAccount[]
 *  POST   /api/identity/connections/:p  { code, redirectUri }          (PKCE link)
 *  DELETE /api/identity/connections/:p  -   409 last_sign_in_method if it is the only way in
 *  GET    /api/identity/exports         -> DataExportRequest[]
 *  POST   /api/identity/exports         -> DataExportRequest   (1 open request at a time)
 *  POST   /api/identity/deletion        { confirmUsername, reason? } -> HavaIdentity
 *  DELETE /api/identity/deletion        -> HavaIdentity                (cancel in grace period)
 *
 * PRIVACY & ACCOUNT LIFECYCLE (server-side):
 *  - The public profile endpoint filters on `privacy`; the client never
 *    decides what someone else may see.
 *  - Security events are written by the server on every auth/identity
 *    mutation, including failed sign-ins, and are never editable by the user.
 *  - Exports are assembled asynchronously and delivered over a signed link
 *    that expires in 7 days; the archive is never streamed from here.
 *  - Deletion requires a fresh session (re-auth within 10 minutes), starts a
 *    30-day grace period, revokes every other session, and is cancellable
 *    until `scheduledFor`. Purchases and payouts are retained unlinked for the
 *    statutory period.
 *
 * SERVER-SIDE REQUIREMENTS (cannot be enforced from this codebase):
 *  - Hash passwords with Argon2id (m=64MB, t=3, p=4) or bcrypt cost >= 12.
 *    Never store, log or return a raw password.
 *  - Session cookie: HttpOnly, Secure, SameSite=Lax, __Host- prefix, rotate
 *    the session id on every privilege change (login, password reset, 2FA).
 *  - CSRF: double-submit cookie. Server sets a readable `csrf_token` cookie;
 *    this client mirrors it into the X-CSRF-Token header on every mutation
 *    (see `csrfHeader` below) and the server compares the two.
 *  - Rate limiting: per-IP and per-account. Login 5 attempts / 15 min,
 *    OTP 5 attempts / code, password reset 3 / hour. Respond 429 with
 *    Retry-After; never leak whether the account exists.
 *  - Tokens: email verification and password reset tokens are single-use,
 *    stored hashed, and expire in 15 minutes. OTP codes expire in 10 minutes.
 *  - Enumeration: /password/forgot and /login return identical shapes and
 *    timings regardless of whether the account exists.
 *  - Re-validate everything server-side. The validation in utils/validation.ts
 *    is for feedback only and is not a security control.
 * ------------------------------------------------------------------------ */

export interface AuthApi {
  session(): Promise<AuthResult<HavaIdentity | null>>;
  signIn(identifier: string, password: string): Promise<AuthResult<HavaIdentity>>;
  signInWithProvider(provider: string): Promise<AuthResult<HavaIdentity>>;
  register(draft: RegistrationDraft, password: string): Promise<AuthResult<HavaIdentity>>;
  signOut(): Promise<AuthResult>;
  checkUsername(username: string): Promise<AuthResult<{available: boolean;}>>;
  resendEmailVerification(): Promise<AuthResult>;
  verifyEmail(token: string): Promise<AuthResult<HavaIdentity>>;
  sendPhoneCode(phone: string): Promise<AuthResult>;
  verifyPhone(code: string): Promise<AuthResult<HavaIdentity>>;
  requestPasswordReset(email: string): Promise<AuthResult>;
  resetPassword(token: string, password: string): Promise<AuthResult>;
  updateProfile(patch: Partial<HavaProfile>): Promise<AuthResult<HavaIdentity>>;
  setAccountType(accountType: AccountType): Promise<AuthResult<HavaIdentity>>;
  activateDevice(code: string): Promise<AuthResult>;
  revokeSession(sessionId: string): Promise<AuthResult>;
  updatePrivacy(patch: Partial<ProfilePrivacy>): Promise<AuthResult<HavaIdentity>>;
  listSecurityEvents(): Promise<AuthResult<SecurityEvent[]>>;
  listConnectedAccounts(): Promise<AuthResult<ConnectedAccount[]>>;
  linkProvider(provider: SignInProvider): Promise<AuthResult<ConnectedAccount[]>>;
  unlinkProvider(provider: SignInProvider): Promise<AuthResult<ConnectedAccount[]>>;
  listDataExports(): Promise<AuthResult<DataExportRequest[]>>;
  requestDataExport(): Promise<AuthResult<DataExportRequest>>;
  requestAccountDeletion(confirmUsername: string, reason?: string): Promise<AuthResult<HavaIdentity>>;
  cancelAccountDeletion(): Promise<AuthResult<HavaIdentity>>;
}

const API_BASE = '/api';

const readCookie = (name: string) =>
document.cookie.
split('; ').
find((row) => row.startsWith(`${name}=`))?.
split('=')[1];

const csrfHeader = (): Record<string, string> => {
  const token = readCookie('csrf_token');
  return token ? { 'X-CSRF-Token': decodeURIComponent(token) } : {};
};

const messageFor = (code: AuthErrorCode): string => {
  switch (code) {
    case 'invalid_credentials':
      return "We couldn't sign you in with those details. Check your information and try again.";
    case 'rate_limited':
      return 'Too many attempts. Try again in a few minutes.';
    case 'invalid_code':
      return 'That code is not correct. Try again.';
    case 'expired_code':
      return 'That code has expired. Request a new one.';
    case 'weak_password':
      return 'Choose a stronger password.';
    case 'username_taken':
      return 'That username is already taken.';
    case 'validation_failed':
      return 'Check the highlighted fields and try again.';
    case 'last_sign_in_method':
      return 'This is your only way to sign in. Add another method before removing it.';
    case 'confirmation_mismatch':
      return 'That does not match your username. Type it exactly to confirm.';
    case 'network_error':
      return 'Something went wrong. Check your connection and try again.';
    default:
      return 'Something went wrong on our side. Please try again.';
  }
};

const fail = (code: AuthErrorCode, retryAfterSeconds?: number) => (
{ ok: false as const, code, error: messageFor(code), retryAfterSeconds });

async function request<T>(
path: string,
init: RequestInit = {})
: Promise<AuthResult<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      // The session cookie is HttpOnly, so the browser attaches it for us.
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeader(),
        ...(init.headers ?? {})
      },
      ...init
    });

    if (response.status === 204) return { ok: true, data: null as T };

    if (response.status === 429) {
      const retry = Number(response.headers.get('Retry-After') ?? 0);
      return fail('rate_limited', Number.isFinite(retry) ? retry : undefined);
    }

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const code = body?.code as AuthErrorCode ?? 'server_error';
      return fail(code);
    }

    return { ok: true, data: body as T };
  } catch {
    return fail('network_error');
  }
}

/** Talks to a real HavaVerse identity service over HTTP. */
export const httpAuthApi: AuthApi = {
  session: () => request<HavaIdentity | null>('/auth/session'),

  signIn: (identifier, password) =>
  request<HavaIdentity>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  }),

  signInWithProvider: (provider) =>
  request<HavaIdentity>(`/auth/oauth/${provider.toLowerCase()}`, { method: 'POST' }),

  register: (draft, password) =>
  request<HavaIdentity>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...draft, password })
  }),

  signOut: () => request('/auth/logout', { method: 'POST' }),

  checkUsername: (username) =>
  request<{available: boolean;}>(`/identity/username/${encodeURIComponent(username)}`),

  resendEmailVerification: () => request('/auth/email/resend', { method: 'POST' }),

  verifyEmail: (token) =>
  request<HavaIdentity>('/auth/email/verify', {
    method: 'POST',
    body: JSON.stringify({ token })
  }),

  sendPhoneCode: (phone) =>
  request('/auth/phone/send', { method: 'POST', body: JSON.stringify({ phone }) }),

  verifyPhone: (code) =>
  request<HavaIdentity>('/auth/phone/verify', {
    method: 'POST',
    body: JSON.stringify({ code })
  }),

  requestPasswordReset: (email) =>
  request('/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token, password) =>
  request('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ token, password })
  }),

  updateProfile: (patch) =>
  request<HavaIdentity>('/identity/profile', {
    method: 'PATCH',
    body: JSON.stringify(patch)
  }),

  setAccountType: (accountType) =>
  request<HavaIdentity>('/identity/account-type', {
    method: 'PATCH',
    body: JSON.stringify({ accountType })
  }),

  activateDevice: (code) =>
  request('/devices/activate', { method: 'POST', body: JSON.stringify({ code }) }),

  revokeSession: (sessionId) =>
  request(`/identity/sessions/${sessionId}`, { method: 'DELETE' }),

  updatePrivacy: (patch) =>
  request<HavaIdentity>('/identity/privacy', { method: 'PATCH', body: JSON.stringify(patch) }),

  listSecurityEvents: () => request<SecurityEvent[]>('/identity/security-events'),

  listConnectedAccounts: () => request<ConnectedAccount[]>('/identity/connections'),

  linkProvider: (provider) =>
  request<ConnectedAccount[]>(`/identity/connections/${provider.toLowerCase()}`, {
    method: 'POST'
  }),

  unlinkProvider: (provider) =>
  request<ConnectedAccount[]>(`/identity/connections/${provider.toLowerCase()}`, {
    method: 'DELETE'
  }),

  listDataExports: () => request<DataExportRequest[]>('/identity/exports'),

  requestDataExport: () => request<DataExportRequest>('/identity/exports', { method: 'POST' }),

  requestAccountDeletion: (confirmUsername, reason) =>
  request<HavaIdentity>('/identity/deletion', {
    method: 'POST',
    body: JSON.stringify({ confirmUsername, reason })
  }),

  cancelAccountDeletion: () => request<HavaIdentity>('/identity/deletion', { method: 'DELETE' })
};

export { messageFor, fail };