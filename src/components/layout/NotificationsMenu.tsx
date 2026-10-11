import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { categories } from '../../data/notifications';
import { categoryVisuals } from '../notifications/categoryVisuals';
import { relativeTime } from '../../utils/time';

const PREVIEW = 6;

export function NotificationsMenu() {
  const { notifications, unreadCount, markAllRead, markRead } = useApp();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  const recent = [...notifications].sort((a, b) => b.createdAt - a.createdAt).slice(0, PREVIEW);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        className="relative rounded-lg p-2 text-mist-300 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
        
        <BellIcon className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 &&
        <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-live px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        }
      </button>

      {open &&
      <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-ink-850 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <h2 className="text-sm font-bold text-white">Notifications</h2>
            <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="ml-auto text-[11px] font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white disabled:opacity-40">
            
              Mark all read
            </button>
            <Link
            to="/notifications?view=preferences"
            onClick={() => setOpen(false)}
            aria-label="Notification preferences"
            className="rounded-md p-1 text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
              <SlidersHorizontalIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {recent.length === 0 ?
        <p className="px-4 py-8 text-center text-sm text-mist-300">You're all caught up.</p> :

        <ul className="max-h-[380px] divide-y divide-white/5 overflow-y-auto">
              {recent.map((n) => {
            const visual = categoryVisuals[n.kind];
            const Icon = visual.icon;
            return (
              <li key={n.id}>
                    <button
                  type="button"
                  onClick={() => {
                    markRead(n.id);
                    setOpen(false);
                    navigate(n.to);
                  }}
                  className={[
                  'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 ease-entrance hover:bg-white/5',
                  n.read ? '' : 'bg-brand-indigo/5'].
                  join(' ')}>
                  
                      {n.image ?
                  <img src={n.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> :

                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${visual.tile}`}>
                          <Icon className={`h-4 w-4 ${visual.tone}`} aria-hidden="true" />
                        </span>
                  }
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[10px] font-bold ${visual.tone}`}>
                          {categories.find((c) => c.id === n.kind)?.label}
                        </span>
                        <span className="block truncate text-xs font-semibold text-white">{n.title}</span>
                        <span className="mt-0.5 line-clamp-2 block text-[11px] leading-relaxed text-mist-300">
                          {n.body}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-mist-400">{relativeTime(n.createdAt)}</span>
                      </span>
                      {!n.read &&
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-indigo" aria-hidden="true" />
                  }
                    </button>
                  </li>);

          })}
            </ul>
        }

          <Link
          to="/notifications"
          onClick={() => setOpen(false)}
          className="block border-t border-white/5 px-4 py-3 text-center text-xs font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
          
            See all notifications
          </Link>
        </div>
      }
    </div>);

}