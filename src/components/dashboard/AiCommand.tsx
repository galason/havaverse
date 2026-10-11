import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, SendIcon, SparklesIcon } from 'lucide-react';
import type { CommandAnswer, DashboardViewerContext } from '../../types/dashboard';
import { dashboardApi } from '../../services/dashboardApi';

interface AiCommandProps {
  prompts: string[];
  heading: string;
  subheading?: string;
  ctx: DashboardViewerContext;
}

/**
 * Hava AI as the dashboard's command layer. It is grounded in the viewer's own
 * HavaVerse and, crucially, never executes a consequential operation on its
 * own — those come back as a proposal the user has to confirm.
 */
export function AiCommand({ prompts, heading, subheading, ctx }: AiCommandProps) {
  const [value, setValue] = React.useState('');
  const [state, setState] = React.useState<'idle' | 'thinking' | 'answered' | 'error'>('idle');
  const [answer, setAnswer] = React.useState<CommandAnswer | null>(null);
  const [error, setError] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const live = React.useRef(true);

  React.useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  async function submit(question: string) {
    if (!question.trim() || state === 'thinking') return;
    setState('thinking');
    setAnswer(null);
    setError('');
    const result = await dashboardApi.ask(question, ctx);
    if (!live.current) return;
    if (!result.ok) {
      setError(result.error);
      setState('error');
      return;
    }
    setAnswer(result.data);
    setState('answered');
  }

  return (
    <section
      id="hava-command"
      className="overflow-hidden rounded-2xl border border-brand-indigo/30 bg-ink-900 hv-ai-surface">
      
      <div className="relative p-5 sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-indigo/10 blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-brand-indigo" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-300">
              {heading}
            </p>
          </div>
          <h2 className="mt-2 font-display text-2xl tracking-wide text-white sm:text-3xl">
            {subheading ?? 'What would you like to get done?'}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
            className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-ink-950 px-3 py-2 hv-ai-input">
            
            <label htmlFor="hava-ask" className="sr-only">
              Ask Hava anything about your HavaVerse
            </label>
            <input
              id="hava-ask"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask Hava anything about your HavaVerse…"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-white placeholder:text-mist-400 focus:outline-none" />
            
            <button
              type="submit"
              disabled={!value.trim() || state === 'thinking'}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-indigo text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-mist-400"
              aria-label="Ask Hava">
              
              <SendIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {prompts.map((prompt) =>
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setValue(prompt);
                submit(prompt);
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-mist-200 transition-colors duration-150 ease-entrance hover:border-brand-indigo/40 hover:text-white">
              
                {prompt}
              </button>
            )}
          </div>

          {state === 'thinking' &&
          <p className="mt-4 text-sm text-mist-300" role="status">
              Reading your HavaVerse…
            </p>
          }

          {state === 'error' &&
          <p className="mt-4 text-sm text-brand-amber" role="alert">
              {error}
            </p>
          }

          {state === 'answered' && answer &&
          <div className="mt-4 rounded-xl border border-white/5 bg-ink-850 p-4">
              <p className="text-sm leading-relaxed text-mist-100">{answer.text}</p>

              {answer.links.length > 0 &&
            <div className="mt-3 flex flex-wrap gap-2">
                  {answer.links.map((link) =>
              <Link
                key={link.to + link.label}
                to={link.to}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-indigo/25">
                
                      {link.label}
                      <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
              )}
                </div>
            }

              {answer.proposal &&
            <div className="mt-4 rounded-xl border border-brand-indigo/30 bg-brand-indigo/10 p-4">
                  <p className="text-sm font-semibold text-white">{answer.proposal.summary}</p>
                  <dl className="mt-2.5 space-y-1">
                    {answer.proposal.lines.map((line) =>
                <div key={line.label} className="flex justify-between gap-4 text-xs">
                        <dt className="text-mist-400">{line.label}</dt>
                        <dd className="font-medium text-mist-100">{line.value}</dd>
                      </div>
                )}
                  </dl>
                  <p className="mt-3 text-[11px] text-mist-400">
                    Nothing is published until you confirm it in Studio.
                  </p>
                  <Link
                to={answer.proposal.to}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
                
                    {answer.proposal.confirmLabel}
                    <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
            }
            </div>
          }
        </div>
      </div>
    </section>);

}