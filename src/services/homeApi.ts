import type {
  ContinueItem,
  DismissReason,
  HavaAnswer,
  HeroSlide,
  HomeAudience,
  HomeFeed,
  HomeModule,
  HomeModuleConfig,
  HomeViewerContext,
  Recommendation } from
'../types/home';
import {
  availabilityBySlug,
  communityActivity,
  creatorActivity,
  experiences,
  homeModules,
  listenItems,
  marketItems,
  sportsItems,
  universes } from
'../data/home';
import { IMAGES, titles } from '../data/catalog';
import { getResume } from './watchApi';
import { releaseRegistry } from './releaseRegistry';
import { liveApi } from './liveApi';
import { liveReminders } from './liveReminders';
import type { LiveItem } from '../types/home';
import type { LiveEntry } from '../types/live';

/**
 * HOME API — the boundary between the homepage and the HavaVerse platform.
 *
 * Production routes this maps onto:
 *   GET    /api/home                      -> assembled feed for the caller
 *   POST   /api/home/recommendations/:id/dismiss
 *   DELETE /api/home/continue/:slug
 *   POST   /api/home/reminders
 *   POST   /api/home/ai/ask
 *   POST   /api/home/events               -> analytics
 *
 * Module selection, audience targeting, regional restriction, scheduling,
 * feature flags and recommendation strategy are all resolved SERVER-SIDE from
 * Control Room configuration. The client sends no targeting rules and trusts
 * nothing it computed itself. Rights are likewise evaluated server-side: the
 * feed never contains a playable destination the caller is not entitled to.
 */

type Result<T> = {ok: true;data: T;} | {ok: false;error: string;};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Session-scoped negative signal. Server-side this is a persisted preference. */
const dismissed = new Set<string>();
const removedFromContinue = new Set<string>();

function parseMinutes(runtime: string): number {
  const match = runtime.match(/(\d+)\s*min/);
  return match ? Number(match[1]) : 45;
}

function remainingLabel(runtime: string, progress: number): string {
  const total = parseMinutes(runtime);
  const left = Math.max(1, Math.round(total * (1 - progress / 100)));
  return `${left} min left`;
}

const reasons: Record<string, {short: string;detail: string;}> = {
  'lagos-2042': {
    short: 'Because you watched The Last Train',
    detail:
    'You finished 42% of The Last Train and you open African science fiction more than any other genre. Lagos 2042 shares its director of photography and its register.'
  },
  'the-kings-court': {
    short: 'Popular in your community',
    detail:
    'Members of the communities you have joined are watching this more than anything else this week.'
  },
  'rising-eagles': {
    short: 'Trending in Nigeria',
    detail:
    'Ranked first in your region today. You also follow the Super Eagles fixtures.'
  },
  animeverse: {
    short: 'Continue this universe',
    detail:
    'You are 66% through Animeverse. It sits in the same universe as the fan work you saved.'
  },
  'afro-beats-rising': {
    short: 'From a creator you follow',
    detail: 'Nneka Sound published this after you started following them.'
  },
  'the-last-train': {
    short: 'Hava AI recommends',
    detail:
    'Your highest-rated finished titles are thrillers under 100 minutes made in Nigeria. This is the closest unwatched match.'
  }
};

const strategyFor: Record<string, Recommendation['strategy']> = {
  'lagos-2042': 'because-you-watched',
  'the-kings-court': 'community-signal',
  'rising-eagles': 'regional-trending',
  animeverse: 'graph-adjacency',
  'afro-beats-rising': 'followed-creators',
  'the-last-train': 'editorial'
};

function availabilityFor(slug: string) {
  return availabilityBySlug[slug] ?? { state: 'available' as const };
}

/** Audience resolution. Server-side this reads the identity + behaviour store. */
function audiencesFor(ctx: HomeViewerContext): HomeAudience[] {
  const list: HomeAudience[] = [];
  if (!ctx.signedIn) list.push('anonymous');
  if (ctx.signedIn && !ctx.hasHistory) list.push('new');
  if (ctx.signedIn && ctx.hasHistory) list.push('returning');
  if (ctx.accountType === 'creator' || ctx.accountType === 'both') list.push('creator');
  if (ctx.followsSport) list.push('sports');
  if (ctx.inCommunities) list.push('community');
  if (ctx.listens) list.push('listener');
  return list;
}

function moduleApplies(
config: HomeModuleConfig,
ctx: HomeViewerContext,
matched: HomeAudience[],
now: Date)
: boolean {
  if (!config.enabled) return false;
  if (config.startsAt && now < new Date(config.startsAt)) return false;
  if (config.endsAt && now > new Date(config.endsAt)) return false;
  if (config.regions !== 'all' && !config.regions.includes(ctx.region)) return false;
  if (config.audience.length > 0 && !config.audience.some((a) => matched.includes(a)))
  return false;
  return true;
}

function buildHero(ctx: HomeViewerContext): HeroSlide[] {
  const slides: HeroSlide[] = [];

  const lastTrain = titles[0];
  if (ctx.signedIn && ctx.hasHistory && typeof lastTrain.progress === 'number') {
    slides.push({
      id: 'hero-continue',
      kind: 'continue',
      slug: lastTrain.slug,
      eyebrow: 'Continue watching',
      name: lastTrain.name,
      meta: [
      `★ ${lastTrain.rating.toFixed(1)}`,
      String(lastTrain.year),
      lastTrain.genre,
      lastTrain.runtime,
      lastTrain.maturity],

      logline: lastTrain.logline,
      backdrop: lastTrain.backdrop ?? lastTrain.poster,
      cta: { label: 'Resume · 32:41', to: `/watch/${lastTrain.slug}?t=1961` },
      secondary: { label: 'Explore title', to: `/title/${lastTrain.slug}` },
      availability: availabilityFor(lastTrain.slug),
      creator: lastTrain.creator,
      creatorHandle: lastTrain.creatorHandle,
      resumeAt: 1961
    });
  } else {
    slides.push({
      id: 'hero-welcome',
      kind: 'welcome',
      eyebrow: 'Welcome to HavaVerse',
      name: 'Your entertainment universe',
      meta: ['Films', 'Series', 'Live sport', 'Music', 'Communities'],
      logline:
      'Discover stories, creators, live experiences and whole worlds — then build your own with HavaVerse AI.',
      backdrop: IMAGES.heroLastTrain,
      cta: { label: 'Start exploring', to: '/browse/film' },
      secondary: { label: 'Create an account', to: '/register' },
      availability: { state: 'available' }
    });
  }

  if (ctx.followsSport) {
    slides.push({
      id: 'hero-live',
      kind: 'live',
      eyebrow: 'Live now',
      name: 'Arsenal vs Man City',
      meta: ['Premier League', "62'", '1 — 1', '184K watching'],
      logline:
      'Second half at the Emirates, level on the hour. Match centre carries the key events, statistics and the table.',
      backdrop: IMAGES.stadium,
      cta: { label: 'Watch live', to: '/sports' },
      secondary: { label: 'Match centre', to: '/sports' },
      availability: { state: 'available' }
    });
  }

  const lagos = titles[1];
  slides.push({
    id: 'hero-premiere',
    kind: 'premiere',
    slug: lagos.slug,
    eyebrow: 'HavaVerse Original · New release',
    name: lagos.name,
    meta: [
    `★ ${lagos.rating.toFixed(1)}`,
    String(lagos.year),
    lagos.genre,
    lagos.runtime,
    lagos.maturity],

    logline: lagos.logline,
    backdrop: lagos.poster,
    cta: { label: 'Watch now', to: `/watch/${lagos.slug}` },
    secondary: { label: 'Explore title', to: `/title/${lagos.slug}` },
    availability: availabilityFor(lagos.slug),
    creator: lagos.creator,
    creatorHandle: lagos.creatorHandle
  });

  const kings = titles[2];
  slides.push({
    id: 'hero-premium',
    kind: 'premiere',
    slug: kings.slug,
    eyebrow: 'Premium premiere',
    name: kings.name,
    meta: [`★ ${kings.rating.toFixed(1)}`, String(kings.year), kings.genre, kings.runtime],
    logline: kings.logline,
    backdrop: kings.poster,
    // Rights-aware: the CTA offers what the viewer can actually do.
    cta: { label: 'Unlock & watch', to: `/title/${kings.slug}` },
    secondary: { label: 'Explore title', to: `/title/${kings.slug}` },
    availability: availabilityFor(kings.slug),
    creator: kings.creator,
    creatorHandle: kings.creatorHandle
  });

  return slides;
}

function buildContinue(): ContinueItem[] {
  // Live playback wins over the seeded value, so what Home shows is what the
  // player actually recorded. A finished title drops out of the rail.
  return titles.
  map((t) => {
    const resume = getResume(t.slug);
    const progress = resume ? resume.completion : t.progress;
    return { title: t, progress };
  }).
  filter(({ progress }) => typeof progress === 'number' && progress > 0 && progress < 97).
  filter(({ title }) => !removedFromContinue.has(title.slug)).
  map(({ title: t, progress = 0 }) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    episode: t.kind === 'Series' ? 'S1 · E4' : t.kind === 'Anime' ? 'Episode 7' : undefined,
    poster: t.backdrop ?? t.poster,
    progress,
    remaining: remainingLabel(t.runtime, progress),
    kind: t.kind
  }));
}

function buildRecommendations(): Recommendation[] {
  // Public releases from Studio become eligible for discovery the moment their
  // publication job completes; they lead with an honest reason, not a score.
  const released: Recommendation[] = releaseRegistry.
  discoverableTitles().
  filter((t) => !dismissed.has(t.slug)).
  map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    poster: t.poster,
    meta: `${t.genre} · ${t.year}`,
    reason: {
      short: 'Just published',
      detail: `New from ${t.creator}, published from HavaVerse Studio. It has no viewing signal yet, so it is shown for being new rather than ranked.`
    },
    availability: { state: 'available' },
    strategy: 'editorial'
  }));

  return released.concat(titles.
  filter((t) => !dismissed.has(t.slug)).
  map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    poster: t.poster,
    meta: `${t.genre} · ${t.year}`,
    reason: reasons[t.slug] ?? {
      short: 'Hava AI recommends',
      detail: 'Selected from titles close to your viewing history in the content graph.'
    },
    availability: availabilityFor(t.slug),
    strategy: strategyFor[t.slug] ?? 'editorial'
  })));
}

const liveCategory: Record<LiveEntry['source'], LiveItem['category']> = {
  sports: 'Sports',
  concert: 'Music',
  podcast: 'Podcast',
  event: 'Community',
  'watch-party': 'Community',
  premiere: 'Premiere'
};

/**
 * Live Now is a slice of the Live service's schedule — what is live first,
 * then what starts next — so Home and /live always show the same thing.
 */
async function buildLiveNow(): Promise<LiveItem[]> {
  const result = await liveApi.list();
  if (!result.ok) return [];
  const ordered = [
  ...result.data.filter((e) => e.state === 'live'),
  ...result.data.filter((e) => e.state === 'upcoming')];

  return ordered.slice(0, 4).map((e) => ({
    id: e.id,
    name: e.title,
    category: e.source === 'event' && e.kindLabel === 'Creator Q&A' ? 'Creator' : liveCategory[e.source],
    meta: e.score ? `${e.kindLabel} · ${e.score.clock} · ${e.score.homeScore}–${e.score.awayScore}` : e.context,
    image: e.image,
    to: e.to,
    state: e.state,
    startsIn: e.state === 'upcoming' ? e.when : e.audience
  }));
}

async function getHomeFeed(ctx: HomeViewerContext): Promise<Result<HomeFeed>> {
  await delay(320);

  const matched = audiencesFor(ctx);
  const now = new Date();
  const liveNow = await buildLiveNow();

  const modules: HomeModule[] = homeModules.
  filter((config) => moduleApplies(config, ctx, matched, now)).
  sort((a, b) => a.position - b.position).
  map((config): HomeModule => {
    switch (config.id) {
      case 'hero':
        return { config, hero: buildHero(ctx) };
      case 'continue':
        return { config, continueItems: buildContinue() };
      case 'next':
        return {
          config,
          next: {
            headline: 'Pick The Last Train back up',
            body:
            'You stopped at 32:41, just before the station sequence. Thirty-four minutes remain, and the Railway Universe opens from there.',
            cta: { label: 'Resume · 32:41', to: '/watch/the-last-train?t=1961' },
            image: IMAGES.lastTrain
          }
        };
      case 'live':
        return { config, live: liveNow };
      case 'sports':
        return { config, sports: sportsItems };
      case 'foryou':
        return { config, recommendations: buildRecommendations() };
      case 'ai-creations':
        return {
          config,
          recommendations: buildRecommendations().filter((r) => {
            const t = releaseRegistry.titleBySlug(r.slug);
            return t?.aiAssisted;
          })
        };
      case 'creators':
        return { config, creators: creatorActivity };
      case 'communities':
        return { config, communities: communityActivity };
      case 'universes':
        return { config, universes };
      case 'listen':
        return { config, listen: listenItems };
      case 'market':
        return { config, market: marketItems };
      case 'experiences':
        return { config, experiences };
      default:
        return { config };
    }
  })
  // A module that resolved to nothing is not rendered as an empty shelf.
  .filter((m) => {
    if (m.config.id === 'continue') return (m.continueItems?.length ?? 0) > 0;
    if (m.config.id === 'foryou' || m.config.id === 'ai-creations')
    return (m.recommendations?.length ?? 0) > 0;
    return true;
  });

  return { ok: true, data: { context: ctx, modules, matchedAudiences: matched } };
}

async function dismissRecommendation(
slug: string,
reason: DismissReason)
: Promise<Result<string>> {
  await delay(180);
  dismissed.add(slug);
  const copy: Record<DismissReason, string> = {
    'this-title': 'We won’t suggest this title again',
    'this-creator': 'We’ll show less from this creator',
    'this-genre': 'We’ll show less of this genre',
    'already-watched': 'Marked as already watched',
    'not-relevant': 'Thanks — that helps'
  };
  return { ok: true, data: copy[reason] };
}

async function removeFromContinue(slug: string): Promise<Result<true>> {
  await delay(160);
  // Removes the resume marker only. The title itself is untouched.
  removedFromContinue.add(slug);
  return { ok: true, data: true };
}

/** Reminders go to the shared Live store, so Home, /live and Community agree. */
async function toggleReminder(id: string): Promise<Result<boolean>> {
  await delay(160);
  return { ok: true, data: liveReminders.toggle(id) };
}

const hasReminder = (id: string) => liveReminders.has(id);

/**
 * Hava AI on the homepage returns ACTIONS, not prose. Every option carries a
 * real destination. When the catalogue cannot answer, it says so rather than
 * inventing titles.
 */
async function askHava(prompt: string): Promise<Result<HavaAnswer>> {
  await delay(520);
  const q = prompt.toLowerCase().trim();
  if (!q) return { ok: false, error: 'Ask me something first.' };

  const has = (...words: string[]) => words.some((w) => q.includes(w));
  const option = (slug: string, cta = 'Watch') => {
    const t = titles.find((x) => x.slug === slug)!;
    return {
      id: t.id,
      name: t.name,
      meta: `${t.runtime} · ${t.genre}`,
      poster: t.poster,
      to: cta === 'Watch' ? `/watch/${t.slug}` : `/title/${t.slug}`,
      cta
    };
  };

  const minutes = q.match(/(\d{2,3})\s*(minutes|mins|min)/);
  if (minutes) {
    const budget = Number(minutes[1]);
    const fits = titles.filter(
      (t) => parseMinutes(t.runtime) <= budget && availabilityFor(t.slug).state === 'available'
    );
    if (fits.length === 0) {
      return {
        ok: true,
        data: {
          body: `Nothing you can watch right now fits inside ${budget} minutes. The shortest available title runs longer than that.`,
          options: []
        }
      };
    }
    return {
      ok: true,
      data: {
        body: `You have ${budget} minutes. ${fits.length} ${fits.length === 1 ? 'title fits' : 'titles fit'}, all playable in your region.`,
        options: fits.slice(0, 3).map((t) => option(t.slug))
      }
    };
  }

  if (has('football', 'sport', 'match', 'eagles', 'arsenal')) {
    return {
      ok: true,
      data: {
        body: "Arsenal vs Man City is live, 1–1 at 62'. Nigeria play Ghana tomorrow at 10:00 PM.",
        options: [
        {
          id: 'sports',
          name: 'Match centre',
          meta: 'Live scoreline, events, table',
          to: '/sports',
          cta: 'Open'
        }]

      }
    };
  }

  if (has('music', 'listen', 'drive', 'soundtrack', 'song')) {
    return {
      ok: true,
      data: {
        body: 'Lagos After Dark is the closest scene to a late-night drive, and the score from The Last Train sits inside it.',
        options: [
        {
          id: 'world',
          name: 'Lagos After Dark',
          meta: '48 artists · 126 tracks',
          to: '/music/world/lagos-after-dark',
          cta: 'Enter'
        }]

      }
    };
  }

  if (has('nigeria', 'nigerian', 'lagos', 'african', 'africa')) {
    return {
      ok: true,
      data: {
        body: 'Three Nigerian productions are available to you right now.',
        options: [
        option('lagos-2042'),
        option('the-last-train'),
        option('rising-eagles', 'Explore')]

      }
    };
  }

  if (has('sci-fi', 'science fiction', 'futur')) {
    return {
      ok: true,
      data: {
        body: 'Afrofuturist science fiction, both made in Nigeria.',
        options: [option('lagos-2042'), option('animeverse', 'Explore')]
      }
    };
  }

  if (has('community', 'discuss', 'people', 'fans')) {
    return {
      ok: true,
      data: {
        body: '4,182 people are discussing The Last Train right now, and a Lagos 2042 watch party starts in 18 minutes.',
        options: [
        {
          id: 'disc',
          name: 'The railway theory thread',
          meta: '8.4K replies',
          to: '/discussions/d1',
          cta: 'Open'
        },
        {
          id: 'party',
          name: 'Lagos 2042 rewatch',
          meta: 'Starts in 18 minutes',
          to: '/watch-parties',
          cta: 'Join'
        }]

      }
    };
  }

  if (has('wife', 'together', 'partner', 'family', 'kids')) {
    return {
      ok: true,
      data: {
        body: 'Rising Eagles is rated PG and runs two hours — the safest pick for watching together. Parental controls live in Family Space.',
        options: [option('rising-eagles')]
      }
    };
  }

  if (has('create', 'make', 'studio', 'film of my own')) {
    return {
      ok: true,
      data: {
        body: 'The AI Entertainment Director takes an idea through story, storyboard and shots.',
        options: [
        { id: 'studio', name: 'Open the Director', meta: 'Studio', to: '/studio', cta: 'Open' }]

      }
    };
  }

  return {
    ok: true,
    data: {
      body: 'I could not match that to anything in your catalogue, your communities or today’s live schedule. Try a runtime, a mood, a place or a genre — I only answer from what HavaVerse actually carries.',
      options: []
    }
  };
}

/** Meaningful interactions only — never fired on repaint. */
function track(event: string, payload?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  // Production: POST /api/home/events, batched, consent-gated.
  void event;
  void payload;
}

export const homeApi = {
  getHomeFeed,
  dismissRecommendation,
  removeFromContinue,
  toggleReminder,
  hasReminder,
  askHava,
  track
};