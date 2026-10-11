import React from 'react';
import { Link } from 'react-router-dom';
import { GlobeIcon, LockIcon, ShieldAlertIcon } from 'lucide-react';
import type { Entitlement } from '../../types/watch';
import type { ContentTitle } from '../../types/content';

interface EntitlementGateProps {
  title: ContentTitle;
  entitlement: Entitlement;
  currencySymbol: string;
  unlocking: boolean;
  onUnlock: () => void;
  alternatives: ContentTitle[];
}

/**
 * Rendered instead of the player when the server says this viewer cannot
 * watch. The client never decides entitlement — it only renders the verdict
 * and offers the one route forward that applies.
 */
export function EntitlementGate({
  title,
  entitlement,
  currencySymbol,
  unlocking,
  onUnlock,
  alternatives
}: EntitlementGateProps) {
  const purchasable = entitlement.state === 'ppv-required';
  const Icon =
  entitlement.state === 'region-restricted' ?
  GlobeIcon :
  entitlement.state === 'age-restricted' ?
  ShieldAlertIcon :
  LockIcon;

  return (
    <section className="theme-dark relative overflow-hidden rounded-2xl border border-white/5 bg-ink-950">
      <img
        src={title.backdrop ?? title.poster}
        alt=""
        className="aspect-video w-full object-cover opacity-25" />
      
      <div className="absolute inset-0 grid place-items-center bg-ink-950/60 p-6">
        <div className="max-w-md text-center">
          <Icon className="mx-auto h-7 w-7 text-brand-amber" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold tracking-tight text-white sm:text-xl">
            {entitlement.state === 'region-restricted' ?
            "This title isn't available in your region" :
            purchasable ?
            `${title.name} — Premium Premiere` :
            'You need access to watch this'}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-mist-300">{entitlement.reason}</p>

          {purchasable && entitlement.priceMinor &&
          <>
              <button
              type="button"
              onClick={onUnlock}
              disabled={unlocking}
              className="mt-4 rounded-full bg-brand-amber px-6 py-3 text-sm font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-brand-amber/90 disabled:bg-ink-700 disabled:text-mist-400">
              
                {unlocking ?
              'Unlocking…' :
              `Unlock and watch · ${currencySymbol}${(entitlement.priceMinor / 100).toLocaleString()}`}
              </button>
              {entitlement.includedWith &&
            <p className="mt-2 text-[11px] text-mist-400">
                  Included with {entitlement.includedWith}. Pricing comes from your region's
                  configuration.
                </p>
            }
            </>
          }

          {entitlement.availableRegions &&
          <p className="mt-3 text-[11px] text-mist-400">
              Licensed in {entitlement.availableRegions.join(', ')}.
            </p>
          }

          {alternatives.length > 0 &&
          <>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
                Available to you now
              </p>
              <ul className="mt-2 flex justify-center gap-2">
                {alternatives.slice(0, 3).map((alt) =>
              <li key={alt.id}>
                    <Link
                  to={`/watch/${alt.slug}`}
                  className="block w-24 transition-transform duration-150 ease-entrance hover:-translate-y-0.5">
                  
                      <img
                    src={alt.poster}
                    alt=""
                    className="aspect-[2/3] w-full rounded-lg object-cover" />
                  
                      <span className="mt-1 block truncate text-[11px] text-mist-200">
                        {alt.name}
                      </span>
                    </Link>
                  </li>
              )}
              </ul>
            </>
          }
        </div>
      </div>
    </section>);

}