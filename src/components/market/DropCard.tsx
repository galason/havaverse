import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, useCommerce } from '../../contexts/CommerceContext';
import { ActionButton } from './ActionButton';
import type { Drop, MarketProduct } from '../../types/commerce';

function useCountdown(seconds?: number) {
  const [remaining, setRemaining] = React.useState(seconds ?? 0);

  React.useEffect(() => {
    if (seconds === undefined) return;
    setRemaining(seconds);
    const timer = window.setInterval(
      () => setRemaining((value) => value <= 1 ? 0 : value - 1),
      1000
    );
    return () => window.clearInterval(timer);
  }, [seconds]);

  if (seconds === undefined) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(remaining / 3600))}:${pad(Math.floor(remaining % 3600 / 60))}:${pad(remaining % 60)}`;
}

interface DropCardProps {
  drop: Drop;
  product: MarketProduct;
}

export function DropCard({ drop, product }: DropCardProps) {
  const { isNotifying, toggleNotify } = useCommerce();
  const countdown = useCountdown(drop.endsInSeconds);
  const notifying = isNotifying(drop.id);

  const tone =
  drop.state === 'live' ?
  'border-live/40' :
  drop.state === 'soon' ?
  'border-brand-cyan/30' :
  'border-white/5';

  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-2xl border ${tone} bg-ink-900`}>
      <Link to={`/market/product/${product.id}`} className="relative block aspect-[4/3]">
        <img
          src={product.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-opacity duration-150 ease-entrance hover:opacity-85" />
        
        <span className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.75),transparent_55%)]" />
        <span
          className={[
          'absolute left-2 top-2 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white',
          drop.state === 'live' ?
          'bg-live' :
          drop.state === 'soon' ?
          'bg-brand-indigo' :
          'bg-ink-700 text-mist-300'].
          join(' ')}>
          
          {drop.state === 'live' &&
          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
          }
          {drop.label}
        </span>
        {countdown && drop.state === 'live' &&
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 font-mono text-[11px] font-semibold tabular-nums text-white backdrop-blur">
            {countdown}
          </span>
        }
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-sm font-bold leading-snug text-white">
          <Link
            to={`/market/product/${product.id}`}
            className="transition-colors duration-150 ease-entrance hover:text-brand-magenta">
            
            {product.name}
          </Link>
        </h3>
        {product.edition &&
        <p className="mt-1 text-[11px] font-semibold text-brand-amber">
            {drop.state === 'sold-out' ?
          `${product.edition.total} / ${product.edition.total} collected` :
          `Only ${product.edition.remaining} left · ${product.edition.total} total`}
          </p>
        }
        {drop.opensAt &&
        <p className="mt-1 text-[11px] text-mist-400">Drops {drop.opensAt}</p>
        }

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="text-sm font-bold text-white">{formatPrice(product.price)}</p>
          {drop.state === 'soon' ?
          <button
            type="button"
            onClick={() => toggleNotify(drop.id, product.name)}
            aria-pressed={notifying}
            className={[
            'rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance',
            notifying ?
            'border-brand-indigo/50 text-brand-indigo' :
            'border-white/15 text-mist-200 hover:text-white'].
            join(' ')}>
            
              {notifying ? 'Notifying you' : 'Notify me'}
            </button> :

          <ActionButton product={product} />
          }
        </div>
      </div>
    </article>);

}