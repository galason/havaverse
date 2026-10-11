import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { musicApi } from '../../services/musicApi';
import { artists } from '../../data/music';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { LiveCard } from '../../components/music/LiveCard';
import { SectionHeader } from '../../components/community/SectionHeader';
import { formatPrice } from '../../contexts/CommerceContext';
import { useMusic } from '../../contexts/MusicContext';
import type { LiveDate } from '../../types/music';

/** One component serves the index and the detail, because they share the data. */
export function LivePage() {
  const { liveId } = useParams();
  const { hasTicket, reserve, pending } = useMusic();

  const [dates, setDates] = React.useState<LiveDate[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await musicApi.listLive();
    if (result.ok) {
      setDates(result.data);
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading dates…" />
      </div>);

  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorBlock message="Live dates could not be loaded." onRetry={load} />
      </div>);

  }

  if (liveId) {
    const date = dates.find((d) => d.id === liveId);
    if (!date) {
      return (
        <div className="p-5">
          <ErrorBlock message="That date is no longer listed." onRetry={load} />
        </div>);

    }

    const artist = artists.find((a) => a.id === date.artistId);
    const held = hasTicket(date.id);
    const busy = pending === `ticket:${date.id}`;
    const soldOut = date.status === 'sold-out';
    const others = dates.filter((d) => d.id !== date.id);

    return (
      <div className="pb-32">
        <div className="relative min-h-[240px] sm:min-h-[320px]">
          <img src={date.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_10%,rgb(var(--c-ink-950)/0.3)_100%)]" />
          <div className="relative flex min-h-[240px] flex-col justify-end p-5 sm:min-h-[320px] sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-live">
              {date.kind}
            </p>
            <h1 className="mt-1.5 font-display text-4xl uppercase leading-none tracking-tight text-white sm:text-6xl">
              {date.title}
            </h1>
            {artist &&
            <Link
              to={`/music/artist/${artist.id}`}
              className="mt-2 text-sm text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
              
                {artist.name}
              </Link>
            }
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-mist-200">
                  <CalendarIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
                  <dt className="sr-only">When</dt>
                  <dd>{date.date}</dd>
                </div>
                <div className="flex items-center gap-2 text-mist-200">
                  <MapPinIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
                  <dt className="sr-only">Where</dt>
                  <dd>
                    {date.venue}, {date.city}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-mist-300">
                Tickets are issued to your HavaVerse identity and settle through HavaPay, so the
                artist's share is attributed at the point of sale rather than months later.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <p className="text-2xl font-bold text-white">
                {date.price === 0 ? 'Free' : formatPrice(date.price)}
              </p>
              <button
                type="button"
                disabled={held || soldOut || busy}
                onClick={() => reserve(date.id, date.title)}
                className={`mt-3 w-full rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-150 ease-entrance ${
                held ?
                'cursor-default bg-brand-cyan/15 text-brand-cyan' :
                soldOut ?
                'cursor-not-allowed bg-ink-800 text-mist-400' :
                'bg-brand-violet text-white hover:bg-brand-magenta'}`
                }>
                
                {held ?
                'Ticket held' :
                busy ?
                'Reserving…' :
                soldOut ?
                'Sold out' :
                date.price === 0 ?
                'Join free' :
                'Get ticket'}
              </button>
              {held &&
              <p className="mt-2 text-[11px] text-brand-cyan">
                  It is in your passport and your wallet.
                </p>
              }
            </div>
          </div>

          {others.length > 0 &&
          <section aria-labelledby="other-dates" className="mt-8">
              <h2 id="other-dates" className="mb-3 text-base font-bold tracking-tight text-white">
                Other dates
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {others.map((other) =>
              <li key={other.id}>
                    <LiveCard date={other} />
                  </li>
              )}
              </ul>
            </section>
          }
        </div>
      </div>);

  }

  return (
    <div className="p-4 pb-32 sm:p-5">
      <SectionHeader
        title="Live"
        subtitle="Concerts, listening parties, festivals and sessions across the ecosystem." />
      
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dates.map((date) =>
        <li key={date.id}>
            <LiveCard date={date} />
          </li>
        )}
      </ul>
    </div>);

}