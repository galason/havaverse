import React from 'react';
import { searchApi } from '../services/searchApi';
import type { SearchResponse } from '../types/search';

type Status = 'idle' | 'loading' | 'ready' | 'error';

/** Debounced search against the service, discarding stale responses. */
export function useSearch(query: string, debounceMs = 220) {
  const [status, setStatus] = React.useState<Status>(query.trim() ? 'loading' : 'idle');
  const [response, setResponse] = React.useState<SearchResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const latest = React.useRef(0);

  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setStatus('idle');
      setResponse(null);
      return;
    }
    setStatus('loading');
    const ticket = ++latest.current;
    const timer = window.setTimeout(async () => {
      const result = await searchApi.search(q);
      if (ticket !== latest.current) return;
      if (result.ok) {
        setResponse(result.data);
        setError(null);
        setStatus('ready');
      } else {
        setError(result.error);
        setStatus('error');
      }
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [query, debounceMs, attempt]);

  return { status, response, error, retry: () => setAttempt((a) => a + 1) };
}