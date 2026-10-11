import React from 'react';
import { Link } from 'react-router-dom';
import { GlobeIcon } from 'lucide-react';
import {
  artists,
  editions,
  liveDates,
  memberships,
  passport,
  scenes,
  tracks } from
'../../data/music';
import { useMusic } from '../../contexts/MusicContext';
import { EmptyBlock } from '../../components/community/StateBlocks';
import { formatPrice } from '../../contexts/CommerceContext';

export function PassportPage() {
  const { collected, supported, tickets, memberOf, backed, likes } = useMusic();

  const stats = [
  { value: passport.countries, label: 'Countries discovered' },
  { value: passport.artists, label: 'Artists heard' },
  { value: passport.communities + memberOf.length, label: 'Communities joined' },
  { value: passport.liveExperiences + tickets.length, label: 'Live experiences' },
  { value: passport.creatorsSupported + supported.length, label: 'Creators supported' },
  { value: passport.collectedWorks + collected.length, label: 'Works collected' }];


  const collectedEditions = editions.filter((e) => collected.includes(e.id));
  const heldTickets = liveDates.filter((l) => tickets.includes(l.id));
  const joined = memberships.filter((m) => memberOf.includes(m.id));
  const supportedArtists = artists.filter((a) => supported.includes(a.id));
  const likedTracks = tracks.filter((t) => likes.includes(t.id));

  const nothingYet =
  collectedEditions.length === 0 &&
  heldTickets.length === 0 &&
  joined.length === 0 &&
  supportedArtists.length === 0;

  return (
    <div className="p-4 pb-12 sm:p-5">
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-violet">
          HavaVerse Music
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Hava Music Passport
        </h1>
        <p className="mt-1 max-w-xl text-sm text-mist-400">
          A record of where your listening has taken you and what you have put back. Identity,
          not analytics.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) =>
        <div key={stat.label} className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <dt className="text-[10px] uppercase tracking-wide text-mist-400">{stat.label}</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums text-white">{stat.value}</dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="your-cities" className="mt-8">
        <h2
          id="your-cities"
          className="mb-3 flex items-center gap-1.5 text-base font-bold tracking-tight text-white">
          
          <GlobeIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
          Your sound, by city
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {passport.topCities.map((city, i) => {
            const scene = scenes.find((s) => s.city === city);
            return (
              <li key={city}>
                <Link
                  to={`/search?q=${encodeURIComponent(city)}`}
                  className="block rounded-2xl border border-white/5 bg-ink-900 p-4 transition-colors duration-150 ease-entrance hover:border-white/20">
                  
                  <span className="block text-[10px] uppercase tracking-wide text-mist-400">
                    #{i + 1}
                  </span>
                  <span className="mt-0.5 block text-sm font-bold text-white">{city}</span>
                  <span className="mt-0.5 block text-[11px] text-mist-400">
                    {scene ? scene.genres.slice(0, 2).join(' · ') : 'Mixed'}
                  </span>
                </Link>
              </li>);

          })}
        </ul>
      </section>

      {nothingYet ?
      <div className="mt-8">
          <EmptyBlock
          title="Nothing in this session yet"
          body="Support an artist, collect an edition or hold a ticket and it is recorded here against your identity."
          action={
          <Link
            to="/music"
            className="rounded-full bg-brand-violet px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
            
                Back to Music
              </Link>
          } />
        
        </div> :

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {supportedArtists.length > 0 &&
        <section aria-labelledby="pp-supported">
              <h2 id="pp-supported" className="mb-2.5 text-base font-bold text-white">
                Creators you support
              </h2>
              <ul className="space-y-2">
                {supportedArtists.map((artist) =>
            <li key={artist.id}>
                    <Link
                to={`/music/artist/${artist.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
                
                      <img src={artist.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">
                          {artist.name}
                        </span>
                        <span className="block text-[11px] text-mist-400">{artist.city}</span>
                      </span>
                    </Link>
                  </li>
            )}
              </ul>
            </section>
        }

          {joined.length > 0 &&
        <section aria-labelledby="pp-memberships">
              <h2 id="pp-memberships" className="mb-2.5 text-base font-bold text-white">
                Memberships
              </h2>
              <ul className="space-y-2">
                {joined.map((membership) =>
            <li
              key={membership.id}
              className="rounded-2xl border border-brand-violet/25 bg-ink-900 p-3">
              
                    <p className="text-sm font-semibold text-white">{membership.name}</p>
                    <p className="text-[11px] text-mist-400">
                      {formatPrice(membership.pricePerMonth)} / month ·{' '}
                      {membership.benefits.length} benefits active
                    </p>
                  </li>
            )}
              </ul>
            </section>
        }

          {collectedEditions.length > 0 &&
        <section aria-labelledby="pp-collected">
              <h2 id="pp-collected" className="mb-2.5 text-base font-bold text-white">
                Collected works
              </h2>
              <ul className="space-y-2">
                {collectedEditions.map((edition) =>
            <li
              key={edition.id}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3">
              
                    <img src={edition.image} alt="" className="h-11 w-14 rounded-lg object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">
                        {edition.name}
                      </span>
                      <span className="block text-[11px] text-mist-400">{edition.kind}</span>
                    </span>
                  </li>
            )}
              </ul>
            </section>
        }

          {heldTickets.length > 0 &&
        <section aria-labelledby="pp-tickets">
              <h2 id="pp-tickets" className="mb-2.5 text-base font-bold text-white">
                Tickets held
              </h2>
              <ul className="space-y-2">
                {heldTickets.map((date) =>
            <li key={date.id}>
                    <Link
                to={`/music/live/${date.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
                
                      <img src={date.image} alt="" className="h-11 w-14 rounded-lg object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">
                          {date.title}
                        </span>
                        <span className="block text-[11px] text-mist-400">
                          {date.date} · {date.city}
                        </span>
                      </span>
                    </Link>
                  </li>
            )}
              </ul>
            </section>
        }
        </div>
      }

      {likedTracks.length > 0 &&
      <p className="mt-8 text-[11px] text-mist-400">
          {likedTracks.length} liked {likedTracks.length === 1 ? 'track' : 'tracks'} ·{' '}
          {backed.length} {backed.length === 1 ? 'project' : 'projects'} backed this session.
        </p>
      }
    </div>);

}