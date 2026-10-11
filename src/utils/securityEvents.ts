import type { SecurityEventKind } from '../types/identity';

export type SecurityTone = 'neutral' | 'good' | 'warn';

export const securityEventMeta: Record<SecurityEventKind, {label: string;tone: SecurityTone;}> = {
  sign_in: { label: 'Signed in', tone: 'neutral' },
  sign_in_failed: { label: 'Failed sign-in attempt', tone: 'warn' },
  sign_in_locked: { label: 'Sign-in temporarily locked', tone: 'warn' },
  sign_out: { label: 'Signed out', tone: 'neutral' },
  registered: { label: 'Account created', tone: 'good' },
  email_verified: { label: 'Email verified', tone: 'good' },
  phone_verified: { label: 'Phone verified', tone: 'good' },
  password_changed: { label: 'Password changed', tone: 'warn' },
  profile_updated: { label: 'Profile updated', tone: 'neutral' },
  privacy_changed: { label: 'Privacy changed', tone: 'neutral' },
  account_type_changed: { label: 'Account type changed', tone: 'neutral' },
  session_revoked: { label: 'Session ended', tone: 'neutral' },
  device_activated: { label: 'TV or device activated', tone: 'neutral' },
  provider_linked: { label: 'Sign-in method added', tone: 'good' },
  provider_unlinked: { label: 'Sign-in method removed', tone: 'warn' },
  export_requested: { label: 'Data export requested', tone: 'neutral' },
  deletion_scheduled: { label: 'Account deletion scheduled', tone: 'warn' },
  deletion_cancelled: { label: 'Account deletion cancelled', tone: 'good' }
};

/** Kinds worth a second look when you didn't do them yourself. */
export const reviewable = new Set<SecurityEventKind>([
'sign_in_failed',
'sign_in_locked',
'password_changed',
'provider_unlinked',
'deletion_scheduled']
);