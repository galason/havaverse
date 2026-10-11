import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, CheckIcon, LoaderIcon, PlayIcon } from 'lucide-react';
import type { GenerationJob, Shot } from '../../types/director';
import { useDirector } from '../../contexts/DirectorContext';

const statusChip: Record<Shot['status'], {label: string;className: string;}> = {
  planned: { label: 'Planned', className: 'bg-ink-800 text-mist-300' },
  storyboarded: { label: 'Boarded', className: 'bg-white/10 text-mist-200' },
  generating: { label: 'Generating', className: 'bg-brand-indigo/20 text-brand-indigo' },
  'needs-revision': { label: 'Needs revision', className: 'bg-brand-amber/15 text-brand-amber' },
  generated: { label: 'Awaiting approval', className: 'bg-brand-cyan/15 text-brand-cyan' },
  approved: { label: 'Approved', className: 'bg-brand-cyan/20 text-brand-cyan' }
};

export function ShotCard({ shot, job }: {shot: Shot;job?: GenerationJob;}) {
  const { generateShot, pending } = useDirector();
  const chip = statusChip[shot.status];
  const busy = pending === `gen:${shot.id}`;
  const version = shot.versions.find((v) => v.id === shot.currentVersionId);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-white/5 bg-ink-850">
      <Link
        to={`/studio/shot/${shot.id}`}
        className="group relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo">
        
        <img
          src={shot.frame}
          alt={`Frame for shot ${shot.code} — ${shot.description}`}
          loading="lazy"
          className={`aspect-video w-full object-cover transition-opacity duration-150 ease-entrance ${
          shot.status === 'planned' ? 'opacity-25 grayscale' : 'opacity-100'}`
          } />
        
        {shot.status === 'generating' && job &&
        <span className="absolute inset-0 flex flex-col items-center justify-center bg-ink-950/75">
            <LoaderIcon className="h-4 w-4 animate-spin text-brand-indigo" aria-hidden="true" />
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-mist-200">
              {job.status.replace('_', ' ').toLowerCase()}
            </span>
            <span className="mt-1.5 h-0.5 w-20 overflow-hidden rounded-full bg-white/15">
              <span
              className="block h-full rounded-full bg-brand-indigo transition-[width] duration-300 ease-entrance"
              style={{ width: `${Math.round(job.progress * 100)}%` }} />
            
            </span>
          </span>
        }
        {shot.status === 'approved' &&
        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-cyan text-ink-950">
            <CheckIcon className="h-3 w-3" aria-hidden="true" />
          </span>
        }
        {shot.status === 'needs-revision' &&
        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-amber text-ink-950">
            <AlertTriangleIcon className="h-3 w-3" aria-hidden="true" />
          </span>
        }
      </Link>

      <div className="flex flex-1 flex-col p-2.5">
        <p className="text-[11px] font-semibold text-white">
          {shot.code} · {shot.description}
        </p>
        <p className="mt-0.5 text-[10px] text-mist-400">
          {shot.spec.lens} · {shot.spec.movement} · {shot.spec.durationSeconds}s
          {version && ` · v${version.n}`}
        </p>

        <div className="mt-auto flex items-center gap-1.5 pt-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${chip.className}`}>
            
            {chip.label}
          </span>
          {(shot.status === 'planned' ||
          shot.status === 'storyboarded' ||
          shot.status === 'needs-revision') &&
          <button
            type="button"
            onClick={() => generateShot(shot.id)}
            disabled={busy}
            className="ml-auto flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:border-brand-indigo/50 hover:text-white disabled:text-mist-400">
            
              <PlayIcon className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
              {busy ? 'Queuing' : shot.status === 'needs-revision' ? 'Regenerate' : 'Generate'}
            </button>
          }
        </div>
      </div>
    </article>);

}