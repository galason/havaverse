import React from 'react';
import type { MarketProduct } from '../../types/commerce';

const label: Record<MarketProduct['stock'], string> = {
  'in-stock': 'In stock',
  low: 'Only a few left',
  'sold-out': 'Sold out',
  'pre-order': 'Pre-order',
  unreleased: 'Not released'
};

const tone: Record<MarketProduct['stock'], string> = {
  'in-stock': 'text-mist-300',
  low: 'text-brand-amber',
  'sold-out': 'text-mist-400',
  'pre-order': 'text-brand-cyan',
  unreleased: 'text-brand-cyan'
};

export function StockBadge({ product }: {product: MarketProduct;}) {
  const { edition } = product;
  return (
    <span className={`text-[11px] font-semibold ${tone[product.stock]}`}>
      {edition ?
      product.stock === 'sold-out' ?
      `${edition.total} / ${edition.total} collected` :
      `${edition.remaining} of ${edition.total} left` :
      label[product.stock]}
    </span>);

}