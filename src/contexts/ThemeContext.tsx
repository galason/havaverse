import React from 'react';

export type ThemePreference = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
}

const STORAGE_KEY = 'hv-theme';
const media = () =>
typeof window !== 'undefined' && window.matchMedia ?
window.matchMedia('(prefers-color-scheme: light)') :
null;

function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  } catch {

    /* storage unavailable — fall through to default */}
  return 'dark';
}

function resolve(preference: ThemePreference): ResolvedTheme {
  if (preference !== 'system') return preference;
  return media()?.matches ? 'light' : 'dark';
}

function apply(theme: ResolvedTheme, animate: boolean) {
  const root = document.documentElement;
  if (root.dataset.theme === theme) return;
  if (animate) {
    root.classList.add('theme-switching');
    window.setTimeout(() => root.classList.remove('theme-switching'), 260);
  }
  root.dataset.theme = theme;
}

// Apply before first paint so there is no flash of the wrong environment.
if (typeof document !== 'undefined') apply(resolve(readPreference()), false);

const ThemeContext = React.createContext<ThemeState | null>(null);

/**
 * HavaVerse appearance. Dark is the default cinematic environment; Light is a
 * first-class daylight environment; System follows the device. The theme only
 * changes visual tokens — never layout, typography or hierarchy.
 */
export function ThemeProvider({ children }: {children: React.ReactNode;}) {
  const [preference, setPref] = React.useState<ThemePreference>(readPreference);
  const [resolved, setResolved] = React.useState<ResolvedTheme>(() => resolve(preference));

  React.useEffect(() => {
    const next = resolve(preference);
    setResolved(next);
    apply(next, true);
    if (preference !== 'system') return;
    const mq = media();
    if (!mq) return;
    const onChange = () => {
      const r = resolve('system');
      setResolved(r);
      apply(r, true);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  const setPreference = React.useCallback((next: ThemePreference) => {
    setPref(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {

      /* preference still applies for this session */}
  }, []);

  const value = React.useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}