export type ContentKind =
'Film' |
'Series' |
'Short' |
'Music' |
'Anime' |
'Live' |
'Podcast' |
'Sports';

export interface ContentTitle {
  id: string;
  slug: string;
  name: string;
  kind: ContentKind;
  badge?: string;
  genre: string;
  runtime: string;
  year: number;
  rating: number;
  maturity: string;
  poster: string;
  backdrop?: string;
  logline: string;
  creator: string;
  creatorHandle: string;
  languages: string[];
  aiAssisted: boolean;
  progress?: number;
}

export interface LiveFixture {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  clock?: string;
  kickoff: string;
  isLive: boolean;
  image: string;
}

export interface HappeningItem {
  id: string;
  label: string;
  labelTone: 'live' | 'trending' | 'new' | 'community';
  title: string;
  meta: string;
  image: string;
}