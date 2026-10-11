import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../contexts/CommerceContext';
import { useMusic } from '../../contexts/MusicContext';
import { passport } from '../../data/music';

/**
 * Listening as participation. Reads from what the listener has actually done
 * in this session, on top of their existing record.
 */
export function ImpactPanel() {
  const { supported, memberOf, collected, tickets, backed } = useMusic();

  const rows = [
  { value: passport.creatorsSupported + supported.length, label: 'Creators supported' },
  { value: 6 + memberOf.length, label: 'Memberships' },
  { value: passport.collectedWorks + collected.length, label: 'Works collected' },
  { value: passport.liveExperiences + tickets.length, label: 'Live experiences' },
  { value: 2 + backed.length, label: 'Projects backed' }];


  return (
    <section
      aria-labelledby="listening-impact"
      className="overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      
      <div className="border-b border-white/5 p-4">
        <h2 id="listening-impact" className="text-sm font-bold tracking-tight text-white">
          Your listening has impact
        </h2>
        <p className="mt-0.5 text-[11px] text-mist-400">
          Real support, real people, a stronger creative economy. This is what you have put back.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-5">
        {rows.map((row) =>
        <div key={row.label} className="bg-ink-900 p-3.5">
            <dt className="text-[10px] uppercase tracking-wide text-mist-400">{row.label}</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-white">{row.value}</dd>
          </div>
        )}
      </dl>

      <div className="flex flex-wrap gap-2 p-4">
        <Link
          to="/music/artist/maya?panel=support"
          className="rounded-full bg-brand-violet px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
          
          Support a creator
        </Link>
        <Link
          to="/music/passport"
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
          
          See your impact
        </Link>
        <Link
          to="/wallet"
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
          
          HavaPay Music · {formatPrice(248360)} available
        </Link>
      </div>
    </section>);

}