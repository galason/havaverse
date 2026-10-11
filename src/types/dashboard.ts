/**
 * HavaVerse Dashboard — the authenticated personal operating environment.
 *
 * The dashboard owns NO domain data. Every module below is composed at request
 * time from the services that already own the truth (director, community,
 * watch, economy, identity). These types describe the *composition*, not a
 * second copy of the platform's state.
 *
 * Module inclusion follows the same manifest pattern as the homepage: a
 * configuration record decides whether a module exists for this viewer, and the
 * Control Room is expected to own that record in production. Nothing about
 * ordering, audience or capability gating is hardcoded in the page.
 */

export type DashboardModuleId =
'pulse' |
'command' |
'my-day' |
'activity' |
'continue' |
'creative-universe' |
'ai-production' |
'creator-pulse' |
'economy-pulse' |
'community-pulse' |
'library-pulse' |
'up-next' |
'insights';

/**
 * Audience tags are derived from the viewer, never asserted by the page.
 * `creator` is derived from effective capabilities, not from a role string.
 */
export type DashboardAudience =
'everyone' |
'new' |
'returning' |
'creator' |
'in-production' |
'in-communities' |
'has-economy';

export interface DashboardModuleConfig {
  id: DashboardModuleId;
  heading?: string;
  subheading?: string;
  enabled: boolean;
  position: number;
  /** Empty means "no audience restriction". */
  audience: DashboardAudience[];
  /** Effective capability required to see this module at all. */
  requires?: string;
  regions: 'all' | string[];
  startsAt?: string;
  endsAt?: string;
  flag?: string;
  /** Which column the module occupies on desktop. */
  slot: 'main' | 'rail';
}

export interface DashboardViewerContext {
  signedIn: boolean;
  displayName: string;
  accountType: string;
  capabilities: string[];
  region: string;
  /** 0-23, drives the greeting. */
  hour: number;
  hasProjects: boolean;
  hasHistory: boolean;
  inCommunities: boolean;
}

/* ---------------------------------------------------------------- modules */

export type PulseTone = 'attention' | 'running' | 'community' | 'audience' | 'progress' | 'time';

export interface PulseSignal {
  id: string;
  tone: PulseTone;
  /** The number that carries the signal, when there is one. */
  value?: string;
  label: string;
  detail?: string;
  to: string;
  live?: boolean;
}

export type DayCardKind =
'review' |
'ai-complete' |
'upcoming' |
'blocked' |
'community' |
'economy' |
'security';

export interface DayCard {
  id: string;
  kind: DayCardKind;
  title: string;
  detail: string;
  image?: string;
  actionLabel: string;
  to: string;
}

export type ActivityKind =
'ai' |
'community' |
'library' |
'publish' |
'follow' |
'economy' |
'audience';

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  text: string;
  /** Epoch ms. Rendered as a relative label so it keeps moving. */
  at: number;
  to: string;
  image?: string;
  unread?: boolean;
}

export type ContinueKind = 'creating' | 'watching' | 'listening' | 'participating';

export interface ContinueItem {
  id: string;
  kind: ContinueKind;
  title: string;
  detail: string;
  /** 0-100. */
  progress: number;
  badge?: string;
  to: string;
  image?: string;
}

export interface UniverseStat {
  label: string;
  value: string;
}

export interface UniverseNode {
  label: string;
  to: string;
  /** Nodes with nothing behind them yet are stated, never faked. */
  ready: boolean;
}

export interface CreativeUniverse {
  projectId: string;
  title: string;
  format: string;
  stage: string;
  progress: number;
  poster: string;
  stats: UniverseStat[];
  nodes: UniverseNode[];
  continueTo: string;
  universeTo: string;
}

export type ProductionJobState =
'queued' |
'understanding' |
'planning' |
'generating' |
'validating' |
'finalizing' |
'completed' |
'failed';

export interface ProductionJobView {
  id: string;
  project: string;
  label: string;
  state: ProductionJobState;
  /** 0-1. */
  progress: number;
  detail: string;
  to: string;
  failed?: boolean;
}

export interface CreatorPulse {
  followers: string;
  views: string;
  watchTime: string;
  growth: string;
  latestTitle: string;
  latestState: string;
  latestTo: string;
}

export interface EconomyPulse {
  /** Formatted by the service so the client never derives authoritative money. */
  available: string;
  pending: string;
  thisMonth: string;
  lastLabel: string;
  lastAmount: string;
  lastDirection: 'in' | 'out';
  /** Viewers see spend, creators additionally see earnings. */
  mode: 'consumer' | 'creator';
}

export interface CommunitySignal {
  id: string;
  name: string;
  detail: string;
  count?: number;
  live?: boolean;
  avatar: string;
  to: string;
}

export interface LibraryPulse {
  saved: number;
  following: number;
  collected: number;
  downloads: number;
  recentLabel: string;
  recentTo: string;
}

export interface UpcomingItem {
  id: string;
  when: string;
  dayLabel: string;
  title: string;
  detail: string;
  image?: string;
  to: string;
  imminent?: boolean;
}

export interface Insight {
  id: string;
  text: string;
  actionLabel: string;
  to: string;
}

/* ------------------------------------------------------------- envelopes */

export type DashboardModule =
{id: 'pulse';config: DashboardModuleConfig;signals: PulseSignal[];} |
{id: 'command';config: DashboardModuleConfig;prompts: string[];} |
{id: 'my-day';config: DashboardModuleConfig;cards: DayCard[];} |
{id: 'activity';config: DashboardModuleConfig;events: ActivityEvent[];} |
{id: 'continue';config: DashboardModuleConfig;items: ContinueItem[];} |
{id: 'creative-universe';config: DashboardModuleConfig;universe: CreativeUniverse;} |
{id: 'ai-production';config: DashboardModuleConfig;jobs: ProductionJobView[];} |
{id: 'creator-pulse';config: DashboardModuleConfig;pulse: CreatorPulse;} |
{id: 'economy-pulse';config: DashboardModuleConfig;economy: EconomyPulse;} |
{id: 'community-pulse';config: DashboardModuleConfig;signals: CommunitySignal[];} |
{id: 'library-pulse';config: DashboardModuleConfig;library: LibraryPulse;} |
{id: 'up-next';config: DashboardModuleConfig;items: UpcomingItem[];} |
{id: 'insights';config: DashboardModuleConfig;insights: Insight[];};

export interface DashboardFeed {
  context: DashboardViewerContext;
  greeting: string;
  /** Which audience tags this viewer matched — surfaced for transparency. */
  matchedAudiences: DashboardAudience[];
  modules: DashboardModule[];
}

/**
 * Hava AI on the dashboard can propose consequential operations. It never
 * performs one without an explicit confirmation step, so an answer carries the
 * proposal rather than a completed action.
 */
export interface CommandProposal {
  summary: string;
  lines: {label: string;value: string;}[];
  confirmLabel: string;
  to: string;
}

export interface CommandAnswer {
  text: string;
  links: {label: string;to: string;}[];
  proposal?: CommandProposal;
}