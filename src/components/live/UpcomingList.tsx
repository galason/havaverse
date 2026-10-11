import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../contexts/CommerceContext';
import { sourceLabels } from '../../services/liveApi';
import { ReminderButton } from './ReminderButton';
import type { LiveEntry } from '../../types/live';

interface UpcomingListProps {
  entries: LiveEntry[];
  isReminded: (id: string) => boolean;
  onToggleReminder: (entry: LiveEntry) => void;
  onOpen: (entry: LiveEntry) => void;
}

function accessLabel(entry: LiveEntry): {text: string;tone: string;} | null {
  if (entry.access === 'sold-out') return { text: 'Sold out', tone: 'text-mist-400' };
  if (entry.access === 'free') return { text: 'Free', tone: 'text-status-success-fg' };
  if (entry.access === 'ticketed' && entry.price) return { text: `Tickets ${formatPrice(entry.price)}`, tone: 'text-brand-amber' };
  return null;
}

/** A schedule reads as a list: when, what, and one action per row. */
export function UpcomingList({ entries, isReminded, onToggleReminder, onOpen }: UpcomingListProps) {
  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      {entries.map((entry) => {
        const access = accessLabel(entry);
        return (
          <li key={entry.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-3.5">
            <Link
              to={entry.to}
              onClick={() => onOpen(entry)}
              className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo">
              
              <span className="block aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-ink-850 sm:w-32">
                <img src={entry.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-brand-cyan">{entry.when}</span>
                <span className="mt-0.5 block truncate text-sm font-bold text-white transition-colors duration-150 ease-entrance group-hover:text-brand-indigo">
                  {entry.title}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-mist-400">
                  {sourceLabels[entry.source]} · {entry.kindLabel}
                  {entry.source !== 'sports' && ` · ${entry.context}`}
                </span>
              </span>
            </Link>
            <div className="flex items-center justify-between gap-3 pl-[6.75rem] sm:justify-end sm:pl-0">
              {access && <span className={`whitespace-nowrap text-[11px] font-semibold ${access.tone}`}>{access.text}</span>}
              <ReminderButton
                compact
                on={isReminded(entry.id)}
                title={entry.title}
                onToggle={() => onToggleReminder(entry)} />
              
            </div>
          </li>);

      })}
    </ul>);

}