import React from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, BellRingIcon, PlayIcon } from 'lucide-react';
import type { LiveItem } from '../../types/home';

interface LiveNowRailProps {
  items: LiveItem[];
  reminders: Record<string, boolean>;
  onReminder: (item: LiveItem) => void;
}

const compact = (n: number) =>
n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n);

export function LiveNowRail({ items, reminders, onReminder }: LiveNowRailProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const reminded = reminders[item.id];
        return (
          <li
            key={item.id}
            className="group overflow-hidden rounded-xl border border-white/5 bg-ink-900">
            
            <Link to={item.to} className="block">
              <span className="relative block aspect-video">
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.04]" />
                
                <span className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
                {item.state === 'live' ?
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-live px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                    Live
                  </span> :

                <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold uppercase text-mist-100">
                    Upcoming
                  </span>
                }
                <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-mist-100">
                  {item.category}
                </span>
              </span>
            </Link>

            <div className="p-3">
              <Link to={item.to} className="block truncate text-sm font-bold text-white">
                {item.name}
              </Link>
              <p className="mt-0.5 truncate text-[11px] text-mist-400">{item.meta}</p>
              <p className="mt-0.5 text-[11px] text-mist-300">
                {item.state === 'live' && item.watching ?
                `${compact(item.watching)} watching` :
                item.startsIn}
              </p>

              {item.state === 'live' ?
              <Link
                to={item.to}
                className="mt-2.5 flex items-center justify-center gap-1.5 rounded-full bg-live px-3 py-1.5 text-[11px] font-bold text-white transition-opacity duration-150 ease-entrance hover:opacity-90">
                
                  <PlayIcon className="h-3 w-3 fill-current" aria-hidden="true" />
                  Watch live
                </Link> :

              <button
                type="button"
                onClick={() => onReminder(item)}
                aria-pressed={reminded}
                className={`mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
                reminded ?
                'border-brand-cyan/50 bg-brand-cyan/10 text-brand-cyan' :
                'border-white/15 text-white hover:border-white/35'}`
                }>
                
                  {reminded ?
                <BellRingIcon className="h-3 w-3" aria-hidden="true" /> :

                <BellIcon className="h-3 w-3" aria-hidden="true" />
                }
                  {reminded ? 'Reminder set' : 'Set reminder'}
                </button>
              }
            </div>
          </li>);

      })}
    </ul>);

}