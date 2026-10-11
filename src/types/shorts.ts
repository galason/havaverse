/**
 * HavaVerse Shorts — the canonical short-form entity.
 *
 * A Short is never a standalone media record. It is a node in the content
 * graph whose whole purpose is to be a doorway: to a film, a creator, a
 * character, a song, a community, a product, a match or a creation flow.
 */

export type ShortKind =
'scene' |
'trailer' |
'music' |
'sports' |
'behind-the-scenes' |
'comedy' |
'fan' |
'interview';

export type FeedMode =
'for-you' |
'following' |
'trending' |
'new' |
'ai-picks' |
'near-you' |
'continue-universe';

export type GraphKind =
'title' |
'creator' |
'music' |
'community' |
'product' |
'character' |
'universe' |
'event';

/** One edge of the graph, rendered as "This Short connects to". */
export interface ShortGraphLink {
  id: string;
  kind: GraphKind;
  label: string;
  sub: string;
  image: string;
  to: string;
}

export interface ShortCreator {
  handle: string;
  name: string;
  kind: string;
  followers: string;
  avatar: string;
  bio: string;
  location: string;
  languages: string[];
  verified: boolean;
  to: string;
}

export interface ShortMusicRef {
  trackId: string;
  title: string;
  artist: string;
  artwork: string;
  to: string;
}

export interface ShortProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  to: string;
}

export interface ShortCommunityRef {
  id: string;
  name: string;
  fans: string;
  discussing: string;
  image: string;
  to: string;
  discussTo: string;
}

export interface ShortSports {
  competition: string;
  moment: string;
  score: string;
  matchTo: string;
  highlightsTo: string;
}

/**
 * Rights are a server-side result, never a client-side guess. The UI renders
 * only the actions this object permits and states the reason for the rest.
 */
export interface ShortRights {
  watch: boolean;
  share: boolean;
  download: boolean;
  remix: boolean;
  aiReference: boolean;
  availableRegions: string[];
  restrictionNote: string | null;
  maturity: string;
}

export interface ShortProvenance {
  mode: 'ai-assisted' | 'ai-directed' | 'human';
  lines: {label: string;value: string;}[];
}

export interface ShortCta {
  label: string;
  sub: string;
  to: string;
}

export interface Short {
  id: string;
  slug: string;
  kind: ShortKind;
  poster: string;
  caption: string;
  story: string;
  durationSeconds: number;
  hashtags: string[];
  language: string;
  region: string;
  publishedAgo: string;
  views: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  watchingNow: number | null;
  creator: ShortCreator;
  graph: ShortGraphLink[];
  primaryCta: ShortCta | null;
  music: ShortMusicRef | null;
  products: ShortProduct[];
  community: ShortCommunityRef | null;
  sports: ShortSports | null;
  provenance: ShortProvenance | null;
  rights: ShortRights;
  reason: {short: string;detail: string;};
  modes: FeedMode[];
  spoiler: {note: string;} | null;
  ownedByViewer: boolean;
}

export interface ShortComment {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  body: string;
  likes: number;
  postedAgo: string;
  atSecond: number | null;
  spoiler: boolean;
  fromCreator: boolean;
  pinned: boolean;
  replies: ShortComment[];
}

export interface ShortAnalytics {
  views: string;
  uniqueViewers: string;
  completionRate: string;
  averageWatch: string;
  followersGained: string;
  retentionNote: string;
}

export interface ShortAnswer {
  body: string;
  citations: {label: string;to: string;}[];
  grounded: boolean;
}

export interface RelatedGroup {
  id: string;
  label: string;
  shorts: {id: string;slug: string;poster: string;caption: string;views: string;}[];
}

export type ReportReason =
'copyright' |
'inappropriate' |
'violence' |
'harassment' |
'misleading' |
'spam' |
'technical';

export type DismissReason = 'this-short' | 'this-creator' | 'this-topic' | 'seen-it';