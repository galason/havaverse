import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, TvIcon } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthButton } from '../../components/auth/AuthButton';
import { FormMessage } from '../../components/auth/FormMessage';
import { delay } from '../../utils/validation';

/**
 * Device activation. A TV shows a short code; the signed-in identity here
 * claims it and the TV session attaches to the same HavaVerse identity.
 */
export function Activate() {
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [linked, setLinked] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const clean = code.trim().toUpperCase();
    setError(null);
    if (clean.replace('-', '').length < 8) {
      setError('Enter the full 8-character code shown on your TV.');
      return;
    }
    setLoading(true);
    await delay(900);
    setLoading(false);
    setLinked(true);
  };

  return (
    <AuthLayout compact>
      <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-8 text-center backdrop-blur">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-indigo/40 bg-brand-indigo/10">
          {linked ?
          <CheckIcon className="h-7 w-7 text-brand-cyan" aria-hidden="true" /> :

          <TvIcon className="h-7 w-7 text-brand-indigo" aria-hidden="true" />
          }
        </span>

        {linked ?
        <>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">TV connected</h1>
            <p className="mt-2 text-sm leading-relaxed text-mist-300">
              Your TV is now signed in to your HavaVerse identity. You can manage or revoke this
              device from your account settings at any time.
            </p>
            <Link
            to="/"
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand-indigo px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
              Back to HavaVerse
            </Link>
          </> :

        <>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Sign in on your TV</h1>
            <p className="mt-2 text-sm leading-relaxed text-mist-300">
              Open HavaVerse on your TV, go to{' '}
              <span className="font-semibold text-white">havaverse.com/activate</span> and enter the
              code shown there.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {error &&
            <div className="text-left">
                  <FormMessage tone="error">{error}</FormMessage>
                </div>
            }
              <div>
                <label htmlFor="activate-code" className="sr-only">
                  Activation code
                </label>
                <input
                id="activate-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABCD-1234"
                maxLength={9}
                autoComplete="off"
                className="h-14 w-full rounded-xl border border-white/10 bg-ink-850 text-center font-display text-2xl tracking-[0.3em] text-white placeholder:tracking-[0.2em] placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none" />
              
              </div>
              <AuthButton type="submit" loading={loading} loadingLabel="Connecting…">
                Connect TV
              </AuthButton>
            </form>

            <Link
            to="/login"
            className="mt-4 block text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
              Back to sign in
            </Link>
          </>
        }
      </div>
    </AuthLayout>);

}