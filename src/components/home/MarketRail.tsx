import React from 'react';
import { Link } from 'react-router-dom';
import type { ExperienceItem, MarketItem } from '../../types/home';

export function MarketRail({ items }: {items: MarketItem[];}) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) =>
      <li key={item.id}>
          <Link
          to={item.to}
          className="group block overflow-hidden rounded-xl border border-white/5 bg-ink-900">
          
            <span className="block aspect-[4/3] overflow-hidden">
              <img
              src={item.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.05]" />
            
            </span>
            <span className="block p-3">
              <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-mist-400">
                {item.from}
              </span>
              <span className="mt-0.5 block line-clamp-2 text-xs font-bold leading-snug text-white">
                {item.name}
              </span>
              <span className="mt-1 block text-sm font-bold text-brand-amber">{item.price}</span>
            </span>
          </Link>
        </li>
      )}
    </ul>);

}

export function ExperiencesRail({ items }: {items: ExperienceItem[];}) {
  return (
    <ul className="grid gap-3 lg:grid-cols-3">
      {items.map((item) =>
      <li key={item.id}>
          <Link
          to={item.to}
          className="group flex h-full gap-3 rounded-xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-brand-amber/40">
          
            <img
            src={item.image}
            alt=""
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-lg object-cover" />
          
            <span className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-brand-amber">
                {item.kind}
              </span>
              <span className="mt-0.5 block line-clamp-2 text-sm font-bold leading-snug text-white">
                {item.name}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-mist-300">{item.when}</span>
              <span className="block truncate text-[11px] text-mist-400">{item.where}</span>
            </span>
          </Link>
        </li>
      )}
    </ul>);

}