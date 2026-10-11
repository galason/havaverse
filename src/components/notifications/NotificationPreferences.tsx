import React from 'react';
import { LockIcon } from 'lucide-react';
import { notificationsApi } from '../../services/notificationsApi';
import { categories, channels } from '../../data/notifications';
import { categoryVisuals } from './categoryVisuals';
import type { NotificationCategory, NotificationChannel } from '../../types/notifications';

type CellKey = `${NotificationCategory}:${NotificationChannel}`;

/**
 * The one place notification preferences are edited — rendered both in the
 * notification centre and in Settings → Notifications. Each change is saved
 * by the notification service before the switch moves.
 */
export function NotificationPreferences() {
  const [, setVersion] = React.useState(0);
  const [pending, setPending] = React.useState<CellKey | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const toggle = async (category: NotificationCategory, channel: NotificationChannel, on: boolean) => {
    const key: CellKey = `${category}:${channel}`;
    setPending(key);
    setError(null);
    const res = await notificationsApi.setPreference(category, channel, on);
    setPending(null);
    if (res.ok) setVersion((v) => v + 1);else
    setError(res.error);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-ink-900">
        <table className="w-full min-w-[560px] text-left">
          <caption className="sr-only">Notification channels for each category</caption>
          <thead>
            <tr className="border-b border-white/5">
              <th scope="col" className="px-4 py-3 text-[11px] font-semibold text-mist-400 sm:px-5">
                Category
              </th>
              {channels.map((ch) =>
              <th key={ch.id} scope="col" className="w-24 px-2 py-3 text-center text-[11px] font-semibold text-mist-400">
                  {ch.label}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.map((cat) => {
              const visual = categoryVisuals[cat.id];
              const Icon = visual.icon;
              return (
                <tr key={cat.id}>
                  <th scope="row" className="px-4 py-3.5 align-top font-normal sm:px-5">
                    <span className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${visual.tile}`}>
                        <Icon className={`h-4 w-4 ${visual.tone}`} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white">{cat.label}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-mist-400">{cat.description}</span>
                      </span>
                    </span>
                  </th>
                  {channels.map((ch) => {
                    const state = notificationsApi.channelState(cat.id, ch.id);
                    const key: CellKey = `${cat.id}:${ch.id}`;
                    return (
                      <td key={ch.id} className="px-2 py-3.5 text-center align-middle">
                        {state === 'unavailable' ?
                        <span className="text-xs text-mist-400">
                            <span aria-hidden="true">—</span>
                            <span className="sr-only">{ch.label} not offered for {cat.label}</span>
                          </span> :
                        state === 'locked' ?
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-mist-300"
                          title="Always on so you never miss it">
                          
                            <LockIcon className="h-3 w-3" aria-hidden="true" />
                            On
                            <span className="sr-only">, {ch.label} is always on for {cat.label}</span>
                          </span> :

                        <Switch
                          on={state === 'on'}
                          busy={pending === key}
                          label={`${ch.label} for ${cat.label}`}
                          onChange={(on) => toggle(cat.id, ch.id, on)} />

                        }
                      </td>);

                  })}
                </tr>);

            })}
          </tbody>
        </table>
      </div>

      {error &&
      <p role="alert" className="text-xs font-semibold text-live">
          {error}
        </p>
      }

      <p className="text-xs leading-relaxed text-mist-400">
        Choices save as you make them and apply to new notifications. Push, email and SMS are sent by the
        HavaVerse delivery service — this device records them as queued and never claims they were sent.
        Security alerts always reach your inbox and email.
      </p>
    </div>);

}

function Switch({
  on,
  busy,
  label,
  onChange





}: {on: boolean;busy: boolean;label: string;onChange: (on: boolean) => void;}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      aria-busy={busy}
      disabled={busy}
      onClick={() => onChange(!on)}
      className={[
      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150 ease-entrance focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo disabled:opacity-60',
      on ? 'bg-brand-indigo' : 'bg-white/15'].
      join(' ')}>
      
      <span
        className={[
        'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-150 ease-entrance',
        on ? 'translate-x-[18px]' : 'translate-x-[3px]'].
        join(' ')} />
      
    </button>);

}