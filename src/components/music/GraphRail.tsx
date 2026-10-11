import React from 'react';
import { Link } from 'react-router-dom';
import {
  DiscAlbumIcon,
  GemIcon,
  MicVocalIcon,
  RadioTowerIcon,
  ScrollTextIcon,
  ShieldIcon,
  UsersIcon } from
'lucide-react';
import type { GraphNode } from '../../types/music';

const icons: Record<GraphNode['kind'], React.ComponentType<{className?: string;}>> = {
  Artist: MicVocalIcon,
  Song: DiscAlbumIcon,
  Story: ScrollTextIcon,
  IP: ShieldIcon,
  Community: UsersIcon,
  Live: RadioTowerIcon,
  Collection: GemIcon
};

/**
 * The world behind the music. This is the content graph rendered as a path,
 * because the point is that a recording leads somewhere — not that it has
 * metadata.
 */
export function GraphRail({ nodes }: {nodes: GraphNode[];}) {
  return (
    <section
      aria-labelledby="world-behind-music"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <h2 id="world-behind-music" className="text-sm font-bold tracking-tight text-white">
        The world behind the music
      </h2>
      <p className="mt-0.5 text-[11px] text-mist-400">
        Every node is a real destination. This is the same graph that powers Play, Community and
        Market.
      </p>

      <ol className="no-scrollbar mt-4 flex gap-1 overflow-x-auto pb-1">
        {nodes.map((node, i) => {
          const Icon = icons[node.kind];
          return (
            <li key={`${node.kind}-${node.label}`} className="flex shrink-0 items-center gap-1">
              <Link
                to={node.to}
                className="group flex w-28 flex-col items-center gap-1.5 rounded-xl px-2 py-2 text-center transition-colors duration-150 ease-entrance hover:bg-white/5">
                
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-violet/40 bg-brand-violet/10 text-brand-violet transition-colors duration-150 ease-entrance group-hover:border-brand-violet group-hover:text-white">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-mist-400">
                  {node.kind}
                </span>
                <span className="w-full truncate text-xs font-semibold text-white">
                  {node.label}
                </span>
                <span className="w-full truncate text-[10px] text-mist-400">{node.detail}</span>
              </Link>
              {i < nodes.length - 1 &&
              <span
                className="h-px w-5 shrink-0 bg-gradient-to-r from-brand-violet/60 to-brand-cyan/40"
                aria-hidden="true" />

              }
            </li>);

        })}
      </ol>
    </section>);

}