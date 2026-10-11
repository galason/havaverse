import React from 'react';
import { Link } from 'react-router-dom';
import { passport } from '../../data/music';
import { useMusic } from '../../contexts/MusicContext';

/** The listener's cultural record — identity, not analytics. */
export function PassportPanel({ compact = false }: {compact?: boolean;}) {
  const { collected, supported, tickets, memberOf } = useMusic();

  const stats = [
  { value: passport.countries, label: 'Countries' },
  { value: passport.artists, label: 'Artists' },
  { value: passport.communities + memberOf.length, label: 'Communities' },
  { value: passport.liveExperiences + tickets.length, label: 'Live' },
  { value: passport.creatorsSupported + supported.length, label: 'Supported' },
  { value: passport.collectedWorks + collected.length, label: 'Collected' }];


  return (
    <section
      aria-labelledby="music-passport"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <div className="flex items-baseline gap-2">
        <h2 id="music-passport" className="text-sm font-bold tracking-tight text-white">
          Hava Music Passport
        </h2>
        <Link
          to="/music/passport"
          className="ml-auto text-[11px] font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
          
          View journey
        </Link>
      </div>
      <p className="mt-0.5 text-[11px] text-mist-400">Your sound journey, so far this year.</p>

      <dl className={`mt-3 grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-6'}`}>
        {stats.map((stat) =>
        <div key={stat.label} className="rounded-xl border border-white/5 bg-ink-850 p-2.5">
            <dt className="text-[10px] uppercase tracking-wide text-mist-400">{stat.label}</dt>
            <dd className="mt-0.5 text-lg font-bold tabular-nums text-white">{stat.value}</dd>
          </div>
        )}
      </dl>

      <p className="mt-3 text-[11px] text-mist-400">
        Most-played cities · {passport.topCities.join(' · ')}
      </p>
    </section>);

}