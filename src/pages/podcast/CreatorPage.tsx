import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BadgeCheckIcon, MessagesSquareIcon } from 'lucide-react';
import { podcastApi } from '../../services/podcastApi';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { ShowCard } from '../../components/podcast/ShowCard';
import { EpisodeRow } from '../../components/podcast/EpisodeRow';
import { LiveConversationCard } from '../../components/podcast/LiveConversationCard';
import { MembershipCard } from '../../components/podcast/MembershipCard';
import { SupportPanel } from '../../components/podcast/SupportPanel';
import { EconomyPanel } from '../../components/podcast/EconomyPanel';
import { useApp } from '../../contexts/AppContext';
import type {
  Episode,
  Host,
  LiveConversation,
  PodMembership,
  Show } from
'../../types/podcast';

const panels = ['episodes', 'shows', 'live', 'support', 'about'] as const;
type Panel = (typeof panels)[number];

const panelLabel: Record<Panel, string> = {
  episodes: 'Latest',
  shows: 'Shows',
  live: 'Live',
  support: 'Support',
  about: 'About'
};

export function PodcastCreatorPage() {
  const { hostId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { isFollowing, toggleFollow } = useApp();

  const [host, setHost] = React.useState<Host | null>(null);
  const [shows, setShows] = React.useState<Show[]>([]);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [live, setLive] = React.useState<LiveConversation[]>([]);
  const [memberships, setMemberships] = React.useState<PodMembership[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const h = await podcastApi.getHost(hostId);
    if (!h.ok || !h.data) {
      setStatus('missing');
      return;
    }
    const [s, e, l, m] = await Promise.all([
    podcastApi.listShows(),
    podcastApi.listEpisodes(),
    podcastApi.listLive(),
    podcastApi.listMemberships(hostId)]
    );
    const own = s.ok ? s.data.filter((show) => show.hostId === hostId) : [];
    const ownIds = own.map((show) => show.id);
    setHost(h.data);
    setShows(own);
    setEpisodes(e.ok ? e.data.filter((ep) => ownIds.includes(ep.showId)) : []);
    setLive(l.ok ? l.data.filter((event) => ownIds.includes(event.showId)) : []);
    setMemberships(m.ok ? m.data : []);
    setStatus('ready');
  }, [hostId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const paramPanel = params.get('panel') as Panel | null;
  const panel: Panel = panels.includes(paramPanel as Panel) ? paramPanel as Panel : 'episodes';
  const setPanel = (next: Panel) =>
  setParams(next === 'episodes' ? {} : { panel: next }, { replace: true });

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading creator…" />
      </div>);

  }

  if (status === 'missing' || !host) {
    return (
      <div className="p-5">
        <ErrorBlock message="That creator is not on HavaVerse Podcast." onRetry={load} />
      </div>);

  }

  const key = `host:${host.id}`;
  const following = isFollowing(key);

  return (
    <div className="p-4 pb-12 sm:p-5">
      <header className="flex flex-wrap items-start gap-4">
        <img src={host.avatar} alt="" className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24" />
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {host.name}
            {host.verified &&
            <BadgeCheckIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />
            }
          </h1>
          <p className="text-xs text-mist-400">
            {host.roles} · {host.city}, {host.country}
          </p>
          <p className="mt-0.5 text-xs text-mist-400">
            {host.listeners} listeners · {host.supporters} supporters
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggleFollow(key)}
            aria-pressed={following}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance ${
            following ?
            'border border-white/20 text-mist-200 hover:text-white' :
            'bg-brand-violet text-white hover:bg-brand-magenta'}`
            }>
            
            {following ? 'Following' : 'Follow'}
          </button>
          <button
            type="button"
            onClick={() => setPanel('support')}
            className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
            Support
          </button>
          {host.communitySlug &&
          <Link
            to={`/community/${host.communitySlug}`}
            className="flex items-center gap-1.5 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
              <MessagesSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Community
            </Link>
          }
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Creator sections"
        className="no-scrollbar mt-5 flex gap-2 overflow-x-auto border-b border-white/5 pb-2">
        
        {panels.map((option) =>
        <button
          key={option}
          role="tab"
          type="button"
          aria-selected={panel === option}
          onClick={() => setPanel(option)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ease-entrance ${
          panel === option ?
          'bg-brand-violet text-white' :
          'text-mist-300 hover:bg-white/5 hover:text-white'}`
          }>
          
            {panelLabel[option]}
          </button>
        )}
      </div>

      <div className="mt-5">
        {panel === 'episodes' && (
        episodes.length === 0 ?
        <EmptyBlock title="Nothing published yet" body="This creator has no episodes." /> :

        <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
              {episodes.map((episode) =>
          <EpisodeRow key={episode.id} episode={episode} showProgress />
          )}
            </div>)
        }

        {panel === 'shows' &&
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {shows.map((show) =>
          <li key={show.id}>
                <ShowCard show={show} />
              </li>
          )}
          </ul>
        }

        {panel === 'live' && (
        live.length === 0 ?
        <EmptyBlock
          title="No dates announced"
          body="Live recordings and AMAs will appear here." /> :


        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {live.map((event) =>
          <li key={event.id}>
                  <LiveConversationCard event={event} />
                </li>
          )}
            </ul>)
        }

        {panel === 'support' &&
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              {memberships.length > 0 ?
            <ul className="grid gap-4 sm:grid-cols-2">
                  {memberships.map((membership) =>
              <li key={membership.id}>
                      <MembershipCard membership={membership} />
                    </li>
              )}
                </ul> :

            <EmptyBlock
              title="No membership yet"
              body="You can still support this creator directly." />

            }
            </div>
            <div className="space-y-4">
              <SupportPanel host={host} />
              <EconomyPanel />
            </div>
          </div>
        }

        {panel === 'about' &&
        <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">About {host.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-200">{host.bio}</p>
          </div>
        }
      </div>
    </div>);

}