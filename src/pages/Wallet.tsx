import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BanknoteIcon,
  ChevronRightIcon,
  CreditCardIcon,
  PlusIcon } from
'lucide-react';
import { revenueStreams } from '../data/economy';
import type { Transaction } from '../data/economy';
import { MoneySheet } from '../components/wallet/MoneySheet';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../components/community/StateBlocks';
import { useApp } from '../contexts/AppContext';
import { getWallet } from '../services/havapayLedger';
import type { LedgerEntry, LedgerSource, WalletSnapshot } from '../services/havapayLedger';
import { dateTime } from '../utils/orders';

type Filter = 'all' | 'pending' | 'market' | 'creator';

const filters: {id: Filter;label: string;}[] = [
{ id: 'all', label: 'All' },
{ id: 'pending', label: 'Pending' },
{ id: 'market', label: 'Purchases & refunds' },
{ id: 'creator', label: 'Creators & payouts' }];


const inFilter: Record<Filter, (e: LedgerEntry) => boolean> = {
  all: () => true,
  pending: (e) => e.status === 'pending',
  market: (e) => e.source === 'market' || e.source === 'purchase' || e.source === 'refund',
  creator: (e) => (['support', 'membership', 'payout'] as LedgerSource[]).includes(e.source)
};

const statusStyle: Record<LedgerEntry['status'], string> = {
  settled: 'text-mist-400',
  pending: 'text-brand-amber',
  failed: 'text-live'
};

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

type LoadState = {status: 'loading';} | {status: 'error';message: string;} | {status: 'ready';wallet: WalletSnapshot;};

export function Wallet() {
  const { showToast } = useApp();
  const [state, setState] = React.useState<LoadState>({ status: 'loading' });
  const [sheet, setSheet] = React.useState<'withdraw' | 'top-up' | null>(null);
  const [filter, setFilter] = React.useState<Filter>('all');

  const load = React.useCallback(async () => {
    setState({ status: 'loading' });
    const res = await getWallet();
    setState(res.ok ? { status: 'ready', wallet: res.data } : { status: 'error', message: res.error });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  function requested(entry: Transaction, _available: number, reference: string) {
    showToast(`${entry.label} requested — reference ${reference}`);
    load();
  }

  const wallet = state.status === 'ready' ? state.wallet : null;
  const visible = wallet ? wallet.entries.filter(inFilter[filter]) : [];

  return (
    <div className="p-5">
      <header className="mb-6">
        <p className="text-xs font-semibold text-mist-400">HavaPay</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Wallet &amp; earnings</h1>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {state.status === 'loading' && <LoadingBlock label="Loading your wallet…" />}
          {state.status === 'error' && <ErrorBlock message={state.message} onRetry={load} />}

          {wallet &&
          <>
              <section className="rounded-2xl border border-brand-indigo/25 bg-ink-900 p-6" aria-labelledby="balance-heading">
                <p id="balance-heading" className="text-xs text-mist-400">
                  Available to spend or withdraw
                </p>
                <p className="mt-1 font-display text-5xl tracking-wide text-white">{naira(wallet.available)}</p>
                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <div className="flex gap-1.5">
                    <dt className="text-mist-400">Cleared</dt>
                    <dd className="font-semibold tabular-nums text-mist-200">{naira(wallet.cleared)}</dd>
                  </div>
                  {wallet.held > 0 &&
                <div className="flex gap-1.5">
                      <dt className="text-mist-400">Held for payments awaiting HavaPay</dt>
                      <dd className="font-semibold tabular-nums text-brand-amber">−{naira(wallet.held)}</dd>
                    </div>
                }
                  {wallet.incoming > 0 &&
                <div className="flex gap-1.5">
                      <dt className="text-mist-400">On its way</dt>
                      <dd className="font-semibold tabular-nums text-brand-cyan">+{naira(wallet.incoming)}</dd>
                    </div>
                }
                </dl>
                <p className="mt-2 text-[11px] text-mist-400">
                  Money on its way counts once HavaPay settles it. The cleared figure only changes on HavaPay’s side.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                  type="button"
                  onClick={() => setSheet('withdraw')}
                  className="flex items-center gap-2 rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
                  
                    <BanknoteIcon className="h-4 w-4" aria-hidden="true" />
                    Withdraw
                  </button>
                  <button
                  type="button"
                  onClick={() => setSheet('top-up')}
                  className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
                  
                    <PlusIcon className="h-4 w-4" aria-hidden="true" />
                    Top up
                  </button>
                  <Link
                  to="/settings/havapay"
                  className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
                  
                    <CreditCardIcon className="h-4 w-4" aria-hidden="true" />
                    Payment methods
                  </Link>
                </div>
              </section>

              <section aria-labelledby="ledger-heading">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 id="ledger-heading" className="text-lg font-bold tracking-tight text-white">
                    Transactions
                  </h2>
                  <div role="group" aria-label="Filter transactions" className="flex gap-1 overflow-x-auto">
                    {filters.map((f) =>
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={[
                    'shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ease-entrance',
                    filter === f.id ? 'bg-white text-ink-950' : 'text-mist-300 hover:bg-white/5 hover:text-white'].
                    join(' ')}>
                    
                        {f.label}
                      </button>
                  )}
                  </div>
                </div>

                {visible.length === 0 ?
              <EmptyBlock title="Nothing here" body="No transactions match this filter yet." /> :

              <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
                    {visible.map((tx) =>
                <li key={tx.id}>
                        <LedgerRow entry={tx} />
                      </li>
                )}
                  </ul>
              }
              </section>
            </>
          }
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Where earnings came from</h2>
            <p className="mt-0.5 text-[11px] text-mist-400">August · ₦412,800 total</p>
            <ul className="mt-4 space-y-3">
              {revenueStreams.map((stream) =>
              <li key={stream.id}>
                  <div className="flex items-baseline gap-2 text-xs">
                    <span className="min-w-0 flex-1 truncate text-mist-200">{stream.label}</span>
                    <span className="font-semibold tabular-nums text-white">{stream.amount}</span>
                    <span
                    className={
                    stream.trend.startsWith('+') ?
                    'w-10 text-right text-[11px] text-brand-cyan' :
                    'w-10 text-right text-[11px] text-mist-400'
                    }>
                    
                      {stream.trend}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-brand-indigo" style={{ width: `${stream.share}%` }} />
                  </div>
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Orders</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-mist-300">
              Market purchases and refund requests appear here as HavaPay records them. Delivery and invoices live with each order.
            </p>
            <Link
              to="/market/orders"
              className="mt-3 block w-full rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/5">
              
              Your orders
            </Link>
          </section>

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Payouts</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-mist-300">
              Creator earnings are paid into this wallet automatically on the 1st of each month. Early payouts you
              send here show as on their way until HavaPay pays them.
            </p>
            <Link
              to="/creator/economy"
              className="mt-3 block w-full rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/5">
              
              Open creator economy
            </Link>
          </section>
        </aside>
      </div>

      {sheet && wallet &&
      <MoneySheet mode={sheet} balance={wallet.available} onClose={() => setSheet(null)} onSettled={requested} />
      }
    </div>);

}

function LedgerRow({ entry }: {entry: LedgerEntry;}) {
  const body =
  <div className="flex items-center gap-3 px-4 py-3">
      <span
      className={[
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
      entry.direction === 'in' ? 'bg-brand-cyan/15 text-brand-cyan' : 'bg-white/5 text-mist-300'].
      join(' ')}
      aria-hidden="true">
      
        {entry.direction === 'in' ? <ArrowDownLeftIcon className="h-4 w-4" /> : <ArrowUpRightIcon className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white">{entry.label}</span>
        <span className="block truncate text-[11px] text-mist-400">
          {entry.at ? dateTime(entry.at) : entry.dateLabel} · {entry.detail}
        </span>
      </span>
      <span className="text-right">
        <span
        className={[
        'block text-sm font-semibold tabular-nums',
        entry.direction === 'in' ? 'text-brand-cyan' : 'text-white',
        entry.status === 'failed' ? 'line-through opacity-60' : ''].
        join(' ')}>
        
          {entry.direction === 'in' ? '+' : '−'}
          {naira(entry.amount)}
        </span>
        <span className={`block text-[11px] ${statusStyle[entry.status]}`}>{entry.statusLabel}</span>
      </span>
      {entry.to && <ChevronRightIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />}
    </div>;

  return entry.to ?
  <Link to={entry.to} className="block transition-colors duration-150 ease-entrance hover:bg-white/[0.03]">
      {body}
    </Link> :

  body;

}