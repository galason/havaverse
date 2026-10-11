import React from 'react';
import { CheckIcon } from 'lucide-react';
import { formatPrice } from '../../contexts/CommerceContext';
import { useMusic } from '../../contexts/MusicContext';
import type { Membership } from '../../types/music';

export function MembershipCard({ membership }: {membership: Membership;}) {
  const { isMember, joinMembership, pending } = useMusic();
  const joined = isMember(membership.id);
  const busy = pending === `member:${membership.id}`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-brand-violet/25 bg-ink-900 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-violet">
        Membership
      </p>
      <h3 className="mt-0.5 text-base font-bold tracking-tight text-white">{membership.name}</h3>
      <p className="mt-0.5 text-[11px] text-mist-400">{membership.members}</p>

      <ul className="mt-3 space-y-1">
        {membership.benefits.map((benefit) =>
        <li key={benefit} className="flex items-start gap-1.5 text-xs text-mist-200">
            <CheckIcon
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-violet"
            aria-hidden="true" />
          
            {benefit}
          </li>
        )}
      </ul>

      <div className="mt-auto pt-4">
        <p className="text-lg font-bold text-white">
          {formatPrice(membership.pricePerMonth)}
          <span className="text-[11px] font-normal text-mist-400"> / month</span>
        </p>
        <button
          type="button"
          disabled={joined || busy}
          onClick={() => joinMembership(membership.id, membership.name)}
          className={`mt-2 w-full rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors duration-150 ease-entrance ${
          joined ?
          'cursor-default bg-brand-cyan/15 text-brand-cyan' :
          'bg-brand-violet text-white hover:bg-brand-magenta disabled:bg-ink-800'}`
          }>
          
          {joined ? "You're a member" : busy ? 'Joining…' : 'Join membership'}
        </button>
        <p className="mt-2 text-[10px] leading-relaxed text-mist-400">
          Billed monthly through HavaPay. Cancel any time from your wallet.
        </p>
      </div>
    </article>);

}