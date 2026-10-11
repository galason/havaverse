import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import type { Provenance } from '../../types/commerce';

/**
 * Provenance is the trust mechanism, not decoration: it shows the buyer which
 * creator, work and IP a product resolves to, and every link is walkable.
 */
export function ProvenanceChain({ provenance }: {provenance: Provenance;}) {
  const links = [
  provenance.creator,
  provenance.content,
  provenance.ip,
  provenance.universe].
  filter(Boolean) as Provenance['creator'][];

  return (
    <div className="rounded-xl border border-white/5 bg-ink-850 p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-400">
        Provenance
      </p>
      <dl className="mt-2 space-y-1.5">
        {links.map((link) =>
        <div key={link.label} className="flex items-baseline gap-2 text-xs">
            <dt className="w-20 shrink-0 text-mist-400">{link.label}</dt>
            <dd className="min-w-0">
              <Link
              to={link.to}
              className="truncate font-semibold text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
              
                {link.value}
              </Link>
            </dd>
          </div>
        )}
      </dl>
      <p className="mt-2.5 flex flex-wrap items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-mist-400">
        Content
        <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
        Character
        <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
        IP
        <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
        <span className="text-brand-magenta">Product</span>
      </p>
    </div>);

}