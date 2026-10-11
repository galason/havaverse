import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, BellOffIcon, CheckCheckIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { notificationsApi } from '../services/notificationsApi';
import { categories } from '../data/notifications';
import { NotificationRow } from '../components/notifications/NotificationRow';
import { NotificationPreferences } from '../components/notifications/NotificationPreferences';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../components/community/StateBlocks';
import type { AppNotification, NotificationCategory } from '../types/notifications';

type Filter = 'all' | NotificationCategory;

const DAY = 24 * 60 * 60 * 1000;

function bucketOf(at: number): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const today = start.getTime();
  if (at >= today) return 'Today';
  if (at >= today - DAY) return 'Yesterday';
  if (at >= today - 6 * DAY) return 'Earlier this week';
  return 'Older';
}

function groupByDay(list: AppNotification[]) {
  const groups: {label: string;items: AppNotification[];}[] = [];
  for (const n of [...list].sort((a, b) => b.createdAt - a.createdAt)) {
    const label = bucketOf(n.createdAt);
    const group = groups.find((g) => g.label === label);
    if (group) group.items.push(n);else
    groups.push({ label, items: [n] });
  }
  return groups;
}

export function Notifications() {
  const { notifications } = useApp();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = React.useState<'loading' | 'error' | 'ready'>('loading');

  const view = params.get('view') === 'preferences' ? 'preferences' : 'inbox';
  const rawCategory = params.get('category');
  const filter: Filter = categories.some((c) => c.id === rawCategory) ? rawCategory as NotificationCategory : 'all';
  const unreadOnly = params.get('unread') === '1';

  const load = React.useCallback(async () => {
    setStatus('loading');
    const res = await notificationsApi.list();
    setStatus(res.ok ? 'ready' : 'error');
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => v === null ? next.delete(k) : next.set(k, v));
    setParams(next);
  };

  const unreadIn = (f: Filter) => notifications.filter((n) => !n.read && (f === 'all' || n.kind === f)).length;
  const shown = notifications.filter((n) => (filter === 'all' || n.kind === filter) && (!unreadOnly || !n.read));
  const groups = groupByDay(shown);
  const unreadHere = unreadIn(filter);
  const filterLabel = filter === 'all' ? 'All' : categories.find((c) => c.id === filter)!.label;

  const tabs: {id: Filter;label: string;}[] = [{ id: 'all', label: 'All' }, ...categories.map((c) => ({ id: c.id, label: c.label }))];

  return (
    <div className="mx-auto w-full max-w-6xl p-4 pb-14 sm:p-5">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          {view === 'preferences' &&
          <button
            type="button"
            onClick={() => update({ view: null })}
            className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
              <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Back to notifications
            </button>
          }
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {view === 'preferences' ? 'Notification preferences' : 'Notifications'}
          </h1>
          <p className="mt-1 text-xs text-mist-400">
            {view === 'preferences' ?
            'Choose what reaches you, and where, for each part of HavaVerse.' :
            unreadIn('all') > 0 ?
            `${unreadIn('all')} unread across HavaVerse.` :
            "You're all caught up."}
          </p>
        </div>
        {view === 'inbox' &&
        <div className="flex items-center gap-2">
            <button
            type="button"
            onClick={() => notificationsApi.markAllRead(filter === 'all' ? undefined : filter)}
            disabled={unreadHere === 0}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 px-3.5 py-2 text-xs font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white disabled:opacity-40">
            
              <CheckCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {filter === 'all' ? 'Mark all read' : `Mark ${filterLabel} read`}
            </button>
            <button
            type="button"
            onClick={() => update({ view: 'preferences' })}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 px-3.5 py-2 text-xs font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
            
              <SlidersHorizontalIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Preferences
            </button>
          </div>
        }
      </header>

      {view === 'preferences' ?
      <div className="min-w-0 max-w-4xl">
          <NotificationPreferences />
        </div> :

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
          {/* Category navigation: a vertical list on desktop, a scrolling row on mobile.
             min-w-0 stops the row's content width from widening the grid column. */}
          <nav aria-label="Notification categories" className="min-w-0">
            <ul className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
              {tabs.map((t) => {
              const active = filter === t.id;
              const count = unreadIn(t.id);
              return (
                <li key={t.id} className="shrink-0">
                    <button
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => update({ category: t.id === 'all' ? null : t.id })}
                    className={[
                    'flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-150 ease-entrance lg:rounded-lg',
                    active ? 'bg-white/10 text-white' : 'text-mist-300 hover:bg-white/5 hover:text-white'].
                    join(' ')}>
                    
                      {t.label}
                      {count > 0 &&
                    <span className="rounded-full bg-brand-indigo px-1.5 text-[10px] font-bold tabular-nums text-white">
                          {count}
                        </span>
                    }
                    </button>
                  </li>);

            })}
            </ul>
          </nav>

          <section aria-label={`${filterLabel} notifications`} className="min-w-0">
            <div className="mb-3 flex items-center justify-end">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-mist-300">
                <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => update({ unread: e.target.checked ? '1' : null })}
                className="h-3.5 w-3.5 rounded border-white/20 bg-transparent accent-brand-indigo" />
              
                Unread only
              </label>
            </div>

            {status === 'loading' && <SkeletonRows rows={4} />}
            {status === 'error' && <ErrorBlock message="Couldn't load your notifications." onRetry={load} />}
            {status === 'ready' && shown.length === 0 &&
          <EmptyBlock
            icon={<BellOffIcon className="h-6 w-6" />}
            title={notifications.length === 0 ? 'No notifications yet' : unreadOnly ? 'Nothing unread' : `No ${filterLabel.toLowerCase()} notifications`}
            body={
            notifications.length === 0 ?
            'Replies, releases from creators you follow, orders and payouts will show up here.' :
            unreadOnly ?
            "You've read everything in this view." :
            'When something happens here, it will show up in this list.'
            }
            action={
            filter !== 'all' ?
            <button
              type="button"
              onClick={() => update({ view: 'preferences' })}
              className="text-xs font-semibold text-brand-indigo transition-colors duration-150 ease-entrance hover:text-brand-violet">
              
                      Check {filterLabel.toLowerCase()} preferences
                    </button> :
            undefined
            } />

          }
            {status === 'ready' && shown.length > 0 &&
          <div className="space-y-6">
                {groups.map((g) =>
            <div key={g.label}>
                    <h2 className="mb-2 px-1 text-xs font-semibold text-mist-400">{g.label}</h2>
                    <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
                      {g.items.map((n) =>
                <NotificationRow key={n.id} notification={n} />
                )}
                    </ul>
                  </div>
            )}
                <p className="px-1 text-[11px] text-mist-400">
                  Read state and dismissals are saved on this device until the notification service is connected.{' '}
                  <Link to="/settings/notifications" className="font-semibold text-mist-300 hover:text-white">
                    Settings
                  </Link>
                </p>
              </div>
          }
          </section>
        </div>
      }
    </div>);

}