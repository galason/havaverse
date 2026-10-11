import React from 'react';
import { EyeIcon, PlayIcon } from 'lucide-react';
import type { Extra } from '../../types/title';

interface ExtrasRailProps {
  extras: Extra[];
  spoilerMode: 'free' | 'full';
  onPlay: (extra: Extra) => void;
}

export function ExtrasRail({ extras, spoilerMode, onPlay }: ExtrasRailProps) {
  const [revealed, setRevealed] = React.useState<string[]>([]);

  return (
    <ul className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
      {extras.map((extra) => {
        const hidden = extra.spoiler && spoilerMode === 'free' && !revealed.includes(extra.id);
        return (
          <li key={extra.id} className="w-56 shrink-0 sm:w-64">
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-ink-850">
              <div className="relative aspect-video">
                <img
                  src={extra.still}
                  alt=""
                  className={`h-full w-full object-cover ${hidden ? 'blur-lg' : ''}`} />
                
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-ink-950/80 px-2 py-0.5 text-[10px] font-semibold text-mist-100 backdrop-blur">
                  {extra.kind}
                </span>
                <span className="absolute bottom-2.5 right-2.5 rounded bg-ink-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {extra.runtime}
                </span>

                {hidden ?
                <button
                  type="button"
                  onClick={() => setRevealed((r) => [...r, extra.id])}
                  className="absolute inset-0 grid place-items-center text-[11px] font-semibold text-white">
                  
                    <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-ink-950/60 px-3 py-1.5 backdrop-blur">
                      <EyeIcon className="h-3 w-3" aria-hidden="true" />
                      Spoiler — reveal
                    </span>
                  </button> :

                <button
                  type="button"
                  onClick={() => onPlay(extra)}
                  aria-label={`Play ${extra.name}`}
                  className="group absolute inset-0 grid place-items-center">
                  
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 opacity-0 transition-opacity duration-150 ease-entrance group-hover:opacity-100">
                      <PlayIcon className="h-5 w-5 fill-ink-950 text-ink-950" aria-hidden="true" />
                    </span>
                  </button>
                }
              </div>
              <p className="p-3 text-xs font-semibold leading-snug text-white">
                {hidden ? 'Hidden until you reach it' : extra.name}
              </p>
            </div>
          </li>);

      })}
    </ul>);

}