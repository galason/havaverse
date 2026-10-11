import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import { personById } from '../../data/communityPeople';
import { useCommunity } from '../../contexts/CommunityContext';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../../components/community/StateBlocks';
import type { CommunityEventRecord, EventKind } from '../../types/communityEntities';

const kinds: (EventKind | 'All')[] = [
'All',
'Watch party',
'Creator Q&A',
'Live sport',
'Listening party',
'Premiere',
'Community discussion'];


export function Events() {
  const { hasReminder, toggleReminder } = useCommunity();
  const [events, setEvents] = React.useState<CommunityEventRecord[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [kind, setKind] = React.useState<EventKind | 'All'>('All');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await communityApi.listEvents();
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

  const visible = kind === 'All' ? events : events.filter((e) => e.kind === kind);

  return (
    <div className="p-4 pb-12 sm:p-5">
      <header className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
          HavaVerse Community
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Community events</h1>
        <p className="mt-1 max-w-xl text-sm text-mist-400">
          Q&amp;As, premieres, matchdays and listening parties — every one attached to a community.
        </p>
      </header>

      <div role="tablist" aria-label="Filter events" className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {kinds.map((option) =>
        <button
          key={option}
          role="tab"
          type="button"
          aria-selected={kind === option}
          onClick={() => setKind(option)}
          className={[
          'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-entrance',
          kind === option ?
          'border-transparent bg-brand-indigo text-white' :
          'border-white/10 bg-ink-850 text-mist-300 hover:border-white/25 hover:text-white'].
          join(' ')}>
          
            {option}
          </button>
        )}
      </div>

      {status === 'loading' && <SkeletonRows rows={4} />}
      {status === 'error' && <ErrorBlock message="Could not load events." onRetry={load} />}

      {status === 'ready' && (
      visible.length === 0 ?
      <EmptyBlock
        icon={<CalendarIcon className="h-6 w-6" />}
        title={`No ${kind.toLowerCase()} events scheduled`}
        body="Nothing of this kind is on the calendar right now. Check back, or browse everything." /> :


      <ul className="space-y-3">
            {visible.map((event) => {
          const host = personById(event.hostId);
          return (
            <li
              key={event.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/5 bg-ink-900 p-3 sm:flex-nowrap">
              
                  <Link to={`/events/${event.id}`} className="shrink-0">
                    <img
                  src={event.image}
                  alt=""
                  loading="lazy"
                  className="h-20 w-32 rounded-xl object-cover" />
                
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist-200">
                        {event.kind}
                      </span>
                      {event.state === 'live' &&
                  <span className="flex items-center gap-1 rounded bg-live px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                          Live
                        </span>
                  }
                    </p>
                    <h2 className="mt-1 text-sm font-bold text-white">
                      <Link
                    to={`/events/${event.id}`}
                    className="transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                    
                        {event.name}
                      </Link>
                    </h2>
                    <p className="mt-0.5 text-[11px] text-mist-400">
                      {event.when} · hosted by {host.name} · {event.attendees}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-mist-300">
                      {event.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                  to={`/events/${event.id}`}
                  className="rounded-lg bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
                  
                      {event.state === 'live' ? 'Join' : 'Open'}
                    </Link>
                    <button
                  type="button"
                  onClick={() => toggleReminder(event.id, event.name)}
                  aria-pressed={hasReminder(event.id)}
                  className={[
                  'rounded-lg border px-4 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance',
                  hasReminder(event.id) ?
                  'border-brand-indigo/50 text-brand-indigo' :
                  'border-white/15 text-mist-200 hover:text-white'].
                  join(' ')}>
                  
                      {hasReminder(event.id) ? 'Reminder on' : 'Remind me'}
                    </button>
                  </div>
                </li>);

        })}
          </ul>)
      }
    </div>);

}