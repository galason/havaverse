import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { useDirector, formatNaira } from '../../contexts/DirectorContext';
import { directorApi } from '../../services/directorApi';
import { EmptyBlock } from '../../components/community/StateBlocks';
import type { JobStatus } from '../../types/director';

const tone: Record<JobStatus, string> = {
  QUEUED: 'bg-ink-800 text-mist-300',
  PREPARING: 'bg-white/10 text-mist-200',
  GENERATING: 'bg-brand-indigo/20 text-brand-indigo',
  PROCESSING: 'bg-brand-indigo/20 text-brand-indigo',
  QUALITY_CHECK: 'bg-brand-violet/20 text-brand-violet',
  COMPLETED: 'bg-brand-cyan/15 text-brand-cyan',
  FAILED: 'bg-live/15 text-live',
  CANCELLED: 'bg-ink-800 text-mist-400',
  RETRYING: 'bg-brand-amber/15 text-brand-amber'
};

export function JobQueue() {
  const { jobs, shots, cancelJob, retryJob } = useDirector();
  const agents = directorApi.getAgents();
  const live = jobs.filter(
    (j) => !['COMPLETED', 'CANCELLED', 'FAILED'].includes(j.status)
  ).length;

  return (
    <div className="p-4 pb-12 sm:p-5">
      <Link
        to="/studio"
        className="mb-4 flex w-fit items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back to the Director
      </Link>

      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Job queue</h1>
        <p className="mt-1 max-w-2xl text-sm text-mist-400">
          Every generation is an asynchronous job with its own provider, model, cost and quality
          gate. {live > 0 ? `${live} running now.` : 'Nothing is running.'}
        </p>
      </header>

      {jobs.length === 0 ?
      <EmptyBlock
        title="No jobs yet"
        body="Direct a change or generate a shot and the work appears here with real state."
        action={
        <Link
          to="/studio"
          className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
              Open the Director
            </Link>
        } /> :


      <ul className="space-y-2">
          {jobs.map((job) => {
          const shot = shots.find((s) => s.id === job.shotId);
          const running = !['COMPLETED', 'CANCELLED', 'FAILED'].includes(job.status);
          return (
            <li
              key={job.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-ink-900 p-3">
              
                <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${tone[job.status]}`}>
                
                  {job.status.replace(/_/g, ' ')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{job.label}</p>
                  <p className="truncate text-[11px] text-mist-400">
                    {agents.find((a) => a.id === job.agent)?.name} · {job.provider}/{job.model} ·{' '}
                    {formatNaira(job.costKobo)}
                    {job.attempt > 1 && ` · attempt ${job.attempt}`}
                  </p>
                  {running &&
                <div className="mt-1.5 h-0.5 max-w-xs overflow-hidden rounded-full bg-white/10">
                      <div
                    className="h-full rounded-full bg-brand-indigo transition-[width] duration-300 ease-entrance"
                    style={{ width: `${Math.round(job.progress * 100)}%` }} />
                  
                    </div>
                }
                </div>
                {shot &&
              <Link
                to={`/studio/shot/${shot.id}`}
                className="shrink-0 text-[11px] font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
                
                    Shot {shot.code}
                  </Link>
              }
                {running &&
              <button
                type="button"
                onClick={() => cancelJob(job.id)}
                className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
                
                    Cancel
                  </button>
              }
                {['FAILED', 'CANCELLED'].includes(job.status) &&
              <button
                type="button"
                onClick={() => retryJob(job.id)}
                className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
                
                    Retry
                  </button>
              }
              </li>);

        })}
        </ul>
      }

      <section aria-labelledby="registry" className="mt-8">
        <h2 id="registry" className="mb-3 text-base font-bold tracking-tight text-white">
          Agent registry
        </h2>
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) =>
          <li key={agent.id} className="rounded-xl border border-white/5 bg-ink-900 p-3">
              <p className="text-xs font-semibold text-white">
                {agent.name} <span className="text-mist-400">v{agent.version}</span>
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-mist-300">{agent.purpose}</p>
              <p className="mt-1 text-[10px] text-mist-400">
                {agent.requiresApproval ? 'Approval required' : 'Autonomous'} ·{' '}
                {agent.retries} {agent.retries === 1 ? 'retry' : 'retries'} · {agent.timeoutSeconds}s
                timeout
              </p>
            </li>
          )}
        </ul>
      </section>
    </div>);

}