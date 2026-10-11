import React from 'react';
import { HeartHandshakeIcon } from 'lucide-react';
import { formatPrice } from '../../contexts/CommerceContext';
import { usePodcast } from '../../contexts/PodcastContext';
import type { Host } from '../../types/podcast';

const presets = [500, 1000, 5000];

/**
 * Supporting culture, not donating to a charity. The amounts are presets
 * because deciding is the friction, not typing.
 */
export function SupportPanel({ host }: {host: Host;}) {
  const { support, hasSupported, pending } = usePodcast();
  const [amount, setAmount] = React.useState<number>(1000);
  const [custom, setCustom] = React.useState('');

  const already = hasSupported(host.id);
  const busy = pending === `support:${host.id}`;
  const value = custom ? Number(custom) || 0 : amount;

  return (
    <section
      aria-labelledby={`support-${host.id}`}
      className="rounded-2xl border border-brand-violet/25 bg-ink-900 p-4">
      
      <h2
        id={`support-${host.id}`}
        className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">
        
        <HeartHandshakeIcon className="h-4 w-4 text-brand-violet" aria-hidden="true" />
        Support {host.name}
      </h2>
      <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">
        Goes to the next season rather than to the last one. {host.supporters} people already do.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((preset) =>
        <button
          key={preset}
          type="button"
          onClick={() => {
            setAmount(preset);
            setCustom('');
          }}
          aria-pressed={!custom && amount === preset}
          className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance ${
          !custom && amount === preset ?
          'border-brand-violet bg-brand-violet/15 text-white' :
          'border-white/10 text-mist-300 hover:border-white/30 hover:text-white'}`
          }>
          
            {formatPrice(preset)}
          </button>
        )}
        <label className="min-w-[96px] flex-1">
          <span className="sr-only">Custom amount in naira</span>
          <input
            inputMode="numeric"
            value={custom}
            onChange={(event) => setCustom(event.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Custom"
            className="w-full rounded-lg border border-white/10 bg-ink-850 px-3 py-2 text-xs text-white outline-none transition-colors duration-150 ease-entrance placeholder:text-mist-400 focus:border-brand-violet" />
          
        </label>
      </div>

      <button
        type="button"
        disabled={busy || value <= 0}
        onClick={() => support(host.id, value, host.name)}
        className="mt-3 w-full rounded-lg bg-brand-violet px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-mist-400">
        
        {busy ? 'Sending…' : `Support with ${formatPrice(value)}`}
      </button>

      {already &&
      <p className="mt-2 text-[11px] text-brand-cyan">
          You support {host.name}. It shows on their ledger, attributed to you.
        </p>
      }

      <p className="mt-2 text-[10px] leading-relaxed text-mist-400">
        Settled by HavaPay. The creator allocation is written server-side at the point of payment.
      </p>
    </section>);

}