import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { HashIcon } from 'lucide-react';
import { podcastApi } from '../../services/podcastApi';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { EpisodeRow } from '../../components/podcast/EpisodeRow';
import { MomentCard } from '../../components/podcast/MomentCard';
import { shows as allShows } from '../../data/podcast';
import type { Episode, Topic } from '../../types/podcast';

export function TopicPage() {
  const { topicId = '' } = useParams();

  const [topic, setTopic] = React.useState<Topic | null>(null);
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [t, e] = await Promise.all([podcastApi.listTopics(), podcastApi.listEpisodes()]);
    const found = t.ok ? t.data.find((entry) => entry.id === topicId) : undefined;
    if (!found) {
      setStatus('missing');
      return;
    }
    setTopic(found);
    setEpisodes(e.ok ? e.data.filter((ep) => ep.topicIds.includes(topicId)) : []);
    setStatus('ready');
  }, [topicId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading topic…" />
      </div>);

  }

  if (status === 'missing' || !topic) {
    return (
      <div className="p-5">
        <ErrorBlock message="That topic does not exist." onRetry={load} />
      </div>);

  }

  const moments = episodes.flatMap((episode) =>
  episode.moments.map((moment) => ({ moment, episode }))
  );

  return (
    <div className="p-4 pb-12 sm:p-5">
      <header className="mb-6">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">
          <HashIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Topic
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {topic.label}
        </h1>
        <p className="mt-1 text-sm text-mist-400">
          {topic.followers} following ·{' '}
          <Link
            to={`/podcast/world/${topic.worldId}`}
            className="transition-colors duration-150 ease-entrance hover:text-white">
            
            Part of this conversation world
          </Link>
        </p>
      </header>

      {episodes.length === 0 ?
      <EmptyBlock
        title="Nothing tagged here yet"
        body="Episodes get attached to a topic when the conversation actually covers it, not by keyword." /> :


      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section aria-labelledby="topic-episodes">
            <h2 id="topic-episodes" className="mb-3 text-base font-bold tracking-tight text-white">
              Conversations on this
            </h2>
            <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
              {episodes.map((episode) =>
            <EpisodeRow key={episode.id} episode={episode} showProgress />
            )}
            </div>
          </section>

          {moments.length > 0 &&
        <section aria-labelledby="topic-moments">
              <h2 id="topic-moments" className="mb-3 text-base font-bold tracking-tight text-white">
                What was said
              </h2>
              <div className="space-y-3">
                {moments.map(({ moment, episode }) => {
              const show = allShows.find((s) => s.id === episode.showId);
              return (
                <MomentCard
                  key={moment.id}
                  moment={moment}
                  episode={episode}
                  discussTo={show ? `/community/${show.communitySlug}` : '/communities'} />);


            })}
              </div>
            </section>
        }
        </div>
      }
    </div>);

}