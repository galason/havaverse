import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, KeyIcon, ShieldCheckIcon } from 'lucide-react';
import { commerceApi } from '../../services/commerceApi';
import { creatorStores } from '../../data/commerce';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { ProvenanceChain } from '../../components/market/ProvenanceChain';
import { ActionButton } from '../../components/market/ActionButton';
import { StockBadge } from '../../components/market/StockBadge';
import { ProductCard } from '../../components/market/ProductCard';
import { BagBar } from '../../components/market/BagBar';
import { formatPrice } from '../../contexts/CommerceContext';
import { useApp } from '../../contexts/AppContext';
import type { MarketProduct } from '../../types/commerce';

export function ProductDetail() {
  const { productId = '' } = useParams();
  const navigate = useNavigate();
  const { isFollowing, toggleFollow } = useApp();

  const [product, setProduct] = React.useState<MarketProduct | null>(null);
  const [related, setRelated] = React.useState<MarketProduct[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const one = await commerceApi.getProduct(productId);
    if (!one.ok || !one.data) {
      setStatus('missing');
      return;
    }
    setProduct(one.data);
    const siblings = await commerceApi.listProducts(one.data.universeId);
    setRelated(siblings.ok ? siblings.data.filter((p) => p.id !== one.data!.id).slice(0, 4) : []);
    setStatus('ready');
  }, [productId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading product…" />
      </div>);

  }

  if (status === 'missing' || !product) {
    return (
      <div className="p-5">
        <ErrorBlock message="That product is no longer listed." onRetry={load} />
      </div>);

  }

  const store = creatorStores.find((s) => s.id === product.creatorId);
  const followKey = store ? `store:${store.id}` : '';
  const following = store ? isFollowing(followKey) : false;

  return (
    <div className="p-4 pb-12 sm:p-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back
      </button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full rounded-2xl border border-white/5 object-cover" />
        

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-magenta">
            {product.category}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">{product.blurb}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-2xl font-bold text-white">{formatPrice(product.price)}</p>
            <StockBadge product={product} />
          </div>
          {product.releasesAt &&
          <p className="mt-1 text-xs text-brand-cyan">{product.releasesAt}</p>
          }

          <div className="mt-4 max-w-xs">
            <ActionButton product={product} size="md" full />
          </div>

          {product.unlocks && product.unlocks.length > 0 &&
          <div className="mt-4 rounded-xl border border-brand-amber/25 bg-brand-amber/5 p-3.5">
              <p className="flex items-center gap-1.5 text-xs font-bold text-white">
                <KeyIcon className="h-3.5 w-3.5 text-brand-amber" aria-hidden="true" />
                Owning this unlocks
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] text-mist-200">
                {product.unlocks.map((item) =>
              <li key={item}>{item}</li>
              )}
              </ul>
            </div>
          }

          <div className="mt-4">
            <ProvenanceChain provenance={product.provenance} />
          </div>

          <div className="mt-4 rounded-xl border border-white/5 bg-ink-850 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-bold text-white">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />
              Where the money goes
            </p>
            <div
              className="mt-2.5 flex h-2 w-full overflow-hidden rounded-full"
              role="img"
              aria-label={`Creator ${product.split.creator} percent, rights holder ${product.split.rightsHolder} percent, HavaVerse ${product.split.platform} percent`}>
              
              <span className="bg-brand-indigo" style={{ width: `${product.split.creator}%` }} />
              <span
                className="bg-brand-magenta"
                style={{ width: `${product.split.rightsHolder}%` }} />
              
              <span className="bg-mist-400" style={{ width: `${product.split.platform}%` }} />
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-mist-300">
              <li>
                <span className="font-semibold text-white">{product.split.creator}%</span> creator
              </li>
              <li>
                <span className="font-semibold text-white">{product.split.rightsHolder}%</span>{' '}
                rights holder
              </li>
              <li>
                <span className="font-semibold text-white">{product.split.platform}%</span>{' '}
                HavaVerse
              </li>
            </ul>
            <p className="mt-2 text-[10px] leading-relaxed text-mist-400">
              Settled by HavaPay at checkout and written to the creator's ledger.
            </p>
          </div>

          {store &&
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900 p-3.5">
              <Link to={`/market/store/${store.id}`} className="shrink-0">
                <img src={store.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-mist-400">
                  Created by
                </p>
                <Link
                to={`/market/store/${store.id}`}
                className="block truncate text-sm font-bold text-white transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                
                  {store.name}
                </Link>
                <p className="truncate text-[11px] text-mist-400">{store.supporters}</p>
              </div>
              <button
              type="button"
              onClick={() => toggleFollow(followKey)}
              aria-pressed={following}
              className={[
              'shrink-0 rounded-full px-3.5 py-2 text-[11px] font-semibold transition-colors duration-150 ease-entrance',
              following ?
              'border border-white/20 text-mist-200 hover:text-white' :
              'bg-brand-indigo text-white hover:bg-brand-violet'].
              join(' ')}>
              
                {following ? 'Following' : 'Follow'}
              </button>
            </div>
          }
        </div>
      </div>

      {related.length > 0 &&
      <section aria-labelledby="more-from-universe" className="mt-9">
          <h2 id="more-from-universe" className="mb-3 text-base font-bold tracking-tight text-white">
            More from {product.provenance.universe.value}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((item) =>
          <li key={item.id}>
                <ProductCard product={item} />
              </li>
          )}
          </ul>
        </section>
      }

      <BagBar />
    </div>);

}