import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { MessagesSquareIcon, PlayIcon } from 'lucide-react';
import { podcastApi } from '../../services/podcastApi';
import { guests as allGuests, hosts, topics as allTopics } from '../../data/podcast';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { EpisodeRow } from '../../components/podcast/EpisodeRow';
import { LiveConversationCard } from '../../components/podcast/LiveConversationCard';
import { DropCard } from '../../components/podcast/DropCard';
import { MembershipCard } from '../../components/podcast/MembershipCard';
import { SupportPanel } from '../../components/podcast/SupportPanel';
import { EconomyPanel } from '../../components/podcast/EconomyPanel';
import { MomentCard } from '../../components/podcast/MomentCard';
import { usePodcast } from '../../contexts/PodcastContext';
import type {
  Episode,
  LiveConversation,
  PodDrop,
  PodMembership,
  Show } from
'../../types/podcast';

const panels = ['listen', 'stories', 'guests', 'topics', 'community', 'live', 'collection', 'support'] as const;
type Panel = (typeof panels)[number];

const panelLabel: Record<Panel, string> = {
  listen: 'Listen',
  stories: 'Stories',
  guests: 'Guests',
  topics: 'Topics',
  community: 'Community',
  live: 'Live',
  collection: 'Collection',
  support: 'Support'
};

export function ShowPage() {
  const { showId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { isFollowing, toggleFollowShow, play } = usePodcast();

  const [show, setShow] = React.useState<Show | null>(null);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [live, setLive] = React.useState<LiveConversation[]>([]);
  const [drops, setDrops] = React.useState<PodDrop[]>([]);
  const [memberships, setMemberships] = React.useState<PodMembership[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const s = await podcastApi.getShow(showId);
    if (!s.ok || !s.data) {
      setStatus('missing');
      return;
    }
    const [e, l, d, m] = await Promise.all([
    podcastApi.listEpisodes(showId),
    podcastApi.listLive(showId),
    podcastApi.listDrops(showId),
    podcastApi.listMemberships(s.data.hostId)]
    );
    setShow(s.data);
    setEpisodes(e.ok ? e.data : []);
    setLive(l.ok ? l.data : []);
    setDrops(d.ok ? d.data : []);
    setMemberships(m.ok ? m.data : []);
    setStatus('ready');
  }, [showId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const paramPanel = params.get('panel') as Panel | null;
  const panel: Panel = panels.includes(paramPanel as Panel) ? paramPanel as Panel : 'listen';
  const setPanel = (next: Panel) =>
  setParams(next === 'listen' ? {} : { panel: next }, { replace: true });

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading show…" />
      </div>);

  }

  if (status === 'missing' || !show) {
    return (
      <div className="p-5">
        <ErrorBlock message="That show is not on HavaVerse Podcast." onRetry={load} />
      </div>);

  }

  const host = hosts.find((h) => h.id === show.hostId);
  const following = isFollowing(show.id);
  const showTopics = allTopics.filter((t) => show.topicIds.includes(t.id));
  const showGuests = allGuests.filter((g) =>
  episodes.some((e) => e.guestIds.includes(g.id))
  );
  const moments = episodes.flatMap((e) => e.moments.map((m) => ({ moment: m, episode: e })));

  return (
    <div className="pb-12">
      <div className="relative min-h-[240px] sm:min-h-[320px]">
        <img src={show.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_12%,rgb(var(--c-ink-950)/0.35)_100%)]" />
        <div className="relative flex min-h-[240px] flex-col justify-end p-5 sm:min-h-[320px] sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            {show.origin}
          </p>
          <h1 className="mt-1.5 font-display text-4xl uppercase leading-none tracking-tight text-white sm:text-6xl">
            {show.title}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-mist-200">{show.tagline}</p>
          <p className="mt-2 text-[11px] text-mist-400">
            {host && `Hosted by ${host.name} · `}
            {show.listeners} listeners · {show.communityMembers} community members ·{' '}
            {show.episodeCount} episodes
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => episodes[0] && play(episodes[0])}
              disabled={episodes.length === 0}
              className="flex items-center gap-2 rounded-full bg-brand-violet px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-mist-400">
              
              <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Play latest
            </button>
            <button
              type="button"
              onClick={() => toggleFollowShow(show.id)}
              aria-pressed={following}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-150 ease-entrance ${
              following ?
              'border border-white/20 text-mist-200 hover:text-white' :
              'border border-white/25 text-white hover:bg-white/10'}`
              }>
              
              {following ? 'Following' : 'Follow'}
            </button>
            <Link
              to={`/community/${show.communitySlug}`}
              className="flex items-center gap-1.5 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
              <MessagesSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Join community
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5">
        <div
          role="tablist"
          aria-label="Show sections"
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
          {panel === 'listen' && (
          episodes.length === 0 ?
          <EmptyBlock title="No episodes yet" body="This show has not published anything." /> :

          <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
                {episodes.map((episode) =>
            <EpisodeRow key={episode.id} episode={episode} showProgress />
            )}
              </div>)
          }

          {panel === 'stories' && (
          moments.length === 0 ?
          <EmptyBlock
            title="No marked moments yet"
            body="Moments appear when the audience reacts to something specific." /> :


          <ul className="grid gap-3 sm:grid-cols-2">
                {moments.map(({ moment, episode }) =>
            <li key={moment.id}>
                    <MomentCard
                moment={moment}
                episode={episode}
                discussTo={`/community/${show.communitySlug}`} />
              
                  </li>
            )}
              </ul>)
          }

          {panel === 'guests' && (
          showGuests.length === 0 ?
          <EmptyBlock
            title="No guests yet"
            body="This show is recorded solo. Guests appear here when they join." /> :


          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {showGuests.map((guest) =>
            <li key={guest.id}>
                    <Link
                to={guest.to ?? '#'}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3.5 transition-colors duration-150 ease-entrance hover:border-white/20">
                
                      <img src={guest.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">
                          {guest.name}
                        </span>
                        <span className="block truncate text-[11px] text-mist-400">
                          {guest.role}
                        </span>
                      </span>
                    </Link>
                  </li>
            )}
              </ul>)
          }

          {panel === 'topics' &&
          <ul className="flex flex-wrap gap-2">
              {showTopics.map((topic) =>
            <li key={topic.id}>
                  <Link
                to={`/podcast/topic/${topic.id}`}
                className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-mist-200 transition-colors duration-150 ease-entrance hover:border-brand-cyan hover:text-white">
                
                    {topic.label}
                    <span className="text-[11px] text-mist-400">{topic.followers}</span>
                  </Link>
                </li>
            )}
            </ul>
          }

          {panel === 'community' &&
          <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">Where the conversation continues</h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-mist-300">
                {show.communityMembers} people discuss this show in the community anchored to it,
                including timestamp threads tied to specific moments in each episode.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                to={`/community/${show.communitySlug}`}
                className="rounded-full bg-brand-violet px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
                
                  Open the community
                </Link>
                <Link
                to="/events"
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
                
                  Listening events
                </Link>
              </div>
            </div>
          }

          {panel === 'live' && (
          live.length === 0 ?
          <EmptyBlock
            title="No dates announced"
            body="Live recordings and AMAs from this show will appear here." /> :


          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {live.map((event) =>
            <li key={event.id}>
                    <LiveConversationCard event={event} />
                  </li>
            )}
              </ul>)
          }

          {panel === 'collection' && (
          drops.length === 0 ?
          <EmptyBlock
            title="Nothing open"
            body="Archive collections and unreleased material appear here when they open." /> :


          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {drops.map((drop) =>
            <li key={drop.id}>
                    <DropCard drop={drop} />
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
                <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                  <h2 className="text-sm font-bold text-white">About the show</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-200">
                    {show.about}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {host && <SupportPanel host={host} />}
                <EconomyPanel />
              </div>
            </div>
          }
        </div>
      </div>
    </div>);

}