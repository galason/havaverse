import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from 'lucide-react';
import { formatPrice, useCommerce } from '../../contexts/CommerceContext';

/** Only appears once there is something in the bag — no empty chrome. */
export function BagBar() {
  const { bagCount, bagTotal } = useCommerce();
  if (bagCount === 0) return null;

  return (
    <div className="sticky bottom-3 z-20 mx-auto flex w-full max-w-lg items-center gap-3 rounded-full border border-white/10 bg-ink-850/95 px-4 py-2.5 backdrop-blur">
      <ShoppingBagIcon className="h-4 w-4 shrink-0 text-brand-indigo" aria-hidden="true" />
      <p className="min-w-0 flex-1 truncate text-xs text-mist-200">
        <span className="font-semibold text-white">{bagCount}</span>{' '}
        {bagCount === 1 ? 'item' : 'items'} · {formatPrice(bagTotal)}
      </p>
      <Link
        to="/market/bag"
        className="shrink-0 rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
        
        Review bag
      </Link>
    </div>);

}