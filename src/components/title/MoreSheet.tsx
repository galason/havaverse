import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DownloadIcon,
  FlagIcon,
  InfoIcon,
  ListPlusIcon,
  PlusIcon,
  Share2Icon,
  ThumbsDownIcon,
  TriangleAlertIcon } from
'lucide-react';
import type { ContentTitle } from '../../types/content';
import type { TitleExperience } from '../../types/title';
import { Sheet } from '../watch/Sheet';
import { useApp } from '../../contexts/AppContext';

interface MoreSheetProps {
  title: ContentTitle;
  experience: TitleExperience;
  onClose: () => void;
  onShare: () => void;
  onDownload: () => void;
  onReport: () => void;
  onToast: (message: string) => void;
}

/**
 * Only capabilities this viewer actually has. Download disappears entirely
 * when the licence does not permit it, rather than failing on tap.
 */
export function MoreSheet({
  title,
  experience,
  onClose,
  onShare,
  onDownload,
  onReport,
  onToast
}: MoreSheetProps) {
  const navigate = useNavigate();
  const { isSaved, toggleWatchlist } = useApp();

  const items: {
    id: string;
    label: string;
    icon: typeof InfoIcon;
    run: () => void;
    tone?: 'danger';
  }[] = [
  {
    id: 'playlist',
    label: 'Add to a playlist',
    icon: ListPlusIcon,
    run: () => onToast('Added to “Nigerian sci-fi”')
  },
  {
    id: 'watchlist',
    label: isSaved(title.id) ? 'Remove from watchlist' : 'Add to watchlist',
    icon: PlusIcon,
    run: () => toggleWatchlist(title.id)
  },
  ...(experience.downloadable ?
  [{ id: 'download', label: 'Download', icon: DownloadIcon, run: onDownload }] :
  []),
  { id: 'share', label: 'Share', icon: Share2Icon, run: onShare },
  {
    id: 'not-interested',
    label: 'Not interested',
    icon: ThumbsDownIcon,
    run: () => onToast('We’ll show you less like this')
  },
  {
    id: 'info',
    label: 'Content information',
    icon: InfoIcon,
    run: () =>
    onToast(
      `${title.maturity} · ${experience.advisories.join(', ')} · ${experience.aiProduction}`
    )
  },
  {
    id: 'rights',
    label: 'Rights & availability',
    icon: InfoIcon,
    run: () => {
      onClose();
      navigate(`/title/${title.slug}#rights`);
      document.getElementById('rights')?.scrollIntoView({ behavior: 'smooth' });
    }
  },
  {
    id: 'playback',
    label: 'Report a playback issue',
    icon: TriangleAlertIcon,
    run: () => onToast('Thanks — a diagnostic has been sent')
  },
  { id: 'report', label: 'Report content', icon: FlagIcon, run: onReport, tone: 'danger' }];


  return (
    <Sheet title="More" onClose={onClose}>
      <ul className="space-y-0.5">
        {items.map((item) =>
        <li key={item.id}>
            <button
            type="button"
            onClick={() => {
              item.run();
              if (item.id !== 'download' && item.id !== 'share' && item.id !== 'report') {
                onClose();
              }
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors duration-150 ease-entrance hover:bg-ink-850 ${
            item.tone === 'danger' ? 'text-live' : 'text-mist-100'}`
            }>
            
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </button>
          </li>
        )}
      </ul>
    </Sheet>);

}