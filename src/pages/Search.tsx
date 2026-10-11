import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, ClockIcon, SearchIcon, SparklesIcon, XIcon } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { searchApi } from '../services/searchApi';
import { contentGraph, nodeTypeLabel } from '../services/contentGraph';
import { ResultRow } from '../components/search/ResultRow';
import { ConnectionsPanel } from '../components/search/ConnectionsPanel';
import { NodeIcon } from '../components/search/NodeIcon';
import { ErrorBlock, SkeletonRows } from '../components/community/StateBlocks';
import type { GraphNodeType } from '../types/graph';
import type { SearchHit, SearchResponse } from '../types/search';

const PER_GROUP = 5;

export function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const typeParam = params.get('type') as GraphNodeType | null;
  const [draft, setDraft] = React.useState(query);
  const [recent, setRecent] = React.useState<string[]>(() => searchApi.recent());
  const { status, response, error, retry } = useSearch(query);

  // Keep the field in step with back/forward and links that set ?q=.
  React.useEffect(() => setDraft(query), [query]);

  const update = (next: {q?: string;type?: GraphNodeType | null;}, replace = true) => {
    const q = next.q ?? query;
    const type = next.type === undefined ? typeParam : next.type;
    const out: Record<string, string> = {};
    if (q) out.q = q;
    if (type) out.type = type;
    setParams(out, { replace });
  };

  const commit = (q: string) => {
    searchApi.remember(q);
    setRecent(searchApi.recent());
  };

  const groups = response?.groups ?? [];
  const activeType = typeParam && groups.some((g) => g.type === typeParam) ? typeParam : null;
  const visible = activeType ? groups.filter((g) => g.type === activeType) : groups;
  const top = !activeType ? response?.top ?? null : null;
  const stats = React.useMemo(() => contentGraph.stats(), []);

  return (
    <div className="min-h-full w-full bg-ink-950 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const q = draft.trim();
          if (!q) return;
          commit(q);
          update({ q, type: null }, false);
        }}
        className="relative">
        
        <SearchIcon
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mist-400"
          aria-hidden="true" />
        
        <label htmlFor="search-input" className="sr-only">
          Search HavaVerse
        </label>
        <input
          id="search-input"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            update({ q: e.target.value, type: null });
          }}
          autoFocus
          autoComplete="off"
          className="h-14 w-full rounded-2xl border border-white/10 bg-ink-900 pl-12 pr-12 text-lg text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo/60 focus:outline-none"
          placeholder="Films, music, characters, creators — or “music from The Last Train”" />
        
        {draft &&
        <button
          type="button"
          onClick={() => {
            setDraft('');
            update({ q: '', type: null });
          }}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
          
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        }
      </form>

      {!query.trim() ?
      <StartState
        recent={recent}
        onPick={(q) => {
          commit(q);
          update({ q, type: null }, false);
        }}
        onClearRecent={() => {
          searchApi.clearRecent();
          setRecent([]);
        }}
        stats={stats} /> :


      <div className="mt-6">
          {response?.intent && status === 'ready' && <IntentLine response={response} />}

          {status === 'ready' && groups.length > 1 &&
        <div className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Result types">
              <div className="flex gap-1.5">
                <TypeChip label="All" count={response?.total ?? 0} active={!activeType} onClick={() => update({ type: null })} />
                {groups.map((g) =>
            <TypeChip
              key={g.type}
              label={nodeTypeLabel[g.type].many}
              count={g.hits.length}
              active={activeType === g.type}
              onClick={() => update({ type: g.type })} />

            )}
              </div>
            </div>
        }

          {status === 'loading' || status === 'idle' && query.trim() ?
        <div className="max-w-3xl">
              <SkeletonRows rows={5} />
            </div> :
        status === 'error' ?
        <ErrorBlock message={error ?? 'Search failed.'} onRetry={retry} /> :
        response && response.total === 0 ?
        <NoResults query={query} intentMissed={Boolean(response.intent && !response.intent.anchor)} onPick={(q) => update({ q }, false)} /> :
        response ?
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
              <div className="min-w-0 space-y-8">
                {top &&
            <section aria-labelledby="top-result">
                    <h2 id="top-result" className="sr-only">
                      Top result
                    </h2>
                    <TopResult hit={top} onOpen={() => commit(query)} />
                  </section>
            }

                {visible.map((g) => {
              const hits = activeType ? g.hits : g.hits.filter((h) => h.node.id !== top?.node.id);
              if (hits.length === 0) return null;
              const shown = activeType ? hits : hits.slice(0, PER_GROUP);
              return (
                <section key={g.type} aria-labelledby={`group-${g.type}`}>
                      <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-white/5 pb-2">
                        <h2 id={`group-${g.type}`} className="flex items-center gap-2 text-sm font-semibold text-white">
                          <NodeIcon type={g.type} className="h-4 w-4 text-mist-400" />
                          {nodeTypeLabel[g.type].many}
                        </h2>
                        {!activeType && hits.length > PER_GROUP &&
                    <button
                      type="button"
                      onClick={() => update({ type: g.type }, false)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-mist-200 hover:text-white">
                      
                            All {hits.length}
                            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                    }
                      </div>
                      <ul>
                        {shown.map((hit) =>
                    <ResultRow key={hit.node.id} hit={hit} onOpen={() => commit(query)} />
                    )}
                      </ul>
                    </section>);

            })}
              </div>

              {response.top &&
          <aside className="mt-10 border-t border-white/5 pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <ConnectionsPanel
              node={response.relational && response.intent?.anchor ? response.intent.anchor : response.top.node} />
            
                </aside>
          }
            </div> :
        null}
        </div>
      }
    </div>);

}

function TypeChip({ label, count, active, onClick }: {label: string;count: number;active: boolean;onClick: () => void;}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
      'shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-entrance',
      active ?
      'border-transparent bg-white text-ink-950' :
      'border-white/10 text-mist-300 hover:border-white/25 hover:text-white'].
      join(' ')}>
      
      {label} <span className={active ? 'text-ink-950/60' : 'text-mist-400'}>{count}</span>
    </button>);

}

function IntentLine({ response }: {response: SearchResponse;}) {
  const intent = response.intent;
  if (!intent) return null;
  return (
    <p className="mb-5 flex items-start gap-2 text-sm text-mist-200">
      <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-indigo" aria-hidden="true" />
      {intent.anchor ?
      response.relational ?
      <span>
            {intent.understood}{' '}
            <Link to={intent.anchor.href} className="font-semibold text-white underline-offset-2 hover:underline">
              {intent.anchor.label}
            </Link>
            <span className="text-mist-400"> · found by following the content graph, each result shows the link</span>
          </span> :

      <span>
            {intent.understood} <span className="font-semibold text-white">{intent.anchor.label}</span>
            <span className="text-mist-400">
              {' '}
              — nothing is linked to it that way yet, so these are text matches for “{intent.anchorText}”.
            </span>
          </span> :


      <span>
          {intent.understood} “{intent.anchorText}” —{' '}
          <span className="text-mist-400">nothing in HavaVerse goes by that name, so these are text matches instead.</span>
        </span>
      }
    </p>);

}

function TopResult({ hit, onOpen }: {hit: SearchHit;onOpen: () => void;}) {
  const { node } = hit;
  return (
    <Link
      to={node.href}
      onClick={onOpen}
      className="group flex gap-5 rounded-2xl bg-ink-900 p-4 transition-colors duration-150 ease-entrance hover:bg-ink-850 sm:p-5">
      
      <span className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-850 text-mist-300 sm:h-36 sm:w-28">
        {node.image ?
        <img src={node.image} alt="" className="h-full w-full object-cover" /> :

        <NodeIcon type={node.type} className="h-8 w-8" />
        }
      </span>
      <span className="min-w-0 self-center">
        <span className="inline-flex items-center gap-1.5 text-xs text-mist-400">
          <NodeIcon type={node.type} className="h-3.5 w-3.5" />
          {nodeTypeLabel[node.type].one}
          {node.origin === 'fan' && <span className="text-brand-magenta">· Fan-made, not canon</span>}
        </span>
        <span className="mt-1 block text-2xl font-bold tracking-tight text-white sm:text-3xl">{node.label}</span>
        <span className="mt-1 block text-sm text-mist-300">{node.subtitle}</span>
        {hit.path && <span className="mt-2 block text-sm text-mist-200">↳ {hit.path}</span>}
        {node.availability && <span className="mt-2 block text-xs font-semibold text-brand-amber">{node.availability}</span>}
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white">
          Open
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-150 ease-entrance group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </span>
    </Link>);

}

function NoResults({ query, intentMissed, onPick }: {query: string;intentMissed: boolean;onPick: (q: string) => void;}) {
  return (
    <div className="max-w-xl py-10">
      <p className="text-lg font-semibold text-white">Nothing in HavaVerse matches “{query}”</p>
      <p className="mt-2 text-sm leading-relaxed text-mist-300">
        {intentMissed ?
        'I understood the kind of relationship you asked for, but couldn’t find what it should start from. Try the exact name of a film, character, creator or universe.' :
        'Search covers films, series, Shorts, music, podcasts, creators, characters, universes, communities, events, products and matches. Try a shorter phrase, or ask for a relationship:'}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {searchApi.examples.slice(0, 4).map((q) =>
        <li key={q}>
            <button
            type="button"
            onClick={() => onPick(q)}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-mist-200 transition-colors duration-150 ease-entrance hover:border-white/25 hover:text-white">
            
              {q}
            </button>
          </li>
        )}
      </ul>
    </div>);

}

function StartState({
  recent,
  onPick,
  onClearRecent,
  stats





}: {recent: string[];onPick: (q: string) => void;onClearRecent: () => void;stats: {nodes: number;edges: number;};}) {
  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section aria-labelledby="ask-heading">
        <h1 id="ask-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Search follows connections, not just titles
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-300">
          Ask for a relationship and Search walks the HavaVerse content graph — {stats.nodes} things and {stats.edges}{' '}
          connections between them — then shows you the link behind every result.
        </p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {searchApi.examples.map((q) =>
          <li key={q}>
              <button
              type="button"
              onClick={() => onPick(q)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-mist-100 transition-colors duration-150 ease-entrance hover:border-white/25 hover:text-white">
              
                {q}
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
              </button>
            </li>
          )}
        </ul>
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-mist-400">
          Not indexed yet: individual players (no player records exist), series episodes, and anything in a
          project that hasn’t been published.
        </p>
      </section>

      <aside aria-labelledby="recent-heading">
        <div className="flex items-baseline justify-between">
          <h2 id="recent-heading" className="text-sm font-semibold text-white">
            Recent searches
          </h2>
          {recent.length > 0 &&
          <button type="button" onClick={onClearRecent} className="text-xs text-mist-400 hover:text-white">
              Clear
            </button>
          }
        </div>
        {recent.length === 0 ?
        <p className="mt-2 text-xs text-mist-400">Searches you open are kept on this device.</p> :

        <ul className="mt-2 space-y-0.5">
            {recent.map((r) =>
          <li key={r}>
                <button
              type="button"
              onClick={() => onPick(r)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-mist-200 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
              
                  <ClockIcon className="h-3.5 w-3.5 text-mist-400" aria-hidden="true" />
                  <span className="truncate">{r}</span>
                </button>
              </li>
          )}
          </ul>
        }
      </aside>
    </div>);

}