import React from 'react';
import { CheckIcon, Loader2Icon, XIcon } from 'lucide-react';

type Status = 'idle' | 'checking' | 'valid' | 'invalid';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  status?: Status;
  statusLabel?: string;
}

export function TextField({
  id,
  label,
  hint,
  error,
  status = 'idle',
  statusLabel,
  className = '',
  ...rest
}: TextFieldProps) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].
  filter(Boolean).
  join(' ');

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline gap-2">
        <label htmlFor={id} className="text-xs font-medium text-mist-200">
          {label}
        </label>
        {statusLabel &&
        <span
          className={[
          'ml-auto flex items-center gap-1 text-[11px]',
          status === 'valid' ?
          'text-brand-cyan' :
          status === 'invalid' ?
          'text-live' :
          'text-mist-400'].
          join(' ')}>
          
            {status === 'checking' && <Loader2Icon className="h-3 w-3 animate-spin" aria-hidden="true" />}
            {status === 'valid' && <CheckIcon className="h-3 w-3" aria-hidden="true" />}
            {status === 'invalid' && <XIcon className="h-3 w-3" aria-hidden="true" />}
            {statusLabel}
          </span>
        }
      </div>
      <input
        id={id}
        aria-invalid={Boolean(error) || status === 'invalid'}
        aria-describedby={describedBy || undefined}
        {...rest}
        className={[
        'h-11 w-full rounded-xl border bg-ink-850 px-3.5 text-sm text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:outline-none',
        error || status === 'invalid' ?
        'border-live/60 focus:border-live' :
        'border-white/10 focus:border-brand-indigo'].
        join(' ')} />
      
      {hint && !error &&
      <p id={`${id}-hint`} className="mt-1.5 text-[11px] text-mist-400">
          {hint}
        </p>
      }
      {error &&
      <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-[11px] text-live">
          <XIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          {error}
        </p>
      }
    </div>);

}