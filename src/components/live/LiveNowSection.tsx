import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, PlayIcon, UsersIcon } from 'lucide-react';
import { sourceLabels } from '../../services/liveApi';
import type { LiveEntry } from '../../types/live';

interface LiveNowSectionProps {
  entries: LiveEntry[];
  onOpen: (entry: LiveEntry) => void;
}

const ctaFor: Record<LiveEntry['source'], string> = {
  sports: 'Watch live',
  concert: 'Join the stream',
  podcast: 'Join the room',
  event: 'Join event',
  'watch-party': 'Join the party',
  premiere: 'Watch premiere'
};

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-live px-1.5 py-0.5 text-[10px] font-bold text-white">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white motion-reduce:animate-none" aria-hidden="true" />
      LIVE
    </span>);

}

/** The one thing happening now gets the stage; the rest sit beside it. */
export function LiveNowSection({ entries, onOpen }: LiveNowSectionProps) {
  const [lead, ...rest] = entries;
  if (!lead) return null;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <article className="theme-dark grid min-w-0 grid-cols-1 overflow-hidden rounded-2xl border border-live/30 bg-ink-900 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] xl:grid-cols-1">
        <Link to={lead.to} onClick={() => onOpen(lead)} className="relative block aspect-video bg-ink-950">
          <img src={lead.image} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 flex items-center gap-2">
            <LiveBadge />
            <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-mist-100">
              {sourceLabels[lead.source]}
            </span>
          </span>
        </Link>
        <div className="flex min-w-0 flex-col p-5">
          <p className="text-xs font-semibold text-mist-300">{lead.kindLabel}</p>
          <h3 className="mt-1 text-xl font-bold leading-tight text-white sm:text-2xl">{lead.title}</h3>

          {lead.score ?
          <p className="mt-3 flex items-baseline gap-3 text-white">
              <span className="text-3xl font-bold tabular-nums">
                {lead.score.homeScore}
                <span className="mx-1.5 text-mist-400">–</span>
                {lead.score.awayScore}
              </span>
              <span className="text-sm font-semibold text-live">{lead.score.clock}</span>
            </p> :

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mist-300">{lead.context}</p>
          }

          {lead.audience &&
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-mist-300">
              <UsersIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {lead.audience}
            </p>
          }

          <Link
            to={lead.to}
            onClick={() => onOpen(lead)}
            className="mt-5 inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full bg-live px-5 py-2.5 text-sm font-bold text-white transition-opacity duration-150 ease-entrance hover:opacity-90 md:mt-auto xl:mt-5">
            
            <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
            {ctaFor[lead.source]}
          </Link>
        </div>
      </article>

      {rest.length > 0 &&
      <ul className="grid min-w-0 grid-cols-1 content-start gap-2 sm:grid-cols-2 xl:grid-cols-1">
          {rest.map((entry) =>
        <li key={entry.id}>
              <Link
            to={entry.to}
            onClick={() => onOpen(entry)}
            className="group flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900 p-2.5 transition-colors duration-150 ease-entrance hover:border-white/20">
            
                <span className="relative block aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-ink-850">
                  <img src={entry.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute left-1.5 top-1.5">
                    <LiveBadge />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold text-mist-400">
                    {sourceLabels[entry.source]} · {entry.kindLabel}
                  </span>
                  <span className="block truncate text-sm font-bold text-white">{entry.title}</span>
                  <span className="block truncate text-[11px] text-mist-300">
                    {entry.score ?
                `${entry.score.clock} · ${entry.score.homeScore}–${entry.score.awayScore}` :
                entry.audience ?? entry.when}
                  </span>
                </span>
                <ArrowRightIcon
              className="h-4 w-4 shrink-0 text-mist-400 transition-colors duration-150 ease-entrance group-hover:text-white"
              aria-hidden="true" />
            
              </Link>
            </li>
        )}
        </ul>
      }
    </div>);

}