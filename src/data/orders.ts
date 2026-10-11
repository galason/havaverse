import type { OrderRecord } from '../types/orders';
import { marketProducts } from './commerce';

/**
 * Server-issued order records for the signed-in account. These are what
 * GET /api/market/orders returns today; they agree with the owned collection
 * (pr2, pr9, pr12) and add one physical order that is still in transit.
 */
const p = (id: string) => {
  const product = marketProducts.find((x) => x.id === id);
  if (!product) throw new Error(`Unknown product ${id}`);
  return product;
};

export const seededOrders: OrderRecord[] = [
{
  id: 'HV-4811',
  invoiceNumber: 'INV-2026-004811',
  placedAt: '2026-09-21T15:12:00+01:00',
  lines: [
  {
    productId: 'pr11',
    name: p('pr11').name,
    image: p('pr11').image,
    category: p('pr11').category,
    unitPrice: p('pr11').price,
    quantity: 1,
    fulfilment: 'shipped',
    state: 'shipped',
    split: p('pr11').split
  }],

  subtotal: 11_000,
  deliveryFee: 2_500,
  total: 13_500,
  payment: { method: 'havapay-wallet', state: 'settled', reference: 'HP-7Q2K91' },
  shipping: { name: 'Account holder', phone: '+234 803 ••• 4417', line1: '14 Admiralty Way, Lekki Phase 1', city: 'Lagos', state: 'Lagos' },
  tracking: {
    carrier: 'GIG Logistics',
    reference: 'GIG-5520-8841',
    estimatedDelivery: '2026-09-28',
    events: [
    { at: '2026-09-25T09:40:00+01:00', label: 'Out of the Ikeja hub', place: 'Ikeja, Lagos' },
    { at: '2026-09-23T17:05:00+01:00', label: 'Handed to courier', place: 'HavaVerse Live warehouse' },
    { at: '2026-09-22T11:20:00+01:00', label: 'Packed', place: 'HavaVerse Live warehouse' }]

  },
  timeline: [
  { at: '2026-09-23T17:05:00+01:00', label: 'Shipped with GIG Logistics' },
  { at: '2026-09-21T15:13:00+01:00', label: 'Payment confirmed by HavaPay' },
  { at: '2026-09-21T15:12:00+01:00', label: 'Order placed' }]

},
{
  id: 'HV-4755',
  invoiceNumber: 'INV-2026-004755',
  placedAt: '2026-08-14T20:31:00+01:00',
  lines: [
  {
    productId: 'pr12',
    name: p('pr12').name,
    image: p('pr12').image,
    category: p('pr12').category,
    unitPrice: p('pr12').price,
    quantity: 1,
    fulfilment: 'digital',
    state: 'issued',
    split: p('pr12').split
  }],

  subtotal: 6_500,
  deliveryFee: 0,
  total: 6_500,
  payment: { method: 'havapay-card', state: 'settled', reference: 'HP-3M8D20' },
  timeline: [
  { at: '2026-08-14T20:31:40+01:00', label: 'Added to your collection' },
  { at: '2026-08-14T20:31:30+01:00', label: 'Payment confirmed by HavaPay' },
  { at: '2026-08-14T20:31:00+01:00', label: 'Order placed' }]

},
{
  id: 'HV-4702',
  invoiceNumber: 'INV-2026-004702',
  placedAt: '2026-04-02T12:04:00+01:00',
  lines: [
  {
    productId: 'pr9',
    name: p('pr9').name,
    image: p('pr9').image,
    category: p('pr9').category,
    unitPrice: p('pr9').price,
    quantity: 1,
    fulfilment: 'ticket',
    state: 'issued',
    split: p('pr9').split
  },
  {
    productId: 'pr2',
    name: p('pr2').name,
    image: p('pr2').image,
    category: p('pr2').category,
    unitPrice: p('pr2').price,
    quantity: 1,
    fulfilment: 'digital',
    state: 'issued',
    split: p('pr2').split
  }],

  subtotal: 22_000,
  deliveryFee: 0,
  total: 22_000,
  payment: { method: 'havapay-wallet', state: 'settled', reference: 'HP-1A5F77' },
  timeline: [
  { at: '2026-04-02T12:04:30+01:00', label: 'Ticket issued and score added to your collection' },
  { at: '2026-04-02T12:04:20+01:00', label: 'Payment confirmed by HavaPay' },
  { at: '2026-04-02T12:04:00+01:00', label: 'Order placed' }]

}];