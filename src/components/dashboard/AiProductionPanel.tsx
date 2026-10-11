import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, ArrowRightIcon } from 'lucide-react';
import type { ProductionJobState, ProductionJobView } from '../../types/dashboard';

const lifecycle: ProductionJobState[] = [
'queued',
'understanding',
'planning',
'generating',
'validating',
'finalizing',
'completed'];


const stateLabel: Record<ProductionJobState, string> = {
  queued: 'Queued',
  understanding: 'Understanding',
  planning: 'Planning',
  generating: 'Generating',
  validating: 'Validating',
  finalizing: 'Finalizing',
  completed: 'Completed',
  failed: 'Failed'
};

/**
 * Jobs continue running whether or not this page is open — the director
 * service owns them. This module reads their live state and shows the
 * lifecycle position, so a completion visibly transitions rather than
 * appearing fully-formed on the next reload.
 */
export function AiProductionPanel({ jobs }: {jobs: ProductionJobView[];}) {
  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const index = lifecycle.indexOf(job.state);
        return (
          <article
            key={job.id}
            className="rounded-xl border border-white/5 bg-ink-850 p-4 transition-colors duration-150 ease-entrance hover:border-white/20">
            
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  {job.failed &&
                  <AlertTriangleIcon className="h-3.5 w-3.5 text-live" aria-hidden="true" />
                  }
                  {job.label}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-mist-400">
                  {job.project} · {job.detail}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="relative h-11 w-11 shrink-0"
                  role="progressbar"
                  aria-valuenow={Math.round(job.progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${job.label} progress`}>
                  
                  <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      strokeWidth="3"
                      className="stroke-white/10" />
                    
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className={job.failed ? 'stroke-live' : 'stroke-brand-indigo'}
                      strokeDasharray={`${Math.max(1, job.progress * 97.4)} 97.4`}
                      style={{ transition: 'stroke-dasharray 250ms cubic-bezier(0.23,1,0.32,1)' }} />
                    
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white">
                    {Math.round(job.progress * 100)}%
                  </span>
                </div>
                <Link
                  to={job.to}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-indigo/25">
                  
                  Open
                  <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <ol className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
              {lifecycle.map((step, i) => {
                const done = index >= 0 && i < index;
                const active = i === index;
                return (
                  <li
                    key={step}
                    className={[
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors duration-200 ease-entrance',
                    active ?
                    'bg-brand-indigo/20 text-brand-indigo ring-1 ring-brand-indigo/40' :
                    done ?
                    'text-mist-300' :
                    'text-mist-400/60'].
                    join(' ')}
                    aria-current={active ? 'step' : undefined}>
                    
                    {stateLabel[step]}
                  </li>);

              })}
            </ol>

            {job.failed &&
            <p className="mt-2 text-xs text-live">
                This run failed and can be retried from the job queue.
              </p>
            }
          </article>);

      })}
    </div>);

}