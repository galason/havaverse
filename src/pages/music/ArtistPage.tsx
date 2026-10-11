import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BadgeCheckIcon, MessagesSquareIcon, PlayIcon } from 'lucide-react';
import { musicApi } from '../../services/musicApi';
import { ErrorBlock, EmptyBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { TrackRow } from '../../components/music/TrackRow';
import { EditionCard } from '../../components/music/EditionCard';
import { LiveCard } from '../../components/music/LiveCard';
import { MembershipCard } from '../../components/music/MembershipCard';
import { ProjectCard } from '../../components/music/ProjectCard';
import { SupportPanel } from '../../components/music/SupportPanel';
import { EconomyPanel } from '../../components/music/EconomyPanel';
import { useApp } from '../../contexts/AppContext';
import { useMusic } from '../../contexts/MusicContext';
import type {
  Artist,
  LiveDate,
  Membership,
  MusicEdition,
  SupportProject,
  Track } from
'../../types/music';

const panels = ['listen', 'live', 'support', 'collect', 'community', 'story'] as const;
type Panel = (typeof panels)[number];

const panelLabel: Record<Panel, string> = {
  listen: 'Listen',
  live: 'Live',
  support: 'Support',
  collect: 'Collect',
  community: 'Community',
  story: 'Story'
};

export function ArtistPage() {
  const { artistId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { isFollowing, toggleFollow } = useApp();
  const { play } = useMusic();

  const [artist, setArtist] = React.useState<Artist | null>(null);
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [editions, setEditions] = React.useState<MusicEdition[]>([]);
  const [live, setLive] = React.useState<LiveDate[]>([]);
  const [memberships, setMemberships] = React.useState<Membership[]>([]);
  const [projects, setProjects] = React.useState<SupportProject[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [a, t, e, l, m, p] = await Promise.all([
    musicApi.getArtist(artistId),
    musicApi.listTracks(),
    musicApi.listEditions(artistId),
    musicApi.listLive(artistId),
    musicApi.listMemberships(artistId),
    musicApi.listProjects(artistId)]
    );
    if (a.ok && a.data) {
      setArtist(a.data);
      setTracks(t.ok ? t.data.filter((track) => track.artistId === artistId) : []);
      setEditions(e.ok ? e.data : []);
      setLive(l.ok ? l.data : []);
      setMemberships(m.ok ? m.data : []);
      setProjects(p.ok ? p.data : []);
      setStatus('ready');
    } else {
      setStatus('missing');
    }
  }, [artistId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const paramPanel = params.get('panel') as Panel | null;
  const panel: Panel = panels.includes(paramPanel as Panel) ? paramPanel as Panel : 'listen';
  const setPanel = (next: Panel) =>
  setParams(next === 'listen' ? {} : { panel: next }, { replace: true });

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading artist…" />
      </div>);

  }

  if (status === 'missing' || !artist) {
    return (
      <div className="p-5">
        <ErrorBlock message="That artist is not on HavaVerse Music." onRetry={load} />
      </div>);

  }

  const key = `artist:${artist.id}`;
  const following = isFollowing(key);

  return (
    <div className="pb-12">
      <div className="relative h-44 w-full overflow-hidden sm:h-60">
        <img src={artist.cover} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_8%,rgb(var(--c-ink-950)/0.25)_100%)]" />
      </div>

      <header className="flex flex-wrap items-end gap-4 px-4 pt-4 sm:px-5">
        <img
          src={artist.avatar}
          alt=""
          className="h-20 w-20 shrink-0 rounded-full border-2 border-ink-950 object-cover sm:h-24 sm:w-24" />
        
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {artist.name}
            {artist.verified &&
            <BadgeCheckIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />
            }
          </h1>
          <p className="text-xs text-mist-400">
            {artist.disciplines} · {artist.city}, {artist.country}
          </p>
          <p className="mt-0.5 text-xs text-mist-400">
            {artist.listeners} listeners · {artist.supporters} supporters
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => tracks[0] && play(tracks[0], tracks)}
            disabled={tracks.length === 0}
            className="flex items-center gap-1.5 rounded-full bg-brand-violet px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-mist-400">
            
            <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            Listen
          </button>
          <button
            type="button"
            onClick={() => toggleFollow(key)}
            aria-pressed={following}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance ${
            following ?
            'border border-white/20 text-mist-200 hover:text-white' :
            'border border-white/25 text-white hover:bg-white/10'}`
            }>
            
            {following ? 'Following' : 'Follow'}
          </button>
          {artist.communitySlug &&
          <Link
            to={`/community/${artist.communitySlug}`}
            className="flex items-center gap-1.5 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
              <MessagesSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Community
            </Link>
          }
        </div>
      </header>

      <div className="px-4 sm:px-5">
        <div
          role="tablist"
          aria-label="Artist sections"
          className="no-scrollbar mt-5 flex gap-2 overflow-x-auto border-b border-white/5 pb-2">
          
          {panels.map((option) =>
          <button
            key={option}
            role="tab"
            type="button"
            aria-selected={panel === option}
            onClick={() => setPanel(option)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ease-entrance ${
            panel === option ?
            'bg-brand-violet text-white' :
            'text-mist-300 hover:bg-white/5 hover:text-white'}`
            }>
            
              {panelLabel[option]}
            </button>
          )}
        </div>

        <div className="mt-5">
          {panel === 'listen' && (
          tracks.length === 0 ?
          <EmptyBlock title="Nothing released yet" body="This artist has not published music on HavaVerse." /> :

          <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
                {tracks.map((track, i) =>
            <TrackRow key={track.id} track={track} index={i} queue={tracks} />
            )}
              </div>)
          }

          {panel === 'live' && (
          live.length === 0 ?
          <EmptyBlock
            title="No dates announced"
            body="When this artist announces a date it appears here and in HavaVerse Live." /> :


          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {live.map((date) =>
            <li key={date.id}>
                    <LiveCard date={date} />
                  </li>
            )}
              </ul>)
          }

          {panel === 'support' &&
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-4">
                {projects.map((project) =>
              <ProjectCard key={project.id} project={project} />
              )}
                {memberships.length > 0 &&
              <ul className="grid gap-4 sm:grid-cols-2">
                    {memberships.map((membership) =>
                <li key={membership.id}>
                        <MembershipCard membership={membership} />
                      </li>
                )}
                  </ul>
              }
                {projects.length === 0 && memberships.length === 0 &&
              <EmptyBlock
                title="No memberships or projects yet"
                body="You can still support this artist directly." />

              }
              </div>
              <div className="space-y-4">
                <SupportPanel artist={artist} />
                <EconomyPanel />
              </div>
            </div>
          }

          {panel === 'collect' && (
          editions.length === 0 ?
          <EmptyBlock
            title="No editions open"
            body="Limited editions from this artist will appear here when they open." /> :


          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {editions.map((edition) =>
            <li key={edition.id}>
                    <EditionCard edition={edition} />
                  </li>
            )}
              </ul>)
          }

          {panel === 'community' &&
          <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">Where the conversation is</h2>
              <p className="mt-1 text-xs leading-relaxed text-mist-300">
                {artist.name}'s listeners gather in the communities anchored to their work rather
                than in a separate fan page.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {artist.communitySlug &&
              <Link
                to={`/community/${artist.communitySlug}`}
                className="rounded-full bg-brand-violet px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
                
                    Open the community
                  </Link>
              }
                <Link
                to="/events"
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
                
                  Listening parties
                </Link>
              </div>
            </div>
          }

          {panel === 'story' &&
          <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">The story</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-200">{artist.bio}</p>
              <p className="mt-3 text-[11px] text-mist-400">
                {artist.tagline}
              </p>
            </div>
          }
        </div>
      </div>
    </div>);

}