import type { Transaction } from '../data/economy';
import { charge, recordRequest, walletSnapshot } from './havapayLedger';
import { analytics } from './analytics';

/**
 * WALLET API — the boundary between HavaPay surfaces and the ledger service.
 *
 * Production routes this maps onto:
 *   POST /api/havapay/withdrawals        { amountMinor, destinationId }
 *   POST /api/havapay/top-ups            { amountMinor, methodId }
 *   POST /api/havapay/creator-support    { creatorHandle, amountMinor, message }
 *   POST /api/havapay/memberships        { creatorHandle, tierId }
 *   GET  /api/havapay/wallet
 *
 * Balance, limits and settlement are server-owned. Every accepted request is
 * recorded in the HavaPay ledger as pending; the cleared balance never moves
 * on this device. Checks run against what the ledger reports as available,
 * never against a figure the caller passes in.
 */

export type MoneyResult =
{ok: true;data: {reference: string;entry: Transaction;balance: number;};} |
{ok: false;error: string;};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MIN_WITHDRAWAL = 5_000;

function reference(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function naira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export async function requestWithdrawal(amount: number, _balance: number, destination: string): Promise<MoneyResult> {
  await delay(620);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'Enter an amount to withdraw.' };
  if (amount < MIN_WITHDRAWAL) return { ok: false, error: `The minimum withdrawal is ${naira(MIN_WITHDRAWAL)}.` };
  const { available } = walletSnapshot();
  if (amount > available) {
    return { ok: false, error: `That is more than your available ${naira(available)}.` };
  }
  const ref = reference('WD');
  const detail = `${destination} · ${ref}`;
  recordRequest({ id: ref, kind: 'withdrawal', amount, detail, requestedAt: new Date().toISOString() });
  return {
    ok: true,
    data: {
      reference: ref,
      balance: walletSnapshot().available,
      entry: { id: ref, label: 'Withdrawal to bank', detail, date: 'Just now', amount: naira(amount), direction: 'out', status: 'pending' }
    }
  };
}

export async function requestTopUp(amount: number, _balance: number, method: string): Promise<MoneyResult> {
  await delay(560);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'Enter an amount to add.' };
  if (amount > 500_000) return { ok: false, error: 'Single top-ups are capped at ₦500,000.' };
  const ref = reference('TU');
  const detail = `${method} · ${ref}`;
  recordRequest({ id: ref, kind: 'top-up', amount, detail, requestedAt: new Date().toISOString() });
  return {
    ok: true,
    data: {
      reference: ref,
      balance: walletSnapshot().available,
      entry: { id: ref, label: 'Wallet top-up', detail, date: 'Just now', amount: naira(amount), direction: 'in', status: 'pending' }
    }
  };
}

export type IntentResult = {ok: true;data: {reference: string;};} | {ok: false;error: string;};

/**
 * Returns a payment reference and records the tip as held against the wallet
 * until HavaPay settles it and writes the split server-side.
 */
export async function supportCreator(creatorHandle: string, amount: number, _message: string): Promise<IntentResult> {
  await delay(640);
  if (!Number.isFinite(amount) || amount < 100) return { ok: false, error: 'The smallest tip is ₦100.' };
  if (amount > 1_000_000) return { ok: false, error: 'Tips above ₦1,000,000 need to go through HavaPay directly.' };
  const paid = charge({
    kind: 'support',
    amount,
    label: `Support · @${creatorHandle}`,
    detail: 'Creator page',
    prefix: 'SP',
    to: `/creator/${creatorHandle}`
  });
  if (!paid.ok) return paid;
  analytics.emit('support_completed', 'economy', `creator:${creatorHandle}`, { amount });
  return { ok: true, data: { reference: paid.reference } };
}

/** Tier prices are server-owned; the amount recorded here is what the tier page quoted. */
export async function joinMembership(creatorHandle: string, tierId: string, monthlyPrice = 0): Promise<IntentResult> {
  await delay(600);
  if (!tierId) return { ok: false, error: 'Choose a tier to join.' };
  if (monthlyPrice <= 0) return { ok: true, data: { reference: reference('MB') } };
  const paid = charge({
    kind: 'membership',
    amount: monthlyPrice,
    label: `Membership · @${creatorHandle}`,
    detail: `${tierId} · first month`,
    prefix: 'MB',
    to: `/creator/${creatorHandle}`
  });
  return paid.ok ? { ok: true, data: { reference: paid.reference } } : paid;
}

export const walletApi = { requestWithdrawal, requestTopUp, supportCreator, joinMembership };