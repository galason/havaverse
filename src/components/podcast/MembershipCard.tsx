import React from 'react';
import { CheckIcon } from 'lucide-react';
import { formatPrice } from '../../contexts/CommerceContext';
import { usePodcast } from '../../contexts/PodcastContext';
import type { PodMembership } from '../../types/podcast';

export function MembershipCard({ membership }: {membership: PodMembership;}) {
  const { isMember, joinMembership, pending } = usePodcast();
  const joined = isMember(membership.id);
  const busy = pending === `member:${membership.id}`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-brand-violet/25 bg-ink-900 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-violet">
        Membership
      </p>
      <h3 className="mt-1 text-sm font-bold leading-tight text-white">{membership.name}</h3>
      <p className="mt-0.5 text-[11px] text-mist-400">
        {formatPrice(membership.pricePerMonth)} / month · {membership.members}
      </p>

      <ul className="mt-3 space-y-1.5">
        {membership.benefits.map((benefit) =>
        <li key={benefit} className="flex items-start gap-1.5 text-[11px] text-mist-200">
            <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-brand-cyan" aria-hidden="true" />
            {benefit}
          </li>
        )}
      </ul>

      <div className="mt-auto pt-3">
        <button
          type="button"
          disabled={joined || busy}
          onClick={() => joinMembership(membership.id, membership.name)}
          className={`w-full rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors duration-150 ease-entrance ${
          joined ?
          'cursor-default bg-brand-cyan/15 text-brand-cyan' :
          'bg-brand-violet text-white hover:bg-brand-magenta disabled:bg-ink-800'}`
          }>
          
          {joined ? 'Member' : busy ? 'Joining…' : 'Join membership'}
        </button>
      </div>
    </article>);

}