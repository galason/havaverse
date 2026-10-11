import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, ChevronRightIcon } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import { useCommunity } from '../../contexts/CommunityContext';
import { ErrorBlock, SkeletonRows } from './StateBlocks';
import type { CommunityEventRecord } from '../../types/communityEntities';

export function EventsPanel() {
  const { hasReminder, toggleReminder } = useCommunity();
  const [events, setEvents] = React.useState<CommunityEventRecord[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await communityApi.listEvents();
    if (result.ok) {
      setEvents(result.data.slice(0, 5));
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <section
      aria-labelledby="community-events"
      className="flex flex-col rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <div className="mb-3 flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-brand-magenta" aria-hidden="true" />
        <h2 id="community-events" className="text-base font-bold tracking-tight text-white">
          Community events
        </h2>
        <Link
          to="/events"
          className="ml-auto text-[11px] font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
          
          View all
        </Link>
      </div>

      {status === 'loading' && <SkeletonRows rows={3} />}
      {status === 'error' && <ErrorBlock message="Could not load events." onRetry={load} />}

      {status === 'ready' &&
      <ul className="divide-y divide-white/5">
          {events.map((event) => {
          const reminded = hasReminder(event.id);
          const isJoin = event.state === 'live' || Boolean(event.watchPartyId);
          return (
            <li key={event.id} className="flex items-center gap-3 py-2.5">
                <Link to={`/events/${event.id}`} className="shrink-0">
                  <img
                  src={event.image}
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 rounded-lg object-cover" />
                
                </Link>
                <span className="min-w-0 flex-1">
                  <Link
                  to={`/events/${event.id}`}
                  className="block truncate text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                  
                    {event.name}
                  </Link>
                  <span className="block truncate text-[11px] text-mist-400">
                    {event.kind} · {event.when}
                  </span>
                </span>
                {isJoin ?
              <Link
                to={event.watchPartyId ? `/watch-parties/${event.watchPartyId}` : `/events/${event.id}`}
                className="shrink-0 rounded-lg bg-brand-indigo px-3 py-1.5 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
                
                    Join
                  </Link> :

              <button
                type="button"
                onClick={() => toggleReminder(event.id, event.name)}
                aria-pressed={reminded}
                className={[
                'shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance',
                reminded ?
                'border-brand-indigo/50 text-brand-indigo' :
                'border-white/15 text-mist-200 hover:text-white'].
                join(' ')}>
                
                    {reminded ? 'Reminder on' : 'Remind me'}
                  </button>
              }
              </li>);

        })}
        </ul>
      }

      <Link
        to="/events"
        className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-ink-850 px-3 py-2.5 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
        
        Community calendar
        <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </section>);

}