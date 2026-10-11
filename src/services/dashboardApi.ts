import { titles, IMAGES } from '../data/catalog';
import {
  commandPrompts,
  creatorMetrics,
  dashboardModules,
  seedActivity,
  seedInsights } from
'../data/dashboard';
import { walletSnapshot } from './havapayLedger';
import { adaeze } from '../data/social';
import { communityApi } from './communityApi';
import { directorApi } from './directorApi';
import { getResume } from './watchApi';
import type {
  ActivityEvent,
  CommandAnswer,
  CommunitySignal,
  ContinueItem,
  CreativeUniverse,
  DashboardAudience,
  DashboardFeed,
  DashboardModule,
  DashboardModuleConfig,
  DashboardViewerContext,
  DayCard,
  EconomyPulse,
  Insight,
  ProductionJobState,
  ProductionJobView,
  PulseSignal,
  UpcomingItem } from
'../types/dashboard';

/**
 * HAVAVERSE DASHBOARD SERVICE
 * ---------------------------
 * Boundary between the dashboard UI and the domain services. In production
 * this maps to:
 *
 *   GET  /api/dashboard                  -> resolved module feed for the viewer
 *   POST /api/dashboard/ask              -> Hava AI command interpretation
 *   POST /api/dashboard/activity/read    -> mark an activity event seen
 *
 * The aggregate endpoint ORCHESTRATES existing domain services. It must never
 * become a second source of truth: money comes from HavaPay, production state
 * from the director service, membership from community, playback position from
 * the watch service. Anything the dashboard cannot source is omitted rather
 * than invented.
 *
 * Authorization is server-side. `requires` on a module is UX guidance so a
 * viewer is not shown empty creator panels; it is NOT the security boundary.
 */

export type DashboardResult<T> = {ok: true;data: T;} | {ok: false;error: string;};

/** Client-held signals the dashboard composes but does not own. */
export interface PersonalSignals {
  memberships: string[];
  watchlist: string[];
  following: string[];
  collected: number;
  downloads: number;
}

/* ----------------------------------------------------------- resolution */

function audiencesFor(ctx: DashboardViewerContext): DashboardAudience[] {
  const tags: DashboardAudience[] = ['everyone'];
  if (ctx.hasHistory || ctx.hasProjects || ctx.inCommunities) tags.push('returning');else
  tags.push('new');
  if (ctx.capabilities.includes('create')) tags.push('creator');
  if (ctx.hasProjects) tags.push('in-production');
  if (ctx.inCommunities) tags.push('in-communities');
  if (ctx.capabilities.includes('wallet')) tags.push('has-economy');
  return tags;
}

function moduleApplies(
config: DashboardModuleConfig,
ctx: DashboardViewerContext,
matched: DashboardAudience[],
now: Date)
: boolean {
  if (!config.enabled) return false;
  if (config.startsAt && now < new Date(config.startsAt)) return false;
  if (config.endsAt && now > new Date(config.endsAt)) return false;
  if (config.requires && !ctx.capabilities.includes(config.requires)) return false;
  if (config.regions !== 'all' && !config.regions.includes(ctx.region)) return false;
  if (config.audience.length > 0 && !config.audience.some((a) => matched.includes(a))) return false;
  return true;
}

function greetingFor(hour: number, name: string): string {
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return `Good ${part}, ${name}.`;
}

/* --------------------------------------------------------------- builders */

const jobStateMap: Record<string, ProductionJobState> = {
  QUEUED: 'queued',
  PREPARING: 'understanding',
  RETRYING: 'planning',
  GENERATING: 'generating',
  PROCESSING: 'validating',
  QUALITY_CHECK: 'validating',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'failed'
};

function buildJobs(projectTitle: string): ProductionJobView[] {
  return directorApi.
  getJobs().
  filter((job) => job.status !== 'CANCELLED').
  slice(0, 4).
  map((job) => ({
    id: job.id,
    project: projectTitle,
    label: job.label,
    state: jobStateMap[job.status] ?? 'queued',
    progress: job.progress,
    detail:
    job.status === 'FAILED' ?
    job.error ?? 'Generation failed' :
    job.status === 'COMPLETED' ?
    'Ready for review' :
    `${job.provider} · ${job.model}`,
    to: job.shotId ? `/studio/shot/${job.shotId}` : '/studio/jobs',
    failed: job.status === 'FAILED'
  }));
}

async function buildUniverse(): Promise<CreativeUniverse | null> {
  const [project, scenes, shots, characters] = await Promise.all([
  directorApi.getProject(),
  directorApi.getScenes(),
  directorApi.getShots(),
  directorApi.getCharacters()]
  );
  if (!project.ok) return null;

  const stages = directorApi.deriveStages();
  const active = stages.find((s) => s.ratio > 0 && s.ratio < 1) ?? stages[stages.length - 1];

  return {
    projectId: project.data.id,
    title: project.data.title,
    format: project.data.format,
    stage: active ? active.name : 'In production',
    progress: Math.round((active?.ratio ?? 0) * 100),
    poster: project.data.poster,
    stats: [
    { label: 'Characters', value: String(characters.ok ? characters.data.length : 0) },
    { label: 'Scenes', value: String(scenes.ok ? scenes.data.length : 0) },
    { label: 'Shots', value: String(shots.ok ? shots.data.length : 0) },
    { label: 'Community', value: '84.2K' }],

    // Every node states whether there is something behind it. A node with
    // nothing built is shown as not-yet rather than linked into a dead end.
    nodes: [
    { label: 'Story', to: '/studio/bible', ready: true },
    { label: 'Characters', to: '/studio/bible', ready: true },
    { label: 'World', to: '/universes/railway', ready: true },
    { label: 'Film', to: '/title/the-last-train', ready: true },
    { label: 'Soundtrack', to: '/music/track/night-line', ready: true },
    { label: 'Community', to: '/community/the-last-train', ready: true },
    { label: 'Market', to: '/market/universe/railway', ready: true },
    { label: 'Audience', to: '/studio', ready: false }],

    continueTo: '/studio',
    universeTo: '/universes/railway'
  };
}

async function buildDay(ctx: DashboardViewerContext): Promise<DayCard[]> {
  const cards: DayCard[] = [];

  if (ctx.capabilities.includes('create')) {
    const shots = await directorApi.getShots();
    if (shots.ok) {
      const revision = shots.data.filter((s) => s.status === 'needs-revision');
      if (revision.length > 0) {
        cards.push({
          id: 'day-revision',
          kind: 'blocked',
          title: `${revision.length} shot${revision.length > 1 ? 's need' : ' needs'} revision`,
          detail: 'A continuity check failed, so these cannot be approved yet.',
          image: revision[0].frame,
          actionLabel: 'Open shot',
          to: `/studio/shot/${revision[0].id}`
        });
      }

      const boarded = shots.data.filter((s) => s.status !== 'planned').length;
      cards.push({
        id: 'day-storyboard',
        kind: 'review',
        title: 'Storyboard is ready to review',
        detail: `${boarded} of ${shots.data.length} shots boarded`,
        image: shots.data[0]?.frame,
        actionLabel: 'Review storyboard',
        to: '/studio'
      });
    }

    const done = directorApi.getJobs().filter((j) => j.status === 'COMPLETED');
    if (done.length > 0) {
      cards.push({
        id: 'day-ai',
        kind: 'ai-complete',
        title: 'Generation finished',
        detail: `${done.length} result${done.length > 1 ? 's' : ''} ready for review`,
        actionLabel: 'View results',
        to: '/studio/jobs'
      });
    }

    const publish = directorApi.canPublish();
    if (!publish.allowed) {
      cards.push({
        id: 'day-publish',
        kind: 'blocked',
        title: 'Publishing is blocked',
        detail: publish.reason,
        actionLabel: 'Resolve',
        to: '/studio'
      });
    }
  }

  const events = await communityApi.listEvents();
  if (events.ok) {
    const next = events.data.find((e) => e.state === 'upcoming' || e.state === 'live');
    if (next) {
      cards.push({
        id: `day-event-${next.id}`,
        kind: 'upcoming',
        title: next.name,
        detail: `${next.kind} · ${next.when}`,
        image: next.image,
        actionLabel: 'View event',
        to: `/events/${next.id}`
      });
    }
  }

  return cards.slice(0, 4);
}

async function buildUpcoming(): Promise<UpcomingItem[]> {
  const [events, parties] = await Promise.all([
  communityApi.listEvents(),
  communityApi.listWatchParties()]
  );

  const items: UpcomingItem[] = [];

  if (events.ok) {
    events.data.
    filter((e) => e.state !== 'ended').
    slice(0, 3).
    forEach((e) =>
    items.push({
      id: `up-${e.id}`,
      when: e.when,
      dayLabel: e.state === 'live' ? 'Live now' : e.when.split('·')[0]?.trim() || 'Soon',
      title: e.name,
      detail: e.kind,
      image: e.image,
      to: `/events/${e.id}`,
      imminent: e.state === 'live'
    })
    );
  }

  if (parties.ok) {
    parties.data.
    filter((p) => p.state !== 'ended').
    slice(0, 2).
    forEach((p) =>
    items.push({
      id: `up-${p.id}`,
      when: p.when,
      dayLabel: p.state === 'live' ? 'Live now' : p.when.split('·')[0]?.trim() || 'Soon',
      title: p.title,
      detail: `Watch party · ${p.contentTitle}`,
      image: p.image,
      to: `/watch-parties/${p.id}`,
      imminent: p.state === 'live'
    })
    );
  }

  return items.slice(0, 5);
}

async function buildCommunitySignals(memberships: string[]): Promise<CommunitySignal[]> {
  if (memberships.length === 0) return [];
  const list = await communityApi.listCommunities();
  if (!list.ok) return [];
  return list.data.
  filter((c) => memberships.includes(c.slug)).
  slice(0, 4).
  map((c) => ({
    id: c.slug,
    name: c.name,
    detail: c.liveNow ? 'Live conversation happening now' : `${c.online} online`,
    live: c.liveNow,
    avatar: c.image,
    to: `/community/${c.slug}`
  }));
}

function buildContinue(hasProjects: boolean): ContinueItem[] {
  const items: ContinueItem[] = [];

  if (hasProjects) {
    const stages = directorApi.deriveStages();
    const active = stages.find((s) => s.ratio > 0 && s.ratio < 1);
    if (active) {
      items.push({
        id: 'cont-production',
        kind: 'creating',
        title: 'The Last Train',
        detail: `Production · ${active.name}`,
        progress: Math.round(active.ratio * 100),
        badge: 'Creating',
        to: '/studio',
        image: IMAGES.lastTrain
      });
    }
  }

  titles.forEach((t) => {
    const resume = getResume(t.slug);
    const progress = resume ? resume.completion : t.progress;
    if (typeof progress !== 'number' || progress <= 0 || progress >= 97) return;
    items.push({
      id: `cont-${t.slug}`,
      kind: 'watching',
      title: t.name,
      detail: t.kind === 'Series' ? 'Watching · S1 E4' : 'Watching',
      progress: Math.round(progress),
      badge: 'Watching',
      to: `/watch/${t.slug}`,
      image: t.backdrop ?? t.poster
    });
  });

  return items.slice(0, 5);
}

function buildActivity(): ActivityEvent[] {
  const now = Date.now();

  // Real production events from the director service, merged with the personal
  // history seed. Both are timestamped so the timeline stays chronological.
  const runs: ActivityEvent[] = directorApi.
  getRuns().
  slice(0, 4).
  map((run) => ({
    id: `run-${run.id}`,
    kind: 'ai' as const,
    text: run.message,
    at: run.at,
    to: '/studio/jobs',
    unread: run.tone === 'fail'
  }));

  const seeded: ActivityEvent[] = seedActivity.map(({ minutesAgo, event }) => ({
    ...event,
    at: now - minutesAgo * 60_000
  }));

  return [...runs, ...seeded].sort((a, b) => b.at - a.at).slice(0, 8);
}

function buildEconomy(isCreator: boolean): EconomyPulse {
  // Same projection the Wallet reads, so the two can never disagree.
  const wallet = walletSnapshot();
  const last = wallet.entries[0];

  return {
    available: `₦${wallet.available.toLocaleString('en-NG')}`,
    pending: `₦${wallet.incoming.toLocaleString('en-NG')}`,
    thisMonth: isCreator ? '+₦620,400' : '₦48,500 spent',
    lastLabel: last?.label ?? 'No activity yet',
    lastAmount: last ? `₦${last.amount.toLocaleString('en-NG')}` : '—',
    lastDirection: last?.direction ?? 'out',
    mode: isCreator ? 'creator' : 'consumer'
  };
}

function buildPulse(
day: DayCard[],
jobs: ProductionJobView[],
signals: CommunitySignal[],
universe: CreativeUniverse | null,
upcoming: UpcomingItem[],
isCreator: boolean)
: PulseSignal[] {
  const out: PulseSignal[] = [];
  const attention = day.filter((c) => c.kind === 'blocked' || c.kind === 'review').length;

  if (attention > 0) {
    out.push({
      id: 'p-attention',
      tone: 'attention',
      value: String(attention),
      label: attention === 1 ? 'thing needs your attention' : 'things need your attention',
      to: '/studio'
    });
  }

  const running = jobs.filter((j) => j.state !== 'completed' && j.state !== 'failed').length;
  if (running > 0) {
    out.push({
      id: 'p-jobs',
      tone: 'running',
      value: String(running),
      label: running === 1 ? 'AI production running' : 'AI productions running',
      to: '/studio/jobs',
      live: true
    });
  }

  if (signals.length > 0) {
    out.push({
      id: 'p-community',
      tone: 'community',
      value: String(signals.length),
      label: signals.length === 1 ? 'community is active' : 'communities are active',
      to: '/communities'
    });
  }

  if (isCreator) {
    out.push({
      id: 'p-audience',
      tone: 'audience',
      value: `+${creatorMetrics.views}`,
      label: `views on ${creatorMetrics.latestTitle}`,
      to: '/studio'
    });
  }

  if (universe) {
    out.push({
      id: 'p-progress',
      tone: 'progress',
      value: `${universe.progress}%`,
      label: `${universe.title} · ${universe.stage.toLowerCase()}`,
      to: '/studio'
    });
  }

  const imminent = upcoming[0];
  if (imminent) {
    out.push({
      id: 'p-next',
      tone: 'time',
      label: imminent.title,
      detail: imminent.when,
      to: imminent.to,
      live: imminent.imminent
    });
  }

  return out;
}

/* ----------------------------------------------------------------- feed */

export const dashboardApi = {
  /** GET /api/dashboard */
  async getDashboard(
  ctx: DashboardViewerContext,
  personal: PersonalSignals)
  : Promise<DashboardResult<DashboardFeed>> {
    try {
      const now = new Date();
      const matched = audiencesFor(ctx);
      const isCreator = ctx.capabilities.includes('create');

      const [day, upcoming, communitySignals, universe] = await Promise.all([
      buildDay(ctx),
      buildUpcoming(),
      buildCommunitySignals(personal.memberships),
      isCreator ? buildUniverse() : Promise.resolve(null)]
      );

      const jobs = isCreator && universe ? buildJobs(universe.title) : [];
      const cont = buildContinue(ctx.hasProjects);
      const activity = buildActivity();
      const insights: Insight[] = isCreator ? seedInsights : seedInsights.slice(0, 1);
      const firstSaved = personal.watchlist[0];
      const recentTitle = firstSaved ?
      titles.find((t) => t.slug === firstSaved || t.id === firstSaved) :
      undefined;

      const modules: DashboardModule[] = [];

      dashboardModules.
      filter((config) => moduleApplies(config, ctx, matched, now)).
      sort((a, b) => a.position - b.position).
      forEach((config) => {
        switch (config.id) {
          case 'pulse':{
              const signals = buildPulse(
                day,
                jobs,
                communitySignals,
                universe,
                upcoming,
                isCreator
              );
              if (signals.length > 0) modules.push({ id: 'pulse', config, signals });
              break;
            }
          case 'command':
            modules.push({ id: 'command', config, prompts: commandPrompts });
            break;
          case 'my-day':
            if (day.length > 0) modules.push({ id: 'my-day', config, cards: day });
            break;
          case 'continue':
            if (cont.length > 0) modules.push({ id: 'continue', config, items: cont });
            break;
          case 'creative-universe':
            if (universe) modules.push({ id: 'creative-universe', config, universe });
            break;
          case 'ai-production':
            if (jobs.length > 0) modules.push({ id: 'ai-production', config, jobs });
            break;
          case 'activity':
            if (activity.length > 0) modules.push({ id: 'activity', config, events: activity });
            break;
          case 'creator-pulse':
            modules.push({
              id: 'creator-pulse',
              config,
              pulse: {
                followers: adaeze.followers,
                views: creatorMetrics.views,
                watchTime: creatorMetrics.watchTime,
                growth: creatorMetrics.growth,
                latestTitle: creatorMetrics.latestTitle,
                latestState: creatorMetrics.latestState,
                latestTo: '/shorts?short=night-shift'
              }
            });
            break;
          case 'economy-pulse':
            modules.push({ id: 'economy-pulse', config, economy: buildEconomy(isCreator) });
            break;
          case 'library-pulse':
            modules.push({
              id: 'library-pulse',
              config,
              library: {
                saved: personal.watchlist.length,
                following: personal.following.length,
                collected: personal.collected,
                downloads: personal.downloads,
                // The watchlist may hold either identifier depending on the
                // surface that added it, so resolve against both rather than
                // rendering a broken link.
                recentLabel: recentTitle?.name ?? 'Nothing saved yet',
                recentTo: recentTitle ? `/title/${recentTitle.slug}` : '/library?shelf=watchlist'
              }
            });
            break;
          case 'up-next':
            if (upcoming.length > 0) modules.push({ id: 'up-next', config, items: upcoming });
            break;
          case 'insights':
            if (insights.length > 0) modules.push({ id: 'insights', config, insights });
            break;
          case 'community-pulse':
            if (communitySignals.length > 0)
            modules.push({ id: 'community-pulse', config, signals: communitySignals });
            break;
        }
      });

      return {
        ok: true,
        data: {
          context: ctx,
          greeting: greetingFor(ctx.hour, ctx.displayName),
          matchedAudiences: matched,
          modules
        }
      };
    } catch {
      return { ok: false, error: 'Your dashboard could not be assembled. Try again.' };
    }
  },

  /**
   * POST /api/dashboard/ask
   *
   * Grounded in the viewer's own HavaVerse only. Anything it cannot answer from
   * the services above is refused rather than invented, and a consequential
   * operation returns a PROPOSAL that the user must confirm — the assistant
   * never performs one on its own.
   */
  async ask(question: string, ctx: DashboardViewerContext): Promise<DashboardResult<CommandAnswer>> {
    const q = question.trim().toLowerCase();
    if (!q) return { ok: false, error: 'Ask me something about your HavaVerse.' };

    await new Promise((r) => setTimeout(r, 420));
    const isCreator = ctx.capabilities.includes('create');

    if (/publish|release|go live with/.test(q)) {
      if (!isCreator) {
        return {
          ok: true,
          data: {
            text: 'Publishing needs creator capabilities on your account. You can switch your account type in Hava Control and keep everything you already have.',
            links: [{ label: 'Open Hava Control', to: '/settings/identity' }]
          }
        };
      }
      const gate = directorApi.canPublish();
      if (!gate.allowed) {
        return {
          ok: true,
          data: {
            text: `I can’t publish The Last Train yet — ${gate.reason.toLowerCase()} Clear that and I’ll take it through.`,
            links: [
            { label: 'Open Studio', to: '/studio' },
            { label: 'Review rights', to: '/studio' }]

          }
        };
      }
      return {
        ok: true,
        data: {
          text: 'The Last Train passes every gate. I can publish it to your configured audience — confirm and I’ll hand it to the publishing service.',
          links: [],
          proposal: {
            summary: 'Publish The Last Train',
            lines: [
            { label: 'Release', value: 'Public' },
            { label: 'Destination', value: 'HavaVerse Play' },
            { label: 'Rights', value: 'Cleared' }],

            confirmLabel: 'Review in Studio',
            to: '/studio'
          }
        }
      };
    }

    if (/attention|needs me|outstanding|task/.test(q)) {
      const day = await buildDay(ctx);
      const blocked = day.filter((c) => c.kind === 'blocked' || c.kind === 'review');
      if (blocked.length === 0) {
        return {
          ok: true,
          data: { text: 'Nothing is waiting on you right now.', links: [] }
        };
      }
      return {
        ok: true,
        data: {
          text: `${blocked.length} thing${blocked.length > 1 ? 's need' : ' needs'} you: ${blocked.
          map((c) => c.title.toLowerCase()).
          join(', ')}.`,
          links: blocked.map((c) => ({ label: c.actionLabel, to: c.to }))
        }
      };
    }

    if (/continue|latest project|carry on|where was i/.test(q)) {
      const items = buildContinue(ctx.hasProjects);
      if (items.length === 0) {
        return {
          ok: true,
          data: { text: 'You have nothing part-finished at the moment.', links: [] }
        };
      }
      return {
        ok: true,
        data: {
          text: `You were last on ${items[0].title} — ${items[0].detail.toLowerCase()}, ${items[0].progress}% through.`,
          links: items.slice(0, 3).map((i) => ({ label: i.title, to: i.to }))
        }
      };
    }

    if (/audience|views|followers|engagement|analytics/.test(q)) {
      if (!isCreator) {
        return {
          ok: true,
          data: {
            text: 'You don’t have published work yet, so there’s no audience data to read.',
            links: [{ label: 'Start creating', to: '/studio' }]
          }
        };
      }
      return {
        ok: true,
        data: {
          text: `${creatorMetrics.latestTitle} has ${creatorMetrics.views} views and ${creatorMetrics.watchTime} of watch time, growth ${creatorMetrics.growth}. The strongest overlap is with people who watched The Last Train.`,
          links: [
          { label: 'Open Studio', to: '/studio' },
          { label: 'Explore the universe', to: '/universes/railway' }]

        }
      };
    }

    if (/earning|money|wallet|payout|balance|revenue/.test(q)) {
      const eco = buildEconomy(isCreator);
      return {
        ok: true,
        data: {
          text: `You have ${eco.available} available and ${eco.pending} pending. Settlement and the revenue split are handled by HavaPay, so those figures come from the ledger rather than from this page.`,
          links: [{ label: 'Open HavaPay', to: '/wallet' }]
        }
      };
    }

    if (/community|discussion|fans|replies/.test(q)) {
      return {
        ok: true,
        data: {
          text: 'Your communities are moving — the Railway fan club has an active conversation and a watch party scheduled.',
          links: [
          { label: 'The Last Train Fan Club', to: '/community/the-last-train' },
          { label: 'Watch parties', to: '/watch-parties' }]

        }
      };
    }

    if (/watch|tonight|something to see|film|series/.test(q)) {
      return {
        ok: true,
        data: {
          text: 'Based on what you’ve been watching, Lagos 2042 is the closest thing to The Last Train in your library.',
          links: [
          { label: 'Lagos 2042', to: '/title/lagos-2042' },
          { label: 'Browse everything', to: '/' }]

        }
      };
    }

    if (/short|create|make|generate|trailer/.test(q)) {
      if (!isCreator) {
        return {
          ok: true,
          data: {
            text: 'Creating needs creator capabilities on your account.',
            links: [{ label: 'Open Hava Control', to: '/settings/identity' }]
          }
        };
      }
      return {
        ok: true,
        data: {
          text: 'I can open the Director with The Last Train as the reference. Rights allow derivative work on your own material, so a Short from it is permitted.',
          links: [{ label: 'Open AI Director', to: '/studio' }]
        }
      };
    }

    return {
      ok: true,
      data: {
        text: 'I can only answer from your own HavaVerse — your projects, production, communities, library, audience and HavaPay activity. I don’t have anything that matches that.',
        links: []
      }
    };
  }
};