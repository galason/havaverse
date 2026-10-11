import React from 'react';
import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import type { NextExperience } from '../../types/home';

/**
 * One chosen move through the graph, not another shelf. The system decides
 * from playback state, creator activity and universe adjacency.
 */
export function NextExperienceCard({ next }: {next: NextExperience;}) {
  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-brand-indigo/25 bg-ink-900 sm:flex-row sm:items-center">
      <img
        src={next.image}
        alt=""
        className="h-36 w-full shrink-0 object-cover sm:h-28 sm:w-44" />
      
      <div className="min-w-0 flex-1 px-4 pb-4 sm:px-0 sm:pb-0">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
          <CompassIcon className="h-3 w-3" aria-hidden="true" />
          Chosen for where you stopped
        </p>
        <h3 className="mt-1 text-base font-bold text-white">{next.headline}</h3>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-mist-300">{next.body}</p>
      </div>
      <div className="px-4 pb-4 sm:pr-4">
        <Link
          to={next.cta.to}
          className="inline-block rounded-full bg-white px-5 py-2.5 text-xs font-bold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
          
          {next.cta.label}
        </Link>
      </div>
    </div>);

}