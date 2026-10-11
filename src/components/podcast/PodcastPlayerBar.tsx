import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GemIcon,
  HeartHandshakeIcon,
  MessagesSquareIcon,
  PauseIcon,
  PlayIcon,
  RadioTowerIcon,
  RotateCcwIcon,
  RotateCwIcon,
  ScrollTextIcon,
  UsersIcon } from
'lucide-react';
import { hosts, shows } from '../../data/podcast';
import { formatClock, speeds, usePodcast } from '../../contexts/PodcastContext';
import { useMusic } from '../../contexts/MusicContext';
import { podcastOwnsBar } from '../../utils/playerPriority';
import { Waveform } from '../music/Waveform';

/** Keeps page content clear of the fixed bar once something is playing. */
export function PodcastSpacer() {
  const { current, playing } = usePodcast();
  const music = useMusic();
  return podcastOwnsBar(
    { loaded: Boolean(music.current), playing: music.playing },
    { loaded: Boolean(current), playing }
  ) ?
  <div className="h-20" aria-hidden="true" /> :
  null;
}

/**
 * The player is the gateway to the ecosystem. Transport is the smaller half
 * of it; the rest is where this conversation leads.
 */
export function PodcastPlayerBar() {
  const {
    current,
    playing,
    elapsed,
    speed,
    setSpeed,
    toggle,
    seek,
    skip,
    expanded,
    setExpanded,
    isSaved,
    toggleSave
  } = usePodcast();
  const music = useMusic();

  if (
  !current ||
  !podcastOwnsBar(
    { loaded: Boolean(music.current), playing: music.playing },
    { loaded: true, playing }
  ))

  return null;

  const show = shows.find((s) => s.id === current.showId);
  const host = hosts.find((h) => h.id === show?.hostId);
  const progress = elapsed / current.durationSeconds;
  const saved = isSaved(current.id);

  const portals = [
  { icon: ScrollTextIcon, label: 'Transcript', to: `/podcast/episode/${current.id}` },
  {
    icon: MessagesSquareIcon,
    label: 'Discuss',
    to: show ? `/community/${show.communitySlug}` : '/communities'
  },
  ...(current.collectionId ?
  [{ icon: GemIcon, label: 'Collect', to: `/podcast/drop/${current.collectionId}` }] :
  []),
  ...(current.liveEventId ?
  [{ icon: RadioTowerIcon, label: 'Attend live', to: `/podcast/live/${current.liveEventId}` }] :
  []),
  ...(current.relatedStory ?
  [{ icon: UsersIcon, label: 'Explore story', to: current.relatedStory.to }] :
  [])];


  const nextSpeed = () => {
    const index = speeds.indexOf(speed);
    setSpeed(speeds[(index + 1) % speeds.length]);
  };

  return (
    <div className="theme-dark fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/95 backdrop-blur">
      {expanded &&
      <div className="mx-auto max-w-5xl px-4 pt-5 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
            <img
            src={current.artwork}
            alt=""
            className="hidden aspect-square w-full rounded-2xl object-cover sm:block" />
          
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">
                {show?.title} · S{String(current.season).padStart(2, '0')} E
                {String(current.number).padStart(2, '0')}
              </p>
              <h2 className="mt-1 text-xl font-bold leading-tight tracking-tight text-white">
                {current.title}
              </h2>
              {host &&
            <Link
              to={`/podcast/creator/${host.id}`}
              className="text-sm text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
              
                  {host.name} · {host.city}
                </Link>
            }

              <div className="mt-4 h-12">
                <Waveform seed={current.id} progress={progress} bars={72} />
              </div>

              <ul className="mt-4 flex flex-wrap gap-2">
                {portals.map((portal) => {
                const Icon = portal.icon;
                return (
                  <li key={portal.label}>
                      <Link
                      to={portal.to}
                      className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:border-brand-cyan hover:text-white">
                      
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {portal.label}
                      </Link>
                    </li>);

              })}
                {host &&
              <li>
                    <Link
                  to={`/podcast/creator/${host.id}?panel=support`}
                  className="flex items-center gap-1.5 rounded-full bg-brand-violet px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
                  
                      <HeartHandshakeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Support {host.name}
                    </Link>
                  </li>
              }
              </ul>
            </div>
          </div>
        </div>
      }

      <div className="mx-auto flex max-w-[1800px] items-center gap-3 px-3 py-2.5 sm:px-4">
        <Link to={`/podcast/episode/${current.id}`} className="shrink-0">
          <img src={current.artwork} alt="" className="h-11 w-11 rounded-lg object-cover" />
        </Link>

        <div className="w-32 min-w-0 shrink-0 sm:w-52">
          <p className="truncate text-xs font-semibold text-white">{current.title}</p>
          <p className="truncate text-[11px] text-mist-400">
            {show?.title} · S{String(current.season).padStart(2, '0')} E
            {String(current.number).padStart(2, '0')}
          </p>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => skip(-15)}
              aria-label="Back 15 seconds"
              className="rounded-lg p-1.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
              
              <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
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
              onClick={() => skip(30)}
              aria-label="Forward 30 seconds"
              className="rounded-lg p-1.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
              
              <RotateCwIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <span className="hidden w-12 shrink-0 text-right text-[11px] tabular-nums text-mist-400 sm:block">
            {formatClock(elapsed)}
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

          <span className="hidden w-12 shrink-0 text-[11px] tabular-nums text-mist-400 sm:block">
            {formatClock(current.durationSeconds)}
          </span>
        </div>

        <button
          type="button"
          onClick={nextSpeed}
          aria-label={`Playback speed, currently ${speed} times`}
          className="hidden shrink-0 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold tabular-nums text-mist-300 transition-colors duration-150 ease-entrance hover:text-white sm:block">
          
          {speed}x
        </button>

        <button
          type="button"
          onClick={() => toggleSave(current.id)}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved' : 'Save episode'}
          className={`hidden shrink-0 rounded-lg p-1.5 transition-colors duration-150 ease-entrance sm:block ${
          saved ? 'text-brand-amber' : 'text-mist-400 hover:text-white'}`
          }>
          
          <BookmarkIcon className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} aria-hidden="true" />
        </button>

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