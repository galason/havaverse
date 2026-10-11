import React from 'react';
import { CheckIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { themeOptions } from './ThemeSwitcher';

/**
 * Fixed-colour miniatures: each preview shows its own environment regardless
 * of which theme is active, so the choice is legible before it is made.
 */
const previews = {
  dark: { bg: '#05060d', surface: '#111629', line: '#222b48', text: '#ffffff', muted: '#727b9e' },
  light: { bg: '#f5f4f9', surface: '#ffffff', line: '#e2e1ed', text: '#0e1022', muted: '#666c8a' }
};

function Miniature({ tone }: {tone: 'dark' | 'light';}) {
  const p = previews[tone];
  return (
    <div className="flex h-full w-full gap-1.5 p-2" style={{ background: p.bg }}>
      <div className="w-1/5 rounded" style={{ background: p.surface }} />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-2 w-2/3 rounded-full" style={{ background: p.text }} />
        <div className="h-1.5 w-1/2 rounded-full" style={{ background: p.muted }} />
        <div className="mt-auto flex gap-1.5">
          <div className="h-7 flex-1 rounded" style={{ background: '#5b5bf7' }} />
          <div className="h-7 flex-1 rounded" style={{ background: p.surface, border: `1px solid ${p.line}` }} />
        </div>
      </div>
    </div>);

}

const detail = {
  dark: 'The cinematic HavaVerse environment. Deep surfaces that let artwork lead.',
  light: 'HavaVerse by day. Bright editorial surfaces with the same identity and hierarchy.',
  system: 'Follows your device, switching between night and day automatically.'
};

export function AppearancePanel() {
  const { preference, resolved, setPreference } = useTheme();

  return (
    <section aria-labelledby="appearance-heading" className="space-y-5">
      <div>
        <h2 id="appearance-heading" className="text-sm font-semibold text-white">
          Theme
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-mist-400">
          Changes the visual environment only — navigation, content and layout stay exactly the
          same. Saved on this device.
        </p>
      </div>

      <div role="radiogroup" aria-label="Theme" className="grid gap-3 sm:grid-cols-3">
        {themeOptions.map((option) => {
          const active = preference === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPreference(option.id)}
              className={`group flex flex-col overflow-hidden rounded-xl border text-left transition-colors duration-150 ease-entrance ${
              active ?
              'border-brand-indigo ring-1 ring-brand-indigo' :
              'border-white/10 hover:border-white/25'}`
              }>
              
              <div className="relative h-24 w-full overflow-hidden border-b border-white/10">
                {option.id === 'system' ?
                <div className="flex h-full">
                    <div className="w-1/2 overflow-hidden">
                      <Miniature tone="dark" />
                    </div>
                    <div className="w-1/2 overflow-hidden">
                      <Miniature tone="light" />
                    </div>
                  </div> :

                <Miniature tone={option.id} />
                }
                {active &&
                <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-brand-indigo text-white">
                    <CheckIcon className="h-3 w-3" aria-hidden="true" />
                  </span>
                }
              </div>
              <div className="flex flex-1 flex-col bg-ink-900 p-3">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <Icon className="h-4 w-4 text-mist-300" aria-hidden="true" />
                  {option.label}
                </span>
                <span className="mt-1 text-[11px] leading-relaxed text-mist-400">
                  {detail[option.id]}
                </span>
              </div>
            </button>);

        })}
      </div>

      {preference === 'system' &&
      <p className="text-xs text-mist-400">
          Your device is currently using{' '}
          <span className="font-semibold text-white">{resolved === 'light' ? 'Light' : 'Dark'}</span>.
        </p>
      }
    </section>);

}