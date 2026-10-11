import React from 'react';
import { Link } from 'react-router-dom';
import { scenes } from '../../data/music';
import type { Scene } from '../../types/music';

const dotSize: Record<Scene['intensity'], string> = {
  high: 'h-3 w-3',
  medium: 'h-2.5 w-2.5',
  low: 'h-2 w-2'
};

/**
 * Not a geographic map — a listening map. Each node is a scene with its own
 * genres, and selecting one filters the sound cards beside it.
 */
export function SoundMap() {
  const [activeId, setActiveId] = React.useState<string>('lagos');
  const active = scenes.find((s) => s.id === activeId) ?? scenes[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-ink-900 p-4">
        <div className="relative aspect-[16/9] w-full">
          {/* Latitude/longitude guides stand in for a basemap without pretending
               to be one — the data here is scenes, not geography. */}
          <div className="absolute inset-0" aria-hidden="true">
            {[20, 40, 60, 80].map((y) =>
            <span
              key={y}
              style={{ top: `${y}%` }}
              className="absolute inset-x-0 h-px bg-white/5" />

            )}
            {[16, 33, 50, 66, 83].map((x) =>
            <span
              key={x}
              style={{ left: `${x}%` }}
              className="absolute inset-y-0 w-px bg-white/5" />

            )}
          </div>

          <ul className="absolute inset-0">
            {scenes.map((scene) => {
              const selected = scene.id === activeId;
              return (
                <li
                  key={scene.id}
                  style={{ left: `${scene.x}%`, top: `${scene.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2">
                  
                  <button
                    type="button"
                    onClick={() => setActiveId(scene.id)}
                    aria-pressed={selected}
                    className="group flex flex-col items-center gap-1">
                    
                    <span className="relative flex items-center justify-center">
                      {selected &&
                      <span
                        className="absolute h-7 w-7 rounded-full border border-brand-violet/70"
                        aria-hidden="true" />

                      }
                      <span
                        className={`rounded-full transition-colors duration-150 ease-entrance ${dotSize[scene.intensity]} ${
                        selected ? 'bg-brand-magenta' : 'bg-brand-violet group-hover:bg-brand-cyan'}`
                        } />
                      
                    </span>
                    <span
                      className={`whitespace-nowrap text-[10px] font-semibold transition-colors duration-150 ease-entrance ${
                      selected ? 'text-white' : 'text-mist-400 group-hover:text-white'}`
                      }>
                      
                      {scene.city}
                    </span>
                    <span className="whitespace-nowrap text-[9px] tabular-nums text-mist-400">
                      {scene.listeners}
                    </span>
                  </button>
                </li>);

            })}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-violet">
          {active.country}
        </p>
        <h3 className="mt-1 text-xl font-bold tracking-tight text-white">{active.city}</h3>
        <p className="mt-0.5 text-xs text-mist-400">{active.listeners} listening this week</p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {active.genres.map((genre) =>
          <li
            key={genre}
            className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium text-mist-200">
            
              {genre}
            </li>
          )}
        </ul>

        <div className="mt-4 space-y-2">
          <Link
            to={`/music/world/${
            active.id === 'lagos' ?
            'lagos-after-dark' :
            active.id === 'joburg' ?
            'johannesburg-pulse' :
            active.id === 'accra' ?
            'accra-nights' :
            active.id === 'london' ?
            'london-afrofuture' :
            active.id === 'nairobi' ?
            'nairobi-new-wave' :
            'lagos-after-dark'}`
            }
            className="block rounded-lg bg-brand-violet px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
            
            Enter this scene
          </Link>
          <Link
            to={`/search?q=${encodeURIComponent(active.city)}`}
            className="block rounded-lg border border-white/15 px-4 py-2.5 text-center text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
            Everything from {active.city}
          </Link>
        </div>

        <p className="mt-3 text-[10px] leading-relaxed text-mist-400">
          Scenes are ranked by listening, not by market size — which is why Lagos sits above
          London here.
        </p>
      </div>
    </div>);

}