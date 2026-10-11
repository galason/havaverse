import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessagesSquareIcon } from 'lucide-react';
import { podcastApi } from '../../services/podcastApi';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { ShowCard } from '../../components/podcast/ShowCard';
import { EpisodeRow } from '../../components/podcast/EpisodeRow';
import type { ConversationWorld, Episode, Show, Topic } from '../../types/podcast';

export function PodcastWorldPage() {
  const { worldId = '' } = useParams();

  const [world, setWorld] = React.useState<ConversationWorld | null>(null);
  const [shows, setShows] = React.useState<Show[]>([]);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [topics, setTopics] = React.useState<Topic[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const w = await podcastApi.getWorld(worldId);
    if (!w.ok || !w.data) {
      setStatus('missing');
      return;
    }
    const [s, e, t] = await Promise.all([
    podcastApi.listShows(worldId),
    podcastApi.listEpisodes(),
    podcastApi.listTopics(worldId)]
    );
    const showIds = s.ok ? s.data.map((show) => show.id) : [];
    setWorld(w.data);
    setShows(s.ok ? s.data : []);
    setEpisodes(e.ok ? e.data.filter((ep) => showIds.includes(ep.showId)) : []);
    setTopics(t.ok ? t.data : []);
    setStatus('ready');
  }, [worldId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Entering the world…" />
      </div>);

  }

  if (status === 'missing' || !world) {
    return (
      <div className="p-5">
        <ErrorBlock message="That world does not exist yet." onRetry={load} />
      </div>);

  }

  return (
    <div className="pb-12">
      <div className="relative min-h-[240px] sm:min-h-[320px]">
        <img src={world.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_12%,rgb(var(--c-ink-950)/0.3)_100%)]" />
        <div className="relative flex min-h-[240px] flex-col justify-end p-5 sm:min-h-[320px] sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            Conversation world
          </p>
          <h1 className="mt-1.5 font-display text-4xl uppercase leading-none tracking-tight text-white sm:text-6xl">
            {world.name}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-mist-200">{world.blurb}</p>
          <p className="mt-2 text-[11px] text-mist-400">
            {world.showCount} shows · {world.episodeCount.toLocaleString('en-NG')} episodes ·{' '}
            {world.communityCount} communities · {world.liveCount} live
          </p>
          <Link
            to={world.communityTo}
            className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
            <MessagesSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Community
          </Link>
        </div>
      </div>

      <div className="space-y-8 p-4 sm:p-5">
        {topics.length > 0 &&
        <section aria-labelledby="world-topics">
            <h2 id="world-topics" className="mb-3 text-base font-bold tracking-tight text-white">
              What is being argued about
            </h2>
            <ul className="flex flex-wrap gap-2">
              {topics.map((topic) =>
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
          </section>
        }

        <section aria-labelledby="world-shows">
          <h2 id="world-shows" className="mb-3 text-base font-bold tracking-tight text-white">
            Shows in this world
          </h2>
          {shows.length === 0 ?
          <EmptyBlock
            title="No shows here yet"
            body="This world is being built. The communities and live conversations are already running."
            action={
            <Link
              to="/podcast"
              className="rounded-full bg-brand-violet px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
              
                  Back to Podcast
                </Link>
            } /> :


          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {shows.map((show) =>
            <li key={show.id}>
                  <ShowCard show={show} />
                </li>
            )}
            </ul>
          }
        </section>

        {episodes.length > 0 &&
        <section aria-labelledby="world-episodes">
            <h2 id="world-episodes" className="mb-3 text-base font-bold tracking-tight text-white">
              Conversations
            </h2>
            <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
              {episodes.map((episode) =>
            <EpisodeRow key={episode.id} episode={episode} showProgress />
            )}
            </div>
          </section>
        }
      </div>
    </div>);

}