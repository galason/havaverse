import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PrinterIcon } from 'lucide-react';
import { ordersApi } from '../../services/ordersApi';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../contexts/CommerceContext';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { HavaVerseLogo } from '../../components/brand/HavaVerseLogo';
import { longDate, methodLabel, paymentLabel } from '../../utils/orders';
import type { OrderRecord } from '../../types/orders';

export function OrderInvoice() {
  const { orderId = '' } = useParams();
  const { identity } = useAuth();
  const [state, setState] = React.useState<
    {status: 'loading';} | {status: 'error';} | {status: 'ready';order: OrderRecord | null;}>(
    { status: 'loading' });

  const load = React.useCallback(async () => {
    setState({ status: 'loading' });
    const res = await ordersApi.getOrder(orderId);
    setState(res.ok ? { status: 'ready', order: res.data } : { status: 'error' });
  }, [orderId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (state.status === 'loading') return <div className="mx-auto max-w-3xl p-4 sm:p-5"><LoadingBlock label="Loading invoice…" /></div>;
  if (state.status === 'error') return <div className="mx-auto max-w-3xl p-4 sm:p-5"><ErrorBlock message="Couldn't load this invoice." onRetry={load} /></div>;
  if (!state.order) return <div className="mx-auto max-w-3xl p-4 sm:p-5"><EmptyBlock title="Order not found" body="Check the link and try again." /></div>;

  const order = state.order;
  const paid = order.payment.state === 'settled' || order.payment.state === 'partially_refunded' || order.payment.state === 'refunded';

  return (
    <div className="mx-auto max-w-3xl p-4 pb-12 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <Link
          to={`/market/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          
          <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Back to order
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/5">
          
          <PrinterIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Print or save as PDF
        </button>
      </div>

      <article className="rounded-2xl border border-white/5 bg-ink-900 p-6 sm:p-8" aria-labelledby="invoice-title">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-white/5 pb-6">
          <div>
            <HavaVerseLogo variant="icon" size="md" labelled />
            <p className="mt-3 text-xs text-mist-400">HavaMarket · settled by HavaPay</p>
          </div>
          <div className="text-right">
            <h1 id="invoice-title" className="text-xl font-bold text-white">
              {paid ? 'Invoice' : 'Order summary'}
            </h1>
            <p className="mt-1 text-xs text-mist-400">{paid ? order.invoiceNumber : 'Invoice issued once HavaPay confirms payment'}</p>
            <p className="text-xs text-mist-400">Order {order.id} · {longDate(order.placedAt)}</p>
          </div>
        </header>

        <div className="grid gap-6 border-b border-white/5 py-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold text-mist-400">Billed to</p>
            <p className="mt-1 text-sm text-white">{identity?.profile.displayName || identity?.username || 'Account holder'}</p>
            {identity?.email && <p className="text-xs text-mist-400">{identity.email}</p>}
          </div>
          {order.shipping &&
          <div>
              <p className="text-[11px] font-semibold text-mist-400">Delivered to</p>
              <p className="mt-1 text-xs leading-relaxed text-mist-200">
                {order.shipping.name}, {order.shipping.line1}, {order.shipping.city}, {order.shipping.state}
              </p>
            </div>
          }
        </div>

        <table className="w-full text-left text-sm">
          <caption className="sr-only">Items on this order</caption>
          <thead>
            <tr className="text-[11px] text-mist-400">
              <th scope="col" className="py-3 font-semibold">Item</th>
              <th scope="col" className="py-3 text-right font-semibold">Qty</th>
              <th scope="col" className="py-3 text-right font-semibold">Unit</th>
              <th scope="col" className="py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {order.lines.map((l) =>
            <tr key={l.productId}>
                <td className="py-3 pr-3">
                  <span className="text-white">{l.name}</span>
                  <span className="block text-[11px] text-mist-400">
                    {l.category} · {l.split.creator}% to the creator
                  </span>
                </td>
                <td className="py-3 text-right tabular-nums text-mist-200">{l.quantity}</td>
                <td className="py-3 text-right tabular-nums text-mist-200">{formatPrice(l.unitPrice)}</td>
                <td className="py-3 text-right tabular-nums text-white">{formatPrice(l.unitPrice * l.quantity)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <dl className="ml-auto mt-4 max-w-xs space-y-1.5 border-t border-white/5 pt-4 text-sm">
          <div className="flex justify-between text-mist-300">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.deliveryFee > 0 &&
          <div className="flex justify-between text-mist-300">
              <dt>Delivery</dt>
              <dd className="tabular-nums">{formatPrice(order.deliveryFee)}</dd>
            </div>
          }
          <div className="flex justify-between pt-1 text-base font-bold text-white">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(order.total)}</dd>
          </div>
        </dl>

        <footer className="mt-8 border-t border-white/5 pt-4 text-[11px] leading-relaxed text-mist-400">
          Paid with {methodLabel[order.payment.method]} · {paymentLabel[order.payment.state]} · reference {order.payment.reference}.
          Prices include VAT where it applies; the tax breakdown is issued by HavaPay with the settled invoice.
        </footer>
      </article>
    </div>);

}