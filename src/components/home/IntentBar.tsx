import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClapperboardIcon,
  CompassIcon,
  HeadphonesIcon,
  MicIcon,
  MusicIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon } from
'lucide-react';
import type { IntentChip } from '../../types/home';

const icons: Record<string, React.ComponentType<{className?: string;}>> = {
  watch: ClapperboardIcon,
  sport: TrophyIcon,
  listen: MusicIcon,
  podcast: MicIcon,
  community: UsersIcon,
  surprise: CompassIcon
};

interface IntentBarProps {
  heading: string;
  chips: IntentChip[];
  onAskHava: () => void;
}

/**
 * Intent, not navigation. The viewer states what kind of evening they want and
 * the surface takes them to it — a shortcut past the catalogue.
 */
export function IntentBar({ heading, chips, onAskHava }: IntentBarProps) {
  const navigate = useNavigate();

  return (
    <section
      aria-labelledby="intent-h"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <h2 id="intent-h" className="text-sm font-bold text-white">
        {heading}
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => {
          const Icon = icons[chip.id] ?? HeadphonesIcon;
          return (
            <li key={chip.id}>
              <button
                type="button"
                onClick={() => navigate(chip.to)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-850 px-3.5 py-2 text-xs font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:border-brand-indigo/50 hover:text-white">
                
                <Icon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
                {chip.label}
              </button>
            </li>);

        })}
        <li>
          <button
            type="button"
            onClick={onAskHava}
            className="flex items-center gap-2 rounded-full border border-brand-violet/40 bg-brand-violet/15 px-3.5 py-2 text-xs font-bold text-white transition-colors duration-150 ease-entrance hover:border-brand-violet">
            
            <SparklesIcon className="h-4 w-4" aria-hidden="true" />
            Ask Hava AI
          </button>
        </li>
      </ul>
    </section>);

}