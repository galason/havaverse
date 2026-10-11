import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BookmarkIcon,
  ListTreeIcon,
  PauseIcon,
  PlayIcon,
  SendIcon,
  SparklesIcon } from
'lucide-react';
import { podcastApi, type EpisodeAnswer } from '../../services/podcastApi';
import { guests as allGuests, hosts, shows, topics } from '../../data/podcast';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { ConversationGraph } from '../../components/podcast/ConversationGraph';
import { Transcript } from '../../components/podcast/Transcript';
import { MomentCard } from '../../components/podcast/MomentCard';
import { EpisodeRow } from '../../components/podcast/EpisodeRow';
import { SupportPanel } from '../../components/podcast/SupportPanel';
import { formatClock, usePodcast } from '../../contexts/PodcastContext';
import type { Episode } from '../../types/podcast';

export function EpisodePage() {
  const { episodeId = '' } = useParams();
  const navigate = useNavigate();
  const { current, playing, play, toggle, seek, isSaved, toggleSave } = usePodcast();

  const [episode, setEpisode] = React.useState<Episode | null>(null);
  const [siblings, setSiblings] = React.useState<Episode[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState<EpisodeAnswer | null>(null);
  const [asking, setAsking] = React.useState(false);
  const [askError, setAskError] = React.useState('');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const one = await podcastApi.getEpisode(episodeId);
    if (!one.ok || !one.data) {
      setStatus('missing');
      return;
    }
    setEpisode(one.data);
    const rest = await podcastApi.listEpisodes(one.data.showId);
    setSiblings(rest.ok ? rest.data.filter((e) => e.id !== one.data!.id) : []);
    setStatus('ready');
  }, [episodeId]);

  React.useEffect(() => {
    load();
    setAnswer(null);
    setQuestion('');
  }, [load]);

  const ask = async (value: string) => {
    if (!episode) return;
    setAsking(true);
    setAskError('');
    const result = await podcastApi.askEpisode(episode.id, value);
    setAsking(false);
    if (!result.ok) {
      setAskError(result.error);
      return;
    }
    setAnswer(result.data);
  };

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading episode…" />
      </div>);

  }

  if (status === 'missing' || !episode) {
    return (
      <div className="p-5">
        <ErrorBlock message="That episode is not available." onRetry={load} />
      </div>);

  }

  const show = shows.find((s) => s.id === episode.showId);
  const host = hosts.find((h) => h.id === show?.hostId);
  const guests = allGuests.filter((g) => episode.guestIds.includes(g.id));
  const episodeTopics = topics.filter((t) => episode.topicIds.includes(t.id));
  const active = current?.id === episode.id;
  const saved = isSaved(episode.id);
  const discussTo = show ? `/community/${show.communitySlug}` : '/communities';

  const jumpTo = (seconds: number) => {
    if (!active) play(episode);
    seek(seconds);
  };

  return (
    <div className="p-4 pb-12 sm:p-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back
      </button>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <img
          src={episode.artwork}
          alt={`Artwork for ${episode.title}`}
          className="aspect-square w-full rounded-2xl border border-white/5 object-cover" />
        

        <div className="min-w-0">
          {show &&
          <Link
            to={`/podcast/show/${show.id}`}
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
            
              {show.title} · S{String(episode.season).padStart(2, '0')} E
              {String(episode.number).padStart(2, '0')}
            </Link>
          }
          <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {episode.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-200">{episode.summary}</p>
          <p className="mt-2 text-[11px] text-mist-400">
            {host?.name} · {formatClock(episode.durationSeconds)} · {episode.publishedAt}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => active ? toggle() : play(episode)}
              className="flex items-center gap-2 rounded-full bg-brand-violet px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
              
              {active && playing ?
              <PauseIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> :

              <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              }
              {active && playing ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => toggleSave(episode.id)}
              aria-pressed={saved}
              className={`flex items-center gap-1.5 rounded-full border px-5 py-3 text-sm font-semibold transition-colors duration-150 ease-entrance ${
              saved ?
              'border-brand-amber text-brand-amber' :
              'border-white/25 text-white hover:bg-white/10'}`
              }>
              
              <BookmarkIcon
                className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`}
                aria-hidden="true" />
              
              {saved ? 'Saved' : 'Save'}
            </button>
            <Link
              to={discussTo}
              className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
              Discuss
            </Link>
          </div>

          {episodeTopics.length > 0 &&
          <ul className="mt-4 flex flex-wrap gap-1.5">
              {episodeTopics.map((topic) =>
            <li key={topic.id}>
                  <Link
                to={`/podcast/topic/${topic.id}`}
                className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium text-mist-200 transition-colors duration-150 ease-entrance hover:border-brand-cyan hover:text-white">
                
                    {topic.label}
                  </Link>
                </li>
            )}
            </ul>
          }
        </div>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section
            aria-labelledby="whats-inside"
            className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            
            <h2
              id="whats-inside"
              className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">
              
              <ListTreeIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
              What's inside
            </h2>
            <p className="mt-0.5 text-[11px] text-mist-400">
              Chapters are machine-generated from the recording.
            </p>
            <ol className="mt-3 space-y-0.5">
              {episode.chapters.map((chapter) =>
              <li key={chapter.startSeconds}>
                  <button
                  type="button"
                  onClick={() => jumpTo(chapter.startSeconds)}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 ease-entrance hover:bg-white/5">
                  
                    <span className="shrink-0 text-[11px] font-semibold tabular-nums text-brand-cyan">
                      {formatClock(chapter.startSeconds)}
                    </span>
                    <span className="min-w-0 truncate text-xs text-mist-200">{chapter.label}</span>
                  </button>
                </li>
              )}
            </ol>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section aria-labelledby="transcript">
              <h2 id="transcript" className="mb-2.5 text-base font-bold tracking-tight text-white">
                Transcript
              </h2>
              <Transcript episode={episode} />
            </section>

            <section aria-labelledby="moments">
              <h2 id="moments" className="mb-2.5 text-base font-bold tracking-tight text-white">
                Moments
              </h2>
              <div className="space-y-3">
                {episode.moments.map((moment) =>
                <MomentCard
                  key={moment.id}
                  moment={moment}
                  episode={episode}
                  discussTo={discussTo} />

                )}
              </div>
            </section>
          </div>

          <ConversationGraph nodes={episode.graph} />

          {siblings.length > 0 &&
          <section aria-labelledby="more-from-show">
              <h2
              id="more-from-show"
              className="mb-2.5 text-base font-bold tracking-tight text-white">
              
                More from {show?.title}
              </h2>
              <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
                {siblings.map((sibling) =>
              <EpisodeRow key={sibling.id} episode={sibling} showProgress />
              )}
              </div>
            </section>
          }
        </div>

        <aside className="space-y-4">
          <section
            aria-labelledby="ask-this-episode"
            className="rounded-2xl border border-brand-violet/25 bg-ink-900 p-4">
            
            <h2
              id="ask-this-episode"
              className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">
              
              <SparklesIcon className="h-4 w-4 text-brand-violet" aria-hidden="true" />
              Ask this episode
            </h2>
            <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">
              Answers come from the transcript only. If it was not said here, it will tell you so.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(question);
              }}
              className="mt-3 flex gap-2">
              
              <label className="min-w-0 flex-1">
                <span className="sr-only">Ask about this episode</span>
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="e.g. every moment they mention Lagos"
                  className="w-full rounded-lg border border-white/10 bg-ink-850 px-3 py-2.5 text-xs text-white outline-none transition-colors duration-150 ease-entrance placeholder:text-mist-400 focus:border-brand-violet" />
                
              </label>
              <button
                type="submit"
                disabled={asking}
                aria-label="Ask"
                className="shrink-0 rounded-lg bg-brand-violet px-3.5 py-2.5 text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta disabled:bg-ink-800 disabled:text-mist-400">
                
                <SendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </form>

            {asking &&
            <p className="mt-3 text-[11px] text-mist-400" role="status">
                Reading the transcript…
              </p>
            }
            {askError &&
            <p className="mt-3 text-[11px] text-live" role="alert">
                {askError}
              </p>
            }

            {answer &&
            <div className="mt-3 rounded-xl border border-white/5 bg-ink-850 p-3">
                <p className="text-[11px] leading-relaxed text-mist-200">{answer.answer}</p>
                {answer.citations.length > 0 &&
              <ul className="mt-2 space-y-1.5">
                    {answer.citations.map((citation, i) =>
                <li key={`${citation.atSeconds}-${i}`}>
                        <button
                    type="button"
                    onClick={() => jumpTo(citation.atSeconds)}
                    className="w-full rounded-lg px-2 py-1.5 text-left transition-colors duration-150 ease-entrance hover:bg-white/5">
                    
                          <span className="block text-[10px] font-semibold tabular-nums text-brand-cyan">
                            {formatClock(citation.atSeconds)} · {citation.speaker}
                          </span>
                          <span className="mt-0.5 block line-clamp-2 text-[11px] text-mist-300">
                            {citation.text}
                          </span>
                        </button>
                      </li>
                )}
                  </ul>
              }
              </div>
            }
          </section>

          {guests.length > 0 &&
          <section
            aria-labelledby="people-and-ideas"
            className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            
              <h2 id="people-and-ideas" className="text-sm font-bold tracking-tight text-white">
                People in this conversation
              </h2>
              <ul className="mt-2.5 space-y-2">
                {guests.map((guest) =>
              <li key={guest.id}>
                    <Link
                  to={guest.to ?? '#'}
                  className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-ink-850 p-2.5 transition-colors duration-150 ease-entrance hover:border-white/20">
                  
                      <img src={guest.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-white">
                          {guest.name}
                        </span>
                        <span className="block truncate text-[10px] text-mist-400">
                          {guest.role}
                        </span>
                      </span>
                    </Link>
                  </li>
              )}
              </ul>
            </section>
          }

          {episode.relatedStory &&
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">Related in HavaVerse</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-mist-300">
                This conversation is connected to {episode.relatedStory.label} through the content
                graph.
              </p>
              <Link
              to={episode.relatedStory.to}
              className="mt-3 block rounded-lg border border-white/15 px-4 py-2.5 text-center text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
              
                Open {episode.relatedStory.label}
              </Link>
            </section>
          }

          {host && <SupportPanel host={host} />}
        </aside>
      </div>
    </div>);

}