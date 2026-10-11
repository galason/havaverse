import React from 'react';
import { dataDomains } from '../../data/settings';
import { useSettings } from '../../contexts/SettingsContext';
import { AccountLifecycle } from './AccountLifecycle';

/**
 * The data map is a control surface, not a diagram: every domain names the
 * setting that governs it and lets you change it from here.
 */
export function DataPanel({ onToast }: {onToast: (m: string) => void;}) {
  const { valueOf, setDraft, registry } = useSettings();

  return (
    <div className="space-y-4">
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dataDomains.map((domain) => {
          const def = registry.find((d) => d.id === domain.controlSettingId);
          const value = valueOf(domain.controlSettingId);
          const isToggle = def?.valueType === 'toggle';
          return (
            <li
              key={domain.id}
              className="flex flex-col rounded-2xl border border-white/5 bg-ink-850 p-4">
              
              <p className="text-sm font-bold text-white">{domain.label}</p>
              <dl className="mt-2.5 space-y-1.5">
                {[
                ['Used for', domain.usedFor],
                ['Stored', domain.stored],
                ['Shared', domain.shared]].
                map(([label, text]) =>
                <div key={label}>
                    <dt className="text-[10px] uppercase tracking-wide text-mist-400">{label}</dt>
                    <dd className="text-[11px] leading-relaxed text-mist-200">{text}</dd>
                  </div>
                )}
              </dl>
              {def &&
              <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <span className="text-[11px] text-mist-400">{def.label}</span>
                  {isToggle ?
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(value)}
                  aria-label={def.label}
                  onClick={() => setDraft(def.id, !value)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ease-entrance ${
                  value ? 'bg-brand-indigo' : 'bg-ink-700'}`
                  }>
                  
                      <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-150 ease-entrance ${
                    value ? 'translate-x-[18px]' : 'translate-x-0.5'}`
                    } />
                  
                    </button> :

                <span className="text-[11px] font-semibold text-white">
                      {def.options?.find((o) => o.value === value)?.label ?? String(value)}
                    </span>
                }
                </div>
              }
            </li>);

        })}
      </ul>

      <AccountLifecycle onToast={onToast} />
    </div>);

}