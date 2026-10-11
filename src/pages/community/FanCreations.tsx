import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, PaletteIcon } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import { personById } from '../../data/communityPeople';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../../components/community/StateBlocks';
import { OriginTag } from '../../components/community/OriginTag';
import type { FanCreationKind, FanCreationRecord } from '../../types/communityEntities';

const kinds: (FanCreationKind | 'All')[] = [
'All',
'Fan art',
'Fan edit',
'Theory',
'Review',
'Podcast',
'Fan story',
'Music',
'Analysis'];


export function FanCreations() {
  const [creations, setCreations] = React.useState<FanCreationRecord[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [kind, setKind] = React.useState<FanCreationKind | 'All'>('All');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await communityApi.listFanCreations();
    if (result.ok) {
      setCreations(result.data);
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const visible = kind === 'All' ? creations : creations.filter((c) => c.kind === kind);

  return (
    <div className="p-4 pb-12 sm:p-5">
      <header className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
          HavaVerse Community
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Made by fans</h1>
        <p className="mt-1 max-w-xl text-sm text-mist-400">
          Fan work sits beside the official film in the content graph — clearly labelled, never
          presented as canon.
        </p>
      </header>

      <div role="tablist" aria-label="Filter fan creations" className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {kinds.map((option) =>
        <button
          key={option}
          role="tab"
          type="button"
          aria-selected={kind === option}
          onClick={() => setKind(option)}
          className={[
          'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-entrance',
          kind === option ?
          'border-transparent bg-brand-indigo text-white' :
          'border-white/10 bg-ink-850 text-mist-300 hover:border-white/25 hover:text-white'].
          join(' ')}>
          
            {option}
          </button>
        )}
      </div>

      {status === 'loading' && <SkeletonRows rows={3} />}
      {status === 'error' && <ErrorBlock message="Could not load fan creations." onRetry={load} />}

      {status === 'ready' && (
      visible.length === 0 ?
      <EmptyBlock
        icon={<PaletteIcon className="h-6 w-6" />}
        title={`No ${kind.toLowerCase()} published yet`}
        body="Nothing in this category so far. Fan work appears here as the community publishes it." /> :


      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visible.map((creation) => {
          const author = personById(creation.authorId);
          return (
            <li key={creation.id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
                    <Link to={`/fan-creations/${creation.id}`} className="relative block aspect-[4/3]">
                      {creation.image ?
                  <img
                    src={creation.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-opacity duration-150 ease-entrance hover:opacity-85" /> :


                  <span className="flex h-full w-full items-center justify-center bg-ink-850">
                          <PaletteIcon className="h-6 w-6 text-mist-400" aria-hidden="true" />
                        </span>
                  }
                      <span className="absolute left-2 top-2">
                        <OriginTag origin="fan" />
                      </span>
                    </Link>
                    <div className="flex flex-1 flex-col p-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-magenta">
                        {creation.kind}
                      </p>
                      <h2 className="mt-0.5 text-sm font-bold leading-snug text-white">
                        <Link
                      to={`/fan-creations/${creation.id}`}
                      className="transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                      
                          {creation.title}
                        </Link>
                      </h2>
                      <p className="mt-1 text-[11px] text-mist-400">
                        {author.name} · {creation.views} views
                      </p>
                      <p className="mt-auto flex items-center gap-1 pt-3 text-[11px] text-mist-400">
                        <HeartIcon className="h-3 w-3" aria-hidden="true" />
                        {creation.likes.toLocaleString()}
                      </p>
                    </div>
                  </article>
                </li>);

        })}
          </ul>)
      }
    </div>);

}