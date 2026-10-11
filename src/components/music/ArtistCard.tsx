import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheckIcon, PlayIcon } from 'lucide-react';
import { tracks } from '../../data/music';
import { useApp } from '../../contexts/AppContext';
import { useMusic } from '../../contexts/MusicContext';
import type { Artist } from '../../types/music';

export function ArtistCard({ artist }: {artist: Artist;}) {
  const { isFollowing, toggleFollow } = useApp();
  const { play, hasSupported } = useMusic();

  const key = `artist:${artist.id}`;
  const following = isFollowing(key);
  const latest = tracks.find((t) => t.artistId === artist.id);
  const supported = hasSupported(artist.id);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/5 bg-ink-900 p-3.5">
      <div className="flex items-center gap-3">
        <Link to={`/music/artist/${artist.id}`} className="shrink-0">
          <img
            src={artist.avatar}
            alt=""
            loading="lazy"
            className="h-14 w-14 rounded-full object-cover" />
          
        </Link>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5">
            <Link
              to={`/music/artist/${artist.id}`}
              className="truncate text-sm font-bold text-white transition-colors duration-150 ease-entrance hover:text-brand-violet">
              
              {artist.name}
            </Link>
            {artist.verified &&
            <BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-brand-cyan" aria-hidden="true" />
            }
          </p>
          <p className="truncate text-[11px] text-mist-400">
            {artist.disciplines.split(' · ')[0]} · {artist.city}
          </p>
          <p className="truncate text-[11px] text-mist-400">
            {artist.listeners} listeners · {artist.supporters} supporters
          </p>
        </div>
      </div>

      {latest &&
      <p className="mt-2.5 truncate text-[11px] text-mist-400">
          Current ·{' '}
          <Link
          to={`/music/track/${latest.id}`}
          className="font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
          
            {latest.title}
          </Link>
        </p>
      }

      <div className="mt-auto flex gap-1.5 pt-3">
        <button
          type="button"
          onClick={() => latest && play(latest)}
          disabled={!latest}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-violet px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-mist-400">
          
          <PlayIcon className="h-3 w-3 fill-current" aria-hidden="true" />
          Listen
        </button>
        <button
          type="button"
          onClick={() => toggleFollow(key)}
          aria-pressed={following}
          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance ${
          following ?
          'border-white/20 text-mist-200 hover:text-white' :
          'border-white/15 text-mist-200 hover:border-white/35 hover:text-white'}`
          }>
          
          {following ? 'Following' : 'Follow'}
        </button>
        <Link
          to={`/music/artist/${artist.id}?panel=support`}
          className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition-colors duration-150 ease-entrance ${
          supported ?
          'bg-brand-cyan/15 text-brand-cyan' :
          'bg-white/10 text-white hover:bg-brand-magenta'}`
          }>
          
          {supported ? 'Supported' : 'Support'}
        </Link>
      </div>
    </article>);

}