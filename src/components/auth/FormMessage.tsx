import React from 'react';
import { AlertCircleIcon, CheckCircle2Icon, WifiOffIcon } from 'lucide-react';

interface FormMessageProps {
  tone: 'error' | 'success' | 'offline';
  children: React.ReactNode;
}

const config = {
  error: {
    icon: AlertCircleIcon,
    className: 'border-live/40 bg-live/10 text-mist-100',
    role: 'alert' as const
  },
  offline: {
    icon: WifiOffIcon,
    className: 'border-brand-amber/40 bg-brand-amber/10 text-mist-100',
    role: 'alert' as const
  },
  success: {
    icon: CheckCircle2Icon,
    className: 'border-brand-cyan/40 bg-brand-cyan/10 text-mist-100',
    role: 'status' as const
  }
};

export function FormMessage({ tone, children }: FormMessageProps) {
  const { icon: Icon, className, role } = config[tone];
  return (
    <p
      role={role}
      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed ${className}`}>
      
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>);

}