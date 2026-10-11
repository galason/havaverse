import React from 'react';
import { CheckIcon } from 'lucide-react';
import { formatPrice } from '../../contexts/CommerceContext';
import { useMusic } from '../../contexts/MusicContext';
import type { MusicEdition } from '../../types/music';

const stateLabel: Record<MusicEdition['state'], string> = {
  open: 'Open',
  closing: 'Closing soon',
  'sold-out': 'Fully collected',
  upcoming: 'Not open yet'
};

export function EditionCard({ edition }: {edition: MusicEdition;}) {
  const { hasCollected, collect, pending } = useMusic();

  const owned = hasCollected(edition.id);
  const busy = pending === `collect:${edition.id}`;
  const closed = edition.state === 'sold-out' || edition.state === 'upcoming';

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      <div className="relative aspect-[4/3]">
        <img src={edition.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.8),transparent_55%)]" />
        <span
          className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          edition.state === 'closing' ?
          'bg-brand-amber text-ink-950' :
          edition.state === 'sold-out' ?
          'bg-ink-700 text-mist-300' :
          'bg-brand-violet text-white'}`
          }>
          
          {stateLabel[edition.state]}
        </span>
        {edition.closesIn && edition.state === 'closing' &&
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 font-mono text-[11px] font-semibold tabular-nums text-white backdrop-blur">
            {edition.closesIn}
          </span>
        }
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-cyan">
          {edition.kind}
        </p>
        <h3 className="mt-0.5 text-sm font-bold leading-snug text-white">{edition.name}</h3>

        {edition.total !== undefined &&
        <p className="mt-1 text-[11px] font-semibold text-brand-amber">
            {edition.state === 'sold-out' ?
          `${edition.total} / ${edition.total} collected` :
          `${edition.remaining} of ${edition.total} remaining`}
          </p>
        }

        <ul className="mt-2 space-y-0.5">
          {edition.includes.map((item) =>
          <li key={item} className="truncate text-[11px] text-mist-400">
              {item}
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="text-sm font-bold text-white">{formatPrice(edition.price)}</p>
          <button
            type="button"
            disabled={owned || closed || busy}
            onClick={() => collect(edition.id, edition.name)}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance ${
            owned ?
            'cursor-default bg-brand-cyan/15 text-brand-cyan' :
            closed ?
            'cursor-not-allowed bg-ink-800 text-mist-400' :
            'bg-brand-violet text-white hover:bg-brand-magenta disabled:bg-ink-800'}`
            }>
            
            {owned && <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
            {owned ?
            'Collected' :
            busy ?
            'Collecting…' :
            edition.state === 'sold-out' ?
            'Sold out' :
            edition.state === 'upcoming' ?
            'Not open' :
            'Collect'}
          </button>
        </div>
      </div>
    </article>);

}