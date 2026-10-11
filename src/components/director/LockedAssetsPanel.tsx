import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, ArrowRightIcon, CheckIcon, LockIcon, UnlockIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { assetTypeLabel, confidenceLabel } from '../../utils/continuity';
import type { LockedAssetType } from '../../types/continuity';

const order: LockedAssetType[] = ['character', 'location', 'wardrobe', 'prop', 'vehicle', 'grade'];

/** Right-rail summary of the continuity layer: what is locked, and what holds. */
export function LockedAssetsPanel() {
  const { continuity, lockAsset, pending } = useDirector();
  if (!continuity) return null;

  const characters = continuity.assets.filter((a) => a.type === 'character');

  return (
    <section aria-labelledby="locked-heading" className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      <div className="flex items-center gap-2">
        <h2 id="locked-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
          Locked assets
        </h2>
        <Link
          to="/studio/continuity"
          className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          
          Manage
          <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <dl className="mt-3 space-y-1.5">
        {order.map((type) => {
          const group = continuity.assets.filter((a) => a.type === type);
          if (group.length === 0) return null;
          const locked = group.filter((a) => a.locked).length;
          const all = locked === group.length;
          const single = group.length === 1 ? group[0] : null;
          return (
            <div key={type} className="flex items-center gap-2 text-[11px]">
              <dt className="text-mist-300">{assetTypeLabel[type]}</dt>
              <dd className="ml-auto flex items-center gap-1.5 tabular-nums text-white">
                {single ? `${single.locked ? 'Locked' : 'Draft'} v${single.version}` : `${locked} of ${group.length} locked`}
                {all ?
                <LockIcon className="h-3 w-3 text-brand-cyan" aria-label="All locked" /> :

                <UnlockIcon className="h-3 w-3 text-brand-amber" aria-label="Not all locked" />
                }
              </dd>
            </div>);

        })}
      </dl>

      <ul className="mt-3 space-y-2 border-t border-white/5 pt-3">
        {characters.map((asset) => {
          const failures = continuity.blockingFailures.filter((f) => f.assetId === asset.assetId).length;
          return (
            <li key={asset.assetId} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">
                {!asset.locked || failures > 0 ?
                <AlertTriangleIcon className="h-3.5 w-3.5 text-brand-amber" aria-hidden="true" /> :

                <CheckIcon className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />
                }
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-white">
                  {asset.name} <span className="font-normal text-mist-400">v{asset.version}</span>
                </span>
                <span className="block text-[10px] text-mist-400">
                  {!asset.locked ?
                  'Not continuity-locked' :
                  asset.status === 'verified' ?
                  `Verified across ${asset.verifiedShotCount} shots · ${confidenceLabel(asset.confidence)} confidence` :
                  asset.status === 'failed' ?
                  `${failures} ${failures === 1 ? 'shot fails' : 'shots fail'} the lock` :
                  'No rendered shots yet'}
                </span>
              </span>
              {!asset.locked &&
              <button
                type="button"
                onClick={() => lockAsset(asset.assetId)}
                disabled={pending === `lock:${asset.assetId}`}
                className="shrink-0 rounded-full bg-brand-indigo px-2.5 py-1 text-[10px] font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:opacity-60">
                
                  {pending === `lock:${asset.assetId}` ? 'Locking…' : 'Lock'}
                </button>
              }
            </li>);

        })}
      </ul>

      {continuity.blockingFailures.some((f) => !characters.some((c) => c.assetId === f.assetId)) &&
      <p className="mt-3 text-[10px] leading-relaxed text-brand-amber">
          {continuity.blockingFailures.
        filter((f) => !characters.some((c) => c.assetId === f.assetId)).
        map((f) => `Shot ${f.shotCode}: ${f.assetName}`).
        join(' · ')}
        </p>
      }
    </section>);

}