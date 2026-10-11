import React from 'react';
import { Loader2Icon } from 'lucide-react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function AuthButton({
  loading = false,
  loadingLabel = 'Working…',
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...rest
}: AuthButtonProps) {
  const base =
  'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150 ease-entrance disabled:cursor-not-allowed';
  const styles =
  variant === 'primary' ?
  'bg-brand-indigo text-white hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400' :
  'border border-white/15 text-mist-200 hover:border-white/30 hover:text-white disabled:opacity-50';

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${base} ${styles} ${className}`}>
      
      {loading && <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {loading ? loadingLabel : children}
    </button>);

}