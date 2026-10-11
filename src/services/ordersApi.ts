import { delay } from '../utils/validation';
import { readJSON, writeJSON } from '../utils/storage';
import { analytics } from './analytics';
import { notificationBus } from './notificationBus';
import { walletSnapshot } from './havapayLedger';
import { marketProducts, ownedProductIds } from '../data/commerce';
import { seededOrders } from '../data/orders';
import { DELIVERY_FEE, fulfilmentFor, refundEligibility } from '../utils/orders';
import type { CheckoutOptions, OrderRecord, OrderRecordLine, RefundRequest } from '../types/orders';

/* -------------------------------------------------------------------------- *
 * HavaVerse Market — orders service boundary
 * -------------------------------------------------------------------------- *
 * The single owner of order records. The server is authoritative for price,
 * delivery fee, payment state, fulfilment, entitlement and refund decisions;
 * this stand-in re-computes prices from the catalogue (never trusting what the
 * bag sent) and NEVER marks a payment settled or a refund approved itself.
 *
 *   GET    /api/market/orders                      listOrders
 *   GET    /api/market/orders/:id                  getOrder
 *   POST   /api/market/orders                      placeOrder
 *   POST   /api/market/orders/:id/refund           requestRefund
 *   DELETE /api/market/orders/:id/refund           withdrawRefund
 *   GET    /api/market/collection                  ownedProducts
 * -------------------------------------------------------------------------- */

export type OrderResult<T> = {ok: true;data: T;} | {ok: false;error: string;};

interface BagLine {
  productId: string;
  quantity: number;
}

const STORAGE_KEY = 'hv.market.orders.v1';

function isOrderList(v: unknown): v is OrderRecord[] {
  return Array.isArray(v) && v.every((o) => typeof o === 'object' && o !== null && 'id' in o && 'lines' in o);
}

/** Orders placed on this device (awaiting server confirmation) plus refund requests on seeded ones. */
function local(): OrderRecord[] {
  return readJSON<OrderRecord[]>(STORAGE_KEY, [], isOrderList);
}

function all(): OrderRecord[] {
  const mine = local();
  const ids = new Set(mine.map((o) => o.id));
  return [...mine, ...seededOrders.filter((o) => !ids.has(o.id))].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

function save(order: OrderRecord) {
  writeJSON(STORAGE_KEY, [order, ...local().filter((o) => o.id !== order.id)]);
}

let sequence = 4900 + local().length;

function reference(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function validAddress(o: CheckoutOptions): string | null {
  const a = o.shipping;
  if (!a) return 'Add a delivery address for the items that ship.';
  if (a.name.trim().length < 2) return 'Enter the name for delivery.';
  if (a.phone.replace(/\D/g, '').length < 10) return 'Enter a phone number the courier can call.';
  if (a.line1.trim().length < 5) return 'Enter the street address.';
  if (a.city.trim().length < 2 || a.state.trim().length < 2) return 'Enter the city and state.';
  return null;
}

async function listOrders(): Promise<OrderResult<OrderRecord[]>> {
  await delay(260);
  return { ok: true, data: all() };
}

async function getOrder(id: string): Promise<OrderResult<OrderRecord | null>> {
  await delay(200);
  return { ok: true, data: all().find((o) => o.id === id) ?? null };
}

async function placeOrder(lines: BagLine[], options: CheckoutOptions): Promise<OrderResult<OrderRecord>> {
  await delay(700);
  if (lines.length === 0) return { ok: false, error: 'Your bag is empty.' };

  const recordLines: OrderRecordLine[] = [];
  for (const line of lines) {
    const product = marketProducts.find((p) => p.id === line.productId);
    if (!product || product.stock === 'sold-out') {
      return { ok: false, error: 'One of these is no longer available. Remove it and try again.' };
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      return { ok: false, error: 'Check the quantities in your bag.' };
    }
    if (product.edition && line.quantity > product.edition.remaining) {
      return { ok: false, error: `Only ${product.edition.remaining} of ${product.name} are left.` };
    }
    recordLines.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      unitPrice: product.price,
      quantity: line.quantity,
      fulfilment: fulfilmentFor(product.category),
      state: 'awaiting_payment',
      split: product.split
    });
  }

  const ships = recordLines.some((l) => l.fulfilment === 'shipped');
  if (ships) {
    const problem = validAddress(options);
    if (problem) return { ok: false, error: problem };
  }

  const subtotal = recordLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const deliveryFee = ships ? DELIVERY_FEE : 0;
  if (options.method === 'havapay-wallet') {
    const { available } = walletSnapshot();
    if (subtotal + deliveryFee > available) {
      return {
        ok: false,
        error: `Your wallet has ₦${available.toLocaleString('en-NG')} available. Top up or pay by card.`
      };
    }
  }
  sequence += 1;
  const now = new Date().toISOString();
  const order: OrderRecord = {
    id: `HV-${sequence}`,
    invoiceNumber: `INV-2026-00${sequence}`,
    placedAt: now,
    lines: recordLines,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    // Only HavaPay moves this forward. Nothing on this device ever settles it.
    payment: { method: options.method, state: 'awaiting_confirmation', reference: reference('HP') },
    shipping: ships ? options.shipping : undefined,
    timeline: [{ at: now, label: 'Order placed · sent to HavaPay for payment' }]
  };
  save(order);

  analytics.emit('purchase_completed', 'market', `order:${order.id}`, {
    lines: recordLines.length,
    total: order.total,
    method: options.method
  });
  notificationBus.deliver({
    kind: 'commerce',
    title: `Order ${order.id} placed`,
    body: `₦${order.total.toLocaleString('en-NG')} is waiting for HavaPay to confirm. We'll tell you when it's paid.`,
    to: `/market/orders/${order.id}`,
    image: recordLines[0].image
  });
  return { ok: true, data: order };
}

async function requestRefund(orderId: string, productIds: string[], reason: string): Promise<OrderResult<OrderRecord>> {
  await delay(480);
  const order = all().find((o) => o.id === orderId);
  if (!order) return { ok: false, error: 'That order no longer exists.' };
  if (productIds.length === 0) return { ok: false, error: 'Choose what you want refunded.' };
  if (reason.trim().length < 4) return { ok: false, error: 'Tell us briefly why — it helps the creator too.' };

  const lines = order.lines.filter((l) => productIds.includes(l.productId));
  for (const line of lines) {
    const check = refundEligibility(order, line);
    if (!check.eligible) return { ok: false, error: `${line.name}: ${check.reason}` };
  }
  const amount = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const now = new Date().toISOString();
  const refund: RefundRequest = {
    id: reference('RF'),
    requestedAt: now,
    reason: reason.trim(),
    productIds,
    amount,
    // HavaPay and the seller decide. It stays requested until they do.
    state: 'requested'
  };
  const updated: OrderRecord = {
    ...order,
    refund,
    timeline: [{ at: now, label: `Refund of ₦${amount.toLocaleString('en-NG')} requested` }, ...order.timeline]
  };
  save(updated);
  notificationBus.deliver({
    kind: 'commerce',
    title: 'Refund requested',
    body: `${order.id} · ₦${amount.toLocaleString('en-NG')}. The seller and HavaPay review it, usually within 3 working days.`,
    to: `/market/orders/${order.id}`
  });
  return { ok: true, data: updated };
}

async function withdrawRefund(orderId: string): Promise<OrderResult<OrderRecord>> {
  await delay(320);
  const order = all().find((o) => o.id === orderId);
  if (!order?.refund) return { ok: false, error: 'There is no refund request on this order.' };
  if (order.refund.state !== 'requested') return { ok: false, error: 'This refund has already been decided.' };
  const updated: OrderRecord = {
    ...order,
    refund: undefined,
    timeline: [{ at: new Date().toISOString(), label: 'Refund request withdrawn' }, ...order.timeline]
  };
  save(updated);
  return { ok: true, data: updated };
}

/**
 * Entitlement comes only from the server: owned items plus lines of orders
 * whose payment HavaPay has confirmed. An order awaiting confirmation grants nothing.
 */
function ownedProducts(): string[] {
  const settled = all().
  filter((o) => o.payment.state === 'settled' || o.payment.state === 'partially_refunded').
  flatMap((o) => o.lines.filter((l) => l.state !== 'refunded' && l.fulfilment !== 'shipped').map((l) => l.productId));
  return [...new Set([...ownedProductIds, ...settled])];
}

/** Orders placed on this device — their money isn't in the cleared wallet balance yet. */
function placedOnDevice(): OrderRecord[] {
  const seeded = new Set(seededOrders.map((o) => o.id));
  return local().filter((o) => !seeded.has(o.id));
}

/** Historic orders that carry a refund request made on this device. */
function refundsOnHistory(): OrderRecord[] {
  const seeded = new Set(seededOrders.map((o) => o.id));
  return local().filter((o) => seeded.has(o.id) && o.refund);
}

export const ordersApi = {
  listOrders,
  getOrder,
  placeOrder,
  requestRefund,
  withdrawRefund,
  ownedProducts,
  placedOnDevice,
  refundsOnHistory
};