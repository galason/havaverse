import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, ArrowRightIcon, RotateCwIcon } from 'lucide-react';

/**
 * Shared dashboard chrome. These wrap the existing HavaVerse card language
 * (rounded-2xl, border-white/5, bg-ink-900) rather than introducing a second
 * visual system — the dashboard extends the product, it does not fork it.
 */

export function Eyebrow({ children }: {children: React.ReactNode;}) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">{children}</p>);

}

interface PanelProps {
  heading?: string;
  subheading?: string;
  icon?: React.ReactNode;
  viewAll?: {label: string;to: string;};
  live?: boolean;
  children: React.ReactNode;
  className?: string;
  /**
   * Visual weight. `surface` for primary modules, `quiet` for the lighter
   * right rail, `plain` for thin-line editorial sections with no card at all.
   */
  variant?: 'surface' | 'quiet' | 'plain';
}

const variantClass: Record<NonNullable<PanelProps['variant']>, string> = {
  surface: 'rounded-2xl border border-white/[0.06] bg-ink-900/80 p-4 sm:p-5',
  quiet: 'rounded-2xl border border-white/[0.04] bg-ink-900/40 p-4',
  plain: 'border-t border-white/[0.06] pt-5'
};

/**
 * Lets the page assign a module's visual weight without every module
 * component needing to know where it sits.
 */
export const PanelWeightContext = React.createContext<NonNullable<PanelProps['variant']>>('surface');

export function Panel({
  heading,
  subheading,
  icon,
  viewAll,
  live,
  children,
  className = '',
  variant: variantProp
}: PanelProps) {
  const inherited = React.useContext(PanelWeightContext);
  const variant = variantProp ?? inherited;
  return (
    <section className={`${variantClass[variant]} ${className}`}>
      {heading &&
      <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {icon && <span className="text-brand-indigo">{icon}</span>}
              <Eyebrow>{heading}</Eyebrow>
              {live &&
            <span className="flex items-center gap-1.5 rounded-full bg-status-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-status-success-fg">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-success" />
                  </span>
                  Live
                </span>
            }
            </div>
            {subheading && <p className="mt-1.5 text-sm text-mist-300">{subheading}</p>}
          </div>
          {viewAll &&
        <Link
          to={viewAll.to}
          className="shrink-0 text-xs font-semibold text-brand-indigo transition-colors duration-150 ease-entrance hover:text-white">
          
              {viewAll.label}
            </Link>
        }
        </header>
      }
      {children}
    </section>);

}

/** 0-100. */
export function ProgressBar({ value, tone = 'indigo' }: {value: number;tone?: 'indigo' | 'amber' | 'live';}) {
  const fill =
  tone === 'amber' ? 'bg-brand-amber' : tone === 'live' ? 'bg-live' : 'bg-brand-indigo';
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}>
      
      <div
        className={`h-full rounded-full ${fill} transition-[width] duration-250 ease-entrance`}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      
    </div>);

}

export function ActionLink({ to, children }: {to: string;children: React.ReactNode;}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-indigo/25">
      
      {children}
      <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>);

}

export function ModuleSkeleton({ lines = 3 }: {lines?: number;}) {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) =>
      <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
      )}
    </div>);

}

/**
 * A module that fails does not take the dashboard down with it. It states what
 * is unavailable, confirms the rest is still usable, and offers a retry.
 */
export function ModuleError({ what, onRetry }: {what: string;onRetry: () => void;}) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-850 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-white">
        <AlertTriangleIcon className="h-4 w-4 text-brand-amber" aria-hidden="true" />
        {what} is temporarily unavailable
      </p>
      <p className="mt-1 text-xs text-mist-400">
        Everything else on your dashboard is still working.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
        
        <RotateCwIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Retry
      </button>
    </div>);

}

export { relativeTime } from '../../utils/time';