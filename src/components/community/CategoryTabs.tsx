import React from 'react';
import type { CommunityCategory } from '../../types/community';

export const categories: CommunityCategory[] = [
'For you',
'Trending',
'Live now',
'Films',
'Series',
'Sports',
'Music',
'Creators',
'Anime',
'Podcasts',
'Gaming',
'Stories & Worlds'];


interface CategoryTabsProps {
  active: CommunityCategory;
  onChange: (category: CommunityCategory) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Explore HavaVerse Community"
      className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      
      {categories.map((category) => {
        const isActive = active === category;
        return (
          <button
            key={category}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(category)}
            className={[
            'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-entrance',
            isActive ?
            'border-transparent bg-brand-indigo text-white' :
            'border-white/10 bg-ink-850 text-mist-300 hover:border-white/25 hover:text-white'].
            join(' ')}>
            
            {category}
          </button>);

      })}
    </div>);

}