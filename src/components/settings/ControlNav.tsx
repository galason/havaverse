import React from 'react';
import { SearchIcon, SparklesIcon } from 'lucide-react';
import type { SearchHit, SettingsSection } from '../../types/settings';
import { navGroups } from '../../data/settings';
import { settingsApi } from '../../services/settingsApi';

interface ControlNavProps {
  sections: SettingsSection[];
  active: string;
  onSelect: (sectionId: string, settingId?: string) => void;
}

export function ControlNav({ sections, active, onSelect }: ControlNavProps) {
  const [query, setQuery] = React.useState('');
  const [hits, setHits] = React.useState<SearchHit[]>([]);
  const [searching, setSearching] = React.useState(false);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    setSearching(true);
    const id = window.setTimeout(async () => {
      const result = await settingsApi.search(query);
      setSearching(false);
      if (result.ok) setHits(result.data);
    }, 200);
    return () => window.clearTimeout(id);
  }, [query]);

  return (
    <nav aria-label="Hava Control sections" className="flex h-full flex-col">
      <div className="px-1">
        <p className="text-sm font-bold tracking-tight text-white">Hava Control</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">
          Your HavaVerse, configured around you.
        </p>
      </div>

      <div className="relative mt-3">
        <SearchIcon
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-400"
          aria-hidden="true" />
        
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything…"
          aria-label="Search settings"
          className="w-full rounded-full border border-white/10 bg-ink-850 py-2.5 pl-9 pr-9 text-xs text-white placeholder:text-mist-400 focus:border-brand-indigo focus:outline-none" />
        
        <SparklesIcon
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-cyan"
          aria-hidden="true" />
        
      </div>

      {query.trim().length >= 2 &&
      <div className="mt-2 rounded-xl border border-white/10 bg-ink-850 p-1.5">
          {searching && <p className="px-2 py-2 text-[11px] text-mist-400">Looking…</p>}
          {!searching && hits.length === 0 &&
        <p className="px-2 py-2 text-[11px] leading-relaxed text-mist-400">
              Nothing matches that. Try describing what you want to change — “stop sports
              alerts”, “manage payouts”.
            </p>
        }
          {!searching &&
        hits.map((hit) =>
        <button
          key={hit.settingId ?? hit.sectionId}
          type="button"
          onClick={() => {
            onSelect(hit.sectionId, hit.settingId);
            setQuery('');
          }}
          className="w-full rounded-lg px-2 py-2 text-left transition-colors duration-150 ease-entrance hover:bg-white/5">
          
                <span className="block text-xs font-semibold text-white">{hit.label}</span>
                <span className="block text-[10px] text-brand-cyan">{hit.path}</span>
                <span className="mt-0.5 block text-[10px] leading-relaxed text-mist-400">
                  {hit.why}
                </span>
              </button>
        )}
        </div>
      }

      <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
        <button
          type="button"
          onClick={() => onSelect('overview')}
          aria-current={active === 'overview' ? 'page' : undefined}
          className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors duration-150 ease-entrance ${
          active === 'overview' ?
          'bg-brand-indigo/15 font-semibold text-white' :
          'text-mist-300 hover:bg-white/5 hover:text-white'}`
          }>
          
          Overview
        </button>

        {navGroups.map((group) => {
          const items = sections.filter((s) => s.navGroup === group.id && s.id !== 'overview');
          if (items.length === 0) return null;
          return (
            <div key={group.id}>
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">
                {group.label}
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {items.map((section) =>
                <li key={section.id}>
                    <button
                    type="button"
                    onClick={() => onSelect(section.id)}
                    aria-current={active === section.id ? 'page' : undefined}
                    className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors duration-150 ease-entrance ${
                    active === section.id ?
                    'bg-brand-indigo/15 font-semibold text-white' :
                    'text-mist-300 hover:bg-white/5 hover:text-white'}`
                    }>
                    
                      {section.label}
                    </button>
                  </li>
                )}
              </ul>
            </div>);

        })}
      </div>
    </nav>);

}