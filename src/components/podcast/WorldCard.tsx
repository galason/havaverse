import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { ConversationWorld } from '../../types/podcast';

export function WorldCard({ world }: {world: ConversationWorld;}) {
  return (
    <Link
      to={`/podcast/world/${world.id}`}
      className="group relative flex h-full min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl border border-white/5">
      
      <img
        src={world.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-entrance group-hover:scale-[1.04]" />
      
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_18%,rgb(var(--c-ink-950)/0.15)_85%)]" />

      <div className="relative p-4">
        <h3 className="text-lg font-bold leading-tight tracking-tight text-white">{world.name}</h3>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-cyan">
          {world.strapline}
        </p>
        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-mist-300">{world.blurb}</p>
        <p className="mt-2 text-[10px] tabular-nums text-mist-400">
          {world.showCount} shows · {world.episodeCount.toLocaleString('en-NG')} episodes ·{' '}
          {world.communityCount} communities · {world.liveCount} live
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance group-hover:border-brand-cyan group-hover:text-brand-cyan">
          Enter world
          <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
        </span>
      </div>
    </Link>);

}