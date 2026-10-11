import React from 'react';
import { BellIcon, BellRingIcon } from 'lucide-react';

interface ReminderButtonProps {
  on: boolean;
  title: string;
  onToggle: () => void;
  compact?: boolean;
}

export function ReminderButton({ on, title, onToggle, compact = false }: ReminderButtonProps) {
  const Icon = on ? BellRingIcon : BellIcon;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? `Remove reminder for ${title}` : `Remind me about ${title}`}
      className={[
      'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border font-semibold transition-colors duration-150 ease-entrance',
      compact ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs',
      on ?
      'border-brand-cyan/50 bg-brand-cyan/10 text-brand-cyan' :
      'border-white/15 text-white hover:border-white/35'].
      join(' ')}>
      
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {on ? 'Reminder on' : 'Remind me'}
    </button>);

}