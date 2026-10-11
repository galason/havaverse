import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from 'lucide-react';
import type { CreatorActivity } from '../../types/home';
import { useApp } from '../../contexts/AppContext';

export function CreatorActivityRail({ items }: {items: CreatorActivity[];}) {
  const { isFollowing, toggleFollow, showToast } = useApp();

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const following = isFollowing(item.handle);
        return (
          <li
            key={item.id}
            className="group overflow-hidden rounded-xl border border-white/5 bg-ink-900">
            
            <Link to={item.to} className="block">
              <span className="relative block aspect-video">
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.04]" />
                
                <span className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
                <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-cyan">
                  {item.label}
                </span>
              </span>
            </Link>

            <div className="p-3">
              <div className="flex items-center gap-2">
                <img
                  src={item.avatar}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-full object-cover" />
                
                <Link
                  to={`/creator/${item.handle.replace('@', '')}`}
                  className="min-w-0 flex-1 truncate text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
                  
                  {item.creator}
                </Link>
              </div>
              <Link
                to={item.to}
                className="mt-1.5 block truncate text-sm font-bold text-white">
                
                {item.headline}
              </Link>

              <div className="mt-2.5 flex gap-2">
                <Link
                  to={item.to}
                  className="flex-1 rounded-full bg-white px-3 py-1.5 text-center text-[11px] font-bold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
                  
                  {item.action}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    toggleFollow(item.handle);
                    showToast(
                      following ? `Unfollowed ${item.creator}` : `Following ${item.creator}`
                    );
                  }}
                  aria-pressed={following}
                  aria-label={following ? `Unfollow ${item.creator}` : `Follow ${item.creator}`}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors duration-150 ease-entrance ${
                  following ?
                  'border-live/40 bg-live/10 text-live' :
                  'border-white/15 text-mist-200 hover:border-white/35'}`
                  }>
                  
                  <HeartIcon
                    className={`h-3.5 w-3.5 ${following ? 'fill-current' : ''}`}
                    aria-hidden="true" />
                  
                </button>
              </div>
            </div>
          </li>);

      })}
    </ul>);

}