import React from 'react';
import { Link } from 'react-router-dom';
import { BanknoteIcon, CreditCardIcon } from 'lucide-react';
import type { CreatorEconomy } from '../../types/creatorEconomy';
import { naira, shortDate } from '../../utils/currency';

interface EarningsSummaryProps {
  economy: CreatorEconomy;
  onRequestPayout: () => void;
}

export function EarningsSummary({ economy, onRequestPayout }: EarningsSummaryProps) {
  const { balances, nextPayout, openPayout, minPayout } = economy;
  const canPayOut = !openPayout && balances.available >= minPayout;
  const blockedReason = openPayout ?
  `A payout of ${naira(openPayout.amount)} is already in progress.` :
  balances.available < minPayout ?
  `Early payouts start at ${naira(minPayout)} of cleared earnings.` :
  null;

  return (
    <section
      aria-labelledby="available-heading"
      className="rounded-2xl border border-brand-indigo/25 bg-ink-900 p-6">
      
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p id="available-heading" className="text-xs text-mist-400">
            Available to pay out
          </p>
          <p className="mt-1 font-display text-5xl tracking-wide text-white">{naira(balances.available)}</p>
          <p className="mt-1 text-xs text-mist-400">
            Cleared earnings. Paid automatically to your {nextPayout.destination} on{' '}
            {shortDate(nextPayout.date)}
            {balances.reserved > 0 && ` · ${naira(balances.reserved)} reserved for your payout request`}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRequestPayout}
            disabled={!canPayOut}
            aria-describedby={blockedReason ? 'payout-blocked' : undefined}
            className="flex items-center gap-2 rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-indigo">
            
            <BanknoteIcon className="h-4 w-4" aria-hidden="true" />
            Pay out now
          </button>
          <Link
            to="/settings/havapay"
            className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
            <CreditCardIcon className="h-4 w-4" aria-hidden="true" />
            Payout methods
          </Link>
        </div>
      </div>
      {blockedReason &&
      <p id="payout-blocked" className="mt-3 text-[11px] text-mist-400">
          {blockedReason}
        </p>
      }

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/5 pt-5 sm:grid-cols-4">
        <div>
          <dt className="text-[11px] text-mist-400">Pending</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums text-brand-amber">{naira(balances.pending)}</dd>
          <dd className="text-[11px] text-mist-400">Still clearing</dd>
        </div>
        <div>
          <dt className="text-[11px] text-mist-400">Earned {economy.periods.current.split(' ·')[0]}</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums text-white">{naira(balances.currentTotal)}</dd>
          <dd className="text-[11px] text-mist-400">To date</dd>
        </div>
        <div>
          <dt className="text-[11px] text-mist-400">Earned {economy.periods.previous}</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums text-white">{naira(balances.previousTotal)}</dd>
          <dd className="text-[11px] text-mist-400">Paid out</dd>
        </div>
        <div>
          <dt className="text-[11px] text-mist-400">Paid out in 2026</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums text-white">{naira(balances.paidThisYear)}</dd>
          <dd className="text-[11px] text-mist-400">Settled payouts</dd>
        </div>
      </dl>
    </section>);

}