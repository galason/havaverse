import { readJSON, writeJSON } from '../utils/storage';
import { openingBalance, transactions as history } from '../data/economy';
import { ordersApi } from './ordersApi';
import { creatorEconomyApi } from './creatorEconomyApi';
import type { OrderRecord } from '../types/orders';

/* -------------------------------------------------------------------------- *
 * HavaPay ledger — the one place the Wallet reads money movements from
 * -------------------------------------------------------------------------- *
 * Production:
 *   GET /api/havapay/wallet   -> { clearedMinor, heldMinor, incomingMinor, entries[] }
 *
 * The server owns the balance. This stand-in never changes the cleared figure:
 * it only projects the records other services already own (Market orders and
 * refunds, creator payouts, wallet requests, tips, memberships) and works out
 * what is HELD against the cleared balance by payments still awaiting HavaPay.
 *
 *   available = cleared − held
 *
 * Nothing incoming counts toward available until HavaPay settles it.
 * -------------------------------------------------------------------------- */

export type LedgerSource =
'history' |
'wallet' |
'market' |
'purchase' |
'refund' |
'payout' |
'support' |
'membership';

/** How a pending entry affects what the user can spend right now. */
export type LedgerEffect = 'held' | 'incoming' | 'none';

export interface LedgerEntry {
  id: string;
  label: string;
  detail: string;
  amount: number;
  direction: 'in' | 'out';
  status: 'settled' | 'pending' | 'failed';
  /** Human status shown in the ledger ("Awaiting confirmation", "Under review"…). */
  statusLabel: string;
  /** ISO time for entries recorded on this device; history entries carry a label only. */
  at?: string;
  dateLabel: string;
  source: LedgerSource;
  effect: LedgerEffect;
  /** Where the underlying record lives. */
  to?: string;
}

export interface WalletSnapshot {
  cleared: number;
  held: number;
  incoming: number;
  available: number;
  entries: LedgerEntry[];
}

export type RequestKind = 'withdrawal' | 'top-up' | 'support' | 'membership' | 'purchase' | 'ticket' | 'unlock';

/** Kinds that spend from the wallet on behalf of another HavaVerse surface. */
export type ChargeKind = Exclude<RequestKind, 'withdrawal' | 'top-up'>;

interface WalletRequest {
  id: string;
  kind: RequestKind;
  amount: number;
  detail: string;
  requestedAt: string;
  /** Specific label ("Support · Tomi Vale"); falls back to the kind's generic label. */
  label?: string;
  to?: string;
}

const KEY = 'hv.havapay.requests.v1';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isRequestList = (v: unknown): v is WalletRequest[] =>
Array.isArray(v) && v.every((r) => r && typeof r === 'object' && typeof (r as WalletRequest).id === 'string');

function requests(): WalletRequest[] {
  return readJSON<WalletRequest[]>(KEY, [], isRequestList);
}

/** POST equivalent: records a movement HavaPay has accepted but not yet settled. */
export function recordRequest(request: WalletRequest) {
  writeJSON(KEY, [request, ...requests().filter((r) => r.id !== request.id)]);
}

const requestCopy: Record<RequestKind, {label: string;direction: 'in' | 'out';source: LedgerSource;}> = {
  withdrawal: { label: 'Withdrawal to bank', direction: 'out', source: 'wallet' },
  'top-up': { label: 'Wallet top-up', direction: 'in', source: 'wallet' },
  support: { label: 'Creator support', direction: 'out', source: 'support' },
  membership: { label: 'Membership', direction: 'out', source: 'membership' },
  purchase: { label: 'Purchase', direction: 'out', source: 'purchase' },
  ticket: { label: 'Ticket', direction: 'out', source: 'purchase' },
  unlock: { label: 'Pay-per-view unlock', direction: 'out', source: 'purchase' }
};

export type ChargeResult = {ok: true;reference: string;} | {ok: false;error: string;};

/**
 * POST /api/havapay/charges — the one way any HavaVerse surface (Watch, Shorts,
 * Music, Podcast, Market passes) spends from the wallet.
 *
 * Checks the amount against what the ledger reports as available, never a
 * figure the caller passes in, then records the charge as HELD until HavaPay
 * settles it and writes the creator split server-side.
 */
export function charge(input: {
  kind: ChargeKind;
  amount: number;
  label: string;
  detail: string;
  prefix: string;
  to?: string;
}): ChargeResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) return { ok: false, error: 'Choose an amount first.' };
  const { available } = walletSnapshot();
  if (input.amount > available) {
    return {
      ok: false,
      error: `Your wallet has ₦${available.toLocaleString('en-NG')} available. Top up in Wallet to continue.`
    };
  }
  const reference = `${input.prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  recordRequest({
    id: reference,
    kind: input.kind,
    amount: input.amount,
    label: input.label,
    detail: `${input.detail} · ${reference}`,
    requestedAt: new Date().toISOString(),
    to: input.to
  });
  return { ok: true, reference };
}

function fromRequest(r: WalletRequest): LedgerEntry {
  const copy = requestCopy[r.kind];
  return {
    id: r.id,
    label: r.label ?? copy.label,
    detail: r.detail,
    amount: r.amount,
    direction: copy.direction,
    status: 'pending',
    statusLabel: copy.direction === 'in' ? 'On its way' : 'Awaiting confirmation',
    at: r.requestedAt,
    dateLabel: '',
    source: copy.source,
    effect: copy.direction === 'in' ? 'incoming' : 'held',
    to: r.to
  };
}

function fromOrder(o: OrderRecord): LedgerEntry[] {
  const fromWallet = o.payment.method === 'havapay-wallet';
  const pending = o.payment.state === 'awaiting_confirmation';
  const entries: LedgerEntry[] = [
  {
    id: `order-${o.id}`,
    label: `Market order ${o.id}`,
    detail: `${o.lines.length} item${o.lines.length === 1 ? '' : 's'} · ${fromWallet ? 'from wallet' : 'card via HavaPay'} · ${o.payment.reference}`,
    amount: o.total,
    direction: 'out',
    status: pending ? 'pending' : o.payment.state === 'failed' ? 'failed' : 'settled',
    statusLabel: pending ? 'Awaiting confirmation' : o.payment.state === 'failed' ? 'Failed' : 'Settled',
    at: o.placedAt,
    dateLabel: '',
    source: 'market',
    // Card payments never touch the wallet balance.
    effect: pending && fromWallet ? 'held' : 'none',
    to: `/market/orders/${o.id}`
  }];

  if (o.refund) {
    const r = o.refund;
    entries.push({
      id: `refund-${r.id}`,
      label: `Refund · ${o.id}`,
      detail: `${fromWallet ? 'Back to wallet' : 'Back to card'} · ${r.id}`,
      amount: r.amount,
      direction: 'in',
      status: r.state === 'declined' ? 'failed' : 'pending',
      statusLabel: r.state === 'requested' ? 'Under review' : r.state === 'approved' ? 'Approved · on its way' : 'Declined',
      at: r.requestedAt,
      dateLabel: '',
      source: 'refund',
      // A refund under review is not money on its way yet.
      effect: r.state === 'approved' && fromWallet ? 'incoming' : 'none',
      to: `/market/orders/${o.id}`
    });
  }
  return entries;
}

function fromHistory(): LedgerEntry[] {
  return history.map((t) => ({
    id: t.id,
    label: t.label,
    detail: t.detail,
    amount: Number(t.amount.replace(/[^\d]/g, '') || 0),
    direction: t.direction,
    status: t.status,
    statusLabel: t.status === 'pending' ? t.direction === 'in' ? 'On its way' : 'Pending' : t.status === 'failed' ? 'Failed' : 'Settled',
    dateLabel: t.date,
    source: 'history' as const,
    // Settled history is already inside the cleared balance.
    effect: t.status === 'pending' && t.direction === 'in' ? 'incoming' as const : 'none' as const
  }));
}

/** Synchronous projection, used by the Wallet, checkout and the dashboard alike. */
export function walletSnapshot(): WalletSnapshot {
  const recorded: LedgerEntry[] = [
  ...requests().map(fromRequest),
  ...ordersApi.placedOnDevice().flatMap(fromOrder),
  ...ordersApi.refundsOnHistory().flatMap((o) => fromOrder(o).filter((e) => e.source === 'refund')),
  ...creatorEconomyApi.
  openPayouts().
  filter((p) => p.methodId === 'wallet').
  map<LedgerEntry>((p) => ({
    id: `payout-${p.id}`,
    label: 'Creator payout',
    detail: `Early payout · ${p.reference}`,
    amount: p.amount,
    direction: 'in',
    status: 'pending',
    statusLabel: p.state === 'processing' ? 'Processing' : 'Requested',
    at: p.requestedAt,
    dateLabel: '',
    source: 'payout',
    effect: 'incoming',
    to: '/creator/economy?tab=payouts'
  }))].
  sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''));

  const entries = [...recorded, ...fromHistory()];
  const held = entries.filter((e) => e.effect === 'held').reduce((s, e) => s + e.amount, 0);
  const incoming = entries.filter((e) => e.effect === 'incoming').reduce((s, e) => s + e.amount, 0);
  return {
    cleared: openingBalance,
    held,
    incoming,
    available: Math.max(0, openingBalance - held),
    entries
  };
}

export async function getWallet(): Promise<{ok: true;data: WalletSnapshot;} | {ok: false;error: string;}> {
  await delay(360);
  try {
    return { ok: true, data: walletSnapshot() };
  } catch {
    return { ok: false, error: 'HavaPay did not respond. Try again.' };
  }
}

export const havapayLedger = { getWallet, walletSnapshot, recordRequest, charge };