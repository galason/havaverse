import React from 'react';
import { authApi } from '../services';
import type {
  AccountType,
  AuthResult,
  HavaIdentity,
  HavaProfile,
  ProfilePrivacy,
  RegistrationDraft } from
'../types/identity';

export type {
  ProfilePrivacy,
  AccountType,
  HavaIdentity,
  HavaProfile,
  HavaSession,
  RegistrationDraft } from
'../types/identity';

interface AuthState {
  identity: HavaIdentity | null;
  isAuthenticated: boolean;
  /** True only while the initial session lookup is in flight. */
  bootstrapping: boolean;
  pending: RegistrationDraft | null;
  signIn: (identifier: string, password: string) => Promise<AuthResult<HavaIdentity>>;
  signInWithProvider: (provider: string) => Promise<AuthResult<HavaIdentity>>;
  register: (draft: RegistrationDraft, password: string) => Promise<AuthResult<HavaIdentity>>;
  setAccountType: (type: AccountType) => void;
  updateProfile: (patch: Partial<HavaProfile>) => void;
  completeProfile: () => void;
  verifyEmail: () => void;
  verifyPhone: (code: string) => Promise<AuthResult<HavaIdentity>>;
  setPhone: (phone: string) => void;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  resetPassword: (password: string) => Promise<AuthResult>;
  revokeSession: (sessionId: string) => void;
  /** Saved by the identity service; the returned identity is the source of truth. */
  updatePrivacy: (patch: Partial<ProfilePrivacy>) => Promise<AuthResult<HavaIdentity>>;
  requestAccountDeletion: (confirmUsername: string, reason?: string) => Promise<AuthResult<HavaIdentity>>;
  cancelAccountDeletion: () => Promise<AuthResult<HavaIdentity>>;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [identity, setIdentity] = React.useState<HavaIdentity | null>(null);
  const [bootstrapping, setBootstrapping] = React.useState(true);
  const [pending, setPending] = React.useState<RegistrationDraft | null>(null);

  // The session lives in an HTTP-only cookie the client cannot read, so the
  // only way to know who is signed in is to ask the server.
  React.useEffect(() => {
    let cancelled = false;
    authApi.session().then((result) => {
      if (cancelled) return;
      if (result.ok) setIdentity(result.data);
      setBootstrapping(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value: AuthState = {
    identity,
    isAuthenticated: Boolean(identity),
    bootstrapping,
    pending,

    signIn: async (identifier, password) => {
      const result = await authApi.signIn(identifier, password);
      if (result.ok) setIdentity(result.data);
      return result;
    },

    signInWithProvider: async (provider) => {
      const result = await authApi.signInWithProvider(provider);
      if (result.ok) setIdentity(result.data);
      return result;
    },

    register: async (draft, password) => {
      const result = await authApi.register(draft, password);
      if (result.ok) {
        setPending(draft);
        setIdentity(result.data);
      }
      return result;
    },

    setAccountType: (type) => {
      setIdentity((prev) => prev ? { ...prev, accountType: type } : prev);
      authApi.setAccountType(type).then((result) => {
        if (result.ok) setIdentity(result.data);
      });
    },

    updateProfile: (patch) => {
      setIdentity((prev) => prev ? { ...prev, profile: { ...prev.profile, ...patch } } : prev);
      authApi.updateProfile(patch).then((result) => {
        if (result.ok) setIdentity(result.data);
      });
    },

    completeProfile: () =>
    setIdentity((prev) => prev ? { ...prev, profileComplete: true } : prev),

    verifyEmail: () => {
      authApi.verifyEmail('token-from-email-link').then((result) => {
        if (result.ok) setIdentity(result.data);
      });
      setIdentity((prev) => prev ? { ...prev, emailVerified: true } : prev);
    },

    verifyPhone: async (code) => {
      const result = await authApi.verifyPhone(code);
      if (result.ok) setIdentity(result.data);
      return result;
    },

    setPhone: (phone) => {
      setIdentity((prev) => prev ? { ...prev, phone } : prev);
      authApi.sendPhoneCode(phone);
    },

    requestPasswordReset: (email) => authApi.requestPasswordReset(email),

    resetPassword: (password) => authApi.resetPassword('token-from-reset-link', password),

    revokeSession: (sessionId) => {
      setIdentity((prev) =>
      prev ? { ...prev, sessions: prev.sessions.filter((s) => s.id !== sessionId) } : prev
      );
      authApi.revokeSession(sessionId);
    },

    updatePrivacy: async (patch) => {
      const result = await authApi.updatePrivacy(patch);
      if (result.ok) setIdentity(result.data);
      return result;
    },

    requestAccountDeletion: async (confirmUsername, reason) => {
      const result = await authApi.requestAccountDeletion(confirmUsername, reason);
      if (result.ok) setIdentity(result.data);
      return result;
    },

    cancelAccountDeletion: async () => {
      const result = await authApi.cancelAccountDeletion();
      if (result.ok) setIdentity(result.data);
      return result;
    },

    signOut: () => {
      setIdentity(null);
      setPending(null);
      authApi.signOut();
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}