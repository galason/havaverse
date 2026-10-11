import type {
  EarningEntry,
  MembershipTier,
  Payout,
  PayoutMethod,
  RevenueSourceConfig } from
'../types/creatorEconomy';

/**
 * Seed for the creator economy stand-in. Last period's per-source totals match
 * the Wallet's "Where earnings came from" (₦412,800, paid out 1 Sep), so the
 * two surfaces tell the same story.
 */

export const periodLabels = { current: 'September · to date', previous: 'August' };

export const nextAutomaticPayout = '2026-10-01';

export const minPayout = 5_000;

export const sourceConfig: RevenueSourceConfig[] = [
{
  id: 'subscriptions',
  label: 'Subscription share',
  description: 'Your share of the subscription pool, by minutes watched on your titles.',
  split: { creator: 55, rightsHolder: 0, platform: 45 },
  clearingDays: 7
},
{
  id: 'memberships',
  label: 'Memberships',
  description: 'Monthly fan memberships to your tiers.',
  split: { creator: 80, rightsHolder: 0, platform: 20 },
  clearingDays: 7
},
{
  id: 'tips',
  label: 'Tips',
  description: 'Direct support from viewers, during playback and watch parties.',
  split: { creator: 90, rightsHolder: 0, platform: 10 },
  clearingDays: 7
},
{
  id: 'ppv',
  label: 'Pay-per-view',
  description: 'Tickets for premieres and one-off screenings.',
  split: { creator: 70, rightsHolder: 0, platform: 30 },
  clearingDays: 7
},
{
  id: 'market',
  label: 'HavaMarket',
  description: 'Products from your universe. Rights holders are paid their share first.',
  split: { creator: 60, rightsHolder: 25, platform: 15 },
  clearingDays: 14
},
{
  id: 'advertising',
  label: 'Advertising',
  description: 'Ad revenue on free, ad-supported plays of your titles.',
  split: { creator: 50, rightsHolder: 0, platform: 50 },
  clearingDays: 30
},
{
  id: 'sponsorships',
  label: 'Sponsorships',
  description: 'Brand deals agreed through HavaVerse.',
  split: { creator: 90, rightsHolder: 0, platform: 10 },
  clearingDays: 14
}];


export const earningEntries: EarningEntry[] = [
// September — individual ledger entries.
{ id: 'e1', source: 'subscriptions', label: 'Subscription share', detail: 'The Last Train · 1–15 Sep', titleSlug: 'the-last-train', net: 98_200, period: 'current', date: '2026-09-15', status: 'available' },
{ id: 'e2', source: 'subscriptions', label: 'Subscription share', detail: 'The Last Train · 16–25 Sep', titleSlug: 'the-last-train', net: 71_600, period: 'current', date: '2026-09-25', status: 'pending', clearsOn: '2026-10-02' },
{ id: 'e3', source: 'memberships', label: 'Crew renewals', detail: '18 members · monthly', net: 54_000, period: 'current', date: '2026-09-01', status: 'available' },
{ id: 'e4', source: 'memberships', label: "Director's Circle renewals", detail: '4 members · monthly', net: 42_000, period: 'current', date: '2026-09-01', status: 'available' },
{ id: 'e5', source: 'memberships', label: 'New members', detail: '11 joins across tiers', net: 16_500, period: 'current', date: '2026-09-23', status: 'pending', clearsOn: '2026-09-30' },
{ id: 'e6', source: 'tips', label: 'Premiere night tips', detail: 'The Last Train · 214 tips', titleSlug: 'the-last-train', net: 24_300, period: 'current', date: '2026-09-12', status: 'available' },
{ id: 'e7', source: 'tips', label: 'Watch party tips', detail: 'The Last Train · 63 tips', titleSlug: 'the-last-train', net: 18_400, period: 'current', date: '2026-09-20', status: 'pending', clearsOn: '2026-09-27' },
{ id: 'e8', source: 'tips', label: 'Tips during playback', detail: 'The Last Train · 41 tips', titleSlug: 'the-last-train', net: 9_100, period: 'current', date: '2026-09-22', status: 'pending', clearsOn: '2026-09-29' },
{ id: 'e9', source: 'ppv', label: 'Premiere screening tickets', detail: "Director's commentary cut · 157 tickets", titleSlug: 'the-last-train', net: 27_500, period: 'current', date: '2026-09-06', status: 'available' },
{ id: 'e10', source: 'market', label: 'Railway universe store', detail: '38 orders · inside returns window', net: 21_300, period: 'current', date: '2026-09-21', status: 'pending', clearsOn: '2026-10-05' },
{ id: 'e11', source: 'advertising', label: 'Ad-supported plays', detail: 'The Last Train · free tier', titleSlug: 'the-last-train', net: 8_700, period: 'current', date: '2026-09-24', status: 'pending', clearsOn: '2026-10-24' },

// August — settled per-source totals, paid out on 1 Sep.
{ id: 'a1', source: 'subscriptions', label: 'Subscription share', detail: 'The Last Train · August', titleSlug: 'the-last-train', net: 186_400, period: 'previous', date: '2026-08-31', status: 'paid' },
{ id: 'a2', source: 'memberships', label: 'Memberships', detail: 'All tiers · August', net: 112_000, period: 'previous', date: '2026-08-31', status: 'paid' },
{ id: 'a3', source: 'tips', label: 'Tips', detail: 'The Last Train · August', titleSlug: 'the-last-train', net: 61_200, period: 'previous', date: '2026-08-31', status: 'paid' },
{ id: 'a4', source: 'market', label: 'HavaMarket', detail: 'Railway universe store · August', net: 33_900, period: 'previous', date: '2026-08-31', status: 'paid' },
{ id: 'a5', source: 'advertising', label: 'Advertising', detail: 'The Last Train · August', titleSlug: 'the-last-train', net: 19_300, period: 'previous', date: '2026-08-31', status: 'paid' }];


export const membershipTiers: MembershipTier[] = [
{
  id: 'supporter',
  name: 'Supporter',
  price: 1_000,
  members: 48,
  joinedThisMonth: 7,
  leftThisMonth: 2,
  perks: ['Name in the credits roll', 'Members-only community channel']
},
{
  id: 'crew',
  name: 'Crew',
  price: 3_000,
  members: 22,
  joinedThisMonth: 3,
  leftThisMonth: 1,
  perks: ['Everything in Supporter', 'Production diaries', 'Early screenings']
},
{
  id: 'directors-circle',
  name: "Director's Circle",
  price: 10_500,
  members: 5,
  joinedThisMonth: 1,
  leftThisMonth: 0,
  perks: ['Everything in Crew', 'Monthly live Q&A', 'Signed Railway edition']
}];


export const payoutMethods: PayoutMethod[] = [
{ id: 'wallet', label: 'HavaPay wallet', detail: 'Instant · withdraw to bank from Wallet', primary: true },
{ id: 'gtbank', label: 'GTBank', detail: 'Current account ••4417 · 1–2 working days', primary: false }];


export const payoutHistory: Payout[] = [
{ id: 'po-0901', amount: 412_800, methodId: 'wallet', destination: 'HavaPay wallet', requestedAt: '2026-09-01T06:00:00Z', state: 'paid', reference: 'PO-26-0901', kind: 'automatic', note: 'August earnings' },
{ id: 'po-0801', amount: 356_900, methodId: 'wallet', destination: 'HavaPay wallet', requestedAt: '2026-08-01T06:00:00Z', state: 'paid', reference: 'PO-26-0801', kind: 'automatic', note: 'July earnings' },
{ id: 'po-0701', amount: 298_450, methodId: 'wallet', destination: 'HavaPay wallet', requestedAt: '2026-07-01T06:00:00Z', state: 'paid', reference: 'PO-26-0701', kind: 'automatic', note: 'June earnings' }];