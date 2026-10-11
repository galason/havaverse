import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, PlayIcon } from 'lucide-react';
import type { Season } from '../../types/title';

interface EpisodesPanelProps {
  slug: string;
  seasons: Season[];
}

/** The canonical series hub: season switching is real, and so is progress. */
export function EpisodesPanel({ slug, seasons }: EpisodesPanelProps) {
  const [seasonNumber, setSeasonNumber] = React.useState(seasons[0]?.number ?? 1);
  const season = seasons.find((s) => s.number === seasonNumber) ?? seasons[0];

  if (!season) return null;

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label="Seasons"
        className="flex gap-1 overflow-x-auto rounded-full border border-white/10 p-1">
        
        {seasons.map((s) =>
        <button
          key={s.number}
          role="tab"
          type="button"
          aria-selected={s.number === seasonNumber}
          onClick={() => setSeasonNumber(s.number)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance ${
          s.number === seasonNumber ?
          'bg-white text-ink-950' :
          'text-mist-300 hover:text-white'}`
          }>
          
            {s.name}
            <span className="ml-1.5 text-[10px] opacity-70">{s.episodes.length}</span>
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {season.episodes.map((ep) =>
        <li key={ep.id}>
            <Link
            to={`/watch/${slug}?ep=${ep.id}`}
            className="group flex gap-3 rounded-2xl border border-white/5 bg-ink-900 p-2.5 transition-colors duration-150 ease-entrance hover:border-white/20 sm:gap-4 sm:p-3">
            
              <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl sm:w-44">
                <img src={ep.still} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 grid place-items-center bg-ink-950/40 opacity-0 transition-opacity duration-150 ease-entrance group-hover:opacity-100">
                  <PlayIcon className="h-7 w-7 fill-white text-white" aria-hidden="true" />
                </div>
                {typeof ep.progress === 'number' &&
              <span className="absolute inset-x-0 bottom-0 h-1 bg-ink-950/70">
                    <span
                  className="block h-full bg-brand-indigo"
                  style={{ width: `${ep.progress}%` }} />
                
                  </span>
              }
              </div>

              <div className="min-w-0 flex-1 py-0.5">
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-white">
                  <span className="text-mist-400">{ep.number}.</span>
                  {ep.name}
                  {ep.watched &&
                <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-cyan">
                      <CheckIcon className="h-3 w-3" aria-hidden="true" />
                      Watched
                    </span>
                }
                </p>
                <p className="mt-0.5 text-[11px] text-mist-400">{ep.runtime}</p>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-mist-300">
                  {ep.synopsis}
                </p>
                {typeof ep.progress === 'number' &&
              <p className="mt-1 text-[11px] font-semibold text-brand-cyan">
                    {ep.progress}% watched — resume
                  </p>
              }
              </div>
            </Link>
          </li>
        )}
      </ul>
    </div>);

}