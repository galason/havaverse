import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BookMarkedIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';

/** Right-rail summary of what the film remembers, and what no longer matches it. */
export function FilmMemoryPanel() {
  const { stateVersions, rules, violations, stale } = useDirector();
  const current = stateVersions[0];
  if (!current) return null;
  const active = rules.filter((r) => r.status === 'active').length;
  const issues = violations.length + stale.length;

  return (
    <section aria-labelledby="memory-heading" className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      <div className="flex items-center gap-2">
        <BookMarkedIcon className="h-4 w-4 text-brand-indigo" aria-hidden="true" />
        <h2 id="memory-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
          Film memory
        </h2>
        <Link
          to="/studio/rules"
          className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          
          Director’s plan
          <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2">
        <div>
          <dt className="text-[10px] text-mist-400">State</dt>
          <dd className="font-display text-xl tracking-wide text-white">v{current.n}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-mist-400">Rules</dt>
          <dd className="font-display text-xl tracking-wide text-white">{active}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-mist-400">Attention</dt>
          <dd className={`font-display text-xl tracking-wide ${issues > 0 ? 'text-brand-amber' : 'text-brand-cyan'}`}>
            {issues}
          </dd>
        </div>
      </dl>

      <p className="mt-2 text-[11px] leading-relaxed text-mist-400">
        {issues === 0 ?
        'Every render matches the current state and rules.' :
        [
        violations.length > 0 && `${violations.length} ${violations.length === 1 ? 'shot breaks' : 'shots break'} a rule`,
        stale.length > 0 && `${stale.length} rendered against an older state`].

        filter(Boolean).
        join(' · ')}
      </p>
      <p className="mt-1 truncate text-[10px] text-mist-400" title={current.reason}>
        Latest: {current.reason}
      </p>
    </section>);

}