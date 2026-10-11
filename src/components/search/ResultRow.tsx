import React from 'react';
import { Link } from 'react-router-dom';
import { NodeIcon } from './NodeIcon';
import { nodeTypeLabel } from '../../services/contentGraph';
import type { SearchHit } from '../../types/search';

const roundTypes = new Set(['creator', 'artist', 'person']);

interface ResultRowProps {
  hit: SearchHit;
  onOpen: () => void;
}

export function ResultRow({ hit, onOpen }: ResultRowProps) {
  const { node, path } = hit;
  const round = roundTypes.has(node.type);

  return (
    <li>
      <Link
        to={node.href}
        onClick={onOpen}
        className="group flex items-center gap-3.5 rounded-xl px-2 py-2.5 transition-colors duration-150 ease-entrance hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none">
        
        <span
          className={[
          'relative flex h-12 shrink-0 items-center justify-center overflow-hidden bg-ink-850 text-mist-300',
          round ? 'w-12 rounded-full' : node.type === 'short' ? 'w-9 rounded-lg' : 'w-12 rounded-lg'].
          join(' ')}>
          
          {node.image ?
          <img src={node.image} alt="" className="h-full w-full object-cover" loading="lazy" /> :

          <NodeIcon type={node.type} className="h-5 w-5" />
          }
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-white group-hover:text-white">{node.label}</span>
            {node.origin === 'fan' &&
            <span className="shrink-0 rounded-full border border-brand-magenta/30 px-1.5 py-px text-[10px] font-medium text-brand-magenta">
                Fan-made · not canon
              </span>
            }
          </span>
          <span className="mt-0.5 block truncate text-xs text-mist-400">{node.subtitle}</span>
          {path &&
          <span className="mt-0.5 block truncate text-xs text-mist-300">
              <span className="text-brand-indigo">↳</span> {path}
            </span>
          }
        </span>

        <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <span className="inline-flex items-center gap-1 text-[11px] text-mist-400">
            <NodeIcon type={node.type} className="h-3 w-3" />
            {nodeTypeLabel[node.type].one}
          </span>
          {node.availability && <span className="text-[11px] font-medium text-brand-amber">{node.availability}</span>}
        </span>
      </Link>
    </li>);

}