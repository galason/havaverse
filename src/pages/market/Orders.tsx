import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, PackageIcon } from 'lucide-react';
import { ordersApi } from '../../services/ordersApi';
import { formatPrice } from '../../contexts/CommerceContext';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../../components/community/StateBlocks';
import { longDate, orderHeadline } from '../../utils/orders';
import type { OrderRecord } from '../../types/orders';

type Filter = 'all' | 'open' | 'complete';

const filters: {id: Filter;label: string;}[] = [
{ id: 'all', label: 'All' },
{ id: 'open', label: 'In progress' },
{ id: 'complete', label: 'Complete' }];


function isOpen(o: OrderRecord) {
  return orderHeadline(o) !== 'Complete';
}

export function Orders() {
  const [state, setState] = React.useState<
    {status: 'loading';} | {status: 'error';} | {status: 'ready';orders: OrderRecord[];}>(
    { status: 'loading' });
  const [filter, setFilter] = React.useState<Filter>('all');

  const load = React.useCallback(async () => {
    setState({ status: 'loading' });
    const res = await ordersApi.listOrders();
    setState(res.ok ? { status: 'ready', orders: res.data } : { status: 'error' });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const shown =
  state.status === 'ready' ?
  state.orders.filter((o) => filter === 'all' ? true : filter === 'open' ? isOpen(o) : !isOpen(o)) :
  [];

  return (
    <div className="mx-auto max-w-3xl p-4 pb-12 sm:p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Your orders</h1>
          <p className="mt-1 text-xs text-mist-400">Everything you've bought in HavaMarket, with receipts and delivery.</p>
        </div>
        <div role="group" aria-label="Filter orders" className="flex gap-1 rounded-full border border-white/10 p-1">
          {filters.map((f) =>
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={[
            'rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-150 ease-entrance',
            filter === f.id ? 'bg-white/10 text-white' : 'text-mist-400 hover:text-white'].
            join(' ')}>
            
              {f.label}
            </button>
          )}
        </div>
      </div>

      {state.status === 'loading' && <SkeletonRows rows={3} />}
      {state.status === 'error' && <ErrorBlock message="Couldn't load your orders." onRetry={load} />}
      {state.status === 'ready' && shown.length === 0 &&
      <EmptyBlock
        icon={<PackageIcon className="h-6 w-6" />}
        title={state.orders.length === 0 ? 'No orders yet' : 'Nothing here'}
        body={
        state.orders.length === 0 ?
        'When you buy something in HavaMarket, the order, receipt and delivery live here.' :
        'No orders match this filter.'
        }
        action={
        state.orders.length === 0 ?
        <Link
          to="/market"
          className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
                Browse Market
              </Link> :
        undefined
        } />

      }
      {state.status === 'ready' && shown.length > 0 &&
      <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
          {shown.map((o) => {
          const headline = orderHeadline(o);
          const tone =
          headline === 'Complete' ?
          'text-status-success' :
          headline.startsWith('Awaiting') || headline === 'Refund requested' ?
          'text-brand-amber' :
          headline === 'Payment failed' ?
          'text-live' :
          'text-brand-cyan';
          return (
            <li key={o.id}>
                <Link
                to={`/market/orders/${o.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 ease-entrance hover:bg-white/5">
                
                  <div className="flex shrink-0 -space-x-3">
                    {o.lines.slice(0, 3).map((l) =>
                  <img key={l.productId} src={l.image} alt="" className="h-12 w-12 rounded-lg border-2 border-ink-900 object-cover" />
                  )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {o.lines[0].name}
                      {o.lines.length > 1 && <span className="font-normal text-mist-400"> + {o.lines.length - 1} more</span>}
                    </p>
                    <p className="truncate text-[11px] text-mist-400">
                      {o.id} · {longDate(o.placedAt)}
                    </p>
                    <p className={`mt-0.5 text-[11px] font-semibold ${tone}`}>{headline}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-white">{formatPrice(o.total)}</span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
                </Link>
              </li>);

        })}
        </ul>
      }
    </div>);

}