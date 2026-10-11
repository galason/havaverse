import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { GraphNode, GraphNodeKind } from '../../types/watch';
import { Sheet } from './Sheet';

const groups: {id: GraphNodeKind | 'all';label: string;}[] = [
{ id: 'all', label: 'Everything' },
{ id: 'character', label: 'Characters' },
{ id: 'location', label: 'Locations' },
{ id: 'story', label: 'Story' },
{ id: 'soundtrack', label: 'Soundtrack' },
{ id: 'product', label: 'Market' }];


export function UniverseExplorer({ nodes }: {nodes: GraphNode[];}) {
  const [group, setGroup] = React.useState<GraphNodeKind | 'all'>('all');
  const [open, setOpen] = React.useState<GraphNode | null>(null);

  if (nodes.length === 0) return null;

  const available = groups.filter(
    (g) => g.id === 'all' || nodes.some((n) => n.kind === g.id)
  );
  const shown = group === 'all' ? nodes : nodes.filter((n) => n.kind === group);

  return (
    <section
      aria-labelledby="universe-heading"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4 sm:p-5">
      
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="universe-heading" className="text-base font-bold tracking-tight text-white">
          Explore this world
        </h2>
        <p className="text-xs text-mist-400">Everything connected to this title in the graph</p>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {available.map((g) =>
        <button
          key={g.id}
          type="button"
          onClick={() => setGroup(g.id)}
          aria-pressed={group === g.id}
          className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
          group === g.id ?
          'bg-white text-ink-950' :
          'border border-white/10 text-mist-300 hover:text-white'}`
          }>
          
            {g.label}
            {g.id !== 'all' &&
          <span className="ml-1.5 text-mist-400">
                {nodes.filter((n) => n.kind === g.id).length}
              </span>
          }
          </button>
        )}
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((node) => {
          const content =
          <>
              <img
              src={node.image}
              alt=""
              className="aspect-[4/5] w-full rounded-xl object-cover" />
            
              <p className="mt-2 truncate text-xs font-semibold text-white">{node.name}</p>
              <p className="truncate text-[10px] text-mist-400">{node.meta}</p>
            </>;

          // Characters open in place; everything else is a destination.
          return (
            <li key={node.id}>
              {node.kind === 'character' ?
              <button
                type="button"
                onClick={() => setOpen(node)}
                className="w-full text-left transition-transform duration-150 ease-entrance hover:-translate-y-0.5">
                
                  {content}
                </button> :

              <Link
                to={node.to ?? '#'}
                className="block transition-transform duration-150 ease-entrance hover:-translate-y-0.5">
                
                  {content}
                </Link>
              }
            </li>);

        })}
      </ul>

      {open &&
      <Sheet title={open.name} description={open.meta} onClose={() => setOpen(null)}>
          <img src={open.image} alt="" className="aspect-[3/2] w-full rounded-xl object-cover" />
          {open.bio &&
        <p className="mt-3 text-sm leading-relaxed text-mist-200">{open.bio}</p>
        }
          {open.appearsIn && open.appearsIn.length > 0 &&
        <>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
                Appears in
              </p>
              <ul className="mt-1.5 space-y-1">
                {open.appearsIn.map((item) =>
            <li key={item.label}>
                    <Link
                to={item.to}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-mist-200 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
                
                      {item.label}
                      <ArrowRightIcon className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </li>
            )}
              </ul>
            </>
        }
          {open.to ?
        <Link
          to={open.to}
          className="mt-4 block rounded-full bg-brand-indigo px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
              Explore {open.name}
            </Link> :

        <p className="mt-4 rounded-xl border border-white/10 p-3 text-[11px] leading-relaxed text-mist-400">
              This character does not have a full page in the graph yet — what you see here is
              everything the title carries about them.
            </p>
        }
        </Sheet>
      }
    </section>);

}