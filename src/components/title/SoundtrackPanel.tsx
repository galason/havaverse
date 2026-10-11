import React from 'react';
import { Link } from 'react-router-dom';
import { MusicIcon, PauseIcon, PlayIcon } from 'lucide-react';
import type { Track } from '../../types/music';
import type { TitleSoundtrack } from '../../types/title';
import { musicApi } from '../../services/musicApi';
import { useMusic } from '../../contexts/MusicContext';
import { ErrorBlock, LoadingBlock } from '../community/StateBlocks';

interface SoundtrackPanelProps {
  soundtrack: TitleSoundtrack;
  worldId: string;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Plays through the real HavaVerse Music player, not a second one. */
export function SoundtrackPanel({ soundtrack, worldId }: SoundtrackPanelProps) {
  const { play, current, playing, toggle } = useMusic();
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [tracks, setTracks] = React.useState<Track[]>([]);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await musicApi.listTracks(worldId);
    if (!result.ok) {
      setStatus('error');
      return;
    }
    setTracks(result.data.slice(0, 4));
    setStatus('ready');
  }, [worldId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <section
      aria-labelledby="soundtrack-heading"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <h2
        id="soundtrack-heading"
        className="flex items-center gap-2 text-sm font-bold text-white">
        
        <MusicIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        {soundtrack.name}
      </h2>
      <p className="mt-0.5 text-[11px] text-mist-400">
        {soundtrack.composer} · {soundtrack.trackCount} · {soundtrack.duration}
      </p>

      <div className="mt-3">
        {status === 'loading' && <LoadingBlock label="Loading score" />}
        {status === 'error' &&
        <ErrorBlock message="The score could not be loaded." onRetry={load} />
        }
        {status === 'ready' && tracks.length === 0 &&
        <p className="text-[11px] text-mist-400">No recordings published yet.</p>
        }
        {status === 'ready' &&
        <ol className="space-y-0.5">
            {tracks.map((track, index) => {
            const isCurrent = current?.id === track.id;
            return (
              <li key={track.id}>
                  <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors duration-150 ease-entrance hover:bg-ink-850">
                    <button
                    type="button"
                    onClick={() => isCurrent ? toggle() : play(track, tracks)}
                    aria-label={isCurrent && playing ? 'Pause' : `Play ${track.title}`}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-indigo text-white">
                    
                      {isCurrent && playing ?
                    <PauseIcon className="h-3 w-3 fill-current" aria-hidden="true" /> :

                    <PlayIcon className="h-3 w-3 fill-current" aria-hidden="true" />
                    }
                    </button>
                    <span className="w-3 shrink-0 text-[11px] text-mist-400">{index + 1}</span>
                    <span
                    className={`min-w-0 flex-1 truncate text-xs font-semibold ${
                    isCurrent ? 'text-brand-cyan' : 'text-white'}`
                    }>
                    
                      {track.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-mist-400">
                      {clock(track.durationSeconds)}
                    </span>
                  </div>
                </li>);

          })}
          </ol>
        }
      </div>

      <Link
        to={soundtrack.to}
        className="mt-3 inline-block text-[11px] font-semibold text-brand-indigo">
        
        View full soundtrack →
      </Link>
    </section>);

}