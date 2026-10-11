import React from 'react';
import { CheckIcon } from 'lucide-react';
import { formatPrice } from '../../contexts/CommerceContext';
import { usePodcast } from '../../contexts/PodcastContext';
import type { PodDrop } from '../../types/podcast';

/**
 * Drops are events rather than shelf items. Each state says plainly what is
 * possible: claim it, wait for it, or nothing.
 */
export function DropCard({ drop }: {drop: PodDrop;}) {
  const { hasCollected, collect, isNotifying, toggleNotify, pending } = usePodcast();
  const owned = hasCollected(drop.id);
  const busy = pending === `collect:${drop.id}`;
  const waiting = isNotifying(drop.id);

  const claimedPercent =
  drop.total && drop.remaining !== undefined ?
  Math.round((drop.total - drop.remaining) / drop.total * 100) :
  null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      <div className="relative">
        <img src={drop.image} alt="" className="aspect-[16/10] w-full object-cover" />
        {drop.state === 'closing' &&
        <span className="absolute left-2 top-2 rounded-full bg-brand-amber px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-950">
            Closing
          </span>
        }
        {drop.state === 'sold-out' &&
        <span className="absolute left-2 top-2 rounded-full bg-ink-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-mist-300">
            Fully claimed
          </span>
        }
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-violet">
          {drop.kind}
        </p>
        <h3 className="mt-1 text-sm font-bold leading-tight text-white">{drop.name}</h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-mist-300">{drop.blurb}</p>

        <ul className="mt-2 space-y-1">
          {drop.includes.slice(0, 3).map((item) =>
          <li key={item} className="flex items-start gap-1.5 text-[11px] text-mist-300">
              <CheckIcon
              className="mt-0.5 h-3 w-3 shrink-0 text-brand-cyan"
              aria-hidden="true" />
            
              {item}
            </li>
          )}
        </ul>

        {claimedPercent !== null &&
        <div className="mt-2.5">
            <span className="block h-1 overflow-hidden rounded-full bg-white/10">
              <span
              style={{ width: `${claimedPercent}%` }}
              className="block h-full rounded-full bg-brand-amber" />
            
            </span>
            <p className="mt-1 text-[10px] tabular-nums text-mist-400">
              {drop.remaining === 0 ?
            `${drop.total} / ${drop.total} claimed` :
            `${drop.remaining} of ${drop.total} remaining`}
            </p>
          </div>
        }

        {drop.releasesAt &&
        <p className="mt-2.5 text-[11px] font-medium text-brand-amber">{drop.releasesAt}</p>
        }

        <div className="mt-auto pt-3">
          <p className="text-sm font-bold text-white">{formatPrice(drop.price)}</p>
          {drop.state === 'upcoming' ?
          <button
            type="button"
            onClick={() => toggleNotify(drop.id, drop.name)}
            aria-pressed={waiting}
            className={`mt-2 w-full rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors duration-150 ease-entrance ${
            waiting ?
            'border border-brand-amber/40 text-brand-amber' :
            'border border-white/20 text-white hover:bg-white/10'}`
            }>
            
              {waiting ? "We'll remind you" : 'Remind me'}
            </button> :

          <button
            type="button"
            disabled={owned || drop.state === 'sold-out' || busy}
            onClick={() => collect(drop.id, drop.name)}
            className={`mt-2 w-full rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors duration-150 ease-entrance ${
            owned ?
            'cursor-default bg-brand-cyan/15 text-brand-cyan' :
            drop.state === 'sold-out' ?
            'cursor-not-allowed bg-ink-800 text-mist-400' :
            'bg-brand-violet text-white hover:bg-brand-magenta'}`
            }>
            
              {owned ?
            'In your collection' :
            busy ?
            'Claiming…' :
            drop.state === 'sold-out' ?
            'Fully claimed' :
            'Collect'}
            </button>
          }
        </div>
      </div>
    </article>);

}