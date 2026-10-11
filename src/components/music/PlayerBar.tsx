import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GemIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  RadioTowerIcon,
  ScrollTextIcon,
  SkipBackIcon,
  SkipForwardIcon,
  UsersIcon } from
'lucide-react';
import { artists } from '../../data/music';
import { formatDuration, useMusic } from '../../contexts/MusicContext';
import { usePodcast } from '../../contexts/PodcastContext';
import { musicOwnsBar } from '../../utils/playerPriority';
import { Waveform } from './Waveform';

/**
 * The player is a portal, not a transport bar. Collapsed it stays out of the
 * way; expanded it opens the ecosystem behind whatever is playing.
 */
/** Keeps page content clear of the fixed bar once something is playing. */
export function PlayerSpacer() {
  const { current, playing } = useMusic();
  const podcast = usePodcast();
  // Only one bar is ever mounted, so only one spacer is ever needed.
  return musicOwnsBar(
    { loaded: Boolean(current), playing },
    { loaded: Boolean(podcast.current), playing: podcast.playing }
  ) ?
  <div className="h-20" aria-hidden="true" /> :
  null;
}

export function PlayerBar() {
  const {
    current,
    playing,
    elapsed,
    toggle,
    next,
    previous,
    seek,
    expanded,
    setExpanded,
    isLiked,
    toggleLike
  } = useMusic();
  const podcast = usePodcast();

  // Whichever source is genuinely playing owns the bar — one thing at a time.
  if (
  !musicOwnsBar(
    { loaded: Boolean(current), playing },
    { loaded: Boolean(podcast.current), playing: podcast.playing }
  ) ||
  !current)

  return null;

  const artist = artists.find((a) => a.id === current.artistId);
  const progress = elapsed / current.durationSeconds;
  const liked = isLiked(current.id);

  const portals = [
  { icon: UsersIcon, label: 'Community', to: `/community/afrobeats` },
  current.story ?
  { icon: ScrollTextIcon, label: 'Story', to: current.story.to } :
  { icon: ScrollTextIcon, label: 'Track', to: `/music/track/${current.id}` },
  { icon: GemIcon, label: 'Collect', to: `/music/track/${current.id}` },
  current.liveEventId ?
  { icon: RadioTowerIcon, label: 'Live', to: `/music/live/${current.liveEventId}` } :
  { icon: RadioTowerIcon, label: 'Live', to: '/music/live' }];


  return (
    <div className="theme-dark fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/95 backdrop-blur">
      {expanded &&
      <div className="mx-auto max-w-5xl px-4 pt-5 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-[200px_minmax(0,1fr)]">
            <img
            src={current.artwork}
            alt=""
            className="hidden aspect-square w-full rounded-2xl object-cover sm:block" />
          
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-violet">
                {current.releaseKind} · {current.language}
              </p>
              <h2 className="mt-1 truncate text-2xl font-bold tracking-tight text-white">
                {current.title}
              </h2>
              {artist &&
            <Link
              to={`/music/artist/${artist.id}`}
              className="text-sm text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
              
                  {artist.name} · {artist.city}
                </Link>
            }

              <div className="mt-4 h-14">
                <Waveform seed={current.id} progress={progress} bars={72} />
              </div>

              <ul className="mt-4 flex flex-wrap gap-2">
                {portals.map((portal) => {
                const Icon = portal.icon;
                return (
                  <li key={portal.label}>
                      <Link
                      to={portal.to}
                      className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:border-brand-violet hover:text-white">
                      
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {portal.label}
                      </Link>
                    </li>);

              })}
                {artist &&
              <li>
                    <Link
                  to={`/music/artist/${artist.id}?panel=support`}
                  className="rounded-full bg-brand-violet px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
                  
                      Support {artist.name}
                    </Link>
                  </li>
              }
              </ul>
            </div>
          </div>
        </div>
      }

      <div className="mx-auto flex max-w-[1800px] items-center gap-3 px-3 py-2.5 sm:px-4">
        <Link to={`/music/track/${current.id}`} className="shrink-0">
          <img src={current.artwork} alt="" className="h-11 w-11 rounded-lg object-cover" />
        </Link>

        <div className="min-w-0 w-32 shrink-0 sm:w-44">
          <p className="truncate text-xs font-semibold text-white">{current.title}</p>
          <p className="truncate text-[11px] text-mist-400">{artist?.name}</p>
        </div>

        <button
          type="button"
          onClick={() => toggleLike(current.id)}
          aria-pressed={liked}
          aria-label={liked ? 'Remove from liked' : 'Add to liked'}
          className={`hidden shrink-0 rounded-lg p-1.5 transition-colors duration-150 ease-entrance sm:block ${
          liked ? 'text-brand-magenta' : 'text-mist-400 hover:text-white'}`
          }>
          
          <HeartIcon className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} aria-hidden="true" />
        </button>

        <div className="flex flex-1 items-center gap-3">
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={previous}
              aria-label="Previous track"
              className="rounded-lg p-1.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
              
              <SkipBackIcon className="h-4 w-4 fill-current" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              className="rounded-full bg-brand-violet p-2.5 text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
              
              {playing ?
              <PauseIcon className="h-4 w-4 fill-current" aria-hidden="true" /> :

              <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
              }
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next track"
              className="rounded-lg p-1.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
              
              <SkipForwardIcon className="h-4 w-4 fill-current" aria-hidden="true" />
            </button>
          </div>

          <span className="hidden w-10 shrink-0 text-right text-[11px] tabular-nums text-mist-400 sm:block">
            {formatDuration(elapsed)}
          </span>

          <label className="hidden min-w-0 flex-1 sm:block">
            <span className="sr-only">Seek within {current.title}</span>
            <input
              type="range"
              min={0}
              max={current.durationSeconds}
              value={Math.floor(elapsed)}
              onChange={(event) => seek(Number(event.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-brand-violet" />
            
          </label>

          <span className="hidden w-10 shrink-0 text-[11px] tabular-nums text-mist-400 sm:block">
            {formatDuration(current.durationSeconds)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          
          {expanded ?
          <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden="true" /> :

          <ChevronUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
          }
          <span className="hidden sm:inline">{expanded ? 'Close' : 'Open'}</span>
        </button>
      </div>
    </div>);

}