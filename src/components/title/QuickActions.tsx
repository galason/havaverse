import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, PlayCircleIcon, SparklesIcon, UsersIcon } from 'lucide-react';
import type { ContentTitle } from '../../types/content';
import type { TitleCta } from '../../types/title';

interface QuickActionsProps {
  title: ContentTitle;
  cta: TitleCta;
  onAsk: () => void;
  onWatchParty: () => void;
  onSupport: () => void;
}

/**
 * Four ways into the title, each doing something different: understand it,
 * resume it, watch it with people, or back the person who made it.
 */
export function QuickActions({
  title,
  cta,
  onAsk,
  onWatchParty,
  onSupport
}: QuickActionsProps) {
  const resuming = cta.mode === 'resume' || cta.mode === 'continue';

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <li>
        <button
          type="button"
          onClick={onAsk}
          className="flex h-full w-full flex-col rounded-2xl border border-white/5 bg-ink-900 p-4 text-left transition-colors duration-150 ease-entrance hover:border-brand-indigo/40">
          
          <span className="flex items-center gap-2 text-xs font-bold text-white">
            <SparklesIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
            Ask Hava AI
          </span>
          <span className="mt-1.5 text-[11px] leading-relaxed text-mist-400">
            Answers about this title, its characters and its story — grounded in the record.
          </span>
          <span className="mt-3 rounded-full bg-brand-indigo px-3.5 py-1.5 text-center text-[11px] font-semibold text-white">
            Chat with Hava AI
          </span>
        </button>
      </li>

      <li>
        {resuming && cta.to ?
        <Link
          to={cta.to}
          className="flex h-full flex-col rounded-2xl border border-white/5 bg-ink-900 p-4 transition-colors duration-150 ease-entrance hover:border-brand-indigo/40">
          
            <span className="flex items-center gap-2 text-xs font-bold text-white">
              <PlayCircleIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
              Continue watching
            </span>
            <span className="mt-2.5 flex items-center gap-2.5">
              <img
              src={title.poster}
              alt=""
              className="h-11 w-16 rounded-lg object-cover" />
            
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-white">
                  {cta.label.replace('Resume — ', '')}
                </span>
                <span className="block text-[10px] text-mist-400">{cta.note}</span>
              </span>
            </span>
            <span className="mt-auto pt-3">
              <span className="block h-1 rounded-full bg-ink-700">
                <span
                className="block h-full rounded-full bg-brand-indigo"
                style={{
                  width: `${Number((cta.note ?? '').match(/(\d+)%/)?.[1] ?? 10)}%`
                }} />
              
              </span>
            </span>
          </Link> :

        <div className="flex h-full flex-col rounded-2xl border border-dashed border-white/10 p-4">
            <span className="flex items-center gap-2 text-xs font-bold text-white">
              <PlayCircleIcon className="h-4 w-4 text-mist-400" aria-hidden="true" />
              Continue watching
            </span>
            <span className="mt-1.5 text-[11px] leading-relaxed text-mist-400">
              Nothing to resume yet — your position is saved automatically once you start.
            </span>
          </div>
        }
      </li>

      <li>
        <button
          type="button"
          onClick={onWatchParty}
          className="flex h-full w-full flex-col rounded-2xl border border-white/5 bg-ink-900 p-4 text-left transition-colors duration-150 ease-entrance hover:border-brand-indigo/40">
          
          <span className="flex items-center gap-2 text-xs font-bold text-white">
            <UsersIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
            Watch party
          </span>
          <span className="mt-1.5 text-[11px] leading-relaxed text-mist-400">
            Watch together with friends or the community, in sync.
          </span>
          <span className="mt-3 rounded-full border border-white/15 px-3.5 py-1.5 text-center text-[11px] font-semibold text-white">
            Start a watch party
          </span>
        </button>
      </li>

      <li>
        <button
          type="button"
          onClick={onSupport}
          className="flex h-full w-full flex-col rounded-2xl border border-white/5 bg-ink-900 p-4 text-left transition-colors duration-150 ease-entrance hover:border-brand-indigo/40">
          
          <span className="flex items-center gap-2 text-xs font-bold text-white">
            <HeartIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
            Support creator
          </span>
          <span className="mt-1.5 text-[11px] leading-relaxed text-mist-400">
            Send {title.creator} a contribution through HavaPay.
          </span>
          <span className="mt-3 rounded-full border border-white/15 px-3.5 py-1.5 text-center text-[11px] font-semibold text-white">
            Support now
          </span>
        </button>
      </li>
    </ul>);

}