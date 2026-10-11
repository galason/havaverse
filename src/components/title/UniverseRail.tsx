import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { UniverseEntry } from '../../types/title';
import { UNIVERSE_BANNER } from '../../data/titleHub';

interface UniverseRailProps {
  name: string;
  to: string;
  entries: UniverseEntry[];
}

/**
 * The universe is presented as an ordered chain rather than a grid, because
 * the order is the point — this is one story told across several works.
 */
export function UniverseRail({ name, to, entries }: UniverseRailProps) {
  return (
    <div className="space-y-4">
      <ul className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {entries.map((entry) =>
        <li key={entry.order} className="w-44 shrink-0 sm:w-52">
            <Link
            to={entry.to}
            className={`group block overflow-hidden rounded-2xl border transition-colors duration-150 ease-entrance ${
            entry.current ?
            'border-brand-indigo/60 bg-brand-indigo/5' :
            'border-white/5 bg-ink-850 hover:border-white/20'}`
            }>
            
              <div className="relative aspect-[16/11]">
                <img
                src={entry.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.03]" />
              
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                <span className="absolute left-3 top-3 rounded bg-ink-950/80 px-1.5 py-0.5 font-display text-sm text-white backdrop-blur">
                  {entry.order}
                </span>
                {entry.current &&
              <span className="absolute right-3 top-3 rounded-full bg-brand-indigo px-2 py-0.5 text-[10px] font-semibold text-white">
                    You’re here
                  </span>
              }
              </div>
              <div className="p-3">
                <p className="text-xs font-bold leading-snug text-white">{entry.name}</p>
                <p className="mt-0.5 text-[11px] text-mist-400">
                  {entry.kind} · {entry.year}
                </p>
                {entry.status &&
              <p className="mt-1.5 inline-block rounded-full border border-brand-amber/30 px-2 py-0.5 text-[10px] font-semibold text-brand-amber">
                    {entry.status}
                  </p>
              }
              </div>
            </Link>
          </li>
        )}
      </ul>

      <Link
        to={to}
        className="group relative block overflow-hidden rounded-2xl border border-white/5">
        
        <img src={UNIVERSE_BANNER} alt="" className="h-40 w-full object-cover sm:h-48" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent" />
        <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-center p-5 sm:p-7">
          <h3 className="font-display text-2xl uppercase tracking-tight text-white sm:text-3xl">
            {name}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-mist-300">
            Walk the connected world, characters, stories, music and fan work as one graph.
          </p>
          <span className="mt-3 flex w-fit items-center gap-2 rounded-full bg-brand-indigo px-4 py-2 text-xs font-bold text-white transition-colors duration-150 ease-entrance group-hover:bg-brand-violet">
            Explore the universe
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </div>);

}