import React from 'react';

interface WaveformProps {
  seed: string;
  progress: number;
  bars?: number;
  className?: string;
}

/** Deterministic bars from the track id, so a given track always looks itself. */
function amplitudes(seed: string, bars: number): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  return Array.from({ length: bars }, (_, i) => {
    hash = (hash * 1103515245 + 12345) % 2147483648;
    const base = hash / 2147483648 * 0.7 + 0.3;
    // Gentle swell toward the middle so it reads as a recording, not noise.
    const swell = 0.75 + 0.25 * Math.sin(i / bars * Math.PI);
    return Math.min(1, base * swell);
  });
}

export function Waveform({ seed, progress, bars = 64, className = '' }: WaveformProps) {
  const values = React.useMemo(() => amplitudes(seed, bars), [seed, bars]);
  const played = Math.round(progress * bars);

  return (
    <div className={`flex h-full w-full items-center gap-[2px] ${className}`} aria-hidden="true">
      {values.map((value, i) =>
      <span
        key={i}
        style={{ height: `${Math.round(value * 100)}%` }}
        className={`w-full min-w-[2px] rounded-full transition-colors duration-150 ease-entrance ${
        i < played ? 'bg-brand-violet' : 'bg-white/15'}`
        } />

      )}
    </div>);

}