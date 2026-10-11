import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon, WandSparklesIcon } from 'lucide-react';
import type { AiCapability } from '../../types/title';

interface InspiredPanelProps {
  titleName: string;
  capabilities: AiCapability[];
  onToast: (message: string) => void;
}

/**
 * The creator-powered end of the title page. What the Director may derive is
 * governed by the rights record, so blocked capabilities show their reason
 * rather than being hidden.
 */
export function InspiredPanel({ titleName, capabilities, onToast }: InspiredPanelProps) {
  const navigate = useNavigate();

  return (
    <section
      aria-labelledby="inspired-heading"
      className="rounded-2xl border border-brand-indigo/25 bg-brand-indigo/5 p-4">
      
      <h2
        id="inspired-heading"
        className="flex items-center gap-2 text-sm font-bold text-white">
        
        <WandSparklesIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        Create something inspired by this
      </h2>
      <p className="mt-0.5 text-[11px] leading-relaxed text-mist-300">
        Open the AI Entertainment Director with {titleName} as the starting brief.
      </p>

      <ul className="mt-3 space-y-1.5">
        {capabilities.map((cap) =>
        <li key={cap.id}>
            <button
            type="button"
            disabled={!cap.allowed}
            onClick={() => {
              onToast(`Opening the Director — ${cap.label.toLowerCase()}`);
              navigate(
                `/studio?brief=${encodeURIComponent(`${cap.label} for ${titleName}`)}`
              );
            }}
            className={`w-full rounded-xl border p-2.5 text-left transition-colors duration-150 ease-entrance ${
            cap.allowed ?
            'border-white/10 bg-ink-900 hover:border-brand-indigo/60' :
            'cursor-not-allowed border-dashed border-white/10'}`
            }>
            
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                {!cap.allowed &&
              <LockIcon className="h-3 w-3 text-brand-amber" aria-hidden="true" />
              }
                {cap.label}
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-mist-400">
                {cap.allowed ? cap.blurb : cap.reason}
              </span>
            </button>
          </li>
        )}
      </ul>
    </section>);

}