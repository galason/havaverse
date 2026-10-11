import {
  ClapperboardIcon,
  InfoIcon,
  RadioIcon,
  ShieldAlertIcon,
  ShoppingBagIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon } from
'lucide-react';
import type { NotificationCategory } from '../../types/notifications';

/** One icon and one tone per category, shared by the header menu and the centre. */
export const categoryVisuals: Record<NotificationCategory, {icon: LucideIcon;tone: string;tile: string;}> = {
  social: { icon: UsersIcon, tone: 'text-brand-cyan', tile: 'bg-brand-cyan/10' },
  creator: { icon: ClapperboardIcon, tone: 'text-brand-magenta', tile: 'bg-brand-magenta/10' },
  economy: { icon: WalletIcon, tone: 'text-brand-amber', tile: 'bg-brand-amber/10' },
  commerce: { icon: ShoppingBagIcon, tone: 'text-brand-violet', tile: 'bg-brand-violet/10' },
  live: { icon: RadioIcon, tone: 'text-live', tile: 'bg-live/10' },
  security: { icon: ShieldAlertIcon, tone: 'text-live', tile: 'bg-live/10' },
  system: { icon: InfoIcon, tone: 'text-mist-300', tile: 'bg-white/5' }
};