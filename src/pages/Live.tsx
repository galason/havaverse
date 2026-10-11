import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BellIcon, CalendarClockIcon, RadioIcon } from 'lucide-react';
import { liveApi, sourceLabels } from '../services/liveApi';
import { liveReminders } from '../services/liveReminders';
import { useApp } from '../contexts/AppContext';
import { LiveNowSection } from '../components/live/LiveNowSection';
import { UpcomingList } from '../components/live/UpcomingList';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../components/community/StateBlocks';
import type { LiveEntry, LiveSource } from '../types/live';

type Filter = 'all' | 'reminders' | LiveSource;

const sourceOrder: LiveSource[] = ['sports', 'concert', 'podcast', 'event', 'watch-party', 'premiere'];

/**
 * HavaVerse Live — everything happening now or soon, in one schedule.
 * Each entry links back to the page that owns it; tickets, seats and joining
 * happen there. Reminders are shared with Home and Community.
 */
export function Live() {
  const { showToast } = useApp();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [entries, setEntries] = React.useState<LiveEntry[]>([]);
  const [reminders, setReminders] = React.useState<string[]>(() => liveReminders.all());

  const raw = params.get('type');
  const filter: Filter = raw === 'reminders' || sourceOrder.includes(raw as LiveSource) ? raw as Filter : 'all';

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await liveApi.list();
    if (!result.ok) {
      setStatus('error');
      return;
    }
    setEntries(result.data);
    setStatus('ready');
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => liveReminders.subscribe(setReminders), []);

  const setFilter = (next: Filter) => {
    const p = new URLSearchParams(params);
    if (next === 'all') p.delete('type');else
    p.set('type', next);
    setParams(p, { replace: true });
  };

  const toggleReminder = (entry: LiveEntry) => {
    const on = liveApi.toggleReminder(entry);
    showToast(on ? `We'll remind you before ${entry.title} starts` : 'Reminder removed');
  };

  const matches = (e: LiveEntry) =>
  filter === 'all' ? true : filter === 'reminders' ? reminders.includes(e.id) : e.source === filter;

  const shown = entries.filter(matches);
  const liveNow = shown.filter((e) => e.state === 'live');
  const upcoming = shown.filter((e) => e.state === 'upcoming');
  const liveCount = entries.filter((e) => e.state === 'live').length;
  const reminderCount = entries.filter((e) => reminders.includes(e.id)).length;

  const tabs: {id: Filter;label: string;count: number;}[] = [
  { id: 'all', label: 'All', count: entries.length },
  ...sourceOrder.
  map((s) => ({ id: s as Filter, label: sourceLabels[s], count: entries.filter((e) => e.source === s).length })).
  filter((t) => t.count > 0),
  { id: 'reminders', label: 'Your reminders', count: reminderCount }];


  const filterName = tabs.find((t) => t.id === filter)?.label.toLowerCase() ?? 'live';

  return (
    <div className="mx-auto w-full max-w-7xl p-4 pb-14 sm:p-5">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Live</h1>
        <p className="mt-1 text-sm text-mist-300">
          {status === 'ready' ?
          liveCount > 0 ?
          `${liveCount} happening now across sports, music, podcasts and communities.` :
          'Nothing is live right now. Here is what starts next.' :
          'Matches, concerts, conversations, watch parties and premieres in one schedule.'}
        </p>
      </header>

      {status === 'ready' &&
      <nav aria-label="Filter live schedule" className="mb-6 min-w-0">
          <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {tabs.map((t) => {
            const active = filter === t.id;
            return (
              <li key={t.id} className="shrink-0">
                  <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(t.id)}
                  className={[
                  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 ease-entrance',
                  active ?
                  'border-white bg-white text-ink-950' :
                  'border-white/10 text-mist-200 hover:border-white/30 hover:text-white'].
                  join(' ')}>
                  
                    {t.id === 'reminders' && <BellIcon className="h-3 w-3" aria-hidden="true" />}
                    {t.label}
                    <span className={`tabular-nums ${active ? 'text-ink-700' : 'text-mist-400'}`}>{t.count}</span>
                  </button>
                </li>);

          })}
          </ul>
        </nav>
      }

      {status === 'loading' &&
      <div className="space-y-4">
          <div className="h-72 animate-pulse rounded-2xl bg-ink-900" />
          <SkeletonRows rows={3} />
        </div>
      }

      {status === 'error' && <ErrorBlock message="The live schedule couldn't be loaded." onRetry={load} />}

      {status === 'ready' && shown.length === 0 &&
      <EmptyBlock
        icon={filter === 'reminders' ? <BellIcon className="h-6 w-6" /> : <RadioIcon className="h-6 w-6" />}
        title={filter === 'reminders' ? 'No reminders yet' : `No ${filterName} scheduled`}
        body={
        filter === 'reminders' ?
        'Tap “Remind me” on anything coming up and it will collect here. You get a Live notification when it starts.' :
        'When something is scheduled here it will show up in this list.'
        }
        action={
        filter !== 'all' ?
        <button
          type="button"
          onClick={() => setFilter('all')}
          className="text-xs font-semibold text-brand-indigo transition-colors duration-150 ease-entrance hover:text-brand-violet">
          
                See everything live
              </button> :
        undefined
        } />

      }

      {status === 'ready' && shown.length > 0 &&
      <div className="space-y-10">
          {liveNow.length > 0 &&
        <section aria-labelledby="live-now-h">
              <h2 id="live-now-h" className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-live" aria-hidden="true" />
                Happening now
              </h2>
              <LiveNowSection entries={liveNow} onOpen={liveApi.recordOpen} />
            </section>
        }

          {upcoming.length > 0 &&
        <section aria-labelledby="upcoming-h">
              <h2 id="upcoming-h" className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                <CalendarClockIcon className="h-4 w-4 text-mist-400" aria-hidden="true" />
                Coming up
              </h2>
              <UpcomingList
            entries={upcoming}
            isReminded={(id) => reminders.includes(id)}
            onToggleReminder={toggleReminder}
            onOpen={liveApi.recordOpen} />
          
            </section>
        }

          <p className="text-[11px] leading-relaxed text-mist-400">
            Times are shown as each organiser lists them. Tickets and seats are bought on the event's own page.
            Reminders are saved on this device; you're notified in{' '}
            <Link to="/notifications?category=live" className="font-semibold text-mist-300 hover:text-white">
              Live notifications
            </Link>{' '}
            when a reminded event starts.
          </p>
        </div>
      }
    </div>);

}