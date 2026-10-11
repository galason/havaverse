import React from 'react';
import { Link } from 'react-router-dom';
import { LockKeyholeIcon, MailIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextField } from '../../components/auth/TextField';
import { AuthButton } from '../../components/auth/AuthButton';
import { FormMessage } from '../../components/auth/FormMessage';
import { isEmail } from '../../utils/validation';

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const emailError = touched && !isEmail(email) ? 'Enter a valid email address.' : undefined;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    setError(null);
    if (!isEmail(email)) return;
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (result.ok) setSent(true);else
    setError('Something went wrong. Check your connection and try again.');
  };

  if (sent) {
    return (
      <AuthLayout compact>
        <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-8 text-center backdrop-blur">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-indigo/40 bg-brand-indigo/10">
            <MailIcon className="h-7 w-7 text-brand-indigo" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            If an account exists for this email address, you'll receive instructions to reset your
            password.
          </p>
          <Link
            to="/reset-password"
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand-indigo px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
            Open reset link
          </Link>
          <Link
            to="/login"
            className="mt-3 block text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
            Back to sign in
          </Link>
        </div>
      </AuthLayout>);

  }

  return (
    <AuthLayout compact>
      <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-8 backdrop-blur">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-indigo/40 bg-brand-indigo/10">
          <LockKeyholeIcon className="h-7 w-7 text-brand-indigo" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-white">
          Forgot your password?
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-mist-300">
          Enter the email address associated with your HavaVerse account and we'll send you a
          password reset link.
        </p>

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          {error && <FormMessage tone="offline">{error}</FormMessage>}
          <TextField
            id="forgot-email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            disabled={loading} />
          
          <AuthButton type="submit" loading={loading} loadingLabel="Sending…">
            Send reset link
          </AuthButton>
        </form>

        <Link
          to="/login"
          className="mt-4 block text-center text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
          
          Back to sign in
        </Link>
      </div>
    </AuthLayout>);

}