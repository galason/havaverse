import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { contentGraph, nodeTypeLabel } from '../../services/contentGraph';
import { NodeIcon } from '../search/NodeIcon';
import type { Neighbour } from '../../types/graph';

interface GraphConnectionsProps {
  nodeId: string;
  titleName: string;
}

const PER_GROUP = 4;

/**
 * "Connected across HavaVerse" — a projection of the shared content graph.
 * The title page no longer keeps its own list of what a title links to; it
 * asks the graph, so the page, Search and Shorts can never disagree.
 */
export function GraphConnections({ nodeId, titleName }: GraphConnectionsProps) {
  const groups = React.useMemo(() => {
    const map = new Map<string, Neighbour[]>();
    for (const n of contentGraph.neighbours(nodeId)) {
      map.set(n.node.type, [...(map.get(n.node.type) ?? []), n]);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [nodeId]);

  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="graph-connections-h" className="scroll-mt-16">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="graph-connections-h" className="text-lg font-bold tracking-tight text-white">
          Connected across HavaVerse
        </h2>
        <Link
          to={`/search?q=${encodeURIComponent(`more from ${titleName}`)}`}
          className="shrink-0 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
          
          Explore in Search
        </Link>
      </div>
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {groups.map(([type, list]) =>
        <div key={type} className="min-w-0">
            <h3 className="border-b border-white/5 pb-1.5 text-xs font-medium text-mist-400">
              {nodeTypeLabel[list[0].node.type].many} · {list.length}
            </h3>
            <ul className="mt-1">
              {list.slice(0, PER_GROUP).map((n) =>
            <li key={n.node.id}>
                  <Link
                to={n.node.href}
                className="flex items-center gap-3 rounded-lg px-1.5 py-2 transition-colors duration-150 ease-entrance hover:bg-white/5">
                
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-850 text-mist-300">
                      {n.node.image ?
                  <img src={n.node.image} alt="" loading="lazy" className="h-full w-full object-cover" /> :

                  <NodeIcon type={n.node.type} className="h-4 w-4" />
                  }
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{n.node.label}</span>
                      <span className="block truncate text-xs text-mist-400">
                        {n.phrase}
                        {n.node.origin === 'fan' && ' · fan-made, not canon'}
                      </span>
                    </span>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
                  </Link>
                </li>
            )}
            </ul>
          </div>
        )}
      </div>
    </section>);

}