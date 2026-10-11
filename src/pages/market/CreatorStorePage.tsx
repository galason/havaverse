import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheckIcon } from 'lucide-react';
import { commerceApi } from '../../services/commerceApi';
import { commerceUniverses } from '../../data/commerce';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { ProductCard } from '../../components/market/ProductCard';
import { BagBar } from '../../components/market/BagBar';
import { useApp } from '../../contexts/AppContext';
import type { CreatorStore, MarketProduct } from '../../types/commerce';

export function CreatorStorePage() {
  const { storeId = '' } = useParams();
  const { isFollowing, toggleFollow } = useApp();

  const [store, setStore] = React.useState<CreatorStore | null>(null);
  const [products, setProducts] = React.useState<MarketProduct[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [s, p] = await Promise.all([commerceApi.getStore(storeId), commerceApi.listProducts()]);
    if (s.ok && s.data) {
      setStore(s.data);
      setProducts(p.ok ? p.data.filter((item) => item.creatorId === s.data!.id) : []);
      setStatus('ready');
    } else {
      setStatus('missing');
    }
  }, [storeId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading store…" />
      </div>);

  }

  if (status === 'missing' || !store) {
    return (
      <div className="p-5">
        <ErrorBlock message="That creator store does not exist." onRetry={load} />
      </div>);

  }

  const key = `store:${store.id}`;
  const following = isFollowing(key);
  const worlds = commerceUniverses.filter((u) => store.universeIds.includes(u.id));

  return (
    <div className="pb-12">
      <div className="relative h-40 w-full overflow-hidden sm:h-52">
        <img src={store.cover} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_8%,rgb(var(--c-ink-950)/0.3)_100%)]" />
      </div>

      <header className="flex flex-wrap items-end gap-4 px-4 pt-4 sm:px-5">
        <img
          src={store.avatar}
          alt=""
          className="h-16 w-16 shrink-0 rounded-full border-2 border-ink-950 object-cover sm:h-20 sm:w-20" />
        
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            {store.name}
            {store.verified &&
            <BadgeCheckIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />
            }
          </h1>
          <p className="text-xs text-mist-400">
            {store.handle} · {store.disciplines} · {store.supporters}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist-300">{store.bio}</p>
        </div>
        <button
          type="button"
          onClick={() => toggleFollow(key)}
          aria-pressed={following}
          className={[
          'rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance',
          following ?
          'border border-white/20 text-mist-200 hover:text-white' :
          'bg-brand-indigo text-white hover:bg-brand-violet'].
          join(' ')}>
          
          {following ? 'Following' : 'Follow'}
        </button>
      </header>

      <div className="p-4 sm:p-5">
        {worlds.length > 0 &&
        <section aria-labelledby="store-worlds" className="mb-6">
            <h2 id="store-worlds" className="mb-2 text-sm font-bold text-white">
              Worlds by this creator
            </h2>
            <ul className="flex flex-wrap gap-2">
              {worlds.map((world) =>
            <li key={world.id}>
                  <Link
                to={`/market/universe/${world.id}`}
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
                
                    {world.name}
                  </Link>
                </li>
            )}
            </ul>
          </section>
        }

        <h2 className="mb-3 text-base font-bold tracking-tight text-white">
          {products.length} {products.length === 1 ? 'listing' : 'listings'}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) =>
          <li key={product.id}>
              <ProductCard product={product} />
            </li>
          )}
        </ul>

        <p className="mt-5 rounded-2xl border border-white/5 bg-ink-900 px-4 py-3.5 text-[11px] leading-relaxed text-mist-300">
          Buying from this store contributes directly to {store.name}. Earnings appear in their{' '}
          <Link to="/wallet" className="font-semibold text-brand-cyan hover:text-white">
            HavaPay ledger
          </Link>{' '}
          and fund what they make next.
        </p>

        <BagBar />
      </div>
    </div>);

}