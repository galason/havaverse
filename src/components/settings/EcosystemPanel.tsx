import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { ecosystemLinks } from '../../data/settings';

/** Compact = the persistent side rail; full = the Connected ecosystem section. */
export function EcosystemPanel({ compact = false }: {compact?: boolean;}) {
  return (
    <ul className={compact ? 'space-y-1' : 'grid gap-3 md:grid-cols-2'}>
      {ecosystemLinks.map((link) =>
      <li key={link.id}>
          <Link
          to={link.to}
          className={`flex items-center gap-3 rounded-xl border border-white/5 bg-ink-850 transition-colors duration-150 ease-entrance hover:border-white/20 ${
          compact ? 'p-2.5' : 'p-4'}`
          }>
          
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{link.label}</p>
              {!compact &&
            <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">
                  {link.permissions.join(' · ')}
                </p>
            }
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-brand-cyan">
              <span
              className="h-1.5 w-1.5 rounded-full bg-brand-cyan"
              aria-hidden="true" />
            
              Connected
            </span>
            <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-mist-400" aria-hidden="true" />
          </Link>
        </li>
      )}
    </ul>);

}