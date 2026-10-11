import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, TvIcon, UsersIcon } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import { personById } from '../../data/communityPeople';
import { useCommunity } from '../../contexts/CommunityContext';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../../components/community/StateBlocks';
import type { WatchPartyRecord } from '../../types/communityEntities';

const filters = ['All', 'Live now', 'Scheduled', 'Mine'] as const;
type Filter = (typeof filters)[number];

export function WatchParties() {
  const { joinedParties, hasReminder, toggleReminder } = useCommunity();
  const [parties, setParties] = React.useState<WatchPartyRecord[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [filter, setFilter] = React.useState<Filter>('All');

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

  const visible = parties.filter((party) => {
    if (filter === 'Live now') return party.state === 'live';
    if (filter === 'Scheduled') return party.state === 'scheduled';
    if (filter === 'Mine') return party.hostedByUser || joinedParties.includes(party.id);
    return true;
  });

  return (
    <div className="p-4 pb-12 sm:p-5">
      <header className="mb-5 flex flex-wrap items-end gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
            HavaVerse Community
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Watch parties</h1>
          <p className="mt-1 max-w-xl text-sm text-mist-400">
            Synced playback with the people who care about the same thing you do.
          </p>
        </div>
        <Link
          to="/watch-parties/create"
          className="ml-auto flex items-center gap-1.5 rounded-full bg-brand-indigo px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Create watch party
        </Link>
      </header>

      <div role="tablist" aria-label="Filter watch parties" className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {filters.map((option) =>
        <button
          key={option}
          role="tab"
          type="button"
          aria-selected={filter === option}
          onClick={() => setFilter(option)}
          className={[
          'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-entrance',
          filter === option ?
          'border-transparent bg-brand-indigo text-white' :
          'border-white/10 bg-ink-850 text-mist-300 hover:border-white/25 hover:text-white'].
          join(' ')}>
          
            {option}
          </button>
        )}
      </div>

      {status === 'loading' && <SkeletonRows rows={4} />}
      {status === 'error' && <ErrorBlock message="Could not load watch parties." onRetry={load} />}

      {status === 'ready' && (
      visible.length === 0 ?
      <EmptyBlock
        icon={<TvIcon className="h-6 w-6" />}
        title={filter === 'Mine' ? 'You have not joined a watch party yet' : 'Nothing scheduled here'}
        body={
        filter === 'Mine' ?
        'Join one from the list, or host your own and invite your community.' :
        'Watch parties appear here as communities schedule them.'
        }
        action={
        <Link
          to="/watch-parties/create"
          className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
                Create a watch party
              </Link>
        } /> :


      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((party) => {
          const host = personById(party.hostId);
          const joined = joinedParties.includes(party.id);
          return (
            <li key={party.id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
                    <Link to={`/watch-parties/${party.id}`} className="relative block aspect-[16/9]">
                      {party.image ?
                  <img
                    src={party.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-opacity duration-150 ease-entrance hover:opacity-85" /> :


                  <span className="flex h-full w-full items-center justify-center bg-ink-850">
                          <TvIcon className="h-6 w-6 text-mist-400" aria-hidden="true" />
                        </span>
                  }
                      <span className="absolute left-2 top-2 flex items-center gap-1.5">
                        {party.state === 'live' ?
                    <span className="flex items-center gap-1 rounded bg-live px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                            Live
                          </span> :

                    <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-mist-100 backdrop-blur">
                            {party.when}
                          </span>
                    }
                        {party.visibility !== 'public' &&
                    <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-mist-200 backdrop-blur">
                            {party.visibility === 'community' ? 'Community' : 'Invite only'}
                          </span>
                    }
                      </span>
                    </Link>

                    <div className="flex flex-1 flex-col p-4">
                      <h2 className="text-sm font-bold leading-snug text-white">
                        <Link
                      to={`/watch-parties/${party.id}`}
                      className="transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                      
                          {party.title}
                        </Link>
                      </h2>
                      <p className="mt-1 text-[11px] text-mist-400">
                        Hosted by {host.name} · {party.when}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-mist-300">
                        {party.description}
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-[11px] text-mist-400">
                        <UsersIcon className="h-3 w-3" aria-hidden="true" />
                        {party.participants.toLocaleString()}{' '}
                        {party.state === 'live' ? 'watching' : 'going'}
                      </p>

                      <div className="mt-auto flex items-center gap-1.5 pt-4">
                        <Link
                      to={`/watch-parties/${party.id}`}
                      className="flex-1 rounded-lg bg-brand-indigo px-3 py-2 text-center text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
                      
                          {party.state === 'live' ? 'Join now' : joined ? 'Open party' : 'View party'}
                        </Link>
                        {party.state !== 'live' &&
                    <button
                      type="button"
                      onClick={() => toggleReminder(party.id, party.title)}
                      aria-pressed={hasReminder(party.id)}
                      className={[
                      'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance',
                      hasReminder(party.id) ?
                      'border-brand-indigo/50 text-brand-indigo' :
                      'border-white/15 text-mist-200 hover:text-white'].
                      join(' ')}>
                      
                            {hasReminder(party.id) ? 'Reminder on' : 'Remind me'}
                          </button>
                    }
                      </div>
                    </div>
                  </article>
                </li>);

        })}
          </ul>)
      }
    </div>);

}