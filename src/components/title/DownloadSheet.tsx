import React from 'react';
import { CheckIcon, Trash2Icon } from 'lucide-react';
import type { DownloadRecord } from '../../types/title';
import { Sheet } from '../watch/Sheet';
import { titleApi } from '../../services/titleApi';

interface DownloadSheetProps {
  slug: string;
  record: DownloadRecord | null;
  onChange: (record: DownloadRecord | null) => void;
  onClose: () => void;
  onToast: (message: string) => void;
}

const qualities = [
{ id: 'saver', label: 'Data saver', note: '~0.4 GB' },
{ id: 'standard', label: 'Standard', note: '~0.9 GB' },
{ id: 'hd', label: 'HD', note: '~2.1 GB' },
{ id: '4k', label: '4K', note: '~7.4 GB' }];


export function DownloadSheet({
  slug,
  record,
  onChange,
  onClose,
  onToast
}: DownloadSheetProps) {
  const [error, setError] = React.useState<string | null>(null);
  const active = record?.state === 'preparing' || record?.state === 'downloading';

  async function start(quality: string) {
    setError(null);
    const result = await titleApi.startDownload(slug, quality, onChange);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onToast('Available offline');
  }

  return (
    <Sheet
      title="Download"
      description="Downloads are stored on this device and expire with the licence window."
      onClose={onClose}>
      
      {record?.state === 'downloaded' ?
      <div className="space-y-3">
          <p className="flex items-center gap-2 rounded-xl border border-brand-cyan/30 bg-brand-cyan/5 p-3 text-xs font-semibold text-brand-cyan">
            <CheckIcon className="h-4 w-4" aria-hidden="true" />
            Available offline in {record.quality.toUpperCase()}
          </p>
          <button
          type="button"
          onClick={async () => {
            await titleApi.removeDownload(slug);
            onChange(null);
            onToast('Download removed');
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-live">
          
            <Trash2Icon className="h-3.5 w-3.5" aria-hidden="true" />
            Remove download
          </button>
        </div> :
      active ?
      <div>
          <p className="text-xs font-semibold text-white">
            {record?.state === 'preparing' ?
          'Preparing your download…' :
          `Downloading ${record?.progress}%`}
          </p>
          <span className="mt-2 block h-1.5 rounded-full bg-ink-700">
            <span
            className="block h-full rounded-full bg-brand-indigo transition-[width] duration-300 ease-entrance"
            style={{ width: `${record?.progress ?? 0}%` }} />
          
          </span>
          <p className="mt-2 text-[11px] text-mist-400">
            You can keep browsing — this continues in the background.
          </p>
        </div> :

      <ul className="space-y-1.5">
          {qualities.map((q) =>
        <li key={q.id}>
              <button
            type="button"
            onClick={() => start(q.id)}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-ink-850 px-3.5 py-3 text-left transition-colors duration-150 ease-entrance hover:border-white/25">
            
                <span className="text-xs font-semibold text-white">{q.label}</span>
                <span className="text-[11px] text-mist-400">{q.note}</span>
              </button>
            </li>
        )}
        </ul>
      }

      {error &&
      <p role="alert" className="mt-3 text-xs text-live">
          {error}
        </p>
      }
    </Sheet>);

}