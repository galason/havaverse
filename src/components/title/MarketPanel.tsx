import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from 'lucide-react';
import type { MarketProduct } from '../../types/commerce';
import { commerceApi } from '../../services/commerceApi';
import { formatPrice } from '../../contexts/CommerceContext';
import { ErrorBlock, LoadingBlock } from '../community/StateBlocks';

interface MarketPanelProps {
  universeId?: string;
}

/** Commerce reached through the graph — products belong to the world. */
export function MarketPanel({ universeId }: MarketPanelProps) {
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [products, setProducts] = React.useState<MarketProduct[]>([]);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await commerceApi.listProducts(universeId);
    if (!result.ok) {
      setStatus('error');
      return;
    }
    // A title outside a stocked universe still deserves a shelf rather than
    // an empty panel — fall back to the wider catalogue.
    let items = result.data;
    if (items.length === 0 && universeId) {
      const all = await commerceApi.listProducts();
      if (all.ok) items = all.data;
    }
    setProducts(items.slice(0, 4));
    setStatus('ready');
  }, [universeId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <section
      aria-labelledby="market-heading"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <h2 id="market-heading" className="flex items-center gap-2 text-sm font-bold text-white">
        <ShoppingBagIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        From HavaMarket
      </h2>

      <div className="mt-3">
        {status === 'loading' && <LoadingBlock label="Loading products" />}
        {status === 'error' &&
        <ErrorBlock message="Products could not be loaded." onRetry={load} />
        }
        {status === 'ready' && products.length === 0 &&
        <p className="text-[11px] text-mist-400">
            Nothing from this world is on sale yet.
          </p>
        }
        {status === 'ready' && products.length > 0 &&
        <ul className="space-y-1.5">
            {products.map((product) =>
          <li key={product.id}>
                <Link
              to={`/market/product/${product.id}`}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-850 p-2 transition-colors duration-150 ease-entrance hover:border-white/20">
              
                  <img
                src={product.image}
                alt=""
                className="h-11 w-11 shrink-0 rounded-lg object-cover" />
              
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-white">
                      {product.name}
                    </span>
                    <span className="block truncate text-[10px] text-mist-400">
                      {product.provenance.content.value}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-white">
                    {formatPrice(product.price)}
                  </span>
                </Link>
              </li>
          )}
          </ul>
        }
      </div>

      <Link
        to={universeId ? `/market/universe/${universeId}` : '/market'}
        className="mt-3 inline-block text-[11px] font-semibold text-brand-indigo">
        
        View all products →
      </Link>
    </section>);

}