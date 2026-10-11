import React from 'react';
import { XIcon } from 'lucide-react';
import { formatPrice } from '../../contexts/CommerceContext';
import { refundEligibility } from '../../utils/orders';
import type { OrderRecord } from '../../types/orders';

interface RefundSheetProps {
  order: OrderRecord;
  onClose: () => void;
  onSubmit: (productIds: string[], reason: string) => Promise<string | null>;
}

const reasons = ['Arrived damaged', 'Wrong item or size', 'Not as described', "Can't attend the event", 'Changed my mind'];

export function RefundSheet({ order, onClose, onSubmit }: RefundSheetProps) {
  const eligible = order.lines.filter((l) => refundEligibility(order, l).eligible);
  const [selected, setSelected] = React.useState<string[]>(eligible.map((l) => l.productId));
  const [reason, setReason] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const amount = order.lines.
  filter((l) => selected.includes(l.productId)).
  reduce((s, l) => s + l.unitPrice * l.quantity, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const problem = await onSubmit(selected, reason);
    setBusy(false);
    if (problem) setError(problem);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-4 sm:items-center" onClick={() => !busy && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-5 shadow-2xl">
        
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="refund-title" className="text-lg font-bold text-white">
              Request a refund
            </h2>
            <p className="mt-0.5 text-xs text-mist-400">{order.id} · the seller and HavaPay review every request</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-full p-1.5 text-mist-400 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
            
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-5">
          <fieldset>
            <legend className="text-xs font-semibold text-mist-200">Items</legend>
            <ul className="mt-2 space-y-2">
              {order.lines.map((l) => {
                const check = refundEligibility(order, l);
                return (
                  <li key={l.productId}>
                    <label className={`flex items-start gap-3 ${check.eligible ? 'cursor-pointer' : 'opacity-60'}`}>
                      <input
                        type="checkbox"
                        disabled={!check.eligible}
                        checked={selected.includes(l.productId)}
                        onChange={(e) =>
                        setSelected((s) => e.target.checked ? [...s, l.productId] : s.filter((id) => id !== l.productId))
                        }
                        className="mt-1 accent-brand-indigo" />
                      
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-white">{l.name}</span>
                        <span className="block text-[11px] text-mist-400">
                          {check.eligible ? formatPrice(l.unitPrice * l.quantity) : check.reason}
                        </span>
                      </span>
                    </label>
                  </li>);

              })}
            </ul>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold text-mist-200">Why?</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reasons.map((r) =>
              <button
                key={r}
                type="button"
                aria-pressed={reason === r}
                onClick={() => setReason(r)}
                className={[
                'rounded-full border px-3 py-1 text-xs transition-colors duration-150 ease-entrance',
                reason === r ? 'border-brand-indigo bg-brand-indigo/15 text-white' : 'border-white/10 text-mist-300 hover:text-white'].
                join(' ')}>
                
                  {r}
                </button>
              )}
            </div>
          </fieldset>

          {error &&
          <p role="alert" className="rounded-lg bg-live/10 px-3 py-2 text-xs text-live">
              {error}
            </p>
          }

          <button
            type="submit"
            disabled={busy || selected.length === 0 || !reason}
            className="w-full rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:opacity-50">
            
            {busy ? 'Sending…' : `Request ${formatPrice(amount)} back`}
          </button>
          <p className="text-center text-[11px] text-mist-400">
            Nothing is refunded until it's approved. Money goes back to the way you paid.
          </p>
        </form>
      </div>
    </div>);

}