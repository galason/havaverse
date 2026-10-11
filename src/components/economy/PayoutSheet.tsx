import React from 'react';
import { XIcon } from 'lucide-react';
import type { PayoutMethod } from '../../types/creatorEconomy';
import { naira } from '../../utils/currency';

interface PayoutSheetProps {
  available: number;
  minPayout: number;
  methods: PayoutMethod[];
  onClose: () => void;
  onSubmit: (amount: number, methodId: string) => Promise<string | null>;
}

export function PayoutSheet({ available, minPayout, methods, onClose, onSubmit }: PayoutSheetProps) {
  const [amount, setAmount] = React.useState(String(available));
  const [methodId, setMethodId] = React.useState(methods.find((m) => m.primary)?.id ?? methods[0]?.id ?? '');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const value = Number(amount.replace(/[^\d]/g, ''));
  const localError =
  !value ? 'Enter an amount.' : value < minPayout ? `The minimum is ${naira(minPayout)}.` : value > available ? `You have ${naira(available)} cleared.` : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (localError || busy) return;
    setBusy(true);
    setError(null);
    const failure = await onSubmit(value, methodId);
    setBusy(false);
    if (failure) setError(failure);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-4 sm:items-center" onClick={() => !busy && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payout-sheet-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6">
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="payout-sheet-title" className="text-lg font-bold text-white">
              Pay out cleared earnings
            </h2>
            <p className="mt-0.5 text-xs text-mist-400">{naira(available)} available now</p>
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
          <div>
            <label htmlFor="payout-amount" className="text-xs font-semibold text-mist-200">
              Amount
            </label>
            <div className="mt-1.5 flex items-center rounded-xl border border-white/10 bg-ink-850 px-3 focus-within:border-brand-indigo">
              <span className="text-sm text-mist-400">₦</span>
              <input
                id="payout-amount"
                ref={inputRef}
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-invalid={Boolean(localError)}
                aria-describedby="payout-amount-help"
                className="w-full bg-transparent px-2 py-2.5 text-sm tabular-nums text-white outline-none" />
              
            </div>
            <p id="payout-amount-help" className={`mt-1 text-[11px] ${localError ? 'text-live' : 'text-mist-400'}`}>
              {localError ?? `Minimum ${naira(minPayout)}. Pending earnings can’t be paid out early.`}
            </p>
          </div>

          <fieldset>
            <legend className="text-xs font-semibold text-mist-200">Send to</legend>
            <div className="mt-1.5 space-y-2">
              {methods.map((m) =>
              <label
                key={m.id}
                className={[
                'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-150 ease-entrance',
                methodId === m.id ? 'border-brand-indigo bg-brand-indigo/10' : 'border-white/10 hover:border-white/20'].
                join(' ')}>
                
                  <input
                  type="radio"
                  name="payout-method"
                  value={m.id}
                  checked={methodId === m.id}
                  onChange={() => setMethodId(m.id)}
                  className="mt-0.5 accent-brand-indigo" />
                
                  <span>
                    <span className="block text-sm font-medium text-white">{m.label}</span>
                    <span className="block text-[11px] text-mist-400">{m.detail}</span>
                  </span>
                </label>
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
            disabled={Boolean(localError) || busy}
            className="w-full rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-indigo">
            
            {busy ? 'Requesting…' : `Request ${value ? naira(value) : 'payout'}`}
          </button>
          <p className="text-center text-[11px] text-mist-400">
            HavaPay confirms the transfer. Until then it stays as a request you can cancel.
          </p>
        </form>
      </div>
    </div>);

}