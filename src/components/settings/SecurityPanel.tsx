import React from 'react';
import { AlertTriangleIcon, CheckIcon, ShieldCheckIcon } from 'lucide-react';
import { securitySignals } from '../../data/settings';
import { settingsApi } from '../../services/settingsApi';
import { SecurityEventLog } from './SecurityEventLog';

export function SecurityPanel({ onToast }: {onToast: (m: string) => void;}) {
  const [confirming, setConfirming] = React.useState(false);
  const [working, setWorking] = React.useState(false);

  const attention = securitySignals.filter((s) => s.state === 'attention').length;
  const posture = attention === 0 ? 'Strong' : attention < 2 ? 'Good' : 'Needs attention';

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/5 bg-ink-850 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-cyan/10">
            <ShieldCheckIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">
              Account protection
            </p>
            <p className="text-lg font-bold tracking-tight text-white">{posture}</p>
          </div>
          {attention > 0 &&
          <p className="ml-auto text-xs text-brand-amber">
              {attention} thing{attention > 1 ? 's' : ''} would make this stronger
            </p>
          }
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {securitySignals.map((signal) =>
          <li
            key={signal.id}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900 p-3">
            
              {signal.state === 'good' ?
            <CheckIcon className="h-4 w-4 shrink-0 text-brand-cyan" aria-hidden="true" /> :

            <AlertTriangleIcon
              className="h-4 w-4 shrink-0 text-brand-amber"
              aria-hidden="true" />

            }
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white">{signal.label}</p>
                <p className="truncate text-[11px] text-mist-400">{signal.value}</p>
              </div>
              {signal.action &&
            <button
              type="button"
              onClick={() => onToast(`${signal.action} — this opens the identity service`)}
              className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
              
                  {signal.action}
                </button>
            }
            </li>
          )}
        </ul>
      </section>

      <SecurityEventLog />

      {/* Separated deliberately: this ends sessions on devices you may not have. */}
      <section className="rounded-2xl border border-live/25 bg-ink-850 p-4">
        <h3 className="text-sm font-bold text-white">Sign out everywhere else</h3>
        <p className="mt-1 text-xs leading-relaxed text-mist-400">
          Ends every session except this one. Anyone signed in on a TV or a borrowed device
          will have to sign in again.
        </p>
        {confirming ?
        <div className="mt-3 flex flex-wrap gap-2">
            <button
            type="button"
            disabled={working}
            onClick={async () => {
              setWorking(true);
              const result = await settingsApi.revokeAllDevices();
              setWorking(false);
              setConfirming(false);
              onToast(
                result.ok ?
                'All other sessions ended' :
                'Those sessions could not be ended'
              );
            }}
            className="rounded-full bg-live px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-live/90 disabled:opacity-60">
            
              {working ? 'Ending sessions…' : 'Yes, sign them all out'}
            </button>
            <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
              Cancel
            </button>
          </div> :

        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-3 rounded-full border border-live/40 px-4 py-2 text-xs font-semibold text-live transition-colors duration-150 ease-entrance hover:bg-live/10">
          
            Sign out of all devices
          </button>
        }
      </section>
    </div>);

}