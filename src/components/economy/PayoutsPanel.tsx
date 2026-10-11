import React from 'react';
import { Link } from 'react-router-dom';
import type { Payout, PayoutMethod, PayoutState } from '../../types/creatorEconomy';
import { naira, shortDate } from '../../utils/currency';

interface PayoutsPanelProps {
  payouts: Payout[];
  methods: PayoutMethod[];
  nextPayout: {date: string;destination: string;};
  cancellingId: string | null;
  onCancel: (id: string) => void;
}

const stateLabel: Record<PayoutState, {label: string;tone: string;}> = {
  requested: { label: 'Requested', tone: 'text-brand-amber' },
  processing: { label: 'Processing', tone: 'text-brand-amber' },
  paid: { label: 'Paid', tone: 'text-mist-400' },
  failed: { label: 'Failed', tone: 'text-live' }
};

export function PayoutsPanel({ payouts, methods, nextPayout, cancellingId, onCancel }: PayoutsPanelProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section aria-labelledby="payouts-heading" className="min-w-0">
        <h2 id="payouts-heading" className="mb-3 text-lg font-bold tracking-tight text-white">
          Payout history
        </h2>
        {payouts.length === 0 ?
        <p className="rounded-2xl border border-white/5 bg-ink-900 px-4 py-8 text-center text-sm text-mist-400">
            No payouts yet. Your first automatic payout runs {shortDate(nextPayout.date)}.
          </p> :

        <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
            {payouts.map((p) =>
          <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {p.note ?? (p.kind === 'early' ? 'Early payout' : 'Automatic payout')}
                  </p>
                  <p className="truncate text-[11px] text-mist-400">
                    {shortDate(p.requestedAt)} · to {p.destination} · {p.reference}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-white">{naira(p.amount)}</span>
                <span className={`w-20 text-right text-xs ${stateLabel[p.state].tone}`}>
                  {stateLabel[p.state].label}
                </span>
                {p.state === 'requested' &&
            <button
              type="button"
              onClick={() => onCancel(p.id)}
              disabled={cancellingId === p.id}
              className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white disabled:opacity-50">
              
                    {cancellingId === p.id ? 'Cancelling…' : 'Cancel'}
                  </button>
            }
              </li>
          )}
          </ul>
        }
        <p className="mt-2 text-[11px] text-mist-400">
          A request shows as Requested until HavaPay confirms it. Nothing here is marked paid by this device.
        </p>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
          <h2 className="text-sm font-bold text-white">Automatic payouts</h2>
          <p className="mt-2 text-xs leading-relaxed text-mist-300">
            Cleared earnings are paid on the 1st of each month. Next run: {shortDate(nextPayout.date)} to your{' '}
            {nextPayout.destination}.
          </p>
        </section>
        <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
          <h2 className="text-sm font-bold text-white">Payout methods</h2>
          <ul className="mt-3 space-y-3">
            {methods.map((m) =>
            <li key={m.id} className="text-xs">
                <p className="font-medium text-white">
                  {m.label}
                  {m.primary && <span className="ml-2 text-[11px] font-normal text-brand-cyan">Default</span>}
                </p>
                <p className="text-[11px] text-mist-400">{m.detail}</p>
              </li>
            )}
          </ul>
          <Link
            to="/settings/havapay"
            className="mt-4 block w-full rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/5">
            
            Manage in HavaPay settings
          </Link>
        </section>
      </aside>
    </div>);

}