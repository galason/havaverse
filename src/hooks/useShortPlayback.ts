import React from 'react';

/**
 * Playback clock for the Shorts theatre.
 *
 * There is no licensed master to stream in this prototype, so this drives a
 * real clock over each Short's real duration and reports the same events a
 * media element would. Swapping in an HLS <video> replaces this hook and
 * nothing that consumes it.
 */
export interface ShortPlayback {
  elapsed: number;
  playing: boolean;
  buffering: boolean;
  muted: boolean;
  rate: number;
  captions: boolean;
  progress: number;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setMuted: (v: boolean) => void;
  setRate: (v: number) => void;
  setCaptions: (v: boolean) => void;
  restart: () => void;
}

export function useShortPlayback(
durationSeconds: number,
enabled: boolean,
onComplete: () => void,
startAt = 0)
: ShortPlayback {
  const [elapsed, setElapsed] = React.useState(startAt);
  const [playing, setPlaying] = React.useState(enabled);
  const [buffering, setBuffering] = React.useState(false);
  const [muted, setMuted] = React.useState(true);
  const [rate, setRate] = React.useState(1);
  const [captions, setCaptions] = React.useState(true);
  const completed = React.useRef(false);

  // A new Short: reset the clock and report the initial buffer.
  React.useEffect(() => {
    completed.current = false;
    setElapsed(startAt);
    setPlaying(enabled);
    if (!enabled) return;
    setBuffering(true);
    const id = window.setTimeout(() => setBuffering(false), 320);
    return () => window.clearTimeout(id);
  }, [durationSeconds, enabled, startAt]);

  React.useEffect(() => {
    if (!playing || buffering || !enabled) return;
    const id = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.25 * rate;
        if (next >= durationSeconds) {
          if (!completed.current) {
            completed.current = true;
            onComplete();
          }
          return durationSeconds;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, buffering, enabled, rate, durationSeconds, onComplete]);

  // Tracked so a seek landing after unmount cannot set state on a dead hook.
  const seekTimer = React.useRef<number | null>(null);
  React.useEffect(
    () => () => {
      if (seekTimer.current !== null) window.clearTimeout(seekTimer.current);
    },
    []
  );

  const seek = React.useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(durationSeconds, seconds));
      completed.current = clamped < durationSeconds ? false : completed.current;
      setElapsed(clamped);
      setBuffering(true);
      if (seekTimer.current !== null) window.clearTimeout(seekTimer.current);
      seekTimer.current = window.setTimeout(() => {
        seekTimer.current = null;
        setBuffering(false);
      }, 240);
    },
    [durationSeconds]
  );

  return {
    elapsed,
    playing,
    buffering,
    muted,
    rate,
    captions,
    progress: durationSeconds ? elapsed / durationSeconds * 100 : 0,
    toggle: () => setPlaying((v) => !v),
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    seek,
    setMuted,
    setRate,
    setCaptions,
    restart: () => {
      completed.current = false;
      setElapsed(0);
      setPlaying(true);
    }
  };
}

export function formatShortTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}