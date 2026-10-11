/* -------------------------------------------------------------------------- *
 * HavaVerse Music — domain entities
 * -------------------------------------------------------------------------- *
 * A track is never just an audio file. It resolves outward through the content
 * graph to the artist who made it, the scene it came from, the story it belongs
 * to, the community around it, the live date and the editions you can own.
 *
 *   ARTIST → TRACK → SCENE / STORY → COMMUNITY → LIVE → COLLECTION → HavaPay
 * -------------------------------------------------------------------------- */

export interface Artist {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  cover: string;
  city: string;
  country: string;
  disciplines: string;
  tagline: string;
  bio: string;
  listeners: string;
  supporters: string;
  communitySlug?: string;
  verified: boolean;
}

/** What a track connects to. Each node is a real destination. */
export interface GraphNode {
  kind: 'Artist' | 'Song' | 'Story' | 'IP' | 'Community' | 'Live' | 'Collection';
  label: string;
  detail: string;
  to: string;
}

export interface Track {
  id: string;
  title: string;
  artistId: string;
  /** Additional credited artists, shown as "with". */
  featuring?: string[];
  artwork: string;
  durationSeconds: number;
  sceneId: string;
  worldId: string;
  releaseKind: 'Single' | 'Album track' | 'Visual album' | 'Live session' | 'Score';
  plays: string;
  language: string;
  /** Set when the recording is tied to a HavaVerse work. */
  story?: {label: string;to: string;};
  graph: GraphNode[];
  /** Editions and experiences attached to this recording. */
  supportsCollect?: string;
  liveEventId?: string;
}

/** A city or scene on the sound map. */
export interface Scene {
  id: string;
  city: string;
  country: string;
  listeners: string;
  genres: string[];
  /** Percent coordinates on the map plate, so the plate can be any size. */
  x: number;
  y: number;
  intensity: 'high' | 'medium' | 'low';
}

/** A cultural universe: not a playlist, an economy around a scene. */
export interface MusicWorld {
  id: string;
  name: string;
  city: string;
  blurb: string;
  image: string;
  artistCount: number;
  trackCount: number;
  communityCount: number;
  liveCount: number;
  trackIds: string[];
  communityTo: string;
}

export interface Membership {
  id: string;
  artistId: string;
  name: string;
  pricePerMonth: number;
  members: string;
  benefits: string[];
}

export interface SupportProject {
  id: string;
  artistId: string;
  title: string;
  blurb: string;
  image: string;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
}

export type EditionState = 'open' | 'closing' | 'sold-out' | 'upcoming';

export interface MusicEdition {
  id: string;
  name: string;
  artistId: string;
  trackId?: string;
  kind: 'Digital collectible' | 'Signed edition' | 'Stems' | 'Visual album' | 'Fan pass';
  price: number;
  image: string;
  state: EditionState;
  remaining?: number;
  total?: number;
  /** Human countdown, e.g. "02:14:32". Static in the prototype. */
  closesIn?: string;
  includes: string[];
}

export interface LiveDate {
  id: string;
  title: string;
  artistId: string;
  venue: string;
  city: string;
  date: string;
  image: string;
  price: number;
  status: 'on-sale' | 'low' | 'sold-out' | 'free';
  kind: 'Concert' | 'Listening party' | 'Studio session' | 'Festival';
}

/** The listener's cultural record. Identity, not statistics. */
export interface Passport {
  countries: number;
  artists: number;
  communities: number;
  liveExperiences: number;
  creatorsSupported: number;
  collectedWorks: number;
  topCities: string[];
}

/** Creator-side economics, expressed as attributed activity rather than a rate. */
export interface EconomyLine {
  label: string;
  amount: number;
  share: number;
  trend: string;
}