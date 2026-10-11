import React from 'react';
import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import {
  cities,
  conversationPassport,
  drops,
  episodes,
  hosts,
  liveConversations,
  podMemberships,
  shows } from
'../../data/podcast';
import { EmptyBlock } from '../../components/community/StateBlocks';
import { EpisodeRow } from '../../components/podcast/EpisodeRow';
import { formatClock, usePodcast } from '../../contexts/PodcastContext';
import { formatPrice } from '../../contexts/CommerceContext';

export function PodcastPassportPage() {
  const { ideas, supported, memberOf, collected, seats, saved, followed } = usePodcast();

  const stats = [
  { value: conversationPassport.topics, label: 'Topics explored' },
  { value: conversationPassport.cities, label: 'Cities discovered' },
  { value: conversationPassport.creators, label: 'Creators heard' },
  { value: conversationPassport.communities + memberOf.length, label: 'Communities joined' },
  { value: conversationPassport.liveConversations + seats.length, label: 'Live conversations' },
  { value: conversationPassport.creatorsSupported + supported.length, label: 'Creators supported' },
  { value: conversationPassport.savedIdeas + ideas.length, label: 'Saved ideas' },
  { value: collected.length, label: 'Collections claimed' }];


  const savedEpisodes = episodes.filter((e) => saved.includes(e.id));
  const followedShows = shows.filter((s) => followed.includes(s.id));
  const supportedHosts = hosts.filter((h) => supported.includes(h.id));
  const joined = podMemberships.filter((m) => memberOf.includes(m.id));
  const heldSeats = liveConversations.filter((l) => seats.includes(l.id));
  const claimed = drops.filter((d) => collected.includes(d.id));

  return (
    <div className="p-4 pb-12 sm:p-5">
      <header className="mb-6">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">
          <CompassIcon className="h-3.5 w-3.5" aria-hidden="true" />
          HavaVerse Podcast
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Your conversation passport
        </h1>
        <p className="mt-1 max-w-xl text-sm text-mist-400">
          What you have listened to, argued with and kept. An intellectual record rather than a
          play count.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) =>
        <div key={stat.label} className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <dt className="text-[10px] uppercase tracking-wide text-mist-400">{stat.label}</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums text-white">{stat.value}</dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="your-cities" className="mt-8">
        <h2 id="your-cities" className="mb-3 text-base font-bold tracking-tight text-white">
          Where your listening comes from
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {cities.slice(0, 5).map((city, i) =>
          <li key={city.id}>
              <Link
              to={`/search?q=${encodeURIComponent(city.city)}`}
              className="block rounded-2xl border border-white/5 bg-ink-900 p-4 transition-colors duration-150 ease-entrance hover:border-white/20">
              
                <span className="block text-[10px] uppercase tracking-wide text-mist-400">
                  #{i + 1}
                </span>
                <span className="mt-0.5 block text-sm font-bold text-white">{city.city}</span>
                <span className="mt-0.5 block text-[11px] text-mist-400">
                  {city.topics.slice(0, 2).join(' · ')}
                </span>
              </Link>
            </li>
          )}
        </ul>
      </section>

      {ideas.length > 0 &&
      <section aria-labelledby="saved-ideas" className="mt-8">
          <h2 id="saved-ideas" className="mb-3 text-base font-bold tracking-tight text-white">
            Ideas you kept
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {ideas.map((idea) =>
          <li key={idea.momentId} className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                <blockquote className="text-sm leading-relaxed text-white">
                  “{idea.text}”
                </blockquote>
                <p className="mt-1.5 text-[11px] text-mist-400">{idea.speaker}</p>
                <Link
              to={`/podcast/episode/${idea.episodeId}`}
              className="mt-2 inline-block text-[11px] font-semibold tabular-nums text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
              
                  {formatClock(idea.atSeconds)} — open the episode
                </Link>
              </li>
          )}
          </ul>
        </section>
      }

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {supportedHosts.length > 0 &&
        <section aria-labelledby="pp-supported">
            <h2 id="pp-supported" className="mb-2.5 text-base font-bold text-white">
              Creators you support
            </h2>
            <ul className="space-y-2">
              {supportedHosts.map((host) =>
            <li key={host.id}>
                  <Link
                to={`/podcast/creator/${host.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
                
                    <img src={host.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">
                        {host.name}
                      </span>
                      <span className="block text-[11px] text-mist-400">{host.city}</span>
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

        {claimed.length > 0 &&
        <section aria-labelledby="pp-collections">
            <h2 id="pp-collections" className="mb-2.5 text-base font-bold text-white">
              Collections
            </h2>
            <ul className="space-y-2">
              {claimed.map((drop) =>
            <li key={drop.id}>
                  <Link
                to={`/podcast/drop/${drop.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
                
                    <img src={drop.image} alt="" className="h-11 w-14 rounded-lg object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">
                        {drop.name}
                      </span>
                      <span className="block text-[11px] text-mist-400">{drop.kind}</span>
                    </span>
                  </Link>
                </li>
            )}
            </ul>
          </section>
        }

        {heldSeats.length > 0 &&
        <section aria-labelledby="pp-seats">
            <h2 id="pp-seats" className="mb-2.5 text-base font-bold text-white">
              Seats held
            </h2>
            <ul className="space-y-2">
              {heldSeats.map((event) =>
            <li key={event.id}>
                  <Link
                to={`/podcast/live/${event.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
                
                    <img src={event.image} alt="" className="h-11 w-14 rounded-lg object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">
                        {event.title}
                      </span>
                      <span className="block text-[11px] text-mist-400">
                        {event.date} · {event.city}
                      </span>
                    </span>
                  </Link>
                </li>
            )}
            </ul>
          </section>
        }
      </div>

      <section aria-labelledby="pp-saved" className="mt-8">
        <h2 id="pp-saved" className="mb-3 text-base font-bold tracking-tight text-white">
          Saved for later
        </h2>
        {savedEpisodes.length === 0 ?
        <EmptyBlock
          title="Nothing saved yet"
          body="Save an episode from anywhere and it waits here at the second you left it."
          action={
          <Link
            to="/podcast"
            className="rounded-full bg-brand-violet px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
            
                Back to Podcast
              </Link>
          } /> :


        <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
            {savedEpisodes.map((episode) =>
          <EpisodeRow key={episode.id} episode={episode} showProgress />
          )}
          </div>
        }
      </section>

      {followedShows.length > 0 &&
      <p className="mt-6 text-[11px] text-mist-400">
          Following {followedShows.length} {followedShows.length === 1 ? 'show' : 'shows'}:{' '}
          {followedShows.map((s) => s.title).join(', ')}.
        </p>
      }
    </div>);

}