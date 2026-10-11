import React from 'react';
import { Link } from 'react-router-dom';
import { FlameIcon, GlobeIcon, RadioTowerIcon, SparklesIcon, UsersIcon } from 'lucide-react';
import { musicApi } from '../services/musicApi';
import { listeningRooms } from '../data/music';
import { SectionHeader } from '../components/community/SectionHeader';
import { ErrorBlock, SkeletonRows } from '../components/community/StateBlocks';
import { MusicHero } from '../components/music/MusicHero';
import { GraphRail } from '../components/music/GraphRail';
import { SoundMap } from '../components/music/SoundMap';
import { WorldCard } from '../components/music/WorldCard';
import { TrackRow } from '../components/music/TrackRow';
import { ArtistCard } from '../components/music/ArtistCard';
import { EditionCard } from '../components/music/EditionCard';
import { LiveCard } from '../components/music/LiveCard';
import { ProjectCard } from '../components/music/ProjectCard';
import { ImpactPanel } from '../components/music/ImpactPanel';
import { PassportPanel } from '../components/music/PassportPanel';
import { BuildMySound } from '../components/music/BuildMySound';
import { EconomyPanel } from '../components/music/EconomyPanel';
import type {
  Artist,
  LiveDate,
  MusicEdition,
  MusicWorld,
  SupportProject,
  Track } from
'../types/music';

export function Music() {
  const [worlds, setWorlds] = React.useState<MusicWorld[]>([]);
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [artists, setArtists] = React.useState<Artist[]>([]);
  const [editions, setEditions] = React.useState<MusicEdition[]>([]);
  const [live, setLive] = React.useState<LiveDate[]>([]);
  const [projects, setProjects] = React.useState<SupportProject[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [w, t, a, e, l, p] = await Promise.all([
    musicApi.listWorlds(),
    musicApi.listTracks(),
    musicApi.listArtists(),
    musicApi.listEditions(),
    musicApi.listLive(),
    musicApi.listProjects()]
    );
    if (w.ok && t.ok && a.ok && e.ok && l.ok && p.ok) {
      setWorlds(w.data);
      setTracks(t.data);
      setArtists(a.data);
      setEditions(e.data);
      setLive(l.data);
      setProjects(p.data);
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorBlock message="HavaVerse Music could not be loaded." onRetry={load} />
      </div>);

  }

  const featured = tracks[0];
  const becauseYouListened = tracks.filter((t) => t.worldId === 'lagos-after-dark');

  return (
    <div className="p-4 pb-12 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-9">
          <MusicHero />

          {featured && <GraphRail nodes={featured.graph} />}

          <section aria-labelledby="sounds-without-borders">
            <SectionHeader
              id="sounds-without-borders"
              title="Sounds without borders"
              subtitle="Global sounds. Local culture. One ecosystem."
              icon={<GlobeIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />} />
            
            <SoundMap />
          </section>

          <section aria-labelledby="music-worlds">
            <SectionHeader
              id="music-worlds"
              title="Music worlds"
              subtitle="Step into a cultural universe. Not a playlist — a scene with an economy." />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {worlds.map((world) =>
              <li key={world.id}>
                    <WorldCard world={world} />
                  </li>
              )}
              </ul>
            }
          </section>

          <ImpactPanel />

          <section aria-labelledby="because-you-listened">
            <SectionHeader
              id="because-you-listened"
              title="Because you listened to Night Line"
              subtitle="Drawn through the content graph, not from what other people bought."
              icon={<SparklesIcon className="h-5 w-5 text-brand-violet" aria-hidden="true" />} />
            
            {status === 'loading' ?
            <SkeletonRows rows={3} /> :

            <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
                {becauseYouListened.map((track, i) =>
              <TrackRow
                key={track.id}
                track={track}
                index={i}
                queue={becauseYouListened} />

              )}
              </div>
            }
          </section>

          <section aria-labelledby="featured-creators">
            <SectionHeader
              id="featured-creators"
              title="Featured creators"
              subtitle="Extraordinary artists. Real communities." />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {artists.map((artist) =>
              <li key={artist.id}>
                    <ArtistCard artist={artist} />
                  </li>
              )}
              </ul>
            }
          </section>

          <section aria-labelledby="drops-collections">
            <SectionHeader
              id="drops-collections"
              title="Drops and collections"
              subtitle="Limited editions. Exclusive experiences."
              icon={<FlameIcon className="h-5 w-5 text-brand-amber" aria-hidden="true" />} />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {editions.map((edition) =>
              <li key={edition.id}>
                    <EditionCard edition={edition} />
                  </li>
              )}
              </ul>
            }
          </section>

          <section aria-labelledby="back-the-work">
            <SectionHeader
              id="back-the-work"
              title="Back the next record"
              subtitle="Fund the work before it exists, and be credited on it." />
            
            <div className="space-y-4">
              {projects.map((project) =>
              <ProjectCard key={project.id} project={project} />
              )}
            </div>
          </section>

          <section aria-labelledby="live-music">
            <SectionHeader
              id="live-music"
              title="Live"
              subtitle="Concerts, listening parties and sessions you can actually be in."
              icon={<RadioTowerIcon className="h-5 w-5 text-live" aria-hidden="true" />}
              actionTo="/music/live"
              actionLabel="All dates" />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {live.map((date) =>
              <li key={date.id}>
                    <LiveCard date={date} />
                  </li>
              )}
              </ul>
            }
          </section>

          <PassportPanel />

          <p className="rounded-2xl border border-white/5 bg-ink-900 px-4 py-3.5 text-[11px] leading-relaxed text-mist-300">
            Listening, support, memberships, collections and tickets all settle through{' '}
            <Link to="/wallet" className="font-semibold text-brand-cyan hover:text-white">
              HavaPay
            </Link>{' '}
            and are attributed to the artist in their ledger. Streams are one line in that
            picture, not the whole of it.
          </p>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <BuildMySound />
          <EconomyPanel />

          <section
            aria-labelledby="listening-rooms"
            className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            
            <h2
              id="listening-rooms"
              className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">
              
              <UsersIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
              Listening rooms
            </h2>
            <p className="mt-0.5 text-[11px] text-mist-400">Live now across the communities.</p>
            <ul className="mt-2.5 space-y-2">
              {listeningRooms.map((room) =>
              <li key={room.id}>
                  <Link
                  to={room.to}
                  className="block rounded-xl border border-white/5 bg-ink-850 p-2.5 transition-colors duration-150 ease-entrance hover:border-white/20">
                  
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-live" aria-hidden="true" />
                      {room.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-mist-400">{room.detail}</span>
                  </Link>
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-brand-amber/25 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Release your own</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-mist-300">
              Publish from Studio, attach editions and dates, and the same graph that recommends
              your record routes the money back to you.
            </p>
            <Link
              to="/studio"
              className="mt-3 block rounded-lg bg-brand-amber px-3 py-2 text-center text-xs font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-brand-amber/85">
              
              Open Studio
            </Link>
          </section>
        </aside>
      </div>
    </div>);

}