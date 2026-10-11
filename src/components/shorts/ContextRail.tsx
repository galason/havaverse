import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRightIcon,
  HeartIcon,
  LoaderIcon,
  SendIcon,
  SparklesIcon,
  UsersIcon } from
'lucide-react';
import type { RelatedGroup, Short, ShortAnswer } from '../../types/shorts';
import { askSuggestions } from '../../data/shorts';
import { shortsApi } from '../../services/shortsApi';
import { contentGraph, nodeTypeLabel } from '../../services/contentGraph';
import { NodeIcon } from '../search/NodeIcon';
import type { GraphNodeType } from '../../types/graph';

interface Connection {
  id: string;
  label: string;
  sub: string;
  image?: string;
  to: string;
  type: GraphNodeType;
}

const CONNECTION_LIMIT = 8;

/**
 * Projection of the shared content graph. Falls back to the Short's own
 * record only if the graph has no node for it (e.g. a Short published after
 * the graph was built), so the rail is never empty for a known Short.
 */
function connectionsFor(short: Short): Connection[] {
  const neighbours = contentGraph.neighbours(`short:${short.slug}`);
  if (neighbours.length > 0) {
    return neighbours.slice(0, CONNECTION_LIMIT).map((n) => ({
      id: n.node.id,
      label: n.node.label,
      sub: `${nodeTypeLabel[n.node.type].one} · ${n.phrase}`,
      image: n.node.image,
      to: n.node.href,
      type: n.node.type
    }));
  }
  return short.graph.map((g) => ({
    id: g.id,
    label: g.label,
    sub: g.sub,
    image: g.image,
    to: g.to,
    type: g.kind === 'title' ? 'film' : g.kind === 'music' ? 'track' : g.kind as GraphNodeType
  }));
}

interface ContextRailProps {
  short: Short;
  related: RelatedGroup[];
  relatedLoading: boolean;
  following: boolean;
  onFollow: () => void;
  onSupport: () => void;
  onOpenShort: (slug: string) => void;
}

function Panel({
  title,
  icon,
  action,
  children





}: {title: string;icon?: React.ReactNode;action?: React.ReactNode;children: React.ReactNode;}) {
  return (
    <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      <div className="mb-2.5 flex items-center gap-2">
        {icon}
        <h2 className="text-xs font-bold uppercase tracking-wide text-mist-200">{title}</h2>
        {action && <span className="ml-auto">{action}</span>}
      </div>
      {children}
    </section>);

}

export function ContextRail({
  short,
  related,
  relatedLoading,
  following,
  onFollow,
  onSupport,
  onOpenShort
}: ContextRailProps) {
  const connections = React.useMemo(() => connectionsFor(short), [short]);
  const [question, setQuestion] = React.useState('');
  const [asking, setAsking] = React.useState(false);
  const [answer, setAnswer] = React.useState<ShortAnswer | null>(null);

  async function ask(q: string) {
    if (!q.trim()) return;
    setAsking(true);
    setAnswer(null);
    const result = await shortsApi.ask(short.slug, q);
    setAsking(false);
    shortsApi.track('ai_question_asked', short.slug);
    if (result.ok) setAnswer(result.data);
  }

  // A new Short invalidates the previous answer — it was grounded in that record.
  React.useEffect(() => {
    setAnswer(null);
    setQuestion('');
  }, [short.slug]);

  return (
    <div className="w-full space-y-3 xl:w-[23rem] xl:shrink-0">
      {/* -------------------------------------------------------------- Hava AI */}
      <Panel
        title="Hava AI"
        icon={<SparklesIcon className="h-3.5 w-3.5 text-brand-violet" aria-hidden="true" />}>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-850 px-3 py-2">
          
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask Hava about this Short…"
            aria-label="Ask Hava AI about this Short"
            className="min-w-0 flex-1 bg-transparent text-xs text-white placeholder:text-mist-400 focus:outline-none" />
          
          <button
            type="submit"
            disabled={asking || !question.trim()}
            aria-label="Ask"
            className="shrink-0 rounded-full bg-brand-indigo p-1.5 text-white disabled:opacity-40">
            
            {asking ?
            <LoaderIcon className="h-3 w-3 animate-spin motion-reduce:animate-none" aria-hidden="true" /> :

            <SendIcon className="h-3 w-3" aria-hidden="true" />
            }
          </button>
        </form>

        {!answer && !asking &&
        <ul className="mt-2 flex flex-wrap gap-1.5">
            {askSuggestions.map((s) =>
          <li key={s}>
                <button
              type="button"
              onClick={() => {
                setQuestion(s);
                ask(s);
              }}
              className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:border-brand-violet/50 hover:text-white">
              
                  {s}
                </button>
              </li>
          )}
          </ul>
        }

        {answer &&
        <div className="mt-2.5 rounded-xl border border-white/5 bg-ink-850 p-3">
            <p className="text-xs leading-relaxed text-mist-100">{answer.body}</p>
            {answer.citations.length > 0 &&
          <ul className="mt-2 flex flex-wrap gap-1.5">
                {answer.citations.map((c) =>
            <li key={c.to + c.label}>
                    <Link
                to={c.to}
                className="rounded-full bg-brand-indigo/20 px-2.5 py-1 text-[10px] font-bold text-brand-cyan transition-colors duration-150 ease-entrance hover:bg-brand-indigo/35">
                
                      {c.label}
                    </Link>
                  </li>
            )}
              </ul>
          }
            {!answer.grounded &&
          <p className="mt-2 text-[10px] text-mist-400">
                Answered from this Short’s own record only — nothing invented.
              </p>
          }
          </div>
        }
      </Panel>

      {/* -------------------------------------------------------- connects to */}
      <Panel title="This Short connects to">
        <ul className="space-y-1">
          {connections.map((node) =>
          <li key={node.id}>
              <Link
              to={node.to}
              className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors duration-150 ease-entrance hover:bg-ink-850">
              
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-850 text-mist-300">
                  {node.image ?
                <img src={node.image} alt="" loading="lazy" className="h-full w-full object-cover" /> :

                <NodeIcon type={node.type} className="h-4 w-4" />
                }
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-white">
                    {node.label}
                  </span>
                  <span className="block truncate text-[10px] text-mist-400">{node.sub}</span>
                </span>
                <ChevronRightIcon
                className="h-3.5 w-3.5 shrink-0 text-mist-400"
                aria-hidden="true" />
              
              </Link>
            </li>
          )}
        </ul>
      </Panel>

      {/* ------------------------------------------------------------- creator */}
      <Panel title="Creator">
        <div className="flex items-center gap-2.5">
          <Link to={short.creator.to} className="shrink-0">
            <img
              src={short.creator.avatar}
              alt=""
              className="h-11 w-11 rounded-full object-cover" />
            
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              to={short.creator.to}
              className="block truncate text-sm font-bold text-white hover:underline">
              
              {short.creator.name}
            </Link>
            <p className="truncate text-[10px] text-mist-400">
              {short.creator.followers} · {short.creator.kind}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-mist-300">{short.creator.bio}</p>
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            onClick={onFollow}
            aria-pressed={following}
            className={`flex-1 rounded-full px-3 py-2 text-[11px] font-bold transition-colors duration-150 ease-entrance ${
            following ?
            'border border-brand-indigo/50 text-brand-cyan' :
            'bg-brand-indigo text-white hover:bg-brand-indigo/85'}`
            }>
            
            {following ? 'Following' : 'Follow'}
          </button>
          <button
            type="button"
            onClick={onSupport}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 py-2 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:border-brand-amber/60">
            
            <HeartIcon className="h-3 w-3" aria-hidden="true" />
            Support
          </button>
        </div>
        <p className="mt-2 text-[10px] text-mist-400">
          {short.creator.location} · {short.creator.languages.join(' · ')}
        </p>
      </Panel>

      {/* ----------------------------------------------------------- community */}
      {short.community &&
      <Panel
        title="Community"
        icon={<UsersIcon className="h-3.5 w-3.5 text-brand-magenta" aria-hidden="true" />}>
        
          <div className="flex items-center gap-2.5">
            <img
            src={short.community.image}
            alt=""
            className="h-10 w-10 rounded-lg object-cover" />
          
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{short.community.name}</p>
              <p className="truncate text-[10px] text-mist-400">
                {short.community.fans} · {short.community.discussing}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex gap-2">
            <Link
            to={short.community.discussTo}
            className="flex-1 rounded-full bg-brand-magenta/20 px-3 py-2 text-center text-[11px] font-bold text-brand-magenta transition-colors duration-150 ease-entrance hover:bg-brand-magenta/30">
            
              Join discussion
            </Link>
            <Link
            to="/watch-parties/create"
            className="flex-1 rounded-full border border-white/15 px-3 py-2 text-center text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:border-white/40">
            
              Watch party
            </Link>
          </div>
        </Panel>
      }

      {/* -------------------------------------------------------------- market */}
      {short.products.length > 0 &&
      <Panel
        title="From HavaMarket"
        action={
        <Link
          to="/market"
          className="text-[10px] font-semibold text-mist-300 hover:text-white">
          
              View all
            </Link>
        }>
        
          <ul className="grid grid-cols-3 gap-2">
            {short.products.map((p) =>
          <li key={p.id}>
                <Link to={p.to} className="group block">
                  <img
                src={p.image}
                alt=""
                loading="lazy"
                className="aspect-square w-full rounded-lg object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.03]" />
              
                  <span className="mt-1 block truncate text-[10px] font-semibold text-white">
                    {p.name}
                  </span>
                  <span className="block text-[10px] text-brand-amber">{p.price}</span>
                </Link>
              </li>
          )}
          </ul>
        </Panel>
      }

      {/* -------------------------------------------------------- more like this */}
      <Panel title="More like this">
        {relatedLoading ?
        <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) =>
          <div key={i} className="aspect-[9/16] animate-pulse rounded-lg bg-ink-850" />
          )}
          </div> :

        <div className="space-y-3">
            {related.map((group) =>
          <div key={group.id}>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-mist-400">
                  {group.label}
                </p>
                <ul className="grid grid-cols-3 gap-2">
                  {group.shorts.map((s) =>
              <li key={s.id}>
                      <button
                  type="button"
                  onClick={() => onOpenShort(s.slug)}
                  className="group block w-full text-left">
                  
                        <span className="relative block aspect-[9/16] overflow-hidden rounded-lg">
                          <img
                      src={s.poster}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.05]" />
                    
                        </span>
                        <span className="mt-1 block line-clamp-2 text-[10px] font-semibold text-mist-100">
                          {s.caption}
                        </span>
                        <span className="block text-[10px] text-mist-400">{s.views}</span>
                      </button>
                    </li>
              )}
                </ul>
              </div>
          )}
          </div>
        }
      </Panel>
    </div>);

}