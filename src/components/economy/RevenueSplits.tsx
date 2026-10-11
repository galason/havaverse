import React from 'react';
import type { RevenueSourceConfig } from '../../types/creatorEconomy';

interface RevenueSplitsProps {
  sources: RevenueSourceConfig[];
}

export function RevenueSplits({ sources }: RevenueSplitsProps) {
  return (
    <section aria-labelledby="splits-heading">
      <h2 id="splits-heading" className="text-lg font-bold tracking-tight text-white">
        Revenue splits
      </h2>
      <p className="mt-0.5 max-w-2xl text-xs text-mist-400">
        How each sale is divided before it reaches you, and how long it takes to clear. Splits are set by
        your agreements with HavaVerse and any rights holders; they’re shown here, not edited here.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="sr-only">Revenue split by source</caption>
          <thead className="bg-ink-850 text-[11px] uppercase tracking-[0.1em] text-mist-400">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Source</th>
              <th scope="col" className="w-64 px-4 py-3 font-semibold">Split</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Clears after</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-ink-900">
            {sources.map((s) =>
            <tr key={s.id}>
                <th scope="row" className="px-4 py-3 font-normal">
                  <span className="block font-medium text-white">{s.label}</span>
                  <span className="block text-[11px] text-mist-400">{s.description}</span>
                </th>
                <td className="px-4 py-3">
                  <div
                  className="flex h-2 overflow-hidden rounded-full bg-white/10"
                  role="img"
                  aria-label={`You ${s.split.creator}%, rights holders ${s.split.rightsHolder}%, HavaVerse ${s.split.platform}%`}>
                  
                    <div className="bg-brand-indigo" style={{ width: `${s.split.creator}%` }} />
                    <div className="bg-brand-amber" style={{ width: `${s.split.rightsHolder}%` }} />
                    <div className="bg-white/25" style={{ width: `${s.split.platform}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] tabular-nums text-mist-300">
                    You {s.split.creator}%
                    {s.split.rightsHolder > 0 && ` · Rights ${s.split.rightsHolder}%`} · HavaVerse {s.split.platform}%
                  </p>
                </td>
                <td className="px-4 py-3 text-right text-xs text-mist-300">{s.clearingDays} days</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>);

}