import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SendHorizonalIcon, SparklesIcon } from 'lucide-react';
import { havaAiCommunityPrompts } from '../../data/communityHub';

interface Message {
  id: string;
  role: 'ai' | 'user';
  body: string;
  to?: string;
  cta?: string;
}

const answers: {match: string;body: string;to?: string;cta?: string;}[] = [
{
  match: 'theor',
  body: 'Two theories dominate The Last Train right now: that Amara knew about the second railway all along, and that the junction on the map in scene 12 contradicts the story bible. Both stay inside episode 5, so nothing here spoils you.',
  to: '/discussions/d1',
  cta: 'Open the discussion'
},
{
  match: 'watch part',
  body: 'Three tonight: The Last Train episode 7 is live with 1,204 people, Super Eagles vs Ghana starts at 8:00 PM, and the Lagos 2042 rewatch is tomorrow at 7:30 PM.',
  to: '/watch-parties',
  cta: 'See watch parties'
},
{
  match: 'last train',
  body: 'The community is mostly discussing episode 7 — 3.4K likes in the last day. I have hidden the ones past where you stopped watching.',
  to: '/community/the-last-train?tab=Discuss',
  cta: 'Go to the fan club'
},
{
  match: 'small',
  body: 'Independent Filmmakers has 18.7K members and 426 online — active enough to talk in, small enough to be recognised.',
  to: '/community/independent-filmmakers',
  cta: 'Open community'
},
{
  match: 'away',
  body: 'While you were away: Adaeze Films announced a Friday Q&A, a continuity debate started about the railway map, and the Southbound trailer premiere filled 2,840 seats.',
  to: '/events',
  cta: 'Catch up'
}];


export function HavaAiCommunityPanel() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([
  {
    id: 'm0',
    role: 'ai',
    body: 'Ask me anything about what is happening across HavaVerse Community — theories, watch parties, or what you missed.'
  }]
  );

  const ask = (value: string) => {
    const text = value.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    const hit = answers.find((a) => lower.includes(a.match));
    setMessages((prev) => [
    ...prev,
    { id: `u${prev.length}`, role: 'user', body: text },
    hit ?
    { id: `a${prev.length}`, role: 'ai', body: hit.body, to: hit.to, cta: hit.cta } :
    {
      id: `a${prev.length}`,
      role: 'ai',
      body: `Let me search community discussions for “${text}”.`,
      to: `/search?q=${encodeURIComponent(text)}`,
      cta: 'See results'
    }]
    );
    setPrompt('');
  };

  return (
    <section
      aria-labelledby="hava-ai-community"
      className="rounded-2xl border border-brand-indigo/25 bg-ink-900 p-4">
      
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-indigo/20 ring-1 ring-brand-indigo/40">
          <SparklesIcon className="h-4 w-4 text-brand-indigo" aria-hidden="true" />
        </span>
        <span>
          <h2 id="hava-ai-community" className="text-base font-bold text-white">
            Hava AI
          </h2>
          <span className="block text-[11px] text-mist-400">
            Your entertainment community assistant
          </span>
        </span>
      </div>

      <ul className="mt-3 max-h-52 space-y-2 overflow-y-auto">
        {messages.map((m) =>
        <li key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <span
            className={[
            'block max-w-[92%] rounded-xl px-3 py-2.5 text-xs leading-relaxed',
            m.role === 'user' ?
            'rounded-br-sm bg-brand-indigo text-white' :
            'rounded-bl-sm border border-white/5 bg-ink-800 text-mist-200'].
            join(' ')}>
            
              {m.body}
              {m.to && m.cta &&
            <button
              type="button"
              onClick={() => navigate(m.to as string)}
              className="mt-2 block font-semibold text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
              
                  {m.cta} →
                </button>
            }
            </span>
          </li>
        )}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(prompt);
        }}
        className="relative mt-3">
        
        <label htmlFor="community-ai-prompt" className="sr-only">
          Ask Hava AI about the community
        </label>
        <input
          id="community-ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Hava AI…"
          className="h-10 w-full rounded-full border border-white/10 bg-ink-850 pl-4 pr-11 text-xs text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none" />
        
        <button
          type="submit"
          aria-label="Send to Hava AI"
          className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-indigo text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
          <SendHorizonalIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {havaAiCommunityPrompts.map((p) =>
        <li key={p}>
            <button
            type="button"
            onClick={() => ask(p)}
            className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-mist-200 transition-colors duration-150 ease-entrance hover:border-brand-indigo/50 hover:text-white">
            
              {p}
            </button>
          </li>
        )}
      </ul>
    </section>);

}