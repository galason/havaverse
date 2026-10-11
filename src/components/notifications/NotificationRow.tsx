import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, MailOpenIcon, XIcon } from 'lucide-react';
import { notificationsApi } from '../../services/notificationsApi';
import { categories } from '../../data/notifications';
import { relativeTime } from '../../utils/time';
import { categoryVisuals } from './categoryVisuals';
import type { AppNotification, NotificationChannel } from '../../types/notifications';

const channelLabel: Record<NotificationChannel, string> = {
  'in-app': 'In HavaVerse',
  push: 'Push',
  email: 'Email',
  sms: 'SMS'
};

/** "Also queued for Push and Email" — honest: queued, never "sent". */
function deliveryLine(n: AppNotification): string | null {
  const queued = (Object.keys(n.delivery) as NotificationChannel[]).filter((c) => n.delivery[c] === 'queued');
  if (queued.length === 0) return null;
  const names = queued.map((c) => channelLabel[c]);
  const joined = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
  return `Also queued for ${joined}`;
}

export function NotificationRow({ notification: n }: {notification: AppNotification;}) {
  const navigate = useNavigate();
  const visual = categoryVisuals[n.kind];
  const Icon = visual.icon;
  const label = categories.find((c) => c.id === n.kind)?.label ?? n.kind;
  const delivery = deliveryLine(n);

  const open = () => {
    notificationsApi.markRead(n.id);
    navigate(n.to);
  };

  return (
    <li className={['group relative flex gap-3 px-4 py-3.5 sm:px-5', n.read ? '' : 'bg-brand-indigo/5'].join(' ')}>
      <button
        type="button"
        onClick={open}
        className="flex min-w-0 flex-1 items-start gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo">
        
        <span className="relative shrink-0">
          {n.image ?
          <img src={n.image} alt="" className="h-11 w-11 rounded-xl object-cover" /> :

          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${visual.tile}`}>
              <Icon className={`h-5 w-5 ${visual.tone}`} aria-hidden="true" />
            </span>
          }
          {n.image &&
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink-900 bg-ink-850">
              <Icon className={`h-2.5 w-2.5 ${visual.tone}`} aria-hidden="true" />
            </span>
          }
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className={`truncate text-sm ${n.read ? 'font-medium text-mist-100' : 'font-semibold text-white'}`}>
              {n.title}
            </span>
            {!n.read && <span className="sr-only">(unread)</span>}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-mist-300">{n.body}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-mist-400">
            <span className={`font-semibold ${visual.tone}`}>{label}</span>
            <span aria-hidden="true">·</span>
            <span>{relativeTime(n.createdAt)}</span>
            {delivery &&
            <>
                <span aria-hidden="true">·</span>
                <span>{delivery}</span>
              </>
            }
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-start gap-0.5 sm:opacity-0 sm:transition-opacity sm:duration-150 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => n.read ? notificationsApi.markUnread(n.id) : notificationsApi.markRead(n.id)}
          aria-label={n.read ? `Mark "${n.title}" as unread` : `Mark "${n.title}" as read`}
          title={n.read ? 'Mark as unread' : 'Mark as read'}
          className="rounded-lg p-2 text-mist-400 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
          
          {n.read ? <MailIcon className="h-4 w-4" aria-hidden="true" /> : <MailOpenIcon className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => notificationsApi.dismiss(n.id)}
          aria-label={`Dismiss "${n.title}"`}
          title="Dismiss"
          className="rounded-lg p-2 text-mist-400 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
          
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {!n.read &&
      <span className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand-indigo sm:left-2" aria-hidden="true" />
      }
    </li>);

}