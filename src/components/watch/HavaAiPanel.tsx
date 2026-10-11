import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, SendIcon, SparklesIcon, XIcon } from 'lucide-react';
import type { AiAnswer, WatchAsset } from '../../types/watch';
import { watchApi } from '../../services/watchApi';
import { formatTime } from '../../hooks/usePlayback';

interface Turn {
  id: string;
  role: 'user' | 'ai';
  body: string;
  answer?: AiAnswer;
}

interface HavaAiPanelProps {
  asset: WatchAsset;
  titleName: string;
  onClose: () => void;
  onSeek: (seconds: number) => void;
}

export function HavaAiPanel({ asset, titleName, onClose, onSeek }: HavaAiPanelProps) {
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [value, setValue] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [turns, thinking]);

  async function send(question: string) {
    const text = question.trim();
    if (!text || thinking) return;
    setValue('');
    setTurns((prev) => [...prev, { id: `u${prev.length}`, role: 'user', body: text }]);
    setThinking(true);
    watchApi.track('ai_question_asked', asset.slug, text.slice(0, 60));
    const result = await watchApi.ask(asset.slug, text);
    setThinking(false);
    setTurns((prev) => [
    ...prev,
    {
      id: `a${prev.length}`,
      role: 'ai',
      body: result.ok ? result.data.body : result.error,
      answer: result.ok ? result.data : undefined
    }]
    );
  }

  return (
    <aside
      aria-label="Hava AI"
      className="flex max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      
      <div className="flex items-start gap-2.5 border-b border-white/5 p-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-indigo/15">
          <SparklesIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white">Hava AI</h2>
          <p className="truncate text-[11px] text-mist-400">Grounded in {titleName}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Hava AI"
          className="ml-auto grid h-7 w-7 place-items-center rounded-full text-mist-400 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
          
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {turns.length === 0 &&
        <p className="text-xs leading-relaxed text-mist-300">
            Ask anything about this story. I answer from its credits, chapters, transcript and the
            content graph — and I will tell you when something is not in there rather than guess.
          </p>
        }

        {turns.map((turn) =>
        turn.role === 'user' ?
        <p
          key={turn.id}
          className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand-indigo px-3 py-2 text-xs font-medium text-white">
          
              {turn.body}
            </p> :

        <div key={turn.id} className="max-w-[92%]">
              <p className="rounded-2xl rounded-bl-sm bg-ink-850 px-3 py-2.5 text-xs leading-relaxed text-mist-100">
                {turn.body}
              </p>
              {turn.answer?.citations?.map((cite) =>
          <Link
            key={cite.label}
            to={cite.to}
            className="mt-2 flex items-center gap-2.5 rounded-xl border border-white/10 bg-ink-850 p-2 transition-colors duration-150 ease-entrance hover:border-white/25">
            
                  {cite.image &&
            <img src={cite.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
            }
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-white">
                      {cite.label}
                    </span>
                    <span className="block truncate text-[10px] text-mist-400">{cite.meta}</span>
                  </span>
                  <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-mist-400" aria-hidden="true" />
                </Link>
          )}
              {turn.answer?.seekTo !== undefined &&
          <button
            type="button"
            onClick={() => onSeek(turn.answer!.seekTo!)}
            className="mt-2 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
                  Jump to {formatTime(turn.answer.seekTo)}
                </button>
          }
            </div>

        )}

        {thinking && <p className="text-xs text-mist-400">Reading the transcript…</p>}
        <div ref={endRef} />
      </div>

      <div className="border-t border-white/5 p-3">
        {turns.length === 0 &&
        <div className="mb-2 flex flex-wrap gap-1.5">
            {asset.suggestedQuestions.map((q) =>
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            className="rounded-full border border-white/10 px-2.5 py-1.5 text-[11px] text-mist-200 transition-colors duration-150 ease-entrance hover:border-white/25 hover:text-white">
            
                {q}
              </button>
          )}
          </div>
        }
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(value);
          }}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-850 px-3 focus-within:border-brand-indigo">
          
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask Hava AI…"
            aria-label="Ask Hava AI"
            className="w-full bg-transparent py-2.5 text-xs text-white placeholder:text-mist-400 focus:outline-none" />
          
          <button
            type="submit"
            disabled={!value.trim() || thinking}
            aria-label="Send"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-indigo text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400">
            
            <SendIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </aside>);

}