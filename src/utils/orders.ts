import type {
  FulfilmentKind,
  LineFulfilmentState,
  OrderRecord,
  OrderRecordLine,
  PaymentMethodId,
  PaymentState,
  RefundEligibility } from
'../types/orders';
import type { ProductCategory } from '../types/commerce';

/** Refund window, in days, for physical goods after delivery (or after placement if not yet shipped). */
export const REFUND_WINDOW_DAYS = 14;
/** Flat delivery fee for any order containing shipped goods. The server quotes this. */
export const DELIVERY_FEE = 2_500;

export function fulfilmentFor(category: ProductCategory): FulfilmentKind {
  switch (category) {
    case 'Merchandise':
      return 'shipped';
    case 'Tickets':
      return 'ticket';
    case 'Experiences':
      return 'reservation';
    case 'Creator products':
      return 'contribution';
    default:
      return 'digital';
  }
}

export const paymentLabel: Record<PaymentState, string> = {
  awaiting_confirmation: 'Awaiting HavaPay confirmation',
  settled: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
  partially_refunded: 'Partly refunded'
};

export const lineStateLabel: Record<LineFulfilmentState, string> = {
  awaiting_payment: 'Waiting for payment',
  processing: 'Being prepared',
  shipped: 'On its way',
  delivered: 'Delivered',
  issued: 'In your collection',
  refunded: 'Refunded'
};

export const methodLabel: Record<PaymentMethodId, string> = {
  'havapay-wallet': 'HavaPay wallet',
  'havapay-card': 'Card via HavaPay'
};

const DAY = 86_400_000;

function deliveredAt(order: OrderRecord): string | null {
  const e = order.tracking?.events.find((ev) => /delivered/i.test(ev.label));
  return e ? e.at : null;
}

/**
 * Display-side eligibility. The server re-checks every rule on submission,
 * so this only decides whether to offer the action and explain why not.
 */
export function refundEligibility(order: OrderRecord, line: OrderRecordLine, now = Date.now()): RefundEligibility {
  if (order.refund && order.refund.state !== 'declined') {
    return { eligible: false, reason: 'A refund request is already open on this order.' };
  }
  if (order.payment.state === 'awaiting_confirmation') {
    return { eligible: false, reason: 'Nothing has been charged yet — HavaPay hasn’t confirmed the payment.' };
  }
  if (order.payment.state === 'failed') return { eligible: false, reason: 'This payment failed, so nothing was charged.' };
  if (line.state === 'refunded') return { eligible: false, reason: 'Already refunded.' };
  switch (line.fulfilment) {
    case 'contribution':
      return { eligible: false, reason: 'Creator contributions go straight to the production and aren’t refundable.' };
    case 'digital':
      return { eligible: false, reason: 'Digital items are delivered instantly and can’t be returned.' };
    case 'reservation':
    case 'ticket':
      return { eligible: true };
    case 'shipped':{
        const from = deliveredAt(order) ?? order.placedAt;
        const days = (now - new Date(from).getTime()) / DAY;
        return days <= REFUND_WINDOW_DAYS ?
        { eligible: true } :
        { eligible: false, reason: `The ${REFUND_WINDOW_DAYS}-day return window has closed.` };
      }
  }
}

export function orderHeadline(order: OrderRecord): string {
  if (order.refund?.state === 'requested') return 'Refund requested';
  if (order.payment.state !== 'settled' && order.payment.state !== 'partially_refunded') {
    return paymentLabel[order.payment.state];
  }
  const states = order.lines.map((l) => l.state);
  if (states.includes('shipped')) return 'On its way';
  if (states.includes('processing')) return 'Being prepared';
  if (states.every((s) => s === 'delivered' || s === 'issued')) return 'Complete';
  return paymentLabel[order.payment.state];
}

export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function dateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}