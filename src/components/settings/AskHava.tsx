import React from 'react';
import { SendIcon, SparklesIcon } from 'lucide-react';
import type { SearchHit } from '../../types/settings';
import { settingsApi } from '../../services/settingsApi';

interface Turn {
  id: string;
  role: 'user' | 'ai';
  body: string;
  hits?: SearchHit[];
}

const prompts = [
'Change my language',
'Stop AI recommendations',
'Manage payouts',
'What data is used to recommend films?'];


/**
 * Explains and navigates. It never changes a setting on your behalf — the
 * answer takes you to the control and you make the change yourself.
 */
export function AskHava({ onGo }: {onGo: (sectionId: string, settingId?: string) => void;}) {
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [value, setValue] = React.useState('');
  const [thinking, setThinking] = React.useState(false);

  async function send(question: string) {
    const text = question.trim();
    if (!text || thinking) return;
    setValue('');
    setTurns((prev) => [...prev, { id: `u${prev.length}`, role: 'user', body: text }]);
    setThinking(true);
    const result = await settingsApi.search(text);
    setThinking(false);

    const hits = result.ok ? result.data : [];
    setTurns((prev) => [
    ...prev,
    {
      id: `a${prev.length}`,
      role: 'ai',
      body:
      hits.length > 0 ?
      `That is controlled here. Open it and I will highlight the control — I will not change it for you.` :
      'I could not map that to a control. Try naming what you want to happen, like “stop sports alerts” or “who can message me”.',
      hits
    }]
    );
  }

  return (
    <section
      aria-labelledby="ask-hava"
      className="overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      
      <div className="flex items-start gap-2.5 border-b border-white/5 p-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-indigo/15">
          <SparklesIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        </span>
        <div>
          <h2 id="ask-hava" className="text-sm font-bold text-white">
            Ask Hava
          </h2>
          <p className="text-[11px] text-mist-400">What would you like to change?</p>
        </div>
      </div>

      <div className="max-h-72 space-y-2.5 overflow-y-auto p-4">
        {turns.length === 0 &&
        <div className="flex flex-wrap gap-1.5">
            {prompts.map((p) =>
          <button
            key={p}
            type="button"
            onClick={() => send(p)}
            className="rounded-full border border-white/10 px-2.5 py-1.5 text-[11px] text-mist-200 transition-colors duration-150 ease-entrance hover:border-white/25 hover:text-white">
            
                {p}
              </button>
          )}
          </div>
        }

        {turns.map((turn) =>
        turn.role === 'user' ?
        <p
          key={turn.id}
          className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand-indigo px-3 py-2 text-xs font-medium text-white">
          
              {turn.body}
            </p> :

        <div key={turn.id}>
              <p className="rounded-2xl rounded-bl-sm bg-ink-850 px-3 py-2.5 text-xs leading-relaxed text-mist-100">
                {turn.body}
              </p>
              {turn.hits?.map((hit) =>
          <button
            key={hit.settingId ?? hit.sectionId}
            type="button"
            onClick={() => onGo(hit.sectionId, hit.settingId)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-850 p-2.5 text-left transition-colors duration-150 ease-entrance hover:border-white/25">
            
                  <span className="block text-xs font-semibold text-white">{hit.label}</span>
                  <span className="block text-[10px] text-brand-cyan">{hit.path}</span>
                </button>
          )}
            </div>

        )}

        {thinking && <p className="text-xs text-mist-400">Finding the control…</p>}
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
          placeholder="Type your request…"
          aria-label="Ask Hava about your settings"
          className="w-full rounded-full border border-white/10 bg-ink-850 px-3 py-2.5 text-xs text-white placeholder:text-mist-400 focus:border-brand-indigo focus:outline-none" />
        
        <button
          type="submit"
          disabled={!value.trim() || thinking}
          aria-label="Send"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-indigo text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400">
          
          <SendIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>
    </section>);

}