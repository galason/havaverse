import React from 'react';
import { Link } from 'react-router-dom';
import { SendIcon, SparklesIcon } from 'lucide-react';
import { podcastApi, type ListeningJourney } from '../../services/podcastApi';
import { episodes as allEpisodes, shows } from '../../data/podcast';
import { usePodcast } from '../../contexts/PodcastContext';

const suggestions = [
'How is AI changing African business?',
'Catch me up on the cities argument',
'Something short about the creator economy',
'A conversation about history'];


/**
 * Discovery as a sequenced argument rather than a playlist — each leg is a
 * segment with a reason for being there.
 */
export function AskHava() {
  const { play } = usePodcast();
  const [prompt, setPrompt] = React.useState('');
  const [journey, setJourney] = React.useState<ListeningJourney | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'thinking' | 'ready' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const run = async (value: string) => {
    setStatus('thinking');
    setError('');
    const result = await podcastApi.buildJourney(value);
    if (!result.ok) {
      setError(result.error);
      setStatus('error');
      return;
    }
    setJourney(result.data);
    setStatus('ready');
  };

  const first = journey ? allEpisodes.find((e) => e.id === journey.legs[0]?.episodeId) : null;

  return (
    <section
      aria-labelledby="hava-ai-podcast"
      className="rounded-2xl border border-brand-violet/25 bg-ink-900 p-4">
      
      <h2
        id="hava-ai-podcast"
        className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">
        
        <SparklesIcon className="h-4 w-4 text-brand-violet" aria-hidden="true" />
        Hava AI
      </h2>
      <p className="mt-0.5 text-[11px] text-mist-400">
        What are you curious about? It builds a journey, not a queue.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          run(prompt);
        }}
        className="mt-3 flex gap-2">
        
        <label className="min-w-0 flex-1">
          <span className="sr-only">What are you curious about?</span>
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="e.g. How is AI changing African business?"
            className="w-full rounded-lg border border-white/10 bg-ink-850 px-3 py-2.5 text-xs text-white outline-none transition-colors duration-150 ease-entrance placeholder:text-mist-400 focus:border-brand-violet" />
          
        </label>
        <button
          type="submit"
          disabled={status === 'thinking'}
          aria-label="Build the journey"
          className="shrink-0 rounded-lg bg-brand-violet px-3.5 py-2.5 text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta disabled:bg-ink-800 disabled:text-mist-400">
          
          <SendIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>

      <ul className="mt-2 flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) =>
        <li key={suggestion}>
            <button
            type="button"
            onClick={() => {
              setPrompt(suggestion);
              run(suggestion);
            }}
            className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-mist-300 transition-colors duration-150 ease-entrance hover:border-white/30 hover:text-white">
            
              {suggestion}
            </button>
          </li>
        )}
      </ul>

      {status === 'thinking' &&
      <p className="mt-3 text-[11px] text-mist-400" role="status">
          Reading through the transcripts…
        </p>
      }

      {status === 'error' &&
      <p className="mt-3 text-[11px] text-live" role="alert">
          {error}
        </p>
      }

      {status === 'ready' && journey &&
      <div className="mt-3 rounded-xl border border-white/5 bg-ink-850 p-3">
          <p className="text-xs font-bold text-white">
            Your {journey.totalMinutes}-minute journey
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">{journey.rationale}</p>

          <ol className="mt-2.5 space-y-2">
            {journey.legs.map((leg, i) => {
            const episode = allEpisodes.find((e) => e.id === leg.episodeId);
            if (!episode) return null;
            const show = shows.find((s) => s.id === episode.showId);
            return (
              <li key={leg.episodeId} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-violet/40 text-[10px] font-bold text-brand-violet">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <Link
                    to={`/podcast/episode/${episode.id}`}
                    className="block truncate text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:text-brand-cyan">
                    
                      {episode.title}
                    </Link>
                    <span className="block text-[10px] text-mist-400">
                      {show?.title} · {leg.minutes} min · {leg.why}
                    </span>
                  </span>
                </li>);

          })}
          </ol>

          <button
          type="button"
          onClick={() => first && play(first)}
          className="mt-3 w-full rounded-lg bg-brand-violet px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
          
            Start journey
          </button>
        </div>
      }
    </section>);

}