import React from 'react';
import { CheckIcon } from 'lucide-react';
import type { WatchAsset } from '../../types/watch';
import { useClickOutside } from '../../hooks/useClickOutside';

interface Settings {
  quality: string;
  audio: string;
  subtitle: string;
  autoplay: boolean;
}

interface SettingsMenuProps {
  asset: WatchAsset;
  settings: Settings;
  rate: number;
  onRate: (rate: number) => void;
  onSettings: (next: Partial<Settings>) => void;
  onClose: () => void;
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function SettingsMenu({
  asset,
  settings,
  rate,
  onRate,
  onSettings,
  onClose
}: SettingsMenuProps) {
  const ref = useClickOutside<HTMLDivElement>(true, onClose);

  const row = (label: string, active: boolean, onClick: () => void, note?: string) =>
  <button
    key={label}
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-mist-200 transition-colors duration-150 ease-entrance hover:bg-white/5">
    
      <CheckIcon
      className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-brand-cyan' : 'text-transparent'}`}
      aria-hidden="true" />
    
      <span className={active ? 'font-semibold text-white' : ''}>{label}</span>
      {note && <span className="ml-auto text-[10px] text-mist-400">{note}</span>}
    </button>;


  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Playback settings"
      className="absolute bottom-11 right-0 z-30 max-h-[60vh] w-64 overflow-y-auto rounded-xl border border-white/10 bg-ink-950/95 p-3 backdrop-blur-md">
      
      <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-400">
        Quality
      </p>
      {row('Auto', settings.quality === 'auto', () => onSettings({ quality: 'auto' }), '1080p')}
      {asset.qualities.
      filter((q) => q.available).
      map((q) => row(q.label, settings.quality === q.id, () => onSettings({ quality: q.id })))}

      <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-400">
        Playback speed
      </p>
      <div className="flex flex-wrap gap-1 px-2">
        {RATES.map((r) =>
        <button
          key={r}
          type="button"
          onClick={() => onRate(r)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
          rate === r ? 'bg-white text-ink-950' : 'bg-white/10 text-mist-200 hover:bg-white/20'}`
          }>
          
            {r}×
          </button>
        )}
      </div>

      <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-400">
        Audio
      </p>
      {asset.audio.map((track) =>
      row(
        track.label,
        settings.audio === track.id,
        () => onSettings({ audio: track.id }),
        track.kind === 'original' ? 'Original' : track.kind === 'described' ? 'Described' : 'Dub'
      )
      )}

      <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-400">
        Subtitles
      </p>
      {row('Off', settings.subtitle === 'off', () => onSettings({ subtitle: 'off' }))}
      {asset.subtitles.map((track) =>
      row(track.label, settings.subtitle === track.id, () => onSettings({ subtitle: track.id }))
      )}

      <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-mist-200 hover:bg-white/5">
        <input
          type="checkbox"
          checked={settings.autoplay}
          onChange={(e) => onSettings({ autoplay: e.target.checked })}
          className="h-3.5 w-3.5 accent-brand-indigo" />
        
        Autoplay next
      </label>
    </div>);

}