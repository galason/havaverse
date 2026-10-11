import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangleIcon, WalletIcon } from 'lucide-react';
import type { CreatorEconomy as Economy, EconomyErrorCode } from '../types/creatorEconomy';
import { creatorEconomyApi } from '../services/creatorEconomyApi';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { naira } from '../utils/currency';
import { EarningsSummary } from '../components/economy/EarningsSummary';
import { RevenueSources } from '../components/economy/RevenueSources';
import { EarningsLedger } from '../components/economy/EarningsLedger';
import { MembershipTiers } from '../components/economy/MembershipTiers';
import { RevenueSplits } from '../components/economy/RevenueSplits';
import { PayoutsPanel } from '../components/economy/PayoutsPanel';
import { PayoutSheet } from '../components/economy/PayoutSheet';
import { TitleEarningsList } from '../components/economy/TitleEarningsList';

type Tab = 'overview' | 'earnings' | 'memberships' | 'splits' | 'payouts';

const tabs: {id: Tab;label: string;}[] = [
{ id: 'overview', label: 'Overview' },
{ id: 'earnings', label: 'Earnings' },
{ id: 'memberships', label: 'Memberships' },
{ id: 'splits', label: 'Splits' },
{ id: 'payouts', label: 'Payouts' }];


type LoadState =
{status: 'loading';} |
{status: 'error';code: EconomyErrorCode;message: string;} |
{status: 'ready';data: Economy;};

export function CreatorEconomy() {
  const { identity } = useAuth();
  const { showToast } = useApp();
  const [params, setParams] = useSearchParams();
  const tab = (tabs.find((t) => t.id === params.get('tab'))?.id ?? 'overview') as Tab;
  const [state, setState] = React.useState<LoadState>({ status: 'loading' });
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  const ctx = React.useMemo(
    () => ({
      capabilities: identity?.capabilities ?? [],
      displayName: identity?.profile.displayName || identity?.username || 'Creator',
      username: identity?.username ?? ''
    }),
    [identity]
  );

  const load = React.useCallback(
    async (quiet = false) => {
      if (!quiet) setState({ status: 'loading' });
      const res = await creatorEconomyApi.getEconomy(ctx);
      setState(res.ok ? { status: 'ready', data: res.data } : { status: 'error', code: res.code, message: res.error });
    },
    [ctx]
  );

  React.useEffect(() => {
    load();
  }, [load]);

  function selectTab(next: Tab) {
    const p = new URLSearchParams(params);
    if (next === 'overview') p.delete('tab');else
    p.set('tab', next);
    setParams(p);
  }

  async function requestPayout(amount: number, methodId: string) {
    const res = await creatorEconomyApi.requestPayout(ctx, amount, methodId);
    if (!res.ok) return res.error;
    setSheetOpen(false);
    showToast(`Payout of ${naira(amount)} requested — reference ${res.data.reference}`);
    await load(true);
    return null;
  }

  async function cancelPayout(id: string) {
    setCancellingId(id);
    const res = await creatorEconomyApi.cancelPayout(id);
    setCancellingId(null);
    showToast(res.ok ? 'Payout request cancelled' : res.error);
    await load(true);
  }

  return (
    <div className="p-5">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">HavaPay · Creator</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Creator economy</h1>
          {state.status === 'ready' &&
          <p className="mt-1 text-xs text-mist-400">Earnings for {state.data.account.displayName}</p>
          }
        </div>
        <Link
          to="/wallet"
          className="flex items-center gap-2 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          
          <WalletIcon className="h-4 w-4" aria-hidden="true" />
          Open wallet
        </Link>
      </header>

      {state.status === 'loading' && <LoadingState />}

      {state.status === 'error' && state.code === 'not_creator' &&
      <section className="mx-auto max-w-lg rounded-2xl border border-white/5 bg-ink-900 px-6 py-10 text-center">
          <h2 className="text-lg font-bold text-white">Earnings belong to creator accounts</h2>
          <p className="mt-2 text-sm text-mist-400">
            Your account is set up for watching. Switch to a creator or creator-and-viewer account to publish
            work and earn from tips, memberships and sales. Your wallet stays exactly as it is.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
            to="/settings/account"
            className="rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
              Change account type
            </Link>
            <Link
            to="/wallet"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
              Go to wallet
            </Link>
          </div>
        </section>
      }

      {state.status === 'error' && state.code !== 'not_creator' &&
      <section role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-live/30 bg-ink-900 p-5">
          <AlertTriangleIcon className="h-5 w-5 text-live" aria-hidden="true" />
          <p className="flex-1 text-sm text-mist-200">Couldn’t load your earnings. {state.message}</p>
          <button
          type="button"
          onClick={() => load()}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/5">
          
            Try again
          </button>
        </section>
      }

      {state.status === 'ready' &&
      <>
          <div
          role="tablist"
          aria-label="Creator economy sections"
          className="thin-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-white/5">
          
            {tabs.map((t) =>
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`econ-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="econ-panel"
            onClick={() => selectTab(t.id)}
            className={[
            '-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance',
            tab === t.id ? 'border-brand-indigo text-white' : 'border-transparent text-mist-400 hover:text-white'].
            join(' ')}>
            
                {t.label}
                {t.id === 'payouts' && state.data.openPayout &&
            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-amber align-middle" aria-label="payout in progress" />
            }
              </button>
          )}
          </div>

          <div id="econ-panel" role="tabpanel" aria-labelledby={`econ-tab-${tab}`}>
            {tab === 'overview' &&
          <div className="space-y-8">
                <EarningsSummary economy={state.data} onRequestPayout={() => setSheetOpen(true)} />
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="min-w-0">
                    <RevenueSources sources={state.data.sources} periods={state.data.periods} />
                  </div>
                  <TitleEarningsList titles={state.data.titles} />
                </div>
              </div>
          }
            {tab === 'earnings' &&
          <EarningsLedger entries={state.data.entries} sourceConfig={state.data.sourceConfig} />
          }
            {tab === 'memberships' &&
          <MembershipTiers
            tiers={state.data.tiers}
            creatorShare={state.data.sourceConfig.find((s) => s.id === 'memberships')?.split.creator ?? 0} />

          }
            {tab === 'splits' && <RevenueSplits sources={state.data.sourceConfig} />}
            {tab === 'payouts' &&
          <div className="space-y-8">
                <EarningsSummary economy={state.data} onRequestPayout={() => setSheetOpen(true)} />
                <PayoutsPanel
              payouts={state.data.payouts}
              methods={state.data.methods}
              nextPayout={state.data.nextPayout}
              cancellingId={cancellingId}
              onCancel={cancelPayout} />
            
              </div>
          }
          </div>

          {sheetOpen &&
        <PayoutSheet
          available={state.data.balances.available}
          minPayout={state.data.minPayout}
          methods={state.data.methods}
          onClose={() => setSheetOpen(false)}
          onSubmit={requestPayout} />

        }
        </>
      }
    </div>);

}

function LoadingState() {
  return (
    <div aria-busy="true" aria-label="Loading earnings" className="space-y-6">
      <div className="h-48 animate-pulse rounded-2xl bg-ink-900" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-72 animate-pulse rounded-2xl bg-ink-900" />
        <div className="h-72 animate-pulse rounded-2xl bg-ink-900" />
      </div>
    </div>);

}