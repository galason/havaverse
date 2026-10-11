import React from 'react';
import {
  CaptionsIcon,
  LoaderIcon,
  MaximizeIcon,
  MinimizeIcon,
  PauseIcon,
  PictureInPicture2Icon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  SettingsIcon,
  SparklesIcon,
  UsersIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon } from
'lucide-react';
import type { Chapter, PlayerStatus, WatchAsset } from '../../types/watch';
import { formatTime } from '../../hooks/usePlayback';
import { SettingsMenu } from './SettingsMenu';

interface Settings {
  quality: string;
  audio: string;
  subtitle: string;
  autoplay: boolean;
}

interface VideoStageProps {
  asset: WatchAsset;
  titleName: string;
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  buffered: number;
  rate: number;
  volume: number;
  muted: boolean;
  settings: Settings;
  miniPlayer: boolean;
  onToggle: () => void;
  onSeek: (seconds: number, note?: string) => void;
  onSkip: (delta: number) => void;
  onRate: (rate: number) => void;
  onVolume: (v: number) => void;
  onMuted: (m: boolean) => void;
  onSettings: (next: Partial<Settings>) => void;
  onMiniPlayer: (on: boolean) => void;
  onAskAi: () => void;
  onWatchParty: () => void;
  partyActive: boolean;
}

export function VideoStage({
  asset,
  titleName,
  status,
  currentTime,
  duration,
  buffered,
  rate,
  volume,
  muted,
  settings,
  miniPlayer,
  onToggle,
  onSeek,
  onSkip,
  onRate,
  onVolume,
  onMuted,
  onSettings,
  onMiniPlayer,
  onAskAi,
  onWatchParty,
  partyActive
}: VideoStageProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const barRef = React.useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = React.useState(true);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [hover, setHover] = React.useState<{x: number;seconds: number;} | null>(null);
  const idleTimer = React.useRef<number | null>(null);

  const playing = status === 'playing';
  const pct = duration > 0 ? currentTime / duration * 100 : 0;
  const bufferedPct = duration > 0 ? buffered / duration * 100 : 0;

  /* ------------------------------------------------------ control visibility */

  const wake = React.useCallback(() => {
    setControlsVisible(true);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (playing && !settingsOpen) setControlsVisible(false);
    }, 2600);
  }, [playing, settingsOpen]);

  React.useEffect(() => {
    wake();
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [wake, status]);

  /* ---------------------------------------------------------------- keyboard */

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          onToggle();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onSkip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          onSkip(10);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          onMuted(!muted);
          break;
        case 'c':
          onSettings({ subtitle: settings.subtitle === 'off' ? asset.subtitles[0]?.id ?? 'off' : 'off' });
          break;
        default:
          return;
      }
      wake();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onToggle, onSkip, onMuted, muted, settings.subtitle, asset.subtitles, wake, onSettings]);

  /* -------------------------------------------------------------- fullscreen */

  function toggleFullscreen() {
    const node = stageRef.current;
    if (!node) return;
    if (!document.fullscreenElement) {
      node.requestFullscreen?.().catch(() => undefined);
    } else {
      document.exitFullscreen?.().catch(() => undefined);
    }
  }

  React.useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  /* ---------------------------------------------------------------- timeline */

  function seekFromEvent(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration, 'timeline');
  }

  function hoverFromEvent(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(rect.width, Math.max(0, e.clientX - rect.left));
    setHover({ x, seconds: x / rect.width * duration });
  }

  const hoverChapter: Chapter | undefined = hover ?
  [...asset.chapters].reverse().find((c) => c.startSeconds <= hover.seconds) :
  undefined;

  const activeChapter = [...asset.chapters].reverse().find((c) => c.startSeconds <= currentTime);

  const VolumeIcon = muted || volume === 0 ? VolumeXIcon : volume < 0.5 ? Volume1Icon : Volume2Icon;

  return (
    <div
      ref={stageRef}
      onMouseMove={wake}
      onMouseLeave={() => playing && !settingsOpen && setControlsVisible(false)}
      className={`group relative overflow-hidden bg-black ${
      miniPlayer ?
      'fixed bottom-4 right-4 z-40 w-[340px] rounded-xl border border-white/10 shadow-2xl' :
      'rounded-2xl'}`
      }>
      
      <img
        src={asset.backdrop}
        alt=""
        className={`aspect-video w-full object-cover transition-opacity duration-300 ease-entrance ${
        playing ? 'opacity-100' : 'opacity-80'}`
        } />
      

      {/* Click surface — tap to play/pause, double-tap edges to skip. */}
      <button
        type="button"
        onClick={onToggle}
        onDoubleClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSkip(e.clientX - rect.left < rect.width / 2 ? -10 : 10);
        }}
        className="absolute inset-0 cursor-default focus:outline-none"
        aria-label={playing ? 'Pause' : 'Play'} />
      

      {(status === 'loading' || status === 'buffering') &&
      <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/40">
          <LoaderIcon className="h-8 w-8 animate-spin text-white/80" aria-hidden="true" />
          <span className="sr-only">
            {status === 'loading' ? 'Loading' : 'Buffering'}
          </span>
        </div>
      }

      {!playing && status !== 'loading' && status !== 'ended' &&
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-black/55 backdrop-blur-sm">
            <PlayIcon className="ml-1 h-7 w-7 fill-white text-white" aria-hidden="true" />
          </span>
        </div>
      }

      {/* Top chrome */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 flex items-start gap-3 bg-gradient-to-b from-black/70 to-transparent p-3 transition-opacity duration-200 ease-entrance sm:p-4 ${
        controlsVisible ? 'opacity-100' : 'opacity-0'}`
        }>
        
        <p className="text-xs font-semibold text-white sm:text-sm">{titleName}</p>
        {activeChapter &&
        <p className="hidden text-xs text-white/60 sm:block">{activeChapter.label}</p>
        }
        <div className="pointer-events-auto ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onWatchParty}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm transition-colors duration-150 ease-entrance ${
            partyActive ?
            'bg-brand-indigo text-white' :
            'bg-black/50 text-white hover:bg-black/70'}`
            }>
            
            <UsersIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {partyActive ? 'Party live' : 'Watch party'}
          </button>
          <button
            type="button"
            onClick={() => onMiniPlayer(!miniPlayer)}
            aria-label={miniPlayer ? 'Exit mini player' : 'Mini player'}
            className="grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors duration-150 ease-entrance hover:bg-black/70">
            
            <PictureInPicture2Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Bottom chrome */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-3 pt-10 transition-opacity duration-200 ease-entrance sm:px-4 sm:pb-4 ${
        controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`
        }>
        
        {/* Timeline */}
        <div className="relative">
          {hover && hoverChapter &&
          <div
            className="pointer-events-none absolute bottom-5 z-10 w-36 -translate-x-1/2 overflow-hidden rounded-lg border border-white/15 bg-ink-950"
            style={{ left: `${hover.x}px` }}>
            
              {hoverChapter.still &&
            <img src={hoverChapter.still} alt="" className="aspect-video w-full object-cover" />
            }
              <p className="truncate px-2 pt-1 text-[10px] font-semibold text-white">
                {hoverChapter.label}
              </p>
              <p className="px-2 pb-1 text-[10px] tabular-nums text-white/60">
                {formatTime(hover.seconds)}
              </p>
            </div>
          }

          <div
            ref={barRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            onClick={seekFromEvent}
            onMouseMove={hoverFromEvent}
            onMouseLeave={() => setHover(null)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') onSkip(10);
              if (e.key === 'ArrowLeft') onSkip(-10);
            }}
            className="group/bar relative h-5 cursor-pointer">
            
            <div className="absolute inset-x-0 top-2 h-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-white/25" style={{ width: `${bufferedPct}%` }} />
            </div>
            <div
              className="absolute top-2 h-1 rounded-full bg-brand-indigo"
              style={{ width: `${pct}%` }} />
            
            {/* Chapter markers */}
            {asset.chapters.slice(1).map((chapter) =>
            <span
              key={chapter.id}
              title={chapter.label}
              className="absolute top-[7px] h-1.5 w-0.5 rounded-full bg-white/70"
              style={{ left: `${chapter.startSeconds / duration * 100}%` }} />

            )}
            <span
              className="absolute top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-white opacity-0 transition-opacity duration-150 ease-entrance group-hover/bar:opacity-100"
              style={{ left: `${pct}%` }} />
            
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onToggle}
            aria-label={playing ? 'Pause' : 'Play'}
            className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
            {playing ?
            <PauseIcon className="h-5 w-5 fill-current" aria-hidden="true" /> :

            <PlayIcon className="h-5 w-5 fill-current" aria-hidden="true" />
            }
          </button>
          <button
            type="button"
            onClick={() => onSkip(-10)}
            aria-label="Back 10 seconds"
            className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
            <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onSkip(10)}
            aria-label="Forward 10 seconds"
            className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
            <RotateCwIcon className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="group/vol flex items-center">
            <button
              type="button"
              onClick={() => onMuted(!muted)}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
              <VolumeIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                onVolume(Number(e.target.value));
                onMuted(false);
              }}
              aria-label="Volume"
              className="h-1 w-0 cursor-pointer accent-white opacity-0 transition-[width,opacity] duration-200 ease-entrance group-hover/vol:w-16 group-hover/vol:opacity-100 focus:w-16 focus:opacity-100" />
            
          </div>

          <p className="ml-1 text-[11px] tabular-nums text-white/85 sm:text-xs">
            {formatTime(currentTime)} <span className="text-white/45">/ {formatTime(duration)}</span>
          </p>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={onAskAi}
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10 sm:flex">
              
              <SparklesIcon className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />
              Hava AI
            </button>
            <button
              type="button"
              onClick={() =>
              onSettings({
                subtitle: settings.subtitle === 'off' ? asset.subtitles[0]?.id ?? 'off' : 'off'
              })
              }
              aria-label="Subtitles"
              aria-pressed={settings.subtitle !== 'off'}
              className={`grid h-9 w-9 place-items-center rounded-full transition-colors duration-150 ease-entrance hover:bg-white/10 ${
              settings.subtitle !== 'off' ? 'text-brand-cyan' : 'text-white'}`
              }>
              
              <CaptionsIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                aria-label="Playback settings"
                aria-expanded={settingsOpen}
                className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
                
                <SettingsIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              {settingsOpen &&
              <SettingsMenu
                asset={asset}
                settings={settings}
                rate={rate}
                onRate={onRate}
                onSettings={onSettings}
                onClose={() => setSettingsOpen(false)} />

              }
            </div>
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
              {fullscreen ?
              <MinimizeIcon className="h-4 w-4" aria-hidden="true" /> :

              <MaximizeIcon className="h-4 w-4" aria-hidden="true" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>);

}