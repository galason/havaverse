import React from 'react';
import { Link } from 'react-router-dom';
import { HeadphonesIcon, MessageSquareIcon, PlayIcon, WandSparklesIcon } from 'lucide-react';
import type { ContinueItem, ContinueKind } from '../../types/dashboard';
import { ProgressBar } from './primitives';

const kindIcon: Record<ContinueKind, React.ComponentType<{className?: string;}>> = {
  creating: WandSparklesIcon,
  watching: PlayIcon,
  listening: HeadphonesIcon,
  participating: MessageSquareIcon
};

/**
 * Deliberately broader than the homepage's Continue Watching. This answers
 * "what was I doing?" across the whole platform — creating, watching,
 * listening and participating — not only what was last played.
 */
export function ContinuePanel({ items }: {items: ContinueItem[];}) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible xl:grid-cols-3">
      {items.map((item) => {
        const Icon = kindIcon[item.kind];
        return (
          <Link
            key={item.id}
            to={item.to}
            className="group flex min-w-[240px] shrink-0 gap-3 rounded-xl border border-white/5 bg-ink-850 p-3 transition-colors duration-150 ease-entrance hover:border-white/20 lg:min-w-0">
            
            {item.image &&
            <img
              src={item.image}
              alt=""
              className="h-14 w-20 shrink-0 rounded-lg object-cover" />

            }
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-mist-400">
                <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
                {item.detail}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex-1">
                  <ProgressBar
                    value={item.progress}
                    tone={item.kind === 'creating' ? 'amber' : 'indigo'} />
                  
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-mist-300">
                  {item.progress}%
                </span>
              </div>
            </div>
          </Link>);

      })}
    </div>);

}