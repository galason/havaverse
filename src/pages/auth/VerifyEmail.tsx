import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, MailIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthButton } from '../../components/auth/AuthButton';
import { FormMessage } from '../../components/auth/FormMessage';
import { maskEmail } from '../../utils/validation';

const RESEND_SECONDS = 42;

export function VerifyEmail() {
  const { identity, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [seconds, setSeconds] = React.useState(RESEND_SECONDS);
  const [sent, setSent] = React.useState(false);
  const [verified, setVerified] = React.useState(identity?.emailVerified ?? false);

  React.useEffect(() => {
    if (seconds <= 0) return;
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [seconds]);

  React.useEffect(() => {
    if (!verified) return;
    const id = window.setTimeout(() => navigate('/'), 5000);
    return () => window.clearTimeout(id);
  }, [verified, navigate]);

  const clock = `00:${String(Math.max(seconds, 0)).padStart(2, '0')}`;

  if (verified) {
    return (
      <AuthLayout compact>
        <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-8 text-center backdrop-blur">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-cyan/40 bg-brand-cyan/10">
            <CheckIcon className="h-7 w-7 text-brand-cyan" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Email verified</h1>
          <p className="mt-1.5 text-sm text-mist-300">
            Your email has been verified successfully.
          </p>
          <AuthButton className="mt-6" onClick={() => navigate('/')}>
            Continue to HavaVerse
          </AuthButton>
          <p className="mt-3 text-[11px] text-mist-400">You'll be redirected in a few seconds.</p>
        </div>
      </AuthLayout>);

  }

  return (
    <AuthLayout compact>
      <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-8 text-center backdrop-blur">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-indigo/40 bg-brand-indigo/10">
          <MailIcon className="h-7 w-7 text-brand-indigo" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Check your email</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-mist-300">
          We've sent a verification link to{' '}
          <span className="font-semibold text-white">
            {maskEmail(identity?.email ?? 'you@example.com')}
          </span>
          . Open it and click the link to verify your account.
        </p>

        {sent &&
        <div className="mt-4 text-left">
            <FormMessage tone="success">
              Verification email sent again. Check your spam folder if it doesn't arrive.
            </FormMessage>
          </div>
        }

        <div className="mt-6 space-y-2.5">
          <AuthButton
            onClick={() => {
              verifyEmail();
              setVerified(true);
            }}>
            
            Open email
          </AuthButton>
          <AuthButton
            variant="secondary"
            disabled={seconds > 0}
            onClick={() => {
              setSent(true);
              setSeconds(RESEND_SECONDS);
            }}>
            
            Resend email
          </AuthButton>
          <Link
            to="/register"
            className="block rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:border-white/30 hover:text-white">
            
            Change email
          </Link>
        </div>

        <p aria-live="polite" className="mt-4 text-[11px] text-mist-400">
          {seconds > 0 ? `Resend available in ${clock}` : 'You can resend the email now.'}
        </p>

        <p className="mt-4 text-[11px] leading-relaxed text-mist-400">
          Verifying by phone instead?{' '}
          <Link to="/verify-phone" className="font-semibold text-brand-indigo hover:text-brand-magenta">
            Verify your phone number
          </Link>
        </p>
      </div>
    </AuthLayout>);

}