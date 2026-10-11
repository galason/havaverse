import type {
  DownloadRecord,
  Review,
  TitleCta,
  TitleExperience } from
'../types/title';
import type { ContentTitle } from '../types/content';
import { experienceFor } from '../data/titleHub';
import { watchApi } from './watchApi';
// Catalogue titles and titles published from Studio resolve the same way.
import { releaseRegistry, titleBySlug as bySlug } from './releaseRegistry';

/**
 * Title service boundary.
 *
 * Every function here maps to one production endpoint. The in-browser store
 * below exists so the prototype runs; replacing it with `fetch` against the
 * documented routes requires no change to any page or component.
 *
 *   GET    /api/titles/:slug                  → getTitle
 *   GET    /api/titles/:slug/cta              → resolveCta       (auth-aware)
 *   GET    /api/titles/:slug/reviews          → listReviews
 *   POST   /api/titles/:slug/reviews          → submitReview
 *   DELETE /api/titles/:slug/reviews/mine     → deleteReview
 *   POST   /api/titles/:slug/reviews/:id/helpful → markHelpful
 *   POST   /api/titles/:slug/downloads        → startDownload
 *   DELETE /api/titles/:slug/downloads        → removeDownload
 *   POST   /api/titles/:slug/notify           → notifyWhenAvailable
 *   POST   /api/titles/:slug/ask              → ask              (grounded)
 *
 * Ratings, availability and rights are computed server-side. The client must
 * never decide whether a viewer is entitled to something — it only renders
 * the decision the service returns.
 */

export type ServiceResult<T> = {ok: true;data: T;} | {ok: false;error: string;};

const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Store {
  ratings: Record<string, number>;
  reviews: Record<string, Review[]>;
  helpful: string[];
  downloads: Record<string, DownloadRecord>;
  notified: string[];
}

const store: Store = {
  ratings: {},
  reviews: {},
  helpful: [],
  downloads: {},
  notified: []
};

/* ------------------------------------------------------------------ title */

export async function getTitle(
slug: string)
: Promise<ServiceResult<{title: ContentTitle;experience: TitleExperience;}>> {
  await delay(260);
  const title = bySlug(slug);
  if (!title) return { ok: false, error: 'That title is no longer available on HavaVerse.' };
  const experience = withRelease(experienceFor(title), slug);
  const mine = store.reviews[slug] ?? [];
  return ok({
    title,
    experience: {
      ...experience,
      reviews: {
        ...experience.reviews,
        yourRating: store.ratings[slug] ?? null,
        reviews: [...mine, ...experience.reviews.reviews]
      }
    }
  });
}

/**
 * A title published from Studio carries its real generation record and
 * release state. A brand-new title has no audience yet, so it shows none
 * rather than borrowing another title's ratings, cast or extras.
 */
function withRelease(experience: TitleExperience, slug: string): TitleExperience {
  const release = releaseRegistry.forSlug(slug);
  if (!release) return experience;
  const upcoming = release.releaseAt > Date.now();
  const provenance = experience.provenance.map((p) =>
  p.label === 'Generation record' ? { ...p, value: release.generationRecord } : p
  );
  const releaseDate = new Date(release.releaseAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const base: TitleExperience = {
    ...experience,
    releaseState: upcoming ? 'upcoming' : experience.releaseState === 'upcoming' ? 'released' : experience.releaseState,
    releaseDate,
    provenance: [...provenance, { label: 'Release', value: `v${release.version} · published from HavaVerse Studio`, detailed: true }],
    ownedByViewer: true
  };
  if (release.catalogued) return base;
  return {
    ...base,
    sections: base.sections.filter((s) => s !== 'characters' && s !== 'extras' && s !== 'soundtrack' && s !== 'universe'),
    characters: [],
    extras: [],
    universe: undefined,
    soundtrack: undefined,
    productionStatus: upcoming ? 'Premiere scheduled' : 'Published',
    community: { slug, name: release.title.name, fans: '0', discussing: '0', watching: '0', parties: 0, newSinceLastVisit: 0 },
    reviews: {
      ...base.reviews,
      hava: 0,
      community: 0,
      critics: 0,
      communityCount: 'No ratings yet',
      criticCount: 'No reviews yet',
      reviews: []
    }
  };
}

/* -------------------------------------------------------------------- cta */

/**
 * The primary call to action is derived, never authored. Release state,
 * entitlement and real playback position decide what the button says.
 */
export function resolveCta(
title: ContentTitle,
experience: TitleExperience,
signedIn: boolean)
: TitleCta {
  const to = `/watch/${title.slug}`;

  if (!experience.availability.available) {
    return {
      mode: 'blocked',
      label: 'Notify me when available',
      note: experience.availability.note
    };
  }
  if (experience.releaseState === 'live') {
    return { mode: 'live', label: 'Watch live', to, note: 'Streaming now' };
  }
  if (experience.releaseState === 'premiere') {
    return { mode: 'premiere', label: 'Join premiere', to, note: 'Premiere in progress' };
  }
  if (experience.releaseState === 'upcoming') {
    return { mode: 'notify', label: 'Notify me', note: `Arrives ${experience.releaseDate}` };
  }

  // Series resume the furthest-started episode rather than the film clock.
  if (experience.seasons.length > 0) {
    for (const season of experience.seasons) {
      const started = season.episodes.find((e) => typeof e.progress === 'number');
      if (started) {
        return {
          mode: 'continue',
          label: `Continue S${season.number}:E${started.number}`,
          to: `${to}?ep=${started.id}`,
          note: `${started.progress}% through ${started.name}`
        };
      }
    }
    const next = experience.seasons[0].episodes.find((e) => !e.watched);
    return {
      mode: next && experience.seasons[0].episodes.some((e) => e.watched) ? 'continue' : 'watch',
      label: next ?
      `${experience.seasons[0].episodes.some((e) => e.watched) ? 'Continue' : 'Play'} S1:E${next.number}` :
      'Watch again',
      to: `${to}?ep=${next?.id ?? ''}`
    };
  }

  const resume = signedIn ? watchApi.getResume(title.slug) : null;
  if (resume && resume.completion >= 95) {
    return { mode: 'again', label: 'Watch again', to, note: 'You finished this' };
  }
  if (resume && resume.positionSeconds > 30) {
    return {
      mode: 'resume',
      label: `Resume — ${clock(resume.positionSeconds)}`,
      to: `${to}?t=${Math.floor(resume.positionSeconds)}`,
      note: `${resume.completion}% watched on ${resume.device}`
    };
  }
  return { mode: 'watch', label: 'Watch now', to };
}

export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/* ---------------------------------------------------------------- reviews */

export async function submitReview(
slug: string,
rating: number,
body: string,
spoiler: boolean)
: Promise<ServiceResult<Review>> {
  await delay(520);
  if (rating < 1 || rating > 10) return { ok: false, error: 'Choose a rating from 1 to 10.' };
  if (body.trim().length < 12) {
    return { ok: false, error: 'Add a little more to your review before posting.' };
  }
  const review: Review = {
    id: `mine-${slug}`,
    author: 'You',
    avatar: "/a5a337e4-e160-4f17-9a1a-72ef9e489fb4.jpg",

    rating,
    body: body.trim(),
    postedAt: 'just now',
    helpful: 0,
    spoiler,
    source: 'community',
    mine: true
  };
  store.ratings[slug] = rating;
  store.reviews[slug] = [review];
  return ok(review);
}

export async function deleteReview(slug: string): Promise<ServiceResult<null>> {
  await delay(320);
  delete store.reviews[slug];
  delete store.ratings[slug];
  return ok(null);
}

export async function markHelpful(id: string): Promise<ServiceResult<boolean>> {
  await delay(200);
  const on = store.helpful.includes(id);
  store.helpful = on ? store.helpful.filter((x) => x !== id) : [...store.helpful, id];
  return ok(!on);
}

export function isHelpful(id: string): boolean {
  return store.helpful.includes(id);
}

/* -------------------------------------------------------------- downloads */

export function downloadFor(slug: string): DownloadRecord | null {
  return store.downloads[slug] ?? null;
}

/**
 * Progress is simulated locally; in production the client polls the download
 * service, which enforces the licence window and device limit.
 */
export async function startDownload(
slug: string,
quality: string,
onProgress: (record: DownloadRecord) => void)
: Promise<ServiceResult<DownloadRecord>> {
  const title = bySlug(slug);
  if (!title) return { ok: false, error: 'That title is no longer available.' };
  const experience = experienceFor(title);
  if (!experience.downloadable) {
    return { ok: false, error: 'Downloads are not available for this title in your region.' };
  }

  let record: DownloadRecord = { slug, quality, state: 'preparing', progress: 0 };
  store.downloads[slug] = record;
  onProgress(record);
  await delay(700);

  for (let p = 8; p <= 100; p += 11) {
    record = { slug, quality, state: 'downloading', progress: Math.min(100, p) };
    store.downloads[slug] = record;
    onProgress(record);
    await delay(320);
  }

  record = { slug, quality, state: 'downloaded', progress: 100 };
  store.downloads[slug] = record;
  onProgress(record);
  return ok(record);
}

export function listDownloads(): DownloadRecord[] {
  return Object.values(store.downloads);
}

export async function removeDownload(slug: string): Promise<ServiceResult<null>> {
  await delay(240);
  delete store.downloads[slug];
  return ok(null);
}

/* ----------------------------------------------------------------- notify */

export async function notifyWhenAvailable(slug: string): Promise<ServiceResult<boolean>> {
  await delay(420);
  const on = store.notified.includes(slug);
  store.notified = on ? store.notified.filter((s) => s !== slug) : [...store.notified, slug];
  return ok(!on);
}

export function isNotified(slug: string): boolean {
  return store.notified.includes(slug);
}

/* --------------------------------------------------------------- title ai */

export interface TitleAnswer {
  body: string;
  /** Where the answer came from — never invented. */
  citations: {label: string;to?: string;}[];
  /** True when the answer would give away story the viewer hasn't reached. */
  spoiler: boolean;
}

/**
 * Answers strictly from the title record. When the record does not cover the
 * question, the service says so rather than inventing canon.
 */
export async function ask(
slug: string,
question: string,
spoilerMode: 'free' | 'full')
: Promise<ServiceResult<TitleAnswer>> {
  await delay(620);
  const title = bySlug(slug);
  if (!title) return { ok: false, error: 'That title is no longer available.' };
  const x = experienceFor(title);
  const q = question.toLowerCase();

  const has = (...words: string[]) => words.some((w) => q.includes(w));

  if (has('ending', 'how does it end', 'what happens at the end')) {
    if (spoilerMode === 'free') {
      return ok({
        body: 'That answer gives away the final act. Switch to Full story mode and ask again, and I will explain it.',
        citations: [],
        spoiler: true
      });
    }
    return ok({
      body: `${title.name} resolves by making the conspiracy legal rather than secret — Amara succeeds in exposing the night freight and discovers that exposure changes nothing, because the lease was signed in public. The final scene returns her to the signal box she started in.`,
      citations: [
      { label: 'Amara', to: '/characters/amara' },
      { label: 'Discussion: Who actually knew about the railway?', to: '/discussions/d1' }],

      spoiler: true
    });
  }

  if (has('teenager', 'suitable', 'kids', 'children', 'age', 'rating')) {
    return ok({
      body: `${title.name} is rated ${title.maturity}. Advisories on file: ${x.advisories.join(', ').toLowerCase()}. Parental controls for younger profiles are set in Family Space.`,
      citations: [{ label: 'Family space', to: '/settings/family' }],
      spoiler: false
    });
  }

  if (has('character', 'who is in', 'cast', 'amara', 'daniel')) {
    return ok({
      body: `The story centres on ${x.characters.
      filter((c) => !c.spoiler).
      map((c) => `${c.name} (${c.role.split(' · ')[0].toLowerCase()})`).
      join(', ')}. Open any of them to see appearances and relationships.`,
      citations: x.characters.
      filter((c) => !c.spoiler && c.to).
      map((c) => ({ label: c.name, to: c.to })),
      spoiler: false
    });
  }

  if (has('language', 'subtitle', 'dub', 'audio')) {
    return ok({
      body: `Audio is available in ${x.audio.join(' and ')}. Subtitles: ${x.subtitles.join(', ')}. Your default languages are set in Hava Control.`,
      citations: [{ label: 'Language & region', to: '/settings/region' }],
      spoiler: false
    });
  }

  if (has('long', 'runtime', 'how many minutes', 'duration')) {
    return ok({
      body: `${title.name} runs ${title.runtime}${x.seasons.length ? ` across ${x.seasons.length} seasons` : ''}.`,
      citations: [],
      spoiler: false
    });
  }

  if (has('creator', 'director', 'who made', 'studio')) {
    return ok({
      body: `${x.creator.name} is an ${x.creator.kind.toLowerCase()} based in ${x.creator.location}, working in ${x.creator.languages.join(' and ')}. This title is an ${x.aiProduction.toLowerCase()} production.`,
      citations: [{ label: x.creator.name, to: `/creator/${title.creatorHandle.replace('@', '')}` }],
      spoiler: false
    });
  }

  if (has('why might i', 'why would i', 'should i watch', 'recommend', 'like it')) {
    return ok({
      body: `${x.recommendations[0].why} If that holds, ${title.name} sits squarely in it: ${title.genre.toLowerCase()}, ${title.runtime}, ${x.themes.slice(0, 2).join(' and ').toLowerCase()}.`,
      citations: [],
      spoiler: false
    });
  }

  if (has('next', 'what should i watch')) {
    return ok({
      body: `Based on the content graph, the closest continuation is the rest of the ${x.universe?.name ?? 'creator’s catalogue'}.`,
      citations: x.universe ?
      [{ label: x.universe.name, to: x.universe.to }] :
      [{ label: 'Browse films', to: '/browse/films' }],
      spoiler: false
    });
  }

  if (has('about', 'summary', 'what is this', 'plot', 'synopsis')) {
    return ok({
      body: x.synopsis,
      citations: [{ label: 'Overview', to: `/title/${slug}` }],
      spoiler: false
    });
  }

  if (has('true story', 'based on')) {
    return ok({
      body: `${title.name} is an original work of fiction. The record holds no adaptation or source-material credit.`,
      citations: [],
      spoiler: false
    });
  }

  return ok({
    body: `The record for ${title.name} doesn’t cover that. I only answer from this title’s credits, metadata, characters and community — I won’t invent canon.`,
    citations: [],
    spoiler: false
  });
}

export const titleApi = {
  listDownloads,
  getTitle,
  resolveCta,
  submitReview,
  deleteReview,
  markHelpful,
  isHelpful,
  downloadFor,
  startDownload,
  removeDownload,
  notifyWhenAvailable,
  isNotified,
  ask
};