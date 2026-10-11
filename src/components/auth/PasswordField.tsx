import React from 'react';
import { EyeIcon, EyeOffIcon, XIcon } from 'lucide-react';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  trailing?: React.ReactNode;
}

export function PasswordField({
  id,
  label,
  error,
  trailing,
  className = '',
  ...rest
}: PasswordFieldProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline gap-2">
        <label htmlFor={id} className="text-xs font-medium text-mist-200">
          {label}
        </label>
        {trailing && <span className="ml-auto">{trailing}</span>}
      </div>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
          className={[
          'h-11 w-full rounded-xl border bg-ink-850 pl-3.5 pr-11 text-sm text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:outline-none',
          error ? 'border-live/60 focus:border-live' : 'border-white/10 focus:border-brand-indigo'].
          join(' ')} />
        
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-1.5 top-1.5 rounded-lg p-2 text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
          
          {visible ?
          <EyeOffIcon className="h-4 w-4" aria-hidden="true" /> :

          <EyeIcon className="h-4 w-4" aria-hidden="true" />
          }
        </button>
      </div>
      {error &&
      <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-[11px] text-live">
          <XIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          {error}
        </p>
      }
    </div>);

}