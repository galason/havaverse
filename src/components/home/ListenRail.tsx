import React from 'react';
import { Link } from 'react-router-dom';
import { MicIcon, MusicIcon, PlayIcon } from 'lucide-react';
import type { ListenItem } from '../../types/home';

export function ListenRail({ items }: {items: ListenItem[];}) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.medium === 'Music' ? MusicIcon : MicIcon;
        return (
          <li key={item.id}>
            <Link
              to={item.to}
              className="group flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900 p-2.5 transition-colors duration-150 ease-entrance hover:border-brand-cyan/40">
              
              <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition-opacity duration-150 ease-entrance group-hover:opacity-100">
                  <PlayIcon className="h-4 w-4 fill-current text-white" aria-hidden="true" />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-cyan">
                  <Icon className="h-3 w-3" aria-hidden="true" />
                  {item.medium}
                </span>
                <span className="mt-0.5 block truncate text-sm font-bold text-white">
                  {item.name}
                </span>
                <span className="block truncate text-[11px] text-mist-400">{item.meta}</span>
                <span className="block truncate text-[11px] text-mist-300">{item.reason}</span>
              </span>
            </Link>
          </li>);

      })}
    </ul>);

}