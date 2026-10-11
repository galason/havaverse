/**
 * Creator Economy — the creator-facing view of money earned on HavaVerse.
 *
 * Every figure here is owned by HavaPay on the server (ledger, clearing,
 * splits, payout state). The client renders what it is given and never
 * computes a settled amount itself.
 */

export type RevenueSourceId =
'subscriptions' |
'memberships' |
'tips' |
'ppv' |
'market' |
'advertising' |
'sponsorships';

/** pending = still inside the clearing window; available = cleared, not yet paid out; paid = moved to a payout. */
export type EarningStatus = 'pending' | 'available' | 'paid';

export interface RevenueSplit {
  /** Percentages of gross; always sum to 100. */
  creator: number;
  rightsHolder: number;
  platform: number;
}

export interface RevenueSourceConfig {
  id: RevenueSourceId;
  label: string;
  description: string;
  split: RevenueSplit;
  /** Days after the sale before the money clears. */
  clearingDays: number;
}

export interface EarningEntry {
  id: string;
  source: RevenueSourceId;
  label: string;
  detail: string;
  titleSlug?: string;
  /** Naira, creator share after the split. */
  net: number;
  period: 'current' | 'previous';
  /** ISO date the money was earned. */
  date: string;
  status: EarningStatus;
  /** ISO date a pending entry clears. */
  clearsOn?: string;
}

export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  members: number;
  joinedThisMonth: number;
  leftThisMonth: number;
  perks: string[];
}

export type PayoutState = 'requested' | 'processing' | 'paid' | 'failed';

export interface PayoutMethod {
  id: string;
  label: string;
  detail: string;
  primary: boolean;
}

export interface Payout {
  id: string;
  amount: number;
  methodId: string;
  destination: string;
  /** ISO timestamp. */
  requestedAt: string;
  state: PayoutState;
  reference: string;
  kind: 'automatic' | 'early';
  note?: string;
}

export interface SourceSummary {
  id: RevenueSourceId;
  label: string;
  current: number;
  previous: number;
  /** Share of this period's earnings, 0–100. */
  share: number;
  /** Percentage change vs last period; null when last period was zero. */
  change: number | null;
}

export interface TitleEarnings {
  slug: string;
  name: string;
  poster: string;
  current: number;
  previous: number;
  /** Published from Studio in this cycle, so it has no earnings history yet. */
  newRelease: boolean;
}

export interface CreatorEconomy {
  account: {displayName: string;username: string;};
  periods: {current: string;previous: string;};
  balances: {
    pending: number;
    /** Cleared earnings not reserved by an open payout request. */
    available: number;
    /** Amount reserved by the open early payout request, if any. */
    reserved: number;
    currentTotal: number;
    previousTotal: number;
    paidThisYear: number;
  };
  nextPayout: {date: string;destination: string;};
  sources: SourceSummary[];
  sourceConfig: RevenueSourceConfig[];
  entries: EarningEntry[];
  tiers: MembershipTier[];
  payouts: Payout[];
  methods: PayoutMethod[];
  titles: TitleEarnings[];
  openPayout: Payout | null;
  minPayout: number;
}

export type EconomyErrorCode = 'not_creator' | 'server_error';

export type EconomyResult<T> = {ok: true;data: T;} | {ok: false;code: EconomyErrorCode;error: string;};