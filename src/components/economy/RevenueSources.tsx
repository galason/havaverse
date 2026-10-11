import React from 'react';
import type { SourceSummary } from '../../types/creatorEconomy';
import { naira } from '../../utils/currency';

interface RevenueSourcesProps {
  sources: SourceSummary[];
  periods: {current: string;previous: string;};
}

export function RevenueSources({ sources, periods }: RevenueSourcesProps) {
  const ordered = [...sources].sort((a, b) => b.current - a.current || b.previous - a.previous);

  return (
    <section aria-labelledby="sources-heading">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="sources-heading" className="text-lg font-bold tracking-tight text-white">
          Where your money comes from
        </h2>
        <p className="text-[11px] text-mist-400">{periods.current} vs {periods.previous}</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full min-w-[520px] text-left text-sm">
          <caption className="sr-only">Earnings by revenue source</caption>
          <thead className="bg-ink-850 text-[11px] uppercase tracking-[0.1em] text-mist-400">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Source</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">This month</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Last month</th>
              <th scope="col" className="w-40 px-4 py-3 font-semibold">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-ink-900">
            {ordered.map((s) => {
              const empty = s.current === 0 && s.previous === 0;
              return (
                <tr key={s.id}>
                  <th scope="row" className="px-4 py-3 font-medium text-white">
                    {s.label}
                    {empty && <span className="ml-2 text-[11px] font-normal text-mist-400">None yet</span>}
                  </th>
                  <td className="px-4 py-3 text-right tabular-nums text-white">
                    {empty ? '—' : naira(s.current)}
                    {s.change !== null &&
                    <span
                      className={[
                      'ml-2 text-[11px]',
                      s.change >= 0 ? 'text-brand-cyan' : 'text-mist-400'].
                      join(' ')}>
                      
                        {s.change >= 0 ? '+' : '−'}
                        {Math.abs(s.change)}%
                      </span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-mist-300">
                    {s.previous ? naira(s.previous) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-brand-indigo" style={{ width: `${s.share}%` }} />
                      </div>
                      <span className="w-8 text-right text-[11px] tabular-nums text-mist-400">{s.share}%</span>
                    </div>
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-mist-400">
        This month is still running, so a lower figure than last month is expected until month end.
      </p>
    </section>);

}