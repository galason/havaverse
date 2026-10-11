import React from 'react';
import { Link } from 'react-router-dom';
import { LayersIcon } from 'lucide-react';
import { commerceUniverses, marketProducts, havaPasses } from '../../data/commerce';
import { formatPrice, useCommerce } from '../../contexts/CommerceContext';
import { EmptyBlock } from '../../components/community/StateBlocks';
import { StockBadge } from '../../components/market/StockBadge';

export function CollectionVault() {
  const { collection, passIds } = useCommerce();
  const owned = marketProducts.filter((p) => collection.includes(p.id));

  const worlds = commerceUniverses.
  map((universe) => ({ universe, items: owned.filter((p) => p.universeId === universe.id) })).
  filter((group) => group.items.length > 0);

  const creators = new Set(owned.map((p) => p.creatorId));
  const passes = havaPasses.filter((p) => passIds.includes(p.id));

  return (
    <div className="p-4 pb-12 sm:p-5">
      <header className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
          HavaVerse Market
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">My collection</h1>
        <p className="mt-1 text-sm text-mist-400">
          {owned.length} items · {worlds.length} worlds · {creators.size} creators
          {passes.length > 0 ? ` · ${passes.length} pass${passes.length > 1 ? 'es' : ''}` : ''}
        </p>
      </header>

      {passes.length > 0 &&
      <section aria-labelledby="my-passes" className="mb-7">
          <h2 id="my-passes" className="mb-2.5 text-base font-bold text-white">
            Passes you hold
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {passes.map((pass) =>
          <li
            key={pass.id}
            className="flex items-center gap-3 rounded-2xl border border-brand-amber/25 bg-ink-900 p-3">
            
                <img src={pass.image} alt="" className="h-14 w-20 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{pass.name}</p>
                  <p className="text-[11px] text-mist-400">
                    {pass.includes.length} benefits active
                  </p>
                </div>
              </li>
          )}
          </ul>
        </section>
      }

      {owned.length === 0 ?
      <EmptyBlock
        icon={<LayersIcon className="h-6 w-6" />}
        title="Your collection is empty"
        body="Everything you buy, collect, reserve or unlock is kept here, grouped by the world it came from."
        action={
        <Link
          to="/market"
          className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
              Explore Market
            </Link>
        } /> :


      <div className="space-y-7">
          {worlds.map(({ universe, items }) =>
        <section key={universe.id} aria-label={universe.name}>
              <div className="mb-3 flex items-baseline gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">{universe.name}</h2>
                <Link
              to={`/market/universe/${universe.id}`}
              className="ml-auto text-[11px] font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
              
                  Back to the store
                </Link>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {items.map((product) =>
            <li key={product.id}>
                    <Link
                to={`/market/product/${product.id}`}
                className="flex h-full gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
                
                      <img
                  src={product.image}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                
                      <span className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-brand-cyan">
                          {product.category}
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-bold text-white">
                          {product.name}
                        </span>
                        <span className="block text-[11px] text-mist-400">
                          {formatPrice(product.price)}
                        </span>
                        <span className="mt-0.5 block">
                          <StockBadge product={product} />
                        </span>
                      </span>
                    </Link>
                  </li>
            )}
              </ul>
            </section>
        )}
        </div>
      }

      <p className="mt-7 rounded-2xl border border-white/5 bg-ink-900 px-4 py-3.5 text-[11px] leading-relaxed text-mist-300">
        A collection, not an order history. What you own here decides what you can unlock, which
        community tiers you hold and what HavaVerse recommends to you next.
      </p>
    </div>);

}