import type { ProductCategory, RevenueSplit } from './commerce';

/** How a line is fulfilled, derived from the product category on the server. */
export type FulfilmentKind = 'shipped' | 'digital' | 'ticket' | 'reservation' | 'contribution';

/**
 * Payment is owned by HavaPay. The client only ever displays it:
 * awaiting_confirmation → settled | failed, then optionally refunded.
 */
export type PaymentState = 'awaiting_confirmation' | 'settled' | 'failed' | 'refunded' | 'partially_refunded';

export type LineFulfilmentState =
'awaiting_payment' |
'processing' |
'shipped' |
'delivered' |
'issued' |
'refunded';

export type PaymentMethodId = 'havapay-wallet' | 'havapay-card';

export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
}

export interface OrderRecordLine {
  productId: string;
  name: string;
  image: string;
  category: ProductCategory;
  unitPrice: number;
  quantity: number;
  fulfilment: FulfilmentKind;
  state: LineFulfilmentState;
  split: RevenueSplit;
}

export interface TrackingEvent {
  at: string;
  label: string;
  place?: string;
}

export interface Tracking {
  carrier: string;
  reference: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
}

export type RefundState = 'requested' | 'approved' | 'declined';

export interface RefundRequest {
  id: string;
  requestedAt: string;
  reason: string;
  productIds: string[];
  amount: number;
  state: RefundState;
  note?: string;
}

export interface OrderTimelineEntry {
  at: string;
  label: string;
}

export interface OrderRecord {
  id: string;
  invoiceNumber: string;
  placedAt: string;
  lines: OrderRecordLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: {method: PaymentMethodId;state: PaymentState;reference: string;};
  shipping?: ShippingAddress;
  tracking?: Tracking;
  refund?: RefundRequest;
  timeline: OrderTimelineEntry[];
}

export interface CheckoutOptions {
  method: PaymentMethodId;
  shipping?: ShippingAddress;
}

export type RefundEligibility = {eligible: true;} | {eligible: false;reason: string;};