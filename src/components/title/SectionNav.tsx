import React from 'react';
import type { TitleSectionId } from '../../types/title';

interface SectionNavProps {
  sections: TitleSectionId[];
  active: TitleSectionId;
  onSelect: (id: TitleSectionId) => void;
}

const labels: Record<TitleSectionId, string> = {
  overview: 'Overview',
  episodes: 'Episodes',
  characters: 'Characters',
  universe: 'Universe',
  extras: 'Extras',
  community: 'Community',
  reviews: 'Reviews',
  soundtrack: 'Soundtrack',
  market: 'Market',
  live: 'Live',
  stats: 'Stats',
  highlights: 'Highlights'
};

/**
 * Content-type aware: the section list is whatever the title record says it
 * has. A film never shows an Episodes tab, a match never shows Soundtrack.
 */
export function SectionNav({ sections, active, onSelect }: SectionNavProps) {
  return (
    <nav
      aria-label="Title sections"
      className="sticky top-0 z-30 -mx-4 border-b border-white/5 bg-ink-950/90 px-4 backdrop-blur sm:-mx-6 sm:px-6">
      
      <ul className="flex gap-1 overflow-x-auto">
        {sections.map((id) => {
          const current = id === active;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={current ? 'true' : undefined}
                className={`relative whitespace-nowrap px-3.5 py-3.5 text-sm font-semibold transition-colors duration-150 ease-entrance ${
                current ? 'text-white' : 'text-mist-300 hover:text-white'}`
                }>
                
                {labels[id]}
                {current &&
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-indigo" />

                }
              </button>
            </li>);

        })}
      </ul>
    </nav>);

}