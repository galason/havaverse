import React from 'react';
import { Link } from 'react-router-dom';
import type { TitleEarnings } from '../../types/creatorEconomy';
import { naira } from '../../utils/currency';

export function TitleEarningsList({ titles }: {titles: TitleEarnings[];}) {
  return (
    <section aria-labelledby="titles-heading" className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      <h2 id="titles-heading" className="text-sm font-bold text-white">
        By title
      </h2>
      {titles.length === 0 ?
      <p className="mt-2 text-xs text-mist-400">Earnings appear here once one of your titles is published.</p> :

      <ul className="mt-3 space-y-3">
          {titles.map((t) =>
        <li key={t.slug}>
              <Link
            to={`/title/${t.slug}`}
            className="flex items-center gap-3 rounded-lg transition-colors duration-150 ease-entrance hover:bg-white/5">
            
                <img src={t.poster} alt="" className="h-12 w-9 shrink-0 rounded object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-white">{t.name}</span>
                  <span className="block truncate text-[11px] text-mist-400">
                    {t.newRelease ?
                'Just published · no earnings yet' :
                `${naira(t.previous)} last month`}
                  </span>
                </span>
                <span className="text-xs font-semibold tabular-nums text-white">
                  {t.newRelease ? '—' : naira(t.current)}
                </span>
              </Link>
            </li>
        )}
        </ul>
      }
    </section>);

}