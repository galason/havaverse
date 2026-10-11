import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { CommerceUniverse } from '../../types/commerce';

/**
 * Not a product card. A universe is an entertainment object with an economy
 * attached, so the card sells the world and lets the store be entered.
 */
export function UniverseCard({ universe }: {universe: CommerceUniverse;}) {
  const { counts } = universe;
  return (
    <article className="group relative flex h-full min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl border border-white/5">
      <img
        src={universe.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.04]" />
      
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.97)_18%,rgb(var(--c-ink-950)/0.15)_88%)]" />

      <div className="relative p-4">
        <h3 className="text-lg font-bold tracking-tight text-white">{universe.name}</h3>
        <p className="mt-0.5 text-[11px] text-mist-300">{universe.kindLine}</p>
        <p className="mt-1.5 text-[11px] text-mist-400">
          {counts.products} products · {counts.collectibles} collectibles ·{' '}
          {counts.experiences} experiences
        </p>
        <Link
          to={`/market/universe/${universe.id}`}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition-colors duration-150 ease-entrance hover:bg-brand-indigo">
          
          Explore universe
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>);

}