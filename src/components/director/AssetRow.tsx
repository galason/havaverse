import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, LockIcon, RefreshCwIcon, UnlockIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDirector } from '../../contexts/DirectorContext';
import { checkStatusLabel, since } from '../../utils/continuity';
import type { AssetContinuitySummary, LockedAsset } from '../../types/continuity';

type Mode = 'idle' | 'unlock' | 'version';

const statusTone: Record<string, string> = {
  verified: 'text-brand-cyan',
  failed: 'text-live',
  partial: 'text-brand-amber',
  running: 'text-brand-indigo',
  unchecked: 'text-mist-400'
};

function describeField(asset: LockedAsset): string {
  const payload = asset.payload as unknown as Record<string, string | undefined>;
  return (asset.type === 'character' ? payload.faceDescription : payload.description) ?? '';
}

export function AssetRow({ asset, summary }: {asset: LockedAsset;summary?: AssetContinuitySummary;}) {
  const { checks, lockAsset, unlockAsset, createAssetVersion, recheckAsset, pending } = useDirector();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>('idle');
  const [reason, setReason] = React.useState('');
  const [description, setDescription] = React.useState('');
  const latest = checks.find((c) => c.assetId === asset.id);
  const locked = asset.status === 'locked';
  const busy = pending?.endsWith(asset.id) ?? false;

  function startVersion() {
    setDescription(describeField(asset));
    setReason('');
    setMode('version');
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const done =
    mode === 'unlock' ?
    await unlockAsset(asset.id, reason) :
    await createAssetVersion(asset.id, description, reason);
    if (done) setMode('idle');
  }

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left">
          
          {locked ?
          <LockIcon className="h-4 w-4 shrink-0 text-brand-cyan" aria-label="Locked" /> :

          <UnlockIcon className="h-4 w-4 shrink-0 text-brand-amber" aria-label="Draft" />
          }
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">
              {asset.name} <span className="font-normal text-mist-400">v{asset.version}</span>
            </span>
            <span className="block text-[11px] text-mist-400">
              {locked ? `Locked ${since(asset.lockedAt)} by ${asset.lockedBy}` : 'Draft — not enforced on generation'}
            </span>
          </span>
          <ChevronDownIcon
            className={`ml-1 h-4 w-4 shrink-0 text-mist-400 transition-transform duration-150 ease-entrance ${open ? 'rotate-180' : ''}`}
            aria-hidden="true" />
          
        </button>

        <p className={`w-40 text-[11px] font-semibold ${statusTone[summary?.status ?? 'unchecked']}`}>
          {checkStatusLabel[summary?.status ?? 'unchecked']}
          {summary && locked && summary.totalShotCount > 0 &&
          <span className="block font-normal text-mist-400">
              {summary.verifiedShotCount}/{summary.totalShotCount} shots · {Math.round(summary.confidence * 100)}%
            </span>
          }
        </p>

        <div className="flex items-center gap-1.5">
          {locked ?
          <button
            type="button"
            onClick={() => {setReason('');setMode('unlock');setOpen(true);}}
            className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
              Unlock
            </button> :

          <button
            type="button"
            onClick={() => lockAsset(asset.id)}
            disabled={busy}
            className="rounded-full bg-brand-indigo px-3 py-1.5 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:opacity-60">
            
              {pending === `lock:${asset.id}` ? 'Locking…' : `Lock v${asset.version}`}
            </button>
          }
          <button
            type="button"
            onClick={startVersion}
            className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
            New version
          </button>
          <button
            type="button"
            onClick={() => recheckAsset(asset.id)}
            disabled={pending === `check:${asset.id}` || !locked}
            aria-label={`Re-check ${asset.name}`}
            title={locked ? 'Re-check continuity' : 'Lock before verifying'}
            className="rounded-full border border-white/10 p-1.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white disabled:opacity-40">
            
            <RefreshCwIcon
              className={`h-3.5 w-3.5 ${pending === `check:${asset.id}` ? 'animate-spin' : ''}`}
              aria-hidden="true" />
            
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden">
          
            <div className="mt-3 grid gap-4 pl-6 md:grid-cols-2">
              {mode !== 'idle' &&
            <form onSubmit={submit} className="space-y-2 md:col-span-2">
                  {mode === 'version' &&
              <label className="block">
                      <span className="text-[11px] font-semibold text-mist-300">
                        What changes in v{asset.version + 1}
                      </span>
                      <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-xs text-white focus:border-brand-indigo/60 focus:outline-none" />
                
                    </label>
              }
                  <label className="block">
                    <span className="text-[11px] font-semibold text-mist-300">
                      {mode === 'unlock' ? 'Why unlock? (audited)' : 'Reason (audited)'}
                    </span>
                    <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-xs text-white focus:border-brand-indigo/60 focus:outline-none" />
                
                  </label>
                  <p className="text-[10px] leading-relaxed text-mist-400">
                    {mode === 'unlock' ?
                'Temporary unlock: new generations with this asset fail continuity until it is locked again.' :
                `v${asset.version} is preserved unchanged. v${asset.version + 1} starts as a draft; shots rendered on v${asset.version} will be flagged once you lock it.`}
                  </p>
                  <div className="flex gap-2">
                    <button
                  type="submit"
                  disabled={busy}
                  className="rounded-full bg-brand-indigo px-3.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60">
                  
                      {busy ? 'Saving…' : mode === 'unlock' ? 'Unlock' : `Create v${asset.version + 1}`}
                    </button>
                    <button
                  type="button"
                  onClick={() => setMode('idle')}
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-mist-300 hover:text-white">
                  
                      Cancel
                    </button>
                  </div>
                </form>
            }

              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mist-400">
                  Latest check
                </h4>
                {latest ?
              <div className="mt-1.5 text-[11px] text-mist-300">
                    <p>
                      {checkStatusLabel[latest.status]} · {latest.shotIds.length} shots · triggered by{' '}
                      {latest.triggeredBy} · {since(latest.completedAt)}
                    </p>
                    {latest.note && <p className="mt-1 text-mist-400">{latest.note}</p>}
                    {latest.failures.length > 0 &&
                <ul className="mt-2 space-y-1.5">
                        {latest.failures.map((f) =>
                  <li key={f.shotId}>
                            <Link to={`/studio/shot/${f.shotId}`} className="font-semibold text-white hover:text-brand-indigo">
                              Shot {f.shotCode}
                            </Link>{' '}
                            <span className="text-[10px] uppercase text-live">{f.severity}</span>
                            <span className="block text-mist-300">{f.reason}</span>
                          </li>
                  )}
                      </ul>
                }
                    <p className="mt-1.5 text-[10px] text-mist-400">{latest.agentVersion}</p>
                  </div> :

              <p className="mt-1.5 text-[11px] text-mist-400">Not checked yet.</p>
              }
              </div>

              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mist-400">
                  Versions
                </h4>
                <ol className="mt-1.5 space-y-1.5">
                  {asset.history.map((v) =>
                <li key={v.id} className="text-[11px]">
                      <span className="font-semibold text-white">v{v.version}</span>
                      {v.version === asset.version && <span className="ml-1.5 text-brand-cyan">current</span>}
                      <span className="text-mist-400"> · {v.reason} · {since(v.createdAt)}</span>
                    </li>
                )}
                </ol>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </li>);

}