import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, SlidersHorizontalIcon } from 'lucide-react';

interface OwnerBarProps {
  titleName: string;
}

const panels: {label: string;to: string;note: string;}[] = [
{ label: 'Analytics', to: '/studio', note: 'Views, completion, retention' },
{ label: 'Audience', to: '/studio', note: 'Followers, regions, languages' },
{ label: 'Revenue', to: '/wallet', note: 'Earnings and payouts' },
{ label: 'Community', to: '/communities', note: 'Discussions and moderation' },
{ label: 'Media', to: '/studio/jobs', note: 'Masters, extras, artwork' },
{ label: 'Rights', to: '/studio/bible', note: 'Licences and provenance' },
{ label: 'Distribution', to: '/studio', note: 'Regions and availability' },
{ label: 'AI production', to: '/studio', note: 'Project, shots, jobs' },
{ label: 'Commerce', to: '/market', note: 'Products and passes' }];


/**
 * Owner tools stay out of the consumer experience — one unobtrusive control
 * that opens the dashboard, never administrative UI mixed into the page.
 */
export function OwnerBar({ titleName }: OwnerBarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-b border-white/5 bg-ink-900/60">
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
        <p className="flex items-center gap-2 text-[11px] font-semibold text-mist-200">
          <SlidersHorizontalIcon className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />
          You are the rights holder for {titleName}
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:border-white/30">
          
          Manage title
          <ChevronDownIcon
            className={`h-3 w-3 transition-transform duration-150 ease-entrance ${open ? 'rotate-180' : ''}`}
            aria-hidden="true" />
          
        </button>
      </div>

      {open &&
      <ul className="grid gap-2 px-4 pb-3 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
          {panels.map((panel) =>
        <li key={panel.label}>
              <Link
            to={panel.to}
            className="block rounded-xl border border-white/5 bg-ink-850 p-2.5 transition-colors duration-150 ease-entrance hover:border-white/20">
            
                <span className="block text-xs font-semibold text-white">{panel.label}</span>
                <span className="block text-[10px] text-mist-400">{panel.note}</span>
              </Link>
            </li>
        )}
        </ul>
      }
    </div>);

}