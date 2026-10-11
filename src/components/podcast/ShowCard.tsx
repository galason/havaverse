import React from 'react';
import { Link } from 'react-router-dom';
import { hosts } from '../../data/podcast';
import { usePodcast } from '../../contexts/PodcastContext';
import type { Show } from '../../types/podcast';

export function ShowCard({ show }: {show: Show;}) {
  const { isFollowing, toggleFollowShow } = usePodcast();
  const host = hosts.find((h) => h.id === show.hostId);
  const following = isFollowing(show.id);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      <Link to={`/podcast/show/${show.id}`} className="group block">
        <img
          src={show.artwork}
          alt=""
          className="aspect-[16/10] w-full object-cover transition-transform duration-300 ease-entrance group-hover:scale-[1.03]" />
        
      </Link>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-cyan">
          {show.origin}
        </p>
        <h3 className="mt-1 text-sm font-bold leading-tight text-white">
          <Link
            to={`/podcast/show/${show.id}`}
            className="transition-colors duration-150 ease-entrance hover:text-brand-cyan">
            
            {show.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-[11px] text-mist-400">
          {host?.name} · {show.listeners} listeners
        </p>
        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-mist-300">
          {show.tagline}
        </p>
        <button
          type="button"
          onClick={() => toggleFollowShow(show.id)}
          aria-pressed={following}
          className={`mt-auto pt-3 text-left text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
          following ? 'text-brand-cyan' : 'text-mist-300 hover:text-white'}`
          }>
          
          {following ? 'Following' : 'Follow show'}
        </button>
      </div>
    </article>);

}