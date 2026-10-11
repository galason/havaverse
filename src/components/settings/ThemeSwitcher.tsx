import React from 'react';
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme, type ThemePreference } from '../../contexts/ThemeContext';

export const themeOptions: {
  id: ThemePreference;
  label: string;
  icon: React.ComponentType<{className?: string;}>;
}[] = [
{ id: 'dark', label: 'Dark', icon: MoonIcon },
{ id: 'light', label: 'Light', icon: SunIcon },
{ id: 'system', label: 'System', icon: MonitorIcon }];


/** Compact segmented control for quick access (profile menu). */
export function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();
  return (
    <div role="radiogroup" aria-label="Appearance" className="flex gap-1 rounded-lg bg-ink-950 p-1">
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const active = preference === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(option.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
            active ?
            'bg-ink-700 text-white' :
            'text-mist-400 hover:text-white'}`
            }>
            
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {option.label}
          </button>);

      })}
    </div>);

}