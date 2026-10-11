import React from 'react';
import {
  BookOpenIcon,
  CalendarIcon,
  ClapperboardIcon,
  FilmIcon,
  GlobeIcon,
  HashIcon,
  MessageSquareIcon,
  MicIcon,
  Music2Icon,
  OrbitIcon,
  PaletteIcon,
  PlayIcon,
  ShieldIcon,
  ShoppingBagIcon,
  StoreIcon,
  TrophyIcon,
  TvIcon,
  UserIcon,
  UserRoundIcon,
  UsersIcon,
  AudioLinesIcon } from
'lucide-react';
import type { GraphNodeType } from '../../types/graph';

type IconType = React.ComponentType<{className?: string;'aria-hidden'?: boolean | 'true';}>;

export const nodeIcons: Record<GraphNodeType, IconType> = {
  film: FilmIcon,
  series: TvIcon,
  short: PlayIcon,
  track: Music2Icon,
  artist: AudioLinesIcon,
  show: MicIcon,
  episode: MicIcon,
  match: TrophyIcon,
  team: ShieldIcon,
  creator: ClapperboardIcon,
  person: UserRoundIcon,
  character: UserIcon,
  universe: OrbitIcon,
  world: GlobeIcon,
  topic: HashIcon,
  community: UsersIcon,
  discussion: MessageSquareIcon,
  'fan-creation': PaletteIcon,
  event: CalendarIcon,
  product: ShoppingBagIcon,
  store: StoreIcon
};

export function NodeIcon({ type, className = 'h-4 w-4' }: {type: GraphNodeType;className?: string;}) {
  const Icon = nodeIcons[type] ?? BookOpenIcon;
  return <Icon className={className} aria-hidden="true" />;
}