export type AccountType = 'viewer' | 'creator' | 'both';

export interface HavaProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string;
  bio: string;
  country: string;
  language: string;
  dateOfBirth: string;
  interests: string[];
}

/** Who can open this person's public profile at all. Server-enforced. */
export type ProfileVisibility = 'public' | 'followers' | 'private';

/**
 * Identity-level privacy — what the identity service reveals about you to
 * other people. Audience rules for following, messaging, mentions and
 * activity stay in the Settings registry (social.*); these are the fields the
 * profile endpoint itself filters on.
 */
export interface ProfilePrivacy {
  visibility: ProfileVisibility;
  /** Can someone who already knows your email find you by it. */
  discoverableByEmail: boolean;
  discoverableByPhone: boolean;
  showCommunities: boolean;
  showCreations: boolean;
}

export const defaultPrivacy: ProfilePrivacy = {
  visibility: 'public',
  discoverableByEmail: false,
  discoverableByPhone: false,
  showCommunities: true,
  showCreations: true
};

export interface AccountDeletion {
  requestedAt: number;
  /** Grace period end. The server purges after this unless cancelled. */
  scheduledFor: number;
}

export type SecurityEventKind =
'sign_in' |
'sign_in_failed' |
'sign_in_locked' |
'sign_out' |
'registered' |
'email_verified' |
'phone_verified' |
'password_changed' |
'profile_updated' |
'privacy_changed' |
'account_type_changed' |
'session_revoked' |
'device_activated' |
'provider_linked' |
'provider_unlinked' |
'export_requested' |
'deletion_scheduled' |
'deletion_cancelled';

/** Append-only record of what happened to this identity. Written by the server. */
export interface SecurityEvent {
  id: string;
  kind: SecurityEventKind;
  at: number;
  device: string;
  location: string;
  detail?: string;
}

export type SignInProvider = 'Google' | 'Apple' | 'Microsoft';

export interface ConnectedAccount {
  provider: SignInProvider;
  linked: boolean;
  /** The provider's account address, as the provider reported it. */
  address?: string;
  linkedAt?: number;
}

export type ExportStatus = 'processing' | 'ready' | 'expired';

export interface DataExportRequest {
  id: string;
  requestedAt: number;
  status: ExportStatus;
  /** Set by the server once the archive is assembled. */
  readyAt?: number;
  expiresAt?: number;
}

export interface HavaSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

/**
 * One HavaVerse identity spans every module. Consumer, creator, community,
 * AI and HavaPay profiles hang off this single record rather than separate
 * accounts, which is what lets a viewer become a creator without
 * re-registering.
 *
 * NOTE: this is the *public* shape the server is allowed to return. Password
 * hashes, session secrets, reset tokens and provider refresh tokens must never
 * appear on this object.
 */
export interface HavaIdentity {
  id: string;
  email: string;
  phone: string;
  username: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountType: AccountType;
  profileComplete: boolean;
  profile: HavaProfile;
  capabilities: string[];
  sessions: HavaSession[];
  privacy: ProfilePrivacy;
  /** Present while an account deletion is scheduled and still cancellable. */
  deletion: AccountDeletion | null;
}

export interface RegistrationDraft {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

/**
 * Error codes are deliberately coarse. The server must not distinguish
 * "no such account" from "wrong password", and must not confirm whether an
 * email address is registered.
 */
export type AuthErrorCode =
'invalid_credentials' |
'rate_limited' |
'invalid_code' |
'expired_code' |
'weak_password' |
'username_taken' |
'validation_failed' |
'last_sign_in_method' |
'confirmation_mismatch' |
'network_error' |
'server_error';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  retryAfterSeconds?: number;
}

export type AuthResult<T = null> =
{ok: true;data: T;} |
{ok: false;error: string;code: AuthErrorCode;retryAfterSeconds?: number;};

export const capabilitiesFor = (type: AccountType): string[] => {
  const base = ['watch', 'comment', 'follow', 'purchase', 'wallet'];
  const creator = ['create', 'publish', 'monetize', 'manage_community', 'rights:limited'];
  return type === 'viewer' ? base : [...base, ...creator];
};