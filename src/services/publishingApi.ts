import {
  derivePublicationGate,
  exportDirectorState,
  transitionProject } from
'./directorApi';
import { projectsApi } from './projectsApi';
import { releaseRegistry } from './releaseRegistry';
import { notificationBus } from './notificationBus';
import { analytics } from './analytics';
import { readJSON, writeJSON } from '../utils/storage';
import { project as seedProject } from '../data/director';
import { bySlug } from '../data/catalog';
import type { ContentTitle } from '../types/content';
import type {
  PreflightCheck,
  PublishedRelease,
  PublishJob,
  PublishStep,
  PublishStepKey,
  ReleaseAudience,
  ReleaseMetadata } from
'../types/publishing';

/**
 * PUBLISHING SERVICE
 *
 * The routes this in-browser store stands in for:
 *
 *   POST  /api/studio/projects/:id/publish/preflight     → preflight   (no side effects)
 *   POST  /api/studio/projects/:id/publish               → submitPublish
 *   GET   /api/studio/publish-jobs/:id                   → getJob
 *   GET   /api/studio/projects/:id/releases              → listReleases
 *
 * SERVER AUTHORITY: the preflight a creator sees is advisory. `submitPublish`
 * re-runs every check at request time and refuses if anything fails — the
 * same rule a real server enforces, because a client can always be tampered
 * with. Trust & Safety review is a server step and is NEVER shown as passed
 * here; the job states that it was submitted.
 *
 * WHAT IS REAL: validation, the publication job, the published content entity,
 * the content-graph rebuild (Search reads the graph, so indexing follows),
 * the notification and the analytics events. WHAT IS A STAND-IN: packaging
 * (no media is encoded — there is no media pipeline) and recommendation
 * eligibility (recorded, not yet consumed by Home).
 */

export type ServiceResult<T> = {ok: true;data: T;} | {ok: false;error: string;};
const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });
const fail = <T,>(error: string): ServiceResult<T> => ({ ok: false, error });
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const JOBS_KEY = 'hv.publishing.v1.jobs';
const STEP_MS = 1100;

let jobs: PublishJob[] = readJSON<PublishJob[]>(JOBS_KEY, []);
let timer: number | null = null;
const listeners = new Set<() => void>();

let seq = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq += 1}`;

const slugify = (s: string) =>
s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled';

const regionLabel: Record<ReleaseAudience['regions'], string> = {
  worldwide: 'Worldwide',
  africa: 'Across Africa',
  nigeria: 'Nigeria only'
};

function persist() {
  writeJSON(JOBS_KEY, jobs.slice(0, 30));
  listeners.forEach((l) => l());
}

/* ------------------------------------------------------------- preflight */

export function preflight(metadata: ReleaseMetadata, audience: ReleaseAudience): PreflightCheck[] {
  const gate = derivePublicationGate();
  const fromGate = (key: 'rights' | 'continuity' | 'quality', fixTo: string): PreflightCheck => {
    const c = gate.conditions.find((x) => x.key === key)!;
    return { key, label: c.label.replace(' gate', ''), status: c.passed ? 'pass' : 'fail', detail: c.detail, issues: c.issues, fixTo };
  };

  const metaIssues: string[] = [];
  if (metadata.title.trim().length < 2) metaIssues.push('Add a title');
  if (metadata.logline.trim().length < 40) metaIssues.push('Write a logline of at least 40 characters');
  if (!metadata.genre) metaIssues.push('Choose a genre');
  if (!metadata.maturity) metaIssues.push('Set a maturity rating');
  if (metadata.languages.length === 0) metaIssues.push('Choose at least one audio language');

  const audienceIssues: string[] = [];
  if (audience.releaseAt !== 'now' && audience.releaseAt <= Date.now() + 5 * 60_000)
  audienceIssues.push('A premiere must be at least five minutes from now');

  return [
  fromGate('rights', '/studio'),
  fromGate('continuity', '/studio/continuity'),
  fromGate('quality', '/studio'),
  {
    key: 'metadata',
    label: 'Metadata',
    status: metaIssues.length === 0 ? 'pass' : 'fail',
    detail: metaIssues.length === 0 ? 'Title, logline, genre, rating and languages set' : `${metaIssues.length} missing`,
    issues: metaIssues
  },
  {
    key: 'audience',
    label: 'Audience & distribution',
    status: audienceIssues.length === 0 ? 'pass' : 'fail',
    detail: `${audience.visibility === 'public' ? 'Public' : 'Unlisted'} · ${regionLabel[audience.regions]} · ${
    audience.releaseAt === 'now' ? 'Release now' : 'Scheduled premiere'}`,

    issues: audienceIssues
  },
  {
    key: 'safety',
    label: 'Trust & Safety',
    status: 'server',
    detail: 'Reviewed by the Trust & Safety service when you submit',
    issues: []
  }];

}

/* ------------------------------------------------------------------ jobs */

const stepPlan: {key: PublishStepKey;label: string;detail: string;}[] = [
{ key: 'validating', label: 'Server validation', detail: 'Rights, continuity, quality and Trust & Safety re-checked' },
{ key: 'packaging', label: 'Packaging', detail: 'Approved cut assembled into a release manifest' },
{ key: 'registering', label: 'Published title created', detail: 'The content entity viewers will open' },
{ key: 'graph', label: 'Content graph', detail: 'Linked to its creator and connections' },
{ key: 'indexing', label: 'Search', detail: 'Findable by title, genre, creator and relationship' },
{ key: 'recommendations', label: 'Recommendations', detail: 'Marked eligible for discovery surfaces' },
{ key: 'notifying', label: 'Notifications', detail: 'Followers and you are told it is live' }];


function slugFor(projectId: string, title: string): string {
  const previous = releaseRegistry.forProject(projectId)[0];
  if (previous) return previous.slug;
  if (projectId === seedProject.id) return 'the-last-train';
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (releaseRegistry.slugTaken(slug, projectId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function submitPublish(
metadata: ReleaseMetadata,
audience: ReleaseAudience)
: Promise<ServiceResult<PublishJob>> {
  await delay(500);
  const project = exportDirectorState().project;
  if (jobs.some((j) => j.projectId === project.id && j.status === 'running'))
  return fail('A publication job for this project is already running.');

  // Server-side re-validation: the client's preflight is never trusted.
  const failed = preflight(metadata, audience).filter((c) => c.status === 'fail');
  if (failed.length > 0) return fail(`Publishing refused — ${failed.map((c) => `${c.label}: ${c.issues[0] ?? c.detail}`).join(' · ')}`);

  const slug = slugFor(project.id, metadata.title);
  const version = releaseRegistry.forProject(project.id).length + (bySlug(slug) ? 1 : 0) + 1;
  const job: PublishJob = {
    id: nextId('pub'),
    projectId: project.id,
    projectTitle: project.title,
    slug,
    version,
    metadata: { ...metadata, title: metadata.title.trim(), logline: metadata.logline.trim() },
    audience,
    steps: stepPlan.map((s, i) => ({ ...s, status: i === 0 ? 'running' : 'pending', at: i === 0 ? Date.now() : undefined })),
    status: 'running',
    startedAt: Date.now()
  };
  jobs = [job, ...jobs];
  persist();
  analytics.emit('publish_started', 'studio', `project:${project.id}`, { version, visibility: audience.visibility });
  ensureTicking();
  return ok(job);
}

function ensureTicking() {
  if (timer !== null || !jobs.some((j) => j.status === 'running')) return;
  timer = window.setInterval(tick, STEP_MS);
}

function tick() {
  const job = jobs.find((j) => j.status === 'running');
  if (!job) {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    return;
  }
  // After a reload the open project is restored before the job continues.
  projectsApi.hydrate();
  if (projectsApi.activeId() !== job.projectId) {
    finish(job, { ...job, status: 'failed', completedAt: Date.now(), error: 'The project was closed before publishing finished. Nothing was published.' });
    return;
  }
  const index = job.steps.findIndex((s) => s.status === 'running');
  const steps: PublishStep[] = job.steps.map((s) => ({ ...s }));
  const current = steps[index];

  if (current.key === 'validating') {
    const failed = preflight(job.metadata, job.audience).filter((c) => c.status === 'fail');
    if (failed.length > 0) {
      finish(job, { ...job, steps, status: 'failed', completedAt: Date.now(), error: `The project changed during validation — ${failed[0].label}: ${failed[0].issues[0] ?? failed[0].detail}` });
      return;
    }
  }
  current.status = 'done';
  current.at = Date.now();
  // The published entity exists from here on; the graph step links it next.
  if (current.key === 'registering') register(job);

  // Unlisted releases stay out of discovery; the job says so rather than pretend.
  const unlisted = job.audience.visibility === 'unlisted';
  for (const step of steps.slice(index + 1)) {
    if (unlisted && (step.key === 'indexing' || step.key === 'recommendations')) {
      step.status = 'skipped';
      step.detail = 'Unlisted — reachable by link only, kept out of Search and recommendations';
      continue;
    }
    step.status = 'running';
    step.at = Date.now();
    break;
  }

  const remaining = steps.some((s) => s.status === 'running' || s.status === 'pending');
  if (!remaining) {
    finish(job, { ...job, steps, status: 'completed', completedAt: Date.now() });
    return;
  }
  jobs = jobs.map((j) => j.id === job.id ? { ...job, steps } : j);
  persist();
}

function register(job: PublishJob) {
  const snapshot = exportDirectorState();
  const shots = snapshot.shots;
  const seconds = shots.reduce((n, s) => n + s.spec.durationSeconds, 0);
  const catalogued = bySlug(job.slug);
  const releaseAt = job.audience.releaseAt === 'now' ? Date.now() : job.audience.releaseAt;
  const title: ContentTitle = catalogued ?
  catalogued :
  {
    id: `rel-${job.slug}`,
    slug: job.slug,
    name: job.metadata.title,
    kind: 'Film',
    badge: 'New from Studio',
    genre: job.metadata.genre,
    runtime: `${Math.max(1, Math.round(seconds / 60))} min`,
    year: new Date(releaseAt).getFullYear(),
    rating: 0,
    maturity: job.metadata.maturity,
    poster: snapshot.project.poster,
    backdrop: snapshot.project.poster,
    logline: job.metadata.logline,
    creator: snapshot.project.owner,
    creatorHandle: `@${slugify(snapshot.project.owner).replace(/-/g, '')}`,
    languages: job.metadata.languages,
    aiAssisted: true
  };
  const release: PublishedRelease = {
    id: nextId('rel'),
    slug: job.slug,
    projectId: job.projectId,
    version: job.version,
    title,
    publishedAt: Date.now(),
    releaseAt,
    visibility: job.audience.visibility,
    regions: job.audience.regions,
    shotCount: shots.length,
    generationRecord: `${shots.length} shots generated under project ${job.projectId}, all human-approved before release`,
    catalogued: Boolean(catalogued)
  };
  releaseRegistry.register(release);
}

function finish(job: PublishJob, next: PublishJob) {
  jobs = jobs.map((j) => j.id === job.id ? next : j);
  persist();
  if (next.status !== 'completed') return;

  const release = releaseRegistry.forProject(job.projectId)[0];
  const scheduled = release ? release.releaseAt > Date.now() : false;
  // Guarded above: the project cannot change while a publish job runs.
  transitionProject('PUBLISHED', 'Distribution Agent', `Published v${job.version} to HavaVerse Play`);
  projectsApi.recordPublishedVersion(`Published v${job.version}`);
  projectsApi.setRelease({
    slug: job.slug,
    version: job.version,
    publishedAt: Date.now(),
    state: scheduled ? 'scheduled' : 'live'
  });
  projectsApi.autosave();
  notificationBus.deliver({
    kind: 'creator',
    title: scheduled ? `${job.metadata.title} is scheduled` : `${job.metadata.title} is live`,
    body: scheduled ?
    `Premieres ${new Date(release!.releaseAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.` :
    job.audience.visibility === 'public' ?
    'Published to HavaVerse Play — findable in Search now.' :
    'Published unlisted — only people with the link can open it.',
    to: `/title/${job.slug}`,
    image: release?.title.poster
  });
  analytics.emit('publish_completed', 'studio', `film:${job.slug}`, { version: job.version, visibility: job.audience.visibility });
}

// Only one project is open at a time; it may not change mid-publication.
projectsApi.registerSwitchGuard(() =>
jobs.some((j) => j.status === 'running') ?
'A publication job is running. Wait for it to finish before switching projects.' :
null
);

// Resume a job interrupted by a reload.
ensureTicking();

export const publishingApi = {
  preflight,
  submitPublish,
  latestJob: (projectId: string) => jobs.find((j) => j.projectId === projectId),
  listReleases: (projectId: string) => releaseRegistry.forProject(projectId),
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};