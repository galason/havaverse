import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, SparklesIcon } from 'lucide-react';
import { titles } from '../data/catalog';
import { titleBySlug as bySlug } from '../services/releaseRegistry';
import type { WatchAsset } from '../types/watch';
import { watchApi } from '../services/watchApi';
import { usePlayback, formatTime } from '../hooks/usePlayback';
import { useExclusiveVideo } from '../hooks/useExclusiveVideo';
import { useApp } from '../contexts/AppContext';
import { VideoStage } from '../components/watch/VideoStage';
import { ActionBar } from '../components/watch/ActionBar';
import { ChaptersList } from '../components/watch/ChaptersList';
import { CommunityPanel } from '../components/watch/CommunityPanel';
import { UniverseExplorer } from '../components/watch/UniverseExplorer';
import { HavaAiPanel } from '../components/watch/HavaAiPanel';
import { EntitlementGate } from '../components/watch/EntitlementGate';
import { SupportSheet } from '../components/watch/SupportSheet';
import { ShareSheet } from '../components/watch/ShareSheet';
import { ReportSheet } from '../components/watch/ReportSheet';
import { WatchPartySheet } from '../components/watch/WatchPartySheet';
import { AutoplayCard, DiscoveryRail } from '../components/watch/UpNext';
import { ErrorBlock } from '../components/community/StateBlocks';

type Tab = 'overview' | 'chapters' | 'community' | 'world' | 'related';
type SheetName = 'support' | 'share' | 'report' | 'party' | null;

export function Player() {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const { isSaved, toggleWatchlist, isFollowing, toggleFollow, showToast } = useApp();

  const title = bySlug(slug);
  const [asset, setAsset] = React.useState<WatchAsset | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [tab, setTab] = React.useState<Tab>('overview');
  const [sheet, setSheet] = React.useState<SheetName>(null);
  const [aiOpen, setAiOpen] = React.useState(false);
  // Shared with the title page's thumbs up — one reaction per title, owned by the watch service.
  const [liked, setLiked] = React.useState(() => watchApi.getReaction(slug) === 'up');
  React.useEffect(() => setLiked(watchApi.getReaction(slug) === 'up'), [slug]);
  const [miniPlayer, setMiniPlayer] = React.useState(false);
  const [unlocking, setUnlocking] = React.useState(false);
  const [partyId, setPartyId] = React.useState<string | null>(null);
  const [autoplayCancelled, setAutoplayCancelled] = React.useState(false);
  const [resumePrompt, setResumePrompt] = React.useState<number | null>(null);
  const [startAt, setStartAt] = React.useState(0);
  const [settings, setSettings] = React.useState({
    quality: 'auto',
    audio: '',
    subtitle: 'off',
    autoplay: true
  });

  const communityRef = React.useRef<HTMLDivElement>(null);

  // Opening the cinema silences the music/podcast bars.
  useExclusiveVideo();

  /* ------------------------------------------------------------------ load */

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await watchApi.getAsset(slug);
    if (!result.ok) {
      setStatus('error');
      return;
    }
    setAsset(result.data);
    setSettings((s) => ({ ...s, audio: result.data.audio[0]?.id ?? '' }));
    setStatus('ready');
    watchApi.track('content_view', slug);

    // Deep link wins; otherwise offer to resume where this account stopped.
    const deep = Number(params.get('t'));
    if (deep > 0) {
      setStartAt(deep);
      setResumePrompt(null);
      return;
    }
    const resume = watchApi.getResume(slug);
    if (resume && resume.positionSeconds > 30) setResumePrompt(resume.positionSeconds);else
    setStartAt(0);
  }, [slug, params]);

  React.useEffect(() => {
    load();
  }, [load]);

  const playback = usePlayback(asset, startAt);

  /* ------------------------------------------------------------- guard rails */

  if (!title) {
    return (
      <div className="p-5">
        <ErrorBlock message="That title is not in the catalogue." />
      </div>);

  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorBlock message="This title could not be loaded. Check your connection." onRetry={load} />
      </div>);

  }

  if (status === 'loading' || !asset) {
    return (
      <div className="p-4 sm:p-5">
        <div className="aspect-video w-full animate-pulse rounded-2xl bg-ink-850" />
        <div className="mt-4 h-7 w-64 animate-pulse rounded-lg bg-ink-850" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded-lg bg-ink-850" />
        <div className="mt-4 flex gap-2">
          {[0, 1, 2, 3].map((i) =>
          <div key={i} className="h-10 w-28 animate-pulse rounded-full bg-ink-850" />
          )}
        </div>
      </div>);

  }

  const blocked = asset.entitlement.state !== 'available';
  const saved = isSaved(title.id);
  const following = isFollowing(title.creatorHandle);
  const fromCreator = titles.filter((t) => t.creator === title.creator && t.id !== title.id);
  const sameGenre = titles.filter((t) => t.genre === title.genre && t.id !== title.id);
  const next =
  fromCreator[0] ?? sameGenre[0] ?? titles.find((t) => t.id !== title.id) ?? titles[0];

  /* ---------------------------------------------------------------- actions */

  async function unlockTitle() {
    setUnlocking(true);
    const result = await watchApi.unlock(slug);
    setUnlocking(false);
    if (result.ok) {
      showToast('Unlocked — enjoy the film');
      load();
    }
  }

  function seekTo(seconds: number) {
    playback.seek(seconds);
    if (playback.status !== 'playing') playback.play();
  }

  const tabs: {id: Tab;label: string;}[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'chapters', label: 'Chapters' },
  { id: 'community', label: 'Community' },
  ...(asset.graph.length > 0 ? [{ id: 'world', label: 'World' }] as const : []),
  { id: 'related', label: 'Related' }];


  return (
    <div className="pb-14">
      {/* -------------------------------------------------------- the stage */}
      <div className="relative p-3 sm:p-5">
        {blocked ?
        <EntitlementGate
          title={title}
          entitlement={asset.entitlement}
          currencySymbol={asset.economy.currencySymbol}
          unlocking={unlocking}
          onUnlock={unlockTitle}
          alternatives={titles.filter((t) => t.id !== title.id)} /> :


        <div className="relative">
            <VideoStage
            asset={asset}
            titleName={title.name}
            status={playback.status}
            currentTime={playback.currentTime}
            duration={playback.duration}
            buffered={playback.buffered}
            rate={playback.rate}
            volume={playback.volume}
            muted={playback.muted}
            settings={settings}
            miniPlayer={miniPlayer}
            onToggle={playback.toggle}
            onSeek={playback.seek}
            onSkip={playback.skip}
            onRate={playback.setRate}
            onVolume={playback.setVolume}
            onMuted={playback.setMuted}
            onMiniPlayer={setMiniPlayer}
            onSettings={(next) => {
              setSettings((s) => ({ ...s, ...next }));
              if (next.quality) watchApi.track('quality_changed', slug, next.quality);
              if (next.subtitle) watchApi.track('subtitle_changed', slug, next.subtitle);
              if (next.audio) watchApi.track('audio_changed', slug, next.audio);
            }}
            onAskAi={() => {
              setAiOpen(true);
              watchApi.track('ai_opened', slug);
            }}
            onWatchParty={() => setSheet('party')}
            partyActive={Boolean(partyId)} />
          

            {playback.status === 'ended' && !miniPlayer &&
          <AutoplayCard
            next={next}
            enabled={settings.autoplay && !autoplayCancelled}
            onCancel={() => setAutoplayCancelled(true)} />

          }

            {resumePrompt !== null &&
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-ink-950/95 p-3 backdrop-blur-md sm:inset-x-5 sm:bottom-5">
                <p className="text-xs text-mist-200">
                  Continue from{' '}
                  <span className="font-semibold text-white">{formatTime(resumePrompt)}</span>?
                </p>
                <div className="ml-auto flex gap-2">
                  <button
                type="button"
                onClick={() => {
                  setStartAt(resumePrompt);
                  setResumePrompt(null);
                  playback.play();
                }}
                className="rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
                
                    Continue
                  </button>
                  <button
                type="button"
                onClick={() => {
                  watchApi.clearResume(slug);
                  setStartAt(0);
                  setResumePrompt(null);
                }}
                className="rounded-full border border-white/20 px-4 py-1.5 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
                
                    Start from the beginning
                  </button>
                </div>
              </div>
          }
          </div>
        }
      </div>

      {/* ----------------------------------------------------------- identity */}
      <div className="grid gap-5 px-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <header>
            {title.badge &&
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-cyan">
                <SparklesIcon className="h-3 w-3" aria-hidden="true" />
                {title.badge}
              </p>
            }
            <div className="mt-1 flex flex-wrap items-start gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {title.name}
                </h1>
                <p className="mt-1 text-xs text-mist-400">
                  {title.creator} · {title.year} · {title.maturity} · {title.genre} ·{' '}
                  {title.runtime} · {title.languages.join(', ')}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2.5">
                <Link
                  to={`/creator/${title.creatorHandle}`}
                  className="flex items-center gap-2.5">
                  
                  <img
                    src={asset.cast[0]?.portrait}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover" />
                  
                  <span className="hidden sm:block">
                    <span className="block text-xs font-semibold text-white">{title.creator}</span>
                    <span className="block text-[11px] text-mist-400">
                      {asset.followers} followers
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    toggleFollow(title.creatorHandle);
                    if (!following) watchApi.track('creator_followed', slug);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance ${
                  following ?
                  'border border-white/15 text-mist-200 hover:text-white' :
                  'bg-white text-ink-950 hover:bg-mist-100'}`
                  }>
                  
                  {following ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-200">{title.logline}</p>
          </header>

          <div className="mt-4">
            <ActionBar
              liked={liked}
              likes={asset.likes}
              saved={saved}
              economy={asset.economy}
              onLike={() => {
                const next = watchApi.setReaction(slug, liked ? null : 'up');
                setLiked(next === 'up');
                if (next === 'up') watchApi.track('like_added', slug);
                showToast(next === 'up' ? 'Liked · kept in your Library' : 'Removed your like');
              }}
              onSave={() => {
                toggleWatchlist(title.id);
                watchApi.track(saved ? 'watchlist_removed' : 'watchlist_added', slug);
              }}
              onShare={() => setSheet('share')}
              onParty={() => setSheet('party')}
              onDiscuss={() => {
                setTab('community');
                communityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              onSupport={() => setSheet('support')}
              onReport={() => setSheet('report')}
              onNotInterested={() => showToast('Noted — fewer titles like this')}
              onDownload={() =>
              showToast('Downloads need the offline licence service, which is not connected yet')
              } />
            
          </div>

          {/* ---------------------------------------------------------- tabs */}
          <div
            role="tablist"
            aria-label="Content experience"
            className="mt-5 flex gap-1 overflow-x-auto border-b border-white/5 pb-px">
            
            {tabs.map((item) =>
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance ${
              tab === item.id ?
              'border-brand-indigo text-white' :
              'border-transparent text-mist-400 hover:text-white'}`
              }>
              
                {item.label}
              </button>
            )}
          </div>

          <div ref={communityRef} className="mt-4 space-y-5">
            {tab === 'overview' &&
            <>
                <section className="rounded-2xl border border-white/5 bg-ink-900 p-4 sm:p-5">
                  <h2 className="text-base font-bold tracking-tight text-white">About this film</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-200">
                    {title.logline}
                  </p>
                  <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    {[
                  ['Creator', title.creator],
                  ['Language', title.languages.join(', ')],
                  ['Audio', asset.audio.map((a) => a.label).join(', ')],
                  ['Subtitles', asset.subtitles.map((s) => s.label).join(', ')]].
                  map(([label, value]) =>
                  <div key={label}>
                        <dt className="text-[10px] uppercase tracking-wide text-mist-400">
                          {label}
                        </dt>
                        <dd className="text-xs text-mist-200">{value}</dd>
                      </div>
                  )}
                  </dl>
                  {title.aiAssisted &&
                <p className="mt-4 rounded-xl border border-white/10 p-3 text-[11px] leading-relaxed text-mist-400">
                      Parts of this title were produced with HavaVerse AI. Generated sequences are
                      labelled in the content credits, as they are platform-wide.
                    </p>
                }
                </section>
                {asset.graph.length > 0 && <UniverseExplorer nodes={asset.graph} />}
              </>
            }

            {tab === 'chapters' &&
            <ChaptersList
              chapters={asset.chapters}
              currentTime={playback.currentTime}
              onSeek={seekTo} />

            }

            {tab === 'community' &&
            <CommunityPanel
              slug={slug}
              discussionCount={asset.discussionCount}
              currentTime={playback.currentTime}
              onSeek={seekTo}
              onToast={showToast} />

            }

            {tab === 'world' && <UniverseExplorer nodes={asset.graph} />}

            {tab === 'related' &&
            <div className="space-y-6">
                <DiscoveryRail
                heading={`Because you watched ${title.name}`}
                note="Matched on tone and creator, not popularity"
                titles={sameGenre.slice(0, 4)}
                slug={slug} />
              
                <DiscoveryRail
                heading={`More from ${title.creator}`}
                titles={fromCreator}
                slug={slug} />
              
              </div>
            }
          </div>
        </div>

        {/* --------------------------------------------------------- side rail */}
        <aside className="space-y-4">
          {aiOpen ?
          <HavaAiPanel
            asset={asset}
            titleName={title.name}
            onClose={() => setAiOpen(false)}
            onSeek={seekTo} /> :


          <button
            type="button"
            onClick={() => {
              setAiOpen(true);
              watchApi.track('ai_opened', slug);
            }}
            className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-4 text-left transition-colors duration-150 ease-entrance hover:border-white/20">
            
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-indigo/15">
                <SparklesIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-white">Ask Hava AI</span>
                <span className="block text-[11px] text-mist-400">
                  Characters, the ending, the score — answered from this title
                </span>
              </span>
              <ArrowRightIcon className="ml-auto h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
            </button>
          }

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Cast & crew</h2>
            <ul className="mt-3 space-y-2.5">
              {asset.cast.map((member) => {
                const inner =
                <>
                    <img
                    src={member.portrait}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover" />
                  
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-white">
                        {member.name}
                      </span>
                      <span className="block truncate text-[11px] text-mist-400">
                        {member.role}
                      </span>
                    </span>
                  </>;

                return (
                  <li key={member.id}>
                    {member.to ?
                    <Link
                      to={member.to}
                      className="flex items-center gap-2.5 rounded-lg p-1 transition-colors duration-150 ease-entrance hover:bg-white/5">
                      
                        {inner}
                      </Link> :

                    <span className="flex items-center gap-2.5 p-1">{inner}</span>
                    }
                  </li>);

              })}
            </ul>
          </section>

          {fromCreator.length > 0 &&
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">More from {title.creator}</h2>
              <ul className="mt-3 space-y-2">
                {fromCreator.slice(0, 3).map((item) =>
              <li key={item.id}>
                    <Link
                  to={`/watch/${item.slug}`}
                  onClick={() => watchApi.track('recommendation_clicked', slug, item.slug)}
                  className="flex items-center gap-2.5 rounded-lg p-1 transition-colors duration-150 ease-entrance hover:bg-white/5">
                  
                      <img
                    src={item.backdrop ?? item.poster}
                    alt=""
                    className="h-12 w-20 rounded-lg object-cover" />
                  
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-white">
                          {item.name}
                        </span>
                        <span className="block truncate text-[11px] text-mist-400">
                          {item.genre} · {item.runtime}
                        </span>
                      </span>
                    </Link>
                  </li>
              )}
              </ul>
            </section>
          }

          {asset.economy.enabled.includes('membership') && asset.economy.membershipMinor &&
          <section className="rounded-2xl border border-brand-amber/25 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">{asset.economy.membershipLabel}</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-mist-400">
                Early cuts, the production archive and member-only screenings, direct from{' '}
                {title.creator}.
              </p>
              <button
              type="button"
              onClick={() => setSheet('support')}
              className="mt-3 w-full rounded-full border border-brand-amber/40 px-4 py-2 text-xs font-semibold text-brand-amber transition-colors duration-150 ease-entrance hover:bg-brand-amber/10">
              
                {asset.economy.currencySymbol}
                {(asset.economy.membershipMinor / 100).toLocaleString()} a month
              </button>
            </section>
          }

          {saved &&
          <p className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-ink-900 p-3 text-[11px] text-brand-cyan">
              <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              In your watchlist
            </p>
          }
        </aside>
      </div>

      {/* --------------------------------------------------------- discovery */}
      <div className="mt-8 space-y-7 px-3 sm:px-5">
        <DiscoveryRail
          heading="Because you watched this"
          note="Same register, different world"
          titles={sameGenre.slice(0, 4)}
          slug={slug} />
        
        <DiscoveryRail heading={`More from ${title.creator}`} titles={fromCreator} slug={slug} />
        <DiscoveryRail
          heading="Trending in Nigeria"
          titles={titles.filter((t) => t.id !== title.id).slice(0, 4)}
          slug={slug} />
        
      </div>

      {/* ------------------------------------------------------------ sheets */}
      {sheet === 'support' &&
      <SupportSheet
        slug={slug}
        creator={title.creator}
        economy={asset.economy}
        onClose={() => setSheet(null)}
        onDone={showToast} />

      }
      {sheet === 'share' &&
      <ShareSheet
        slug={slug}
        titleName={title.name}
        currentTime={playback.currentTime}
        onClose={() => setSheet(null)}
        onDone={showToast} />

      }
      {sheet === 'report' &&
      <ReportSheet slug={slug} onClose={() => setSheet(null)} onDone={showToast} />
      }
      {sheet === 'party' &&
      <WatchPartySheet
        slug={slug}
        titleName={title.name}
        onClose={() => setSheet(null)}
        onCreated={(id) => {
          setPartyId(id);
          showToast('Watch party started');
        }} />

      }
    </div>);

}