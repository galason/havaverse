import React from 'react';
import {
  BookmarkIcon,
  EllipsisIcon,
  HeartIcon,
  MessageCircleIcon,
  Share2Icon,
  UserPlusIcon,
  UserCheckIcon } from
'lucide-react';
import type { DismissReason, Short } from '../../types/shorts';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ActionStackProps {
  short: Short;
  liked: boolean;
  saved: boolean;
  following: boolean;
  onLike: () => void;
  onSave: () => void;
  onFollow: () => void;
  onComments: () => void;
  onShare: () => void;
  onReport: () => void;
  onWhy: () => void;
  onDismiss: (reason: DismissReason) => void;
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

function Action({
  icon,
  label,
  count,
  active,
  activeClass = 'text-live',
  onClick,
  pressed








}: {icon: React.ReactNode;label: string;count?: string;active?: boolean;activeClass?: string;onClick: () => void;pressed?: boolean;}) {
  return (
    <li className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={pressed}
        className={`grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-ink-850/90 backdrop-blur-sm transition-colors duration-150 ease-entrance hover:border-white/35 ${
        active ? activeClass : 'text-white'}`
        }>
        
        {icon}
      </button>
      {count &&
      <span className="text-[10px] font-semibold tabular-nums text-mist-300">{count}</span>
      }
    </li>);

}

const dismissOptions: {id: DismissReason;label: string;}[] = [
{ id: 'this-short', label: 'Not interested in this' },
{ id: 'this-creator', label: 'Don’t recommend this creator' },
{ id: 'this-topic', label: 'Less of this topic' },
{ id: 'seen-it', label: 'I’ve already seen it' }];


export function ActionStack({
  short,
  liked,
  saved,
  following,
  onLike,
  onSave,
  onFollow,
  onComments,
  onShare,
  onReport,
  onWhy,
  onDismiss
}: ActionStackProps) {
  const [menu, setMenu] = React.useState(false);
  const ref = useClickOutside<HTMLLIElement>(
    menu,
    React.useCallback(() => setMenu(false), [])
  );

  return (
    <ul className="flex shrink-0 flex-row items-center justify-center gap-4 lg:flex-col lg:gap-3">
      <Action
        icon={
        <HeartIcon
          className={`h-4 w-4 ${liked ? 'fill-current' : ''}`}
          aria-hidden="true" />

        }
        label={liked ? 'Unlike' : 'Like'}
        pressed={liked}
        active={liked}
        count={compact(short.likes + (liked ? 1 : 0))}
        onClick={onLike} />
      
      <Action
        icon={<MessageCircleIcon className="h-4 w-4" aria-hidden="true" />}
        label="Comments"
        count={compact(short.comments)}
        onClick={onComments} />
      
      {short.rights.share ?
      <Action
        icon={<Share2Icon className="h-4 w-4" aria-hidden="true" />}
        label="Share"
        count={compact(short.shares)}
        onClick={onShare} /> :


      <li className="flex flex-col items-center gap-1">
          <span
          title="Sharing is not permitted by this Short’s licence"
          className="grid h-11 w-11 cursor-not-allowed place-items-center rounded-full border border-white/5 bg-ink-850/60 text-mist-400">
          
            <Share2Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-[10px] text-mist-400">Licence</span>
        </li>
      }
      <Action
        icon={
        <BookmarkIcon
          className={`h-4 w-4 ${saved ? 'fill-current' : ''}`}
          aria-hidden="true" />

        }
        label={saved ? 'Remove from collection' : 'Save to collection'}
        pressed={saved}
        active={saved}
        activeClass="text-brand-cyan"
        count={compact(short.saves + (saved ? 1 : 0))}
        onClick={onSave} />
      
      <Action
        icon={
        following ?
        <UserCheckIcon className="h-4 w-4" aria-hidden="true" /> :

        <UserPlusIcon className="h-4 w-4" aria-hidden="true" />

        }
        label={following ? `Unfollow ${short.creator.name}` : `Follow ${short.creator.name}`}
        pressed={following}
        active={following}
        activeClass="text-brand-indigo"
        count={following ? 'Following' : 'Follow'}
        onClick={onFollow} />
      

      <li ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          aria-expanded={menu}
          aria-label="More options"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-ink-850/90 text-white backdrop-blur-sm transition-colors duration-150 ease-entrance hover:border-white/35">
          
          <EllipsisIcon className="h-4 w-4" aria-hidden="true" />
        </button>
        {menu &&
        <ul className="absolute bottom-12 right-0 z-30 w-60 overflow-hidden rounded-xl border border-white/10 bg-ink-850 py-1 shadow-xl lg:bottom-auto lg:right-12 lg:top-0">
            {dismissOptions.map((o) =>
          <li key={o.id}>
                <button
              type="button"
              onClick={() => {
                setMenu(false);
                onDismiss(o.id);
              }}
              className="block w-full px-3 py-2 text-left text-[11px] font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:bg-ink-800">
              
                  {o.label}
                </button>
              </li>
          )}
            <li>
              <button
              type="button"
              onClick={() => {
                setMenu(false);
                onWhy();
              }}
              className="block w-full px-3 py-2 text-left text-[11px] font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:bg-ink-800">
              
                Why am I seeing this?
              </button>
            </li>
            <li>
              {short.rights.download ?
            <button
              type="button"
              onClick={() => setMenu(false)}
              className="block w-full px-3 py-2 text-left text-[11px] font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:bg-ink-800">
              
                  Download
                </button> :

            <span className="block cursor-not-allowed px-3 py-2 text-[11px] font-semibold text-mist-400">
                  Download · not permitted by licence
                </span>
            }
            </li>
            <li className="border-t border-white/5">
              <button
              type="button"
              onClick={() => {
                setMenu(false);
                onReport();
              }}
              className="block w-full px-3 py-2 text-left text-[11px] font-semibold text-live transition-colors duration-150 ease-entrance hover:bg-ink-800">
              
                Report this Short
              </button>
            </li>
          </ul>
        }
      </li>
    </ul>);

}