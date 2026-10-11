import React from 'react';
import { Link } from 'react-router-dom';
import {
  GemIcon,
  HashIcon,
  MicIcon,
  PodcastIcon,
  RadioTowerIcon,
  UserRoundIcon,
  UsersIcon,
  WaypointsIcon } from
'lucide-react';
import type { PodGraphNode } from '../../types/podcast';

const icons: Record<PodGraphNode['kind'], React.ComponentType<{className?: string;}>> = {
  Creator: MicIcon,
  Show: PodcastIcon,
  Episode: WaypointsIcon,
  Topic: HashIcon,
  Guest: UserRoundIcon,
  Community: UsersIcon,
  Live: RadioTowerIcon,
  Collection: GemIcon
};

/**
 * The world behind the conversation. Music's graph is about a recording;
 * this one is about an argument — creator, show, episode, idea, the person
 * who disagreed, and where the discussion carried on.
 */
export function ConversationGraph({ nodes }: {nodes: PodGraphNode[];}) {
  return (
    <section
      aria-labelledby="world-behind-conversation"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <h2 id="world-behind-conversation" className="text-sm font-bold tracking-tight text-white">
        The world behind the conversation
      </h2>
      <p className="mt-0.5 text-[11px] text-mist-400">
        Every show is part of a bigger universe. Each node here is a real destination.
      </p>

      <ol className="no-scrollbar mt-4 flex gap-1 overflow-x-auto pb-1">
        {nodes.map((node, i) => {
          const Icon = icons[node.kind];
          return (
            <li key={`${node.kind}-${node.label}`} className="flex shrink-0 items-center gap-1">
              <Link
                to={node.to}
                className="group flex w-28 flex-col items-center gap-1.5 rounded-xl px-2 py-2 text-center transition-colors duration-150 ease-entrance hover:bg-white/5">
                
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-cyan/35 bg-brand-cyan/10 text-brand-cyan transition-colors duration-150 ease-entrance group-hover:border-brand-cyan group-hover:text-white">
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
                className="h-px w-5 shrink-0 bg-gradient-to-r from-brand-cyan/50 to-brand-violet/40"
                aria-hidden="true" />

              }
            </li>);

        })}
      </ol>
    </section>);

}