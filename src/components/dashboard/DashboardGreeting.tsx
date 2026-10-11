import React from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  AlertCircleIcon,
  CalendarClockIcon,
  CrownIcon,
  EyeIcon,
  SparklesIcon,
  UserIcon,
  UsersIcon,
  WandSparklesIcon } from
'lucide-react';
import type { DashboardViewerContext, PulseSignal, PulseTone } from '../../types/dashboard';

interface DashboardGreetingProps {
  ctx: DashboardViewerContext;
  signals: PulseSignal[];
  /** Existing project artwork, used as a quiet atmospheric layer. */
  atmosphere?: string;
}

/**
 * Ranking for the one-line status. Attention beats community beats progress
 * beats everything else — the line reads as "what matters first", not as a
 * list of every counter the dashboard knows about.
 */
const rank: Record<PulseTone, number> = {
  attention: 0,
  community: 1,
  progress: 2,
  running: 3,
  audience: 4,
  time: 5
};

const toneIcon: Record<PulseTone, React.ComponentType<{className?: string;}>> = {
  attention: AlertCircleIcon,
  running: SparklesIcon,
  community: UsersIcon,
  audience: EyeIcon,
  progress: ActivityIcon,
  time: CalendarClockIcon
};

const toneText: Record<PulseTone, string> = {
  attention: 'text-brand-amber',
  running: 'text-brand-indigo',
  community: 'text-status-success-fg',
  audience: 'text-brand-cyan',
  progress: 'text-brand-violet',
  time: 'text-mist-200'
};

const toneDot: Record<PulseTone, string> = {
  attention: 'bg-brand-amber',
  running: 'bg-brand-indigo',
  community: 'bg-status-success',
  audience: 'bg-brand-cyan',
  progress: 'bg-brand-violet',
  time: 'bg-mist-300'
};

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * The editorial entry point into the viewer's HavaVerse. Everything it says is
 * composed from the pulse signals the dashboard service already resolved —
 * the greeting owns no numbers of its own.
 */
export function DashboardGreeting({ ctx, signals, atmosphere }: DashboardGreetingProps) {
  const ranked = [...signals].sort((a, b) => rank[a.tone] - rank[b.tone]);
  const statusParts = ranked.slice(0, 3);
  const anyLive = signals.some((s) => s.live || s.tone === 'running');

  const chips: {label: string;icon: React.ComponentType<{className?: string;}>;className: string;}[] = [
  { label: 'Personal', icon: UserIcon, className: 'text-brand-violet ring-brand-violet/30' }];

  if (ctx.capabilities.includes('create')) {
    chips.push({ label: 'Creator', icon: WandSparklesIcon, className: 'text-brand-amber ring-brand-amber/30' });
  }
  if (ctx.capabilities.includes('premium')) {
    chips.push({ label: 'Premium', icon: CrownIcon, className: 'text-brand-cyan ring-brand-cyan/30' });
  }

  return (
    <header className="relative isolate -mx-4 -mt-4 overflow-hidden px-4 pb-8 pt-8 sm:-mx-5 sm:-mt-5 sm:px-6 sm:pt-10 lg:pb-10">
      {atmosphere &&
      <div aria-hidden="true" className="absolute inset-0 -z-10">
          <img
          src={atmosphere}
          alt=""
          className="absolute right-0 top-0 h-full w-full object-cover opacity-25 md:w-3/5" />
        
          <div className="absolute inset-0 bg-ink-950/70 md:bg-transparent" />
          <div className="absolute inset-y-0 left-0 hidden w-3/5 bg-gradient-to-r from-ink-950 via-ink-950/90 to-transparent md:block" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent" />
        </div>
      }

      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-400">
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          {anyLive &&
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-60 motion-reduce:hidden" />
          }
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-success" />
        </span>
        {anyLive ? 'Your HavaVerse is moving' : 'All systems active'}
      </p>

      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-wide text-white sm:text-5xl lg:text-6xl">
        {greetingFor(ctx.hour)}, {ctx.displayName}.
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-300 sm:text-base">
        {statusParts.length === 0 ?
        'Everything looks good today.' :

        statusParts.map((s, i) =>
        <React.Fragment key={s.id}>
              {i > 0 && <span className="mx-2 text-mist-400/60" aria-hidden="true">·</span>}
              <Link to={s.to} className="transition-colors duration-150 ease-entrance hover:text-white">
                {s.value && <span className={`font-semibold ${toneText[s.tone]}`}>{s.value} </span>}
                {s.label}
              </Link>
            </React.Fragment>
        )
        }
      </p>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active context">
        {chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <li
              key={chip.label}
              className={`inline-flex items-center gap-1.5 rounded-lg bg-ink-950/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1 ${chip.className}`}>
              
              <Icon className="h-3 w-3" aria-hidden="true" />
              {chip.label}
            </li>);

        })}
      </ul>

      {ranked.length > 0 &&
      <ul
        className="no-scrollbar mt-7 flex gap-6 overflow-x-auto border-t border-white/5 pt-4 sm:gap-8"
        aria-label="Live signals">
        
          {ranked.map((s) => {
          const Icon = toneIcon[s.tone];
          return (
            <li key={s.id} className="shrink-0">
                <Link to={s.to} className="group flex items-start gap-2.5">
                  <span className="relative mt-1 flex h-2 w-2 shrink-0" aria-hidden="true">
                    {s.live &&
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden ${toneDot[s.tone]}`} />

                  }
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${toneDot[s.tone]}`} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-mist-100 transition-colors duration-150 ease-entrance group-hover:text-white">
                      <Icon className={`h-3.5 w-3.5 ${toneText[s.tone]}`} aria-hidden="true" />
                      {s.value && <span className="font-semibold text-white">{s.value}</span>}
                      {s.label}
                    </span>
                    {s.detail &&
                  <span className="mt-0.5 block text-[11px] text-mist-400">{s.detail}</span>
                  }
                  </span>
                </Link>
              </li>);

        })}
        </ul>
      }
    </header>);

}