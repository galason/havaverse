import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { Insight, UpcomingItem } from '../../types/dashboard';

/** Forward-looking: what is about to happen in the viewer's HavaVerse. */
export function UpNextPanel({ items }: {items: UpcomingItem[];}) {
  return (
    <ul className="space-y-2">
      {items.map((item) =>
      <li key={item.id}>
          <Link
          to={item.to}
          className="flex gap-3 rounded-xl border border-white/5 bg-ink-850 p-2.5 transition-colors duration-150 ease-entrance hover:border-white/20">
          
            {item.image &&
          <img src={item.image} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
          }
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                item.imminent ? 'text-live' : 'text-brand-indigo'}`
                }>
                
                  {item.dayLabel}
                </span>
                {item.imminent &&
              <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
                  </span>
              }
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold text-white">
                {item.title}
              </span>
              <span className="block truncate text-[11px] text-mist-400">{item.detail}</span>
            </span>
          </Link>
        </li>
      )}
    </ul>);

}

/** Observations with somewhere to go. An insight without an action is noise. */
export function InsightsPanel({ insights }: {insights: Insight[];}) {
  return (
    <ul className="space-y-3">
      {insights.map((insight) =>
      <li key={insight.id} className="rounded-xl border border-white/5 bg-ink-850 p-3.5">
          <p className="text-xs leading-relaxed text-mist-200">{insight.text}</p>
          <Link
          to={insight.to}
          className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo transition-colors duration-150 ease-entrance hover:text-white">
          
            {insight.actionLabel}
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </li>
      )}
    </ul>);

}