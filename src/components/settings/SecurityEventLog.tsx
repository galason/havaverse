import React from 'react';
import { AlertTriangleIcon, CircleIcon, CheckIcon } from 'lucide-react';
import { authApi } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { reviewable, securityEventMeta } from '../../utils/securityEvents';
import { relativeTime } from '../../utils/time';
import type { SecurityEvent } from '../../types/identity';

type Filter = 'all' | 'review';
const PAGE = 8;

/**
 * The identity service's append-only record of what happened to this
 * account. Read-only by design — nobody, including you, can edit history.
 */
export function SecurityEventLog() {
  const { identity } = useAuth();
  const [events, setEvents] = React.useState<SecurityEvent[] | null>(null);
  const [error, setError] = React.useState(false);
  const [filter, setFilter] = React.useState<Filter>('all');
  const [shown, setShown] = React.useState(PAGE);

  const load = React.useCallback(async () => {
    setError(false);
    const result = await authApi.listSecurityEvents();
    if (result.ok) setEvents(result.data);else
    setError(true);
  }, []);

  // Re-read whenever the identity changes: every identity mutation writes an event.
  React.useEffect(() => {
    load();
  }, [load, identity]);

  const visible = (events ?? []).filter((e) => filter === 'all' || reviewable.has(e.kind));

  return (
    <section aria-labelledby="security-log-h" className="rounded-2xl border border-white/5 bg-ink-850 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="security-log-h" className="text-sm font-bold text-white">
            Security activity
          </h3>
          <p className="mt-0.5 text-xs text-mist-400">
            Sign-ins, failed attempts and changes to this identity. It can't be edited.
          </p>
        </div>
        <div role="tablist" aria-label="Filter security activity" className="flex rounded-full bg-ink-900 p-0.5">
          {(
          [
          ['all', 'All'],
          ['review', 'Worth a look']] as
          const).
          map(([id, label]) =>
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            onClick={() => {
              setFilter(id);
              setShown(PAGE);
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
            filter === id ? 'bg-ink-700 text-white' : 'text-mist-400 hover:text-white'}`
            }>
            
              {label}
            </button>
          )}
        </div>
      </div>

      {error ?
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-ink-900 p-3">
          <p className="text-xs text-mist-300">Security activity couldn't be loaded.</p>
          <button
          type="button"
          onClick={load}
          className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold text-mist-200 hover:text-white">
          
            Retry
          </button>
        </div> :
      events === null ?
      <ul className="mt-4 space-y-2" aria-label="Loading security activity">
          {[0, 1, 2].map((i) =>
        <li key={i} className="h-11 animate-pulse rounded-xl bg-ink-900" />
        )}
        </ul> :
      visible.length === 0 ?
      <p className="mt-4 rounded-xl bg-ink-900 p-3 text-xs text-mist-300">
          {filter === 'review' ?
        'Nothing unusual. Failed sign-ins, password changes and removed sign-in methods would appear here.' :
        'No activity recorded yet.'}
        </p> :

      <>
          <ol className="mt-3 divide-y divide-white/5">
            {visible.slice(0, shown).map((event) => {
            const meta = securityEventMeta[event.kind];
            const Icon =
            meta.tone === 'warn' ? AlertTriangleIcon : meta.tone === 'good' ? CheckIcon : CircleIcon;
            return (
              <li key={event.id} className="flex items-start gap-3 py-2.5">
                  <Icon
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                  meta.tone === 'warn' ?
                  'text-brand-amber' :
                  meta.tone === 'good' ?
                  'text-brand-cyan' :
                  'text-mist-400'}`
                  }
                  aria-hidden="true" />
                
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white">
                      {meta.label}
                      {event.detail &&
                    <span className="font-normal text-mist-300"> · {event.detail}</span>
                    }
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-mist-400">
                      {event.device} · {event.location}
                    </p>
                  </div>
                  <time
                  dateTime={new Date(event.at).toISOString()}
                  title={new Date(event.at).toLocaleString()}
                  className="shrink-0 text-[11px] text-mist-400">
                  
                    {relativeTime(event.at)}
                  </time>
                </li>);

          })}
          </ol>
          {visible.length > shown &&
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="mt-2 text-[11px] font-semibold text-mist-200 hover:text-white">
          
              Show {Math.min(PAGE, visible.length - shown)} more
            </button>
        }
          <p className="mt-3 text-[11px] leading-relaxed text-mist-400">
            Don't recognise something? Change your password and end other sessions below.
          </p>
        </>
      }
    </section>);

}