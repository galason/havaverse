import React from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, PlusIcon, TvIcon } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import { useCommunity } from '../../contexts/CommunityContext';
import { SectionHeader } from './SectionHeader';
import { ErrorBlock, SkeletonRows } from './StateBlocks';
import type { WatchPartyRecord } from '../../types/communityEntities';

export function WatchTogether() {
  const { hasReminder, toggleReminder } = useCommunity();
  const [parties, setParties] = React.useState<WatchPartyRecord[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await communityApi.listWatchParties();
    if (result.ok) {
      setParties(result.data);
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const live = parties.filter((p) => p.state === 'live');
  const upcoming = parties.filter((p) => p.state !== 'live').slice(0, 3);

  return (
    <section
      aria-labelledby="watch-together"
      className="flex flex-col rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <SectionHeader
        id="watch-together"
        title="Watch together"
        subtitle="Synced playback with the people who care about it"
        icon={<TvIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />}
        actionTo="/watch-parties" />
      

      {status === 'loading' && <SkeletonRows rows={3} />}
      {status === 'error' && <ErrorBlock message="Could not load watch parties." onRetry={load} />}

      {status === 'ready' &&
      <>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-mist-400">
            Happening now
          </p>
          {live.map((party) =>
        <div key={party.id} className="overflow-hidden rounded-xl border border-live/30 bg-ink-850">
              <div className="flex items-center gap-3 p-2.5">
                <img
              src={party.image}
              alt=""
              loading="lazy"
              className="h-14 w-20 shrink-0 rounded-lg object-cover" />
            
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{party.title}</p>
                  <p className="truncate text-[11px] text-mist-400">{party.description}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-live">
                    <span className="h-1.5 w-1.5 rounded-full bg-live" aria-hidden="true" />
                    {party.participants.toLocaleString()} watching together
                  </p>
                </div>
              </div>
              <Link
            to={`/watch-parties/${party.id}`}
            className="flex items-center justify-center gap-1.5 bg-brand-indigo px-3 py-2.5 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
                <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                Join watch party
              </Link>
            </div>
        )}

          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-mist-400">
            Starting soon
          </p>
          <ul className="space-y-2">
            {upcoming.map((party) =>
          <li
            key={party.id}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-850 p-2">
            
                <Link to={`/watch-parties/${party.id}`} className="shrink-0">
                  <img
                src={party.image}
                alt=""
                loading="lazy"
                className="h-11 w-11 rounded-lg object-cover" />
              
                </Link>
                <span className="min-w-0 flex-1">
                  <Link
                to={`/watch-parties/${party.id}`}
                className="block truncate text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                
                    {party.title}
                  </Link>
                  <span className="block truncate text-[11px] text-mist-400">{party.when}</span>
                  <span className="block truncate text-[11px] text-mist-400">
                    {party.participants.toLocaleString()} going
                  </span>
                </span>
                <button
              type="button"
              onClick={() => toggleReminder(party.id, party.title)}
              aria-pressed={hasReminder(party.id)}
              className={[
              'shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance',
              hasReminder(party.id) ?
              'border-brand-indigo/50 text-brand-indigo' :
              'border-white/15 text-mist-200 hover:text-white'].
              join(' ')}>
              
                  {hasReminder(party.id) ? 'Reminder on' : 'Remind me'}
                </button>
              </li>
          )}
          </ul>
        </>
      }

      <Link
        to="/watch-parties/create"
        className="mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-white/15 p-3 text-left transition-colors duration-150 ease-entrance hover:border-brand-indigo/60">
        
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-indigo/20 text-brand-indigo">
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-xs font-semibold text-white">Create watch party</span>
          <span className="block text-[11px] text-mist-400">
            Invite friends or your whole community.
          </span>
        </span>
      </Link>
    </section>);

}