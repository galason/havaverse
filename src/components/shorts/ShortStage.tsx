import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GaugeIcon,
  HeartIcon,
  InfoIcon,
  LoaderIcon,
  MapPinnedIcon,
  MaximizeIcon,
  PauseIcon,
  PlayIcon,
  SparklesIcon,
  SubtitlesIcon,
  Volume2Icon,
  VolumeXIcon } from
'lucide-react';
import type { Short } from '../../types/shorts';
import type { ShortPlayback } from '../../hooks/useShortPlayback';
import { formatShortTime } from '../../hooks/useShortPlayback';

interface ShortStageProps {
  short: Short;
  playback: ShortPlayback;
  liked: boolean;
  onLike: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onProvenance: () => void;
}

/**
 * The vertical theatre. Chrome retreats while the Short plays and returns on
 * intent — pointer movement, focus or keyboard.
 */
export function ShortStage({
  short,
  playback,
  liked,
  onLike,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onProvenance
}: ShortStageProps) {
  const [chrome, setChrome] = React.useState(true);
  const [burst, setBurst] = React.useState(false);
  const [rateOpen, setRateOpen] = React.useState(false);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const idle = React.useRef<number>();
  const lastTap = React.useRef(0);

  const wake = React.useCallback(() => {
    setChrome(true);
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => setChrome(false), 2600);
  }, []);

  React.useEffect(() => {
    wake();
    return () => window.clearTimeout(idle.current);
  }, [wake, short.slug]);

  function handleStageTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) onLike();
      setBurst(true);
      window.setTimeout(() => setBurst(false), 550);
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
    window.setTimeout(() => {
      if (lastTap.current !== 0) {
        playback.toggle();
        lastTap.current = 0;
      }
    }, 260);
  }

  async function fullscreen() {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) await document.exitFullscreen();else
    await el.requestFullscreen().catch(() => undefined);
  }

  const blocked = !short.rights.watch;

  return (
    <div
      ref={frameRef}
      onPointerMove={wake}
      onFocus={wake}
      className="theme-dark relative mx-auto aspect-[9/16] w-full max-w-[26rem] overflow-hidden rounded-2xl border border-white/10 bg-ink-900 lg:max-w-[27rem]">
      
      <img
        src={short.poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: blocked ? 'blur(18px) brightness(0.4)' : undefined }} />
      
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.92)_0%,rgb(var(--c-ink-950)/0.1)_42%,rgb(var(--c-ink-950)/0)_62%,rgb(var(--c-ink-950)/0.55)_100%)]" />

      {blocked ?
      <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <MapPinnedIcon className="mx-auto h-7 w-7 text-brand-amber" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-bold text-white">Not available in your region</h2>
            <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-mist-300">
              {short.rights.restrictionNote}
            </p>
            <Link
            to="/shorts"
            className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-xs font-bold text-ink-950">
            
              Back to your feed
            </Link>
          </div>
        </div> :

      <>
          <button
          type="button"
          onClick={handleStageTap}
          aria-label={playback.playing ? 'Pause' : 'Play'}
          className="absolute inset-0 cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-indigo" />
        

          {playback.buffering &&
        <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <LoaderIcon
            className="h-7 w-7 animate-spin text-white/80 motion-reduce:animate-none"
            aria-hidden="true" />
          
              <span className="sr-only">Buffering</span>
            </span>
        }

          {!playback.playing && !playback.buffering &&
        <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-black/55 backdrop-blur-sm">
                <PlayIcon className="h-5 w-5 fill-current text-white" aria-hidden="true" />
              </span>
            </span>
        }

          {burst &&
        <span className="pointer-events-none absolute inset-0 grid place-items-center motion-reduce:hidden">
              <HeartIcon className="h-20 w-20 animate-ping fill-live text-live" aria-hidden="true" />
            </span>
        }

          {/* provenance */}
          {short.provenance &&
        <button
          type="button"
          onClick={onProvenance}
          className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-brand-violet/40 bg-black/55 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm transition-colors duration-150 ease-entrance hover:border-brand-violet">
          
              <SparklesIcon className="h-3 w-3 text-brand-violet" aria-hidden="true" />
              Made with HavaVerse AI
              <InfoIcon className="h-3 w-3 text-mist-400" aria-hidden="true" />
            </button>
        }

          <button
          type="button"
          onClick={fullscreen}
          aria-label="Fullscreen"
          className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white transition-colors duration-150 ease-entrance hover:bg-black/75">
          
            <MaximizeIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          {/* caption line */}
          {playback.captions &&
        <p className="pointer-events-none absolute inset-x-4 bottom-[4.5rem] text-center text-sm font-medium leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              {short.story.split('. ')[0]}…
            </p>
        }

          {/* transport */}
          <div
          className={`absolute inset-x-0 bottom-0 px-3 pb-3 transition-opacity duration-200 ease-entrance ${
          chrome ? 'opacity-100' : 'opacity-0'}`
          }>
          
            <div className="flex items-center gap-2">
              <button
              type="button"
              onClick={playback.toggle}
              aria-label={playback.playing ? 'Pause' : 'Play'}
              className="shrink-0 rounded-full p-1.5 text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
                {playback.playing ?
              <PauseIcon className="h-4 w-4 fill-current" aria-hidden="true" /> :

              <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
              }
              </button>

              <input
              type="range"
              min={0}
              max={short.durationSeconds}
              step={0.5}
              value={playback.elapsed}
              onChange={(e) => playback.seek(Number(e.target.value))}
              aria-label="Seek"
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/25 accent-white" />
            

              <span className="shrink-0 text-[10px] font-semibold tabular-nums text-mist-200">
                {formatShortTime(playback.elapsed)} / {formatShortTime(short.durationSeconds)}
              </span>

              <button
              type="button"
              onClick={() => playback.setMuted(!playback.muted)}
              aria-label={playback.muted ? 'Unmute' : 'Mute'}
              className="shrink-0 rounded-full p-1.5 text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
                {playback.muted ?
              <VolumeXIcon className="h-3.5 w-3.5" aria-hidden="true" /> :

              <Volume2Icon className="h-3.5 w-3.5" aria-hidden="true" />
              }
              </button>

              <button
              type="button"
              onClick={() => playback.setCaptions(!playback.captions)}
              aria-pressed={playback.captions}
              aria-label="Captions"
              className={`shrink-0 rounded-full p-1.5 transition-colors duration-150 ease-entrance hover:bg-white/10 ${
              playback.captions ? 'text-white' : 'text-mist-400'}`
              }>
              
                <SubtitlesIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              <div className="relative shrink-0">
                <button
                type="button"
                onClick={() => setRateOpen((v) => !v)}
                aria-expanded={rateOpen}
                aria-label="Playback speed"
                className="flex items-center gap-1 rounded-full p-1.5 text-[10px] font-bold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
                
                  <GaugeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {playback.rate}x
                </button>
                {rateOpen &&
              <ul className="absolute bottom-9 right-0 z-20 overflow-hidden rounded-xl border border-white/10 bg-ink-850 py-1">
                    {[0.5, 1, 1.5, 2].map((r) =>
                <li key={r}>
                        <button
                    type="button"
                    onClick={() => {
                      playback.setRate(r);
                      setRateOpen(false);
                    }}
                    className={`block w-full px-4 py-1.5 text-left text-[11px] font-semibold transition-colors duration-150 ease-entrance hover:bg-ink-800 ${
                    playback.rate === r ? 'text-white' : 'text-mist-300'}`
                    }>
                    
                          {r}x
                        </button>
                      </li>
                )}
                  </ul>
              }
              </div>
            </div>
          </div>
        </>
      }

      {/* vertical navigation */}
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label="Previous Short"
        className={`absolute -left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 bg-ink-850 p-2.5 text-white transition-colors duration-150 ease-entrance lg:block ${
        hasPrevious ? 'hover:border-white/40' : 'cursor-not-allowed opacity-30'}`
        }>
        
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Next Short"
        className={`absolute -right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 bg-ink-850 p-2.5 text-white transition-colors duration-150 ease-entrance lg:block ${
        hasNext ? 'hover:border-white/40' : 'cursor-not-allowed opacity-30'}`
        }>
        
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>);

}