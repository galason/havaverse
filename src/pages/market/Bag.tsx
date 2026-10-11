import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MinusIcon, PlusIcon, ShieldCheckIcon, ShoppingBagIcon, XIcon } from 'lucide-react';
import { marketProducts } from '../../data/commerce';
import { formatPrice, useCommerce } from '../../contexts/CommerceContext';
import { EmptyBlock } from '../../components/community/StateBlocks';
import { CheckoutPanel } from '../../components/market/CheckoutPanel';
import { fulfilmentFor } from '../../utils/orders';

export function Bag() {
  const { bag, bagTotal, remove, setQuantity, checkout, checkingOut, lastOrderId, clearBag } =
  useCommerce();

  const navigate = useNavigate();
  const lines = bag.
  map((line) => ({ line, product: marketProducts.find((p) => p.id === line.productId) })).
  filter((entry) => entry.product);
  const ships = lines.some(({ product }) => product && fulfilmentFor(product.category) === 'shipped');

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-4 pb-12 sm:p-5">
        <h1 className="mb-5 text-2xl font-bold tracking-tight text-white">Your bag</h1>
        {lastOrderId ?
        <EmptyBlock
          icon={<ShieldCheckIcon className="h-6 w-6 text-brand-cyan" />}
          title={`Order ${lastOrderId} placed`}
          body="It's waiting for HavaPay to confirm the payment. Once it does, digital items join your collection and anything physical starts shipping."
          action={
          <Link
            to={`/market/orders/${lastOrderId}`}
            className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
                View order
              </Link>
          } /> :


        <EmptyBlock
          icon={<ShoppingBagIcon className="h-6 w-6" />}
          title="Nothing in your bag"
          body="Find something in a universe you already watch — that is where the good things are."
          action={
          <Link
            to="/market"
            className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
                Back to Market
              </Link>
          } />

        }
      </div>);

  }

  return (
    <div className="mx-auto max-w-3xl p-4 pb-12 sm:p-5">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-white">Your bag</h1>
        <Link to="/market/orders" className="text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          Your orders
        </Link>
      </div>

      <ul className="space-y-3">
        {lines.map(({ line, product }) => {
          if (!product) return null;
          return (
            <li
              key={product.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3">
              
              <Link to={`/market/product/${product.id}`} className="shrink-0">
                <img src={product.image} alt="" className="h-16 w-20 rounded-lg object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/market/product/${product.id}`}
                  className="block truncate text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                  
                  {product.name}
                </Link>
                <p className="truncate text-[11px] text-mist-400">
                  {product.category} · {product.provenance.creator.value}
                </p>
                <p className="mt-0.5 text-[11px] text-mist-400">
                  {product.split.creator}% of this goes to the creator
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity(product.id, line.quantity - 1)}
                  aria-label={`Reduce quantity of ${product.name}`}
                  className="rounded-lg border border-white/15 p-1.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
                  
                  <MinusIcon className="h-3 w-3" aria-hidden="true" />
                </button>
                <span className="w-6 text-center text-xs font-semibold tabular-nums text-white">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(product.id, line.quantity + 1)}
                  aria-label={`Increase quantity of ${product.name}`}
                  className="rounded-lg border border-white/15 p-1.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
                  
                  <PlusIcon className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>

              <p className="w-24 shrink-0 text-right text-sm font-bold text-white">
                {formatPrice(product.price * line.quantity)}
              </p>

              <button
                type="button"
                onClick={() => remove(product.id)}
                aria-label={`Remove ${product.name}`}
                className="shrink-0 rounded-lg p-1.5 text-mist-400 transition-colors duration-150 ease-entrance hover:text-live">
                
                <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>);

        })}
      </ul>

      <div className="mt-5">
        <CheckoutPanel
          subtotal={bagTotal}
          ships={ships}
          busy={checkingOut}
          onClear={clearBag}
          onPay={async (options) => {
            const result = await checkout(options);
            if ('error' in result) return result.error;
            navigate(`/market/orders/${result.orderId}`);
            return null;
          }} />
        
      </div>
    </div>);

}