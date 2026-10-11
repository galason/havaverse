import React from 'react';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  CheckIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
  Share2Icon,
  SparklesIcon,
  StarIcon,
  ThumbsDownIcon,
  ThumbsUpIcon } from
'lucide-react';
import type { ContentTitle } from '../../types/content';
import type { DownloadRecord, TitleCta, TitleExperience } from '../../types/title';
import { useApp } from '../../contexts/AppContext';

interface TitleHeroProps {
  title: ContentTitle;
  experience: TitleExperience;
  cta: TitleCta;
  liked: 'up' | 'down' | null;
  onLike: (value: 'up' | 'down') => void;
  notified: boolean;
  onNotify: () => void;
  onShare: () => void;
  onDownload: () => void;
  onMore: () => void;
  onTrailer: () => void;
  download: DownloadRecord | null;
}

const ctaIcon: Record<string, typeof PlayIcon> = {
  again: RotateCcwIcon,
  notify: BellIcon,
  blocked: BellIcon
};

/**
 * The hero states what the work IS and what this viewer's next move is.
 * The primary button is resolved from release state and real playback, so it
 * is never simply "Play" out of habit.
 */
export function TitleHero({
  title,
  experience,
  cta,
  liked,
  onLike,
  notified,
  onNotify,
  onShare,
  onDownload,
  onMore,
  onTrailer,
  download
}: TitleHeroProps) {
  const { isSaved, toggleWatchlist, isFollowing, toggleFollow } = useApp();
  const saved = isSaved(title.id);
  const following = isFollowing(title.creatorHandle);
  const Icon = ctaIcon[cta.mode] ?? PlayIcon;
  const isNav = Boolean(cta.to);
  const live = cta.mode === 'live';

  const downloadLabel =
  download?.state === 'downloaded' ?
  'Available offline' :
  download?.state === 'downloading' ?
  `Downloading ${download.progress}%` :
  download?.state === 'preparing' ?
  'Preparing…' :
  'Download';

  return (
    <header className="relative isolate min-h-[34rem] overflow-hidden lg:min-h-[38rem]">
      <img
        src={title.backdrop ?? title.poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-top" />
      
      {/* Cinematic falloff: the artwork should still read at the edges. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-ink-950/50" />

      <button
        type="button"
        onClick={onTrailer}
        className="absolute bottom-5 right-5 hidden items-center gap-2 rounded-full border border-white/20 bg-ink-950/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition-colors duration-150 ease-entrance hover:border-white/40 sm:flex">
        
        <PlayIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Trailer
      </button>

      <div className="relative flex min-h-[34rem] flex-col justify-end px-4 pb-6 pt-24 sm:px-6 lg:min-h-[38rem]">
        <div className="max-w-3xl">
          {title.badge &&
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-cyan">
              <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {title.badge}
            </p>
          }

          <h1 className="mt-2 font-display text-4xl uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {title.name}
          </h1>

          <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-mist-200">
            <li className="flex items-center gap-1.5 font-semibold text-white">
              <StarIcon className="h-3.5 w-3.5 fill-brand-amber text-brand-amber" aria-hidden="true" />
              {title.rating.toFixed(1)}/10
            </li>
            <li>{title.year}</li>
            <li>{title.genre}</li>
            <li>{title.runtime}</li>
            <li className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
              {title.maturity}
            </li>
            {experience.formats.map((f) =>
            <li
              key={f}
              className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-mist-200">
              
                {f}
              </li>
            )}
          </ul>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-200">{title.logline}</p>

          {/* Primary action system */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {isNav ?
            <Link
              to={cta.to!}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors duration-150 ease-entrance ${
              live ?
              'bg-live text-white hover:bg-live/90' :
              'bg-white text-ink-950 hover:bg-mist-100'}`
              }>
              
                {live ?
              <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" /> :

              <Icon className="h-4 w-4 fill-current" aria-hidden="true" />
              }
                {cta.label}
              </Link> :

            <button
              type="button"
              onClick={onNotify}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors duration-150 ease-entrance ${
              notified ?
              'border border-white/20 text-white' :
              'bg-white text-ink-950 hover:bg-mist-100'}`
              }>
              
                {notified ?
              <CheckIcon className="h-4 w-4" aria-hidden="true" /> :

              <BellIcon className="h-4 w-4" aria-hidden="true" />
              }
                {notified ? 'We’ll tell you' : cta.label}
              </button>
            }

            <button
              type="button"
              onClick={() => toggleWatchlist(title.id)}
              aria-pressed={saved}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-ink-900/70 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors duration-150 ease-entrance hover:border-white/40">
              
              {saved ?
              <CheckIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" /> :

              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              }
              {saved ? 'In my list' : 'My list'}
            </button>

            <div className="flex items-center gap-1 rounded-full border border-white/20 bg-ink-900/70 p-1 backdrop-blur">
              <button
                type="button"
                onClick={() => onLike('up')}
                aria-label="Like"
                aria-pressed={liked === 'up'}
                className={`grid h-9 w-9 place-items-center rounded-full transition-colors duration-150 ease-entrance ${
                liked === 'up' ? 'bg-brand-indigo text-white' : 'text-mist-200 hover:text-white'}`
                }>
                
                <ThumbsUpIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onLike('down')}
                aria-label="Not for me"
                aria-pressed={liked === 'down'}
                className={`grid h-9 w-9 place-items-center rounded-full transition-colors duration-150 ease-entrance ${
                liked === 'down' ? 'bg-ink-600 text-white' : 'text-mist-200 hover:text-white'}`
                }>
                
                <ThumbsDownIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={onShare}
              aria-label="Share"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-ink-900/70 text-white backdrop-blur transition-colors duration-150 ease-entrance hover:border-white/40">
              
              <Share2Icon className="h-4 w-4" aria-hidden="true" />
            </button>

            {experience.downloadable &&
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-ink-900/70 px-4 py-3 text-xs font-semibold text-white backdrop-blur transition-colors duration-150 ease-entrance hover:border-white/40">
              
                {download?.state === 'downloaded' ?
              <CheckIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" /> :

              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              }
                <span className="hidden sm:inline">{downloadLabel}</span>
              </button>
            }

            <button
              type="button"
              onClick={onMore}
              aria-label="More options"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-ink-900/70 text-white backdrop-blur transition-colors duration-150 ease-entrance hover:border-white/40">
              
              <MoreHorizontalIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {cta.note && <p className="mt-2.5 text-xs text-mist-300">{cta.note}</p>}

          {/* Provenance and authorship sit with the title, not in a footnote. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            {title.aiAssisted &&
            <Link
              to={`/title/${title.slug}#rights`}
              className="flex items-center gap-2 rounded-full border border-brand-indigo/40 bg-brand-indigo/10 px-3 py-1.5 text-[11px] font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:border-brand-indigo">
              
                <SparklesIcon className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />
                Made with HavaVerse AI
              </Link>
            }
            <div className="flex items-center gap-2.5">
              <img
                src={experience.creator.avatar}
                alt=""
                className="h-8 w-8 rounded-full object-cover" />
              
              <Link
                to={`/creator/${title.creatorHandle.replace('@', '')}`}
                className="text-xs font-semibold text-white hover:text-brand-cyan">
                
                {title.kind === 'Series' ? 'A series' : 'A film'} by {title.creator}
              </Link>
              <button
                type="button"
                onClick={() => toggleFollow(title.creatorHandle)}
                aria-pressed={following}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
                following ?
                'border border-white/20 text-mist-200 hover:text-white' :
                'bg-brand-indigo text-white hover:bg-brand-violet'}`
                }>
                
                {following ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>);

}