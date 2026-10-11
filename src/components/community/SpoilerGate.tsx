import React from 'react';
import { EyeOffIcon } from 'lucide-react';
import { useCommunity } from '../../contexts/CommunityContext';
import type { SpoilerLevel } from '../../types/community';

const rank: Record<SpoilerLevel, number> = { safe: 0, current: 1, full: 2 };

export const spoilerLabels: Record<SpoilerLevel, string> = {
  safe: 'Safe for me',
  current: 'Through episode 5',
  full: 'All spoilers'
};

/**
 * Reusable across films and series: content above the viewer's progress is
 * withheld with an explanation and two ways forward, never silently removed.
 */
export function SpoilerGate({
  id,
  level,
  children




}: {id: string;level: SpoilerLevel;children: React.ReactNode;}) {
  const { spoilerLevel, revealed, reveal, setSpoilerLevel } = useCommunity();
  const hidden = rank[level] > rank[spoilerLevel] && !revealed.includes(id);

  if (!hidden) return <>{children}</>;

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-850 p-4">
      <p className="flex items-start gap-2 text-xs leading-relaxed text-mist-300">
        <EyeOffIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mist-400" aria-hidden="true" />
        <span>
          Hidden because this {level === 'full' ? 'goes past episode 5' : 'is ahead of where you stopped watching'}.
          HavaVerse knows your progress in this title.
        </span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => reveal(id)}
          className="rounded-lg bg-brand-indigo px-3 py-1.5 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
          Reveal anyway
        </button>
        <button
          type="button"
          onClick={() => setSpoilerLevel('full')}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
          
          Update my viewing progress
        </button>
      </div>
    </div>);

}

export function SpoilerControl() {
  const { spoilerLevel, setSpoilerLevel } = useCommunity();
  const levels: SpoilerLevel[] = ['safe', 'current', 'full'];

  return (
    <div
      role="radiogroup"
      aria-label="Spoiler level"
      className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/5 bg-ink-850 p-1.5">
      
      {levels.map((level) =>
      <button
        key={level}
        type="button"
        role="radio"
        aria-checked={spoilerLevel === level}
        onClick={() => setSpoilerLevel(level)}
        className={[
        'rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance',
        spoilerLevel === level ? 'bg-brand-indigo text-white' : 'text-mist-300 hover:text-white'].
        join(' ')}>
        
          {spoilerLabels[level]}
        </button>
      )}
    </div>);

}