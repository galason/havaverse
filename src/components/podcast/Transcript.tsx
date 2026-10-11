import React from 'react';
import { formatClock, usePodcast } from '../../contexts/PodcastContext';
import type { Episode } from '../../types/podcast';

/**
 * The transcript follows playback and can be jumped from. Each line is a
 * seek target, which is what makes the audio itself navigable.
 */
export function Transcript({ episode }: {episode: Episode;}) {
  const { current, elapsed, play, seek } = usePodcast();
  const isCurrent = current?.id === episode.id;
  const at = isCurrent ? elapsed : -1;

  const activeIndex = episode.transcript.reduce(
    (found, line, i) => at >= line.atSeconds ? i : found,
    -1
  );

  const jump = (seconds: number) => {
    if (!isCurrent) play(episode);
    seek(seconds);
  };

  return (
    <div className="thin-scrollbar max-h-[460px] overflow-y-auto rounded-2xl border border-white/5 bg-ink-900 p-3">
      <ol className="space-y-1">
        {episode.transcript.map((line, i) => {
          const active = i === activeIndex;
          return (
            <li key={`${line.atSeconds}-${i}`}>
              <button
                type="button"
                onClick={() => jump(line.atSeconds)}
                aria-current={active ? 'true' : undefined}
                className={`flex w-full gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 ease-entrance ${
                active ? 'bg-brand-violet/15' : 'hover:bg-white/5'}`
                }>
                
                <span
                  className={`shrink-0 text-[11px] font-semibold tabular-nums ${
                  active ? 'text-brand-cyan' : 'text-mist-400'}`
                  }>
                  
                  {formatClock(line.atSeconds)}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-mist-400">
                    {line.speaker}
                  </span>
                  <span
                    className={`block text-xs leading-relaxed ${
                    active ? 'text-white' : 'text-mist-200'}`
                    }>
                    
                    {line.text}
                  </span>
                </span>
              </button>
            </li>);

        })}
      </ol>
      <p className="mt-2 px-2.5 text-[10px] leading-relaxed text-mist-400">
        Transcript is machine-generated and lightly reviewed. Timings are approximate.
      </p>
    </div>);

}