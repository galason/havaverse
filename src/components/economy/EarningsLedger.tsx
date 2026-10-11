import React from 'react';
import type { EarningEntry, EarningStatus, RevenueSourceConfig } from '../../types/creatorEconomy';
import { naira, shortDate } from '../../utils/currency';

interface EarningsLedgerProps {
  entries: EarningEntry[];
  sourceConfig: RevenueSourceConfig[];
}

type Filter = 'all' | EarningStatus;

const filters: {id: Filter;label: string;}[] = [
{ id: 'all', label: 'All' },
{ id: 'pending', label: 'Pending' },
{ id: 'available', label: 'Available' },
{ id: 'paid', label: 'Paid out' }];


const statusStyle: Record<EarningStatus, string> = {
  pending: 'text-brand-amber',
  available: 'text-brand-cyan',
  paid: 'text-mist-400'
};

export function EarningsLedger({ entries, sourceConfig }: EarningsLedgerProps) {
  const [filter, setFilter] = React.useState<Filter>('all');
  const visible = filter === 'all' ? entries : entries.filter((e) => e.status === filter);
  const sourceLabel = (id: string) => sourceConfig.find((s) => s.id === id)?.label ?? id;

  return (
    <section aria-labelledby="ledger-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="ledger-heading" className="text-lg font-bold tracking-tight text-white">
          Earnings ledger
        </h2>
        <div role="tablist" aria-label="Filter by status" className="flex gap-1">
          {filters.map((f) =>
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={[
            'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ease-entrance',
            filter === f.id ? 'bg-brand-indigo text-white' : 'text-mist-400 hover:text-white'].
            join(' ')}>
            
              {f.label}
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ?
      <p className="rounded-2xl border border-white/5 bg-ink-900 px-4 py-8 text-center text-sm text-mist-400">
          Nothing {filter === 'paid' ? 'paid out' : filter} right now.
        </p> :

      <div className="overflow-hidden rounded-2xl border border-white/5">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Earnings entries</caption>
            <thead className="bg-ink-850 text-[11px] uppercase tracking-[0.1em] text-mist-400">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Earning</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Source</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Date</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Your share</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-ink-900">
              {visible.map((e) =>
            <tr key={e.id}>
                  <th scope="row" className="px-4 py-3 font-normal">
                    <span className="block truncate font-medium text-white">{e.label}</span>
                    <span className="block truncate text-[11px] text-mist-400">{e.detail}</span>
                  </th>
                  <td className="hidden px-4 py-3 text-xs text-mist-300 md:table-cell">{sourceLabel(e.source)}</td>
                  <td className="hidden px-4 py-3 text-xs text-mist-400 sm:table-cell">{shortDate(e.date)}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-white">{naira(e.net)}</td>
                  <td className={`px-4 py-3 text-right text-xs ${statusStyle[e.status]}`}>
                    {e.status === 'pending' && e.clearsOn ?
                `Clears ${shortDate(e.clearsOn)}` :
                e.status === 'paid' ?
                'Paid out' :
                'Available'}
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }
      <p className="mt-2 text-[11px] text-mist-400">
        Amounts are your share after the split. HavaPay decides when each earning clears.
      </p>
    </section>);

}