import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, CheckIcon, RefreshCwIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { AssetRow } from '../../components/director/AssetRow';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { assetTypeLabel, since } from '../../utils/continuity';
import type { LockedAssetType } from '../../types/continuity';

const order: LockedAssetType[] = ['character', 'location', 'wardrobe', 'prop', 'vehicle', 'grade'];

const actionLabel = { lock: 'Locked', unlock: 'Unlocked', create_version: 'New version' } as const;

export function Continuity() {
  const {
    status,
    reload,
    project,
    assets,
    audit,
    continuity,
    lockAsset,
    generateShot,
    recheckAll,
    pending
  } = useDirector();

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading continuity layer…" />
      </div>);

  }
  if (status === 'error' || !project || !continuity) {
    return (
      <div className="p-5">
        <ErrorBlock message="The continuity layer could not be loaded." onRetry={reload} />
      </div>);

  }

  const blocking = continuity.blockingFailures.length + continuity.unlockedInUse.length;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <Link
        to="/studio"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {project.title}
      </Link>

      <header className="mt-3 flex flex-wrap items-end gap-4 border-b border-white/5 pb-5">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-white">Continuity</h1>
          <p className="mt-1 max-w-2xl text-sm text-mist-300">
            Locked assets are what every generation must respect. Changes create a new version — nothing
            locked is ever edited in place.
          </p>
        </div>
        <button
          type="button"
          onClick={recheckAll}
          disabled={pending === 'check:all'}
          className="ml-auto flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/5 disabled:text-mist-400">
          
          <RefreshCwIcon className={`h-4 w-4 ${pending === 'check:all' ? 'animate-spin' : ''}`} aria-hidden="true" />
          {pending === 'check:all' ? 'Verifying…' : 'Re-verify all locks'}
        </button>
      </header>

      <div className="grid gap-8 pt-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="needs-heading">
            <h2 id="needs-heading" className="flex items-center gap-2 text-base font-bold text-white">
              {blocking === 0 ?
              <CheckIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" /> :

              <AlertTriangleIcon className="h-4 w-4 text-live" aria-hidden="true" />
              }
              {blocking === 0 ? 'Continuity gate clear' : `Holding the publication gate · ${blocking}`}
            </h2>

            {blocking === 0 ?
            <p className="mt-2 text-sm text-mist-300">Every lock is verified against every rendered shot.</p> :

            <ul className="mt-3 divide-y divide-white/5 rounded-2xl border border-live/25 bg-live/[0.04]">
                {continuity.unlockedInUse.map((a) =>
              <li key={a.assetId} className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{a.name} is not continuity-locked</p>
                      <p className="text-xs text-mist-300">
                        Used in {a.shotCount} shots. New generations with it fail quality control until it is locked.
                      </p>
                    </div>
                    <button
                  type="button"
                  onClick={() => lockAsset(a.assetId)}
                  disabled={pending === `lock:${a.assetId}`}
                  className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:opacity-60">
                  
                      {pending === `lock:${a.assetId}` ? 'Locking…' : 'Lock'}
                    </button>
                  </li>
              )}
                {continuity.blockingFailures.map((f) =>
              <li key={`${f.assetId}:${f.shotId}`} className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        <Link to={`/studio/shot/${f.shotId}`} className="hover:text-brand-indigo">
                          Shot {f.shotCode}
                        </Link>{' '}
                        <span className="font-normal text-mist-400">· {f.assetName}</span>
                      </p>
                      <p className="text-xs text-mist-300">{f.reason}</p>
                      {f.suggestedAction && <p className="mt-0.5 text-[11px] text-mist-400">{f.suggestedAction}</p>}
                    </div>
                    <button
                  type="button"
                  onClick={() => generateShot(f.shotId)}
                  disabled={pending === `gen:${f.shotId}`}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100 disabled:opacity-60">
                  
                      {pending === `gen:${f.shotId}` ? 'Queuing…' : 'Regenerate'}
                    </button>
                  </li>
              )}
              </ul>
            }
          </section>

          {order.map((type) => {
            const group = assets.filter((a) => a.type === type && a.status !== 'archived');
            if (group.length === 0) return null;
            const locked = group.filter((a) => a.status === 'locked').length;
            return (
              <section key={type} aria-labelledby={`group-${type}`}>
                <div className="flex items-baseline gap-2 border-b border-white/5 pb-2">
                  <h2 id={`group-${type}`} className="text-base font-bold text-white">
                    {assetTypeLabel[type]}
                  </h2>
                  <span className="text-xs tabular-nums text-mist-400">
                    {locked} of {group.length} locked
                  </span>
                </div>
                <ul className="divide-y divide-white/5">
                  {group.map((asset) =>
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    summary={continuity.assets.find((s) => s.assetId === asset.id)} />

                  )}
                </ul>
              </section>);

          })}
        </div>

        <aside className="space-y-6">
          <section aria-labelledby="audit-heading">
            <h2 id="audit-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
              Audit log
            </h2>
            {audit.length === 0 ?
            <p className="mt-2 text-[11px] leading-relaxed text-mist-400">
                No lock, unlock or version changes this session. Every one you make is recorded here with who and why.
              </p> :

            <ol className="mt-3 space-y-3 border-l border-white/10 pl-3">
                {audit.map((entry) =>
              <li key={entry.id} className="text-[11px]">
                    <p className="font-semibold text-white">
                      {actionLabel[entry.action]} · {entry.assetName} v{entry.version}
                    </p>
                    {entry.reason && <p className="text-mist-300">“{entry.reason}”</p>}
                    <p className="text-[10px] text-mist-400">
                      {entry.userId} · {since(entry.timestamp)}
                    </p>
                  </li>
              )}
              </ol>
            }
          </section>

          <section className="border-t border-white/5 pt-5 text-[11px] leading-relaxed text-mist-400">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">How verification works</h2>
            <p className="mt-2">
              The Continuity Agent runs when an asset is locked, after every generation, and on demand. It compares
              what each shot was rendered against — asset versions and wardrobe — with the current locks.
            </p>
            <p className="mt-2">
              In this prototype that comparison uses recorded render evidence, and confidence reflects the size of the
              reference package. Image-level matching (reference embeddings) replaces it without changing this screen.
            </p>
          </section>
        </aside>
      </div>
    </div>);

}