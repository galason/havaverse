import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, CloudRainIcon, HistoryIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { RuleRow } from '../../components/director/RuleRow';
import { RuleViolationRow } from '../../components/director/RuleViolationRow';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { since } from '../../utils/continuity';
import { filmStateApi } from '../../services/filmStateApi';

/**
 * The Director's Plan: the rules the film must hold, the persistent film
 * state every generation reads, and every render that no longer matches either.
 */
export function DirectorsPlan() {
  const { status, project, reload, rules, violations, stale, stateVersions, sequences, scenes, generateShot, pending } =
  useDirector();
  const { hash } = useLocation();

  React.useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash, status]);

  if (status === 'loading') return <div className="p-5"><LoadingBlock label="Loading the film state…" /></div>;
  if (status === 'error' || !project)
  return <div className="p-5"><ErrorBlock message="The film state could not be loaded." onRetry={reload} /></div>;

  const current = stateVersions[0];
  const attention = violations.length + stale.length;

  return (
    <div className="p-4 sm:p-5">
      <Link
        to="/studio"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {project.title}
      </Link>

      <header className="mt-3 border-b border-white/5 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">Director’s plan</h1>
        <p className="mt-1 max-w-2xl text-sm text-mist-300">
          What the film must always hold, and what it remembers. Every generation reads this; nothing here is
          edited in place.
        </p>
      </header>

      <div className="grid gap-8 pt-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="attention-heading">
            <h2 id="attention-heading" className="flex items-center gap-2 text-base font-bold text-white">
              {attention === 0 && <CheckIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />}
              {attention === 0 ? 'Every render matches the plan' : `Needs attention · ${attention}`}
            </h2>

            {violations.length > 0 &&
            <ul className="mt-3 divide-y divide-white/5 rounded-2xl border border-live/25 bg-live/[0.04]">
                {violations.map((v) =>
              <RuleViolationRow key={v.id} violation={v} />
              )}
              </ul>
            }

            {stale.length > 0 &&
            <ul className="mt-3 divide-y divide-white/5 rounded-2xl border border-brand-amber/25 bg-brand-amber/[0.04]">
                {stale.map((s) =>
              <li key={s.shotId} className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        <Link to={`/studio/shot/${s.shotId}`} className="hover:text-brand-indigo">
                          Shot {s.shotCode}
                        </Link>{' '}
                        <span className="font-normal text-mist-400">· rendered against state v{s.renderedStateVersion}</span>
                      </p>
                      <p className="text-xs text-mist-300">{s.changes.join(' · ')}</p>
                    </div>
                    <button
                  type="button"
                  onClick={() => generateShot(s.shotId)}
                  disabled={pending === `gen:${s.shotId}`}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100 disabled:opacity-60">
                  
                      Regenerate
                    </button>
                  </li>
              )}
              </ul>
            }
          </section>

          <section aria-labelledby="rules-heading">
            <div className="flex items-baseline gap-2 border-b border-white/5 pb-2">
              <h2 id="rules-heading" className="text-base font-bold text-white">Rules</h2>
              <span className="text-xs text-mist-400">
                {rules.filter((r) => r.status === 'active').length} enforced on every generation
              </span>
            </div>
            <ul className="divide-y divide-white/5">
              {rules.map((rule) =>
              <RuleRow
                key={rule.id}
                rule={rule}
                scopeLabel={
                rule.level === 'sequence' ?
                sequences.find((s) => s.id === rule.scopeId)?.title :
                undefined
                } />

              )}
            </ul>
            <p className="mt-2 text-[11px] text-mist-400">
              Try “Amara draws the revolver in 24A” in the director console — it is refused before anything is
              generated.
            </p>
          </section>
        </div>

        <aside className="space-y-8">
          {current &&
          <section aria-labelledby="weather-heading">
              <h2 id="weather-heading" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
                <CloudRainIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Weather · state v{current.n}
              </h2>
              <ul className="mt-3 space-y-1.5">
                {scenes.map((scene) =>
              <li key={scene.id} className="flex items-center gap-2 text-[11px]">
                    <span className="text-mist-300">Scene {scene.number}</span>
                    <span className="ml-auto font-semibold capitalize text-white">{current.weather[scene.id]}</span>
                  </li>
              )}
              </ul>
              <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-mist-400">Facts</h3>
              <ul className="mt-2 space-y-1.5">
                {current.facts.map((f) =>
              <li key={f.id} className="text-[11px] text-mist-300">
                    <span className="font-semibold text-white">{filmStateApi.entityName(f.entityId)}</span>{' '}
                    {f.property} = {f.value} <span className="text-mist-400">from Scene {f.fromScene} — {f.cause}</span>
                  </li>
              )}
              </ul>
            </section>
          }

          <section aria-labelledby="versions-heading">
            <h2 id="versions-heading" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
              <HistoryIcon className="h-3.5 w-3.5" aria-hidden="true" />
              State versions
            </h2>
            <ol className="mt-3 space-y-3 border-l border-white/10 pl-3">
              {stateVersions.map((v, i) =>
              <li key={v.id} className="text-[11px]">
                  <p className="font-semibold text-white">
                    v{v.n} {i === 0 && <span className="ml-1 text-brand-cyan">current</span>}
                  </p>
                  <p className="text-mist-300">{v.reason}</p>
                  {v.changes.map((c) =>
                <p key={c} className="text-mist-400">· {c}</p>
                )}
                  <p className="text-[10px] text-mist-400">{v.createdBy} · {since(v.createdAt)}</p>
                </li>
              )}
            </ol>
          </section>
        </aside>
      </div>
    </div>);

}