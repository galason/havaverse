import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, SparklesIcon, XIcon } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { searchApi } from '../../services/searchApi';
import { nodeTypeLabel } from '../../services/contentGraph';
import { nodeIcons } from '../search/NodeIcon';

interface Suggestion {
  id: string;
  label: string;
  meta: string;
  to: string;
  icon: React.ComponentType<{className?: string;}>;
}

export function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [recent, setRecent] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (open) setRecent(searchApi.recent());
  }, [open]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const term = query.trim().toLowerCase();

  const suggestions: Suggestion[] = React.useMemo(() => {
    if (!term) return [];
    // Same graph and ranking as the full Search page, across every entity type.
    return searchApi.suggest(term, 6).map<Suggestion>((node) => ({
      id: node.id,
      label: node.label,
      meta: `${nodeTypeLabel[node.type].one} · ${node.subtitle}`,
      to: node.href,
      icon: nodeIcons[node.type]
    }));
  }, [term]);

  const submit = (value: string) => {
    setOpen(false);
    searchApi.remember(value);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-2xl">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) submit(query.trim());
        }}>
        
        <SearchIcon
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400"
          aria-hidden="true" />
        
        <label htmlFor="global-search" className="sr-only">
          Search HavaVerse
        </label>
        <input
          id="global-search"
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          type="search"
          autoComplete="off"
          placeholder="Search films, series, creators, sports…"
          className="h-10 w-full rounded-full border border-white/10 bg-ink-850 pl-10 pr-16 text-sm text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo/60 focus:outline-none" />
        
        {query ?
        <button
          type="button"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
          
            <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button> :

        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-medium text-mist-400 sm:block">
            ⌘K
          </kbd>
        }
      </form>

      {open &&
      <div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-2xl border border-white/10 bg-ink-850 shadow-2xl">
          {term ?
        suggestions.length > 0 ?
        <ul className="max-h-80 overflow-y-auto py-2">
                {suggestions.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.id}>
                      <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate(s.to);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 ease-entrance hover:bg-white/5">
                  
                        <Icon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-white">{s.label}</span>
                          <span className="block truncate text-[11px] text-mist-400">{s.meta}</span>
                        </span>
                      </button>
                    </li>);

          })}
                <li className="mt-1 border-t border-white/5 pt-1">
                  <button
              type="button"
              onClick={() => submit(query.trim())}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-brand-indigo transition-colors duration-150 ease-entrance hover:bg-white/5">
              
                    <SparklesIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    See all results for “{query.trim()}”
                  </button>
                </li>
              </ul> :

        <div className="px-4 py-6 text-center">
                <p className="text-sm text-white">No names match</p>
                <button
            type="button"
            onClick={() => submit(query.trim())}
            className="mt-2 text-xs font-semibold text-brand-indigo transition-colors duration-150 ease-entrance hover:text-brand-violet">
            
                  Search descriptions and connections instead
                </button>
              </div> :


        <div className="p-3">
              <p className="px-1 pb-2 text-[11px] font-semibold text-mist-400">
                {recent.length > 0 ? 'Recent searches' : 'Try a connection'}
              </p>
              <ul className="space-y-0.5">
                {(recent.length > 0 ? recent : searchApi.examples.slice(0, 4)).map((r) =>
            <li key={r}>
                    <button
                type="button"
                onClick={() => submit(r)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-mist-200 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
                
                      <SearchIcon className="h-3.5 w-3.5 text-mist-400" aria-hidden="true" />
                      {r}
                    </button>
                  </li>
            )}
              </ul>
            </div>
        }
        </div>
      }
    </div>);

}