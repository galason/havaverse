import React from 'react';
import { BadgeCheckIcon, PaletteIcon, UsersIcon, VideoIcon } from 'lucide-react';

export type Origin = 'official' | 'fan' | 'creator' | 'community';

const config: Record<Origin, {label: string;className: string;Icon: React.ComponentType<{className?: string;}>;}> = {
  official: {
    label: 'Official',
    className: 'border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan',
    Icon: BadgeCheckIcon
  },
  creator: {
    label: 'Creator',
    className: 'border-brand-magenta/40 bg-brand-magenta/10 text-brand-magenta',
    Icon: VideoIcon
  },
  fan: {
    label: 'Fan creation',
    className: 'border-brand-amber/40 bg-brand-amber/10 text-brand-amber',
    Icon: PaletteIcon
  },
  community: {
    label: 'Community',
    className: 'border-white/15 bg-white/5 text-mist-200',
    Icon: UsersIcon
  }
};

export function OriginTag({ origin, label }: {origin: Origin;label?: string;}) {
  const { className, Icon, label: fallback } = config[origin];
  return (
    <span
      className={[
      'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
      className].
      join(' ')}>
      
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label ?? fallback}
    </span>);

}