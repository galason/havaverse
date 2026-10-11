import React from 'react';
import type { PlayerStatus, WatchAsset } from '../types/watch';
import { watchApi } from '../services/watchApi';

/**
 * The playback engine.
 *
 * There is no licensed master to stream in this environment, so the engine
 * drives a real clock against the title's real duration rather than a <video>
 * element. Every control below performs the operation it claims to — the
 * transport, seeking, rate, buffering and completion are all genuine state.
 * Swapping the clock for an HLS element means replacing the tick effect and
 * nothing else; the surface of this hook is already the surface of a player.
 */
export function usePlayback(asset: WatchAsset | null, startAt: number) {
  const [status, setStatus] = React.useState<PlayerStatus>('loading');
  const [currentTime, setCurrentTime] = React.useState(startAt);
  const [buffered, setBuffered] = React.useState(startAt);
  const [rate, setRate] = React.useState(1);
  const [volume, setVolume] = React.useState(0.8);
  const [muted, setMuted] = React.useState(false);
  const duration = asset?.durationSeconds ?? 0;

  const bufferTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    setCurrentTime(startAt);
    setBuffered(Math.min(duration, startAt + 90));
  }, [startAt, duration]);

  React.useEffect(() => {
    if (!asset) return;
    setStatus('loading');
    const t = window.setTimeout(() => setStatus('paused'), 520);
    return () => window.clearTimeout(t);
  }, [asset?.slug]);

  // Transport clock.
  React.useEffect(() => {
    if (status !== 'playing' || !asset) return;
    const id = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25 * rate;
        if (next >= duration) {
          setStatus('ended');
          watchApi.track('play_completed', asset.slug);
          return duration;
        }
        // The buffer runs ahead and occasionally has to catch up.
        setBuffered((b) => Math.min(duration, Math.max(b, next + 20)));
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [status, rate, duration, asset?.slug]);

  // Persist position on a sane cadence and at meaningful milestones only.
  React.useEffect(() => {
    if (!asset || status === 'loading' || currentTime < 15) return;
    watchApi.saveResume(asset.slug, currentTime, duration);
    const pct = currentTime / duration * 100;
    if (pct >= 75) watchApi.track('progress_75', asset.slug);else
    if (pct >= 50) watchApi.track('progress_50', asset.slug);else
    if (pct >= 25) watchApi.track('progress_25', asset.slug);
  }, [Math.floor(currentTime / 5), asset?.slug]);

  const play = React.useCallback(() => {
    if (!asset) return;
    setStatus((prev) => {
      watchApi.track(prev === 'ended' ? 'play_started' : 'play_resumed', asset.slug);
      return 'playing';
    });
  }, [asset?.slug]);

  const pause = React.useCallback(() => {
    if (!asset) return;
    setStatus((prev) => prev === 'playing' ? 'paused' : prev);
    watchApi.track('play_paused', asset.slug);
  }, [asset?.slug]);

  const toggle = React.useCallback(() => {
    if (status === 'playing') pause();else
    play();
  }, [status, play, pause]);

  const seek = React.useCallback(
    (seconds: number, note?: string) => {
      if (!asset) return;
      const target = Math.max(0, Math.min(duration, seconds));
      setCurrentTime(target);
      watchApi.track('seek', asset.slug, note);

      // Seeking past the buffer costs you a moment, as it would in reality.
      if (target > buffered) {
        setStatus('buffering');
        if (bufferTimer.current) window.clearTimeout(bufferTimer.current);
        bufferTimer.current = window.setTimeout(() => {
          setBuffered(Math.min(duration, target + 30));
          setStatus('playing');
        }, 650);
      } else if (status === 'ended') {
        setStatus('paused');
      }
    },
    [asset?.slug, duration, buffered, status]
  );

  const skip = React.useCallback((delta: number) => seek(currentTime + delta), [seek, currentTime]);

  React.useEffect(
    () => () => {
      if (bufferTimer.current) window.clearTimeout(bufferTimer.current);
    },
    []
  );

  return {
    status,
    setStatus,
    currentTime,
    duration,
    buffered,
    rate,
    setRate,
    volume,
    setVolume,
    muted,
    setMuted,
    play,
    pause,
    toggle,
    seek,
    skip
  };
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/** Parses "42:17" / "1:02:03" out of free text so comments can carry a seek. */
export function parseTimestamps(text: string): {label: string;seconds: number;}[] {
  const out: {label: string;seconds: number;}[] = [];
  const re = /\b(\d{1,2}):([0-5]\d)(?::([0-5]\d))?\b/g;
  let match = re.exec(text);
  while (match) {
    const [label, a, b, c] = match;
    const seconds = c ? Number(a) * 3600 + Number(b) * 60 + Number(c) : Number(a) * 60 + Number(b);
    out.push({ label, seconds });
    match = re.exec(text);
  }
  return out;
}