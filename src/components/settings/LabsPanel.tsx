import React from 'react';
import { FlaskConicalIcon } from 'lucide-react';
import { labExperiments } from '../../data/settings';
import { settingsApi } from '../../services/settingsApi';

export function LabsPanel({ onToast }: {onToast: (m: string) => void;}) {
  const [state, setState] = React.useState<Record<string, boolean>>(settingsApi.labState());
  const [busy, setBusy] = React.useState<string | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-mist-400">
        Experiments can change or disappear. Anything you make while one is running stays
        yours, but the feature behind it may not survive.
      </p>

      <ul className="grid gap-3 md:grid-cols-2">
        {labExperiments.map((lab) => {
          const joined = state[lab.id];
          return (
            <li
              key={lab.id}
              className="flex flex-col rounded-2xl border border-white/5 bg-ink-850 p-4">
              
              <div className="flex items-start gap-2.5">
                <FlaskConicalIcon
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan"
                  aria-hidden="true" />
                
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{lab.label}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">{lab.blurb}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  lab.stability === 'Stable' ?
                  'bg-brand-cyan/15 text-brand-cyan' :
                  lab.stability === 'Early' ?
                  'bg-brand-amber/15 text-brand-amber' :
                  'bg-white/10 text-mist-300'}`
                  }>
                  
                  {lab.stability}
                </span>
              </div>

              <button
                type="button"
                disabled={busy === lab.id}
                onClick={async () => {
                  setBusy(lab.id);
                  const result = await settingsApi.toggleLab(lab.id);
                  setBusy(null);
                  if (result.ok) {
                    setState((prev) => ({ ...prev, [lab.id]: result.data }));
                    onToast(result.data ? `Joined ${lab.label}` : `Left ${lab.label}`);
                  }
                }}
                className={`mt-3 w-full rounded-full px-4 py-2 text-[11px] font-semibold transition-colors duration-150 ease-entrance disabled:opacity-50 ${
                joined ?
                'border border-white/15 text-mist-200 hover:text-white' :
                'bg-brand-indigo text-white hover:bg-brand-violet'}`
                }>
                
                {busy === lab.id ? 'Working…' : joined ? 'Leave beta' : 'Join beta'}
              </button>
            </li>);

        })}
      </ul>
    </div>);

}