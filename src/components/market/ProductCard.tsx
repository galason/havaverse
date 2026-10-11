import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../contexts/CommerceContext';
import { ActionButton } from './ActionButton';
import { StockBadge } from './StockBadge';
import type { MarketProduct } from '../../types/commerce';

export function ProductCard({ product }: {product: MarketProduct;}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      <Link to={`/market/product/${product.id}`} className="relative block aspect-[4/3]">
        <img
          src={product.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-opacity duration-150 ease-entrance hover:opacity-85" />
        
        <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist-100 backdrop-blur">
          {product.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-sm font-bold leading-snug text-white">
          <Link
            to={`/market/product/${product.id}`}
            className="transition-colors duration-150 ease-entrance hover:text-brand-magenta">
            
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 truncate text-[11px] text-mist-400">
          {product.provenance.creator.value}
          {product.provenance.ip ? ` · ${product.provenance.ip.value}` : ''}
        </p>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-bold text-white">{formatPrice(product.price)}</p>
            <StockBadge product={product} />
          </div>
          <div className="mt-2">
            <ActionButton product={product} full />
          </div>
        </div>
      </div>
    </article>);

}