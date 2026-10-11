import React from 'react';
import { tracks as allTracks } from '../data/music';
import { musicApi } from '../services/musicApi';
import { useApp } from './AppContext';
import type { Track } from '../types/music';

/**
 * Playback plus participation. Both live here because in HavaVerse they are
 * the same journey: what you are listening to decides what you can support,
 * collect and attend.
 *
 * No audio element is attached — this prototype models transport state and
 * elapsed time. Swapping in a real <audio> source touches only this file.
 */
interface MusicValue {
  current: Track | null;
  queue: Track[];
  playing: boolean;
  elapsed: number;
  play: (track: Track, queue?: Track[]) => void;
  toggle: () => void;
  /**
   * One audio source at a time across HavaVerse. Any other player (podcast,
   * video, Shorts) registers a pause callback here; starting music stops them,
   * and `pauseAll` lets a video surface silence every bar on mount.
   */
  registerRival: (pause: () => void) => () => void;
  pauseAll: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  expanded: boolean;
  setExpanded: (value: boolean) => void;

  likes: string[];
  isLiked: (trackId: string) => boolean;
  toggleLike: (trackId: string) => void;

  supported: string[];
  hasSupported: (artistId: string) => boolean;
  support: (artistId: string, amount: number, name: string) => Promise<void>;

  memberOf: string[];
  isMember: (membershipId: string) => boolean;
  joinMembership: (membershipId: string, name: string) => Promise<void>;

  collected: string[];
  hasCollected: (editionId: string) => boolean;
  collect: (editionId: string, name: string) => Promise<void>;

  backed: string[];
  hasBacked: (projectId: string) => boolean;
  back: (projectId: string, amount: number, title: string) => Promise<void>;

  tickets: string[];
  hasTicket: (liveId: string) => boolean;
  reserve: (liveId: string, title: string) => Promise<void>;

  pending: string | null;
}

const MusicContext = React.createContext<MusicValue | null>(null);

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MusicProvider({ children }: {children: React.ReactNode;}) {
  const { showToast } = useApp();

  const [queue, setQueue] = React.useState<Track[]>(allTracks);
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [expanded, setExpanded] = React.useState(false);

  const [likes, setLikes] = React.useState<string[]>(['tr1']);
  const [supported, setSupported] = React.useState<string[]>([]);
  const [memberOf, setMemberOf] = React.useState<string[]>([]);
  const [collected, setCollected] = React.useState<string[]>([]);
  const [backed, setBacked] = React.useState<string[]>([]);
  const [tickets, setTickets] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState<string | null>(null);

  const current = queue[index] ?? null;

  React.useEffect(() => {
    if (!playing || !current) return;
    const timer = window.setInterval(() => {
      setElapsed((value) => {
        if (value + 1 >= current.durationSeconds) {
          setIndex((i) => i + 1 < queue.length ? i + 1 : 0);
          return 0;
        }
        return value + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, current, queue.length]);

  const rivals = React.useRef(new Set<() => void>());

  const registerRival = React.useCallback((pause: () => void) => {
    rivals.current.add(pause);
    return () => {
      rivals.current.delete(pause);
    };
  }, []);

  const silenceRivals = React.useCallback(() => {
    rivals.current.forEach((pause) => pause());
  }, []);

  const pauseAll = React.useCallback(() => {
    setPlaying(false);
    rivals.current.forEach((pause) => pause());
  }, []);

  const play = (track: Track, nextQueue?: Track[]) => {
    // One thing plays at a time across the platform.
    silenceRivals();
    const list = nextQueue && nextQueue.length > 0 ? nextQueue : queue;
    const position = list.findIndex((t) => t.id === track.id);
    setQueue(list);
    setIndex(position >= 0 ? position : 0);
    setElapsed(0);
    setPlaying(true);
  };

  const runAction = async (
  key: string,
  call: () => Promise<{ok: true;data: unknown;} | {ok: false;error: string;}>,
  onSuccess: () => void,
  successMessage: string) =>
  {
    setPending(key);
    const result = await call();
    setPending(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    onSuccess();
    showToast(successMessage);
  };

  const value: MusicValue = {
    current,
    queue,
    playing,
    elapsed,
    play,
    toggle: () =>
    setPlaying((p) => {
      if (!p) silenceRivals();
      return !p;
    }),
    registerRival,
    pauseAll,
    next: () => {
      setIndex((i) => i + 1 < queue.length ? i + 1 : 0);
      setElapsed(0);
    },
    previous: () => {
      if (elapsed > 3) {
        setElapsed(0);
        return;
      }
      setIndex((i) => i > 0 ? i - 1 : queue.length - 1);
      setElapsed(0);
    },
    seek: (seconds) => setElapsed(seconds),
    expanded,
    setExpanded,

    likes,
    isLiked: (trackId) => likes.includes(trackId),
    toggleLike: (trackId) =>
    setLikes((prev) =>
    prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    ),

    supported,
    hasSupported: (artistId) => supported.includes(artistId),
    support: (artistId, amount, name) =>
    runAction(
      `support:${artistId}`,
      () => musicApi.supportCreator(artistId, amount),
      () => setSupported((prev) => [...new Set([...prev, artistId])]),
      `₦${amount.toLocaleString('en-NG')} to ${name} — settling through HavaPay`
    ),

    memberOf,
    isMember: (membershipId) => memberOf.includes(membershipId),
    joinMembership: (membershipId, name) =>
    runAction(
      `member:${membershipId}`,
      () => musicApi.joinMembership(membershipId),
      () => setMemberOf((prev) => [...new Set([...prev, membershipId])]),
      `You're in — ${name} · first month awaiting HavaPay confirmation`
    ),

    collected,
    hasCollected: (editionId) => collected.includes(editionId),
    collect: (editionId, name) =>
    runAction(
      `collect:${editionId}`,
      () => musicApi.collectEdition(editionId),
      () => setCollected((prev) => [...new Set([...prev, editionId])]),
      `${name} collected — awaiting HavaPay confirmation`
    ),

    backed,
    hasBacked: (projectId) => backed.includes(projectId),
    back: (projectId, amount, title) =>
    runAction(
      `back:${projectId}`,
      () => musicApi.backProject(projectId, amount),
      () => setBacked((prev) => [...new Set([...prev, projectId])]),
      `Backed ${title} with ₦${amount.toLocaleString('en-NG')}`
    ),

    tickets,
    hasTicket: (liveId) => tickets.includes(liveId),
    reserve: (liveId, title) =>
    runAction(
      `ticket:${liveId}`,
      () => musicApi.reserveTicket(liveId),
      () => setTickets((prev) => [...new Set([...prev, liveId])]),
      `Ticket reserved — ${title}. Paid tickets confirm once HavaPay settles`
    ),

    pending
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic(): MusicValue {
  const context = React.useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used inside MusicProvider');
  return context;
}