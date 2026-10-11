import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkIcon,
  EyeIcon,
  MessageSquareIcon,
  SparklesIcon,
  UploadCloudIcon,
  UserPlusIcon,
  WalletIcon } from
'lucide-react';
import type { ActivityEvent, ActivityKind } from '../../types/dashboard';
import { relativeTime } from './primitives';

const kindIcon: Record<ActivityKind, React.ComponentType<{className?: string;}>> = {
  ai: SparklesIcon,
  community: MessageSquareIcon,
  library: BookmarkIcon,
  publish: UploadCloudIcon,
  follow: UserPlusIcon,
  economy: WalletIcon,
  audience: EyeIcon
};

/**
 * A chronological read of the viewer's own HavaVerse. Timestamps are relative
 * and recomputed on a slow tick, so the timeline visibly ages while the page
 * is open instead of freezing at the moment it loaded.
 */
export function ActivityTimeline({ events }: {events: ActivityEvent[];}) {
  const [, force] = React.useReducer((n: number) => n + 1, 0);

  React.useEffect(() => {
    const id = window.setInterval(force, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <ol className="relative space-y-1">
      {events.map((event, index) => {
        const Icon = kindIcon[event.kind];
        const last = index === events.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ${
                event.unread ?
                'bg-brand-indigo/20 text-brand-indigo ring-brand-indigo/40' :
                'bg-white/5 text-mist-400 ring-white/10'}`
                }>
                
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              {!last && <span className="w-px flex-1 bg-white/10" aria-hidden="true" />}
            </div>
            <Link
              to={event.to}
              className="group -mx-2 mb-1 min-w-0 flex-1 rounded-lg px-2 pb-3 pt-0.5 transition-colors duration-150 ease-entrance hover:bg-white/5">
              
              <p className="text-sm leading-snug text-mist-100 group-hover:text-white">
                {event.text}
              </p>
              <p className="mt-0.5 text-[11px] text-mist-400">{relativeTime(event.at)}</p>
            </Link>
          </li>);

      })}
    </ol>);

}