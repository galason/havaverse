import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, LockIcon } from 'lucide-react';
import { directorApi } from '../services/directorApi';
import { releaseRegistry } from '../services/releaseRegistry';
import { project as seedProject } from '../data/director';
import { useDirector } from '../contexts/DirectorContext';
import { ProjectSwitcher } from '../components/studio/ProjectSwitcher';
import { VersionsPanel } from '../components/studio/VersionsPanel';
import { DirectorConsole } from '../components/director/DirectorConsole';
import { PipelineRail } from '../components/director/PipelineRail';
import { ShotCard } from '../components/director/ShotCard';
import { AgentFeed } from '../components/director/AgentFeed';
import { PublicationGatePanel } from '../components/director/PublicationGatePanel';
import { LockedAssetsPanel } from '../components/director/LockedAssetsPanel';
import { CostPanel } from '../components/director/CostPanel';
import { FilmMemoryPanel } from '../components/director/FilmMemoryPanel';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../components/community/StateBlocks';
import type { FilmProject } from '../types/director';

const modes: {key: FilmProject['mode'];label: string;hint: string;}[] = [
{ key: 'simple', label: 'Simple', hint: 'Natural language only' },
{ key: 'director', label: 'Director', hint: 'Cinematic controls' },
{ key: 'professional', label: 'Professional', hint: 'Specs, jobs and routing' }];


export function Studio() {
  const {
    project,
    scenes,
    shots,
    characters,
    locations,
    rights,
    jobs,
    runs,
    status,
    reload,
    setMode,
    setSceneApproval,
    pending,
    continuity,
    sequences,
    violations,
    stale
  } = useDirector();

  const stages = React.useMemo(
    () => directorApi.deriveStages(),
    [shots, rights, scenes, jobs, characters, locations, continuity]
  );
  const publish = React.useMemo(
    () => directorApi.derivePublicationGate(),
    [shots, rights, jobs, continuity, violations, stale]
  );
  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading production state…" />
      </div>);

  }

  if (status === 'error' || !project) {
    return (
      <div className="p-5">
        <ErrorBlock message="The production state could not be loaded." onRetry={reload} />
      </div>);

  }

  const activeJobs = jobs.filter((j) =>
  ['QUEUED', 'PREPARING', 'GENERATING', 'PROCESSING', 'QUALITY_CHECK', 'RETRYING'].includes(
    j.status
  )
  );
  const approvedShots = shots.filter((s) => s.status === 'approved').length;
  // The public page exists only once something has been published from here
  // (the seed production is already in the catalogue).
  const publicSlug =
  releaseRegistry.forProject(project.id)[0]?.slug ?? (project.id === seedProject.id ? 'the-last-train' : null);

  return (
    <div className="p-4 sm:p-5">
      <header className="flex flex-wrap items-start gap-4 border-b border-white/5 pb-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
            HavaVerse Studio · AI Entertainment Director
          </p>
          <ProjectSwitcher title={project.title} />
          <p className="mt-0.5 text-xs text-mist-400">
            {project.format} · {project.owner} ·{' '}
            <span className="font-semibold text-brand-indigo">
              {project.state.replace(/_/g, ' ').toLowerCase()}
            </span>
            {activeJobs.length > 0 && ` · ${activeJobs.length} running`}
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div
            role="radiogroup"
            aria-label="Control level"
            className="flex rounded-full border border-white/10 p-0.5">
            
            {modes.map((mode) =>
            <button
              key={mode.key}
              type="button"
              role="radio"
              aria-checked={project.mode === mode.key}
              title={mode.hint}
              onClick={() => setMode(mode.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ease-entrance ${
              project.mode === mode.key ?
              'bg-brand-indigo text-white' :
              'text-mist-300 hover:text-white'}`
              }>
              
                {mode.label}
              </button>
            )}
          </div>

          <Link
            to="/studio/bible"
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
            Story bible
          </Link>

          {/* Always reachable: the publish page shows exactly what holds the release. */}
          <Link
            to="/studio/publish"
            title={publish.allowed ? 'Cleared — review and publish' : publish.reason}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 ease-entrance ${
            publish.allowed ?
            'bg-brand-cyan text-ink-950 hover:bg-white' :
            'bg-ink-700 text-mist-300 hover:text-white'}`
            }>
            
            {!publish.allowed && <LockIcon className="h-4 w-4" aria-hidden="true" />}
            Publish
          </Link>
        </div>
      </header>

      <div className="grid gap-5 pt-5 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <section aria-labelledby="pipeline-heading" className="order-2 lg:order-1">
          <h2
            id="pipeline-heading"
            className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
            
            Production pipeline
          </h2>
          <PipelineRail stages={stages} />
          <Link
            to="/studio/jobs"
            className="mt-3 flex items-center gap-1 px-2.5 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
            
            Job queue{activeJobs.length > 0 && ` (${activeJobs.length})`}
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>

        <div className="order-1 min-w-0 space-y-5 lg:order-2">
          <DirectorConsole />

          <section aria-labelledby="storyboard-heading">
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <div>
                <h2 id="storyboard-heading" className="text-lg font-bold tracking-tight text-white">
                  Storyboard
                </h2>
                <p className="text-xs text-mist-400">
                  {shots.length} shots · {scenes.length} scenes · {sequences.length} sequences · {approvedShots} approved
                </p>
              </div>
            </div>

            {shots.length === 0 &&
            <EmptyBlock
              title="No scenes or shots yet"
              body={`${project.title} is in story development. Its Story Bible holds the idea; scenes and shots appear here once the screenplay is broken down.`}
              action={
              <Link
                to="/studio/bible"
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 hover:text-white">
                
                    Open the Story Bible
                  </Link>
              } />

            }

            <div className="space-y-8">
              {sequences.map((sequence) => {
                const seqShotIds = shots.filter((s) => sequence.sceneIds.includes(s.sceneId)).map((s) => s.id);
                const attention =
                violations.filter((v) => seqShotIds.includes(v.shotId)).length +
                stale.filter((s) => seqShotIds.includes(s.shotId)).length;
                return (
                  <div key={sequence.id}>
                    <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-white/5 pb-2">
                      <Link
                        to={`/studio/sequence/${sequence.id}`}
                        className="text-sm font-bold text-white transition-colors duration-150 ease-entrance hover:text-brand-indigo">
                        
                        Sequence {sequence.number} · {sequence.title}
                      </Link>
                      <span className="text-[11px] text-mist-400">
                        v{sequence.versions[0].n} · {sequence.dramaticObjective}
                      </span>
                      {attention > 0 &&
                      <span className="ml-auto text-[11px] font-semibold text-brand-amber">
                          {attention} need attention
                        </span>
                      }
                    </div>
                    <div className="space-y-5">
              {scenes.filter((scene) => sequence.sceneIds.includes(scene.id)).map((scene) => {
                        const sceneShots = shots.filter((s) => s.sceneId === scene.id);
                        const done = sceneShots.filter((s) =>
                        ['generated', 'approved'].includes(s.status)
                        ).length;
                        return (
                          <div key={scene.id}>
                    <div className="mb-2 flex flex-wrap items-baseline gap-2">
                      <Link
                                to={`/studio/scene/${scene.id}`}
                                className="text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:text-brand-indigo">
                                
                        Scene {scene.number} · {scene.slug}
                      </Link>
                      <span className="text-[11px] tabular-nums text-mist-400">
                        {done}/{sceneShots.length} generated
                      </span>
                      <button
                                type="button"
                                onClick={() => setSceneApproval(scene.id, !scene.approved)}
                                disabled={pending === `scene:${scene.id}`}
                                className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors duration-150 ease-entrance ${
                                scene.approved ?
                                'bg-brand-cyan/15 text-brand-cyan' :
                                'border border-white/15 text-mist-300 hover:text-white'}`
                                }>
                                
                        {scene.approved ? 'Screenplay approved' : 'Approve screenplay'}
                      </button>
                    </div>
                    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                      {sceneShots.map((shot) =>
                              <li key={shot.id}>
                          <ShotCard
                                  shot={shot}
                                  job={jobs.find(
                                    (j) =>
                                    j.shotId === shot.id &&
                                    !['COMPLETED', 'CANCELLED', 'FAILED'].includes(j.status)
                                  )} />
                                
                        </li>
                              )}
                    </ul>
                  </div>);

                      })}
                    </div>
                  </div>);

              })}
            </div>
          </section>

          <section
            aria-labelledby="graph-heading"
            className="rounded-2xl border border-white/5 bg-ink-900 p-4 sm:p-5">
            
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="graph-heading" className="text-base font-bold text-white">
                Content graph
              </h2>
              {publicSlug ?
              <Link
                to={`/title/${publicSlug}`}
                className="ml-auto flex items-center gap-1 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
                
                  Open public page
                  <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </Link> :

              <span className="ml-auto text-xs text-mist-400">Not published yet</span>
              }
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-6">
              {[
              ['Characters', characters.length],
              ['Locations', locations.length],
              ['Scenes', scenes.length],
              ['Shots', shots.length],
              ['Versions', shots.reduce((n, s) => n + s.versions.length, 0)],
              ['Jobs run', jobs.length]].
              map(([label, value]) =>
              <div key={label as string}>
                  <dt className="text-[11px] text-mist-400">{label}</dt>
                  <dd className="font-display text-2xl tracking-wide text-white">{value}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        <aside className="order-3 space-y-4">
          <AgentFeed runs={runs} />
          <FilmMemoryPanel />
          <LockedAssetsPanel />
          <PublicationGatePanel gate={publish} />
          <VersionsPanel />
          <CostPanel jobs={jobs} credits={project.creditsRemaining} />
        </aside>
      </div>
    </div>);

}