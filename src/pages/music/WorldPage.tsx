import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessagesSquareIcon, PlayIcon } from 'lucide-react';
import { musicApi } from '../../services/musicApi';
import { artists as allArtists, editions as allEditions, liveDates } from '../../data/music';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { TrackRow } from '../../components/music/TrackRow';
import { ArtistCard } from '../../components/music/ArtistCard';
import { EditionCard } from '../../components/music/EditionCard';
import { LiveCard } from '../../components/music/LiveCard';
import { useMusic } from '../../contexts/MusicContext';
import type { MusicWorld, Track } from '../../types/music';

export function WorldPage() {
  const { worldId = '' } = useParams();
  const { play } = useMusic();

  const [world, setWorld] = React.useState<MusicWorld | null>(null);
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [w, t] = await Promise.all([musicApi.getWorld(worldId), musicApi.listTracks(worldId)]);
    if (w.ok && w.data) {
      setWorld(w.data);
      setTracks(t.ok ? t.data : []);
      setStatus('ready');
    } else {
      setStatus('missing');
    }
  }, [worldId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Entering the world…" />
      </div>);

  }

  if (status === 'missing' || !world) {
    return (
      <div className="p-5">
        <ErrorBlock message="That world does not exist yet." onRetry={load} />
      </div>);

  }

  const worldArtistIds = [...new Set(tracks.map((t) => t.artistId))];
  const worldArtists = allArtists.filter((a) => worldArtistIds.includes(a.id));
  const worldEditions = allEditions.filter((e) => worldArtistIds.includes(e.artistId));
  const worldLive = liveDates.filter((l) => worldArtistIds.includes(l.artistId));

  return (
    <div className="pb-12">
      <div className="relative min-h-[260px] sm:min-h-[340px]">
        <img src={world.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_10%,rgb(var(--c-ink-950)/0.3)_100%)]" />
        <div className="relative flex min-h-[260px] flex-col justify-end p-5 sm:min-h-[340px] sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            Music world · {world.city}
          </p>
          <h1 className="mt-1.5 font-display text-4xl uppercase leading-none tracking-tight text-white sm:text-6xl">
            {world.name}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-mist-200">{world.blurb}</p>
          <p className="mt-2 text-[11px] text-mist-400">
            {world.artistCount} artists · {world.trackCount} tracks · {world.communityCount}{' '}
            communities · {world.liveCount} live experiences
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => tracks[0] && play(tracks[0], tracks)}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 rounded-full bg-brand-violet px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-mist-400">
              
              <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Play this world
            </button>
            <Link
              to={world.communityTo}
              className="flex items-center gap-1.5 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
              <MessagesSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Community
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-4 sm:p-5">
        <section aria-labelledby="world-tracks">
          <h2 id="world-tracks" className="mb-3 text-base font-bold tracking-tight text-white">
            The music
          </h2>
          <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
            {tracks.map((track, i) =>
            <TrackRow key={track.id} track={track} index={i} queue={tracks} />
            )}
          </div>
        </section>

        {worldArtists.length > 0 &&
        <section aria-labelledby="world-artists">
            <h2 id="world-artists" className="mb-3 text-base font-bold tracking-tight text-white">
              Artists in this world
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {worldArtists.map((artist) =>
            <li key={artist.id}>
                  <ArtistCard artist={artist} />
                </li>
            )}
            </ul>
          </section>
        }

        {worldEditions.length > 0 &&
        <section aria-labelledby="world-editions">
            <h2 id="world-editions" className="mb-3 text-base font-bold tracking-tight text-white">
              Collect from this world
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {worldEditions.map((edition) =>
            <li key={edition.id}>
                  <EditionCard edition={edition} />
                </li>
            )}
            </ul>
          </section>
        }

        {worldLive.length > 0 &&
        <section aria-labelledby="world-live">
            <h2 id="world-live" className="mb-3 text-base font-bold tracking-tight text-white">
              Live from {world.city}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {worldLive.map((date) =>
            <li key={date.id}>
                  <LiveCard date={date} />
                </li>
            )}
            </ul>
          </section>
        }
      </div>
    </div>);

}