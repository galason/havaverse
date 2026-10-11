import React from 'react';
import { AlertTriangleIcon, CheckIcon, LoaderIcon, XIcon } from 'lucide-react';
import type { AgentRun } from '../../types/director';
import { directorApi } from '../../services/directorApi';

function ago(at: number): string {
  const seconds = Math.round((Date.now() - at) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.round(minutes / 60)} hr`;
}

const toneIcon = {
  ok: <CheckIcon className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />,
  warn: <AlertTriangleIcon className="h-3.5 w-3.5 text-brand-amber" aria-hidden="true" />,
  run: <LoaderIcon className="h-3.5 w-3.5 animate-spin text-brand-indigo" aria-hidden="true" />,
  fail: <XIcon className="h-3.5 w-3.5 text-live" aria-hidden="true" />
};

export function AgentFeed({ runs }: {runs: AgentRun[];}) {
  const agents = directorApi.getAgents();

  return (
    <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
        Agent activity
      </h2>
      {runs.length === 0 ?
      <p className="text-[11px] text-mist-400">Nothing has run yet on this project.</p> :

      <ul className="space-y-3">
          {runs.slice(0, 8).map((run) =>
        <li key={run.id} className="flex gap-2.5">
              <span className="mt-0.5 shrink-0">{toneIcon[run.tone]}</span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-white">
                  {agents.find((a) => a.id === run.agent)?.name ?? run.agent}
                </span>
                <span className="block text-[11px] leading-relaxed text-mist-300">
                  {run.message}
                </span>
                <span className="block text-[10px] text-mist-400">{ago(run.at)}</span>
              </span>
            </li>
        )}
        </ul>
      }
    </section>);

}