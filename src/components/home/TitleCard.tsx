import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, PlayIcon, PlusIcon, SparklesIcon, StarIcon } from 'lucide-react';
import type { ContentTitle } from '../../types/content';
import { useApp } from '../../contexts/AppContext';

interface TitleCardProps {
  title: ContentTitle;
  showProgress?: boolean;
}

export function TitleCard({ title, showProgress = false }: TitleCardProps) {
  const { isSaved, toggleWatchlist } = useApp();
  const saved = isSaved(title.id);

  return (
    <div className="group relative flex w-full flex-col">
      <Link to={`/title/${title.slug}`} className="flex flex-col focus:outline-none">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/5 bg-ink-800">
          <img
            src={title.poster}
            alt={`${title.name} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.04]" />
          
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.85)_0%,rgb(var(--c-ink-950)/0)_48%)]" />

          {title.badge &&
          <span className="absolute left-2 top-2 rounded bg-black/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist-100 backdrop-blur">
              {title.badge}
            </span>
          }
          {title.aiAssisted &&
          <span
            className="absolute right-2 top-9 flex items-center gap-1 rounded bg-brand-violet/85 px-1.5 py-0.5 text-[10px] font-semibold text-white"
            title="Created with HavaVerse AI">
            
              <SparklesIcon className="h-3 w-3" aria-hidden="true" />
              AI
            </span>
          }

          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 ease-entrance group-hover:opacity-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-indigo">
              <PlayIcon className="h-4 w-4 fill-current text-white" aria-hidden="true" />
            </span>
          </span>

          <span className="absolute inset-x-2 bottom-2 block font-display text-lg leading-[1.05] tracking-wide text-white">
            {title.name}
          </span>

          {showProgress && typeof title.progress === 'number' &&
          <span className="absolute inset-x-0 bottom-0 block h-1 bg-white/15">
              <span
              className="block h-full bg-brand-magenta"
              style={{ width: `${title.progress}%` }} />
            
            </span>
          }
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggleWatchlist(title.id)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${title.name} from watchlist` : `Add ${title.name} to watchlist`}
        className={[
        'absolute right-2 top-2 z-10 rounded-full p-1.5 transition-colors duration-150 ease-entrance',
        saved ?
        'bg-brand-indigo text-white' :
        'bg-black/60 text-white opacity-0 hover:bg-black/85 focus-visible:opacity-100 group-hover:opacity-100'].
        join(' ')}>
        
        {saved ?
        <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" /> :

        <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
        }
      </button>

      <div className="mt-2 flex items-center gap-2 text-[11px] text-mist-300">
        <span className="flex items-center gap-1 font-semibold text-brand-amber">
          <StarIcon className="h-3 w-3 fill-current" aria-hidden="true" />
          {title.rating.toFixed(1)}
        </span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{title.runtime}</span>
        <span className="ml-auto shrink-0 truncate text-mist-400">{title.genre}</span>
      </div>
    </div>);

}