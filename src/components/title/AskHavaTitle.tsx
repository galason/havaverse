import React from 'react';
import { Link } from 'react-router-dom';
import { EyeOffIcon, SendIcon, SparklesIcon } from 'lucide-react';
import { titleApi, type TitleAnswer } from '../../services/titleApi';

interface AskHavaTitleProps {
  slug: string;
  titleName: string;
  suggestions: string[];
  /** Shared with the rest of the page so one choice governs every surface. */
  mode: 'free' | 'full';
  onMode: (mode: 'free' | 'full') => void;
}

interface Turn {
  id: string;
  role: 'user' | 'ai';
  body: string;
  answer?: TitleAnswer;
}

/**
 * Title intelligence. Grounded in the title record only — when the record
 * doesn't cover a question it says so, and it respects the spoiler mode
 * rather than answering around it.
 */
export function AskHavaTitle({
  slug,
  titleName,
  suggestions,
  mode,
  onMode
}: AskHavaTitleProps) {
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [value, setValue] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function send(question: string) {
    const text = question.trim();
    if (!text || thinking) return;
    setValue('');
    setError(null);
    setTurns((prev) => [...prev, { id: `u${prev.length}`, role: 'user', body: text }]);
    setThinking(true);
    const result = await titleApi.ask(slug, text, mode);
    setThinking(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTurns((prev) => [
    ...prev,
    { id: `a${prev.length}`, role: 'ai', body: result.data.body, answer: result.data }]
    );
  }

  return (
    <section
      aria-labelledby="ask-hava-title"
      className="rounded-2xl border border-white/5 bg-ink-900">
      
      <div className="flex flex-wrap items-center gap-3 border-b border-white/5 p-4">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-indigo/15">
          <SparklesIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="ask-hava-title" className="text-sm font-bold text-white">
            Ask Hava AI about {titleName}
          </h2>
          <p className="text-[11px] text-mist-400">
            Answers come from this title’s record. It won’t invent story.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Spoiler mode"
          className="ml-auto flex gap-1 rounded-full border border-white/10 p-1">
          
          {(['free', 'full'] as const).map((m) =>
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => onMode(m)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
            mode === m ? 'bg-white text-ink-950' : 'text-mist-300 hover:text-white'}`
            }>
            
              {m === 'free' && <EyeOffIcon className="h-3 w-3" aria-hidden="true" />}
              {m === 'free' ? 'Spoiler-free' : 'Full story'}
            </button>
          )}
        </div>
      </div>

      <div className="max-h-80 space-y-2.5 overflow-y-auto p-4">
        {turns.length === 0 &&
        <ul className="flex flex-wrap gap-1.5">
            {suggestions.map((s) =>
          <li key={s}>
                <button
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-mist-200 transition-colors duration-150 ease-entrance hover:border-white/25 hover:text-white">
              
                  {s}
                </button>
              </li>
          )}
          </ul>
        }

        {turns.map((turn) =>
        turn.role === 'user' ?
        <p
          key={turn.id}
          className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-brand-indigo px-3.5 py-2 text-xs font-medium text-white">
          
              {turn.body}
            </p> :

        <div key={turn.id} className="max-w-[92%]">
              <p className="rounded-2xl rounded-bl-sm bg-ink-850 px-3.5 py-3 text-xs leading-relaxed text-mist-100">
                {turn.answer?.spoiler && mode === 'full' &&
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-live">
                    Contains spoilers
                  </span>
            }
                {turn.body}
              </p>
              {turn.answer && turn.answer.citations.length > 0 &&
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {turn.answer.citations.map((c) =>
            c.to ?
            <li key={c.label}>
                        <Link
                to={c.to}
                className="rounded-full border border-brand-indigo/40 px-2.5 py-1 text-[10px] font-semibold text-brand-cyan transition-colors duration-150 ease-entrance hover:border-brand-indigo">
                
                          {c.label}
                        </Link>
                      </li> :
            null
            )}
                </ul>
          }
            </div>

        )}

        {thinking && <p className="text-xs text-mist-400">Reading the title record…</p>}
        {error &&
        <p role="alert" className="text-xs text-live">
            {error}
          </p>
        }
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
        className="flex items-center gap-2 border-t border-white/5 p-3">
        
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Ask anything about ${titleName}…`}
          aria-label={`Ask Hava AI about ${titleName}`}
          className="w-full rounded-full border border-white/10 bg-ink-850 px-4 py-2.5 text-xs text-white placeholder:text-mist-400 focus:border-brand-indigo focus:outline-none" />
        
        <button
          type="submit"
          disabled={!value.trim() || thinking}
          aria-label="Ask"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-indigo text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400">
          
          <SendIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>
    </section>);

}