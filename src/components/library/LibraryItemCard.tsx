import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClapperboardIcon,
  DiscIcon,
  Loader2Icon,
  MessageSquareTextIcon,
  MicIcon,
  PaletteIcon,
  ShoppingBagIcon,
  UserIcon,
  UsersIcon,
  XIcon } from
'lucide-react';
import type { LibraryItem, LibraryItemKind } from '../../types/library';

const kindIcon: Record<LibraryItemKind, React.ComponentType<{className?: string;}>> = {
  title: ClapperboardIcon,
  short: ClapperboardIcon,
  track: DiscIcon,
  edition: DiscIcon,
  episode: MicIcon,
  show: MicIcon,
  discussion: MessageSquareTextIcon,
  'fan-creation': PaletteIcon,
  creator: UserIcon,
  community: UsersIcon,
  product: ShoppingBagIcon,
  project: ClapperboardIcon
};

interface Props {
  item: LibraryItem;
  onRemove: (item: LibraryItem) => void;
  removing: boolean;
}

export function LibraryItemCard({ item, onRemove, removing }: Props) {
  const Icon = kindIcon[item.kind];
  const round = item.kind === 'creator';

  return (
    <li className="group relative flex flex-col">
      <Link
        to={item.href}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo">
        
        <div
          className={[
          'relative overflow-hidden bg-ink-850',
          round ? 'mx-auto aspect-square w-3/4 rounded-full' : 'aspect-video rounded-xl'].
          join(' ')}>
          
          {item.image ?
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.03]" /> :


          <div className="flex h-full w-full items-center justify-center">
              <Icon className="h-7 w-7 text-mist-400" aria-hidden="true" />
            </div>
          }
          {typeof item.progress === 'number' && item.progress > 0 && !round &&
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/50" aria-hidden="true">
              <div className="h-full bg-brand-indigo" style={{ width: `${item.progress}%` }} />
            </div>
          }
        </div>
        <div className={['mt-2.5 min-w-0', round ? 'text-center' : ''].join(' ')}>
          <p className="truncate text-sm font-semibold text-white">{item.title}</p>
          <p className="truncate text-xs text-mist-400">{item.subtitle}</p>
          {item.status && <p className="mt-0.5 truncate text-[11px] font-medium text-mist-300">{item.status}</p>}
        </div>
      </Link>

      {item.removable &&
      <button
        type="button"
        onClick={() => onRemove(item)}
        disabled={removing}
        aria-label={`${item.removeLabel ?? 'Remove'}: ${item.title}`}
        title={item.removeLabel}
        className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-100 transition-opacity duration-150 ease-entrance hover:bg-black/80 focus-visible:opacity-100 disabled:opacity-60 sm:opacity-0 sm:group-hover:opacity-100">
        
          {removing ?
        <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> :

        <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
        }
        </button>
      }
    </li>);

}