import React from 'react';
import { Link } from 'react-router-dom';
import { marketProducts, commerceUniverses } from '../../data/commerce';
import { useCommerce } from '../../contexts/CommerceContext';

/**
 * Purchases are identity, not order history. The rail groups what you own by
 * the world it came from.
 */
export function CollectionRail() {
  const { collection } = useCommerce();
  const owned = marketProducts.filter((p) => collection.includes(p.id));

  const worlds = commerceUniverses.
  map((universe) => ({
    universe,
    items: owned.filter((p) => p.universeId === universe.id)
  })).
  filter((group) => group.items.length > 0);

  const creators = new Set(owned.map((p) => p.creatorId));

  return (
    <section
      aria-labelledby="my-collection"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <div className="flex items-baseline gap-2">
        <h2 id="my-collection" className="text-sm font-bold tracking-tight text-white">
          My collection
        </h2>
        <Link
          to="/market/collection"
          className="ml-auto text-[11px] font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
          
          View all
        </Link>
      </div>
      <p className="mt-0.5 text-[11px] text-mist-400">
        {owned.length} items · {worlds.length} worlds · {creators.size} creators
      </p>

      {owned.length === 0 ?
      <p className="mt-3 text-[11px] leading-relaxed text-mist-400">
          Nothing collected yet. Anything you buy, collect or reserve lands here.
        </p> :

      <ul className="mt-3 space-y-2">
          {worlds.map(({ universe, items }) =>
        <li key={universe.id}>
              <Link
            to={`/market/universe/${universe.id}`}
            className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-ink-850 p-2 transition-colors duration-150 ease-entrance hover:border-white/20">
            
                <img src={universe.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-white">
                    {universe.name}
                  </span>
                  <span className="block text-[11px] text-mist-400">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </span>
              </Link>
            </li>
        )}
        </ul>
      }
    </section>);

}