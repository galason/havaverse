import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3Icon } from 'lucide-react';
import { podEconomyLines } from '../../data/podcast';

/**
 * Creator economics as attributed activity across the ecosystem. Deliberately
 * not a royalty rate — the platform does not publish one, and inventing a
 * percentage here would be a claim we cannot stand behind.
 */
export function EconomyPanel() {
  const max = Math.max(...podEconomyLines.map((line) => line.share));

  return (
    <section
      aria-labelledby="creator-economy"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <h2
        id="creator-economy"
        className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">
        
        <BarChart3Icon className="h-4 w-4 text-brand-amber" aria-hidden="true" />
        Creator economy
      </h2>
      <p className="mt-0.5 text-[11px] text-mist-400">
        This month, attributed across the ecosystem.
      </p>

      <dl className="mt-3 space-y-2.5">
        {podEconomyLines.map((line) =>
        <div key={line.label}>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-[11px] text-mist-300">{line.label}</dt>
              <dd className="text-xs font-semibold tabular-nums text-white">
                {line.display}
                <span className="ml-1.5 text-[10px] font-medium text-brand-cyan">{line.trend}</span>
              </dd>
            </div>
            {line.share > 0 &&
          <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/10">
                <span
              style={{ width: `${Math.round(line.share / max * 100)}%` }}
              className="block h-full rounded-full bg-brand-amber" />
            
              </span>
          }
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