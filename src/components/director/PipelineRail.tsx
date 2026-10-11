import React from 'react';
import { CheckIcon, CircleDashedIcon, LoaderIcon, LockIcon } from 'lucide-react';
import type { StageProgress } from '../../types/director';

const icon = {
  complete: CheckIcon,
  active: LoaderIcon,
  queued: CircleDashedIcon,
  blocked: LockIcon
};

const ring: Record<StageProgress['status'], string> = {
  complete: 'border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan',
  active: 'border-brand-indigo/50 bg-brand-indigo/15 text-brand-indigo',
  queued: 'border-white/10 bg-ink-800 text-mist-400',
  blocked: 'border-brand-amber/40 bg-brand-amber/10 text-brand-amber'
};

/** Every percentage here is computed from entities, never authored. */
export function PipelineRail({ stages }: {stages: StageProgress[];}) {
  return (
    <ol className="space-y-0.5">
      {stages.map((stage) => {
        const Icon = icon[stage.status];
        const pct = Math.round(stage.ratio * 100);
        return (
          <li
            key={stage.key}
            className={`rounded-xl px-2.5 py-2 ${stage.status === 'active' ? 'bg-brand-indigo/10' : ''}`}>
            
            <div className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${ring[stage.status]}`}>
                
                <Icon
                  className={`h-3.5 w-3.5 ${stage.status === 'active' ? 'animate-spin' : ''}`}
                  aria-hidden="true" />
                
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="truncate text-sm font-medium text-white">{stage.name}</span>
                  <span className="ml-auto shrink-0 text-[11px] tabular-nums text-mist-400">
                    {stage.status === 'blocked' ?
                    'held' :
                    pct === 100 ?
                    '✓' :
                    pct === 0 ?
                    '—' :
                    `${pct}%`}
                  </span>
                </span>
                <span className="block truncate text-[11px] text-mist-400">{stage.detail}</span>
              </span>
            </div>
            {stage.ratio > 0 && stage.ratio < 1 &&
            <div className="ml-10 mt-1.5 h-0.5 overflow-hidden rounded-full bg-white/10">
                <div
                className="h-full rounded-full bg-brand-indigo transition-[width] duration-300 ease-entrance"
                style={{ width: `${pct}%` }} />
              
              </div>
            }
          </li>);

      })}
    </ol>);

}