/**
 * One live or upcoming experience, whatever part of HavaVerse it comes from.
 * The Live service projects each domain's own records into this shape; it
 * never stores a second copy of a match, concert, conversation or event.
 */
export type LiveSource = 'sports' | 'concert' | 'podcast' | 'event' | 'watch-party' | 'premiere';

export type LiveState = 'live' | 'upcoming';

export type LiveAccess = 'free' | 'ticketed' | 'sold-out';

export interface LiveScore {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  clock: string;
}

export interface LiveEntry {
  /** `<namespace>:<source id>` — also the key its reminder is stored under. */
  id: string;
  source: LiveSource;
  state: LiveState;
  /** The domain's own label, e.g. "Concert", "Creator Q&A", "Premier League". */
  kindLabel: string;
  title: string;
  /** Who and where, e.g. "Maya · Muri Okunola Park, Lagos". */
  context: string;
  /** As the source states it: "62'", "Tonight · 8:00 PM", "Sat 26 Apr · 9:00 PM". */
  when: string;
  /** Only when the source reports it — never estimated. */
  audience?: string;
  score?: LiveScore;
  access?: LiveAccess;
  /** Price in naira when ticketed; bought on the source page, not here. */
  price?: number;
  image: string;
  to: string;
}