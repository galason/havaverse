import type {
  CreatorEconomy,
  EconomyResult,
  Payout,
  SourceSummary,
  TitleEarnings } from
'../types/creatorEconomy';
import {
  earningEntries,
  membershipTiers,
  minPayout,
  nextAutomaticPayout,
  payoutHistory,
  payoutMethods,
  periodLabels,
  sourceConfig } from
'../data/creatorEconomy';
import { titles } from '../data/catalog';
import { releaseRegistry } from './releaseRegistry';
import { notificationBus } from './notificationBus';
import { analytics } from './analytics';
import { readJSON, writeJSON } from '../utils/storage';

/**
 * CREATOR ECONOMY API — the boundary between the creator's economy workspace
 * and HavaPay.
 *
 * Production routes this maps onto:
 *   GET    /api/creator/economy            -> balances, sources, ledger, tiers, titles
 *   GET    /api/creator/payouts            -> payout history + open request
 *   POST   /api/creator/payouts            -> { amountMinor, methodId } early payout request
 *   DELETE /api/creator/payouts/:id        -> cancel a request still in 'requested'
 *
 * Clearing, splits, ledger entries and payout state are decided by HavaPay on
 * the server. This stand-in reads a seed and keeps payout requests on this
 * device; it never marks a payout as paid and never moves money.
 */

interface ViewerContext {
  capabilities: string[];
  displayName: string;
  username: string;
}

const STORAGE_KEY = 'hv.creator-economy.payouts.v1';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isPayoutList = (v: unknown): v is Payout[] =>
Array.isArray(v) && v.every((p) => p && typeof p === 'object' && typeof (p as Payout).id === 'string');

function requested(): Payout[] {
  return readJSON<Payout[]>(STORAGE_KEY, [], isPayoutList);
}

function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

function buildSources(): SourceSummary[] {
  const currentTotal = sum(earningEntries.filter((e) => e.period === 'current').map((e) => e.net));
  return sourceConfig.map((cfg) => {
    const current = sum(earningEntries.filter((e) => e.source === cfg.id && e.period === 'current').map((e) => e.net));
    const previous = sum(earningEntries.filter((e) => e.source === cfg.id && e.period === 'previous').map((e) => e.net));
    return {
      id: cfg.id,
      label: cfg.label,
      current,
      previous,
      share: currentTotal ? Math.round(current / currentTotal * 100) : 0,
      change: previous ? Math.round((current - previous) / previous * 100) : null
    };
  });
}

function buildTitles(): TitleEarnings[] {
  const bySlug = new Map<string, TitleEarnings>();
  for (const e of earningEntries) {
    if (!e.titleSlug) continue;
    const t = titles.find((x) => x.slug === e.titleSlug);
    if (!t) continue;
    const row = bySlug.get(e.titleSlug) ?? {
      slug: t.slug,
      name: t.name,
      poster: t.poster,
      current: 0,
      previous: 0,
      newRelease: false
    };
    if (e.period === 'current') row.current += e.net;else
    row.previous += e.net;
    bySlug.set(e.titleSlug, row);
  }
  // Titles published from Studio show up immediately, honestly at zero.
  for (const t of releaseRegistry.discoverableTitles()) {
    if (bySlug.has(t.slug)) continue;
    bySlug.set(t.slug, { slug: t.slug, name: t.name, poster: t.poster, current: 0, previous: 0, newRelease: true });
  }
  return [...bySlug.values()].sort((a, b) => b.current - a.current);
}

function assemble(ctx: ViewerContext): CreatorEconomy {
  const current = earningEntries.filter((e) => e.period === 'current');
  const cleared = sum(current.filter((e) => e.status === 'available').map((e) => e.net));
  const pending = sum(current.filter((e) => e.status === 'pending').map((e) => e.net));
  const local = requested();
  const open = local.find((p) => p.state === 'requested' || p.state === 'processing') ?? null;
  const reserved = open ? open.amount : 0;
  const payouts = [...local, ...payoutHistory].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  const primary = payoutMethods.find((m) => m.primary) ?? payoutMethods[0];

  return {
    account: { displayName: ctx.displayName, username: ctx.username },
    periods: periodLabels,
    balances: {
      pending,
      available: Math.max(0, cleared - reserved),
      reserved,
      currentTotal: sum(current.map((e) => e.net)),
      previousTotal: sum(earningEntries.filter((e) => e.period === 'previous').map((e) => e.net)),
      paidThisYear: sum(payoutHistory.filter((p) => p.state === 'paid' && p.requestedAt.startsWith('2026')).map((p) => p.amount))
    },
    nextPayout: { date: nextAutomaticPayout, destination: primary.label },
    sources: buildSources(),
    sourceConfig,
    entries: [...earningEntries].sort((a, b) => b.date.localeCompare(a.date)),
    tiers: membershipTiers,
    payouts,
    methods: payoutMethods,
    titles: buildTitles(),
    openPayout: open,
    minPayout
  };
}

async function getEconomy(ctx: ViewerContext): Promise<EconomyResult<CreatorEconomy>> {
  await delay(320);
  // Capability, not role: anyone the identity service grants `monetize` has an economy.
  if (!ctx.capabilities.includes('monetize')) {
    return { ok: false, code: 'not_creator', error: 'Creator earnings need a creator account.' };
  }
  return { ok: true, data: assemble(ctx) };
}

async function requestPayout(
ctx: ViewerContext,
amount: number,
methodId: string)
: Promise<EconomyResult<Payout>> {
  await delay(420);
  if (!ctx.capabilities.includes('monetize')) {
    return { ok: false, code: 'not_creator', error: 'Creator earnings need a creator account.' };
  }
  const economy = assemble(ctx);
  if (economy.openPayout) {
    return { ok: false, code: 'server_error', error: 'You already have a payout request in progress.' };
  }
  if (!Number.isFinite(amount) || amount < minPayout) {
    return { ok: false, code: 'server_error', error: `The minimum payout is ₦${minPayout.toLocaleString('en-NG')}.` };
  }
  if (amount > economy.balances.available) {
    return { ok: false, code: 'server_error', error: 'That is more than your cleared earnings.' };
  }
  const method = payoutMethods.find((m) => m.id === methodId);
  if (!method) return { ok: false, code: 'server_error', error: 'Choose where the payout should go.' };

  const payout: Payout = {
    id: `po-${Date.now().toString(36)}`,
    amount,
    methodId,
    destination: method.id === 'wallet' ? method.label : `${method.label} ${method.detail.split(' · ')[0]}`,
    requestedAt: new Date().toISOString(),
    state: 'requested',
    reference: `PO-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    kind: 'early',
    note: 'Early payout of cleared earnings'
  };
  writeJSON(STORAGE_KEY, [payout, ...requested()]);
  notificationBus.deliver({
    kind: 'economy',
    title: 'Payout requested',
    body: `₦${amount.toLocaleString('en-NG')} to ${payout.destination}. HavaPay confirms when it is sent.`,
    to: '/creator/economy?tab=payouts'
  });
  analytics.emit('payout_requested', 'economy', undefined, { amount, method: methodId });
  return { ok: true, data: payout };
}

async function cancelPayout(id: string): Promise<EconomyResult<true>> {
  await delay(260);
  const list = requested();
  const target = list.find((p) => p.id === id);
  if (!target) return { ok: false, code: 'server_error', error: 'That payout request no longer exists.' };
  if (target.state !== 'requested') {
    return { ok: false, code: 'server_error', error: 'This payout is already being processed and can’t be cancelled.' };
  }
  writeJSON(STORAGE_KEY, list.filter((p) => p.id !== id));
  return { ok: true, data: true };
}

/** Payout requests HavaPay hasn't paid yet — the wallet shows those sent to it as on their way. */
function openPayouts(): Payout[] {
  return requested().filter((p) => p.state === 'requested' || p.state === 'processing');
}

export const creatorEconomyApi = { getEconomy, requestPayout, cancelPayout, openPayouts };