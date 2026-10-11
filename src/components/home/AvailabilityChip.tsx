import React from 'react';
import { GlobeIcon, LockIcon, ClockIcon } from 'lucide-react';
import type { Availability } from '../../types/home';

/**
 * Rights are stated, never hidden behind a play button the viewer cannot use.
 */
export function AvailabilityChip({ availability }: {availability: Availability;}) {
  if (availability.state === 'available') return null;

  const tone =
  availability.state === 'region-blocked' ?
  'border-live/40 bg-live/10 text-live' :
  'border-brand-amber/40 bg-brand-amber/10 text-brand-amber';

  const Icon =
  availability.state === 'region-blocked' ?
  GlobeIcon :
  availability.state === 'upcoming' ?
  ClockIcon :
  LockIcon;

  const label =
  availability.state === 'ppv' ?
  `${availability.label} · ${availability.price}` :
  availability.label;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
      
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>);

}

/** The action the viewer can actually take, given the rights state. */
export function resolveAction(
availability: Availability,
slug: string)
: {label: string;to: string;} {
  switch (availability.state) {
    case 'available':
      return { label: 'Watch now', to: `/watch/${slug}` };
    case 'premium':
      return { label: 'Watch with Premium', to: `/title/${slug}` };
    case 'ppv':
      return { label: `Unlock · ${availability.price}`, to: `/title/${slug}` };
    case 'region-blocked':
      return { label: 'Why not here?', to: `/title/${slug}` };
    case 'upcoming':
      return { label: 'Notify me', to: `/title/${slug}` };
  }
}