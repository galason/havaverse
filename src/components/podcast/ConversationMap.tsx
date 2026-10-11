import React from 'react';
import { Link } from 'react-router-dom';
import { cities, shows } from '../../data/podcast';
import type { PodCity } from '../../types/podcast';

const dotSize: Record<PodCity['intensity'], string> = {
  high: 'h-3 w-3',
  medium: 'h-2.5 w-2.5',
  low: 'h-2 w-2'
};

/**
 * Conversations without borders. Selecting a city changes the panel beside
 * it — the shows recorded there, the topics being argued about, and the way
 * into that community.
 */
export function ConversationMap() {
  const [activeId, setActiveId] = React.useState('lagos');
  const active = cities.find((c) => c.id === activeId) ?? cities[0];
  const localShows = shows.filter((s) => s.cityId === active.id);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-ink-900 p-4">
        <div className="relative aspect-[16/9] w-full">
          <div className="absolute inset-0" aria-hidden="true">
            {[20, 40, 60, 80].map((y) =>
            <span key={y} style={{ top: `${y}%` }} className="absolute inset-x-0 h-px bg-white/5" />
            )}
            {[16, 33, 50, 66, 83].map((x) =>
            <span key={x} style={{ left: `${x}%` }} className="absolute inset-y-0 w-px bg-white/5" />
            )}
          </div>

          <ul className="absolute inset-0">
            {cities.map((city) => {
              const selected = city.id === activeId;
              return (
                <li
                  key={city.id}
                  style={{ left: `${city.x}%`, top: `${city.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2">
                  
                  <button
                    type="button"
                    onClick={() => setActiveId(city.id)}
                    aria-pressed={selected}
                    className="group flex flex-col items-center gap-1">
                    
                    <span className="relative flex items-center justify-center">
                      {selected &&
                      <span
                        className="absolute h-7 w-7 rounded-full border border-brand-cyan/70"
                        aria-hidden="true" />

                      }
                      <span
                        className={`rounded-full transition-colors duration-150 ease-entrance ${dotSize[city.intensity]} ${
                        selected ? 'bg-brand-cyan' : 'bg-brand-violet group-hover:bg-brand-cyan'}`
                        } />
                      
                    </span>
                    <span
                      className={`whitespace-nowrap text-[10px] font-semibold transition-colors duration-150 ease-entrance ${
                      selected ? 'text-white' : 'text-mist-400 group-hover:text-white'}`
                      }>
                      
                      {city.city}
                    </span>
                    <span className="whitespace-nowrap text-[9px] tabular-nums text-mist-400">
                      {city.listeners}
                    </span>
                  </button>
                </li>);

            })}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">
          {active.country}
        </p>
        <h3 className="mt-1 text-xl font-bold tracking-tight text-white">{active.city}</h3>
        <p className="mt-0.5 text-xs text-mist-400">{active.listeners} listening this week</p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {active.topics.map((topic) =>
          <li
            key={topic}
            className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium text-mist-200">
            
              {topic}
            </li>
          )}
        </ul>

        {localShows.length > 0 ?
        <ul className="mt-4 space-y-2">
            {localShows.map((show) =>
          <li key={show.id}>
                <Link
              to={`/podcast/show/${show.id}`}
              className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-ink-850 p-2.5 transition-colors duration-150 ease-entrance hover:border-white/20">
              
                  <img src={show.artwork} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-white">
                      {show.title}
                    </span>
                    <span className="block text-[10px] text-mist-400">{show.listeners} listeners</span>
                  </span>
                </Link>
              </li>
          )}
          </ul> :

        <p className="mt-4 rounded-xl border border-white/5 bg-ink-850 p-3 text-[11px] leading-relaxed text-mist-400">
            No shows recorded here yet. {active.city} listeners are following conversations from
            elsewhere.
          </p>
        }

        <Link
          to={`/search?q=${encodeURIComponent(active.city)}`}
          className="mt-3 block rounded-lg border border-white/15 px-4 py-2.5 text-center text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
          
          Everything from {active.city}
        </Link>
      </div>
    </div>);

}