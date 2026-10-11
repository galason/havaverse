import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareIcon, Share2Icon, UsersIcon } from 'lucide-react';
import type { CommunitySummary } from '../../types/community';
import { useApp } from '../../contexts/AppContext';
import { copyAndReport } from '../../utils/share';
import { JoinButton } from './JoinButton';

interface CommunityCardProps {
  community: CommunitySummary;
  compact?: boolean;
}

export function CommunityCard({ community, compact = false }: CommunityCardProps) {
  const { showToast } = useApp();

  if (compact) {
    return (
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-ink-900">
        <Link to={`/community/${community.slug}`} className="relative block aspect-[4/3]">
          <img
            src={community.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-opacity duration-150 ease-entrance hover:opacity-85" />
          
          <span className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.9),transparent_60%)]" />
          <span className="absolute inset-x-2 bottom-1.5">
            <span className="block truncate text-xs font-bold text-white">{community.name}</span>
            <span className="block truncate text-[10px] text-mist-300">
              {community.anchor} · {community.members} members
            </span>
          </span>
        </Link>
        <div className="m-2">
          <JoinButton slug={community.slug} name={community.name} full />
        </div>
      </article>);

  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      <Link to={`/community/${community.slug}`} className="relative block aspect-[16/9]">
        <img
          src={community.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-opacity duration-150 ease-entrance hover:opacity-85" />
        
        <span className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.85),transparent_65%)]" />
        {community.liveNow &&
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-live px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
            Live
          </span>
        }
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-magenta">
          {community.anchorLabel}
        </p>
        <h3 className="mt-1 text-sm font-bold leading-snug text-white">
          <Link
            to={`/community/${community.slug}`}
            className="transition-colors duration-150 ease-entrance hover:text-brand-magenta">
            
            {community.name}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-center gap-3 text-[11px] text-mist-400">
          <span className="flex items-center gap-1">
            <UsersIcon className="h-3 w-3" aria-hidden="true" />
            {community.members}
          </span>
          <span className="flex items-center gap-1 text-brand-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" aria-hidden="true" />
            {community.online} online
          </span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-mist-300">{community.description}</p>

        <div className="mt-auto flex items-center gap-1.5 pt-4">
          <div className="flex-1">
            <JoinButton slug={community.slug} name={community.name} full />
          </div>
          <Link
            to={`/community/${community.slug}?tab=Discuss`}
            aria-label={`Open discussions in ${community.name}`}
            className="rounded-lg border border-white/10 p-2 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
            
            <MessageSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() =>
            copyAndReport(`/community/${community.slug}`, 'Community link', showToast)
            }
            aria-label={`Share ${community.name}`}
            className="rounded-lg border border-white/10 p-2 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
            
            <Share2Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>);

}