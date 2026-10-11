import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheckIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import type { Host } from '../../types/podcast';

export function HostCard({ host }: {host: Host;}) {
  const { isFollowing, toggleFollow } = useApp();
  const key = `host:${host.id}`;
  const following = isFollowing(key);

  return (
    <article className="flex h-full items-start gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3.5">
      <Link to={`/podcast/creator/${host.id}`} className="shrink-0">
        <img src={host.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-1 text-sm font-bold text-white">
          <Link
            to={`/podcast/creator/${host.id}`}
            className="truncate transition-colors duration-150 ease-entrance hover:text-brand-cyan">
            
            {host.name}
          </Link>
          {host.verified &&
          <BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-brand-cyan" aria-hidden="true" />
          }
        </h3>
        <p className="truncate text-[11px] text-mist-400">{host.roles}</p>
        <p className="mt-0.5 text-[11px] tabular-nums text-mist-400">
          {host.listeners} listeners · {host.city}
        </p>
      </div>
      <button
        type="button"
        onClick={() => toggleFollow(key)}
        aria-pressed={following}
        className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
        following ?
        'border border-white/20 text-mist-300 hover:text-white' :
        'bg-brand-violet text-white hover:bg-brand-magenta'}`
        }>
        
        {following ? 'Following' : 'Follow'}
      </button>
    </article>);

}