import React from 'react';
import { KeyRoundIcon, LinkIcon } from 'lucide-react';
import { authApi } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { formatDay } from '../../utils/time';
import type { ConnectedAccount, SignInProvider } from '../../types/identity';

/**
 * Every way into this one identity. Linking a provider adds a door; it never
 * creates a second account.
 */
export function SignInMethodsPanel({ onToast }: {onToast: (m: string) => void;}) {
  const { identity } = useAuth();
  const [accounts, setAccounts] = React.useState<ConnectedAccount[] | null>(null);
  const [error, setError] = React.useState(false);
  const [busy, setBusy] = React.useState<SignInProvider | null>(null);
  const [confirm, setConfirm] = React.useState<SignInProvider | null>(null);
  const [inlineError, setInlineError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(false);
    const result = await authApi.listConnectedAccounts();
    if (result.ok) setAccounts(result.data);else
    setError(true);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function toggle(account: ConnectedAccount) {
    setBusy(account.provider);
    setInlineError(null);
    const result = account.linked ?
    await authApi.unlinkProvider(account.provider) :
    await authApi.linkProvider(account.provider);
    setBusy(null);
    setConfirm(null);
    if (!result.ok) {
      setInlineError(result.error);
      return;
    }
    setAccounts(result.data);
    onToast(account.linked ? `${account.provider} removed as a sign-in method` : `${account.provider} linked`);
  }

  const linkedCount = (accounts ?? []).filter((a) => a.linked).length;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/5 bg-ink-850 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-900">
            <KeyRoundIcon className="h-4 w-4 text-mist-200" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Email and password</p>
            <p className="truncate text-xs text-mist-400">{identity?.email}</p>
          </div>
          <span className="text-[11px] text-mist-400">Always on</span>
        </div>
      </section>

      <section aria-labelledby="providers-h" className="rounded-2xl border border-white/5 bg-ink-850 p-4">
        <h3 id="providers-h" className="text-sm font-bold text-white">
          Linked accounts
        </h3>
        <p className="mt-0.5 text-xs text-mist-400">
          Sign in with these instead of your password. HavaVerse never sees your password for them.
        </p>

        {error ?
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-ink-900 p-3">
            <p className="text-xs text-mist-300">Linked accounts couldn't be loaded.</p>
            <button
            type="button"
            onClick={load}
            className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold text-mist-200 hover:text-white">
            
              Retry
            </button>
          </div> :
        accounts === null ?
        <ul className="mt-3 space-y-2" aria-label="Loading linked accounts">
            {[0, 1, 2].map((i) =>
          <li key={i} className="h-14 animate-pulse rounded-xl bg-ink-900" />
          )}
          </ul> :

        <ul className="mt-3 divide-y divide-white/5">
            {accounts.map((account) =>
          <li key={account.provider} className="flex flex-wrap items-center gap-3 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">
                  {account.provider[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{account.provider}</p>
                  <p className="truncate text-xs text-mist-400">
                    {account.linked ?
                `${account.address ?? 'Linked'}${account.linkedAt ? ` · since ${formatDay(account.linkedAt)}` : ''}` :
                'Not linked'}
                  </p>
                </div>
                {confirm === account.provider ?
            <div className="flex gap-2">
                    <button
                type="button"
                disabled={busy !== null}
                onClick={() => toggle(account)}
                className="rounded-full bg-live px-3 py-1.5 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-live/90 disabled:opacity-60">
                
                      {busy === account.provider ? 'Removing…' : 'Remove'}
                    </button>
                    <button
                type="button"
                onClick={() => setConfirm(null)}
                className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-mist-200 hover:text-white">
                
                      Keep
                    </button>
                  </div> :

            <button
              type="button"
              disabled={busy !== null}
              onClick={() => account.linked ? setConfirm(account.provider) : toggle(account)}
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white disabled:opacity-50">
              
                    {!account.linked && <LinkIcon className="h-3 w-3" aria-hidden="true" />}
                    {busy === account.provider ? 'Linking…' : account.linked ? 'Remove' : 'Link'}
                  </button>
            }
              </li>
          )}
          </ul>
        }

        {inlineError &&
        <p role="alert" className="mt-2 text-xs text-live">
            {inlineError}
          </p>
        }
        {accounts &&
        <p className="mt-3 text-[11px] leading-relaxed text-mist-400">
            {linkedCount === 0 ?
          'You sign in with your email and password only.' :
          `${linkedCount + 1} ways into one account. Removing a method never deletes anything.`}{' '}
            Linking redirects you to the provider to confirm it's you.
          </p>
        }
      </section>
    </div>);

}