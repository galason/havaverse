import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { MessagesSquareIcon, PlayIcon } from 'lucide-react';
import { commerceApi } from '../../services/commerceApi';
import { ErrorBlock, EmptyBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { ProductCard } from '../../components/market/ProductCard';
import { PassCard } from '../../components/market/PassCard';
import { BagBar } from '../../components/market/BagBar';
import type { CommerceAction, CommerceUniverse, HavaPass, MarketProduct } from '../../types/commerce';

/** The pillars, as the store's own navigation. */
const pillars: {id: string;label: string;actions: CommerceAction[];}[] = [
{ id: 'all', label: 'Everything', actions: [] },
{ id: 'watch', label: 'Watch', actions: ['watch'] },
{ id: 'collect', label: 'Collect', actions: ['collect'] },
{ id: 'wear', label: 'Wear', actions: ['buy'] },
{ id: 'experience', label: 'Experience', actions: ['ticket', 'experience'] },
{ id: 'support', label: 'Support', actions: ['support'] }];


export function UniverseStore() {
  const { universeId = '' } = useParams();
  const [params, setParams] = useSearchParams();

  const [universe, setUniverse] = React.useState<CommerceUniverse | null>(null);
  const [products, setProducts] = React.useState<MarketProduct[]>([]);
  const [passes, setPasses] = React.useState<HavaPass[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [u, p, pa] = await Promise.all([
    commerceApi.getUniverse(universeId),
    commerceApi.listProducts(universeId),
    commerceApi.listPasses(universeId)]
    );
    if (u.ok && u.data) {
      setUniverse(u.data);
      setProducts(p.ok ? p.data : []);
      setPasses(pa.ok ? pa.data : []);
      setStatus('ready');
    } else {
      setStatus('missing');
    }
  }, [universeId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const pillarId = params.get('pillar') ?? 'all';
  const pillar = pillars.find((p) => p.id === pillarId) ?? pillars[0];
  const setPillar = (id: string) =>
  setParams(id === 'all' ? {} : { pillar: id }, { replace: true });

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Entering the universe…" />
      </div>);

  }

  if (status === 'missing' || !universe) {
    return (
      <div className="p-5">
        <ErrorBlock message="No store for that universe yet." onRetry={load} />
      </div>);

  }

  const visible =
  pillar.actions.length === 0 ?
  products :
  products.filter((p) => pillar.actions.includes(p.action));

  return (
    <div className="pb-12">
      <div className="relative min-h-[240px] sm:min-h-[300px]">
        <img
          src={universe.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center" />
        
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_10%,rgb(var(--c-ink-950)/0.35)_100%)]" />
        <div className="relative flex min-h-[240px] flex-col justify-end p-5 sm:min-h-[300px] sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-magenta">
            Universe store
          </p>
          <h1 className="mt-1.5 font-display text-3xl uppercase leading-none tracking-tight text-white sm:text-5xl">
            {universe.name}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-mist-200">{universe.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={universe.watchTo}
              className="flex items-center gap-1.5 rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
              
              <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Watch
            </Link>
            <Link
              to={universe.communityTo}
              className="flex items-center gap-1.5 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
              <MessagesSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Community
            </Link>
            {universe.universeTo !== `/market/universe/${universe.id}` &&
            <Link
              to={universe.universeTo}
              className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
                The content graph
              </Link>
            }
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div
          role="tablist"
          aria-label="Browse this universe"
          className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
          
          {pillars.map((option) =>
          <button
            key={option.id}
            role="tab"
            type="button"
            aria-selected={pillar.id === option.id}
            onClick={() => setPillar(option.id)}
            className={[
            'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-entrance',
            pillar.id === option.id ?
            'border-transparent bg-brand-indigo text-white' :
            'border-white/10 bg-ink-850 text-mist-300 hover:border-white/25 hover:text-white'].
            join(' ')}>
            
              {option.label}
            </button>
          )}
        </div>

        {passes.length > 0 && pillar.id === 'all' &&
        <div className="mb-6">
            <PassCard pass={passes[0]} />
          </div>
        }

        {visible.length === 0 ?
        <EmptyBlock
          title={`Nothing to ${pillar.label.toLowerCase()} here yet`}
          body="This universe has not released anything in that pillar. The creator can add one from Studio."
          action={
          <button
            type="button"
            onClick={() => setPillar('all')}
            className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
                Show everything
              </button>
          } /> :


        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visible.map((product) =>
          <li key={product.id}>
                <ProductCard product={product} />
              </li>
          )}
          </ul>
        }

        <BagBar />
      </div>
    </div>);

}