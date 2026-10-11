import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { podcastApi } from '../../services/podcastApi';
import { hosts, shows } from '../../data/podcast';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { SectionHeader } from '../../components/community/SectionHeader';
import { LiveConversationCard } from '../../components/podcast/LiveConversationCard';
import { formatPrice } from '../../contexts/CommerceContext';
import { usePodcast } from '../../contexts/PodcastContext';
import type { LiveConversation } from '../../types/podcast';

/** Index and detail share one component because they share the data. */
export function PodcastLivePage() {
  const { liveId } = useParams();
  const { hasSeat, reserve, pending } = usePodcast();

  const [events, setEvents] = React.useState<LiveConversation[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await podcastApi.listLive();
    if (result.ok) {
      setEvents(result.data);
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
        <LoadingBlock label="Loading conversations…" />
      </div>);

  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorBlock message="Live conversations could not be loaded." onRetry={load} />
      </div>);

  }

  if (liveId) {
    const event = events.find((e) => e.id === liveId);
    if (!event) {
      return (
        <div className="p-5">
          <ErrorBlock message="That conversation is no longer listed." onRetry={load} />
        </div>);

    }

    const show = shows.find((s) => s.id === event.showId);
    const host = hosts.find((h) => h.id === show?.hostId);
    const held = hasSeat(event.id);
    const busy = pending === `seat:${event.id}`;
    const full = event.status === 'sold-out';
    const others = events.filter((e) => e.id !== event.id);

    return (
      <div className="pb-12">
        <div className="relative min-h-[240px] sm:min-h-[320px]">
          <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_12%,rgb(var(--c-ink-950)/0.3)_100%)]" />
          <div className="relative flex min-h-[240px] flex-col justify-end p-5 sm:min-h-[320px] sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-live">
              {event.kind}
            </p>
            <h1 className="mt-1.5 font-display text-4xl uppercase leading-none tracking-tight text-white sm:text-6xl">
              {event.title}
            </h1>
            {show &&
            <Link
              to={`/podcast/show/${show.id}`}
              className="mt-2 text-sm text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
              
                {show.title}
                {host && ` · ${host.name}`}
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
                  <dd>{event.date}</dd>
                </div>
                <div className="flex items-center gap-2 text-mist-200">
                  <MapPinIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
                  <dt className="sr-only">Where</dt>
                  <dd>
                    {event.venue}, {event.city}
                  </dd>
                </div>
                <div className="flex items-center gap-2 text-mist-200">
                  <UsersIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
                  <dt className="sr-only">Attendance</dt>
                  <dd>{event.attending}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-mist-300">
                Seats are issued to your HavaVerse identity and settle through HavaPay, so the
                creator's share is attributed at the point of sale. Recorded sessions are published
                to the show afterwards.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <p className="text-2xl font-bold text-white">
                {event.price === 0 ? 'Free' : formatPrice(event.price)}
              </p>
              <button
                type="button"
                disabled={held || full || busy}
                onClick={() => reserve(event.id, event.title)}
                className={`mt-3 w-full rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-150 ease-entrance ${
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
                'Get seat'}
              </button>
              {held &&
              <p className="mt-2 text-[11px] text-brand-cyan">
                  It is in your passport and your wallet.
                </p>
              }
            </div>
          </div>

          {others.length > 0 &&
          <section aria-labelledby="other-conversations" className="mt-8">
              <h2
              id="other-conversations"
              className="mb-3 text-base font-bold tracking-tight text-white">
              
                Other conversations
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {others.map((other) =>
              <li key={other.id}>
                    <LiveConversationCard event={other} />
                  </li>
              )}
              </ul>
            </section>
          }
        </div>
      </div>);

  }

  return (
    <div className="p-4 pb-12 sm:p-5">
      <SectionHeader
        title="Live in HavaVerse"
        subtitle="Recordings, roundtables, AMAs and premieres across the ecosystem." />
      
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {events.map((event) =>
        <li key={event.id}>
            <LiveConversationCard event={event} />
          </li>
        )}
      </ul>
    </div>);

}