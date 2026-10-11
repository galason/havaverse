import React from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  BarChart3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeOffIcon,
  InfoIcon,
  MusicIcon,
  PlayIcon,
  RadioIcon,
  RefreshCwIcon,
  SparklesIcon,
  TrophyIcon } from
'lucide-react';
import type {
  DismissReason,
  FeedMode,
  RelatedGroup,
  Short,
  ShortAnalytics } from
'../types/shorts';
import { feedModes } from '../data/shorts';
import { shortsApi } from '../services/shortsApi';
import { useApp } from '../contexts/AppContext';
import { useShortPlayback } from '../hooks/useShortPlayback';
import { useExclusiveVideo } from '../hooks/useExclusiveVideo';
import { ShortStage } from '../components/shorts/ShortStage';
import { ActionStack } from '../components/shorts/ActionStack';
import { ContextRail } from '../components/shorts/ContextRail';
import { CommentsPanel } from '../components/shorts/CommentsPanel';
import {
  CreateFromSheet,
  ProvenanceSheet,
  ShortReportSheet,
  ShortShareSheet,
  ShortSupportSheet } from
'../components/shorts/Sheets';

type SheetName = 'share' | 'support' | 'report' | 'create' | 'provenance' | null;

/**
 * HavaVerse Shorts — the fastest doorway into the rest of the platform.
 * Every Short is a graph node, so every Short leads somewhere.
 */
export function Shorts() {
  const { slug } = useParams<{slug: string;}>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast, isFollowing, toggleFollow } = useApp();

  const mode = params.get('mode') as FeedMode ?? 'for-you';
  const startAt = Number(params.get('at') ?? 0);

  // Shorts take the audio — the music/podcast bars stand down.
  useExclusiveVideo();

  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [feed, setFeed] = React.useState<Short[]>([]);
  const [index, setIndex] = React.useState(0);
  const [liked, setLiked] = React.useState<Record<string, boolean>>({});
  const [saved, setSaved] = React.useState<Record<string, boolean>>({});
  const [related, setRelated] = React.useState<RelatedGroup[]>([]);
  const [relatedLoading, setRelatedLoading] = React.useState(true);
  const [comments, setComments] = React.useState(false);
  const [sheet, setSheet] = React.useState<SheetName>(null);
  const [why, setWhy] = React.useState(false);
  const [spoilerSafe, setSpoilerSafe] = React.useState(true);
  const [spoilerRevealed, setSpoilerRevealed] = React.useState(false);
  const [analytics, setAnalytics] = React.useState<ShortAnalytics | null>(null);
  const touchStart = React.useRef(0);

  /* ------------------------------------------------------------- load feed */
  const load = React.useCallback(async () => {
    setStatus('loading');
    if (slug) {
      const one = await shortsApi.getShort(slug);
      if (!one.ok) {
        setStatus('error');
        return;
      }
      const rest = await shortsApi.getFeed('for-you');
      const tail = rest.ok ? rest.data.filter((s) => s.slug !== slug) : [];
      setFeed([one.data, ...tail]);
      setIndex(0);
      setStatus('ready');
      return;
    }
    const result = await shortsApi.getFeed(mode);
    if (!result.ok) {
      setStatus('error');
      return;
    }
    setFeed(result.data);
    setIndex(0);
    setStatus('ready');
  }, [mode, slug]);

  React.useEffect(() => {
    load();
  }, [load]);

  const current = feed[index] ?? null;

  /* ------------------------------------------------------------- playback */
  const advance = React.useCallback(() => {
    setIndex((i) => i + 1 < feed.length ? i + 1 : i);
  }, [feed.length]);

  const playback = useShortPlayback(
    current?.durationSeconds ?? 30,
    Boolean(current?.rights.watch),
    advance,
    index === 0 && startAt > 0 ? startAt : 0
  );

  /* ----------------------------------------------------- per-Short effects */
  React.useEffect(() => {
    if (!current) return;
    setWhy(false);
    setSpoilerRevealed(false);
    setAnalytics(null);
    shortsApi.track('short_viewed', current.slug);
    setRelatedLoading(true);
    shortsApi.getRelated(current.slug).then((r) => {
      if (r.ok) setRelated(r.data);
      setRelatedLoading(false);
    });
  }, [current?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------------------------------------- keyboard */
  const goPrevious = React.useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = React.useCallback(
    () => setIndex((i) => Math.min(feed.length - 1, i + 1)),
    [feed.length]
  );

  const onLike = React.useCallback(async () => {
    if (!current) return;
    const result = await shortsApi.toggleLike(current.slug);
    if (!result.ok) return;
    setLiked((p) => ({ ...p, [current.slug]: result.data }));
    shortsApi.track('like_added', current.slug);
  }, [current]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          goPrevious();
          break;
        case ' ':
          e.preventDefault();
          playback.toggle();
          break;
        case 'm':
          playback.setMuted(!playback.muted);
          break;
        case 'l':
          onLike();
          break;
        case 'c':
          setComments((v) => !v);
          break;
        case 's':
          setSheet('share');
          break;
        case 'f':
          if (current) toggleFollow(current.creator.handle);
          break;
        default:
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrevious, playback, onLike, current, toggleFollow]);

  /* --------------------------------------------------------------- actions */
  async function onSave() {
    if (!current) return;
    const result = await shortsApi.toggleSave(current.slug);
    if (!result.ok) return;
    setSaved((p) => ({ ...p, [current.slug]: result.data }));
    showToast(result.data ? 'Saved to your collection' : 'Removed from your collection');
  }

  async function onDismiss(reason: DismissReason) {
    if (!current) return;
    const result = await shortsApi.notInterested(current.slug, reason);
    if (!result.ok) return;
    showToast(result.data);
    setFeed((prev) => prev.filter((s) => s.slug !== current.slug));
    setIndex((i) => Math.min(i, Math.max(0, feed.length - 2)));
  }

  async function openAnalytics() {
    if (!current) return;
    const result = await shortsApi.getAnalytics(current.slug);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setAnalytics(result.data);
  }

  function openShort(target: string) {
    const existing = feed.findIndex((s) => s.slug === target);
    if (existing >= 0) {
      setIndex(existing);
      return;
    }
    navigate(`/shorts/${target}`);
  }

  /* ---------------------------------------------------------------- states */
  if (status === 'loading') {
    return (
      <div className="flex gap-5 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="mx-auto aspect-[9/16] w-full max-w-[26rem] animate-pulse rounded-2xl bg-ink-900" />
        </div>
        <div className="hidden w-[23rem] shrink-0 space-y-3 xl:block">
          <div className="h-40 animate-pulse rounded-2xl bg-ink-900" />
          <div className="h-56 animate-pulse rounded-2xl bg-ink-900" />
        </div>
      </div>);

  }

  if (status === 'error') {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-md rounded-2xl border border-white/5 bg-ink-900 p-6 text-center">
          <h1 className="text-base font-bold text-white">We couldn’t load Shorts</h1>
          <p className="mt-1.5 text-xs text-mist-300">
            The Short may have been removed, or the connection dropped.
          </p>
          <button
            type="button"
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-ink-950">
            
            <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </button>
        </div>
      </div>);

  }

  const modeMeta = feedModes.find((m) => m.id === mode)!;

  if (!current) {
    return (
      <div className="p-4 sm:p-5">
        <ModeTabs mode={mode} onChange={(m) => setParams({ mode: m })} inFeed={!slug} />
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-white/5 bg-ink-900 p-6 text-center">
          <h1 className="text-base font-bold text-white">Nothing in {modeMeta.label} yet</h1>
          <p className="mt-1.5 text-xs leading-relaxed text-mist-300">
            {mode === 'following' ?
            'Follow a creator or a universe and their Shorts land here.' :
            'This shelf isn’t stocked for your region yet.'}
          </p>
          <button
            type="button"
            onClick={() => setParams({ mode: 'for-you' })}
            className="mt-4 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-ink-950">
            
            Back to For You
          </button>
        </div>
      </div>);

  }

  const isFollowingCreator = isFollowing(current.creator.handle);
  const spoilerHidden = Boolean(current.spoiler) && spoilerSafe && !spoilerRevealed;

  return (
    <div className="p-4 sm:p-5">
      {!slug && <ModeTabs mode={mode} onChange={(m) => setParams({ mode: m })} inFeed />}
      {slug &&
      <Link
        to="/shorts"
        className="mb-3 inline-block text-[11px] font-semibold text-mist-300 hover:text-white">
        
          ← Back to your feed
        </Link>
      }

      <div className="flex flex-col gap-5 xl:flex-row">
        {/* ------------------------------------------------------- theatre */}
        <div
          className="min-w-0 flex-1"
          onWheel={(e) => {
            if (Math.abs(e.deltaY) < 24) return;
            if (e.deltaY > 0) goNext();else
            goPrevious();
          }}
          onTouchStart={(e) => {
            touchStart.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            const delta = touchStart.current - e.changedTouches[0].clientY;
            if (Math.abs(delta) < 60) return;
            if (delta > 0) goNext();else
            goPrevious();
          }}>
          
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center">
            <div className="w-full max-w-[26rem]">
              <ShortStage
                short={current}
                playback={playback}
                liked={Boolean(liked[current.slug])}
                onLike={onLike}
                onPrevious={goPrevious}
                onNext={goNext}
                hasPrevious={index > 0}
                hasNext={index < feed.length - 1}
                onProvenance={() => setSheet('provenance')} />
              

              {/* vertical nav for touch / narrow */}
              <div className="mt-2 flex items-center justify-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={goPrevious}
                  disabled={index === 0}
                  aria-label="Previous Short"
                  className="rounded-full border border-white/10 p-2 text-white disabled:opacity-30">
                  
                  <ChevronUpIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="text-[10px] text-mist-400">
                  {index + 1} of {feed.length}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={index === feed.length - 1}
                  aria-label="Next Short"
                  className="rounded-full border border-white/10 p-2 text-white disabled:opacity-30">
                  
                  <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <ActionStack
              short={current}
              liked={Boolean(liked[current.slug])}
              saved={Boolean(saved[current.slug])}
              following={isFollowingCreator}
              onLike={onLike}
              onSave={onSave}
              onFollow={() => {
                toggleFollow(current.creator.handle);
                showToast(
                  isFollowingCreator ?
                  `Unfollowed ${current.creator.name}` :
                  `Following ${current.creator.name}`
                );
              }}
              onComments={() => setComments((v) => !v)}
              onShare={() => setSheet('share')}
              onReport={() => setSheet('report')}
              onWhy={() => setWhy(true)}
              onDismiss={onDismiss} />
            

            {comments &&
            <CommentsPanel
              slug={current.slug}
              total={current.comments}
              currentTime={playback.elapsed}
              spoilerSafe={spoilerSafe}
              onSeek={playback.seek}
              onClose={() => setComments(false)} />

            }
          </div>

          {/* --------------------------------------------------- identity */}
          <div className="mx-auto mt-4 max-w-2xl space-y-3">
            <div className="flex items-center gap-2.5">
              <Link to={current.creator.to} className="shrink-0">
                <img
                  src={current.creator.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover" />
                
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={current.creator.to}
                  className="block truncate text-sm font-bold text-white hover:underline">
                  
                  {current.creator.name}
                </Link>
                <p className="truncate text-[11px] text-mist-400">
                  {current.creator.followers} · {current.publishedAgo} · {current.views}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSheet('support')}
                className="shrink-0 rounded-full border border-white/15 px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:border-brand-amber/60">
                
                Support
              </button>
            </div>

            <div>
              <h1 className="text-base font-bold text-white">{current.caption}</h1>
              {spoilerHidden ?
              <div className="mt-1.5 rounded-xl border border-brand-amber/25 bg-brand-amber/5 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-amber">
                    <EyeOffIcon className="h-3 w-3" aria-hidden="true" />
                    Description hidden — {current.spoiler!.note}
                  </p>
                  <button
                  type="button"
                  onClick={() => setSpoilerRevealed(true)}
                  className="mt-1.5 text-[11px] font-bold text-white underline">
                  
                    Show it anyway
                  </button>
                </div> :

              <p className="mt-1 text-xs leading-relaxed text-mist-300">{current.story}</p>
              }
              <p className="mt-1.5 flex flex-wrap gap-1.5">
                {current.hashtags.map((h) =>
                <Link
                  key={h}
                  to={`/search?q=${encodeURIComponent(h.replace('#', ''))}`}
                  className="text-[11px] font-semibold text-brand-cyan hover:underline">
                  
                    {h}
                  </Link>
                )}
              </p>
            </div>

            {why &&
            <p className="rounded-xl border border-white/5 bg-ink-900 p-3 text-[11px] leading-relaxed text-mist-300">
                <span className="block font-semibold text-mist-100">
                  {current.reason.short}
                </span>
                {current.reason.detail}
              </p>
            }

            {/* spoiler control */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-mist-400">Spoilers:</span>
              {(
              [
              { id: true, label: 'Safe for me' },
              { id: false, label: 'Show everything' }] as
              const).
              map((o) =>
              <button
                key={String(o.id)}
                type="button"
                onClick={() => setSpoilerSafe(o.id)}
                aria-pressed={spoilerSafe === o.id}
                className={`rounded-full px-2.5 py-1 font-semibold transition-colors duration-150 ease-entrance ${
                spoilerSafe === o.id ?
                'bg-white text-ink-950' :
                'border border-white/10 text-mist-300 hover:text-white'}`
                }>
                
                  {o.label}
                </button>
              )}
            </div>

            {/* music */}
            {current.music &&
            <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-ink-900 p-2.5">
                <img
                src={current.music.artwork}
                alt=""
                className="h-10 w-10 rounded-lg object-cover" />
              
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-white">
                    <MusicIcon className="h-3 w-3 text-brand-cyan" aria-hidden="true" />
                    {current.music.title}
                  </p>
                  <p className="truncate text-[11px] text-mist-400">{current.music.artist}</p>
                </div>
                <Link
                to={current.music.to}
                className="shrink-0 rounded-full bg-brand-cyan/20 px-3 py-1.5 text-[11px] font-bold text-brand-cyan">
                
                  Play track
                </Link>
              </div>
            }

            {/* sports */}
            {current.sports &&
            <div className="rounded-xl border border-live/25 bg-live/5 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-live">
                  <RadioIcon className="h-3 w-3" aria-hidden="true" />
                  {current.sports.competition} · {current.sports.moment}
                </p>
                <p className="mt-1 font-display text-2xl tracking-wide text-white">
                  {current.sports.score}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                  to={current.sports.matchTo}
                  className="rounded-full bg-live px-4 py-1.5 text-[11px] font-bold text-white">
                  
                    Watch the match
                  </Link>
                  <Link
                  to={current.sports.highlightsTo}
                  className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-semibold text-white">
                  
                    More highlights
                  </Link>
                </div>
              </div>
            }

            {/* primary + create */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setSheet('create')}
                className="flex flex-1 items-center gap-2.5 rounded-xl border border-brand-violet/30 bg-ink-900 p-3 text-left transition-colors duration-150 ease-entrance hover:border-brand-violet/60">
                
                <SparklesIcon
                  className="h-4 w-4 shrink-0 text-brand-violet"
                  aria-hidden="true" />
                
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-white">Create from this</span>
                  <span className="block truncate text-[11px] text-mist-400">
                    Make something like this with HavaVerse AI
                  </span>
                </span>
              </button>

              {current.primaryCta &&
              <Link
                to={current.primaryCta.to}
                className="flex flex-1 items-center gap-2.5 rounded-xl bg-white p-3 text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
                
                  <PlayIcon className="h-4 w-4 shrink-0 fill-current" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold">{current.primaryCta.label}</span>
                    <span className="block truncate text-[11px] opacity-70">
                      {current.primaryCta.sub}
                    </span>
                  </span>
                </Link>
              }
            </div>

            {/* graph chips */}
            <ul className="flex flex-wrap gap-1.5">
              {current.graph.map((node) =>
              <li key={node.id}>
                  <Link
                  to={node.to}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:border-brand-indigo/60 hover:text-white">
                  
                    {node.label}
                  </Link>
                </li>
              )}
            </ul>

            {/* owner mode */}
            {current.ownedByViewer &&
            <div className="rounded-xl border border-brand-cyan/25 bg-ink-900 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <BarChart3Icon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
                  <p className="text-xs font-bold text-white">You published this Short</p>
                  <button
                  type="button"
                  onClick={openAnalytics}
                  className="ml-auto rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white">
                  
                    {analytics ? 'Refresh analytics' : 'View analytics'}
                  </button>
                  <Link
                  to="/studio"
                  className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-ink-950">
                  
                    Manage in Studio
                  </Link>
                </div>
                {analytics &&
              <>
                    <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {[
                  ['Views', analytics.views],
                  ['Unique', analytics.uniqueViewers],
                  ['Completion', analytics.completionRate],
                  ['Avg watch', analytics.averageWatch],
                  ['Followers', analytics.followersGained]].
                  map(([label, value]) =>
                  <div key={label} className="rounded-lg bg-ink-850 p-2">
                          <dt className="text-[10px] text-mist-400">{label}</dt>
                          <dd className="text-xs font-bold text-white">{value}</dd>
                        </div>
                  )}
                    </dl>
                    <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-mist-300">
                      <SparklesIcon
                    className="mt-0.5 h-3 w-3 shrink-0 text-brand-violet"
                    aria-hidden="true" />
                  
                      {analytics.retentionNote}
                    </p>
                  </>
              }
              </div>
            }

            {/* rights */}
            <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-mist-400">
              <InfoIcon className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              {current.rights.maturity} · {current.language} · Licensed in{' '}
              {current.rights.availableRegions.join(', ')}. Remix{' '}
              {current.rights.remix ? 'permitted' : 'not permitted'}, download{' '}
              {current.rights.download ? 'permitted' : 'not permitted'} — set by the creator,
              enforced server-side.
            </p>
          </div>
        </div>

        {/* ----------------------------------------------------------- rail */}
        <ContextRail
          short={current}
          related={related}
          relatedLoading={relatedLoading}
          following={isFollowingCreator}
          onFollow={() => {
            toggleFollow(current.creator.handle);
            showToast(
              isFollowingCreator ?
              `Unfollowed ${current.creator.name}` :
              `Following ${current.creator.name}`
            );
          }}
          onSupport={() => setSheet('support')}
          onOpenShort={openShort} />
        
      </div>

      {sheet === 'share' &&
      <ShortShareSheet
        short={current}
        currentTime={playback.elapsed}
        onClose={() => setSheet(null)}
        onDone={showToast} />

      }
      {sheet === 'support' &&
      <ShortSupportSheet
        short={current}
        onClose={() => setSheet(null)}
        onDone={showToast} />

      }
      {sheet === 'report' &&
      <ShortReportSheet short={current} onClose={() => setSheet(null)} onDone={showToast} />
      }
      {sheet === 'create' &&
      <CreateFromSheet short={current} onClose={() => setSheet(null)} />
      }
      {sheet === 'provenance' &&
      <ProvenanceSheet short={current} onClose={() => setSheet(null)} />
      }
    </div>);

}

function ModeTabs({
  mode,
  onChange,
  inFeed




}: {mode: FeedMode;onChange: (m: FeedMode) => void;inFeed: boolean;}) {
  if (!inFeed) return null;
  const meta = feedModes.find((m) => m.id === mode)!;
  return (
    <div className="mb-4">
      <ul className="flex gap-1.5 overflow-x-auto pb-1">
        {feedModes.map((m) =>
        <li key={m.id}>
            <button
            type="button"
            onClick={() => onChange(m.id)}
            aria-pressed={mode === m.id}
            className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-colors duration-150 ease-entrance ${
            mode === m.id ?
            'bg-brand-indigo text-white' :
            'border border-white/10 text-mist-300 hover:border-white/35 hover:text-white'}`
            }>
            
              {m.label}
            </button>
          </li>
        )}
      </ul>
      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-mist-400">
        <TrophyIcon className="h-3 w-3" aria-hidden="true" />
        {meta.blurb}
      </p>
    </div>);

}