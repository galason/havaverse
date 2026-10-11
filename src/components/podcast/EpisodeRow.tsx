import React from 'react';
import { Link } from 'react-router-dom';
import { BookmarkIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { shows } from '../../data/podcast';
import { formatClock, usePodcast } from '../../contexts/PodcastContext';
import type { Episode } from '../../types/podcast';

interface EpisodeRowProps {
  episode: Episode;
  /** Shows the resume bar when the listener is part-way through. */
  showProgress?: boolean;
}

export function EpisodeRow({ episode, showProgress = false }: EpisodeRowProps) {
  const { current, playing, play, toggle, isSaved, toggleSave, progressFor } = usePodcast();
  const show = shows.find((s) => s.id === episode.showId);
  const active = current?.id === episode.id;
  const saved = isSaved(episode.id);
  const progress = progressFor(episode.id);

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150 ease-entrance ${
      active ? 'bg-white/5' : 'hover:bg-white/5'}`
      }>
      
      <button
        type="button"
        onClick={() => active ? toggle() : play(episode)}
        aria-label={active && playing ? `Pause ${episode.title}` : `Play ${episode.title}`}
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
        
        <img src={episode.artwork} alt="" className="h-full w-full object-cover" />
        <span
          className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-150 ease-entrance group-hover:opacity-100 ${
          active ? 'opacity-100' : 'opacity-0'}`
          }>
          
          {active && playing ?
          <PauseIcon className="h-4 w-4 fill-white text-white" aria-hidden="true" /> :

          <PlayIcon className="h-4 w-4 fill-white text-white" aria-hidden="true" />
          }
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <Link
          to={`/podcast/episode/${episode.id}`}
          className={`block truncate text-sm font-semibold transition-colors duration-150 ease-entrance ${
          active ? 'text-brand-cyan' : 'text-white hover:text-brand-cyan'}`
          }>
          
          {episode.title}
        </Link>
        <p className="truncate text-[11px] text-mist-400">
          {show?.title} · S{String(episode.season).padStart(2, '0')} E
          {String(episode.number).padStart(2, '0')} · {Math.round(episode.durationSeconds / 60)} min
        </p>
        {showProgress && progress > 0.01 &&
        <div className="mt-1.5 flex items-center gap-2">
            <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
              <span
              style={{ width: `${Math.round(progress * 100)}%` }}
              className="block h-full rounded-full bg-brand-cyan" />
            
            </span>
            <span className="shrink-0 text-[10px] tabular-nums text-mist-400">
              {formatClock(Math.round(episode.durationSeconds * (1 - progress)))} left
            </span>
          </div>
        }
      </div>

      <button
        type="button"
        onClick={() => toggleSave(episode.id)}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved' : 'Save episode'}
        className={`shrink-0 rounded-lg p-1.5 transition-colors duration-150 ease-entrance ${
        saved ? 'text-brand-amber' : 'text-mist-400 hover:text-white'}`
        }>
        
        <BookmarkIcon className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} aria-hidden="true" />
      </button>
    </div>);

}