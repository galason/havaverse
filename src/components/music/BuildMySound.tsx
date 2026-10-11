import React from 'react';
import { SendIcon, SparklesIcon } from 'lucide-react';
import { musicApi, type Journey } from '../../services/musicApi';
import { tracks as allTracks } from '../../data/music';
import { useMusic } from '../../contexts/MusicContext';
import { TrackRow } from './TrackRow';

const suggestions = [
'Lagos night drive after rain',
'Amapiano for a long evening',
'Something like Sade but newer',
'Music from the film I just watched'];


/**
 * Natural-language discovery. It genuinely matches against the catalogue and
 * says so when nothing matched, rather than inventing a result.
 */
export function BuildMySound() {
  const { play } = useMusic();
  const [prompt, setPrompt] = React.useState('');
  const [journey, setJourney] = React.useState<Journey | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'thinking' | 'ready' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const run = async (value: string) => {
    setStatus('thinking');
    setError('');
    const result = await musicApi.buildJourney(value);
    if (!result.ok) {
      setError(result.error);
      setStatus('error');
      return;
    }
    setJourney(result.data);
    setStatus('ready');
  };

  const journeyTracks = journey ?
  journey.trackIds.map((id) => allTracks.find((t) => t.id === id)).filter(Boolean) as typeof allTracks :
  [];

  return (
    <section
      aria-labelledby="build-my-sound"
      className="rounded-2xl border border-brand-violet/25 bg-ink-900 p-4">
      
      <h2
        id="build-my-sound"
        className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">
        
        <SparklesIcon className="h-4 w-4 text-brand-violet" aria-hidden="true" />
        Build my sound
      </h2>
      <p className="mt-0.5 text-[11px] text-mist-400">
        Describe the moment, not the genre. Hava AI builds the journey.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          run(prompt);
        }}
        className="mt-3 flex gap-2">
        
        <label className="min-w-0 flex-1">
          <span className="sr-only">What are you in the mood for?</span>
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="e.g. Lagos night drive after rain"
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
          Listening to what you said…
        </p>
      }

      {status === 'error' &&
      <p className="mt-3 text-[11px] text-live" role="alert">
          {error}
        </p>
      }

      {status === 'ready' && journey &&
      <div className="mt-3 rounded-xl border border-white/5 bg-ink-850 p-3">
          <p className="text-xs font-bold text-white">{journey.title}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">{journey.rationale}</p>
          <div className="mt-2 space-y-0.5">
            {journeyTracks.map((track) =>
          <TrackRow key={track.id} track={track} queue={journeyTracks} />
          )}
          </div>
          <button
          type="button"
          onClick={() => journeyTracks[0] && play(journeyTracks[0], journeyTracks)}
          className="mt-2.5 w-full rounded-lg bg-brand-violet px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
          
            Play this journey
          </button>
        </div>
      }
    </section>);

}