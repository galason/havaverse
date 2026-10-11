import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheckIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import type { CreatorStore } from '../../types/commerce';

export function CreatorStoreCard({ store }: {store: CreatorStore;}) {
  const { isFollowing, toggleFollow } = useApp();
  const key = `store:${store.id}`;
  const following = isFollowing(key);

  return (
    <article className="flex h-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3.5">
      <Link to={`/market/store/${store.id}`} className="shrink-0">
        <img src={store.avatar} alt="" loading="lazy" className="h-12 w-12 rounded-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5">
          <Link
            to={`/market/store/${store.id}`}
            className="truncate text-sm font-bold text-white transition-colors duration-150 ease-entrance hover:text-brand-magenta">
            
            {store.name}
          </Link>
          {store.verified &&
          <BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-brand-cyan" aria-hidden="true" />
          }
        </p>
        <p className="truncate text-[11px] text-mist-400">{store.disciplines}</p>
        <p className="truncate text-[11px] text-mist-400">{store.supporters}</p>
      </div>
      <button
        type="button"
        onClick={() => toggleFollow(key)}
        aria-pressed={following}
        className={[
        'shrink-0 rounded-full px-3.5 py-2 text-[11px] font-semibold transition-colors duration-150 ease-entrance',
        following ?
        'border border-white/20 text-mist-200 hover:text-white' :
        'bg-brand-indigo text-white hover:bg-brand-violet'].
        join(' ')}>
        
        {following ? 'Following' : 'Follow'}
      </button>
    </article>);

}