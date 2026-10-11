import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, HeartIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { musicApi } from '../../services/musicApi';
import { artists, editions as allEditions, liveDates, worlds } from '../../data/music';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { GraphRail } from '../../components/music/GraphRail';
import { Waveform } from '../../components/music/Waveform';
import { EditionCard } from '../../components/music/EditionCard';
import { LiveCard } from '../../components/music/LiveCard';
import { SupportPanel } from '../../components/music/SupportPanel';
import { TrackRow } from '../../components/music/TrackRow';
import { formatDuration, useMusic } from '../../contexts/MusicContext';
import type { Track } from '../../types/music';

export function TrackPage() {
  const { trackId = '' } = useParams();
  const navigate = useNavigate();
  const { play, toggle, current, playing, elapsed, isLiked, toggleLike } = useMusic();

  const [track, setTrack] = React.useState<Track | null>(null);
  const [siblings, setSiblings] = React.useState<Track[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const one = await musicApi.getTrack(trackId);
    if (!one.ok || !one.data) {
      setStatus('missing');
      return;
    }
    setTrack(one.data);
    const rest = await musicApi.listTracks(one.data.worldId);
    setSiblings(rest.ok ? rest.data.filter((t) => t.id !== one.data!.id) : []);
    setStatus('ready');
  }, [trackId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading track…" />
      </div>);

  }

  if (status === 'missing' || !track) {
    return (
      <div className="p-5">
        <ErrorBlock message="That track is not available." onRetry={load} />
      </div>);

  }

  const artist = artists.find((a) => a.id === track.artistId);
  const world = worlds.find((w) => w.id === track.worldId);
  const active = current?.id === track.id;
  const liked = isLiked(track.id);
  const trackEditions = allEditions.filter(
    (e) => e.trackId === track.id || e.artistId === track.artistId && !e.trackId
  );
  const trackLive = liveDates.filter((l) => l.id === track.liveEventId);

  return (
    <div className="p-4 pb-12 sm:p-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back
      </button>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <img
          src={track.artwork}
          alt={`Artwork for ${track.title}`}
          className="aspect-square w-full rounded-2xl border border-white/5 object-cover" />
        

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-violet">
            {track.releaseKind} · {track.language}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {track.title}
          </h1>
          {artist &&
          <Link
            to={`/music/artist/${artist.id}`}
            className="mt-1 inline-block text-sm text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
            
              {artist.name} · {artist.city}
            </Link>
          }
          <p className="mt-1 text-[11px] text-mist-400">
            {track.plays} plays · {formatDuration(track.durationSeconds)}
            {world &&
            <>
                {' · '}
                <Link
                to={`/music/world/${world.id}`}
                className="transition-colors duration-150 ease-entrance hover:text-white">
                
                  {world.name}
                </Link>
              </>
            }
          </p>

          <div className="mt-4 h-14">
            <Waveform
              seed={track.id}
              progress={active ? elapsed / track.durationSeconds : 0}
              bars={80} />
            
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => active ? toggle() : play(track, [track, ...siblings])}
              className="flex items-center gap-2 rounded-full bg-brand-violet px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta">
              
              {active && playing ?
              <PauseIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> :

              <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              }
              {active && playing ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => toggleLike(track.id)}
              aria-pressed={liked}
              className={`flex items-center gap-1.5 rounded-full border px-5 py-3 text-sm font-semibold transition-colors duration-150 ease-entrance ${
              liked ?
              'border-brand-magenta text-brand-magenta' :
              'border-white/25 text-white hover:bg-white/10'}`
              }>
              
              <HeartIcon
                className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`}
                aria-hidden="true" />
              
              {liked ? 'Liked' : 'Like'}
            </button>
            {track.story &&
            <Link
              to={track.story.to}
              className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
                Watch {track.story.label}
              </Link>
            }
          </div>

          {track.story &&
          <p className="mt-4 rounded-xl border border-white/5 bg-ink-850 p-3.5 text-[11px] leading-relaxed text-mist-300">
              This recording belongs to{' '}
              <Link
              to={track.story.to}
              className="font-semibold text-brand-cyan hover:text-white">
              
                {track.story.label}
              </Link>
              . Listening to it here and watching it in Play are the same object in the graph —
              which is why the film, the community and the editions all sit one step away.
            </p>
          }
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <GraphRail nodes={track.graph} />

        {trackEditions.length > 0 &&
        <section aria-labelledby="track-editions">
            <h2 id="track-editions" className="mb-3 text-base font-bold tracking-tight text-white">
              Collect this
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {trackEditions.map((edition) =>
            <li key={edition.id}>
                  <EditionCard edition={edition} />
                </li>
            )}
            </ul>
          </section>
        }

        {trackLive.length > 0 &&
        <section aria-labelledby="track-live">
            <h2 id="track-live" className="mb-3 text-base font-bold tracking-tight text-white">
              Hear it live
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {trackLive.map((date) =>
            <li key={date.id}>
                  <LiveCard date={date} />
                </li>
            )}
            </ul>
          </section>
        }

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          {siblings.length > 0 &&
          <section aria-labelledby="up-next">
              <h2 id="up-next" className="mb-3 text-base font-bold tracking-tight text-white">
                Up next in {world?.name ?? 'this world'}
              </h2>
              <div className="rounded-2xl border border-white/5 bg-ink-900 p-2">
                {siblings.map((sibling, i) =>
              <TrackRow
                key={sibling.id}
                track={sibling}
                index={i}
                queue={[track, ...siblings]} />

              )}
              </div>
            </section>
          }
          {artist && <SupportPanel artist={artist} />}
        </div>
      </div>
    </div>);

}