import React from 'react';
import {
  ArrowRightIcon,
  BellIcon,
  MonitorIcon,
  ShieldIcon,
  SparklesIcon,
  UserIcon,
  WalletIcon } from
'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { settingsApi } from '../../services/settingsApi';
import { notificationsApi } from '../../services/notificationsApi';
import { categories } from '../../data/notifications';
import type { NotificationChannel } from '../../types/notifications';
import { AiRelationship } from './AiRelationship';

interface OverviewPanelProps {
  name: string;
  handle: string;
  avatar: string;
  isCreator: boolean;
  onGo: (sectionId: string) => void;
  onToast: (message: string) => void;
}

/** Derived from the live registry, never a written-in percentage. */
function completeness(filled: number, total: number) {
  return Math.round(filled / Math.max(1, total) * 100);
}

export function OverviewPanel({
  name,
  handle,
  avatar,
  isCreator,
  onGo,
  onToast
}: OverviewPanelProps) {
  const { valueOf, registry } = useSettings();
  const [deviceCount, setDeviceCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    settingsApi.listDevices().then((r) => {
      if (r.ok) setDeviceCount(r.data.length);
    });
  }, []);

  const answered = registry.filter((d) => {
    const v = valueOf(d.id);
    return v !== '' && v !== undefined;
  }).length;
  const profilePct = completeness(answered, registry.length);

  const memory = valueOf('ai.memory');
  const intensity = String(valueOf('personalization.intensity') ?? 'balanced');
  const activity = String(valueOf('social.activity') ?? 'followers');
  const watching = String(valueOf('social.watching') ?? 'nobody');
  const channelCount = (channel: NotificationChannel) =>
  categories.filter((c) => {
    const s = notificationsApi.channelState(c.id, channel);
    return s === 'on' || s === 'locked';
  }).length;
  const liveOn = notificationsApi.channelState('live', 'push') === 'on';

  const labelOf = (id: string, value: string) =>
  registry.find((d) => d.id === id)?.options?.find((o) => o.value === value)?.label ?? value;

  const cards: {
    id: string;
    eyebrow: string;
    icon: typeof UserIcon;
    title: string;
    sub?: string;
    rows: string[][];
    bar?: number;
    cta: string;
  }[] = [
  {
    id: 'profile',
    eyebrow: 'Identity',
    icon: UserIcon,
    title: name,
    // Handles are stored with or without the prefix depending on source;
    // normalise so the UI never renders "@@name".
    sub: handle.startsWith('@') ? handle : `@${handle}`,
    rows: [['Profile completeness', `${profilePct}%`]],
    bar: profilePct,
    cta: 'Manage identity'
  },
  {
    id: 'ai-preferences',
    eyebrow: 'Hava AI',
    icon: SparklesIcon,
    title: 'Personal AI configuration',
    rows: [
    ['Memory', memory ? 'On' : 'Off'],
    ['Personalization', labelOf('personalization.intensity', intensity)],
    ['Voice interaction', 'Available']],

    cta: 'Configure Hava AI'
  },
  {
    id: 'social-presence',
    eyebrow: 'Privacy',
    icon: ShieldIcon,
    title: 'Your privacy controls',
    rows: [
    ['Activity visible to', labelOf('social.activity', activity)],
    ['What I am watching', labelOf('social.watching', watching)],
    ['Personalization data', memory ? 'Enabled' : 'Restricted']],

    cta: 'Review privacy'
  },
  {
    id: 'havapay',
    eyebrow: 'HavaPay',
    icon: WalletIcon,
    title: 'Economic account',
    rows: [
    ['Wallet', 'Connected'],
    ['Payment method', '•••• 4821'],
    ['Creator payouts', isCreator ? 'Configured' : 'Not set up']],

    cta: 'Manage HavaPay'
  },
  {
    id: 'notifications',
    eyebrow: 'Notifications',
    icon: BellIcon,
    title: 'Notification intelligence',
    rows: [
    ['Push', `${channelCount('push')} of ${categories.length} categories`],
    ['Email', `${channelCount('email')} of ${categories.length} categories`],
    ['Live alerts', liveOn ? 'On' : 'Off']],

    cta: 'Customize'
  },
  {
    id: 'devices',
    eyebrow: 'Devices',
    icon: MonitorIcon,
    title:
    deviceCount === null ?
    'Checking sessions…' :
    `${deviceCount} connected device${deviceCount === 1 ? '' : 's'}`,
    rows: [['Web · iPhone · TV · Desktop', '']],
    cta: 'Manage devices'
  }];


  return (
    <div className="space-y-5">
      <section aria-labelledby="control-center">
        <h2 id="control-center" className="text-lg font-bold tracking-tight text-white">
          Your control center
        </h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) =>
          <li key={card.id}>
              <button
              type="button"
              onClick={() => onGo(card.id)}
              className="flex h-full w-full flex-col rounded-2xl border border-white/5 bg-ink-850 p-4 text-left transition-colors duration-150 ease-entrance hover:border-white/20">
              
                <span className="flex items-center gap-2">
                  <card.icon className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">
                    {card.eyebrow}
                  </span>
                  <ArrowRightIcon
                  className="ml-auto h-3.5 w-3.5 text-mist-400"
                  aria-hidden="true" />
                
                </span>

                <span className="mt-2.5 flex items-center gap-2.5">
                  {card.id === 'profile' &&
                <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                }
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {card.title}
                    </span>
                    {card.sub &&
                  <span className="block truncate text-[11px] text-mist-400">{card.sub}</span>
                  }
                  </span>
                </span>

                <dl className="mt-3 space-y-1.5">
                  {card.rows.map(([label, value]) =>
                <div key={label} className="flex items-baseline justify-between gap-3">
                      <dt className="truncate text-[11px] text-mist-400">{label}</dt>
                      {value &&
                  <dd className="shrink-0 text-[11px] font-semibold text-white">{value}</dd>
                  }
                    </div>
                )}
                </dl>

                {card.bar !== undefined &&
              <span className="mt-3 block h-1 w-full overflow-hidden rounded-full bg-ink-700">
                    <span
                  className="block h-full rounded-full bg-brand-cyan"
                  style={{ width: `${card.bar}%` }} />
                
                  </span>
              }

                <span className="mt-auto pt-3 text-[11px] font-semibold text-brand-indigo">
                  {card.cta}
                </span>
              </button>
            </li>
          )}
        </ul>
      </section>

      <section aria-labelledby="ai-relationship">
        <h2 id="ai-relationship" className="text-lg font-bold tracking-tight text-white">
          Your AI relationship
        </h2>
        <p className="mt-0.5 text-xs text-mist-400">
          Configure what Hava AI can understand, remember and do across HavaVerse.
        </p>
        <div className="mt-3">
          <AiRelationship onToast={onToast} />
        </div>
      </section>
    </div>);

}