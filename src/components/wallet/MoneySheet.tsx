import React from 'react';
import { XIcon } from 'lucide-react';
import { walletApi } from '../../services/walletApi';
import type { Transaction } from '../../data/economy';

type Mode = 'withdraw' | 'top-up';

interface Props {
  mode: Mode;
  balance: number;
  onClose: () => void;
  onSettled: (entry: Transaction, balance: number, reference: string) => void;
}

const presets = [10_000, 25_000, 50_000, 100_000];

/**
 * A movement of money is requested, never asserted. The sheet shows the
 * server's answer — including its refusals — rather than congratulating the
 * user on something that has not happened.
 */
export function MoneySheet({ mode, balance, onClose, onSettled }: Props) {
  const withdraw = mode === 'withdraw';
  const [amount, setAmount] = React.useState('');
  const [destination, setDestination] = React.useState(
    withdraw ? 'GTBank ••4417' : 'Card ••4821'
  );
  const [state, setState] = React.useState<'idle' | 'working' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const options = withdraw ?
  ['GTBank ••4417', 'Kuda ••9032'] :
  ['Card ••4821', 'Bank transfer', 'Mobile money'];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState('working');
    setError('');
    const value = Number(amount.replace(/[^\d]/g, ''));
    const result = withdraw ?
    await walletApi.requestWithdrawal(value, balance, destination) :
    await walletApi.requestTopUp(value, balance, destination);
    if (!result.ok) {
      setState('error');
      setError(result.error);
      return;
    }
    onSettled(result.data.entry, result.data.balance, result.data.reference);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="money-sheet-title">
      
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default" />
      
      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-t-2xl border border-white/10 bg-ink-900 p-5 sm:rounded-2xl">
        
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="money-sheet-title" className="text-base font-bold text-white">
              {withdraw ? 'Withdraw to your bank' : 'Add money to your wallet'}
            </h2>
            <p className="mt-0.5 text-[11px] text-mist-400">
              {withdraw ? 'Available' : 'Currently available'} ₦{balance.toLocaleString('en-NG')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <label htmlFor="money-amount" className="mt-4 block text-[11px] font-semibold text-mist-300">
          Amount
        </label>
        <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-ink-850 px-3">
          <span className="text-sm text-mist-400">₦</span>
          <input
            id="money-amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-mist-400" />
          
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {presets.map((p) =>
          <button
            key={p}
            type="button"
            onClick={() => setAmount(String(p))}
            className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:border-white/35 hover:text-white">
            
              ₦{p.toLocaleString('en-NG')}
            </button>
          )}
        </div>

        <label
          htmlFor="money-destination"
          className="mt-4 block text-[11px] font-semibold text-mist-300">
          
          {withdraw ? 'Destination' : 'Pay with'}
        </label>
        <select
          id="money-destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-ink-850 px-3 py-2.5 text-sm text-white outline-none">
          
          {options.map((o) =>
          <option key={o} value={o}>
              {o}
            </option>
          )}
        </select>

        {state === 'error' &&
        <p role="alert" className="mt-3 text-xs font-semibold text-live">
            {error}
          </p>
        }

        <p className="mt-4 text-[11px] leading-relaxed text-mist-400">
          HavaPay settles this server-side and writes the ledger entry. It stays pending here
          until settlement confirms.
        </p>

        <button
          type="submit"
          disabled={state === 'working'}
          className="mt-3 w-full rounded-xl bg-brand-indigo py-2.5 text-sm font-bold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:opacity-60">
          
          {state === 'working' ?
          'Sending to HavaPay…' :
          withdraw ?
          'Request withdrawal' :
          'Add money'}
        </button>
      </form>
    </div>);

}