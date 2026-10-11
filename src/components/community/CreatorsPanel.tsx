import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClapperboardIcon, SendHorizonalIcon, SparklesIcon } from 'lucide-react';
import { creatorPresence } from '../../data/communityHub';
import { communityApi } from '../../services/communityApi';
import { useApp } from '../../contexts/AppContext';
import { SectionHeader } from './SectionHeader';

const suggestedQuestions = [
'Why did Amara leave the station?',
'What does the red lantern mean?',
'Is Daniel coming back?'];


/** Each creator card resolves to the real experience behind it. */
const creatorDestinations: Record<string, string> = {
  cp1: '/events/ev2',
  cp2: '/people/kemi',
  cp3: '/community/havaverse-originals?tab=Media'
};

export function CreatorsPanel() {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [question, setQuestion] = React.useState('');

  return (
    <section
      aria-labelledby="creators-in-community"
      className="flex flex-col rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <SectionHeader
        id="creators-in-community"
        title="Creators in the community"
        subtitle="Talking to their audience without leaving HavaVerse"
        icon={<ClapperboardIcon className="h-5 w-5 text-brand-magenta" aria-hidden="true" />}
        actionTo="/creator/adaezefilms" />
      

      <ul className="space-y-2">
        {creatorPresence.map((creator) =>
        <li
          key={creator.id}
          className="flex items-start gap-3 rounded-xl border border-white/5 bg-ink-850 p-3">
          
            <img
            src={creator.avatar}
            alt=""
            loading="lazy"
            className="h-10 w-10 shrink-0 rounded-full object-cover" />
          
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-white">{creator.name}</span>
                {creator.live &&
              <span className="flex shrink-0 items-center gap-1 rounded bg-live px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                    <span className="h-1 w-1 rounded-full bg-white" aria-hidden="true" />
                    Live
                  </span>
              }
              </p>
              <p className="text-[11px] text-mist-400">
                {creator.status}
                {creator.watching ? ` · ${creator.watching}` : ''}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-mist-300">{creator.note}</p>
            </div>
            <Link
            to={creatorDestinations[creator.id] ?? '/events'}
            className={[
            'shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance',
            creator.live ?
            'bg-brand-indigo text-white hover:bg-brand-violet' :
            'border border-white/15 text-mist-200 hover:text-white'].
            join(' ')}>
            
              {creator.action}
            </Link>
          </li>
        )}
      </ul>

      <div className="mt-4 rounded-xl border border-brand-indigo/25 bg-ink-850 p-3">
        <p className="flex items-center gap-2 text-xs font-bold text-white">
          <SparklesIcon className="h-3.5 w-3.5 text-brand-indigo" aria-hidden="true" />
          Ask about The Last Train
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-mist-400">
          Answers come from the film and material the creator has approved. Anything not yet
          revealed stays unrevealed — Hava AI will not invent canon.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!question.trim()) return;
            const result = await communityApi.askQuestion('ev2', question);
            if (!result.ok) {
              showToast(result.error);
              return;
            }
            setQuestion('');
            showToast('Question submitted to the Q&A');
            navigate('/events/ev2');
          }}
          className="relative mt-2.5">
          
          <label htmlFor="creator-question" className="sr-only">
            Ask about The Last Train
          </label>
          <input
            id="creator-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the film…"
            className="h-10 w-full rounded-full border border-white/10 bg-ink-900 pl-3.5 pr-11 text-xs text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none" />
          
          <button
            type="submit"
            aria-label="Send question"
            className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-indigo text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
            <SendHorizonalIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </form>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q) =>
          <li key={q}>
              <button
              type="button"
              onClick={() => setQuestion(q)}
              className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-mist-300 transition-colors duration-150 ease-entrance hover:border-brand-indigo/50 hover:text-white">
              
                {q}
              </button>
            </li>
          )}
        </ul>
      </div>

      <Link
        to="/events"
        className="mt-3 text-center text-[11px] font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        See every creator hosting this week
      </Link>
    </section>);

}