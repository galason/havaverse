import React from 'react';
import { CheckIcon } from 'lucide-react';
import { formatPrice, useCommerce } from '../../contexts/CommerceContext';
import type { HavaPass } from '../../types/commerce';

/**
 * A pass creates an ongoing relationship with an IP rather than a one-off
 * sale, which is why it is priced and presented against the whole universe.
 */
export function PassCard({ pass }: {pass: HavaPass;}) {
  const { hasPass, acquirePass } = useCommerce();
  const owned = hasPass(pass.id);

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-amber/25 bg-ink-900">
      <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="relative min-h-[180px]">
          <img src={pass.image} alt="" loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 rounded bg-brand-amber px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-950">
            HavaPass
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-xl font-bold tracking-tight text-white">{pass.name}</h3>
          <p className="mt-1 text-sm text-mist-300">{pass.tagline}</p>
          <p className="mt-0.5 text-[11px] text-mist-400">{pass.holders}</p>

          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
            {pass.includes.map((item) =>
            <li key={item} className="flex items-start gap-1.5 text-xs text-mist-200">
                <CheckIcon
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-amber"
                aria-hidden="true" />
              
                {item}
              </li>
            )}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-2xl font-bold text-white">{formatPrice(pass.price)}</p>
            <button
              type="button"
              disabled={owned}
              onClick={() => acquirePass(pass.id, pass.name)}
              className={[
              'rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-150 ease-entrance',
              owned ?
              'cursor-default bg-brand-cyan/15 text-brand-cyan' :
              'bg-brand-amber text-ink-950 hover:bg-brand-amber/85'].
              join(' ')}>
              
              {owned ? 'You hold this pass' : 'Get the pass'}
            </button>
            <p className="text-[11px] text-mist-400">
              Eight things, one relationship — cheaper than buying three of them separately.
            </p>
          </div>
        </div>
      </div>
    </article>);

}