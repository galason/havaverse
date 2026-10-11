import React from 'react';
import { directorApi } from '../../services/directorApi';
import { formatNaira } from '../../contexts/DirectorContext';
import type { GenerationJob } from '../../types/director';

/** Recomputed from completed jobs — it moves when you generate something. */
export function CostPanel({ jobs, credits }: {jobs: GenerationJob[];credits: number;}) {
  const { lines, totalKobo } = React.useMemo(() => directorApi.deriveCost(), [jobs]);
  const sessionKobo = jobs.
  filter((j) => j.status === 'COMPLETED').
  reduce((sum, j) => sum + j.costKobo, 0);

  return (
    <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      <h2 className="text-sm font-bold text-white">Production cost</h2>
      <p className="mt-1 font-display text-3xl tracking-wide text-white">
        {formatNaira(totalKobo)}
      </p>
      <p className="text-[11px] text-mist-400">
        Estimated, from completed generation jobs
        {sessionKobo > 0 && ` · ${formatNaira(sessionKobo)} this session`}
      </p>

      <dl className="mt-3 space-y-1.5">
        {lines.map((line) =>
        <div key={line.label} className="flex items-baseline gap-2">
            <dt className="text-[11px] text-mist-300">{line.label}</dt>
            <dd className="ml-auto text-[11px] tabular-nums text-white">
              {formatNaira(line.kobo)}
            </dd>
          </div>
        )}
      </dl>

      <p className="mt-3 border-t border-white/5 pt-2.5 text-[11px] text-mist-400">
        Hava AI credits remaining{' '}
        <span className="font-semibold tabular-nums text-white">{formatNaira(credits)}</span>
      </p>
    </section>);

}