import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClockIcon,
  CompassIcon,
  LayersIcon,
  SparklesIcon,
  UsersIcon,
  WandSparklesIcon } from
'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useCommunity } from '../contexts/CommunityContext';
import { useCommerce } from '../contexts/CommerceContext';
import { dashboardApi } from '../services/dashboardApi';
import { directorApi } from '../services/directorApi';
import type { DashboardFeed, DashboardModule, DashboardViewerContext } from '../types/dashboard';
import {
  ModuleError,
  ModuleSkeleton,
  Panel,
  PanelWeightContext } from
'../components/dashboard/primitives';
import { DashboardGreeting } from '../components/dashboard/DashboardGreeting';
import { DashboardMobileNav } from '../components/dashboard/DashboardMobileNav';
import { AiCommand } from '../components/dashboard/AiCommand';
import { MyDay } from '../components/dashboard/MyDay';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { ContinuePanel } from '../components/dashboard/ContinuePanel';
import { CreativeUniversePanel } from '../components/dashboard/CreativeUniversePanel';
import { AiProductionPanel } from '../components/dashboard/AiProductionPanel';
import {
  CommunityPulsePanel,
  CreatorPulsePanel,
  EconomyPulsePanel,
  LibraryPulsePanel } from
'../components/dashboard/PulsePanels';
import { InsightsPanel, UpNextPanel } from '../components/dashboard/RailPanels';

/**
 * /dashboard — the authenticated personal operating environment.
 *
 * Deliberately NOT the homepage. `/` answers "what can I experience?" and is
 * entertainment-first. This answers "what is happening in my HavaVerse, and
 * what should I do next?" and is identity-, activity- and action-first.
 *
 * The page holds no module list. It renders whatever the dashboard service
 * resolves for this viewer, in the order the manifest gives, which is what
 * lets the Control Room reorder, retarget or retire a module without a
 * frontend change.
 */
export function Dashboard() {
  const { identity } = useAuth();
  const { watchlist, following } = useApp();
  const { memberships } = useCommunity();
  const commerce = useCommerce();

  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [feed, setFeed] = React.useState<DashboardFeed | null>(null);

  // The vault count is read from commerce if it exposes one; the dashboard
  // never keeps its own copy of what the viewer owns.
  const owned = (commerce as unknown as {owned?: unknown[];}).owned;
  const collected = Array.isArray(owned) ? owned.length : 0;

  const ctx: DashboardViewerContext = React.useMemo(
    () => ({
      signedIn: Boolean(identity),
      displayName: identity?.profile.displayName?.split(' ')[0] || identity?.username || 'there',
      accountType: identity?.accountType ?? 'viewer',
      capabilities: identity?.capabilities ?? [],
      region: identity?.profile.country || 'NG',
      hour: new Date().getHours(),
      // Derived, never asserted: production only exists if the account can create.
      hasProjects: Boolean(identity?.capabilities.includes('create')),
      hasHistory: watchlist.length > 0 || following.length > 0,
      inCommunities: memberships.length > 0
    }),
    [identity, watchlist.length, following.length, memberships.length]
  );

  const personal = React.useMemo(
    () => ({
      memberships: memberships.map((m) => m.slug),
      watchlist,
      following,
      collected,
      downloads: 0
    }),
    [memberships, watchlist, following, collected]
  );

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await dashboardApi.getDashboard(ctx, personal);
    if (!result.ok) {
      setStatus('error');
      return;
    }
    setFeed(result.data);
    setStatus('ready');
  }, [ctx, personal]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const result = await dashboardApi.getDashboard(ctx, personal);
      if (!alive) return;
      if (!result.ok) {
        setStatus('error');
        return;
      }
      setFeed(result.data);
      setStatus('ready');
    })();
    return () => {
      alive = false;
    };
  }, [ctx, personal]);

  /**
   * AI jobs keep running in the director service whether or not this page is
   * mounted. Re-resolving on a slow tick is how the dashboard visibly changes
   * while it sits open — it is reading real job state, not animating a number.
   */
  React.useEffect(() => {
    if (status !== 'ready') return;
    let alive = true;
    const id = window.setInterval(async () => {
      // Advance the director's queue, then re-read. The dashboard reports job
      // state; it never fabricates progress of its own.
      directorApi.tickJobs();
      const result = await dashboardApi.getDashboard(ctx, personal);
      if (alive && result.ok) setFeed(result.data);
    }, 4_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [status, ctx, personal]);

  const main = feed?.modules.filter((m) => m.config.slot === 'main') ?? [];
  const rail = feed?.modules.filter((m) => m.config.slot === 'rail') ?? [];

  if (status === 'loading') {
    return (
      <div className="p-4 sm:p-5">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-white/5" aria-hidden="true" />
        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <ModuleSkeleton lines={2} />
            <ModuleSkeleton lines={3} />
          </div>
          <ModuleSkeleton lines={4} />
        </div>
        <p className="sr-only" role="status">
          Assembling your dashboard
        </p>
      </div>);

  }

  if (status === 'error' || !feed) {
    return (
      <div className="mx-auto max-w-lg p-5">
        <ModuleError what="Your dashboard" onRetry={load} />
      </div>);

  }

  const empty = main.length <= 2;
  const pulse = feed.modules.find((m) => m.id === 'pulse');
  const universe = feed.modules.find((m) => m.id === 'creative-universe');
  const atmosphere = universe && universe.id === 'creative-universe' ? universe.universe.poster : undefined;

  return (
    <div className="p-4 pb-28 sm:p-5 sm:pb-28 lg:pb-8">
      <DashboardGreeting
        ctx={feed.context}
        signals={pulse && pulse.id === 'pulse' ? pulse.signals : []}
        atmosphere={atmosphere} />
      
      <p className="sr-only">
        Modules resolved for {feed.matchedAudiences.filter((a) => a !== 'everyone').join(', ')}
      </p>

      {empty && <WelcomeState />}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">{main.map(renderModule)}</div>
        <aside className="min-w-0 space-y-4">{rail.map(renderModule)}</aside>
      </div>

      <DashboardMobileNav />
    </div>);


  function renderModule(module: DashboardModule) {
    const { config } = module;
    // Main column: priority modules stay on a surface, secondary ones become
    // thin-line editorial sections. The rail is always lighter than the main.
    const secondary: string[] = ['activity', 'continue', 'library-pulse', 'community-pulse'];
    const weight: 'surface' | 'quiet' | 'plain' =
    config.slot === 'rail' ? 'quiet' : secondary.includes(module.id) ? 'plain' : 'surface';

    const inner = renderInner(module);
    if (!inner) return null;
    return (
      <PanelWeightContext.Provider key={config.id} value={weight}>
        {inner}
      </PanelWeightContext.Provider>);

  }

  function renderInner(module: DashboardModule) {
    const { config } = module;
    switch (module.id) {
      case 'pulse':
        // Rendered inside the greeting as live signals.
        return null;

      case 'command':
        return (
          <AiCommand
            key={config.id}
            heading={config.heading ?? 'HavaVerse AI'}
            subheading={config.subheading}
            prompts={module.prompts}
            ctx={feed!.context} />);



      case 'my-day':
        return (
          <Panel
            key={config.id}
            heading={config.heading}
            subheading={config.subheading}
            icon={<CalendarClockIcon className="h-4 w-4" />}>
            
            <MyDay cards={module.cards} />
          </Panel>);


      case 'continue':
        return (
          <Panel key={config.id} heading={config.heading} icon={<LayersIcon className="h-4 w-4" />}>
            <ContinuePanel items={module.items} />
          </Panel>);


      case 'creative-universe':
        return (
          <Panel
            key={config.id}
            heading={config.heading}
            subheading={config.subheading}
            icon={<WandSparklesIcon className="h-4 w-4" />}>
            
            <CreativeUniversePanel universe={module.universe} />
          </Panel>);


      case 'ai-production':
        return (
          <Panel
            key={config.id}
            heading={config.heading}
            icon={<SparklesIcon className="h-4 w-4" />}
            viewAll={{ label: 'Job queue', to: '/studio/jobs' }}
            live={module.jobs.some((j) => j.state !== 'completed' && j.state !== 'failed')}>
            
            <AiProductionPanel jobs={module.jobs} />
          </Panel>);


      case 'activity':
        return (
          <Panel
            key={config.id}
            heading={config.heading}
            icon={<CompassIcon className="h-4 w-4" />}>
            
            <ActivityTimeline events={module.events} />
          </Panel>);


      case 'creator-pulse':
        return (
          <Panel key={config.id} heading={config.heading}>
            <CreatorPulsePanel pulse={module.pulse} />
          </Panel>);


      case 'economy-pulse':
        return (
          <Panel key={config.id} heading={config.heading}>
            <EconomyPulsePanel economy={module.economy} />
          </Panel>);


      case 'library-pulse':
        return (
          <Panel key={config.id} heading={config.heading}>
            <LibraryPulsePanel library={module.library} />
          </Panel>);


      case 'up-next':
        return (
          <Panel
            key={config.id}
            heading={config.heading}
            icon={<CalendarClockIcon className="h-4 w-4" />}
            viewAll={{ label: 'View all', to: '/events' }}>
            
            <UpNextPanel items={module.items} />
          </Panel>);


      case 'insights':
        return (
          <Panel
            key={config.id}
            heading={config.heading}
            icon={<SparklesIcon className="h-4 w-4" />}>
            
            <InsightsPanel insights={module.insights} />
          </Panel>);


      case 'community-pulse':
        return (
          <Panel
            key={config.id}
            heading={config.heading}
            icon={<UsersIcon className="h-4 w-4" />}
            viewAll={{ label: 'All', to: '/communities' }}>
            
            <CommunityPulsePanel signals={module.signals} />
          </Panel>);


      default:
        return null;
    }
  }
}

/**
 * A dashboard with nothing in it yet still has to feel like somewhere. It
 * offers the three real entry points rather than rendering empty modules.
 */
function WelcomeState() {
  return (
    <section className="mb-5 rounded-2xl border border-brand-indigo/25 bg-ink-900 p-5 sm:p-6">
      <h2 className="font-display text-2xl tracking-wide text-white">Welcome to your HavaVerse</h2>
      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-mist-300">
        This is your personal command center. As you watch, create, join and support, it fills with
        what is actually happening around you.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/studio"
          className="rounded-lg bg-brand-indigo px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
          Create with Hava AI
        </Link>
        <Link
          to="/"
          className="rounded-lg bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
          
          Discover entertainment
        </Link>
        <Link
          to="/communities"
          className="rounded-lg bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
          
          Explore communities
        </Link>
      </div>
    </section>);

}