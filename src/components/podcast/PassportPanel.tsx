import React from 'react';
import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { conversationPassport } from '../../data/podcast';
import { usePodcast } from '../../contexts/PodcastContext';

export function PassportPanel() {
  const { ideas, supported, seats, memberOf } = usePodcast();

  const stats = [
  { value: conversationPassport.topics, label: 'Topics' },
  { value: conversationPassport.cities, label: 'Cities' },
  { value: conversationPassport.creators, label: 'Creators' },
  { value: conversationPassport.communities + memberOf.length, label: 'Communities' },
  { value: conversationPassport.liveConversations + seats.length, label: 'Live' },
  { value: conversationPassport.savedIdeas + ideas.length, label: 'Saved ideas' }];


  return (
    <section
      aria-labelledby="conversation-passport"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <h2
        id="conversation-passport"
        className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">
        
        <CompassIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        Conversation passport
      </h2>
      <p className="mt-0.5 text-[11px] text-mist-400">
        Where your listening has taken you, and what you kept.
      </p>

      <dl className="mt-3 grid grid-cols-3 gap-2">
        {stats.map((stat) =>
        <div key={stat.label} className="rounded-xl border border-white/5 bg-ink-850 p-2.5">
            <dd className="text-xl font-bold tabular-nums text-white">{stat.value}</dd>
            <dt className="text-[10px] uppercase tracking-wide text-mist-400">{stat.label}</dt>
          </div>
        )}
      </dl>

      <p className="mt-2.5 text-[11px] text-mist-400">
        {conversationPassport.creatorsSupported + supported.length} creators supported.
      </p>

      <Link
        to="/podcast/passport"
        className="mt-3 block rounded-lg bg-brand-violet px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
        
        View your journey
      </Link>
    </section>);

}