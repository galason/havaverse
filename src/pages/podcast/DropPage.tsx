import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckIcon } from 'lucide-react';
import { podcastApi } from '../../services/podcastApi';
import { hosts, shows } from '../../data/podcast';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { DropCard } from '../../components/podcast/DropCard';
import { formatPrice } from '../../contexts/CommerceContext';
import { usePodcast } from '../../contexts/PodcastContext';
import type { PodDrop } from '../../types/podcast';

export function DropPage() {
  const { dropId } = useParams();
  const { hasCollected, collect, isNotifying, toggleNotify, pending } = usePodcast();

  const [drops, setDrops] = React.useState<PodDrop[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await podcastApi.listDrops();
    if (result.ok) {
      setDrops(result.data);
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading collections…" />
      </div>);

  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorBlock message="Collections could not be loaded." onRetry={load} />
      </div>);

  }

  if (!dropId) {
    return (
      <div className="p-4 pb-12 sm:p-5">
        <header className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Exclusive drops
          </h1>
          <p className="mt-1 max-w-xl text-sm text-mist-400">
            Archive collections, unreleased seasons and collector editions, opened once.
          </p>
        </header>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {drops.map((drop) =>
          <li key={drop.id}>
              <DropCard drop={drop} />
            </li>
          )}
        </ul>
      </div>);

  }

  const drop = drops.find((d) => d.id === dropId);
  if (!drop) {
    return (
      <div className="p-5">
        <ErrorBlock message="That collection no longer exists." onRetry={load} />
      </div>);

  }

  const show = shows.find((s) => s.id === drop.showId);
  const host = hosts.find((h) => h.id === show?.hostId);
  const owned = hasCollected(drop.id);
  const busy = pending === `collect:${drop.id}`;
  const waiting = isNotifying(drop.id);
  const others = drops.filter((d) => d.id !== drop.id);

  return (
    <div className="p-4 pb-12 sm:p-5">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <img
            src={drop.image}
            alt=""
            className="aspect-[16/9] w-full rounded-2xl border border-white/5 object-cover" />
          
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-violet">
            {drop.kind}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {drop.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-200">{drop.blurb}</p>
          {show &&
          <p className="mt-2 text-[11px] text-mist-400">
              From{' '}
              <Link
              to={`/podcast/show/${show.id}`}
              className="font-semibold text-brand-cyan hover:text-white">
              
                {show.title}
              </Link>
              {host && ` · ${host.name}`}
            </p>
          }

          <h2 className="mt-6 text-sm font-bold text-white">What is included</h2>
          <ul className="mt-2 space-y-1.5">
            {drop.includes.map((item) =>
            <li key={item} className="flex items-start gap-2 text-sm text-mist-200">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden="true" />
                {item}
              </li>
            )}
          </ul>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <p className="text-2xl font-bold text-white">{formatPrice(drop.price)}</p>
            {drop.remaining !== undefined && drop.total &&
            <p className="mt-1 text-[11px] tabular-nums text-mist-400">
                {drop.remaining === 0 ?
              `${drop.total} / ${drop.total} claimed` :
              `${drop.remaining} of ${drop.total} remaining`}
              </p>
            }
            {drop.releasesAt &&
            <p className="mt-1 text-[11px] font-medium text-brand-amber">{drop.releasesAt}</p>
            }

            {drop.state === 'upcoming' ?
            <button
              type="button"
              onClick={() => toggleNotify(drop.id, drop.name)}
              aria-pressed={waiting}
              className={`mt-3 w-full rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-150 ease-entrance ${
              waiting ?
              'border border-brand-amber/40 text-brand-amber' :
              'border border-white/20 text-white hover:bg-white/10'}`
              }>
              
                {waiting ? "We'll remind you" : 'Remind me'}
              </button> :

            <button
              type="button"
              disabled={owned || drop.state === 'sold-out' || busy}
              onClick={() => collect(drop.id, drop.name)}
              className={`mt-3 w-full rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-150 ease-entrance ${
              owned ?
              'cursor-default bg-brand-cyan/15 text-brand-cyan' :
              drop.state === 'sold-out' ?
              'cursor-not-allowed bg-ink-800 text-mist-400' :
              'bg-brand-violet text-white hover:bg-brand-magenta'}`
              }>
              
                {owned ?
              'In your collection' :
              busy ?
              'Claiming…' :
              drop.state === 'sold-out' ?
              'Fully claimed' :
              'Collect'}
              </button>
            }

            <p className="mt-2.5 text-[10px] leading-relaxed text-mist-400">
              Settled by HavaPay. The creator allocation is written server-side at the point of
              payment.
            </p>
          </div>
        </aside>
      </div>

      {others.length > 0 &&
      <section aria-labelledby="other-drops" className="mt-8">
          <h2 id="other-drops" className="mb-3 text-base font-bold tracking-tight text-white">
            Other collections
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {others.map((other) =>
          <li key={other.id}>
                <DropCard drop={other} />
              </li>
          )}
          </ul>
        </section>
      }
    </div>);

}