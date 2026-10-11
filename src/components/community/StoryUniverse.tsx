import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  ClapperboardIcon,
  FilmIcon,
  Gamepad2Icon,
  MusicIcon,
  PaletteIcon,
  UserIcon } from
'lucide-react';
import { seedUniverses } from '../../data/communityContent';
import { OriginTag } from './OriginTag';
import type { UniverseNodeRecord } from '../../types/communityEntities';

const icons: Record<UniverseNodeRecord['kind'], React.ComponentType<{className?: string;}>> = {
  Film: FilmIcon,
  Book: BookOpenIcon,
  Character: UserIcon,
  Music: MusicIcon,
  'Behind the scenes': ClapperboardIcon,
  Game: Gamepad2Icon,
  'Fan work': PaletteIcon
};

export function StoryUniverse() {
  const universe = seedUniverses[0];

  return (
    <section
      aria-labelledby="story-universe"
      className="overflow-hidden rounded-2xl border border-brand-magenta/20 bg-ink-900">
      
      <div className="flex flex-wrap items-end gap-3 border-b border-white/5 p-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-magenta">
            Community around a story
          </p>
          <h2 id="story-universe" className="mt-1 text-xl font-bold tracking-tight text-white">
            {universe.name}
          </h2>
          <p className="mt-1 text-sm text-mist-300">
            {universe.members} members · one community, every work connected to it
          </p>
        </div>
        <Link
          to={`/universes/${universe.id}`}
          className="ml-auto rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
          Explore the universe
        </Link>
      </div>

      <ul className="grid gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
        {universe.nodes.map((node) => {
          const Icon = icons[node.kind];
          return (
            <li key={node.id} className="bg-ink-900">
              <Link
                to={node.to}
                className="flex h-full items-start gap-3 p-4 transition-colors duration-150 ease-entrance hover:bg-white/5">
                
                <span
                  className={[
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  node.official ?
                  'bg-brand-indigo/15 text-brand-indigo' :
                  'bg-brand-amber/15 text-brand-amber'].
                  join(' ')}>
                  
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-white">{node.label}</span>
                  <span className="mt-1 block">
                    <OriginTag origin={node.official ? 'official' : 'fan'} />
                  </span>
                  <span className="mt-1 block text-[11px] text-mist-400">{node.meta}</span>
                </span>
              </Link>
            </li>);

        })}
      </ul>

      <p className="border-t border-white/5 p-4 text-[11px] leading-relaxed text-mist-400">
        A film stops being one file and becomes an object with a life around it — the same graph
        edges power recommendations in Play, rights in Studio and products in Market.
      </p>
    </section>);

}