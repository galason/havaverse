import React from 'react';
import { Link } from 'react-router-dom';
import { economyLines } from '../../data/music';
import { formatPrice } from '../../contexts/CommerceContext';

/**
 * Creator-side economics as attributed activity. Deliberately not a single
 * "royalty rate" — that number is always either misleading or meaningless.
 */
export function EconomyPanel() {
  const total = economyLines.reduce((sum, line) => sum + line.amount, 0);

  return (
    <section
      aria-labelledby="creator-economy"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <h2 id="creator-economy" className="text-sm font-bold tracking-tight text-white">
        Creator economy
      </h2>
      <p className="mt-0.5 text-[11px] text-mist-400">
        This month, attributed across the ecosystem.
      </p>

      <p className="mt-3 text-2xl font-bold tabular-nums text-white">{formatPrice(total)}</p>

      <div
        className="mt-2 flex h-2 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={economyLines.map((l) => `${l.label} ${l.share} percent`).join(', ')}>
        
        {economyLines.map((line, i) =>
        <span
          key={line.label}
          style={{ width: `${line.share}%` }}
          className={
          ['bg-brand-violet', 'bg-brand-magenta', 'bg-brand-indigo', 'bg-brand-cyan', 'bg-brand-amber', 'bg-mist-400'][i % 6]
          } />

        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        {economyLines.map((line) =>
        <div key={line.label} className="rounded-xl border border-white/5 bg-ink-850 p-2.5">
            <dt className="text-[10px] uppercase tracking-wide text-mist-400">{line.label}</dt>
            <dd className="mt-0.5 text-sm font-bold tabular-nums text-white">
              {formatPrice(line.amount)}
            </dd>
            <dd className="text-[10px] font-semibold text-brand-cyan">{line.trend}</dd>
          </div>
        )}
      </dl>

      <Link
        to="/wallet"
        className="mt-3 block rounded-lg border border-white/15 px-4 py-2.5 text-center text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
        
        View HavaPay ledger
      </Link>
    </section>);

}