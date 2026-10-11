import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { MusicWorld } from '../../types/music';

/** A world is a cultural universe with an economy, not a playlist. */
export function WorldCard({ world }: {world: MusicWorld;}) {
  return (
    <article className="group relative flex h-full min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl border border-white/5">
      <img
        src={world.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.04]" />
      
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.97)_20%,rgb(var(--c-ink-950)/0.1)_90%)]" />

      <div className="relative p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">
          {world.city}
        </p>
        <h3 className="mt-1 text-lg font-bold tracking-tight text-white">{world.name}</h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-mist-300">
          {world.blurb}
        </p>
        <p className="mt-2 text-[11px] text-mist-400">
          {world.artistCount} artists · {world.trackCount} tracks · {world.communityCount}{' '}
          communities · {world.liveCount} live
        </p>
        <Link
          to={`/music/world/${world.id}`}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
          Enter world
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>);

}