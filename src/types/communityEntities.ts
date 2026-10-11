import type { SpoilerLevel } from './community';

/**
 * Community entity model.
 *
 * These are the shapes the UI reads. They intentionally mirror what a real
 * HavaVerse Community service would return, so `services/communityApi.ts` can
 * be swapped from the seeded in-memory store to HTTP without touching any
 * component.
 */

export interface Person {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatar: string;
  bio: string;
  focus: string;
  isCreator: boolean;
  communities: string[];
  followers: string;
  posts: number;
  creations: number;
}

export type DiscussionKind = 'Discussion' | 'Theory' | 'Debate' | 'Review' | 'Question';

export interface Reply {
  id: string;
  authorId: string;
  body: string;
  likes: number;
  timeAgo: string;
  spoilerLevel: SpoilerLevel;
  isCreator?: boolean;
}

export interface Discussion {
  id: string;
  communitySlug: string;
  title: string;
  body: string;
  authorId: string;
  kind: DiscussionKind;
  spoilerLevel: SpoilerLevel;
  timeAgo: string;
  likes: number;
  tags: string[];
  pinned?: boolean;
  replies: Reply[];
}

export type WatchPartyState = 'live' | 'scheduled' | 'ended';
export type WatchPartyVisibility = 'public' | 'community' | 'invite';

export interface WatchPartyRecord {
  id: string;
  title: string;
  description: string;
  contentSlug: string;
  contentTitle: string;
  communitySlug: string;
  hostId: string;
  when: string;
  startsInMinutes: number;
  state: WatchPartyState;
  visibility: WatchPartyVisibility;
  participants: number;
  image: string;
  hostedByUser?: boolean;
}

export interface PartyMessage {
  id: string;
  authorId: string;
  body: string;
  timeAgo: string;
  kind?: 'message' | 'reaction' | 'system';
}

export type EventKind =
'Creator Q&A' |
'Watch party' |
'Live sport' |
'Listening party' |
'Premiere' |
'Community discussion';

export interface CommunityEventRecord {
  id: string;
  name: string;
  kind: EventKind;
  communitySlug: string;
  hostId: string;
  when: string;
  description: string;
  image: string;
  attendees: string;
  state: 'live' | 'upcoming' | 'ended';
  relatedContentSlug?: string;
  watchPartyId?: string;
}

export interface QAQuestion {
  id: string;
  eventId: string;
  authorId: string;
  body: string;
  votes: number;
  answer?: string;
  pinned?: boolean;
}

export type FanCreationKind =
'Fan art' |
'Fan video' |
'Fan edit' |
'Theory' |
'Review' |
'Podcast' |
'Fan story' |
'Music' |
'Analysis';

export interface FanCreationRecord {
  id: string;
  kind: FanCreationKind;
  title: string;
  authorId: string;
  universeId: string;
  communitySlug: string;
  views: string;
  likes: number;
  body: string;
  image?: string;
  icon: string;
}

export interface CharacterRecord {
  id: string;
  name: string;
  universeId: string;
  image: string;
  role: string;
  bio: string;
  appearsIn: {label: string;to: string;}[];
  relationships: {name: string;relation: string;to: string;}[];
  quotes: string[];
}

export interface UniverseNodeRecord {
  id: string;
  label: string;
  kind: 'Film' | 'Book' | 'Character' | 'Music' | 'Behind the scenes' | 'Game' | 'Fan work';
  meta: string;
  to: string;
  official: boolean;
}

export interface UniverseRecord {
  id: string;
  name: string;
  communitySlug: string;
  description: string;
  image: string;
  members: string;
  nodes: UniverseNodeRecord[];
}

export interface PollRecord {
  id: string;
  question: string;
  context: string;
  communitySlug: string;
  kind: 'poll' | 'prediction';
  multiple?: boolean;
  options: {id: string;label: string;share: number;}[];
  participants: number;
  closes: string;
  state: 'open' | 'closed';
  resultNote?: string;
}

/** Achievements are rules evaluated against activity, not hard-coded badges. */
export interface AchievementRule {
  id: string;
  name: string;
  detail: string;
  icon: string;
  metric: 'discussions' | 'replies' | 'partiesHosted' | 'partiesJoined' | 'creations' | 'daysActive';
  threshold: number;
}

export interface ActivityCounters {
  discussions: number;
  replies: number;
  partiesHosted: number;
  partiesJoined: number;
  creations: number;
  daysActive: number;
}

export interface CommunityMembership {
  slug: string;
  joinedAt: string;
  muted: boolean;
  notifications: 'all' | 'highlights' | 'off';
  role: 'Member' | 'Host' | 'Moderator' | 'Owner';
}