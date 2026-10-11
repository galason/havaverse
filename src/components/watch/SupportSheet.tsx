import React from 'react';
import { CheckIcon, HeartIcon } from 'lucide-react';
import type { EconomyConfig } from '../../types/watch';
import { watchApi } from '../../services/watchApi';
import { Sheet } from './Sheet';

interface SupportSheetProps {
  slug: string;
  creator: string;
  economy: EconomyConfig;
  onClose: () => void;
  onDone: (message: string) => void;
}

export function SupportSheet({ slug, creator, economy, onClose, onDone }: SupportSheetProps) {
  const [tierId, setTierId] = React.useState(economy.supportTiers[1]?.id ?? '');
  const [custom, setCustom] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [reference, setReference] = React.useState('');

  const customMinor = custom ? Math.round(Number(custom) * 100) : 0;
  const amountMinor = custom ?
  customMinor :
  economy.supportTiers.find((t) => t.id === tierId)?.minor ?? 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await watchApi.supportCreator(slug, amountMinor, message);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    watchApi.track('creator_supported', slug, String(amountMinor));
    setReference(result.data.reference);
  }

  if (reference) {
    return (
      <Sheet title={`You supported ${creator}`} onClose={onClose}>
        <p className="flex items-center gap-2 text-sm text-white">
          <CheckIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
          {economy.currencySymbol}
          {(amountMinor / 100).toLocaleString()} sent
        </p>
        <p className="mt-2 text-xs leading-relaxed text-mist-400">
          Reference {reference}. HavaPay settles the payment and records the creator's share in the
          ledger — nothing about the split is calculated here.
        </p>
        <button
          type="button"
          onClick={() => {
            onDone(`You supported ${creator}`);
            onClose();
          }}
          className="mt-4 w-full rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
          Back to the film
        </button>
      </Sheet>);

  }

  return (
    <Sheet
      title={`Support ${creator}`}
      description="Goes to the creator through HavaPay, minus the platform share shown at checkout."
      onClose={onClose}>
      
      <form onSubmit={submit}>
        <fieldset>
          <legend className="sr-only">Amount</legend>
          <div className="grid grid-cols-4 gap-2">
            {economy.supportTiers.map((tier) =>
            <button
              key={tier.id}
              type="button"
              onClick={() => {
                setTierId(tier.id);
                setCustom('');
              }}
              aria-pressed={!custom && tierId === tier.id}
              className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors duration-150 ease-entrance ${
              !custom && tierId === tier.id ?
              'border-brand-amber bg-brand-amber/10 text-brand-amber' :
              'border-white/10 text-mist-200 hover:border-white/25'}`
              }>
              
                {tier.label}
              </button>
            )}
          </div>
        </fieldset>

        <label className="mt-3 block">
          <span className="text-[11px] font-semibold text-mist-300">Custom amount</span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-ink-850 px-3 focus-within:border-brand-indigo">
            <span className="text-sm text-mist-400">{economy.currencySymbol}</span>
            <input
              type="number"
              min={1}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Enter an amount"
              className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-mist-400 focus:outline-none" />
            
          </div>
        </label>

        <label className="mt-3 block">
          <span className="text-[11px] font-semibold text-mist-300">
            Message to the creator <span className="text-mist-400">(optional)</span>
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={280}
            className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-ink-850 px-3 py-2.5 text-sm text-white placeholder:text-mist-400 focus:border-brand-indigo focus:outline-none"
            placeholder="Say something about the film" />
          
        </label>

        {error &&
        <p role="alert" className="mt-2 text-xs text-live">
            {error}
          </p>
        }

        <button
          type="submit"
          disabled={submitting || amountMinor <= 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-amber px-5 py-3 text-sm font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-brand-amber/90 disabled:bg-ink-700 disabled:text-mist-400">
          
          <HeartIcon className="h-4 w-4" aria-hidden="true" />
          {submitting ?
          'Sending…' :
          `Support ${economy.currencySymbol}${(amountMinor / 100).toLocaleString()}`}
        </button>
      </form>
    </Sheet>);

}