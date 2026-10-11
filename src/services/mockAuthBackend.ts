import type { AuthApi } from './authApi';
import { fail } from './authApi';
import { IMAGES } from '../data/catalog';
import {
  capabilitiesFor,
  defaultPrivacy,
  type AuthResult,
  type ConnectedAccount,
  type DataExportRequest,
  type HavaIdentity,
  type SecurityEvent,
  type SecurityEventKind,
  type SignInProvider } from
'../types/identity';
import { delay, isUsernameTaken, passwordStrength } from '../utils/validation';
import { deviceLabel, readJSON, writeJSON } from '../utils/storage';
import { reviewable, securityEventMeta } from '../utils/securityEvents';
import { notificationBus } from './notificationBus';

/**
 * In-browser stand-in for the identity service so the prototype runs without
 * a server. It mirrors the *observable behaviour* of the real endpoints —
 * attempt lockouts, code expiry, enumeration-safe responses, latency, the
 * append-only security log, the deletion grace period — but it is NOT a
 * security boundary. Swap `authApi` in services/index.ts to `httpAuthApi` the
 * moment a real backend exists.
 *
 * State persists on this device (localStorage) so a profile edit, a privacy
 * change or a scheduled deletion survives a reload, the way the server would
 * keep it. It does not follow you to another device.
 */

const OTP_TTL_MS = 10 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_OTP_ATTEMPTS = 5;
const DELETION_GRACE_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_EVENTS = 60;
const DAY = 24 * 60 * 60 * 1000;

const KEYS = {
  identity: 'hv.identity.current',
  events: 'hv.identity.securityEvents',
  connections: 'hv.identity.connections',
  exports: 'hv.identity.exports'
} as const;

const demoIdentity: HavaIdentity = {
  id: 'usr_daniel',
  email: 'daniel@havaverse.com',
  phone: '+234 801 234 5678',
  username: 'danielokafor',
  emailVerified: true,
  phoneVerified: true,
  accountType: 'both',
  profileComplete: true,
  profile: {
    firstName: 'Daniel',
    lastName: 'Okafor',
    displayName: 'Daniel Okafor',
    avatar: IMAGES.creator,
    bio: 'Watching everything, making a few things.',
    country: 'Nigeria',
    language: 'English',
    dateOfBirth: '1994-04-12',
    interests: ['Movies', 'Sports', 'Music']
  },
  capabilities: capabilitiesFor('both'),
  sessions: [
  {
    id: 's1',
    device: 'Chrome · MacBook Pro',
    location: 'Lagos, Nigeria',
    lastActive: 'Active now',
    current: true
  },
  {
    id: 's2',
    device: 'HavaVerse on Android TV',
    location: 'Lagos, Nigeria',
    lastActive: '2 days ago',
    current: false
  }],

  privacy: { ...defaultPrivacy },
  deletion: null
};

const seedEvents: SecurityEvent[] = [
{
  id: 'se-seed-3',
  kind: 'sign_in',
  at: Date.now() - 2 * 60 * 60 * 1000,
  device: 'Chrome · MacBook Pro',
  location: 'Lagos, Nigeria'
},
{
  id: 'se-seed-2',
  kind: 'sign_in_failed',
  at: Date.now() - 26 * 60 * 60 * 1000,
  device: 'Safari · iPhone',
  location: 'Abuja, Nigeria',
  detail: 'Wrong password'
},
{
  id: 'se-seed-1',
  kind: 'device_activated',
  at: Date.now() - 2 * DAY,
  device: 'HavaVerse on Android TV',
  location: 'Lagos, Nigeria'
}];


const seedConnections: ConnectedAccount[] = [
{ provider: 'Google', linked: true, address: 'daniel.okafor@gmail.com', linkedAt: Date.now() - 90 * DAY },
{ provider: 'Apple', linked: false },
{ provider: 'Microsoft', linked: false }];


/* -------------------------------------------------------------- persistence */

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isIdentityOrNull = (v: unknown): v is HavaIdentity | null =>
v === null || isObject(v) && typeof v.id === 'string' && isObject(v.profile);
const isArray = <T,>(v: unknown): v is T[] => Array.isArray(v);

/** Older stored identities predate privacy/deletion — fill them in. */
function normalise(identity: HavaIdentity | null): HavaIdentity | null {
  if (!identity) return null;
  return {
    ...identity,
    privacy: { ...defaultPrivacy, ...(identity.privacy ?? {}) },
    deletion: identity.deletion ?? null
  };
}

const state = {
  current: normalise(readJSON<HavaIdentity | null>(KEYS.identity, demoIdentity, isIdentityOrNull)),
  events: readJSON<SecurityEvent[]>(KEYS.events, seedEvents, isArray),
  connections: readJSON<ConnectedAccount[]>(KEYS.connections, seedConnections, isArray),
  exports: readJSON<DataExportRequest[]>(KEYS.exports, [], isArray),
  loginAttempts: [] as number[],
  otpAttempts: 0,
  otpIssuedAt: Date.now()
};

const save = () => writeJSON(KEYS.identity, state.current);

const ok = <T,>(data: T): AuthResult<T> => ({ ok: true, data });

function record(kind: SecurityEventKind, detail?: string) {
  state.events = [
  {
    id: `se-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    at: Date.now(),
    device: deviceLabel(),
    // A real server resolves this from the request IP; the browser cannot.
    location: 'This device',
    detail
  },
  ...state.events].
  slice(0, MAX_EVENTS);
  writeJSON(KEYS.events, state.events);
  // The identity service alerts on anything worth a second look.
  if (reviewable.has(kind)) {
    notificationBus.deliver({
      kind: 'security',
      title: securityEventMeta[kind].label,
      body: `${deviceLabel()}${detail ? ` · ${detail}` : ''}. If this wasn't you, review your security settings.`,
      to: '/settings/security'
    });
  }
}

const recordAttempt = () => {
  const now = Date.now();
  state.loginAttempts = state.loginAttempts.filter((t) => now - t < LOGIN_WINDOW_MS);
  state.loginAttempts.push(now);
  return state.loginAttempts.length;
};

const set = (identity: HavaIdentity | null): HavaIdentity | null => {
  state.current = normalise(identity);
  save();
  return state.current;
};

const patch = (changes: Partial<HavaIdentity>): HavaIdentity =>
set({ ...(state.current as HavaIdentity), ...changes }) as HavaIdentity;

const signedOut = () => fail('invalid_credentials');

/* ---------------------------------------------------------------------- api */

export const mockAuthApi: AuthApi = {
  async session() {
    await delay(200);
    return ok(state.current);
  },

  async signIn(identifier, password) {
    await delay(900);
    if (state.loginAttempts.length >= MAX_LOGIN_ATTEMPTS) {
      record('sign_in_locked', 'Too many attempts — locked for 15 minutes');
      return fail('rate_limited', 900);
    }
    // A real server compares an Argon2id hash here. Identical response and
    // timing whether the account is missing or the password is wrong.
    if (!identifier.trim() || password.length < 8) {
      recordAttempt();
      record('sign_in_failed', 'Wrong password');
      return fail('invalid_credentials');
    }
    state.loginAttempts = [];
    // A returning user keeps whatever they had saved (privacy, pending deletion).
    const stored = readJSON<HavaIdentity | null>(KEYS.identity, null, isIdentityOrNull);
    const identity = stored ?? { ...demoIdentity };
    record('sign_in', 'Password');
    return ok(set(identity) as HavaIdentity);
  },

  async signInWithProvider(provider) {
    await delay(800);
    record('sign_in', provider);
    return ok(set({ ...demoIdentity, id: `usr_${provider.toLowerCase()}` }) as HavaIdentity);
  },

  async register(draft, password) {
    await delay(1000);
    if (passwordStrength(password).score < 60) return fail('weak_password');
    if (isUsernameTaken(draft.username)) return fail('username_taken');

    const identity = set({
      id: `usr_${Date.now()}`,
      email: draft.email,
      phone: '',
      username: draft.username,
      emailVerified: false,
      phoneVerified: false,
      accountType: 'viewer',
      profileComplete: false,
      profile: {
        firstName: draft.firstName,
        lastName: draft.lastName,
        displayName: `${draft.firstName} ${draft.lastName}`.trim(),
        avatar: '',
        bio: '',
        country: '',
        language: 'English',
        dateOfBirth: '',
        interests: []
      },
      capabilities: capabilitiesFor('viewer'),
      sessions: [
      {
        id: 's1',
        device: 'This browser',
        location: 'Current location',
        lastActive: 'Active now',
        current: true
      }],

      privacy: { ...defaultPrivacy },
      deletion: null
    }) as HavaIdentity;
    // A new identity starts with its own empty history.
    state.events = [];
    state.connections = seedConnections.map((c) => ({ provider: c.provider, linked: false }));
    state.exports = [];
    writeJSON(KEYS.connections, state.connections);
    writeJSON(KEYS.exports, state.exports);
    record('registered');
    return ok(identity);
  },

  async signOut() {
    await delay(200);
    if (state.current) record('sign_out');
    set(null);
    return ok(null);
  },

  async checkUsername(username) {
    await delay(450);
    return ok({ available: !isUsernameTaken(username) });
  },

  async resendEmailVerification() {
    await delay(600);
    return ok(null);
  },

  async verifyEmail() {
    await delay(500);
    if (!state.current) return signedOut();
    record('email_verified');
    return ok(patch({ emailVerified: true }));
  },

  async sendPhoneCode(phone) {
    await delay(600);
    state.otpAttempts = 0;
    state.otpIssuedAt = Date.now();
    if (state.current) patch({ phone, phoneVerified: false });
    return ok(null);
  },

  async verifyPhone(code) {
    await delay(700);
    if (!state.current) return signedOut();
    if (state.otpAttempts >= MAX_OTP_ATTEMPTS) return fail('rate_limited', 900);
    if (Date.now() - state.otpIssuedAt > OTP_TTL_MS) return fail('expired_code');
    if (code !== '123456') {
      state.otpAttempts += 1;
      return fail('invalid_code');
    }
    state.otpAttempts = 0;
    record('phone_verified');
    return ok(patch({ phoneVerified: true }));
  },

  async requestPasswordReset() {
    // Always succeeds. Never reveals whether the address is registered.
    await delay(900);
    return ok(null);
  },

  async resetPassword(_token, password) {
    await delay(900);
    if (passwordStrength(password).score < 60) return fail('weak_password');
    // A real server invalidates the single-use token and revokes sibling
    // sessions here.
    record('password_changed', 'Reset by email link · other sessions signed out');
    if (state.current) patch({ sessions: state.current.sessions.filter((s) => s.current) });
    return ok(null);
  },

  async updateProfile(profilePatch) {
    await delay(400);
    if (!state.current) return signedOut();
    const fields = Object.keys(profilePatch).join(', ');
    record('profile_updated', fields ? `Changed ${fields}` : undefined);
    return ok(patch({ profile: { ...state.current.profile, ...profilePatch } }));
  },

  async setAccountType(accountType) {
    await delay(300);
    if (!state.current) return signedOut();
    record('account_type_changed', `Now ${accountType === 'both' ? 'viewer and creator' : accountType}`);
    return ok(patch({ accountType, capabilities: capabilitiesFor(accountType) }));
  },

  async activateDevice(code) {
    await delay(900);
    if (code.replace('-', '').length < 8) return fail('invalid_code');
    record('device_activated');
    return ok(null);
  },

  async revokeSession(sessionId) {
    await delay(400);
    const current = state.current;
    if (current) {
      const target = current.sessions.find((s) => s.id === sessionId);
      patch({ sessions: current.sessions.filter((s) => s.id !== sessionId) });
      if (target) record('session_revoked', target.device);
    }
    return ok(null);
  },

  async updatePrivacy(privacyPatch) {
    await delay(350);
    if (!state.current) return signedOut();
    const labels: Record<string, string> = {
      visibility: 'profile visibility',
      discoverableByEmail: 'find by email',
      discoverableByPhone: 'find by phone',
      showCommunities: 'communities on profile',
      showCreations: 'creations on profile'
    };
    record(
      'privacy_changed',
      Object.keys(privacyPatch).
      map((k) => labels[k] ?? k).
      join(', ')
    );
    return ok(patch({ privacy: { ...state.current.privacy, ...privacyPatch } }));
  },

  async listSecurityEvents() {
    await delay(250);
    if (!state.current) return signedOut();
    return ok([...state.events].sort((a, b) => b.at - a.at));
  },

  async listConnectedAccounts() {
    await delay(250);
    if (!state.current) return signedOut();
    return ok(state.connections.map((c) => ({ ...c })));
  },

  async linkProvider(provider: SignInProvider) {
    await delay(900);
    if (!state.current) return signedOut();
    // The real flow redirects to the provider (PKCE) and the server stores the
    // provider's subject id; the address shown is whatever the provider returns.
    state.connections = state.connections.map((c) =>
    c.provider === provider ?
    { provider, linked: true, address: state.current?.email, linkedAt: Date.now() } :
    c
    );
    writeJSON(KEYS.connections, state.connections);
    record('provider_linked', provider);
    return ok(state.connections.map((c) => ({ ...c })));
  },

  async unlinkProvider(provider: SignInProvider) {
    await delay(600);
    if (!state.current) return signedOut();
    // The demo account has a password, so a provider is never the only way in.
    // A provider-only account (no password) would get 409 last_sign_in_method
    // when removing its last linked provider.
    const hasPassword = true;
    const others = state.connections.filter((c) => c.linked && c.provider !== provider).length;
    if (!hasPassword && others === 0) return fail('last_sign_in_method');
    state.connections = state.connections.map((c) =>
    c.provider === provider ? { provider, linked: false } : c
    );
    writeJSON(KEYS.connections, state.connections);
    record('provider_unlinked', provider);
    return ok(state.connections.map((c) => ({ ...c })));
  },

  async listDataExports() {
    await delay(250);
    if (!state.current) return signedOut();
    return ok([...state.exports].sort((a, b) => b.requestedAt - a.requestedAt));
  },

  async requestDataExport() {
    await delay(700);
    if (!state.current) return signedOut();
    // One open request at a time — asking again returns the one in progress.
    const open = state.exports.find((e) => e.status === 'processing');
    if (open) return ok(open);
    // The archive is assembled by the identity service and delivered over a
    // signed link. Nothing is generated in this browser, so the request stays
    // "processing" here until a real server marks it ready.
    const request: DataExportRequest = {
      id: `exp-${Date.now()}`,
      requestedAt: Date.now(),
      status: 'processing'
    };
    state.exports = [request, ...state.exports];
    writeJSON(KEYS.exports, state.exports);
    record('export_requested');
    return ok(request);
  },

  async requestAccountDeletion(confirmUsername, reason) {
    await delay(900);
    if (!state.current) return signedOut();
    if (confirmUsername.trim().replace(/^@/, '') !== state.current.username) {
      return fail('confirmation_mismatch');
    }
    const now = Date.now();
    record('deletion_scheduled', reason ? `Reason: ${reason}` : undefined);
    // Deleting revokes every other session straight away.
    return ok(
      patch({
        deletion: { requestedAt: now, scheduledFor: now + DELETION_GRACE_MS },
        sessions: state.current.sessions.filter((s) => s.current)
      })
    );
  },

  async cancelAccountDeletion() {
    await delay(500);
    if (!state.current) return signedOut();
    if (!state.current.deletion) return ok(state.current);
    record('deletion_cancelled');
    return ok(patch({ deletion: null }));
  }
};