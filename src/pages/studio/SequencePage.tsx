import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CloudRainIcon, HomeIcon, ScaleIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { ShotCard } from '../../components/director/ShotCard';
import { RuleViolationRow } from '../../components/director/RuleViolationRow';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { filmStateApi } from '../../services/filmStateApi';
import { since } from '../../utils/continuity';

/** A sequence as one production object: objectives, state, rules, shots, versions. */
export function SequencePage() {
  const { sequenceId } = useParams();
  const { status, reload, sequences, scenes, shots, jobs, rules, violations, stale, stateVersions } = useDirector();

  if (status === 'loading') return <div className="p-5"><LoadingBlock label="Loading sequence…" /></div>;
  if (status === 'error') return <div className="p-5"><ErrorBlock message="The sequence could not be loaded." onRetry={reload} /></div>;

  const sequence = sequences.find((s) => s.id === sequenceId);
  if (!sequence)
  return (
    <div className="p-5">
        <EmptyBlock title="Sequence not found" body="It may have been merged or renumbered." />
      </div>);


  const seqScenes = scenes.filter((s) => sequence.sceneIds.includes(s.id));
  const seqShots = shots.filter((s) => sequence.sceneIds.includes(s.sceneId));
  const seqRules = rules.filter(
    (r) => r.status === 'active' && (r.level === 'film' || r.level === 'sequence' && r.scopeId === sequence.id)
  );
  const seqViolations = violations.filter((v) => seqShots.some((s) => s.id === v.shotId));
  const seqStale = stale.filter((s) => seqShots.some((shot) => shot.id === s.shotId));
  const current = sequence.versions[0];
  const state = stateVersions[0];
  const index = sequences.findIndex((s) => s.id === sequence.id);

  return (
    <div className="p-4 sm:p-5">
      <Link
        to="/studio"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Studio
      </Link>

      <header className="mt-3 border-b border-white/5 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
          Sequence {sequence.number} · v{current.n} · state v{current.stateVersion}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{sequence.title}</h1>
        <dl className="mt-3 grid max-w-3xl gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-semibold text-mist-400">Narrative objective</dt>
            <dd className="text-sm text-mist-200">{sequence.narrativeObjective}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold text-mist-400">Dramatic objective</dt>
            <dd className="text-sm text-mist-200">{sequence.dramaticObjective}</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-8 pt-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-8">
          {(seqViolations.length > 0 || seqStale.length > 0) &&
          <section aria-labelledby="seq-attention">
              <h2 id="seq-attention" className="text-base font-bold text-white">
                Needs attention · {seqViolations.length + seqStale.length}
              </h2>
              {seqViolations.length > 0 &&
            <ul className="mt-3 divide-y divide-white/5 rounded-2xl border border-live/25 bg-live/[0.04]">
                  {seqViolations.map((v) =>
              <RuleViolationRow key={v.id} violation={v} />
              )}
                </ul>
            }
              {seqStale.length > 0 &&
            <p className="mt-3 text-xs text-brand-amber">
                  {seqStale.map((s) => `Shot ${s.shotCode}: ${s.changes[0]}`).join(' · ')} —{' '}
                  <Link to="/studio/rules" className="font-semibold underline underline-offset-2">
                    regenerate from the Director’s plan
                  </Link>
                </p>
            }
            </section>
          }

          {seqScenes.map((scene) => {
            const sceneShots = seqShots.filter((s) => s.sceneId === scene.id);
            const resolved = sceneShots[0] ? filmStateApi.resolveShot(sceneShots[0]) : undefined;
            return (
              <section key={scene.id} aria-labelledby={`scene-${scene.id}`}>
                <div className="mb-2 flex flex-wrap items-baseline gap-2">
                  <h2 id={`scene-${scene.id}`} className="text-sm font-semibold text-white">
                    <Link to={`/studio/scene/${scene.id}`} className="hover:text-brand-indigo">
                      Scene {scene.number} · {scene.slug}
                    </Link>
                  </h2>
                  {resolved &&
                  <span className="flex items-center gap-1 text-[11px] text-mist-400">
                      {resolved.interior ?
                    <HomeIcon className="h-3 w-3" aria-hidden="true" /> :

                    <CloudRainIcon className="h-3 w-3" aria-hidden="true" />
                    }
                      {resolved.interior ? `Interior · ${resolved.weather} outside` : resolved.weather}
                    </span>
                  }
                </div>
                <p className="mb-3 text-xs text-mist-300">{scene.synopsis}</p>
                <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {sceneShots.map((shot) =>
                  <li key={shot.id}>
                      <ShotCard
                      shot={shot}
                      job={jobs.find((j) => j.shotId === shot.id && !['COMPLETED', 'CANCELLED', 'FAILED'].includes(j.status))} />
                    
                    </li>
                  )}
                </ul>
              </section>);

          })}
        </div>

        <aside className="space-y-8">
          <section aria-labelledby="inherited-heading">
            <h2 id="inherited-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
              Carried into this sequence
            </h2>
            <ul className="mt-3 space-y-1.5">
              {(state?.facts ?? []).
              filter((f) => f.fromScene <= Math.max(...seqScenes.map((s) => s.number))).
              filter(
                (f, _, all) =>
                !all.some(
                  (g) => g.entityId === f.entityId && g.property === f.property && g.fromScene > f.fromScene &&
                  g.fromScene <= Math.min(...seqScenes.map((s) => s.number))
                )
              ).
              map((f) =>
              <li key={f.id} className="text-[11px] text-mist-300">
                    <span className="font-semibold text-white">{filmStateApi.entityName(f.entityId)}</span> {f.property}:{' '}
                    {f.value}
                    <span className="block text-[10px] text-mist-400">From Scene {f.fromScene} — {f.cause}</span>
                  </li>
              )}
            </ul>
          </section>

          <section aria-labelledby="seq-rules">
            <h2 id="seq-rules" className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
              Rules in force
            </h2>
            <ul className="mt-3 space-y-2">
              {seqRules.map((r) =>
              <li key={r.id} className="flex gap-2 text-[11px] text-mist-200">
                  <ScaleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-indigo" aria-hidden="true" />
                  <Link to={`/studio/rules#${r.id}`} className="hover:text-white">
                    {r.text}
                  </Link>
                </li>
              )}
            </ul>
          </section>

          <section aria-labelledby="seq-versions">
            <h2 id="seq-versions" className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
              Versions
            </h2>
            <ol className="mt-3 space-y-2 border-l border-white/10 pl-3">
              {sequence.versions.map((v, i) =>
              <li key={v.n} className="text-[11px]">
                  <span className="font-semibold text-white">v{v.n}</span>
                  {i === 0 && <span className="ml-1.5 text-brand-cyan">current</span>}
                  <span className="block text-mist-300">{v.reason}</span>
                  <span className="block text-[10px] text-mist-400">state v{v.stateVersion} · {since(v.createdAt)}</span>
                </li>
              )}
            </ol>
          </section>

          <nav aria-label="Other sequences" className="flex gap-2 border-t border-white/5 pt-4 text-[11px] font-semibold">
            {index > 0 &&
            <Link to={`/studio/sequence/${sequences[index - 1].id}`} className="text-mist-300 hover:text-white">
                ← {sequences[index - 1].title}
              </Link>
            }
            {index < sequences.length - 1 &&
            <Link to={`/studio/sequence/${sequences[index + 1].id}`} className="ml-auto text-mist-300 hover:text-white">
                {sequences[index + 1].title} →
              </Link>
            }
          </nav>
        </aside>
      </div>
    </div>);

}