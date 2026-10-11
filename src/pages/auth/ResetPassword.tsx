import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, LockKeyholeIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordField } from '../../components/auth/PasswordField';
import { PasswordStrength } from '../../components/auth/PasswordStrength';
import { AuthButton } from '../../components/auth/AuthButton';
import { FormMessage } from '../../components/auth/FormMessage';
import { passwordStrength } from '../../utils/validation';

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const strong = passwordStrength(password).score >= 60;
  const mismatch = touched && confirm.length > 0 && confirm !== password;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    setError(null);
    if (!strong || confirm !== password) return;
    setLoading(true);
    const result = await resetPassword(password);
    setLoading(false);
    if (result.ok) setDone(true);else
    setError(result.error);
  };

  if (done) {
    return (
      <AuthLayout compact>
        <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-8 text-center backdrop-blur">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-cyan/40 bg-brand-cyan/10">
            <CheckIcon className="h-7 w-7 text-brand-cyan" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Password updated</h1>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            Your HavaVerse password has been updated successfully. Other devices have been signed
            out.
          </p>
          <AuthButton className="mt-6" onClick={() => navigate('/login')}>
            Continue to HavaVerse
          </AuthButton>
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
          Create a new password
        </h1>
        <p className="mt-2 text-center text-sm text-mist-300">Make sure it's strong and secure.</p>

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          {error && <FormMessage tone="error">{error}</FormMessage>}

          <div>
            <PasswordField
              id="reset-password"
              label="New password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading} />
            
            <PasswordStrength password={password} />
          </div>

          <PasswordField
            id="reset-confirm"
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={mismatch ? 'Passwords do not match.' : undefined}
            disabled={loading} />
          

          <AuthButton
            type="submit"
            loading={loading}
            loadingLabel="Updating…"
            disabled={!strong || confirm !== password}>
            
            Reset password
          </AuthButton>
        </form>
      </div>
    </AuthLayout>);

}