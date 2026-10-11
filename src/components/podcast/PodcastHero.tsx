import React from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, MapPinIcon, PauseIcon, PlayIcon, UsersIcon } from 'lucide-react';
import { episodes, hosts, shows } from '../../data/podcast';
import { Waveform } from '../music/Waveform';
import { usePodcast } from '../../contexts/PodcastContext';

/**
 * Editorial rather than promotional. The hero opens on a conversation, and
 * every fact under the headline is a way into the rest of the ecosystem.
 */
export function PodcastHero() {
  const { current, playing, play, toggle, elapsed } = usePodcast();
  const episode = episodes[0];
  const show = shows.find((s) => s.id === episode.showId);
  const host = hosts.find((h) => h.id === show?.hostId);
  const active = current?.id === episode.id;

  if (!show || !host) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/5">
      <img
        src={episode.artwork}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center" />
      
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--c-ink-950))_18%,rgb(var(--c-ink-950)/0.75)_52%,rgb(var(--c-ink-950)/0.25)_100%)]" />

      <div className="relative flex min-h-[340px] flex-col justify-end p-5 sm:min-h-[440px] sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            HavaVerse Podcast
          </span>
          <span className="rounded-full border border-brand-cyan/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-cyan">
            {show.origin}
          </span>
        </div>

        <h1 className="mt-3 max-w-2xl font-display text-4xl uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
          The city that never stops talking
        </h1>
        <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-mist-200 sm:text-base">
          {show.tagline}
        </p>

        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-mist-300">
          <li>
            Season {String(show.seasons).padStart(2, '0')} · Episode{' '}
            {String(episode.number).padStart(2, '0')}
          </li>
          <li className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" aria-hidden="true" />
            {Math.round(episode.durationSeconds / 60)} min
          </li>
          <li className="flex items-center gap-1">
            <MapPinIcon className="h-3 w-3" aria-hidden="true" />
            {host.city}
          </li>
          <li>{show.listeners} listeners</li>
          <li className="flex items-center gap-1">
            <UsersIcon className="h-3 w-3" aria-hidden="true" />
            {show.communityMembers} community members
          </li>
        </ul>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => active ? toggle() : play(episode)}
            className="flex items-center gap-2 rounded-full bg-brand-violet px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
            
            {active && playing ?
            <PauseIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> :

            <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            }
            {active && playing ? 'Pause episode' : 'Play episode'}
          </button>
          <Link
            to={`/podcast/show/${show.id}`}
            className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
            Explore show
          </Link>
          <Link
            to={`/community/${show.communitySlug}`}
            className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
            Join community
          </Link>
        </div>

        <div className="mt-5 h-10 max-w-3xl opacity-70">
          <Waveform
            seed={episode.id}
            progress={active ? elapsed / episode.durationSeconds : 0}
            bars={96} />
          
        </div>
      </div>
    </section>);

}