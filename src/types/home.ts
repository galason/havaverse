/**
 * HavaVerse Home — the personalized entrance to the entertainment graph.
 *
 * The homepage is NOT a hardcoded stack of rows. It is assembled at request
 * time from module configuration (owned by the Control Room) resolved against
 * a viewer context (identity, region, behaviour, rights). Adding, reordering,
 * targeting or scheduling a module is a configuration change, never a frontend
 * change.
 */

export type HomeModuleId =
'hero' |
'intent' |
'continue' |
'next' |
'live' |
'sports' |
'foryou' |
'creators' |
'communities' |
'universes' |
'listen' |
'ai-creations' |
'market' |
'experiences' |
'create' |
'welcome';

/** Who a module is for. A module with no audience is for everyone. */
export type HomeAudience =
'anonymous' |
'new' |
'returning' |
'creator' |
'sports' |
'community' |
'listener';

export type RecommendationStrategy =
'editorial' |
'because-you-watched' |
'graph-adjacency' |
'followed-creators' |
'community-signal' |
'regional-trending';

/**
 * A single configured homepage module. This mirrors the Control Room record —
 * the frontend only reads it.
 */
export interface HomeModuleConfig {
  id: HomeModuleId;
  /** Heading rendered above the module. Omitted for chrome-less modules. */
  heading?: string;
  subheading?: string;
  enabled: boolean;
  /** Lower sorts first. */
  position: number;
  /** Empty means every audience. */
  audience: HomeAudience[];
  /** 'all' or a list of ISO country codes. */
  regions: 'all' | string[];
  /** ISO dates. A module outside its window is not returned. */
  startsAt?: string;
  endsAt?: string;
  /** Feature flag gate, evaluated server-side. */
  flag?: string;
  strategy?: RecommendationStrategy;
  /** Where "See all" goes. */
  viewAllTo?: string;
}

/** Why a recommendation was surfaced. Never a black box. */
export interface RecommendationReason {
  short: string;
  detail: string;
}

export type Availability =
{state: 'available';} |
{state: 'premium';label: string;} |
{state: 'ppv';label: string;price: string;} |
{state: 'region-blocked';label: string;} |
{state: 'upcoming';label: string;releases: string;};

export interface HeroSlide {
  id: string;
  kind:
  'continue' |
  'premiere' |
  'recommendation' |
  'live' |
  'creator' |
  'welcome';
  slug?: string;
  eyebrow: string;
  name: string;
  meta: string[];
  logline: string;
  backdrop: string;
  /** Resolved primary action — label plus a real destination. */
  cta: {label: string;to: string;};
  secondary?: {label: string;to: string;};
  availability: Availability;
  creator?: string;
  creatorHandle?: string;
  /** Seconds into the title, when the slide is a resume. */
  resumeAt?: number;
}

export interface ContinueItem {
  id: string;
  slug: string;
  name: string;
  episode?: string;
  poster: string;
  /** 0–100 */
  progress: number;
  remaining: string;
  kind: string;
}

export interface LiveItem {
  id: string;
  name: string;
  category: 'Sports' | 'Music' | 'Podcast' | 'Premiere' | 'Creator' | 'Community';
  meta: string;
  watching?: number;
  image: string;
  to: string;
  state: 'live' | 'upcoming';
  startsIn?: string;
}

export interface SportsItem {
  id: string;
  competition: string;
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  clock?: string;
  kickoff: string;
  live: boolean;
  image: string;
  to: string;
}

export interface Recommendation {
  id: string;
  slug: string;
  name: string;
  poster: string;
  meta: string;
  reason: RecommendationReason;
  availability: Availability;
  strategy: RecommendationStrategy;
}

export interface CreatorActivity {
  id: string;
  creator: string;
  handle: string;
  avatar: string;
  label: string;
  headline: string;
  image: string;
  to: string;
  action: 'Watch' | 'Listen' | 'Explore';
}

export interface CommunityActivity {
  id: string;
  community: string;
  label: string;
  headline: string;
  meta: string;
  image: string;
  to: string;
  cta: string;
}

export interface UniverseSummary {
  id: string;
  name: string;
  blurb: string;
  image: string;
  to: string;
  entries: string[];
}

export interface ListenItem {
  id: string;
  name: string;
  meta: string;
  image: string;
  to: string;
  medium: 'Music' | 'Podcast';
  reason: string;
}

export interface MarketItem {
  id: string;
  name: string;
  price: string;
  image: string;
  to: string;
  from: string;
}

export interface ExperienceItem {
  id: string;
  name: string;
  kind: string;
  when: string;
  where: string;
  image: string;
  to: string;
}

/** The "one chosen move" module — a single decision, not a shelf. */
export interface NextExperience {
  headline: string;
  body: string;
  cta: {label: string;to: string;};
  image: string;
}

/** Everything a resolved module carries. */
export interface HomeModule {
  config: HomeModuleConfig;
  hero?: HeroSlide[];
  continueItems?: ContinueItem[];
  next?: NextExperience;
  live?: LiveItem[];
  sports?: SportsItem[];
  recommendations?: Recommendation[];
  creators?: CreatorActivity[];
  communities?: CommunityActivity[];
  universes?: UniverseSummary[];
  listen?: ListenItem[];
  market?: MarketItem[];
  experiences?: ExperienceItem[];
}

export interface HomeViewerContext {
  signedIn: boolean;
  accountType: 'viewer' | 'creator' | 'both' | null;
  /** ISO country code. Drives regional modules and rights. */
  region: string;
  regionName: string;
  hasHistory: boolean;
  followsCreators: boolean;
  inCommunities: boolean;
  followsSport: boolean;
  listens: boolean;
}

export interface HomeFeed {
  context: HomeViewerContext;
  modules: HomeModule[];
  /** Which audiences matched — surfaced in the rail so targeting is legible. */
  matchedAudiences: HomeAudience[];
}

export interface IntentChip {
  id: string;
  label: string;
  to: string;
}

/** A Hava AI answer that can be acted on, not just read. */
export interface HavaOption {
  id: string;
  name: string;
  meta: string;
  poster?: string;
  to: string;
  cta: string;
}

export interface HavaAnswer {
  body: string;
  options: HavaOption[];
}

export type DismissReason =
'this-title' |
'this-creator' |
'this-genre' |
'already-watched' |
'not-relevant';