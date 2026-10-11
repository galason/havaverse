import React from 'react';
import { Link } from 'react-router-dom';
import { NodeIcon } from './NodeIcon';
import { contentGraph, nodeTypeLabel } from '../../services/contentGraph';
import type { GraphNode, Neighbour } from '../../types/graph';

const PER_GROUP = 4;

/**
 * What a node connects to, read straight from the canonical graph. This is
 * the same answer any surface gets for the same node — Search, a title page
 * or a Short can never disagree about what The Last Train is connected to.
 */
export function ConnectionsPanel({ node }: {node: GraphNode;}) {
  const groups = React.useMemo(() => {
    const map = new Map<string, Neighbour[]>();
    for (const n of contentGraph.neighbours(node.id)) {
      map.set(n.node.type, [...(map.get(n.node.type) ?? []), n]);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [node.id]);

  return (
    <section aria-labelledby="connections-heading">
      <h2 id="connections-heading" className="text-sm font-semibold text-white">
        Connected to {node.label}
      </h2>
      <p className="mt-1 text-xs text-mist-400">Relationships held in the HavaVerse content graph.</p>

      {groups.length === 0 ?
      <p className="mt-4 text-xs leading-relaxed text-mist-300">
          Nothing is linked to this yet. Connections appear as creators attach characters, music, communities and
          products to it.
        </p> :

      <div className="mt-4 space-y-5">
          {groups.map(([type, list]) =>
        <div key={type}>
              <h3 className="text-[11px] font-medium text-mist-400">
                {nodeTypeLabel[list[0].node.type].many} · {list.length}
              </h3>
              <ul className="mt-1.5 space-y-0.5">
                {list.slice(0, PER_GROUP).map((n) =>
            <li key={n.node.id}>
                    <Link
                to={n.node.href}
                className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors duration-150 ease-entrance hover:bg-white/5">
                
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ink-850 text-mist-300">
                        {n.node.image ?
                  <img src={n.node.image} alt="" className="h-full w-full object-cover" loading="lazy" /> :

                  <NodeIcon type={n.node.type} className="h-3.5 w-3.5" />
                  }
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-white">{n.node.label}</span>
                        <span className="block truncate text-[11px] text-mist-400">{n.phrase}</span>
                      </span>
                    </Link>
                  </li>
            )}
              </ul>
              {list.length > PER_GROUP &&
          <p className="mt-1 px-1.5 text-[11px] text-mist-400">+{list.length - PER_GROUP} more</p>
          }
            </div>
        )}
        </div>
      }
    </section>);

}