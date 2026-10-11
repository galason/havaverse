import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckIcon,
  EllipsisIcon,
  InfoIcon,
  PlayIcon,
  PlusIcon,
  StarIcon } from
'lucide-react';
import type { DismissReason, Recommendation } from '../../types/home';
import { useApp } from '../../contexts/AppContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { AvailabilityChip, resolveAction } from './AvailabilityChip';

interface ForYouRailProps {
  items: Recommendation[];
  onDismiss: (slug: string, reason: DismissReason) => void;
}

const dismissOptions: {id: DismissReason;label: string;}[] = [
{ id: 'this-title', label: 'Not interested in this' },
{ id: 'this-creator', label: 'Don’t recommend this creator' },
{ id: 'this-genre', label: 'Don’t recommend this genre' },
{ id: 'already-watched', label: 'I’ve already watched it' },
{ id: 'not-relevant', label: 'Not relevant to me' }];


function Card({ item, onDismiss }: {item: Recommendation;onDismiss: ForYouRailProps['onDismiss'];}) {
  const { isSaved, toggleWatchlist, showToast } = useApp();
  const [menu, setMenu] = React.useState(false);
  const [why, setWhy] = React.useState(false);
  const ref = useClickOutside<HTMLDivElement>(
    menu,
    React.useCallback(() => setMenu(false), [])
  );
  const saved = isSaved(item.id);
  const action = resolveAction(item.availability, item.slug);
  const playable = item.availability.state === 'available';

  return (
    <li className="group relative flex flex-col">
      <Link to={`/title/${item.slug}`} className="block">
        <span className="relative block aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-ink-800">
          <img
            src={item.poster}
            alt={`${item.name} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.04]" />
          
          <span className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.9)_0%,rgb(var(--c-ink-950)/0)_50%)]" />

          {playable &&
          <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-150 ease-entrance group-hover:opacity-100">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-indigo">
                <PlayIcon className="h-4 w-4 fill-current text-white" aria-hidden="true" />
              </span>
            </span>
          }

          <span className="absolute inset-x-2 bottom-2 block">
            <span className="block truncate font-display text-lg leading-[1.05] tracking-wide text-white">
              {item.name}
            </span>
            <span className="block truncate text-[11px] text-mist-300">{item.meta}</span>
          </span>
        </span>
      </Link>

      <div className="absolute right-2 top-2 z-10 flex gap-1.5 opacity-0 transition-opacity duration-150 ease-entrance focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => {
            toggleWatchlist(item.id);
            showToast(saved ? 'Removed from your list' : 'Added to your list');
          }}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${item.name} from watchlist` : `Add ${item.name} to watchlist`}
          className={`rounded-full p-1.5 transition-colors duration-150 ease-entrance ${
          saved ? 'bg-brand-indigo text-white' : 'bg-black/60 text-white hover:bg-black/85'}`
          }>
          
          {saved ?
          <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" /> :

          <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
          }
        </button>

        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-label={`More options for ${item.name}`}
            className="rounded-full bg-black/60 p-1.5 text-white transition-colors duration-150 ease-entrance hover:bg-black/85">
            
            <EllipsisIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          {menu &&
          <ul className="absolute right-0 top-9 z-20 w-56 overflow-hidden rounded-xl border border-white/10 bg-ink-850 py-1 shadow-xl">
              {dismissOptions.map((option) =>
            <li key={option.id}>
                  <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  onDismiss(item.slug, option.id);
                }}
                className="block w-full px-3 py-2 text-left text-[11px] font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:bg-ink-800">
                
                    {option.label}
                  </button>
                </li>
            )}
            </ul>
          }
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-[11px]">
        <AvailabilityChip availability={item.availability} />
        {playable &&
        <Link
          to={action.to}
          className="flex items-center gap-1 font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          
            <StarIcon className="h-3 w-3 fill-brand-amber text-brand-amber" aria-hidden="true" />
            {action.label}
          </Link>
        }
        {!playable &&
        <Link
          to={action.to}
          className="font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          
            {action.label}
          </Link>
        }
        <button
          type="button"
          onClick={() => setWhy((v) => !v)}
          aria-expanded={why}
          className="ml-auto flex shrink-0 items-center gap-1 text-mist-400 transition-colors duration-150 ease-entrance hover:text-mist-100">
          
          <InfoIcon className="h-3 w-3" aria-hidden="true" />
          Why this?
        </button>
      </div>

      {why &&
      <p className="mt-1.5 rounded-lg border border-white/5 bg-ink-900 p-2.5 text-[11px] leading-relaxed text-mist-300">
          <span className="block font-semibold text-mist-100">{item.reason.short}</span>
          {item.reason.detail}
        </p>
      }
    </li>);

}

export function ForYouRail({ items, onDismiss }: ForYouRailProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) =>
      <Card key={item.id} item={item} onDismiss={onDismiss} />
      )}
    </ul>);

}