import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, TrendingUpIcon } from 'lucide-react';
import type {
  CommunitySignal,
  CreatorPulse,
  EconomyPulse,
  LibraryPulse } from
'../../types/dashboard';

function Stat({ value, label }: {value: string;label: string;}) {
  return (
    <div>
      <p className="font-display text-xl tracking-wide text-white">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist-400">
        {label}
      </p>
    </div>);

}

/** Summary of the viewer's audience. It points at Studio; it does not replace it. */
export function CreatorPulsePanel({ pulse }: {pulse: CreatorPulse;}) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-850 p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={pulse.followers} label="Followers" />
        <Stat value={pulse.views} label="Views" />
        <Stat value={pulse.watchTime} label="Watch time" />
        <div>
          <p className="flex items-center gap-1 font-display text-xl tracking-wide text-status-success-fg">
            <TrendingUpIcon className="h-4 w-4" aria-hidden="true" />
            {pulse.growth}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist-400">
            Audience growth
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
        <p className="text-xs text-mist-400">
          Latest release{' '}
          <Link to={pulse.latestTo} className="font-semibold text-white hover:text-brand-indigo">
            {pulse.latestTitle}
          </Link>{' '}
          · {pulse.latestState}
        </p>
        <Link
          to="/studio"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:text-white">
          
          View Studio
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>);

}

/**
 * Money is read, never derived. Every figure here comes from the HavaPay
 * ledger via the service; the dashboard does no arithmetic on balances.
 */
export function EconomyPulsePanel({ economy }: {economy: EconomyPulse;}) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-850 p-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-mist-400">
            Available
          </p>
          <p className="mt-0.5 font-display text-xl tracking-wide text-white">{economy.available}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-mist-400">Pending</p>
          <p className="mt-0.5 font-display text-xl tracking-wide text-brand-amber">
            {economy.pending}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-mist-400">
            {economy.mode === 'creator' ? 'This month' : 'Spent this month'}
          </p>
          <p className="mt-0.5 font-display text-xl tracking-wide text-status-success-fg">
            {economy.thisMonth}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
        <p className="text-xs text-mist-400">
          Last transaction {economy.lastLabel} ·{' '}
          <span className={economy.lastDirection === 'in' ? 'text-status-success-fg' : 'text-mist-200'}>
            {economy.lastAmount}
          </span>
        </p>
        <Link
          to="/wallet"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:text-white">
          
          Open HavaPay
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>);

}

export function CommunityPulsePanel({ signals }: {signals: CommunitySignal[];}) {
  return (
    <ul className="space-y-2">
      {signals.map((signal) =>
      <li key={signal.id}>
          <Link
          to={signal.to}
          className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-850 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
          
            <img src={signal.avatar} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{signal.name}</span>
              <span className="mt-0.5 block truncate text-[11px] text-mist-400">
                {signal.detail}
              </span>
            </span>
            {signal.live &&
          <span className="shrink-0 rounded-full bg-live/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-live">
                Live
              </span>
          }
          </Link>
        </li>
      )}
    </ul>);

}

export function LibraryPulsePanel({ library }: {library: LibraryPulse;}) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-850 p-4">
      <div className="grid grid-cols-4 gap-3">
        <Stat value={String(library.saved)} label="Saved" />
        <Stat value={String(library.following)} label="Following" />
        <Stat value={String(library.collected)} label="Collected" />
        <Stat value={String(library.downloads)} label="Downloads" />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
        <p className="text-xs text-mist-400">
          Recently saved{' '}
          <Link to={library.recentTo} className="font-semibold text-white hover:text-brand-indigo">
            {library.recentLabel}
          </Link>
        </p>
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:text-white">
          
          Open library
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>);

}