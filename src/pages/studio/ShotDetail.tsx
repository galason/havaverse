import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckIcon,
  LoaderIcon,
  PlayIcon,
  RotateCcwIcon } from
'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { directorApi } from '../../services/directorApi';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { GenerationContextPanel } from '../../components/director/GenerationContextPanel';

const resultTone = {
  pass: 'text-brand-cyan',
  warn: 'text-brand-amber',
  fail: 'text-live'
};

export function ShotDetail() {
  const { shotId = '' } = useParams();
  const navigate = useNavigate();
  const {
    shots,
    scenes,
    characters,
    locations,
    jobs,
    status,
    reload,
    project,
    generateShot,
    approveVersion,
    restoreVersion,
    pending
  } = useDirector();

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading shot…" />
      </div>);

  }

  const shot = shots.find((s) => s.id === shotId);
  if (!shot) {
    return (
      <div className="p-5">
        <ErrorBlock message="That shot is not in this project." onRetry={reload} />
      </div>);

  }

  const scene = scenes.find((s) => s.id === shot.sceneId);
  const location = locations.find((l) => l.id === shot.locationId);
  const inShot = characters.filter((c) => shot.characterIds.includes(c.id));
  const job = jobs.find(
    (j) => j.shotId === shot.id && !['COMPLETED', 'CANCELLED', 'FAILED'].includes(j.status)
  );
  const current = shot.versions.find((v) => v.id === shot.currentVersionId);
  const route = directorApi.routeModel({ task: 'video', quality: 'standard' });
  const professional = project?.mode === 'professional';

  return (
    <div className="p-4 pb-12 sm:p-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back
      </button>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-2xl border border-white/5">
            <img
              src={current?.frame ?? shot.frame}
              alt={`Shot ${shot.code} — ${shot.description}`}
              className={`aspect-video w-full object-cover ${
              shot.status === 'planned' ? 'opacity-30 grayscale' : ''}`
              } />
            
            {shot.status === 'planned' &&
            <p className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-wide text-mist-300">
                Planned — not yet generated
              </p>
            }
            {job &&
            <div className="absolute inset-x-0 bottom-0 bg-ink-950/85 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-white">
                  <LoaderIcon className="h-3.5 w-3.5 animate-spin text-brand-indigo" aria-hidden="true" />
                  {job.status.replace(/_/g, ' ').toLowerCase()} · {job.provider} / {job.model}
                </p>
                <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-white/15">
                  <div
                  className="h-full rounded-full bg-brand-indigo transition-[width] duration-300 ease-entrance"
                  style={{ width: `${Math.round(job.progress * 100)}%` }} />
                
                </div>
              </div>
            }
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Shot {shot.code} — {shot.description}
          </h1>
          {scene &&
          <Link
            to={`/studio/scene/${scene.id}`}
            className="text-xs text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
              Scene {scene.number} · {scene.slug}
            </Link>
          }
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-200">{shot.action}</p>
          {shot.dialogue &&
          <p className="mt-2 rounded-xl border border-white/5 bg-ink-900 p-3 font-mono text-xs text-mist-200">
              {shot.dialogue}
            </p>
          }

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => generateShot(shot.id)}
              disabled={Boolean(job) || pending === `gen:${shot.id}`}
              className="flex items-center gap-2 rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400">
              
              <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              {job ? 'Generating…' : shot.versions.length > 0 ? 'Regenerate' : 'Generate'}
            </button>
            {current && !current.approved &&
            <button
              type="button"
              onClick={() => approveVersion(shot.id, current.id)}
              disabled={pending === `approve:${current.id}`}
              className="flex items-center gap-2 rounded-full border border-brand-cyan/40 px-5 py-2.5 text-sm font-semibold text-brand-cyan transition-colors duration-150 ease-entrance hover:bg-brand-cyan/10 disabled:text-mist-400">
              
                <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Approve v{current.n}
              </button>
            }
          </div>

          <section aria-labelledby="qc-heading" className="mt-6">
            <h2 id="qc-heading" className="mb-2.5 text-base font-bold tracking-tight text-white">
              Quality control
            </h2>
            {current ?
            <div
              className={`rounded-2xl border p-4 ${
              current.qc.passed ? 'border-white/5 bg-ink-900' : 'border-brand-amber/30 bg-ink-900'}`
              }>
              
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  {current.qc.passed ?
                <CheckIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" /> :

                <AlertTriangleIcon className="h-4 w-4 text-brand-amber" aria-hidden="true" />
                }
                  {current.qc.passed ? 'Passed all checks' : 'Needs revision'}
                </p>
                <ul className="mt-3 space-y-2">
                  {current.qc.checks.map((check) =>
                <li key={check.label} className="text-xs">
                      <span className={`font-semibold ${resultTone[check.result]}`}>
                        {check.result.toUpperCase()}
                      </span>{' '}
                      <span className="text-white">{check.label}</span>
                      <span className="block text-[11px] text-mist-400">{check.note}</span>
                    </li>
                )}
                </ul>
              </div> :

            <p className="rounded-2xl border border-white/5 bg-ink-900 p-4 text-xs text-mist-400">
                Nothing has been generated for this shot, so there is nothing to check yet.
              </p>
            }
          </section>

          <section aria-labelledby="versions-heading" className="mt-6">
            <h2
              id="versions-heading"
              className="mb-2.5 text-base font-bold tracking-tight text-white">
              
              Versions
            </h2>
            {shot.versions.length === 0 ?
            <p className="rounded-2xl border border-white/5 bg-ink-900 p-4 text-xs text-mist-400">
                No versions yet. Nothing is ever overwritten — every generation is kept.
              </p> :

            <ul className="space-y-2">
                {shot.versions.map((version) =>
              <li
                key={version.id}
                className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${
                version.id === shot.currentVersionId ?
                'border-brand-indigo/40 bg-ink-850' :
                'border-white/5 bg-ink-900'}`
                }>
                
                    <img src={version.frame} alt="" className="h-12 w-20 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white">
                        v{version.n}
                        {version.approved &&
                    <span className="ml-2 rounded-full bg-brand-cyan/15 px-2 py-0.5 text-[10px] text-brand-cyan">
                            approved
                          </span>
                    }
                        {version.id === shot.currentVersionId && !version.approved &&
                    <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-mist-200">
                            current
                          </span>
                    }
                      </p>
                      <p className="truncate text-[11px] text-mist-400">
                        {version.agent} · {version.provider}/{version.model} · {version.createdAt}
                      </p>
                      <p className="truncate text-[11px] text-mist-400">{version.note}</p>
                    </div>
                    {version.id !== shot.currentVersionId &&
                <button
                  type="button"
                  onClick={() => restoreVersion(shot.id, version.id)}
                  disabled={pending === `restore:${version.id}`}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white disabled:text-mist-400">
                  
                        <RotateCcwIcon className="h-3 w-3" aria-hidden="true" />
                        Restore
                      </button>
                }
                  </li>
              )}
              </ul>
            }
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Shot specification</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {[
              ['Camera', shot.spec.camera],
              ['Lens', shot.spec.lens],
              ['Movement', shot.spec.movement],
              ['Framing', shot.spec.framing],
              ['Lighting', shot.spec.lighting],
              ['Performance', shot.spec.performance],
              ['Duration', `${shot.spec.durationSeconds}s`],
              ['Transition', shot.spec.transition]].
              map(([label, value]) =>
              <div key={label}>
                  <dt className="text-[10px] uppercase tracking-wide text-mist-400">{label}</dt>
                  <dd className="text-xs font-medium text-white">{value}</dd>
                </div>
              )}
            </dl>
          </section>

          <GenerationContextPanel shot={shot} />

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Continuity package</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-mist-400">
              Assembled automatically and handed to every agent on this shot. You never re-describe
              them.
            </p>
            <ul className="mt-3 space-y-2">
              {inShot.map((character) =>
              <li key={character.id}>
                  <Link
                  to={`/studio/bible#${character.id}`}
                  className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-ink-850 p-2.5 transition-colors duration-150 ease-entrance hover:border-white/20">
                  
                    <img
                    src={character.portrait}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover" />
                  
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-white">
                        {character.name}
                      </span>
                      <span
                      className={`block text-[10px] ${
                      character.continuity === 'locked' ? 'text-brand-cyan' : 'text-brand-amber'}`
                      }>
                      
                        {character.references} references · {character.continuity}
                      </span>
                    </span>
                  </Link>
                </li>
              )}
              {location &&
              <li className="rounded-xl border border-white/5 bg-ink-850 p-2.5">
                  <p className="text-xs font-semibold text-white">{location.name}</p>
                  <p className="text-[10px] text-mist-400">
                    {location.lighting} · {location.weather}
                  </p>
                </li>
              }
            </ul>
          </section>

          {professional &&
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">Model routing</h2>
              <dl className="mt-2 space-y-1.5 text-[11px]">
                <div className="flex gap-2">
                  <dt className="text-mist-400">Provider</dt>
                  <dd className="ml-auto text-white">{route.provider}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-mist-400">Model</dt>
                  <dd className="ml-auto text-white">{route.model}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-mist-400">Est. duration</dt>
                  <dd className="ml-auto text-white">{route.estimatedSeconds}s</dd>
                </div>
              </dl>
              <p className="mt-2 text-[10px] leading-relaxed text-mist-400">{route.reason}</p>
            </section>
          }
        </aside>
      </div>
    </div>);

}