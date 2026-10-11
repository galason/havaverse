/** Every community in HavaVerse has an entertainment object at its centre. */
export type CommunityAnchor =
'Film' |
'Series' |
'Creator' |
'Character' |
'Sport' |
'Team' |
'Competition' |
'Music' |
'Podcast' |
'Story universe' |
'Event';

export type CommunityCategory =
'For you' |
'Trending' |
'Live now' |
'Films' |
'Series' |
'Sports' |
'Music' |
'Creators' |
'Anime' |
'Podcasts' |
'Gaming' |
'Stories & Worlds';

export interface CommunitySummary {
  slug: string;
  name: string;
  anchor: CommunityAnchor;
  anchorLabel: string;
  categories: CommunityCategory[];
  members: string;
  online: string;
  image: string;
  description: string;
  joined?: boolean;
  liveNow?: boolean;
}

export interface ActivityCard {
  id: string;
  title: string;
  meta: string;
  image: string;
  to: string;
  live?: boolean;
}

export type SpoilerLevel = 'safe' | 'current' | 'full';

export interface Conversation {
  id: string;
  quote: string;
  community: string;
  communitySlug: string;
  kind: 'Discussion' | 'Theory' | 'Debate' | 'Review';
  replies: string;
  likes: string;
  image: string;
  spoilerLevel: SpoilerLevel;
}

export interface WatchParty {
  id: string;
  title: string;
  subtitle: string;
  when: string;
  image: string;
  attending: string;
  state: 'live' | 'soon' | 'scheduled';
}

export interface CommunityEvent {
  id: string;
  name: string;
  community: string;
  time: string;
  action: 'Join' | 'Remind me';
  image: string;
}

export interface CreatorPresence {
  id: string;
  name: string;
  avatar: string;
  status: string;
  note: string;
  action: string;
  live?: boolean;
  watching?: string;
}

export interface FanCreation {
  id: string;
  kind: string;
  title: string;
  author: string;
  views: string;
  image?: string;
  icon: string;
}

export interface PollOption {
  id: string;
  label: string;
  share: number;
}

export interface CommunityPoll {
  id: string;
  question: string;
  context: string;
  kind: 'prediction' | 'poll';
  options: PollOption[];
  votes: string;
}

export interface CommunityPerson {
  id: string;
  name: string;
  role: string;
  avatar: string;
  focus: string;
}