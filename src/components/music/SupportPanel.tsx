import React from 'react';
import { HeartHandshakeIcon } from 'lucide-react';
import { formatPrice } from '../../contexts/CommerceContext';
import { useMusic } from '../../contexts/MusicContext';
import type { Artist } from '../../types/music';

const presets = [500, 1000, 5000];

/**
 * Supporting culture, not donating to a cause. The copy and the amounts are
 * deliberately matter-of-fact.
 */
export function SupportPanel({ artist }: {artist: Artist;}) {
  const { support, hasSupported, pending } = useMusic();
  const [amount, setAmount] = React.useState(1000);
  const [custom, setCustom] = React.useState('');

  const busy = pending === `support:${artist.id}`;
  const already = hasSupported(artist.id);
  const value = custom ? Number(custom.replace(/\D/g, '')) || 0 : amount;

  return (
    <section
      aria-labelledby={`support-${artist.id}`}
      className="rounded-2xl border border-brand-magenta/25 bg-ink-900 p-4">
      
      <h2
        id={`support-${artist.id}`}
        className="flex items-center gap-1.5 text-sm font-bold text-white">
        
        <HeartHandshakeIcon className="h-4 w-4 text-brand-magenta" aria-hidden="true" />
        Support {artist.name}
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-mist-300">
        Goes straight to the next release. {artist.supporters} people already do this.
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
          'border-brand-magenta bg-brand-magenta/15 text-white' :
          'border-white/15 text-mist-200 hover:text-white'}`
          }>
          
            {formatPrice(preset)}
          </button>
        )}
        <label className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2">
          <span className="text-xs text-mist-400">₦</span>
          <input
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            inputMode="numeric"
            placeholder="Other"
            aria-label={`Custom amount to support ${artist.name}`}
            className="w-20 bg-transparent text-xs text-white outline-none placeholder:text-mist-400" />
          
        </label>
      </div>

      <button
        type="button"
        disabled={busy || value <= 0}
        onClick={() => support(artist.id, value, artist.name)}
        className="mt-3 w-full rounded-lg bg-brand-magenta px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-mist-400">
        
        {busy ?
        'Sending through HavaPay…' :
        value > 0 ?
        `Support with ${formatPrice(value)}` :
        'Choose an amount'}
      </button>

      {already &&
      <p className="mt-2 text-[11px] text-brand-cyan">
          You already support {artist.name}. Anything further is added on top.
        </p>
      }

      <p className="mt-2 text-[10px] leading-relaxed text-mist-400">
        HavaPay settles this server-side and writes it to the creator's ledger. Nothing is
        deducted for discovery placement.
      </p>
    </section>);

}