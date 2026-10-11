import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon } from 'lucide-react';
import { artists } from '../../data/music';
import { formatPrice } from '../../contexts/CommerceContext';
import { useMusic } from '../../contexts/MusicContext';
import type { LiveDate } from '../../types/music';

const statusLabel: Record<LiveDate['status'], string> = {
  'on-sale': 'On sale',
  low: 'Few tickets left',
  'sold-out': 'Sold out',
  free: 'Free to join'
};

export function LiveCard({ date }: {date: LiveDate;}) {
  const { hasTicket, reserve, pending } = useMusic();
  const artist = artists.find((a) => a.id === date.artistId);

  const held = hasTicket(date.id);
  const busy = pending === `ticket:${date.id}`;
  const soldOut = date.status === 'sold-out';

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      <Link to={`/music/live/${date.id}`} className="relative block aspect-[16/9]">
        <img src={date.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.85),transparent_60%)]" />
        <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist-100 backdrop-blur">
          {date.kind}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-sm font-bold leading-snug text-white">
          <Link
            to={`/music/live/${date.id}`}
            className="transition-colors duration-150 ease-entrance hover:text-brand-violet">
            
            {date.title}
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-mist-400">{artist?.name}</p>
        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-mist-400">
          <MapPinIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          {date.venue}, {date.city}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold text-mist-200">{date.date}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div>
            <p className="text-sm font-bold text-white">
              {date.price === 0 ? 'Free' : formatPrice(date.price)}
            </p>
            <p
              className={`text-[11px] font-semibold ${
              date.status === 'low' ?
              'text-brand-amber' :
              date.status === 'sold-out' ?
              'text-mist-400' :
              'text-mist-300'}`
              }>
              
              {statusLabel[date.status]}
            </p>
          </div>
          <button
            type="button"
            disabled={held || soldOut || busy}
            onClick={() => reserve(date.id, date.title)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance ${
            held ?
            'cursor-default bg-brand-cyan/15 text-brand-cyan' :
            soldOut ?
            'cursor-not-allowed bg-ink-800 text-mist-400' :
            'bg-brand-violet text-white hover:bg-brand-magenta'}`
            }>
            
            {held ? 'Ticket held' : busy ? 'Reserving…' : soldOut ? 'Sold out' : 'Get ticket'}
          </button>
        </div>
      </div>
    </article>);

}