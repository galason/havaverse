import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheckIcon, HeadphonesIcon, PlayIcon, UsersIcon } from 'lucide-react';
import { artists, tracks } from '../../data/music';
import { useMusic } from '../../contexts/MusicContext';
import { Waveform } from './Waveform';

/**
 * Editorial, not "Made for you". The hero states what is happening in the
 * culture right now and gives three ways into it.
 */
export function MusicHero() {
  const { play, current, playing, toggle } = useMusic();
  const track = tracks[0];
  const artist = artists.find((a) => a.id === track.artistId)!;
  const active = current?.id === track.id;

  return (
    <section
      aria-label="Featured release"
      className="relative overflow-hidden rounded-2xl border border-white/5">
      
      <img
        src={track.artwork}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-right" />
      
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--c-ink-950)/0.97)_6%,rgb(var(--c-ink-950)/0.6)_52%,rgb(var(--c-ink-950)/0.15)_100%)]" />

      <div className="relative flex min-h-[320px] max-w-xl flex-col justify-end p-5 sm:min-h-[420px] sm:p-8">
        <span className="w-fit rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-100 backdrop-blur">
          Original HavaVerse Music
        </span>

        <h1 className="mt-3 font-display text-5xl uppercase leading-[0.9] tracking-tight text-white sm:text-7xl">
          {track.title}
        </h1>
        <p className="mt-2 text-base text-mist-200 sm:text-lg">{artist.tagline}</p>

        <div className="mt-4 flex items-center gap-2.5">
          <Link to={`/music/artist/${artist.id}`} className="shrink-0">
            <img src={artist.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
          </Link>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <Link
                to={`/music/artist/${artist.id}`}
                className="transition-colors duration-150 ease-entrance hover:text-brand-violet">
                
                {artist.name}
              </Link>
              {artist.verified &&
              <BadgeCheckIcon className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />
              }
            </p>
            <p className="text-[11px] text-mist-400">
              Afrobeats · {track.language} · {artist.city}
            </p>
          </div>
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-mist-300">
          <span className="flex items-center gap-1">
            <HeadphonesIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {artist.listeners} listeners
          </span>
          <span className="flex items-center gap-1">
            <UsersIcon className="h-3.5 w-3.5" aria-hidden="true" />
            18.4K in the community
          </span>
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => active ? toggle() : play(track, tracks)}
            className="flex items-center gap-2 rounded-full bg-brand-violet px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
            
            <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            {active && playing ? 'Playing now' : 'Play now'}
          </button>
          <Link
            to={`/music/world/${track.worldId}`}
            className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
            Explore world
          </Link>
          <Link
            to={`/music/artist/${artist.id}?panel=support`}
            className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
            Support creator
          </Link>
        </div>

        <div className="mt-5 hidden h-10 max-w-md sm:block">
          <Waveform seed={track.id} progress={active ? 0.35 : 0} />
        </div>
      </div>
    </section>);

}