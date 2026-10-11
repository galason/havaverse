import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  ShieldAlertIcon,
  UsersIcon,
  WalletIcon } from
'lucide-react';
import type { DayCard, DayCardKind } from '../../types/dashboard';

interface KindMeta {
  label: string;
  icon: React.ComponentType<{className?: string;}>;
  /** Text/icon tone. */
  tone: string;
  /** Surface wash + edge — each moment reads differently at a glance. */
  surface: string;
  /** Primary action treatment. */
  action: string;
}

const kindMeta: Record<DayCardKind, KindMeta> = {
  blocked: {
    label: 'Action required',
    icon: AlertTriangleIcon,
    tone: 'text-live',
    surface: 'border-live/30 bg-live/[0.06]',
    action: 'bg-live/15 text-live hover:bg-live/25'
  },
  review: {
    label: 'Review required',
    icon: ClipboardCheckIcon,
    tone: 'text-brand-amber',
    surface: 'border-brand-amber/30 bg-brand-amber/[0.06]',
    action: 'bg-brand-amber/15 text-brand-amber hover:bg-brand-amber/25'
  },
  'ai-complete': {
    label: 'AI complete',
    icon: CheckCircle2Icon,
    tone: 'text-brand-cyan',
    surface: 'border-brand-cyan/25 bg-brand-cyan/[0.05]',
    action: 'bg-brand-cyan/15 text-brand-cyan hover:bg-brand-cyan/25'
  },
  upcoming: {
    label: 'Upcoming',
    icon: CalendarIcon,
    tone: 'text-brand-violet',
    surface: 'border-brand-violet/25 bg-brand-violet/[0.05]',
    action: 'bg-brand-violet/15 text-brand-violet hover:bg-brand-violet/25'
  },
  community: {
    label: 'Community',
    icon: UsersIcon,
    tone: 'text-status-success-fg',
    surface: 'border-status-success/25 bg-status-success/[0.05]',
    action: 'bg-status-success/15 text-status-success-fg hover:bg-status-success/25'
  },
  economy: {
    label: 'HavaPay',
    icon: WalletIcon,
    tone: 'text-brand-cyan',
    surface: 'border-brand-cyan/25 bg-brand-cyan/[0.05]',
    action: 'bg-brand-cyan/15 text-brand-cyan hover:bg-brand-cyan/25'
  },
  security: {
    label: 'Security',
    icon: ShieldAlertIcon,
    tone: 'text-live',
    surface: 'border-live/30 bg-live/[0.06]',
    action: 'bg-live/15 text-live hover:bg-live/25'
  }
};

/** Order the day by urgency, not by how the service happened to list it. */
const urgency: DayCardKind[] = ['blocked', 'security', 'review', 'ai-complete', 'economy', 'community', 'upcoming'];

/**
 * The only part of the dashboard that claims priority. Each kind is a
 * different moment — something blocked, something waiting on you, something
 * finished, something coming — and is coloured and composed as such.
 * On mobile the moments collapse into scannable rows.
 */
export function MyDay({ cards }: {cards: DayCard[];}) {
  const ordered = [...cards].sort((a, b) => urgency.indexOf(a.kind) - urgency.indexOf(b.kind));

  return (
    <>
      {/* Mobile: compact priority rows */}
      <ul className="space-y-2 sm:hidden">
        {ordered.map((card) => {
          const meta = kindMeta[card.kind];
          const Icon = meta.icon;
          return (
            <li key={card.id}>
              <Link
                to={card.to}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${meta.surface}`}>
                
                <Icon className={`h-5 w-5 shrink-0 ${meta.tone}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{card.title}</span>
                  <span className="block truncate text-[11px] text-mist-400">{card.detail}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-mist-100">
                  {card.actionLabel}
                  <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>);

        })}
      </ul>

      {/* Tablet/desktop: three distinct moments */}
      <div className="hidden gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-3">
        {ordered.map((card) => {
          const meta = kindMeta[card.kind];
          const Icon = meta.icon;
          return (
            <article
              key={card.id}
              className={`flex flex-col rounded-xl border p-4 transition-colors duration-150 ease-entrance ${meta.surface}`}>
              
              <div className="flex items-start gap-3">
                {card.image ?
                <img
                  src={card.image}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover" /> :


                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-950/60">
                    <Icon className={`h-5 w-5 ${meta.tone}`} aria-hidden="true" />
                  </span>
                }
                <div className="min-w-0">
                  <p className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${meta.tone}`}>
                    {card.image && <Icon className="h-3 w-3" aria-hidden="true" />}
                    {meta.label}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold leading-snug text-white">{card.title}</h3>
                </div>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-mist-300">{card.detail}</p>
              <div className="mt-auto pt-4">
                <Link
                  to={card.to}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance ${meta.action}`}>
                  
                  {card.actionLabel}
                  <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>);

        })}
      </div>
    </>);

}