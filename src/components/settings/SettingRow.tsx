import React from 'react';
import { InfoIcon, LockIcon } from 'lucide-react';
import type { SettingDefinition } from '../../types/settings';
import { useSettings } from '../../contexts/SettingsContext';

/** A switch that reads as a switch to a screen reader, not a styled checkbox. */
function Toggle({
  checked,
  disabled,
  label,
  onChange





}: {checked: boolean;disabled: boolean;label: string;onChange: (v: boolean) => void;}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-entrance focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan disabled:opacity-40 ${
      checked ? 'bg-brand-indigo' : 'bg-ink-700'}`
      }>
      
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-150 ease-entrance ${
        checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`
        } />
      
    </button>);

}

interface SettingRowProps {
  def: SettingDefinition;
  /** Highlighted when settings search sent the user straight here. */
  highlighted?: boolean;
}

export function SettingRow({ def, highlighted }: SettingRowProps) {
  const { valueOf, setDraft, blockedBy, dirtyIds } = useSettings();
  const [confirming, setConfirming] = React.useState<null | (() => void)>(null);
  const blocked = blockedBy(def);
  const disabled = Boolean(blocked);
  const dirty = dirtyIds.includes(def.id);
  const value = valueOf(def.id);

  function commit(next: string | boolean) {
    if (def.confirm) {
      setConfirming(() => () => setDraft(def.id, next));
      return;
    }
    setDraft(def.id, next);
  }

  return (
    <div
      className={`rounded-xl border p-3.5 transition-colors duration-150 ease-entrance sm:p-4 ${
      highlighted ?
      'border-brand-cyan/50 bg-brand-indigo/5' :
      dirty ?
      'border-brand-indigo/40 bg-ink-850' :
      'border-white/5 bg-ink-850'}`
      }>
      
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2.5">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
            {def.label}
            {dirty &&
            <span className="rounded-full bg-brand-indigo/20 px-2 py-0.5 text-[10px] font-semibold text-brand-indigo">
                Unsaved
              </span>
            }
            {def.confirm &&
            <LockIcon className="h-3 w-3 text-brand-amber" aria-hidden="true" />
            }
          </p>
          {def.description &&
          <p className="mt-0.5 text-xs leading-relaxed text-mist-400">{def.description}</p>
          }
          {def.regionNote &&
          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-brand-amber">
              <InfoIcon className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              {def.regionNote}
            </p>
          }
          {blocked &&
          <p className="mt-1.5 text-[11px] text-mist-400">{blocked}</p>
          }
        </div>

        <div className="shrink-0">
          {def.valueType === 'toggle' &&
          <Toggle
            checked={Boolean(value)}
            disabled={disabled}
            label={def.label}
            onChange={commit} />

          }

          {(def.valueType === 'select' || def.valueType === 'audience') &&
          <select
            value={String(value ?? '')}
            disabled={disabled}
            aria-label={def.label}
            onChange={(e) => commit(e.target.value)}
            className="min-w-[10rem] rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-xs text-white focus:border-brand-indigo focus:outline-none disabled:opacity-40">
            
              {def.options?.map((option) =>
            <option key={option.value} value={option.value}>
                  {option.label}
                </option>
            )}
            </select>
          }

          {def.valueType === 'segmented' &&
          <div
            role="radiogroup"
            aria-label={def.label}
            className="flex flex-wrap gap-1 rounded-full border border-white/10 p-1">
            
              {def.options?.map((option) => {
              const active = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={disabled}
                  onClick={() => commit(option.value)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance disabled:opacity-40 ${
                  active ? 'bg-white text-ink-950' : 'text-mist-300 hover:text-white'}`
                  }>
                  
                    {option.label}
                  </button>);

            })}
            </div>
          }

          {def.valueType === 'text' &&
          <input
            type="text"
            value={String(value ?? '')}
            disabled={disabled}
            aria-label={def.label}
            onChange={(e) => setDraft(def.id, e.target.value)}
            className="min-w-[14rem] rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-xs text-white placeholder:text-mist-400 focus:border-brand-indigo focus:outline-none disabled:opacity-40" />

          }
        </div>
      </div>

      {/* Chosen option's consequence, where the option carries one. */}
      {def.valueType === 'segmented' &&
      def.options?.find((o) => o.value === value)?.description &&
      <p className="mt-2 text-[11px] text-mist-400">
            {def.options.find((o) => o.value === value)?.description}
          </p>
      }

      {confirming &&
      <div
        role="alertdialog"
        aria-label={`Confirm ${def.label}`}
        className="mt-3 rounded-xl border border-brand-amber/30 bg-ink-900 p-3">
        
          <p className="text-xs leading-relaxed text-mist-200">{def.confirm}</p>
          <div className="mt-2.5 flex gap-2">
            <button
            type="button"
            onClick={() => {
              confirming();
              setConfirming(null);
            }}
            className="rounded-full bg-brand-amber px-4 py-1.5 text-[11px] font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-brand-amber/90">
            
              I understand — change it
            </button>
            <button
            type="button"
            onClick={() => setConfirming(null)}
            className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
              Leave it
            </button>
          </div>
        </div>
      }
    </div>);

}