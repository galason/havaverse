import React from 'react';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { passwordChecks, passwordStrength } from '../../utils/validation';

const labels: Record<string, string> = {
  empty: '',
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong'
};

const tones: Record<string, string> = {
  weak: 'bg-live',
  fair: 'bg-brand-amber',
  good: 'bg-brand-indigo',
  strong: 'bg-brand-cyan'
};

const textTones: Record<string, string> = {
  weak: 'text-live',
  fair: 'text-brand-amber',
  good: 'text-brand-indigo',
  strong: 'text-brand-cyan'
};

export function PasswordStrength({
  password,
  showChecklist = true



}: {password: string;showChecklist?: boolean;}) {
  const { level, score } = passwordStrength(password);
  const checks = passwordChecks(password);

  return (
    <div className="mt-2">
      <div className="flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-200 ease-entrance ${tones[level] ?? ''}`}
            style={{ width: `${score}%` }} />
          
        </div>
        <span className={`w-12 text-right text-[11px] font-semibold ${textTones[level] ?? 'text-mist-400'}`}>
          {labels[level]}
        </span>
      </div>

      {showChecklist &&
      <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
          {checks.map((check) =>
        <li
          key={check.id}
          className={`flex items-center gap-1.5 text-[11px] ${check.met ? 'text-brand-cyan' : 'text-mist-400'}`}>
          
              {check.met ?
          <CheckIcon className="h-3 w-3 shrink-0" aria-hidden="true" /> :

          <MinusIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          }
              {check.label}
            </li>
        )}
        </ul>
      }
    </div>);

}