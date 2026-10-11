import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { CommunityActivity } from '../../types/home';

export function CommunityActivityRail({ items }: {items: CommunityActivity[];}) {
  return (
    <ul className="grid gap-3 lg:grid-cols-3">
      {items.map((item) =>
      <li key={item.id}>
          <Link
          to={item.to}
          className="group flex h-full gap-3 rounded-xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-brand-indigo/40">
          
            <img
            src={item.image}
            alt=""
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-lg object-cover" />
          
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wide text-brand-magenta">
                {item.label}
              </span>
              <span className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-white">
                {item.headline}
              </span>
              <span className="mt-0.5 truncate text-[11px] text-mist-400">
                {item.community} · {item.meta}
              </span>
              <span className="mt-auto flex items-center gap-1 pt-2 text-[11px] font-semibold text-brand-cyan">
                {item.cta}
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