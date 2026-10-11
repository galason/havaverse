import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCwIcon, SparklesIcon, WifiOffIcon } from 'lucide-react';
import type {
  DismissReason,
  HomeFeed,
  HomeModule,
  HomeViewerContext } from
'../types/home';
import { homeApi } from '../services/homeApi';
import { liveReminders } from '../services/liveReminders';
import { intentChips } from '../data/home';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

import { HeroCarousel } from '../components/home/HeroCarousel';
import { IntentBar } from '../components/home/IntentBar';
import { SectionHeading } from '../components/home/SectionHeading';
import { ContinueRail } from '../components/home/ContinueRail';
import { NextExperienceCard } from '../components/home/NextExperienceCard';
import { LiveNowRail } from '../components/home/LiveNowRail';
import { SportsRail } from '../components/home/SportsRail';
import { ForYouRail } from '../components/home/ForYouRail';
import { CreatorActivityRail } from '../components/home/CreatorActivityRail';
import { CommunityActivityRail } from '../components/home/CommunityActivityRail';
import { UniversesRail } from '../components/home/UniversesRail';
import { ListenRail } from '../components/home/ListenRail';
import { ExperiencesRail, MarketRail } from '../components/home/MarketRail';
import { ContextRail } from '../components/home/ContextRail';

/**
 * HavaVerse Home — the personalized entrance to the entertainment graph.
 *
 * This page renders whatever the home service returns. It contains no section
 * list, no targeting rules, no recommendation logic and no regional content.
 * Reordering or retargeting the homepage is a Control Room change.
 */
export function Home() {
  const { showToast, watchlist, following } = useApp();
  const { identity } = useAuth();

  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [feed, setFeed] = React.useState<HomeFeed | null>(null);
  const [reminders, setReminders] = React.useState<Record<string, boolean>>(() =>
  Object.fromEntries(liveReminders.all().map((k) => [k, true]))
  );
  const [focusSignal, setFocusSignal] = React.useState(0);
  const [offline, setOffline] = React.useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  // The viewer context the server would derive from identity + behaviour.
  const context: HomeViewerContext = React.useMemo(
    () => ({
      signedIn: Boolean(identity),
      accountType: identity?.accountType ?? null,
      region: 'NG',
      regionName: 'Nigeria',
      hasHistory: true,
      followsCreators: following.length > 0,
      inCommunities: true,
      followsSport: true,
      listens: true
    }),
    [identity, following.length]
  );

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await homeApi.getHomeFeed(context);
    if (!result.ok) {
      setStatus('error');
      return;
    }
    setFeed(result.data);
    setStatus('ready');
    homeApi.track('home_viewed', { region: context.region });
  }, [context]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  async function handleDismiss(slug: string, reason: DismissReason) {
    const result = await homeApi.dismissRecommendation(slug, reason);
    if (!result.ok) return;
    showToast(result.data);
    setFeed((prev) =>
    prev ?
    {
      ...prev,
      modules: prev.modules.map((m) =>
      m.recommendations ?
      { ...m, recommendations: m.recommendations.filter((r) => r.slug !== slug) } :
      m
      )
    } :
    prev
    );
  }

  async function handleRemoveContinue(slug: string) {
    const result = await homeApi.removeFromContinue(slug);
    if (!result.ok) return;
    showToast('Removed from continue watching');
    setFeed((prev) =>
    prev ?
    {
      ...prev,
      modules: prev.modules.map((m) =>
      m.continueItems ?
      { ...m, continueItems: m.continueItems.filter((c) => c.slug !== slug) } :
      m
      )
    } :
    prev
    );
  }

  async function handleReminder(id: string, name: string) {
    const result = await homeApi.toggleReminder(id);
    if (!result.ok) return;
    setReminders((prev) => ({ ...prev, [id]: result.data }));
    showToast(result.data ? `We’ll remind you about ${name}` : 'Reminder removed');
  }

  if (status === 'loading') {
    return (
      <div className="flex gap-5 p-4 sm:p-5">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="h-[22rem] animate-pulse rounded-2xl bg-ink-900 lg:h-[30rem]" />
          <div className="h-16 animate-pulse rounded-2xl bg-ink-900" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) =>
            <div key={i} className="aspect-video animate-pulse rounded-xl bg-ink-900" />
            )}
          </div>
        </div>
        <div className="hidden w-[21rem] shrink-0 xl:block">
          <div className="h-80 animate-pulse rounded-2xl bg-ink-900" />
        </div>
      </div>);

  }

  if (status === 'error' || !feed) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-md rounded-2xl border border-white/5 bg-ink-900 p-6 text-center">
          <h1 className="text-base font-bold text-white">
            We couldn’t load your home experience
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-mist-300">
            Nothing is lost — your watchlist, history and communities are intact.
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

  function renderModule(module: HomeModule): React.ReactNode {
    const { config } = module;

    switch (config.id) {
      case 'hero':
        return module.hero ?
        <HeroCarousel slides={module.hero} onTrack={homeApi.track} /> :
        null;

      case 'intent':
        return (
          <IntentBar
            heading={config.heading ?? 'What do you feel like experiencing?'}
            chips={intentChips}
            onAskHava={() => {
              setFocusSignal((n) => n + 1);
              homeApi.track('ai_opened');
            }} />);



      case 'welcome':
        return (
          <section className="rounded-2xl border border-brand-indigo/25 bg-ink-900 p-5">
            <h2 className="text-base font-bold text-white">New to HavaVerse</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-mist-300">
              Your recommendations are still learning what you love. Tell Hava AI what
              you’re interested in, or follow a creator — the page reshapes around you
              from there.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFocusSignal((n) => n + 1)}
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink-950">
                
                Tell Hava AI what you like
              </button>
              <Link
                to="/register"
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white">
                
                Create an account
              </Link>
            </div>
          </section>);


      case 'continue':
        return module.continueItems?.length ?
        <section aria-labelledby="continue-h">
            <SectionHeading
            id="continue-h"
            heading={config.heading!}
            viewAllTo={config.viewAllTo} />
          
            <ContinueRail items={module.continueItems} onRemove={handleRemoveContinue} />
          </section> :
        null;

      case 'next':
        return module.next ?
        <section aria-labelledby="next-h">
            <SectionHeading id="next-h" heading={config.heading!} />
            <NextExperienceCard next={module.next} />
          </section> :
        null;

      case 'live':
        return module.live?.length ?
        <section aria-labelledby="live-h">
            <SectionHeading
            id="live-h"
            heading={config.heading!}
            viewAllTo={config.viewAllTo} />
          
            <LiveNowRail
            items={module.live}
            reminders={reminders}
            onReminder={(item) => handleReminder(item.id, item.name)} />
          
          </section> :
        null;

      case 'sports':
        return module.sports?.length ?
        <section aria-labelledby="sports-h">
            <SectionHeading
            id="sports-h"
            heading={config.heading!}
            subheading={config.subheading}
            viewAllTo={config.viewAllTo} />
          
            <SportsRail
            items={module.sports}
            reminders={reminders}
            onReminder={(item) =>
            handleReminder(item.id, `${item.home} vs ${item.away}`)
            } />
          
          </section> :
        null;

      case 'foryou':
      case 'ai-creations':
        return module.recommendations?.length ?
        <section aria-labelledby={`${config.id}-h`}>
            <SectionHeading
            id={`${config.id}-h`}
            heading={config.heading!}
            subheading={
            config.id === 'foryou' ?
            'Every card can tell you why it is here' :
            config.subheading
            }
            viewAllTo={config.viewAllTo} />
          
            <ForYouRail items={module.recommendations} onDismiss={handleDismiss} />
          </section> :
        null;

      case 'creators':
        return module.creators?.length ?
        <section aria-labelledby="creators-h">
            <SectionHeading
            id="creators-h"
            heading={config.heading!}
            viewAllTo={config.viewAllTo} />
          
            <CreatorActivityRail items={module.creators} />
          </section> :
        null;

      case 'communities':
        return module.communities?.length ?
        <section aria-labelledby="communities-h">
            <SectionHeading
            id="communities-h"
            heading={config.heading!}
            viewAllTo={config.viewAllTo} />
          
            <CommunityActivityRail items={module.communities} />
          </section> :
        null;

      case 'universes':
        return module.universes?.length ?
        <section aria-labelledby="universes-h">
            <SectionHeading
            id="universes-h"
            heading={config.heading!}
            subheading={config.subheading}
            viewAllTo={config.viewAllTo} />
          
            <UniversesRail items={module.universes} />
          </section> :
        null;

      case 'listen':
        return module.listen?.length ?
        <section aria-labelledby="listen-h">
            <SectionHeading
            id="listen-h"
            heading={config.heading!}
            viewAllTo={config.viewAllTo} />
          
            <ListenRail items={module.listen} />
          </section> :
        null;

      case 'market':
        return module.market?.length ?
        <section aria-labelledby="market-h">
            <SectionHeading
            id="market-h"
            heading={config.heading!}
            subheading={config.subheading}
            viewAllTo={config.viewAllTo} />
          
            <MarketRail items={module.market} />
          </section> :
        null;

      case 'experiences':
        return module.experiences?.length ?
        <section aria-labelledby="experiences-h">
            <SectionHeading
            id="experiences-h"
            heading={config.heading!}
            viewAllTo={config.viewAllTo} />
          
            <ExperiencesRail items={module.experiences} />
          </section> :
        null;

      case 'create':
        return (
          <section className="flex flex-col gap-4 rounded-2xl border border-brand-violet/25 bg-ink-900 p-5 sm:flex-row sm:items-center">
            <SparklesIcon
              className="h-8 w-8 shrink-0 text-brand-violet"
              aria-hidden="true" />
            
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl tracking-wide text-white">
                Turn your imagination into entertainment
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-mist-300">
                Create films, series, shorts, music videos and whole stories with the AI
                Entertainment Director — from idea through storyboard to a finished cut.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                to="/studio"
                className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
                
                Start creating
              </Link>
              <Link
                to="/studio/bible"
                className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:border-white/45">
                
                Explore Studio
              </Link>
            </div>
          </section>);


      default:
        return null;
    }
  }

  return (
    <div className="flex gap-5 p-4 sm:p-5">
      <div className="min-w-0 flex-1 space-y-8">
        {offline &&
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-brand-amber/30 bg-brand-amber/10 p-3 text-xs font-semibold text-brand-amber">
          
            <WifiOffIcon className="h-4 w-4" aria-hidden="true" />
            You’re offline. Showing the last version of your home experience — downloads
            are still available.
          </p>
        }

        {feed.modules.map((module) =>
        <React.Fragment key={module.config.id}>{renderModule(module)}</React.Fragment>
        )}

        {/* On narrow screens the contextual rail becomes the last block of the
             feed rather than disappearing — Hava AI stays reachable. */}
        <div className="xl:hidden">
          <ContextRail feed={feed} focusSignal={focusSignal} />
        </div>

        {watchlist.length === 0 &&
        <p className="text-[11px] text-mist-400">
            Nothing saved yet — the plus on any poster keeps it for later.
          </p>
        }
      </div>

      <div className="hidden xl:block">
        <ContextRail feed={feed} focusSignal={focusSignal} />
      </div>
    </div>);

}