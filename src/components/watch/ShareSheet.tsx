import React from 'react';
import { CheckIcon, LinkIcon } from 'lucide-react';
import { shareTargets } from '../../data/watch';
import { watchApi } from '../../services/watchApi';
import { formatTime } from '../../hooks/usePlayback';
import { Sheet } from './Sheet';

interface ShareSheetProps {
  slug: string;
  titleName: string;
  currentTime: number;
  onClose: () => void;
  onDone: (message: string) => void;
}

export function ShareSheet({ slug, titleName, currentTime, onClose, onDone }: ShareSheetProps) {
  const [atMoment, setAtMoment] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const base = `${window.location.origin}/watch/${slug}`;
  const url = atMoment ? `${base}?t=${Math.floor(currentTime)}` : base;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      watchApi.track('share_created', slug, atMoment ? 'with-timestamp' : 'plain');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onDone('Your browser blocked the clipboard — the link is shown above.');
    }
  }

  return (
    <Sheet title={`Share ${titleName}`} onClose={onClose}>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-850 px-3 py-2.5">
        <LinkIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
        <input
          readOnly
          value={url}
          aria-label="Share link"
          className="w-full bg-transparent text-xs text-mist-200 focus:outline-none" />
        
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
          
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-mist-200">
        <input
          type="checkbox"
          checked={atMoment}
          onChange={(e) => setAtMoment(e.target.checked)}
          className="h-3.5 w-3.5 accent-brand-indigo" />
        
        Start at {formatTime(currentTime)}
      </label>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
        Share to
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {shareTargets.map((target) =>
        <button
          key={target}
          type="button"
          onClick={() => {
            watchApi.track('share_created', slug, target);
            onDone(`Shared to ${target}`);
            onClose();
          }}
          className="rounded-xl border border-white/10 px-3 py-2.5 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:border-white/25 hover:text-white">
          
            {target}
          </button>
        )}
      </div>

      {copied &&
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-brand-cyan">
          <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Link copied to your clipboard
        </p>
      }
    </Sheet>);

}