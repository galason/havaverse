import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, SmartphoneIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { OTPInput } from '../../components/auth/OTPInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { FormMessage } from '../../components/auth/FormMessage';

const RESEND_SECONDS = 58;
const MAX_ATTEMPTS = 5;

export function VerifyPhone() {
  const { identity, verifyPhone } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = React.useState('');
  const [seconds, setSeconds] = React.useState(RESEND_SECONDS);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [attempts, setAttempts] = React.useState(0);
  const [verified, setVerified] = React.useState(false);

  React.useEffect(() => {
    if (seconds <= 0) return;
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [seconds]);

  const locked = attempts >= MAX_ATTEMPTS;
  const clock = `00:${String(Math.max(seconds, 0)).padStart(2, '0')}`;

  const check = async (value: string) => {
    if (locked) return;
    setLoading(true);
    setError(null);
    const result = await verifyPhone(value);
    setLoading(false);
    if (result.ok) {
      setVerified(true);
    } else {
      setAttempts((a) => a + 1);
      setError(result.error);
    }
  };

  if (verified) {
    return (
      <AuthLayout compact>
        <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-8 text-center backdrop-blur">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-cyan/40 bg-brand-cyan/10">
            <CheckIcon className="h-7 w-7 text-brand-cyan" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Phone verified</h1>
          <p className="mt-1.5 text-sm text-mist-300">
            Your number is now linked to your HavaVerse identity.
          </p>
          <AuthButton className="mt-6" onClick={() => navigate('/')}>
            Continue to HavaVerse
          </AuthButton>
        </div>
      </AuthLayout>);

  }

  return (
    <AuthLayout compact>
      <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-8 text-center backdrop-blur">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-indigo/40 bg-brand-indigo/10">
          <SmartphoneIcon className="h-7 w-7 text-brand-indigo" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
          Verify your phone number
        </h1>
        <p className="mt-1.5 text-sm text-mist-300">
          We've sent a 6-digit code to{' '}
          <span className="font-semibold text-white">
            {identity?.phone || '+234 801 234 5678'}
          </span>
        </p>

        <div className="mt-6">
          <OTPInput
            value={code}
            onChange={(v) => {
              setCode(v);
              setError(null);
            }}
            onComplete={check}
            invalid={Boolean(error)}
            disabled={loading || locked} />
          
        </div>

        {error &&
        <div className="mt-4 text-left">
            <FormMessage tone="error">{error}</FormMessage>
          </div>
        }
        {locked &&
        <div className="mt-3 text-left">
            <FormMessage tone="error">
              Too many attempts. For your security, try again in 15 minutes.
            </FormMessage>
          </div>
        }

        <p aria-live="polite" className="mt-4 text-[11px] text-mist-400">
          {seconds > 0 ? `Resend code in ${clock}` : 'You can request a new code now.'}
        </p>

        <div className="mt-5 space-y-2.5">
          <AuthButton
            loading={loading}
            loadingLabel="Verifying…"
            disabled={code.length !== 6 || locked}
            onClick={() => check(code)}>
            
            Verify
          </AuthButton>
          <button
            type="button"
            disabled={seconds > 0}
            onClick={() => {
              setSeconds(RESEND_SECONDS);
              setAttempts(0);
              setError(null);
            }}
            className="w-full text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white disabled:opacity-40">
            
            Resend code
          </button>
          <Link
            to="/complete-profile"
            className="block text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
            Change phone number
          </Link>
        </div>

        <p className="mt-5 text-[11px] text-mist-400">Prototype code: 123456</p>
      </div>
    </AuthLayout>);

}