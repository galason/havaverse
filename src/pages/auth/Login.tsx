import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HavaVerseLogo } from '../../components/brand/HavaVerseLogo';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextField } from '../../components/auth/TextField';
import { PasswordField } from '../../components/auth/PasswordField';
import { AuthButton } from '../../components/auth/AuthButton';
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons';
import { Divider } from '../../components/auth/Divider';
import { FormMessage } from '../../components/auth/FormMessage';

export function Login() {
  const { signIn, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const identifierError = touched && !identifier.trim() ? 'Enter your email or username.' : undefined;
  const passwordError =
  touched && password.length > 0 && password.length < 8 ?
  'Password must be at least 8 characters.' :
  undefined;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    setError(null);
    if (!identifier.trim() || password.length < 8) return;

    setLoading(true);
    const result = await signIn(identifier, password);
    setLoading(false);

    if (result.ok) {
      setSuccess(true);
      setTimeout(() => navigate(redirect, { replace: true }), 500);
    } else {
      setError(result.error);
    }
  };

  const useProvider = async (provider: string) => {
    setLoading(true);
    setError(null);
    await signInWithProvider(provider);
    setLoading(false);
    navigate(redirect, { replace: true });
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-6 backdrop-blur sm:p-8">
        <HavaVerseLogo variant="icon" size="md" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-mist-300">
          Sign in to continue to your HavaVerse experience.
        </p>

        {redirect !== '/' &&
        <p className="mt-4 rounded-xl border border-brand-indigo/30 bg-brand-indigo/10 px-3 py-2.5 text-[11px] leading-relaxed text-mist-200">
            Sign in to continue to <span className="font-semibold text-white">{redirect}</span>.
          </p>
        }

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          {error && <FormMessage tone="error">{error}</FormMessage>}
          {success && <FormMessage tone="success">Signed in. Taking you through…</FormMessage>}

          <TextField
            id="login-identifier"
            label="Email or username"
            type="text"
            autoComplete="username"
            placeholder="you@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={identifierError}
            disabled={loading} />
          

          <PasswordField
            id="login-password"
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            disabled={loading}
            trailing={
            <Link
              to="/forgot-password"
              className="text-[11px] font-semibold text-brand-indigo transition-colors duration-150 ease-entrance hover:text-brand-magenta">
              
                Forgot password?
              </Link>
            } />
          

          <AuthButton type="submit" loading={loading} loadingLabel="Signing in…">
            Sign in
          </AuthButton>
        </form>

        <div className="my-6">
          <Divider />
        </div>

        <SocialAuthButtons disabled={loading} onSelect={useProvider} />

        <p className="mt-6 text-center text-xs text-mist-300">
          Don't have a HavaVerse account?{' '}
          <Link
            to="/register"
            className="font-semibold text-brand-indigo transition-colors duration-150 ease-entrance hover:text-brand-magenta">
            
            Create account
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-mist-400">
        Prototype sign-in: any email plus any 8+ character password works.
      </p>
    </AuthLayout>);

}