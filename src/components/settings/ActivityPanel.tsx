import React from 'react';
import { BellIcon, ShieldIcon, SparklesIcon, WalletIcon, EyeIcon } from 'lucide-react';
import type { ActivityEntry } from '../../types/settings';
import { settingsApi } from '../../services/settingsApi';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../community/StateBlocks';

const icons: Record<ActivityEntry['kind'], typeof BellIcon> = {
  ai: SparklesIcon,
  security: ShieldIcon,
  notification: BellIcon,
  payment: WalletIcon,
  privacy: EyeIcon
};

const filters: {id: ActivityEntry['kind'] | 'all';label: string;}[] = [
{ id: 'all', label: 'Everything' },
{ id: 'ai', label: 'Hava AI' },
{ id: 'security', label: 'Security' },
{ id: 'payment', label: 'Payments' },
{ id: 'privacy', label: 'Privacy' }];


interface ActivityPanelProps {
  only?: ActivityEntry['kind'];
  /** Side-rail form: no filters, most recent few. */
  compact?: boolean;
  limit?: number;
}

export function ActivityPanel({ only, compact, limit }: ActivityPanelProps) {
  const [kind, setKind] = React.useState<ActivityEntry['kind'] | 'all'>(only ?? 'all');
  const [entries, setEntries] = React.useState<ActivityEntry[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await settingsApi.listActivity(kind === 'all' ? undefined : kind);
    if (result.ok) {
      setEntries(limit ? result.data.slice(0, limit) : result.data);
      setStatus('ready');
    } else setStatus('error');
  }, [kind, limit]);

  React.useEffect(() => {
    load();
  }, [load]);

  const days = ['Today', 'Yesterday', 'Earlier'] as const;

  return (
    <div className="space-y-3">
      {!only && !compact &&
      <div className="flex gap-1 overflow-x-auto pb-1">
          {filters.map((f) =>
        <button
          key={f.id}
          type="button"
          onClick={() => setKind(f.id)}
          aria-pressed={kind === f.id}
          className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
          kind === f.id ?
          'bg-white text-ink-950' :
          'border border-white/10 text-mist-300 hover:text-white'}`
          }>
          
              {f.label}
            </button>
        )}
        </div>
      }

      {status === 'loading' && <SkeletonRows rows={4} />}
      {status === 'error' && <ErrorBlock message="Activity could not be loaded." onRetry={load} />}
      {status === 'ready' && entries.length === 0 &&
      <EmptyBlock title="Nothing here" body="No changes of this kind on this account." />
      }

      {status === 'ready' &&
      days.map((day) => {
        const forDay = entries.filter((e) => e.day === day);
        if (forDay.length === 0) return null;
        return (
          <section key={day}>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">
                {day}
              </h3>
              <ul className="mt-1.5 space-y-1.5">
                {forDay.map((entry) => {
                const Icon = icons[entry.kind];
                return (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-850 p-3">
                    
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-900">
                        <Icon className="h-3.5 w-3.5 text-mist-200" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-white">{entry.label}</p>
                        {entry.detail &&
                      <p className="truncate text-[11px] text-mist-400">{entry.detail}</p>
                      }
                      </div>
                      <span className="shrink-0 text-[10px] text-mist-400">{entry.at}</span>
                    </li>);

              })}
              </ul>
            </section>);

      })}
    </div>);

}