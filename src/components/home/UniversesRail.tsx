import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, NetworkIcon } from 'lucide-react';
import type { UniverseSummary } from '../../types/home';

export function UniversesRail({ items }: {items: UniverseSummary[];}) {
  return (
    <ul className="grid gap-3 lg:grid-cols-3">
      {items.map((item) =>
      <li key={item.id}>
          <Link
          to={item.to}
          className="group relative flex h-full min-h-[13rem] flex-col justify-end overflow-hidden rounded-2xl border border-white/5">
          
            <img
            src={item.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-entrance group-hover:scale-[1.05]" />
          
            <span className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/20" />

            <span className="relative p-4">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
                <NetworkIcon className="h-3 w-3" aria-hidden="true" />
                Universe
              </span>
              <span className="mt-1 block font-display text-2xl leading-tight tracking-wide text-white">
                {item.name}
              </span>
              <span className="mt-1 block text-[11px] leading-relaxed text-mist-300">
                {item.blurb}
              </span>
              <span className="mt-2 flex flex-wrap gap-1">
                {item.entries.map((entry) =>
              <span
                key={entry}
                className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-mist-200">
                
                    {entry}
                  </span>
              )}
              </span>
              <span className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-white">
                Explore universe
                <ArrowRightIcon
                className="h-3 w-3 transition-transform duration-150 ease-entrance group-hover:translate-x-0.5"
                aria-hidden="true" />
              
              </span>
            </span>
          </Link>
        </li>
      )}
    </ul>);

}