import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FlameIcon, SparklesIcon, StoreIcon, TicketIcon } from 'lucide-react';
import { commerceApi } from '../services/commerceApi';
import { SectionHeader } from '../components/community/SectionHeader';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../components/community/StateBlocks';
import { MarketHero } from '../components/market/MarketHero';
import { UniverseCard } from '../components/market/UniverseCard';
import { DropCard } from '../components/market/DropCard';
import { ProductCard } from '../components/market/ProductCard';
import { PassCard } from '../components/market/PassCard';
import { CreatorStoreCard } from '../components/market/CreatorStoreCard';
import { CollectionRail } from '../components/market/CollectionRail';
import { BagBar } from '../components/market/BagBar';
import { formatPrice } from '../contexts/CommerceContext';
import type {
  CommerceUniverse,
  CreatorStore,
  Drop,
  HavaPass,
  MarketProduct,
  ProductCategory } from
'../types/commerce';

const categories: (ProductCategory | 'All')[] = [
'All',
'Merchandise',
'Digital',
'Tickets',
'Collectibles',
'Experiences',
'Creator products'];


export function Market() {
  const [params, setParams] = useSearchParams();

  const [universes, setUniverses] = React.useState<CommerceUniverse[]>([]);
  const [products, setProducts] = React.useState<MarketProduct[]>([]);
  const [drops, setDrops] = React.useState<Drop[]>([]);
  const [passes, setPasses] = React.useState<HavaPass[]>([]);
  const [stores, setStores] = React.useState<CreatorStore[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [u, p, d, pa, s] = await Promise.all([
    commerceApi.listUniverses(),
    commerceApi.listProducts(),
    commerceApi.listDrops(),
    commerceApi.listPasses(),
    commerceApi.listStores()]
    );
    if (u.ok && p.ok && d.ok && pa.ok && s.ok) {
      setUniverses(u.data);
      setProducts(p.data);
      setDrops(d.data);
      setPasses(pa.data);
      setStores(s.data);
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const paramCategory = params.get('category') as ProductCategory | null;
  const category: ProductCategory | 'All' = categories.includes(
    paramCategory as ProductCategory
  ) ?
  paramCategory as ProductCategory :
  'All';

  const setCategory = (next: ProductCategory | 'All') =>
  setParams(next === 'All' ? {} : { category: next }, { replace: true });

  const byId = (id: string) => products.find((p) => p.id === id);
  const catalogue = category === 'All' ? products : products.filter((p) => p.category === category);
  const recommended = products.filter((p) => p.universeId === 'railway' && p.stock !== 'sold-out');
  const experiences = products.filter(
    (p) => p.category === 'Experiences' || p.category === 'Tickets'
  );

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorBlock message="Market could not be loaded." onRetry={load} />
      </div>);

  }

  return (
    <div className="p-4 pb-12 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-9">
          <MarketHero />

          <section aria-labelledby="explore-universes">
            <SectionHeader
              id="explore-universes"
              title="Explore the HavaVerse universe"
              subtitle="Stories, characters, worlds, products, experiences."
              actionTo="/market?category=Collectibles"
              actionLabel="See collectibles" />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {universes.map((universe) =>
              <li key={universe.id}>
                    <UniverseCard universe={universe} />
                  </li>
              )}
              </ul>
            }
          </section>

          <section aria-labelledby="drops-now">
            <SectionHeader
              id="drops-now"
              title="Drops happening now"
              subtitle="Limited runs open, close and never reprint."
              icon={<FlameIcon className="h-5 w-5 text-brand-amber" aria-hidden="true" />} />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {drops.map((drop) => {
                const product = byId(drop.productId);
                if (!product) return null;
                return (
                  <li key={drop.id}>
                      <DropCard drop={drop} product={product} />
                    </li>);

              })}
              </ul>
            }
          </section>

          {passes.map((pass) =>
          <section key={pass.id} aria-label={pass.name}>
              <PassCard pass={pass} />
            </section>
          )}

          <section aria-labelledby="for-you">
            <SectionHeader
              id="for-you"
              title="Because you watched The Last Train"
              subtitle="Semantic, not 'people also bought' — drawn from the content graph."
              icon={<SparklesIcon className="h-5 w-5 text-brand-indigo" aria-hidden="true" />}
              actionTo="/universes/railway"
              actionLabel="Open the universe" />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {recommended.slice(0, 4).map((product) =>
              <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
              )}
              </ul>
            }
          </section>

          <section aria-labelledby="experiences">
            <SectionHeader
              id="experiences"
              title="Experiences and tickets"
              subtitle="Premieres, matchday and set visits — be in the room."
              icon={<TicketIcon className="h-5 w-5 text-brand-magenta" aria-hidden="true" />} />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {experiences.map((product) =>
              <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
              )}
              </ul>
            }
          </section>

          <section aria-labelledby="creator-stores">
            <SectionHeader
              id="creator-stores"
              title="Creator stores"
              subtitle="Support the people behind the worlds you love."
              icon={<StoreIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />} />
            
            {status === 'loading' ?
            <SkeletonRows rows={2} /> :

            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stores.map((store) =>
              <li key={store.id}>
                    <CreatorStoreCard store={store} />
                  </li>
              )}
              </ul>
            }
          </section>

          <section aria-labelledby="shop-everything">
            <SectionHeader
              id="shop-everything"
              title="Shop everything"
              subtitle="The full catalogue, if you already know what you are after." />
            
            <div
              role="tablist"
              aria-label="Filter the catalogue"
              className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
              
              {categories.map((option) =>
              <button
                key={option}
                role="tab"
                type="button"
                aria-selected={category === option}
                onClick={() => setCategory(option)}
                className={[
                'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-entrance',
                category === option ?
                'border-transparent bg-brand-indigo text-white' :
                'border-white/10 bg-ink-850 text-mist-300 hover:border-white/25 hover:text-white'].
                join(' ')}>
                
                  {option}
                </button>
              )}
            </div>

            {status === 'loading' ?
            <SkeletonRows rows={3} /> :
            catalogue.length === 0 ?
            <EmptyBlock
              title={`Nothing in ${category.toLowerCase()} yet`}
              body="This part of the catalogue is not stocked. Creators publish into it from Studio."
              action={
              <button
                type="button"
                onClick={() => setCategory('All')}
                className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
                
                    Show everything
                  </button>
              } /> :


            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {catalogue.map((product) =>
              <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
              )}
              </ul>
            }
          </section>

          <p className="rounded-2xl border border-white/5 bg-ink-900 px-4 py-3.5 text-[11px] leading-relaxed text-mist-300">
            Every purchase settles through{' '}
            <Link to="/wallet" className="font-semibold text-brand-cyan hover:text-white">
              HavaPay
            </Link>
            , which splits it between the creator, the rights holder and the platform and writes a
            ledger entry against the work. That is what makes this an economy rather than a shop.
          </p>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <CollectionRail />

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">The five pillars</h2>
            <dl className="mt-2.5 space-y-1.5 text-[11px]">
              {[
              ['Shop', 'Physical goods from the work'],
              ['Collect', 'Digital and limited IP assets'],
              ['Experience', 'Premieres, set visits, events'],
              ['Support', 'Fund the creator directly'],
              ['Unlock', 'Access earned by what you own']].
              map(([term, detail]) =>
              <div key={term} className="flex gap-2">
                  <dt className="w-20 shrink-0 font-semibold text-white">{term}</dt>
                  <dd className="text-mist-400">{detail}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Recommended for you</h2>
            <p className="mt-0.5 text-[11px] text-mist-400">Because you watched The Last Train</p>
            <ul className="mt-2.5 space-y-2">
              {recommended.slice(0, 4).map((product) =>
              <li key={product.id}>
                  <Link
                  to={`/market/product/${product.id}`}
                  className="flex items-center gap-2.5 transition-opacity duration-150 ease-entrance hover:opacity-80">
                  
                    <img
                    src={product.image}
                    alt=""
                    loading="lazy"
                    className="h-10 w-10 rounded-lg object-cover" />
                  
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-white">
                        {product.name}
                      </span>
                      <span className="block text-[11px] text-mist-400">
                        {product.category} · {formatPrice(product.price)}
                      </span>
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-brand-amber/25 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Turn your passion into revenue</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-mist-300">
              Publish a work, attach products to it, and the same graph that recommends it also
              routes the money back to you.
            </p>
            <Link
              to="/studio"
              className="mt-3 block rounded-lg bg-brand-amber px-3 py-2 text-center text-xs font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-brand-amber/85">
              
              Open Studio
            </Link>
          </section>
        </aside>
      </div>

      <BagBar />
    </div>);

}