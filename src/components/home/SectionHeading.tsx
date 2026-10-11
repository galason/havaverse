import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';

interface SectionHeadingProps {
  heading: string;
  subheading?: string;
  viewAllTo?: string;
  /** Rendered between the heading and the See all link. */
  aside?: React.ReactNode;
  id?: string;
}

export function SectionHeading({
  heading,
  subheading,
  viewAllTo,
  aside,
  id
}: SectionHeadingProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
      <h2 id={id} className="text-lg font-bold tracking-tight text-white">
        {heading}
      </h2>
      {subheading &&
      <span className="text-xs text-mist-400">{subheading}</span>
      }
      {aside}
      {viewAllTo &&
      <Link
        to={viewAllTo}
        className="ml-auto flex items-center gap-0.5 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
        
          See all
          <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      }
    </div>);

}