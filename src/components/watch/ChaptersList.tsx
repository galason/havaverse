import React from 'react';
import { SparklesIcon } from 'lucide-react';
import type { Chapter } from '../../types/watch';
import { formatTime } from '../../hooks/usePlayback';

interface ChaptersListProps {
  chapters: Chapter[];
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export function ChaptersList({ chapters, currentTime, onSeek }: ChaptersListProps) {
  const activeId = [...chapters].reverse().find((c) => c.startSeconds <= currentTime)?.id;
  const generated = chapters.some((c) => c.generated);

  return (
    <section
      aria-labelledby="chapters-heading"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4 sm:p-5">
      
      <h2 id="chapters-heading" className="text-base font-bold tracking-tight text-white">
        Chapters
      </h2>
      {generated &&
      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-mist-400">
          <SparklesIcon className="h-3 w-3 text-brand-cyan" aria-hidden="true" />
          Some chapter titles were generated from the transcript and reviewed by the creator.
        </p>
      }
      <ul className="mt-3 space-y-1">
        {chapters.map((chapter) =>
        <li key={chapter.id}>
            <button
            type="button"
            onClick={() => onSeek(chapter.startSeconds)}
            aria-current={chapter.id === activeId}
            className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 ease-entrance ${
            chapter.id === activeId ? 'bg-white/10' : 'hover:bg-white/5'}`
            }>
            
              <span className="w-14 shrink-0 text-[11px] tabular-nums text-mist-400">
                {formatTime(chapter.startSeconds)}
              </span>
              <span
              className={`min-w-0 flex-1 truncate text-sm ${
              chapter.id === activeId ? 'font-semibold text-white' : 'text-mist-200'}`
              }>
              
                {chapter.label}
              </span>
              {chapter.generated &&
            <SparklesIcon className="h-3 w-3 shrink-0 text-brand-cyan" aria-hidden="true" />
            }
            </button>
          </li>
        )}
      </ul>
    </section>);

}