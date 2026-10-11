import React from 'react';
import { CheckIcon, GlobeIcon, ShieldAlertIcon } from 'lucide-react';
import type { Availability, ProvenanceEntry } from '../../types/title';

interface RightsPanelProps {
  availability: Availability;
  provenance: ProvenanceEntry[];
  notified: boolean;
  onNotify: () => void;
}

/**
 * Rights are a result, not a decoration. When a title is unavailable the
 * panel states why and where it IS licensed, rather than failing silently.
 */
export function RightsPanel({
  availability,
  provenance,
  notified,
  onNotify
}: RightsPanelProps) {
  const [detail, setDetail] = React.useState(false);
  const rows = provenance.filter((p) => detail || !p.detailed);

  return (
    <section
      id="rights"
      aria-labelledby="rights-heading"
      className="scroll-mt-20 rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <div className="flex items-start gap-2">
        <GlobeIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden="true" />
        <h2 id="rights-heading" className="text-sm font-bold text-white">
          Rights &amp; availability
        </h2>
        <button
          type="button"
          onClick={() => setDetail((v) => !v)}
          aria-expanded={detail}
          className="ml-auto text-[11px] font-semibold text-brand-indigo">
          
          {detail ? 'Hide provenance' : 'View provenance'}
        </button>
      </div>

      {availability.available ?
      <div className="mt-3 rounded-xl border border-white/5 bg-ink-850 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-cyan">
            <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Available in {availability.region}
          </p>
          <ul className="mt-1.5 space-y-0.5 text-[11px] text-mist-300">
            <li>Streaming · {availability.streaming}</li>
            <li>Audio · {availability.audio.join(', ')}</li>
            <li>Subtitles · {availability.subtitles.join(', ')}</li>
          </ul>
        </div> :

      <div className="mt-3 rounded-xl border border-live/30 bg-live/5 p-3">
          <p className="flex items-start gap-1.5 text-xs font-semibold text-live">
            <ShieldAlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {availability.note}
          </p>
          {availability.licensedIn &&
        <p className="mt-1.5 text-[11px] text-mist-300">
              Currently licensed in {availability.licensedIn.join(', ')}.
            </p>
        }
          <button
          type="button"
          onClick={onNotify}
          className={`mt-2.5 w-full rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance ${
          notified ?
          'border border-white/15 text-mist-200' :
          'bg-brand-indigo text-white hover:bg-brand-violet'}`
          }>
          
            {notified ? 'We’ll notify you' : 'Notify me when available'}
          </button>
        </div>
      }

      <dl className="mt-3 space-y-2 text-xs">
        {rows.map((row) =>
        <div key={row.label} className="grid grid-cols-[104px_minmax(0,1fr)] gap-3">
            <dt className="text-mist-400">{row.label}</dt>
            <dd className={row.detailed ? 'text-mist-300' : 'text-mist-100'}>{row.value}</dd>
          </div>
        )}
      </dl>

      {detail &&
      <p className="mt-2.5 text-[10px] leading-relaxed text-mist-400">
          Provenance shows how this work was made and what it is licensed for. Internal
          rights-management detail stays server-side.
        </p>
      }
    </section>);

}