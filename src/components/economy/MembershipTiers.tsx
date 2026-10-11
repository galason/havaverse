import React from 'react';
import { Link } from 'react-router-dom';
import type { MembershipTier } from '../../types/creatorEconomy';
import { naira } from '../../utils/currency';

interface MembershipTiersProps {
  tiers: MembershipTier[];
  creatorShare: number;
}

export function MembershipTiers({ tiers, creatorShare }: MembershipTiersProps) {
  const members = tiers.reduce((a, t) => a + t.members, 0);
  const gross = tiers.reduce((a, t) => a + t.price * t.members, 0);
  const joined = tiers.reduce((a, t) => a + t.joinedThisMonth, 0);
  const left = tiers.reduce((a, t) => a + t.leftThisMonth, 0);

  if (tiers.length === 0) {
    return (
      <section className="rounded-2xl border border-white/5 bg-ink-900 px-6 py-10 text-center">
        <h2 className="text-base font-bold text-white">No membership tiers yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-mist-400">
          Tiers let fans support you monthly. They appear on your creator page once created.
        </p>
      </section>);

  }

  return (
    <section aria-labelledby="tiers-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="tiers-heading" className="text-lg font-bold tracking-tight text-white">
            Memberships
          </h2>
          <p className="mt-0.5 text-xs text-mist-400">
            {members} members · {naira(gross)} a month before the split · about{' '}
            {naira(gross * creatorShare / 100)} to you
          </p>
        </div>
        <p className="text-xs text-mist-300">
          <span className="text-brand-cyan">+{joined} joined</span> · {left} left this month
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {tiers.map((t) =>
        <li key={t.id} className="flex flex-col rounded-2xl border border-white/5 bg-ink-900 p-5">
            <h3 className="text-sm font-bold text-white">{t.name}</h3>
            <p className="mt-1 text-xs text-mist-400">{naira(t.price)} a month</p>
            <p className="mt-4 font-display text-3xl tracking-wide text-white">{t.members}</p>
            <p className="text-[11px] text-mist-400">
              members · +{t.joinedThisMonth} / −{t.leftThisMonth} this month
            </p>
            <ul className="mt-4 space-y-1 border-t border-white/5 pt-4 text-xs text-mist-300">
              {t.perks.map((p) =>
            <li key={p}>{p}</li>
            )}
            </ul>
            <p className="mt-auto pt-4 text-[11px] text-mist-400">
              {naira(t.price * t.members)} gross monthly
            </p>
          </li>
        )}
      </ul>

      <p className="text-[11px] text-mist-400">
        Fans join from your{' '}
        <Link to="/creator/adaezefilms" className="text-mist-200 underline-offset-2 hover:underline">
          creator page
        </Link>
        . Tier editing isn’t available yet.
      </p>
    </section>);

}