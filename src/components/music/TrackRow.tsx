import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { artists } from '../../data/music';
import { formatDuration, useMusic } from '../../contexts/MusicContext';
import type { Track } from '../../types/music';

interface TrackRowProps {
  track: Track;
  queue?: Track[];
  index?: number;
}

export function TrackRow({ track, queue, index }: TrackRowProps) {
  const { current, playing, play, toggle, isLiked, toggleLike } = useMusic();
  const artist = artists.find((a) => a.id === track.artistId);
  const active = current?.id === track.id;
  const liked = isLiked(track.id);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150 ease-entrance ${
      active ? 'bg-brand-violet/10' : 'hover:bg-white/5'}`
      }>
      
      {index !== undefined &&
      <span className="w-5 shrink-0 text-right text-[11px] tabular-nums text-mist-400">
          {index + 1}
        </span>
      }

      <button
        type="button"
        onClick={() => active ? toggle() : play(track, queue)}
        aria-label={active && playing ? `Pause ${track.title}` : `Play ${track.title}`}
        className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
        
        <img src={track.artwork} alt="" loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-150 ease-entrance hover:opacity-100 focus-visible:opacity-100">
          {active && playing ?
          <PauseIcon className="h-4 w-4 fill-white text-white" aria-hidden="true" /> :

          <PlayIcon className="h-4 w-4 fill-white text-white" aria-hidden="true" />
          }
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <Link
          to={`/music/track/${track.id}`}
          className={`block truncate text-sm font-semibold transition-colors duration-150 ease-entrance hover:text-brand-violet ${
          active ? 'text-brand-violet' : 'text-white'}`
          }>
          
          {track.title}
        </Link>
        <p className="truncate text-[11px] text-mist-400">
          {artist &&
          <Link
            to={`/music/artist/${artist.id}`}
            className="transition-colors duration-150 ease-entrance hover:text-white">
            
              {artist.name}
            </Link>
          }
          {' · '}
          {track.releaseKind}
        </p>
      </div>

      <span className="hidden shrink-0 text-[11px] tabular-nums text-mist-400 sm:block">
        {track.plays} plays
      </span>

      <button
        type="button"
        onClick={() => toggleLike(track.id)}
        aria-pressed={liked}
        aria-label={liked ? `Unlike ${track.title}` : `Like ${track.title}`}
        className={`shrink-0 rounded-lg p-1.5 transition-colors duration-150 ease-entrance ${
        liked ? 'text-brand-magenta' : 'text-mist-400 hover:text-white'}`
        }>
        
        <HeartIcon className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} aria-hidden="true" />
      </button>

      <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-mist-400">
        {formatDuration(track.durationSeconds)}
      </span>
    </div>);

}