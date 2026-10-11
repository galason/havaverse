import React from 'react';
import { CheckIcon } from 'lucide-react';
import { actionLabel, useCommerce } from '../../contexts/CommerceContext';
import type { MarketProduct } from '../../types/commerce';

interface ActionButtonProps {
  product: MarketProduct;
  size?: 'sm' | 'md';
  full?: boolean;
}

/**
 * The verb changes with the economic action — you collect a print, reserve a
 * seat, support a creator. "Add to bag" is only ever true for physical goods.
 */
export function ActionButton({ product, size = 'sm', full = false }: ActionButtonProps) {
  const { add, owns } = useCommerce();

  const owned = owns(product.id);
  const soldOut = product.stock === 'sold-out';
  const unreleased = product.stock === 'unreleased';
  const disabled = soldOut || unreleased || owned;

  const label = owned ?
  'In your collection' :
  soldOut ?
  'Sold out' :
  unreleased ?
  'Not released yet' :
  product.stock === 'pre-order' ?
  actionLabel.preorder :
  actionLabel[product.action];

  const base =
  size === 'md' ?
  'px-5 py-3 text-sm' :
  'px-3.5 py-2 text-xs';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => add(product)}
      className={[
      'flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors duration-150 ease-entrance',
      full ? 'w-full' : '',
      base,
      owned ?
      'cursor-default bg-brand-cyan/15 text-brand-cyan' :
      disabled ?
      'cursor-not-allowed bg-ink-800 text-mist-400' :
      product.action === 'support' ?
      'bg-brand-magenta text-white hover:bg-brand-violet' :
      'bg-brand-indigo text-white hover:bg-brand-violet'].
      join(' ')}>
      
      {owned && <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </button>);

}