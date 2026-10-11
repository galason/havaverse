import React from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import { walletApi } from '../../services/walletApi';

interface Props {
  creator: string;
  handle: string;
  onClose: () => void;
}

const presets = [500, 1_000, 5_000, 10_000];

/**
 * Supporting a creator is a payment intent, not a gesture. It records a real
 * reference through HavaPay and reports failure honestly.
 */
export function TipSheet({ creator, handle, onClose }: Props) {
  const [amount, setAmount] = React.useState(1_000);
  const [custom, setCustom] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [state, setState] = React.useState<'idle' | 'working' | 'error'>('idle');
  const [error, setError] = React.useState('');
  const [reference, setReference] = React.useState('');

  const value = custom ? Number(custom.replace(/[^\d]/g, '')) : amount;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState('working');
    setError('');
    const result = await walletApi.supportCreator(handle, value, message);
    if (!result.ok) {
      setState('error');
      setError(result.error);
      return;
    }
    setState('idle');
    setReference(result.data.reference);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-sheet-title">
      
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default" />
      
      <div className="relative w-full max-w-md rounded-t-2xl border border-white/10 bg-ink-900 p-5 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="tip-sheet-title" className="text-base font-bold text-white">
            {reference ? `You supported ${creator}` : `Support ${creator}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {reference ?
        <>
            <p className="mt-3 flex items-center gap-2 text-sm text-white">
              <CheckIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
              ₦{value.toLocaleString('en-NG')} is on its way.
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-mist-400">
              Reference {reference}. HavaPay settles the payment and writes the creator's share
              to the ledger server-side.
            </p>
            <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-ink-950">
            
              Done
            </button>
          </> :

        <form onSubmit={submit}>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {presets.map((p) =>
            <button
              key={p}
              type="button"
              onClick={() => {
                setAmount(p);
                setCustom('');
              }}
              aria-pressed={!custom && amount === p}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ease-entrance ${
              !custom && amount === p ?
              'bg-brand-indigo text-white' :
              'border border-white/10 text-mist-200 hover:text-white'}`
              }>
              
                  ₦{p.toLocaleString('en-NG')}
                </button>
            )}
            </div>

            <label
            htmlFor="tip-custom"
            className="mt-4 block text-[11px] font-semibold text-mist-300">
            
              Or another amount
            </label>
            <input
            id="tip-custom"
            inputMode="numeric"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="₦"
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none placeholder:text-mist-400" />
          

            <label
            htmlFor="tip-message"
            className="mt-4 block text-[11px] font-semibold text-mist-300">
            
              Message to the creator
            </label>
            <textarea
            id="tip-message"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none" />
          

            {state === 'error' &&
          <p role="alert" className="mt-3 text-xs font-semibold text-live">
                {error}
              </p>
          }

            <button
            type="submit"
            disabled={state === 'working'}
            className="mt-4 w-full rounded-xl bg-brand-indigo py-2.5 text-sm font-bold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:opacity-60">
            
              {state === 'working' ?
            'Sending through HavaPay…' :
            `Support with ₦${value.toLocaleString('en-NG')}`}
            </button>
          </form>
        }
      </div>
    </div>);

}