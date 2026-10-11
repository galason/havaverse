import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HavaVerseLogo } from '../../components/brand/HavaVerseLogo';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextField } from '../../components/auth/TextField';
import { PasswordField } from '../../components/auth/PasswordField';
import { PasswordStrength } from '../../components/auth/PasswordStrength';
import { AuthButton } from '../../components/auth/AuthButton';
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons';
import { Divider } from '../../components/auth/Divider';
import { FormMessage } from '../../components/auth/FormMessage';
import { isEmail, isUsernameTaken, isValidUsername, passwordStrength } from '../../utils/validation';

type UsernameStatus = 'idle' | 'checking' | 'valid' | 'invalid';

export function Register() {
  const { register, signInWithProvider } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [agreed, setAgreed] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = React.useState<UsernameStatus>('idle');

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
  setForm((prev) => ({ ...prev, [key]: e.target.value }));

  React.useEffect(() => {
    const value = form.username.trim();
    if (!value) {
      setUsernameStatus('idle');
      return;
    }
    if (!isValidUsername(value)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    const id = window.setTimeout(() => {
      setUsernameStatus(isUsernameTaken(value) ? 'invalid' : 'valid');
    }, 550);
    return () => window.clearTimeout(id);
  }, [form.username]);

  const usernameLabel =
  usernameStatus === 'checking' ?
  'Checking availability' :
  usernameStatus === 'valid' ?
  'Available' :
  usernameStatus === 'invalid' ?
  isValidUsername(form.username) ?
  'Already taken' :
  '3–20 letters, numbers or _' :
  undefined;

  const emailError =
  touched && form.email && !isEmail(form.email) ? 'Enter a valid email address.' : undefined;
  const confirmError =
  touched && form.confirm && form.confirm !== form.password ? 'Passwords do not match.' : undefined;

  const strong = passwordStrength(form.password).score >= 60;
  const valid =
  form.firstName.trim() &&
  form.lastName.trim() &&
  usernameStatus === 'valid' &&
  isEmail(form.email) &&
  strong &&
  form.confirm === form.password &&
  agreed;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    setError(null);
    if (!valid) return;

    setLoading(true);
    const result = await register(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        email: form.email.trim()
      },
      form.password
    );
    setLoading(false);
    if (result.ok) navigate('/choose-account-type');else
    setError(result.error);
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-6 backdrop-blur sm:p-8">
        <HavaVerseLogo variant="icon" size="md" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Create your HavaVerse account
        </h1>
        <p className="mt-1 text-sm text-mist-300">
          One account for entertainment, creation, communities and more.
        </p>

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          {error && <FormMessage tone="error">{error}</FormMessage>}

          <div className="grid grid-cols-2 gap-3">
            <TextField
              id="reg-first"
              label="First name"
              autoComplete="given-name"
              placeholder="John"
              value={form.firstName}
              onChange={set('firstName')}
              disabled={loading} />
            
            <TextField
              id="reg-last"
              label="Last name"
              autoComplete="family-name"
              placeholder="Doe"
              value={form.lastName}
              onChange={set('lastName')}
              disabled={loading} />
            
          </div>

          <TextField
            id="reg-username"
            label="Username"
            autoComplete="username"
            placeholder="johndoe"
            value={form.username}
            onChange={set('username')}
            status={usernameStatus}
            statusLabel={usernameLabel}
            disabled={loading} />
          

          <TextField
            id="reg-email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            error={emailError}
            disabled={loading} />
          

          <div>
            <PasswordField
              id="reg-password"
              label="Password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              disabled={loading} />
            
            <PasswordStrength password={form.password} />
          </div>

          <PasswordField
            id="reg-confirm"
            label="Confirm password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={set('confirm')}
            error={confirmError}
            disabled={loading} />
          

          <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-mist-300">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-ink-850 text-brand-indigo focus:ring-brand-indigo" />
            
            <span>
              By creating an account, you agree to the HavaVerse{' '}
              <Link to="/browse/terms" className="font-semibold text-mist-100 hover:text-white">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/browse/privacy" className="font-semibold text-mist-100 hover:text-white">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <AuthButton
            type="submit"
            loading={loading}
            loadingLabel="Creating account…"
            disabled={!valid}>
            
            Create account
          </AuthButton>
        </form>

        <div className="my-6">
          <Divider />
        </div>

        <SocialAuthButtons
          disabled={loading}
          onSelect={async (provider) => {
            await signInWithProvider(provider);
            navigate('/choose-account-type');
          }} />
        

        <p className="mt-6 text-center text-xs text-mist-300">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-indigo transition-colors duration-150 ease-entrance hover:text-brand-magenta">
            
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>);

}