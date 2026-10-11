import React from 'react';
import {
  BookmarkIcon,
  DownloadIcon,
  FlagIcon,
  HeartIcon,
  ListPlusIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  Share2Icon,
  UsersIcon,
  XIcon } from
'lucide-react';
import type { EconomyConfig } from '../../types/watch';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ActionBarProps {
  liked: boolean;
  likes: number;
  saved: boolean;
  economy: EconomyConfig;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onParty: () => void;
  onDiscuss: () => void;
  onSupport: () => void;
  onReport: () => void;
  onNotInterested: () => void;
  onDownload: () => void;
}

export function ActionBar({
  liked,
  likes,
  saved,
  economy,
  onLike,
  onSave,
  onShare,
  onParty,
  onDiscuss,
  onSupport,
  onReport,
  onNotInterested,
  onDownload
}: ActionBarProps) {
  const [moreOpen, setMoreOpen] = React.useState(false);
  const moreRef = useClickOutside<HTMLDivElement>(moreOpen, () => setMoreOpen(false));

  const chip =
  'flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:border-white/25 hover:text-white';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onLike}
        aria-pressed={liked}
        className={
        liked ?
        'flex items-center gap-2 rounded-full bg-brand-indigo px-4 py-2.5 text-sm font-semibold text-white' :
        chip
        }>
        
        <HeartIcon className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} aria-hidden="true" />
        Like
        <span className={liked ? 'text-white/70' : 'text-mist-400'}>
          {(likes + (liked ? 1 : 0)).toLocaleString()}
        </span>
      </button>

      <button
        type="button"
        onClick={onSave}
        aria-pressed={saved}
        className={saved ? `${chip} border-brand-cyan/40 text-brand-cyan` : chip}>
        
        <BookmarkIcon className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} aria-hidden="true" />
        {saved ? 'Saved' : 'Save'}
      </button>

      <button type="button" onClick={onShare} className={chip}>
        <Share2Icon className="h-4 w-4" aria-hidden="true" />
        Share
      </button>

      <button type="button" onClick={onParty} className={chip}>
        <UsersIcon className="h-4 w-4" aria-hidden="true" />
        Watch party
      </button>

      <button type="button" onClick={onDiscuss} className={chip}>
        <MessageSquareIcon className="h-4 w-4" aria-hidden="true" />
        Discuss
      </button>

      {/* Only offered when the creator has this monetisation path enabled. */}
      {economy.enabled.includes('tip') &&
      <button
        type="button"
        onClick={onSupport}
        className="flex items-center gap-2 rounded-full bg-brand-amber px-4 py-2.5 text-sm font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-brand-amber/90">
        
          <HeartIcon className="h-4 w-4" aria-hidden="true" />
          Support creator
        </button>
      }

      <div ref={moreRef} className="relative">
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-label="More actions"
          aria-expanded={moreOpen}
          className={chip}>
          
          <MoreHorizontalIcon className="h-4 w-4" aria-hidden="true" />
          More
        </button>
        {moreOpen &&
        <div
          role="menu"
          className="absolute right-0 top-12 z-30 w-56 rounded-xl border border-white/10 bg-ink-950/95 p-1.5 backdrop-blur-md">
          
            {[
          { label: 'Add to a playlist', icon: ListPlusIcon, onClick: onSave },
          { label: 'Download', icon: DownloadIcon, onClick: onDownload },
          { label: 'Not interested', icon: XIcon, onClick: onNotInterested },
          { label: 'Report', icon: FlagIcon, onClick: onReport }].
          map((item) =>
          <button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={() => {
              item.onClick();
              setMoreOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-mist-200 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
            
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </button>
          )}
          </div>
        }
      </div>
    </div>);

}