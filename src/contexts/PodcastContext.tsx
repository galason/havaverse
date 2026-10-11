import React from 'react';
import { episodes as allEpisodes } from '../data/podcast';
import { podcastApi } from '../services/podcastApi';
import { useApp } from './AppContext';
import { useMusic } from './MusicContext';
import type { Episode, SavedIdea } from '../types/podcast';

/* -------------------------------------------------------------------------- *
 * Listening and participation state for HavaVerse Podcast.
 *
 * Playback lives here rather than in a page so the player can follow the
 * listener across the whole application. Money actions record intent and
 * hand settlement to HavaPay.
 * -------------------------------------------------------------------------- */

export const speeds = [0.8, 1, 1.25, 1.5, 2] as const;
export type Speed = (typeof speeds)[number];

interface PodcastValue {
  current: Episode | null;
  playing: boolean;
  elapsed: number;
  speed: Speed;
  expanded: boolean;
  transcriptOpen: boolean;
  play: (episode: Episode) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  skip: (delta: number) => void;
  setSpeed: (value: Speed) => void;
  setExpanded: (value: boolean) => void;
  setTranscriptOpen: (value: boolean) => void;
  /** Resume position per episode, so "continue listening" is real. */
  progressFor: (episodeId: string) => number;

  saved: string[];
  isSaved: (episodeId: string) => boolean;
  toggleSave: (episodeId: string) => void;

  followed: string[];
  isFollowing: (showId: string) => boolean;
  toggleFollowShow: (showId: string) => void;

  ideas: SavedIdea[];
  hasIdea: (momentId: string) => boolean;
  saveIdea: (idea: SavedIdea) => Promise<void>;

  supported: string[];
  hasSupported: (hostId: string) => boolean;
  support: (hostId: string, amount: number, name: string) => Promise<void>;

  memberOf: string[];
  isMember: (membershipId: string) => boolean;
  joinMembership: (membershipId: string, name: string) => Promise<void>;

  collected: string[];
  hasCollected: (dropId: string) => boolean;
  collect: (dropId: string, name: string) => Promise<void>;

  notifying: string[];
  isNotifying: (dropId: string) => boolean;
  toggleNotify: (dropId: string, name: string) => void;

  seats: string[];
  hasSeat: (liveId: string) => boolean;
  reserve: (liveId: string, title: string) => Promise<void>;

  pending: string | null;
}

const PodcastContext = React.createContext<PodcastValue | null>(null);

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatClock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ?
  `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` :
  `${m}:${s.toString().padStart(2, '0')}`;
}

export function PodcastProvider({ children }: {children: React.ReactNode;}) {
  const { showToast } = useApp();
  const music = useMusic();

  const [current, setCurrent] = React.useState<Episode | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [speed, setSpeed] = React.useState<Speed>(1);
  const [expanded, setExpanded] = React.useState(false);
  const [transcriptOpen, setTranscriptOpen] = React.useState(false);

  // Seeded so "continue listening" has something honest to show.
  const [positions, setPositions] = React.useState<Record<string, number>>({
    ep4: 1320,
    ep3: 640
  });

  const [saved, setSaved] = React.useState<string[]>(['ep2']);
  const [followed, setFollowed] = React.useState<string[]>(['future-is-african']);
  const [ideas, setIdeas] = React.useState<SavedIdea[]>([]);
  const [supported, setSupported] = React.useState<string[]>([]);
  const [memberOf, setMemberOf] = React.useState<string[]>([]);
  const [collected, setCollected] = React.useState<string[]>([]);
  const [notifying, setNotifying] = React.useState<string[]>([]);
  const [seats, setSeats] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!playing || !current) return;
    const timer = window.setInterval(() => {
      setElapsed((value) => {
        const nextValue = value + speed;
        if (nextValue >= current.durationSeconds) {
          setPlaying(false);
          return current.durationSeconds;
        }
        setPositions((prev) => ({ ...prev, [current.id]: nextValue }));
        return nextValue;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, current, speed]);

  // Registered with the audio arbiter so music (or a video surface) can stop us.
  const { registerRival } = music;
  React.useEffect(
    () => registerRival(() => setPlaying(false)),
    [registerRival]
  );

  const play = (episode: Episode) => {
    // One thing plays at a time across the platform.
    music.pauseAll();
    setCurrent(episode);
    setElapsed(positions[episode.id] ?? 0);
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

  const value: PodcastValue = {
    current,
    playing,
    elapsed,
    speed,
    expanded,
    transcriptOpen,
    play,
    toggle: () => setPlaying((p) => !p),
    seek: (seconds) => {
      setElapsed(seconds);
      if (current) setPositions((prev) => ({ ...prev, [current.id]: seconds }));
    },
    skip: (delta) =>
    setElapsed((value) => {
      if (!current) return value;
      return Math.min(current.durationSeconds, Math.max(0, value + delta));
    }),
    setSpeed,
    setExpanded,
    setTranscriptOpen,
    progressFor: (episodeId) => {
      const episode = allEpisodes.find((e) => e.id === episodeId);
      if (!episode) return 0;
      const at = episodeId === current?.id ? elapsed : positions[episodeId] ?? 0;
      return at / episode.durationSeconds;
    },

    saved,
    isSaved: (episodeId) => saved.includes(episodeId),
    toggleSave: (episodeId) =>
    setSaved((prev) =>
    prev.includes(episodeId) ? prev.filter((id) => id !== episodeId) : [...prev, episodeId]
    ),

    followed,
    isFollowing: (showId) => followed.includes(showId),
    toggleFollowShow: (showId) =>
    setFollowed((prev) =>
    prev.includes(showId) ? prev.filter((id) => id !== showId) : [...prev, showId]
    ),

    ideas,
    hasIdea: (momentId) => ideas.some((idea) => idea.momentId === momentId),
    saveIdea: (idea) =>
    runAction(
      `idea:${idea.momentId}`,
      () => podcastApi.saveMoment(idea.momentId),
      () => setIdeas((prev) => [...prev.filter((i) => i.momentId !== idea.momentId), idea]),
      'Saved to your passport'
    ),

    supported,
    hasSupported: (hostId) => supported.includes(hostId),
    support: (hostId, amount, name) =>
    runAction(
      `support:${hostId}`,
      () => podcastApi.supportHost(hostId, amount),
      () => setSupported((prev) => [...new Set([...prev, hostId])]),
      `₦${amount.toLocaleString('en-NG')} to ${name} — settling through HavaPay`
    ),

    memberOf,
    isMember: (membershipId) => memberOf.includes(membershipId),
    joinMembership: (membershipId, name) =>
    runAction(
      `member:${membershipId}`,
      () => podcastApi.joinMembership(membershipId),
      () => setMemberOf((prev) => [...new Set([...prev, membershipId])]),
      `You're in — ${name} · first month awaiting HavaPay confirmation`
    ),

    collected,
    hasCollected: (dropId) => collected.includes(dropId),
    collect: (dropId, name) =>
    runAction(
      `collect:${dropId}`,
      () => podcastApi.collectDrop(dropId),
      () => setCollected((prev) => [...new Set([...prev, dropId])]),
      `${name} collected — awaiting HavaPay confirmation`
    ),

    notifying,
    isNotifying: (dropId) => notifying.includes(dropId),
    toggleNotify: (dropId, name) => {
      setNotifying((prev) =>
      prev.includes(dropId) ? prev.filter((id) => id !== dropId) : [...prev, dropId]
      );
      showToast(
        notifying.includes(dropId) ?
        `Reminder removed — ${name}` :
        `We'll tell you when ${name} opens`
      );
    },

    seats,
    hasSeat: (liveId) => seats.includes(liveId),
    reserve: (liveId, title) =>
    runAction(
      `seat:${liveId}`,
      () => podcastApi.reserveSeat(liveId),
      () => setSeats((prev) => [...new Set([...prev, liveId])]),
      `Seat reserved — ${title}. Paid seats confirm once HavaPay settles`
    ),

    pending
  };

  return <PodcastContext.Provider value={value}>{children}</PodcastContext.Provider>;
}

export function usePodcast(): PodcastValue {
  const context = React.useContext(PodcastContext);
  if (!context) throw new Error('usePodcast must be used inside PodcastProvider');
  return context;
}