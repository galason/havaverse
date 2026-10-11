import React from 'react';
import { Link } from 'react-router-dom';
import { FlameIcon, GlobeIcon, HistoryIcon, RadioTowerIcon, SparklesIcon } from 'lucide-react';
import { podcastApi } from '../services/podcastApi';
import { listeningRooms } from '../data/podcast';
import { SectionHeader } from '../components/community/SectionHeader';
import { ErrorBlock, SkeletonRows } from '../components/community/StateBlocks';
import { PodcastHero } from '../components/podcast/PodcastHero';
import { ConversationGraph } from '../components/podcast/ConversationGraph';
import { ConversationMap } from '../components/podcast/ConversationMap';
import { WorldCard } from '../components/podcast/WorldCard';
import { EpisodeRow } from '../components/podcast/EpisodeRow';
import { ShowCard } from '../components/podcast/ShowCard';
import { HostCard } from '../components/podcast/HostCard';
import { LiveConversationCard } from '../components/podcast/LiveConversationCard';
import { DropCard } from '../components/podcast/DropCard';
import { ImpactPanel } from '../components/podcast/ImpactPanel';
import { AskHava } from '../components/podcast/AskHava';
import { EconomyPanel } from '../components/podcast/EconomyPanel';
import { PassportPanel } from '../components/podcast/PassportPanel';
import { usePodcast } from '../contexts/PodcastContext';
import type {
  ConversationWorld,
  Episode,
  Host,
  LiveConversation,
  PodDrop,
  Show } from
'../types/podcast';

export function Podcast() {
  const { progressFor } = usePodcast();

  const [worlds, setWorlds] = React.useState<ConversationWorld[]>([]);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [shows, setShows] = React.useState<Show[]>([]);
  const [hosts, setHosts] = React.useState<Host[]>([]);
  const [live, setLive] = React.useState<LiveConversation[]>([]);
  const [drops, setDrops] = React.useState<PodDrop[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [w, e, s, h, l, d] = await Promise.all([
    podcastApi.listWorlds(),
    podcastApi.listEpisodes(),
    podcastApi.listShows(),
    podcastApi.listHosts(),
    podcastApi.listLive(),
    podcastApi.listDrops()]
    );
    if (w.ok && e.ok && s.ok && h.ok && l.ok && d.ok) {
      setWorlds(w.data);
      setEpisodes(e.data);
      setShows(s.data);
      setHosts(h.data);
      setLive(l.data);
      setDrops(d.data);
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorBlock message="HavaVerse Podcast could not be loaded." onRetry={load} />
      </div>);

  }

  const featured = episodes[0];
  const continueListening = episodes.filter((e) => {
    const p = progressFor(e.id);
    return p > 0.01 && p < 0.97;
  });
  const nextUp = episodes.filter((e) => e.id !== featured?.id).slice(0, 4);

  return (
    <div className="p-4 pb-12 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-9">
          <PodcastHero />

          {featured && <ConversationGraph nodes={featured.graph} />}

          <section aria-labelledby="conversations-without-borders">
            <SectionHeader
              id="conversations-without-borders"
              title="Conversations without borders"
              subtitle="The world is talking. This is where it is talking from."
              icon={<GlobeIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />} />
            
            <ConversationMap />
          </section>

          <section aria-labelledby="conversation-worlds">
            <SectionHeader
              id="conversation-worlds"
              title="Conversation worlds"
              subtitle="Not categories. Bodies of argument, with their own shows and communities." />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {worlds.map((world) =>
              <li key={world.id}>
                    <WorldCard world={world} />
                  </li>
              )}
              </ul>
            }
          </section>

          {continueListening.length > 0 &&
          <section aria-labelledby="continue-listening">
              <SectionHeader
              id="continue-listening"
              title="Continue listening"
              subtitle="Picked up where you stopped, at the second you stopped."
              icon={<HistoryIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />} />
            
              <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
                {continueListening.map((episode) =>
              <EpisodeRow key={episode.id} episode={episode} showProgress />
              )}
              </div>
            </section>
          }

          <section aria-labelledby="your-next-conversation">
            <SectionHeader
              id="your-next-conversation"
              title="Your next conversation"
              subtitle="Because you listened to The Future Is African."
              icon={<SparklesIcon className="h-5 w-5 text-brand-violet" aria-hidden="true" />} />
            
            {status === 'loading' ?
            <SkeletonRows rows={3} /> :

            <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
                {nextUp.map((episode) =>
              <EpisodeRow key={episode.id} episode={episode} showProgress />
              )}
              </div>
            }
          </section>

          <ImpactPanel />

          <section aria-labelledby="shows">
            <SectionHeader
              id="shows"
              title="Shows"
              subtitle="Each one is a universe, not a feed of files." />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {shows.map((show) =>
              <li key={show.id}>
                    <ShowCard show={show} />
                  </li>
              )}
              </ul>
            }
          </section>

          <section aria-labelledby="people-to-follow">
            <SectionHeader
              id="people-to-follow"
              title="People you may want to follow"
              subtitle="Hosts, guests and the people who keep turning up in the arguments." />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-3 sm:grid-cols-2">
                {hosts.map((host) =>
              <li key={host.id}>
                    <HostCard host={host} />
                  </li>
              )}
              </ul>
            }
          </section>

          <section aria-labelledby="live-in-havaverse">
            <SectionHeader
              id="live-in-havaverse"
              title="Live in HavaVerse"
              subtitle="Recordings, roundtables and AMAs you can be in the room for."
              icon={<RadioTowerIcon className="h-5 w-5 text-live" aria-hidden="true" />}
              actionTo="/podcast/live"
              actionLabel="All conversations" />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {live.map((event) =>
              <li key={event.id}>
                    <LiveConversationCard event={event} />
                  </li>
              )}
              </ul>
            }
          </section>

          <section aria-labelledby="exclusive-drops">
            <SectionHeader
              id="exclusive-drops"
              title="Exclusive drops"
              subtitle="Archive collections and unreleased seasons, opened once."
              icon={<FlameIcon className="h-5 w-5 text-brand-amber" aria-hidden="true" />} />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {drops.map((drop) =>
              <li key={drop.id}>
                    <DropCard drop={drop} />
                  </li>
              )}
              </ul>
            }
          </section>

          <p className="rounded-2xl border border-white/5 bg-ink-900 px-4 py-3.5 text-[11px] leading-relaxed text-mist-300">
            Support, memberships, collections and live seats settle through{' '}
            <Link to="/wallet" className="font-semibold text-brand-cyan hover:text-white">
              HavaPay
            </Link>{' '}
            and are attributed to the creator. Chapters, transcripts and summaries are
            machine-generated and labelled as such — they never invent what was not said.
          </p>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <AskHava />
          <EconomyPanel />
          <PassportPanel />

          <section
            aria-labelledby="conversation-continues"
            className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            
            <h2 id="conversation-continues" className="text-sm font-bold tracking-tight text-white">
              The conversation continues
            </h2>
            <ul className="mt-2.5 space-y-2">
              {listeningRooms.map((room) =>
              <li key={room.id}>
                  <Link
                  to={room.to}
                  className="block rounded-xl border border-white/5 bg-ink-850 p-2.5 transition-colors duration-150 ease-entrance hover:border-white/20">
                  
                    <span className="block text-xs font-semibold text-white">{room.name}</span>
                    <span className="mt-0.5 block text-[11px] text-mist-400">{room.detail}</span>
                  </Link>
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-brand-amber/25 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Start your own show</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-mist-300">
              Publish from Studio, attach live dates and collections, and the same graph that
              recommends the episode routes the money back to you.
            </p>
            <Link
              to="/studio"
              className="mt-3 block rounded-lg bg-brand-amber px-3 py-2 text-center text-xs font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-brand-amber/85">
              
              Open Studio
            </Link>
          </section>
        </aside>
      </div>
    </div>);

}