import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionTo?: string;
  id?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  actionLabel = 'View all',
  actionTo,
  id
}: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-end gap-2.5">
      {icon}
      <div className="min-w-0">
        <h2 id={id} className="text-base font-bold tracking-tight text-white sm:text-lg">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-mist-400">{subtitle}</p>}
      </div>
      {actionTo &&
      <Link
        to={actionTo}
        className="ml-auto flex shrink-0 items-center gap-0.5 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
        
          {actionLabel}
          <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      }
    </div>);

}