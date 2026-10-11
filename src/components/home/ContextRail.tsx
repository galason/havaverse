import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRightIcon,
  SendHorizonalIcon,
  SparklesIcon } from
'lucide-react';
import type { HavaAnswer, HomeFeed } from '../../types/home';
import { homeApi } from '../../services/homeApi';
import { happenings } from '../../data/catalog';

type Turn = {id: string;role: 'user' | 'ai';body: string;options?: HavaAnswer['options'];};

const toneStyles: Record<string, string> = {
  live: 'text-live',
  trending: 'text-brand-amber',
  new: 'text-brand-cyan',
  community: 'text-brand-magenta'
};

interface ContextRailProps {
  feed: HomeFeed;
  /** Focus token — incremented by the intent bar to pull focus into the input. */
  focusSignal: number;
}

const prompts = [
'I have 90 minutes. What should I watch?',
'What’s happening in football today?',
'Find me something my wife and I can enjoy',
'Show me music for a late-night drive'];


/**
 * The right rail adapts to the viewer's context rather than being a third
 * unrelated column: Hava AI always, then whichever of live / community /
 * creator activity actually applies to them.
 */
export function ContextRail({ feed, focusSignal }: ContextRailProps) {
  const [value, setValue] = React.useState('');
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [thinking, setThinking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (focusSignal > 0) inputRef.current?.focus();
  }, [focusSignal]);

  async function ask(prompt: string) {
    const question = prompt.trim();
    if (!question || thinking) return;
    setError(null);
    setValue('');
    setTurns((t) => [...t, { id: `u${Date.now()}`, role: 'user', body: question }]);
    setThinking(true);
    homeApi.track('ai_prompt_submitted', { prompt: question });

    const result = await homeApi.askHava(question);
    setThinking(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTurns((t) => [
    ...t,
    { id: `a${Date.now()}`, role: 'ai', body: result.data.body, options: result.data.options }]
    );
  }

  const creatorModule = feed.modules.find((m) => m.config.id === 'creators');
  const communityModule = feed.modules.find((m) => m.config.id === 'communities');

  return (
    <div className="w-full space-y-3 xl:w-[21rem] xl:shrink-0">
      {/* ------------------------------------------------------------ Hava AI */}
      <section
        aria-labelledby="hava-h"
        className="rounded-2xl border border-brand-violet/25 bg-ink-900 p-4">
        
        <h2 id="hava-h" className="flex items-center gap-2 text-sm font-bold text-white">
          <SparklesIcon className="h-4 w-4 text-brand-violet" aria-hidden="true" />
          Hava AI
        </h2>
        <p className="mt-0.5 text-[11px] text-mist-400">
          Your personal entertainment intelligence
        </p>

        <div className="mt-3 space-y-2">
          {turns.length === 0 &&
          <p className="rounded-xl bg-ink-850 p-3 text-xs leading-relaxed text-mist-200">
              Tell me how much time you have, the mood you’re in, or who you’re watching with.
              I’ll answer from what HavaVerse actually carries today.
            </p>
          }

          {turns.map((turn) =>
          turn.role === 'user' ?
          <p
            key={turn.id}
            className="ml-6 rounded-xl bg-brand-indigo/20 p-2.5 text-xs font-semibold text-white">
            
                {turn.body}
              </p> :

          <div key={turn.id} className="rounded-xl bg-ink-850 p-3">
                <p className="text-xs leading-relaxed text-mist-200">{turn.body}</p>
                {turn.options && turn.options.length > 0 &&
            <ul className="mt-2.5 space-y-1.5">
                    {turn.options.map((option) =>
              <li key={option.id}>
                        <Link
                  to={option.to}
                  onClick={() => homeApi.track('recommendation_clicked', { id: option.id })}
                  className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-ink-900 p-2 transition-colors duration-150 ease-entrance hover:border-brand-indigo/40">
                  
                          {option.poster &&
                  <img
                    src={option.poster}
                    alt=""
                    className="h-10 w-8 shrink-0 rounded object-cover" />

                  }
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold text-white">
                              {option.name}
                            </span>
                            <span className="block truncate text-[10px] text-mist-400">
                              {option.meta}
                            </span>
                          </span>
                          <span className="shrink-0 rounded-full bg-brand-indigo px-2.5 py-1 text-[10px] font-bold text-white">
                            {option.cta}
                          </span>
                        </Link>
                      </li>
              )}
                  </ul>
            }
              </div>

          )}

          {thinking &&
          <p className="rounded-xl bg-ink-850 p-3 text-xs text-mist-400">Hava is thinking…</p>
          }
          {error &&
          <p role="alert" className="rounded-xl bg-live/10 p-3 text-xs text-live">
              {error}
            </p>
          }
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void ask(value);
          }}
          className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-ink-850 px-3 py-1.5">
          
          <label htmlFor="hava-input" className="sr-only">
            Ask Hava AI
          </label>
          <input
            id="hava-input"
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="What are you in the mood for?"
            className="min-w-0 flex-1 bg-transparent text-xs text-white placeholder:text-mist-400 focus:outline-none" />
          
          <button
            type="submit"
            disabled={!value.trim() || thinking}
            aria-label="Send to Hava AI"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-indigo text-white disabled:opacity-40">
            
            <SendHorizonalIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </form>

        {turns.length === 0 &&
        <ul className="mt-2 space-y-1">
            {prompts.map((prompt) =>
          <li key={prompt}>
                <button
              type="button"
              onClick={() => void ask(prompt)}
              className="w-full rounded-lg border border-white/5 px-2.5 py-1.5 text-left text-[11px] text-mist-300 transition-colors duration-150 ease-entrance hover:border-white/20 hover:text-white">
              
                  {prompt}
                </button>
              </li>
          )}
          </ul>
        }
      </section>

      {/* ------------------------------------------------------- What's happening */}
      <section
        aria-labelledby="happening-h"
        className="rounded-2xl border border-white/5 bg-ink-900 p-4">
        
        <div className="flex items-center">
          <h2 id="happening-h" className="text-sm font-bold text-white">
            What’s happening
          </h2>
          <Link
            to="/events"
            className="ml-auto flex items-center gap-0.5 text-[11px] font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
            View all
            <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-2.5 space-y-1">
          {happenings.map((item) =>
          <li key={item.id}>
              <Link
              to={item.labelTone === 'live' ? '/sports' : '/communities'}
              className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors duration-150 ease-entrance hover:bg-ink-850">
              
                <img
                src={item.image}
                alt=""
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded object-cover" />
              
                <span className="min-w-0 flex-1">
                  <span
                  className={`block text-[10px] font-bold uppercase tracking-wide ${
                  toneStyles[item.labelTone] ?? 'text-mist-400'}`
                  }>
                  
                    {item.label}
                  </span>
                  <span className="block truncate text-xs font-semibold text-white">
                    {item.title}
                  </span>
                  <span className="block truncate text-[10px] text-mist-400">{item.meta}</span>
                </span>
                <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-mist-400" aria-hidden="true" />
              </Link>
            </li>
          )}
        </ul>
      </section>

      {/* ------------------------------ adaptive slot: community, else creator */}
      {communityModule?.communities?.length ?
      <section
        aria-labelledby="rail-community-h"
        className="rounded-2xl border border-white/5 bg-ink-900 p-4">
        
          <h2 id="rail-community-h" className="text-sm font-bold text-white">
            Your communities
          </h2>
          <ul className="mt-2.5 space-y-1.5">
            {communityModule.communities.slice(0, 2).map((item) =>
          <li key={item.id}>
                <Link
              to={item.to}
              className="block rounded-lg border border-white/5 p-2.5 transition-colors duration-150 ease-entrance hover:border-brand-magenta/40">
              
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-brand-magenta">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block line-clamp-2 text-xs font-semibold text-white">
                    {item.headline}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-mist-400">
                    {item.meta}
                  </span>
                </Link>
              </li>
          )}
          </ul>
        </section> :
      creatorModule?.creators?.length ?
      <section
        aria-labelledby="rail-creator-h"
        className="rounded-2xl border border-white/5 bg-ink-900 p-4">
        
          <h2 id="rail-creator-h" className="text-sm font-bold text-white">
            Creator spotlight
          </h2>
          <ul className="mt-2.5 space-y-1.5">
            {creatorModule.creators.slice(0, 2).map((item) =>
          <li key={item.id}>
                <Link
              to={item.to}
              className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors duration-150 ease-entrance hover:bg-ink-850">
              
                  <img src={item.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-white">
                      {item.creator}
                    </span>
                    <span className="block truncate text-[10px] text-mist-400">
                      {item.label} · {item.headline}
                    </span>
                  </span>
                </Link>
              </li>
          )}
          </ul>
        </section> :
      null}

      {/* ------------------------------------------------------ targeting note */}
      <p className="px-1 text-[10px] leading-relaxed text-mist-400">
        This page was assembled for {feed.context.regionName} from{' '}
        {feed.modules.length} configured modules
        {feed.matchedAudiences.length > 0 ?
        ` matching ${feed.matchedAudiences.join(', ')}` :
        ''}
        .
      </p>
    </div>);

}