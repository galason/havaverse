import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheckIcon, HeartIcon, MapPinIcon, SparklesIcon } from 'lucide-react';
import type { TitleCreator } from '../../types/title';
import { bySlug } from '../../data/catalog';
import { useApp } from '../../contexts/AppContext';

interface CreatorPanelProps {
  creator: TitleCreator;
  onSupport: () => void;
}

export function CreatorPanel({ creator, onSupport }: CreatorPanelProps) {
  const { isFollowing, toggleFollow } = useApp();
  const [tab, setTab] = React.useState(creator.works[0]?.label ?? '');
  const following = isFollowing(creator.handle);
  const handle = creator.handle.replace('@', '');

  const works = creator.works.find((w) => w.label === tab)?.slugs ?? [];

  return (
    <section
      aria-labelledby="creator-heading"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <div className="flex items-start gap-3">
        <img src={creator.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
        <div className="min-w-0">
          <h2
            id="creator-heading"
            className="flex items-center gap-1.5 text-sm font-bold text-white">
            
            {creator.name}
            {creator.verified &&
            <BadgeCheckIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
            }
          </h2>
          <p className="text-[11px] text-mist-400">{creator.kind}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-mist-400">
            <span>{creator.followers} followers</span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-3 w-3" aria-hidden="true" />
              {creator.location}
            </span>
          </p>
        </div>
      </div>

      <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-mist-300">
        <SparklesIcon className="h-3 w-3 text-brand-cyan" aria-hidden="true" />
        {creator.aiProduction} · {creator.languages.join(', ')}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => toggleFollow(creator.handle)}
          aria-pressed={following}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance ${
          following ?
          'border border-white/15 text-mist-200 hover:text-white' :
          'bg-brand-indigo text-white hover:bg-brand-violet'}`
          }>
          
          {following ? 'Following' : 'Follow'}
        </button>
        <button
          type="button"
          onClick={onSupport}
          className="flex items-center justify-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:border-white/30">
          
          <HeartIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Support
        </button>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto border-b border-white/5">
        {creator.works.map((w) =>
        <button
          key={w.label}
          type="button"
          onClick={() => setTab(w.label)}
          aria-pressed={tab === w.label}
          className={`relative whitespace-nowrap pb-2 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
          tab === w.label ? 'text-white' : 'text-mist-400 hover:text-white'}`
          }>
          
            {w.label}
            {tab === w.label &&
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand-indigo" />

          }
          </button>
        )}
      </div>

      <ul className="mt-3 flex gap-2 overflow-x-auto">
        {works.map((slug) => {
          const t = bySlug(slug);
          if (!t) return null;
          return (
            <li key={slug} className="w-16 shrink-0">
              <Link to={`/title/${slug}`} title={t.name}>
                <img
                  src={t.poster}
                  alt={t.name}
                  className="aspect-[2/3] w-full rounded-lg object-cover transition-opacity duration-150 ease-entrance hover:opacity-80" />
                
              </Link>
            </li>);

        })}
      </ul>

      <Link
        to={`/creator/${handle}`}
        className="mt-3 inline-block text-[11px] font-semibold text-brand-indigo">
        
        View creator →
      </Link>
    </section>);

}