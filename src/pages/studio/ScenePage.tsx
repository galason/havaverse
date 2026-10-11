import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { ShotCard } from '../../components/director/ShotCard';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';

export function ScenePage() {
  const { sceneId = '' } = useParams();
  const {
    scenes,
    shots,
    characters,
    locations,
    jobs,
    status,
    reload,
    setSceneApproval,
    pending
  } = useDirector();

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading scene…" />
      </div>);

  }

  const scene = scenes.find((s) => s.id === sceneId);
  if (!scene) {
    return (
      <div className="p-5">
        <ErrorBlock message="That scene is not in this project." onRetry={reload} />
      </div>);

  }

  const sceneShots = shots.filter((s) => s.sceneId === scene.id);
  const location = locations.find((l) => l.id === scene.locationId);
  const inScene = characters.filter((c) => scene.characterIds.includes(c.id));
  const generated = sceneShots.filter((s) => ['generated', 'approved'].includes(s.status)).length;

  return (
    <div className="p-4 pb-12 sm:p-5">
      <Link
        to="/studio"
        className="mb-4 flex w-fit items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back to the Director
      </Link>

      <header className="flex flex-wrap items-start gap-4 border-b border-white/5 pb-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
            Act {scene.act} · Scene {scene.number}
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {scene.slug}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-mist-200">{scene.synopsis}</p>
          <p className="mt-1 text-[11px] text-mist-400">
            {scene.pages} pages · {sceneShots.length} shots · {generated} generated
            {location && ` · ${location.name}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSceneApproval(scene.id, !scene.approved)}
          disabled={pending === `scene:${scene.id}`}
          className={`ml-auto rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 ease-entrance ${
          scene.approved ?
          'bg-brand-cyan/15 text-brand-cyan' :
          'border border-white/20 text-white hover:bg-white/10'}`
          }>
          
          {scene.approved ? 'Screenplay approved' : 'Approve screenplay'}
        </button>
      </header>

      <div className="grid gap-5 pt-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section aria-labelledby="scene-shots">
          <h2 id="scene-shots" className="mb-3 text-base font-bold tracking-tight text-white">
            Coverage
          </h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
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
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">In this scene</h2>
            <ul className="mt-2.5 space-y-2">
              {inScene.map((character) =>
              <li key={character.id} className="flex items-center gap-2.5">
                  <img
                  src={character.portrait}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover" />
                
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-white">
                      {character.name}
                    </span>
                    <span className="block text-[10px] text-mist-400">{character.role}</span>
                  </span>
                </li>
              )}
            </ul>
          </section>

          {location &&
          <section className="overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
              <img src={location.plate} alt="" className="aspect-video w-full object-cover" />
              <div className="p-4">
                <h2 className="text-sm font-bold text-white">{location.name}</h2>
                <p className="mt-1 text-[11px] leading-relaxed text-mist-300">
                  {location.lighting}. {location.weather}
                </p>
              </div>
            </section>
          }
        </aside>
      </div>
    </div>);

}