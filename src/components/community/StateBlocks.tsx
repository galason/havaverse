import React from 'react';
import { AlertTriangleIcon, Loader2Icon } from 'lucide-react';

export function LoadingBlock({ label = 'Loading…' }: {label?: string;}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2.5 rounded-2xl border border-white/5 bg-ink-900 px-6 py-12 text-sm text-mist-300">
      
      <Loader2Icon className="h-4 w-4 animate-spin text-brand-indigo" aria-hidden="true" />
      {label}
    </div>);

}

export function SkeletonRows({ rows = 3 }: {rows?: number;}) {
  return (
    <div role="status" aria-live="polite" className="space-y-2">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }).map((_, index) =>
      <div
        key={index}
        className="h-20 animate-pulse rounded-2xl border border-white/5 bg-ink-900" />

      )}
    </div>);

}

interface EmptyBlockProps {
  title: string;
  body: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyBlock({ title, body, icon, action }: EmptyBlockProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-ink-900 px-6 py-10 text-center">
      {icon && <div className="mb-3 flex justify-center text-mist-400">{icon}</div>}
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-mist-400">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>);

}

export function ErrorBlock({ message, onRetry }: {message: string;onRetry?: () => void;}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-live/30 bg-live/5 px-6 py-8 text-center">
      
      <AlertTriangleIcon className="mx-auto h-5 w-5 text-live" aria-hidden="true" />
      <p className="mt-2 text-sm font-semibold text-white">{message}</p>
      {onRetry &&
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:text-white">
        
          Try again
        </button>
      }
    </div>);

}