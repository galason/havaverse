import React from 'react';
import { Link } from 'react-router-dom';
import { hosts, podMemberships } from '../../data/podcast';
import { usePodcast } from '../../contexts/PodcastContext';

/**
 * Makes participation visible without turning the page into a financial
 * dashboard. Counts are real session state, so it never overstates.
 */
export function ImpactPanel() {
  const { supported, memberOf, collected, seats, ideas } = usePodcast();

  const lines = [
  { label: 'Creators supported', value: supported.length },
  { label: 'Memberships', value: memberOf.length },
  { label: 'Collections', value: collected.length },
  { label: 'Live seats', value: seats.length },
  { label: 'Ideas saved', value: ideas.length }];


  const total = lines.reduce((sum, line) => sum + line.value, 0);
  const firstHost = hosts[0];
  const firstMembership = podMemberships[0];

  return (
    <section
      aria-labelledby="listening-impact"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4 sm:p-5">
      
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="listening-impact" className="text-base font-bold tracking-tight text-white">
            Your listening has impact
          </h2>
          <p className="mt-0.5 text-xs text-mist-400">
            {total === 0 ?
            'Nothing yet this session. Support, membership and collections all appear here.' :
            'Everything here settles through HavaPay and is attributed to the creator.'}
          </p>
        </div>
        <Link
          to="/podcast/passport"
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
          
          See your journey
        </Link>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {lines.map((line) =>
        <div key={line.label} className="rounded-xl border border-white/5 bg-ink-850 p-3">
            <dd className="text-2xl font-bold tabular-nums text-white">{line.value}</dd>
            <dt className="text-[10px] uppercase tracking-wide text-mist-400">{line.label}</dt>
          </div>
        )}
      </dl>

      {total === 0 && firstHost && firstMembership &&
      <div className="mt-4 flex flex-wrap gap-2">
          <Link
          to={`/podcast/creator/${firstHost.id}?panel=support`}
          className="rounded-full bg-brand-violet px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
          
            Support a creator
          </Link>
          <Link
          to={`/podcast/creator/${firstMembership.hostId}?panel=support`}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
          
            Join a membership
          </Link>
        </div>
      }
    </section>);

}