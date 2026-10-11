import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  InfoIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  Share2Icon } from
'lucide-react';
import type { HeroSlide } from '../../types/home';
import { useApp } from '../../contexts/AppContext';
import { bySlug } from '../../data/catalog';
import { AvailabilityChip } from './AvailabilityChip';

interface HeroCarouselProps {
  slides: HeroSlide[];
  onTrack: (event: string, payload?: Record<string, unknown>) => void;
}

const ADVANCE_MS = 9000;

export function HeroCarousel({ slides, onTrack }: HeroCarouselProps) {
  const { isSaved, toggleWatchlist, isFollowing, toggleFollow, showToast } = useApp();
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const slide = slides[index];

  // Autoplay advances the carousel only — it never reloads the page beneath it.
  React.useEffect(() => {
    if (!playing || slides.length < 2) return;
    const timer = window.setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      ADVANCE_MS
    );
    return () => window.clearTimeout(timer);
  }, [playing, index, slides.length]);

  React.useEffect(() => {
    onTrack('hero_viewed', { slide: slide?.id });
  }, [slide?.id, onTrack]);

  if (!slide) return null;

  const go = (next: number) => {
    setIndex((next + slides.length) % slides.length);
    setPlaying(false);
  };

  // The watchlist is keyed by title id, so resolve the slide's slug through the catalogue.
  const titleId = slide.slug ? bySlug(slide.slug)?.id : undefined;
  const saved = titleId ? isSaved(titleId) : false;
  const following = slide.creatorHandle ? isFollowing(slide.creatorHandle) : false;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured on HavaVerse"
      className="relative isolate overflow-hidden rounded-2xl border border-white/5"
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') go(index + 1);
        if (event.key === 'ArrowLeft') go(index - 1);
      }}
      tabIndex={0}>
      
      <div className="relative min-h-[22rem] sm:min-h-[26rem] lg:min-h-[30rem]">
        <img
          key={slide.id}
          src={slide.backdrop}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top" />
        
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />

        <div className="relative flex min-h-[22rem] flex-col justify-end gap-3 p-5 sm:min-h-[26rem] sm:p-7 lg:min-h-[30rem]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-brand-violet/40 bg-brand-violet/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mist-100">
              {slide.eyebrow}
            </span>
            <AvailabilityChip availability={slide.availability} />
          </div>

          <h1 className="max-w-2xl font-display text-4xl leading-[0.95] tracking-wide text-white sm:text-5xl lg:text-6xl">
            {slide.name}
          </h1>

          <ul className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-mist-200">
            {slide.meta.map((bit) =>
            <li key={bit} className="after:ml-2.5 after:text-mist-400 after:content-['·'] last:after:content-['']">
                {bit}
              </li>
            )}
          </ul>

          <p className="max-w-xl text-sm leading-relaxed text-mist-200">{slide.logline}</p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Link
              to={slide.cta.to}
              onClick={() => onTrack('hero_clicked', { slide: slide.id })}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
              
              <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
              {slide.cta.label}
            </Link>

            {slide.secondary &&
            <Link
              to={slide.secondary.to}
              className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:border-white/45">
              
                <InfoIcon className="h-4 w-4" aria-hidden="true" />
                {slide.secondary.label}
              </Link>
            }

            {titleId &&
            <button
              type="button"
              onClick={() => {
                toggleWatchlist(titleId);
                showToast(saved ? 'Removed from your list' : 'Added to your list');
                onTrack(saved ? 'watchlist_removed' : 'watchlist_added', { slug: slide.slug });
              }}
              aria-pressed={saved}
              className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:border-white/45">
              
                {saved ?
              <CheckIcon className="h-4 w-4" aria-hidden="true" /> :

              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              }
                {saved ? 'In my list' : 'My list'}
              </button>
            }

            {slide.creatorHandle &&
            <button
              type="button"
              onClick={() => {
                toggleFollow(slide.creatorHandle!);
                showToast(
                  following ?
                  `Unfollowed ${slide.creator}` :
                  `Following ${slide.creator}`
                );
                onTrack('creator_followed', { handle: slide.creatorHandle });
              }}
              aria-pressed={following}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition-colors duration-150 ease-entrance hover:border-white/45"
              aria-label={following ? `Unfollow ${slide.creator}` : `Follow ${slide.creator}`}>
              
                <HeartIcon
                className={`h-4 w-4 ${following ? 'fill-live text-live' : ''}`}
                aria-hidden="true" />
              
              </button>
            }

            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(
                  `${window.location.origin}/title/${slide.slug ?? ''}`
                );
                showToast('Link copied');
                onTrack('share_created', { slug: slide.slug });
              }}
              aria-label="Copy a link to this title"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition-colors duration-150 ease-entrance hover:border-white/45">
              
              <Share2Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {slide.creator &&
          <p className="text-[11px] text-mist-400">
              Created by{' '}
              <Link
              to={`/creator/${(slide.creatorHandle ?? '').replace('@', '')}`}
              className="font-semibold text-mist-200 underline-offset-2 hover:underline">
              
                {slide.creator}
              </Link>
            </p>
          }
        </div>

        {slides.length > 1 &&
        <>
            <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous featured item"
            className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-950/60 text-white backdrop-blur transition-colors duration-150 ease-entrance hover:border-white/40">
            
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next featured item"
            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-950/60 text-white backdrop-blur transition-colors duration-150 ease-entrance hover:border-white/40">
            
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="absolute bottom-3 right-4 flex items-center gap-2">
              <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause autoplay' : 'Resume autoplay'}
              className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-ink-950/60 text-white backdrop-blur">
              
                {playing ?
              <PauseIcon className="h-3 w-3 fill-current" aria-hidden="true" /> :

              <PlayIcon className="h-3 w-3 fill-current" aria-hidden="true" />
              }
              </button>
              <ul className="flex items-center gap-1.5">
                {slides.map((s, i) =>
              <li key={s.id}>
                    <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show ${s.name}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all duration-200 ease-entrance ${
                  i === index ? 'w-7 bg-white' : 'w-3 bg-white/35 hover:bg-white/60'}`
                  } />
                
                  </li>
              )}
              </ul>
            </div>
          </>
        }
      </div>
    </section>);

}