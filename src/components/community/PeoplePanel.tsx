import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlusIcon } from 'lucide-react';
import { people } from '../../data/communityPeople';
import { useApp } from '../../contexts/AppContext';
import { SectionHeader } from './SectionHeader';
import { OriginTag } from './OriginTag';

export function PeoplePanel() {
  const { isFollowing, toggleFollow } = useApp();
  const suggestions = people.filter((p) => p.id !== 'you').slice(0, 5);

  return (
    <section
      aria-labelledby="people-to-follow"
      className="flex flex-col rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <SectionHeader
        id="people-to-follow"
        title="People to follow"
        subtitle="Critics, hosts and analysts tied to what you watch"
        icon={<UserPlusIcon className="h-5 w-5 text-brand-indigo" aria-hidden="true" />}
        actionTo="/people/emeka"
        actionLabel="Browse people" />
      

      <ul className="space-y-2">
        {suggestions.map((person) => {
          const key = `person:${person.id}`;
          const following = isFollowing(key);
          return (
            <li key={person.id} className="flex items-center gap-3">
              <Link to={`/people/${person.id}`} className="shrink-0">
                <img
                  src={person.avatar}
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 rounded-full object-cover" />
                
              </Link>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <Link
                    to={`/people/${person.id}`}
                    className="truncate text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                    
                    {person.name}
                  </Link>
                  {person.isCreator && <OriginTag origin="creator" />}
                </span>
                <span className="block truncate text-[11px] text-mist-400">
                  {person.role} · {person.focus}
                </span>
              </span>
              <button
                type="button"
                onClick={() => toggleFollow(key)}
                aria-pressed={following}
                className={[
                'shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance',
                following ?
                'border border-white/20 text-mist-200 hover:text-white' :
                'bg-brand-indigo text-white hover:bg-brand-violet'].
                join(' ')}>
                
                {following ? 'Following' : 'Follow'}
              </button>
            </li>);

        })}
      </ul>
    </section>);

}