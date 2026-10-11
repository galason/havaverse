import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3Icon, BellIcon, BellRingIcon, PlayIcon } from 'lucide-react';
import type { SportsItem } from '../../types/home';

interface SportsRailProps {
  items: SportsItem[];
  reminders: Record<string, boolean>;
  onReminder: (item: SportsItem) => void;
}

/**
 * Sport is a scoreline, not a poster. The live fixture dominates; the rest are
 * schedule rows.
 */
export function SportsRail({ items, reminders, onReminder }: SportsRailProps) {
  const [live, ...rest] = [...items].sort((a, b) => Number(b.live) - Number(a.live));

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <article className="relative overflow-hidden rounded-2xl border border-live/25 bg-ink-900">
        <img
          src={live.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30" />
        
        <div className="relative p-5">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-live">
            <span className="h-1.5 w-1.5 rounded-full bg-live" aria-hidden="true" />
            Live · {live.competition}
          </span>

          <div className="mt-3 flex items-center gap-4">
            <span className="min-w-0 flex-1 truncate text-lg font-bold text-white">
              {live.home}
            </span>
            <span className="shrink-0 font-display text-4xl tracking-wide text-white">
              {live.homeScore} — {live.awayScore}
            </span>
            <span className="min-w-0 flex-1 truncate text-right text-lg font-bold text-white">
              {live.away}
            </span>
          </div>
          <p className="mt-1 text-center text-xs font-semibold text-mist-300">{live.clock}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={live.to}
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
              
              <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Watch live
            </Link>
            <Link
              to={live.to}
              className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:border-white/45">
              
              <BarChart3Icon className="h-3.5 w-3.5" aria-hidden="true" />
              Match centre
            </Link>
          </div>
        </div>
      </article>

      <ul className="space-y-2">
        {rest.map((item) => {
          const reminded = reminders[item.id];
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900 p-3">
              
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-mist-400">
                  {item.competition}
                </p>
                <p className="truncate text-sm font-bold text-white">
                  {item.home} vs {item.away}
                </p>
                <p className="truncate text-[11px] text-mist-300">{item.kickoff}</p>
              </div>
              <button
                type="button"
                onClick={() => onReminder(item)}
                aria-pressed={reminded}
                aria-label={
                reminded ?
                `Remove reminder for ${item.home} versus ${item.away}` :
                `Remind me about ${item.home} versus ${item.away}`
                }
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-150 ease-entrance ${
                reminded ?
                'border-brand-cyan/50 bg-brand-cyan/10 text-brand-cyan' :
                'border-white/15 text-mist-200 hover:border-white/35'}`
                }>
                
                {reminded ?
                <BellRingIcon className="h-4 w-4" aria-hidden="true" /> :

                <BellIcon className="h-4 w-4" aria-hidden="true" />
                }
              </button>
            </li>);

        })}
      </ul>
    </div>);

}