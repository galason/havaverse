/* -------------------------------------------------------------------------- *
 * HavaVerse Podcast — domain types
 *
 * Music is culture in motion; podcast is ideas in motion. The graph is the
 * same shape but the spine is different:
 *
 *   CREATOR → SHOW → EPISODE → IDEA → TOPIC → COMMUNITY → LIVE → COLLECTION
 *
 * Nothing here carries presentation concerns. Pages read it through
 * services/podcastApi.ts so the data source can be replaced without touching
 * a component.
 * -------------------------------------------------------------------------- */

export interface Host {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  roles: string;
  city: string;
  country: string;
  listeners: string;
  supporters: string;
  bio: string;
  communitySlug?: string;
  verified: boolean;
}

/** A node on "the world behind the conversation". Every one is a destination. */
export interface PodGraphNode {
  kind: 'Creator' | 'Show' | 'Episode' | 'Topic' | 'Guest' | 'Community' | 'Live' | 'Collection';
  label: string;
  detail: string;
  to: string;
}

export interface Show {
  id: string;
  title: string;
  hostId: string;
  artwork: string;
  cover: string;
  tagline: string;
  about: string;
  topicIds: string[];
  cityId: string;
  listeners: string;
  communityMembers: string;
  communitySlug: string;
  seasons: number;
  episodeCount: number;
  origin: 'Original HavaVerse Podcast' | 'Independent' | 'Partner';
}

/** A marked moment inside an episode. Labelled as machine-generated. */
export interface Chapter {
  startSeconds: number;
  label: string;
}

/** A pulled quote that the audience can react to and discuss at a timestamp. */
export interface Moment {
  id: string;
  atSeconds: number;
  speaker: string;
  text: string;
  reactions: number;
  comments: number;
}

export interface TranscriptLine {
  atSeconds: number;
  speaker: string;
  text: string;
}

export interface Guest {
  id: string;
  name: string;
  role: string;
  avatar: string;
  to?: string;
}

export interface Episode {
  id: string;
  showId: string;
  title: string;
  season: number;
  number: number;
  durationSeconds: number;
  artwork: string;
  summary: string;
  publishedAt: string;
  topicIds: string[];
  guestIds: string[];
  chapters: Chapter[];
  moments: Moment[];
  transcript: TranscriptLine[];
  graph: PodGraphNode[];
  /** Set when the conversation is anchored to a HavaVerse work. */
  relatedStory?: {label: string;to: string;};
  liveEventId?: string;
  collectionId?: string;
}

/** Not a category — a world with shows, communities and live conversations. */
export interface ConversationWorld {
  id: string;
  name: string;
  strapline: string;
  blurb: string;
  image: string;
  showCount: number;
  episodeCount: number;
  communityCount: number;
  liveCount: number;
  showIds: string[];
  communityTo: string;
}

export interface Topic {
  id: string;
  label: string;
  worldId: string;
  followers: string;
}

/** A city on the conversation map. */
export interface PodCity {
  id: string;
  city: string;
  country: string;
  listeners: string;
  topics: string[];
  x: number;
  y: number;
  intensity: 'high' | 'medium' | 'low';
}

export type LiveKind = 'Live recording' | 'Ask me anything' | 'Roundtable' | 'Premiere';

export interface LiveConversation {
  id: string;
  title: string;
  showId: string;
  kind: LiveKind;
  venue: string;
  city: string;
  date: string;
  image: string;
  price: number;
  attending: string;
  status: 'on-sale' | 'live' | 'low' | 'sold-out' | 'free';
}

export type DropState = 'open' | 'closing' | 'sold-out' | 'upcoming';

export interface PodDrop {
  id: string;
  name: string;
  showId: string;
  blurb: string;
  image: string;
  kind: 'Archive collection' | 'Interview series' | 'Unreleased season' | 'Collector edition';
  price: number;
  state: DropState;
  remaining?: number;
  total?: number;
  releasesAt?: string;
  includes: string[];
}

export interface PodMembership {
  id: string;
  hostId: string;
  name: string;
  pricePerMonth: number;
  members: string;
  benefits: string[];
}

/** The listener's intellectual record. Identity, not analytics. */
export interface ConversationPassport {
  topics: number;
  cities: number;
  creators: number;
  communities: number;
  liveConversations: number;
  creatorsSupported: number;
  savedIdeas: number;
}

/** A saved moment. The quote the listener chose to keep. */
export interface SavedIdea {
  momentId: string;
  episodeId: string;
  text: string;
  speaker: string;
  atSeconds: number;
}