import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  GiftIcon,
  HeartIcon,
  KeyIcon,
  MapPinIcon,
  MusicIcon,
  PlayIcon,
  ShirtIcon,
  UserIcon } from
'lucide-react';
import { commerceUniverses } from '../../data/commerce';

/**
 * The entry point is a story, not a catalogue. The rail beneath it is the
 * whole point: one work, eight different economic relationships with it.
 */
const rail = [
{ icon: PlayIcon, label: 'Watch', detail: 'The Last Train', to: '/title/the-last-train' },
{ icon: UserIcon, label: 'Meet', detail: 'Amara', to: '/characters/amara' },
{ icon: GiftIcon, label: 'Collect', detail: 'Limited art', to: '/market/product/pr3' },
{ icon: ShirtIcon, label: 'Wear', detail: 'Official merch', to: '/market/product/pr1' },
{ icon: MapPinIcon, label: 'Attend', detail: 'Lagos premiere', to: '/market/product/pr4' },
{ icon: MusicIcon, label: 'Listen', detail: 'Original score', to: '/market/product/pr2' },
{ icon: HeartIcon, label: 'Support', detail: 'Adaeze Films', to: '/market/product/pr10' },
{ icon: KeyIcon, label: 'Unlock', detail: 'The Fan Pass', to: '/market/universe/railway' }];


export function MarketHero() {
  const featured = commerceUniverses[0];

  return (
    <section aria-label="Featured universe" className="overflow-hidden rounded-2xl border border-white/5">
      <div className="relative min-h-[300px] sm:min-h-[380px]">
        <img
          src={featured.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center" />
        
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--c-ink-950)/0.96)_8%,rgb(var(--c-ink-950)/0.55)_58%,rgb(var(--c-ink-950)/0.25)_100%)]" />

        <div className="relative flex min-h-[300px] max-w-xl flex-col justify-end p-5 sm:min-h-[380px] sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-magenta">
            HavaVerse Original
          </p>
          <h1 className="mt-2 font-display text-4xl uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
            {featured.name}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-mist-200 sm:text-base">
            {featured.tagline} Own a piece of it, attend it, or fund what comes next — the whole
            universe is here, not just a shelf of merchandise.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to={`/market/universe/${featured.id}`}
              className="flex items-center gap-2 rounded-full bg-brand-indigo px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
              
              Explore universe
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to={featured.watchTo}
              className="flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
              <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Watch the film
            </Link>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-4 xl:grid-cols-8">
        {rail.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label} className="bg-ink-900">
              <Link
                to={item.to}
                className="flex h-full flex-col items-center gap-1.5 px-2 py-3.5 text-center transition-colors duration-150 ease-entrance hover:bg-white/5">
                
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-brand-indigo">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold text-white">{item.label}</span>
                <span className="text-[10px] text-mist-400">{item.detail}</span>
              </Link>
            </li>);

        })}
      </ul>
    </section>);

}