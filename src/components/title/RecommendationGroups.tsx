import React from 'react';
import { InfoIcon } from 'lucide-react';
import type { RecommendationGroup } from '../../types/title';
import { bySlug } from '../../data/catalog';
import { TitleCard } from '../home/TitleCard';
import { EmptyBlock } from '../community/StateBlocks';

interface RecommendationGroupsProps {
  groups: RecommendationGroup[];
}

/**
 * Recommendation transparency: every group can state why it exists, in the
 * viewer's terms, rather than presenting an unexplained shelf.
 */
export function RecommendationGroups({ groups }: RecommendationGroupsProps) {
  const [activeId, setActiveId] = React.useState(groups[0]?.id ?? '');
  const [whyOpen, setWhyOpen] = React.useState(false);

  const group = groups.find((g) => g.id === activeId) ?? groups[0];
  if (!group) return null;

  const items = group.slugs.map(bySlug).filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="space-y-3">
      <ul className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {groups.map((g) =>
        <li key={g.id}>
            <button
            type="button"
            onClick={() => {
              setActiveId(g.id);
              setWhyOpen(false);
            }}
            aria-pressed={g.id === activeId}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 ease-entrance ${
            g.id === activeId ?
            'bg-brand-indigo text-white' :
            'border border-white/10 text-mist-300 hover:text-white'}`
            }>
            
              {g.label}
            </button>
          </li>
        )}
      </ul>

      <div>
        <button
          type="button"
          onClick={() => setWhyOpen((v) => !v)}
          aria-expanded={whyOpen}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-mist-400 hover:text-white">
          
          <InfoIcon className="h-3 w-3" aria-hidden="true" />
          Why am I seeing this?
        </button>
        {whyOpen &&
        <p className="mt-1.5 rounded-xl border border-white/5 bg-ink-900 p-3 text-xs leading-relaxed text-mist-200">
            {group.why}
          </p>
        }
      </div>

      {items.length === 0 ?
      <EmptyBlock
        title="Nothing here yet"
        body="This shelf has no titles available to you in this region." /> :


      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((item) =>
        <TitleCard key={item.id} title={item} />
        )}
        </div>
      }
    </div>);

}