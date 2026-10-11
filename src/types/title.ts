import type { ContentKind } from './content';

/**
 * The canonical title entity.
 *
 * /title/:slug is the entertainment IDENTITY page: everything a work is
 * connected to. /watch/:slug is the viewing room. This file describes the
 * former, and deliberately does not restate playback concerns that already
 * live in types/watch.ts — the title page reads resume state from there
 * rather than keeping a second copy.
 */

export type TitleSectionId =
'overview' |
'episodes' |
'characters' |
'universe' |
'extras' |
'community' |
'reviews' |
'soundtrack' |
'market' |
'live' |
'stats' |
'highlights';

/** How the title is currently reachable. Drives the primary CTA. */
export type ReleaseState = 'released' | 'upcoming' | 'premiere' | 'live';

export type CtaMode =
'watch' |
'resume' |
'continue' |
'again' |
'notify' |
'live' |
'premiere' |
'blocked';

/** Resolved by the service from release state + playback + entitlement. */
export interface TitleCta {
  mode: CtaMode;
  label: string;
  /** Absent when the action is not a navigation (notify, blocked). */
  to?: string;
  /** Secondary line, e.g. "42% watched" or "Premieres Friday 20:00 WAT". */
  note?: string;
}

export interface TitleCreator {
  name: string;
  handle: string;
  avatar: string;
  kind: string;
  followers: string;
  location: string;
  languages: string[];
  verified: boolean;
  aiProduction: string;
  /** Slugs of other works, resolved against the catalog. */
  works: {label: string;slugs: string[];}[];
}

export interface TitleCharacter {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  /** Title slugs this character appears in. */
  appearsIn: string[];
  relationships: {name: string;relation: string;}[];
  /** Content-graph destination when the character has a full page. */
  to?: string;
  /** Held back until the viewer opts into spoilers. */
  spoiler?: boolean;
}

export interface UniverseEntry {
  order: string;
  name: string;
  year: number;
  image: string;
  to: string;
  kind: string;
  /** e.g. "In production" — absent when released. */
  status?: string;
  current?: boolean;
}

export interface Episode {
  id: string;
  number: number;
  name: string;
  runtime: string;
  synopsis: string;
  still: string;
  /** 0-100 when the viewer has started it. */
  progress?: number;
  watched?: boolean;
}

export interface Season {
  number: number;
  name: string;
  episodes: Episode[];
}

export type ExtraKind =
'Trailer' |
'Teaser' |
'Behind the scenes' |
'Interview' |
'Deleted scene' |
'Making of' |
'Character clip' |
'Production diary';

export interface Extra {
  id: string;
  kind: ExtraKind;
  name: string;
  runtime: string;
  still: string;
  spoiler?: boolean;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  body: string;
  postedAt: string;
  helpful: number;
  spoiler: boolean;
  source: 'community' | 'critic';
  mine?: boolean;
}

export interface ReviewSummary {
  /** Presented as signals, never as an authoritative verdict. */
  hava: number;
  community: number;
  critics: number;
  communityCount: string;
  criticCount: string;
  yourRating: number | null;
  reviews: Review[];
}

export interface RecommendationGroup {
  id: string;
  label: string;
  /** Shown behind "Why am I seeing this?" — transparency, not decoration. */
  why: string;
  slugs: string[];
}

export interface Availability {
  region: string;
  available: boolean;
  streaming: string;
  audio: string[];
  subtitles: string[];
  /** Populated when unavailable — states the reason plainly. */
  note?: string;
  licensedIn?: string[];
}

export interface ProvenanceEntry {
  label: string;
  value: string;
  /** Only revealed behind "View provenance". */
  detailed?: boolean;
}

export interface TitleSoundtrack {
  name: string;
  to: string;
  composer: string;
  trackCount: string;
  duration: string;
  trackIds: string[];
}

export interface TitleCommunityStats {
  slug: string;
  name: string;
  fans: string;
  discussing: string;
  watching: string;
  parties: number;
  newSinceLastVisit: number;
}

/** What the AI Director is permitted to derive from this work. */
export interface AiCapability {
  id: string;
  label: string;
  blurb: string;
  /** False when the rights holder has not granted derivative use. */
  allowed: boolean;
  reason?: string;
}

export interface TitleExperience {
  slug: string;
  kind: ContentKind;
  releaseState: ReleaseState;
  sections: TitleSectionId[];
  synopsis: string;
  themes: string[];
  releaseDate: string;
  country: string;
  audio: string[];
  subtitles: string[];
  advisories: string[];
  productionStatus: string;
  aiProduction: string;
  formats: string[];
  creator: TitleCreator;
  characters: TitleCharacter[];
  universe?: {id: string;name: string;to: string;entries: UniverseEntry[];};
  seasons: Season[];
  extras: Extra[];
  reviews: ReviewSummary;
  recommendations: RecommendationGroup[];
  soundtrack?: TitleSoundtrack;
  community?: TitleCommunityStats;
  availability: Availability;
  provenance: ProvenanceEntry[];
  aiCapabilities: AiCapability[];
  downloadable: boolean;
  /** True when the signed-in identity is the rights holder. */
  ownedByViewer: boolean;
  suggestedQuestions: string[];
}

export type DownloadState =
'idle' |
'preparing' |
'downloading' |
'downloaded' |
'unavailable';

export interface DownloadRecord {
  slug: string;
  quality: string;
  state: DownloadState;
  progress: number;
}