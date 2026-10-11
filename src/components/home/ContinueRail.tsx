import React from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, XIcon } from 'lucide-react';
import type { ContinueItem } from '../../types/home';

interface ContinueRailProps {
  items: ContinueItem[];
  onRemove: (slug: string) => void;
}

/**
 * Resume state, not a poster shelf. Removing an item drops the resume marker
 * only — the title stays in the catalogue and in the watchlist.
 */
export function ContinueRail({ items, onRemove }: ContinueRailProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) =>
      <li key={item.id} className="group relative">
          <Link
          to={`/watch/${item.slug}`}
          className="block overflow-hidden rounded-xl border border-white/5 bg-ink-800">
          
            <span className="relative block aspect-video">
              <img
              src={item.poster}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.04]" />
            
              <span className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
              <span className="absolute left-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-brand-indigo opacity-0 transition-opacity duration-150 ease-entrance group-hover:opacity-100">
                <PlayIcon className="h-3.5 w-3.5 fill-current text-white" aria-hidden="true" />
              </span>
              <span className="absolute inset-x-2 bottom-4 block">
                <span className="block truncate text-sm font-bold text-white">{item.name}</span>
                <span className="block truncate text-[11px] text-mist-300">
                  {item.episode ? `${item.episode} · ` : ''}
                  {item.remaining}
                </span>
              </span>
              <span className="absolute inset-x-0 bottom-0 block h-1 bg-white/15">
                <span
                className="block h-full bg-brand-magenta"
                style={{ width: `${item.progress}%` }} />
              
              </span>
            </span>
          </Link>

          <button
          type="button"
          onClick={() => onRemove(item.slug)}
          aria-label={`Remove ${item.name} from continue watching`}
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity duration-150 ease-entrance hover:bg-black/85 focus-visible:opacity-100 group-hover:opacity-100">
          
            <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </li>
      )}
    </ul>);

}