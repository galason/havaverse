import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { formatPrice } from '../../contexts/CommerceContext';
import { usePodcast } from '../../contexts/PodcastContext';
import type { LiveConversation } from '../../types/podcast';

const statusLabel: Record<LiveConversation['status'], string> = {
  'on-sale': 'On sale',
  live: 'Live now',
  low: 'Few seats left',
  'sold-out': 'Full',
  free: 'Free'
};

export function LiveConversationCard({ event }: {event: LiveConversation;}) {
  const { hasSeat, reserve, pending } = usePodcast();
  const held = hasSeat(event.id);
  const busy = pending === `seat:${event.id}`;
  const full = event.status === 'sold-out';

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      <Link to={`/podcast/live/${event.id}`} className="group relative block">
        <img
          src={event.image}
          alt=""
          className="aspect-[16/10] w-full object-cover transition-transform duration-300 ease-entrance group-hover:scale-[1.03]" />
        
        {event.status === 'live' &&
        <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
            Live
          </span>
        }
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-violet">
          {event.kind}
        </p>
        <h3 className="mt-1 text-sm font-bold leading-tight text-white">
          <Link
            to={`/podcast/live/${event.id}`}
            className="transition-colors duration-150 ease-entrance hover:text-brand-cyan">
            
            {event.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-mist-400">
          <CalendarIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          {event.date}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-mist-400">
          <MapPinIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          {event.venue}, {event.city}
        </p>
        <p className="mt-1.5 text-[11px] text-mist-400">
          {event.attending} · {statusLabel[event.status]}
        </p>

        <button
          type="button"
          disabled={held || full || busy}
          onClick={() => reserve(event.id, event.title)}
          className={`mt-auto w-full rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors duration-150 ease-entrance ${
          held ?
          'cursor-default bg-brand-cyan/15 text-brand-cyan' :
          full ?
          'cursor-not-allowed bg-ink-800 text-mist-400' :
          'bg-brand-violet text-white hover:bg-brand-magenta'}`
          }>
          
          {held ?
          'Seat held' :
          busy ?
          'Reserving…' :
          full ?
          'Full' :
          event.status === 'live' ?
          'Join live' :
          event.price === 0 ?
          'Reserve free seat' :
          `Get seat · ${formatPrice(event.price)}`}
        </button>
      </div>
    </article>);

}