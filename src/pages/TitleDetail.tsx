import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRightIcon, CompassIcon, PlayIcon, TrophyIcon } from 'lucide-react';
import type { ContentTitle } from '../types/content';
import type {
  DownloadRecord,
  TitleExperience,
  TitleSectionId } from
'../types/title';
import type { EconomyConfig } from '../types/watch';
import { titleApi } from '../services/titleApi';
import { watchApi } from '../services/watchApi';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

import { TitleHero } from '../components/title/TitleHero';
import { SectionNav } from '../components/title/SectionNav';
import { QuickActions } from '../components/title/QuickActions';
import { AboutPanel } from '../components/title/AboutPanel';
import { AskHavaTitle } from '../components/title/AskHavaTitle';
import { CharacterRail } from '../components/title/CharacterRail';
import { UniverseRail } from '../components/title/UniverseRail';
import { GraphConnections } from '../components/graph/GraphConnections';
import { EpisodesPanel } from '../components/title/EpisodesPanel';
import { ExtrasRail } from '../components/title/ExtrasRail';
import { ReviewsPanel } from '../components/title/ReviewsPanel';
import { RecommendationGroups } from '../components/title/RecommendationGroups';
import { CreatorPanel } from '../components/title/CreatorPanel';
import { TitleCommunityPanel } from '../components/title/TitleCommunityPanel';
import { MarketPanel } from '../components/title/MarketPanel';
import { SoundtrackPanel } from '../components/title/SoundtrackPanel';
import { RightsPanel } from '../components/title/RightsPanel';
import { InspiredPanel } from '../components/title/InspiredPanel';
import { OwnerBar } from '../components/title/OwnerBar';
import { DownloadSheet } from '../components/title/DownloadSheet';
import { MoreSheet } from '../components/title/MoreSheet';

import { Sheet } from '../components/watch/Sheet';
import { ShareSheet } from '../components/watch/ShareSheet';
import { ReportSheet } from '../components/watch/ReportSheet';
import { SupportSheet } from '../components/watch/SupportSheet';
import { WatchPartySheet } from '../components/watch/WatchPartySheet';
import { ErrorBlock, LoadingBlock } from '../components/community/StateBlocks';

type SheetId = 'share' | 'report' | 'support' | 'party' | 'download' | 'more' | null;

const headings: Partial<Record<TitleSectionId, string>> = {
  episodes: 'Episodes',
  characters: 'Meet the characters',
  extras: 'Extras',
  reviews: 'Reviews & ratings',
  live: 'Live',
  stats: 'Stats',
  highlights: 'Highlights'
};

export function TitleDetail() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  /**
   * Extras are separate masters and HavaVerse has no source connected for them
   * yet, so this states that plainly rather than toasting "Playing …" over
   * nothing. The moment an extras master exists this becomes a player route.
   */
  const playExtra = React.useCallback(
    (extra: {name: string;}) =>
    showToast(`${extra.name} needs its own master, which is not connected yet`),
    [showToast]
  );
  const { identity } = useAuth();

  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState<ContentTitle | null>(null);
  const [experience, setExperience] = React.useState<TitleExperience | null>(null);
  const [economy, setEconomy] = React.useState<EconomyConfig | null>(null);

  const [sheet, setSheet] = React.useState<SheetId>(null);
  const [spoilerMode, setSpoilerMode] = React.useState<'free' | 'full'>('free');
  const [liked, setLiked] = React.useState<'up' | 'down' | null>(null);
  const [notified, setNotified] = React.useState(false);
  const [download, setDownload] = React.useState<DownloadRecord | null>(null);
  const [active, setActive] = React.useState<TitleSectionId>('overview');

  const load = React.useCallback(async () => {
    setStatus('loading');
    setError(null);
    const result = await titleApi.getTitle(slug);
    if (!result.ok) {
      setError(result.error);
      setStatus('error');
      return;
    }
    setTitle(result.data.title);
    setExperience(result.data.experience);
    setNotified(titleApi.isNotified(slug));
    setDownload(titleApi.downloadFor(slug));
    setLiked(watchApi.getReaction(slug));
    setSpoilerMode('free');
    setActive('overview');
    setStatus('ready');

    // Economy config lives with the playback asset — the title page reads it
    // rather than keeping a second copy of creator pricing.
    const asset = await watchApi.getAsset(slug);
    setEconomy(asset.ok ? asset.data.economy : null);
  }, [slug]);

  React.useEffect(() => {
    load();
    window.scrollTo({ top: 0 });
  }, [load]);

  // Scroll spy so the sticky nav reflects where the reader actually is.
  React.useEffect(() => {
    if (status !== 'ready' || !experience) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.
        filter((e) => e.isIntersecting).
        sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id as TitleSectionId);
      },
      { rootMargin: '-72px 0px -65% 0px', threshold: 0 }
    );
    experience.sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [status, experience]);

  if (status === 'loading') {
    return (
      <div className="p-6">
        <div className="aspect-[21/8] w-full animate-pulse rounded-2xl bg-ink-900" />
        <div className="mt-5 h-8 w-2/5 animate-pulse rounded-full bg-ink-900" />
        <div className="mt-3 h-4 w-3/5 animate-pulse rounded-full bg-ink-850" />
        <div className="mt-6">
          <LoadingBlock label="Loading this title" />
        </div>
      </div>);

  }

  if (status === 'error' || !title || !experience) {
    return (
      <div className="p-6">
        <ErrorBlock
          message={error ?? 'That title could not be loaded.'}
          onRetry={load} />
        
        <Link
          to="/"
          className="mt-4 inline-block text-xs font-semibold text-brand-indigo">
          
          Back to home
        </Link>
      </div>);

  }

  const cta = titleApi.resolveCta(title, experience, Boolean(identity));
  const universeId = experience.universe?.id;

  function jump(id: TitleSectionId) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function toggleNotify() {
    const result = await titleApi.notifyWhenAvailable(slug);
    if (!result.ok) return;
    setNotified(result.data);
    showToast(result.data ? 'We’ll tell you when it lands' : 'Notification removed');
  }

  function section(id: TitleSectionId, children: React.ReactNode) {
    if (!experience!.sections.includes(id)) return null;
    const heading = headings[id];
    return (
      <section id={id} aria-labelledby={heading ? `${id}-h` : undefined} className="scroll-mt-16">
        {heading &&
        <h2 id={`${id}-h`} className="mb-3 text-lg font-bold tracking-tight text-white">
            {heading}
          </h2>
        }
        {children}
      </section>);

  }

  return (
    <div className="pb-24 lg:pb-10">
      {experience.ownedByViewer && <OwnerBar titleName={title.name} />}

      <TitleHero
        title={title}
        experience={experience}
        cta={cta}
        liked={liked}
        onLike={(value) => {
          const next = watchApi.setReaction(slug, liked === value ? null : value);
          setLiked(next);
          showToast(
            next === 'up' ?
            'Liked · kept in your Library' :
            next === 'down' ?
            'Noted — we’ll show you less like this' :
            'Reaction removed'
          );
        }}
        notified={notified}
        onNotify={toggleNotify}
        onShare={() => setSheet('share')}
        onDownload={() => setSheet('download')}
        onMore={() => setSheet('more')}
        onTrailer={() => {
          jump('extras');
          showToast('Trailer and extras below');
        }}
        download={download} />
      

      <SectionNav sections={experience.sections} active={active} onSelect={jump} />

      <div className="grid gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ------------------------------------------------------------ main */}
        <div className="min-w-0 space-y-8">
          <QuickActions
            title={title}
            cta={cta}
            onAsk={() =>
            document.getElementById('ask')?.scrollIntoView({ behavior: 'smooth' })
            }
            onWatchParty={() => setSheet('party')}
            onSupport={() => setSheet('support')} />
          

          <section id="overview" className="scroll-mt-16">
            <AboutPanel title={title} experience={experience} />
          </section>

          <div id="ask" className="scroll-mt-16">
            <AskHavaTitle
              slug={slug}
              titleName={title.name}
              suggestions={experience.suggestedQuestions}
              mode={spoilerMode}
              onMode={setSpoilerMode} />
            
          </div>

          {section(
            'episodes',
            <EpisodesPanel slug={slug} seasons={experience.seasons} />
          )}

          {section(
            'characters',
            <CharacterRail
              characters={experience.characters}
              spoilerMode={spoilerMode}
              onToast={showToast} />

          )}

          {experience.universe && experience.sections.includes('universe') &&
          <section id="universe" aria-labelledby="universe-h" className="scroll-mt-16">
              <h2 id="universe-h" className="mb-3 text-lg font-bold tracking-tight text-white">
                {experience.universe.name}
              </h2>
              <UniverseRail
              name={experience.universe.name}
              to={experience.universe.to}
              entries={experience.universe.entries} />
            
            </section>
          }

          <GraphConnections nodeId={`${title.kind === 'Series' ? 'series' : 'film'}:${slug}`} titleName={title.name} />

          {section(
            'extras',
            <ExtrasRail extras={experience.extras} spoilerMode={spoilerMode} onPlay={playExtra} />
          )}

          {/* Sports titles get their own shape rather than a film's. */}
          {section(
            'live',
            <Link
              to="/sports"
              className="flex items-center gap-3 rounded-2xl border border-live/30 bg-live/5 p-4 transition-colors duration-150 ease-entrance hover:border-live/60">
              
              <span className="grid h-10 w-10 place-items-center rounded-full bg-live/15">
                <PlayIcon className="h-4 w-4 fill-live text-live" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold text-white">
                  Watch in the match centre
                </span>
                <span className="block text-xs text-mist-400">
                  Live scoreline, key events and statistics
                </span>
              </span>
              <ArrowRightIcon className="ml-auto h-4 w-4 text-mist-400" aria-hidden="true" />
            </Link>
          )}

          {section(
            'stats',
            <Link
              to="/sports"
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-4 transition-colors duration-150 ease-entrance hover:border-white/20">
              
              <TrophyIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />
              <span>
                <span className="block text-sm font-bold text-white">Standings and form</span>
                <span className="block text-xs text-mist-400">
                  The full table, kept in the match centre
                </span>
              </span>
              <ArrowRightIcon className="ml-auto h-4 w-4 text-mist-400" aria-hidden="true" />
            </Link>
          )}

          {section(
            'highlights',
            <ExtrasRail extras={experience.extras} spoilerMode={spoilerMode} onPlay={playExtra} />
          )}

          {section(
            'reviews',
            <ReviewsPanel
              slug={slug}
              summary={experience.reviews}
              spoilerMode={spoilerMode}
              onToast={showToast} />

          )}

          <section aria-labelledby="more-like-h" className="scroll-mt-16">
            <h2 id="more-like-h" className="mb-3 text-lg font-bold tracking-tight text-white">
              More like this
            </h2>
            <RecommendationGroups groups={experience.recommendations} />
          </section>

          {/* Smart up next: one chosen move, not a shelf. */}
          <section
            aria-labelledby="next-h"
            className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            
            <h2 id="next-h" className="text-sm font-bold text-white">
              Your next experience
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <CompassIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-xs leading-relaxed text-mist-200">
                {cta.mode === 'resume' || cta.mode === 'continue' ?
                `You’re part-way through ${title.name}. Picking it back up is the shortest path.` :
                experience.universe ?
                `You’ve seen the film. The ${experience.universe.name} carries the story further.` :
                `${experience.creator.name} has other work in the same register.`}
              </p>
              <Link
                to={
                cta.mode === 'resume' || cta.mode === 'continue' ?
                cta.to ?? `/watch/${slug}` :
                experience.universe?.to ??
                `/creator/${title.creatorHandle.replace('@', '')}`
                }
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
                
                {cta.mode === 'resume' || cta.mode === 'continue' ?
                cta.label :
                experience.universe ?
                'Enter the universe' :
                'View creator'}
              </Link>
            </div>
          </section>
        </div>

        {/* ------------------------------------------------------------ rail */}
        <aside className="space-y-4">
          <CreatorPanel creator={experience.creator} onSupport={() => setSheet('support')} />

          {experience.community &&
          <div id="community" className="scroll-mt-16">
              <TitleCommunityPanel
              stats={experience.community}
              onWatchParty={() => setSheet('party')} />
            
            </div>
          }

          <div id="market" className="scroll-mt-16">
            <MarketPanel universeId={universeId} />
          </div>

          {experience.soundtrack &&
          <div id="soundtrack" className="scroll-mt-16">
              <SoundtrackPanel
              soundtrack={experience.soundtrack}
              worldId="lagos-after-dark" />
            
            </div>
          }

          <RightsPanel
            availability={experience.availability}
            provenance={experience.provenance}
            notified={notified}
            onNotify={toggleNotify} />
          

          <InspiredPanel
            titleName={title.name}
            capabilities={experience.aiCapabilities}
            onToast={showToast} />
          
        </aside>
      </div>

      {/* ------------------------------------------------- mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/95 p-3 backdrop-blur lg:hidden">
        {cta.to ?
        <Link
          to={cta.to}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink-950">
          
            <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
            {cta.label}
          </Link> :

        <button
          type="button"
          onClick={toggleNotify}
          className="w-full rounded-full bg-white px-5 py-3 text-sm font-bold text-ink-950">
          
            {notified ? 'We’ll tell you' : cta.label}
          </button>
        }
      </div>

      {/* --------------------------------------------------------- sheets */}
      {sheet === 'share' &&
      <ShareSheet
        slug={slug}
        titleName={title.name}
        currentTime={0}
        onClose={() => setSheet(null)}
        onDone={(message) => {
          setSheet(null);
          showToast(message);
        }} />

      }

      {sheet === 'report' &&
      <ReportSheet
        slug={slug}
        onClose={() => setSheet(null)}
        onDone={(message) => {
          setSheet(null);
          showToast(message);
        }} />

      }

      {sheet === 'party' &&
      <WatchPartySheet
        slug={slug}
        titleName={title.name}
        onClose={() => setSheet(null)}
        onCreated={(partyId) => {
          setSheet(null);
          navigate(`/watch-parties/${partyId}`);
        }} />

      }

      {sheet === 'support' && (
      economy && economy.enabled ?
      <SupportSheet
        slug={slug}
        creator={title.creator}
        economy={economy}
        onClose={() => setSheet(null)}
        onDone={(message) => {
          setSheet(null);
          showToast(message);
        }} /> :


      <Sheet
        title={`Support ${title.creator}`}
        description="Creator support is not enabled for this title."
        onClose={() => setSheet(null)}>
        
            <p className="text-xs leading-relaxed text-mist-300">
              {title.creator} has not switched on contributions for {title.name}. Following
              them is still the most useful thing you can do — you’ll be told when they
              publish.
            </p>
          </Sheet>)
      }

      {sheet === 'download' &&
      <DownloadSheet
        slug={slug}
        record={download}
        onChange={setDownload}
        onClose={() => setSheet(null)}
        onToast={showToast} />

      }

      {sheet === 'more' &&
      <MoreSheet
        title={title}
        experience={experience}
        onClose={() => setSheet(null)}
        onShare={() => setSheet('share')}
        onDownload={() => setSheet('download')}
        onReport={() => setSheet('report')}
        onToast={showToast} />

      }
    </div>);

}