import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, FileTextIcon, TruckIcon } from 'lucide-react';
import { ordersApi } from '../../services/ordersApi';
import { useApp } from '../../contexts/AppContext';
import { formatPrice } from '../../contexts/CommerceContext';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { RefundSheet } from '../../components/market/RefundSheet';
import {
  dateTime,
  lineStateLabel,
  longDate,
  methodLabel,
  orderHeadline,
  paymentLabel,
  refundEligibility } from
'../../utils/orders';
import type { OrderRecord } from '../../types/orders';

type LoadState = {status: 'loading';} | {status: 'error';} | {status: 'ready';order: OrderRecord | null;};

export function OrderDetail() {
  const { orderId = '' } = useParams();
  const { showToast } = useApp();
  const [state, setState] = React.useState<LoadState>({ status: 'loading' });
  const [refundOpen, setRefundOpen] = React.useState(false);
  const [withdrawing, setWithdrawing] = React.useState(false);

  const load = React.useCallback(async () => {
    setState({ status: 'loading' });
    const res = await ordersApi.getOrder(orderId);
    setState(res.ok ? { status: 'ready', order: res.data } : { status: 'error' });
  }, [orderId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const back =
  <Link to="/market/orders" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
      <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
      Your orders
    </Link>;


  if (state.status === 'loading') return <div className="mx-auto max-w-4xl p-4 sm:p-5">{back}<LoadingBlock label="Loading order…" /></div>;
  if (state.status === 'error') return <div className="mx-auto max-w-4xl p-4 sm:p-5">{back}<ErrorBlock message="Couldn't load this order." onRetry={load} /></div>;
  if (!state.order) {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-5">
        {back}
        <EmptyBlock title="Order not found" body="It may belong to another account, or the link is wrong." />
      </div>);

  }

  const order = state.order;
  const headline = orderHeadline(order);
  const canRefund = order.lines.some((l) => refundEligibility(order, l).eligible);
  const refundBlocker = !canRefund ? refundEligibility(order, order.lines[0]) : null;

  async function submitRefund(productIds: string[], reason: string) {
    const res = await ordersApi.requestRefund(order.id, productIds, reason);
    if (!res.ok) return res.error;
    setRefundOpen(false);
    setState({ status: 'ready', order: res.data });
    showToast('Refund requested — we’ll tell you when it’s decided');
    return null;
  }

  async function withdraw() {
    setWithdrawing(true);
    const res = await ordersApi.withdrawRefund(order.id);
    setWithdrawing(false);
    if (!res.ok) {
      showToast(res.error);
      return;
    }
    setState({ status: 'ready', order: res.data });
    showToast('Refund request withdrawn');
  }

  return (
    <div className="mx-auto max-w-4xl p-4 pb-12 sm:p-5">
      {back}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-mist-400">
            {order.id} · placed {longDate(order.placedAt)}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{headline}</h1>
          {order.payment.state === 'awaiting_confirmation' &&
          <p className="mt-1 max-w-lg text-xs text-mist-400">
              HavaPay hasn't confirmed this payment yet. Nothing ships and nothing joins your collection until it does.
            </p>
          }
        </div>
        <Link
          to={`/market/orders/${order.id}/invoice`}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/5">
          
          <FileTextIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {order.payment.state === 'settled' || order.payment.state === 'partially_refunded' ? 'Invoice' : 'Order summary'}
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="items-heading">
            <h2 id="items-heading" className="mb-3 text-sm font-bold text-white">
              Items
            </h2>
            <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
              {order.lines.map((l) =>
              <li key={l.productId} className="flex items-center gap-3 px-4 py-3">
                  <Link to={`/market/product/${l.productId}`} className="shrink-0">
                    <img src={l.image} alt="" className="h-14 w-16 rounded-lg object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                    to={`/market/product/${l.productId}`}
                    className="block truncate text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                    
                      {l.name}
                    </Link>
                    <p className="text-[11px] text-mist-400">
                      {l.category} · {l.quantity} × {formatPrice(l.unitPrice)}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-mist-200">{lineStateLabel[l.state]}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-white">{formatPrice(l.unitPrice * l.quantity)}</span>
                </li>
              )}
            </ul>
          </section>

          {order.tracking &&
          <section aria-labelledby="tracking-heading">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="tracking-heading" className="flex items-center gap-2 text-sm font-bold text-white">
                  <TruckIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
                  Delivery
                </h2>
                <p className="text-[11px] text-mist-400">
                  {order.tracking.carrier} · {order.tracking.reference}
                  {order.tracking.estimatedDelivery && ` · expected ${longDate(order.tracking.estimatedDelivery)}`}
                </p>
              </div>
              <ol className="relative space-y-4 border-l border-white/10 pl-5">
                {order.tracking.events.map((ev, i) =>
              <li key={ev.at} className="relative">
                    <span
                  className={`absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-brand-cyan' : 'bg-ink-700'}`}
                  aria-hidden="true" />
                
                    <p className={`text-sm ${i === 0 ? 'font-semibold text-white' : 'text-mist-300'}`}>{ev.label}</p>
                    <p className="text-[11px] text-mist-400">
                      {dateTime(ev.at)}
                      {ev.place && ` · ${ev.place}`}
                    </p>
                  </li>
              )}
              </ol>
              <p className="mt-3 text-[11px] text-mist-400">Updates come from the courier through HavaVerse.</p>
            </section>
          }

          <section aria-labelledby="history-heading">
            <h2 id="history-heading" className="mb-3 text-sm font-bold text-white">
              History
            </h2>
            <ul className="space-y-2">
              {order.timeline.map((t) =>
              <li key={t.at + t.label} className="flex gap-3 text-xs">
                  <span className="w-28 shrink-0 text-mist-400">{dateTime(t.at)}</span>
                  <span className="text-mist-200">{t.label}</span>
                </li>
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Payment</h2>
            <dl className="mt-3 space-y-1.5 text-xs">
              <Row label="Items" value={formatPrice(order.subtotal)} />
              {order.deliveryFee > 0 && <Row label="Delivery" value={formatPrice(order.deliveryFee)} />}
              <Row label="Total" value={formatPrice(order.total)} strong />
              <div className="border-t border-white/5 pt-2" />
              <Row label="Method" value={methodLabel[order.payment.method]} />
              <Row label="Status" value={paymentLabel[order.payment.state]} />
              <Row label="Reference" value={order.payment.reference} />
            </dl>
          </section>

          {order.shipping &&
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">Delivering to</h2>
              <address className="mt-2 text-xs not-italic leading-relaxed text-mist-300">
                {order.shipping.name}
                <br />
                {order.shipping.line1}
                <br />
                {order.shipping.city}, {order.shipping.state}
                <br />
                {order.shipping.phone}
              </address>
            </section>
          }

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Refunds</h2>
            {order.refund ?
            <div className="mt-2 text-xs">
                <p className="font-semibold text-brand-amber">
                  {order.refund.state === 'requested' ? 'Under review' : order.refund.state === 'approved' ? 'Approved' : 'Declined'} ·{' '}
                  {formatPrice(order.refund.amount)}
                </p>
                <p className="mt-1 text-mist-400">
                  “{order.refund.reason}” · requested {longDate(order.refund.requestedAt)}
                </p>
                {order.refund.state === 'requested' &&
              <button
                type="button"
                onClick={withdraw}
                disabled={withdrawing}
                className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/5 disabled:opacity-50">
                
                    {withdrawing ? 'Withdrawing…' : 'Withdraw request'}
                  </button>
              }
              </div> :
            canRefund ?
            <>
                <p className="mt-2 text-xs text-mist-400">Something wrong? Ask for your money back on eligible items.</p>
                <button
                type="button"
                onClick={() => setRefundOpen(true)}
                className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/5">
                
                  Request a refund
                </button>
              </> :

            <p className="mt-2 text-xs text-mist-400">
                {refundBlocker && !refundBlocker.eligible ? refundBlocker.reason : 'Not available for this order.'}
              </p>
            }
          </section>
        </aside>
      </div>

      {refundOpen && <RefundSheet order={order} onClose={() => setRefundOpen(false)} onSubmit={submitRefund} />}
    </div>);

}

function Row({ label, value, strong }: {label: string;value: string;strong?: boolean;}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-mist-400">{label}</dt>
      <dd className={`text-right tabular-nums ${strong ? 'text-sm font-bold text-white' : 'text-mist-200'}`}>{value}</dd>
    </div>);

}