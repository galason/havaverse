import {
  blankDirectorState,
  exportDirectorState,
  importDirectorState,
  runningJobCount,
  type DirectorSnapshot } from
'./directorApi';
import {
  blankContinuityState,
  exportContinuityState,
  importContinuityState,
  type ContinuitySnapshot } from
'./continuityApi';
import { blankFilmState, exportFilmState, importFilmState, type FilmStateSnapshot } from './filmStateApi';
import { analytics } from './analytics';
import { readJSON, writeJSON } from '../utils/storage';
import { project as seedProject } from '../data/director';
import { PROJECT_PLACEHOLDER_POSTER } from '../data/studioProjects';
import type {
  NewProjectForm,
  ProjectComparisonRow,
  ProjectCounts,
  ProjectReleaseRef,
  ProjectVersion,
  ProjectVersionKind,
  StudioProjectSummary } from
'../types/studioProject';

/**
 * STUDIO PROJECTS SERVICE
 *
 * The routes this in-browser store stands in for:
 *
 *   GET    /api/studio/projects                          → listProjects
 *   POST   /api/studio/projects                          → createProject
 *   POST   /api/studio/projects/:id/open                 → switchProject
 *   POST   /api/studio/projects/:id/duplicate            → duplicateProject
 *   POST   /api/studio/projects/:id/archive              → archiveProject
 *   POST   /api/studio/projects/:id/unarchive            → unarchiveProject
 *   PUT    /api/studio/projects/:id/working-copy         → autosave
 *   GET    /api/studio/projects/:id/versions             → listVersions
 *   POST   /api/studio/projects/:id/versions             → saveVersion
 *   POST   /api/studio/versions/:id/restore              → restoreVersion
 *   GET    /api/studio/versions/:id/compare              → compareVersion
 *
 * On the server every project has its own working copy and versions are
 * immutable rows. Here, working copies and version snapshots are kept on this
 * device; the production engine holds whichever project is open. Swapping
 * projects is therefore save-current → load-target, never a merge.
 */

export type ServiceResult<T> = {ok: true;data: T;} | {ok: false;error: string;};
const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });
const fail = <T,>(error: string): ServiceResult<T> => ({ ok: false, error });
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface ProductionSnapshot {
  director: DirectorSnapshot;
  continuity: ContinuitySnapshot;
  filmState: FilmStateSnapshot;
}

const KEYS = {
  registry: 'hv.studio.v1.projects',
  active: 'hv.studio.v1.active',
  working: (id: string) => `hv.studio.v1.working.${id}`,
  versions: (id: string) => `hv.studio.v1.versions.${id}`,
  snapshot: (versionId: string) => `hv.studio.v1.snapshot.${versionId}`
};

const MAX_VERSIONS = 20;

let seq = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq += 1}`;

const state = {
  hydrated: false,
  registry: [] as StudioProjectSummary[],
  activeId: seedProject.id
};

/* ---------------------------------------------------------------- helpers */

function capture(): ProductionSnapshot {
  return { director: exportDirectorState(), continuity: exportContinuityState(), filmState: exportFilmState() };
}

function apply(snapshot: ProductionSnapshot) {
  importDirectorState(snapshot.director);
  importContinuityState(snapshot.continuity);
  importFilmState(snapshot.filmState);
}

function countsOf(s: ProductionSnapshot): ProjectCounts {
  return {
    bibleEntries: s.director.bible.length,
    characters: s.director.characters.length || s.director.bible.filter((e) => e.section === 'character').length,
    scenes: s.director.scenes.length,
    shots: s.director.shots.length,
    approvedShots: s.director.shots.filter((x) => x.status === 'approved').length
  };
}

function persistRegistry() {
  writeJSON(KEYS.registry, state.registry);
  writeJSON(KEYS.active, state.activeId);
}

function summaryFrom(s: ProductionSnapshot, base: Partial<StudioProjectSummary>): StudioProjectSummary {
  const p = s.director.project;
  return {
    id: p.id,
    title: p.title,
    format: p.format,
    logline: p.logline,
    poster: p.poster,
    owner: p.owner,
    stage: p.state,
    status: base.status ?? 'active',
    origin: base.origin ?? { kind: 'blank' },
    createdAt: base.createdAt ?? Date.now(),
    updatedAt: Date.now(),
    counts: countsOf(s),
    release: base.release
  };
}

function snapshotFor(id: string): ProductionSnapshot | null {
  if (id === state.activeId) return capture();
  return readJSON<ProductionSnapshot | null>(KEYS.working(id), null);
}

function versionsOf(id: string): ProjectVersion[] {
  return readJSON<ProjectVersion[]>(KEYS.versions(id), []);
}

function writeVersion(
id: string,
snapshot: ProductionSnapshot,
kind: ProjectVersionKind,
name: string,
note?: string)
: ProjectVersion {
  const existing = versionsOf(id);
  const version: ProjectVersion = {
    id: nextId('pv'),
    projectId: id,
    n: (existing[0]?.n ?? 0) + 1,
    name,
    note,
    kind,
    createdAt: Date.now(),
    createdBy: snapshot.director.project.owner,
    counts: countsOf(snapshot)
  };
  const kept = [version, ...existing];
  // Oldest restore points go first; named and published versions are kept longest.
  while (kept.length > MAX_VERSIONS) {
    const dropAt = kept.map((v) => v.kind).lastIndexOf('restore-point');
    const [dropped] = kept.splice(dropAt >= 0 ? dropAt : kept.length - 1, 1);
    window.localStorage?.removeItem(KEYS.snapshot(dropped.id));
  }
  writeJSON(KEYS.snapshot(version.id), snapshot);
  writeJSON(KEYS.versions(id), kept);
  return version;
}

/**
 * Opens the last-used project on first use. The seed production is always
 * present so a fresh device starts where the demo does.
 */
function hydrate() {
  if (state.hydrated) return;
  state.hydrated = true;
  state.registry = readJSON<StudioProjectSummary[]>(KEYS.registry, []);
  if (!state.registry.some((p) => p.id === seedProject.id)) {
    state.registry.unshift(summaryFrom(capture(), { origin: { kind: 'seed' }, createdAt: Date.now() - 86_400_000 * 40 }));
  }
  const storedActive = readJSON<string>(KEYS.active, seedProject.id);
  const target = state.registry.find((p) => p.id === storedActive && p.status === 'active');
  state.activeId = seedProject.id;
  const working = target ? readJSON<ProductionSnapshot | null>(KEYS.working(target.id), null) : null;
  if (target && working) {
    apply(working);
    state.activeId = target.id;
  } else {
    // The seed may have its own saved working copy from an earlier visit.
    const seedWorking = readJSON<ProductionSnapshot | null>(KEYS.working(seedProject.id), null);
    if (seedWorking) apply(seedWorking);
  }
  persistRegistry();
}

function updateSummary(id: string, patch: Partial<StudioProjectSummary>) {
  state.registry = state.registry.map((p) => p.id === id ? { ...p, ...patch } : p);
  persistRegistry();
}

function uniqueTitle(title: string): string {
  const taken = new Set(state.registry.map((p) => p.title.toLowerCase()));
  if (!taken.has(title.toLowerCase())) return title;
  let n = 2;
  while (taken.has(`${title} (${n})`.toLowerCase())) n += 1;
  return `${title} (${n})`;
}

/* -------------------------------------------------------------- mutations */

/** Writes the open project's working copy. Called after every engine change. */
function autosave() {
  hydrate();
  const snapshot = capture();
  writeJSON(KEYS.working(state.activeId), snapshot);
  const current = state.registry.find((p) => p.id === state.activeId);
  if (current) {
    const next = summaryFrom(snapshot, current);
    state.registry = state.registry.map((p) => p.id === current.id ? next : p);
    persistRegistry();
  }
}

async function listProjects(): Promise<ServiceResult<StudioProjectSummary[]>> {
  hydrate();
  await delay(220);
  autosave();
  return ok([...state.registry].sort((a, b) => b.updatedAt - a.updatedAt));
}

/** Other services (publishing) that must finish before the open project changes. */
const switchGuards: (() => string | null)[] = [];

function guardSwitch(): string | null {
  for (const guard of switchGuards) {
    const reason = guard();
    if (reason) return reason;
  }
  const running = runningJobCount();
  return running > 0 ?
  `${running} generation ${running === 1 ? 'job is' : 'jobs are'} still running. Let ${running === 1 ? 'it' : 'them'} finish or cancel before leaving this project.` :
  null;
}

async function createProject(form: NewProjectForm): Promise<ServiceResult<StudioProjectSummary>> {
  hydrate();
  await delay(600);
  const title = form.title.trim();
  if (title.length < 2) return fail('Give the project a working title.');
  if (form.logline.trim().length < 20) return fail('Write a logline of at least a sentence — it seeds the Story Bible.');
  const blocked = guardSwitch();
  if (blocked) return fail(blocked);

  autosave();
  const id = nextId('proj');
  const owner = exportDirectorState().project.owner;
  const snapshot: ProductionSnapshot = {
    director: blankDirectorState({
      id,
      title: uniqueTitle(title),
      format: form.format,
      logline: form.logline.trim(),
      genre: form.genre,
      setting: form.setting,
      characters: form.characters.filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim(), note: c.note.trim() })),
      poster: PROJECT_PLACEHOLDER_POSTER,
      owner
    }),
    continuity: blankContinuityState(),
    filmState: blankFilmState(owner)
  };
  apply(snapshot);
  const summary = summaryFrom(snapshot, { origin: { kind: 'blank' } });
  state.registry = [summary, ...state.registry];
  state.activeId = id;
  writeJSON(KEYS.working(id), snapshot);
  persistRegistry();
  analytics.emit('studio_project_created', 'studio', id, { origin: 'blank', format: form.format });
  return ok(summary);
}

async function switchProject(id: string): Promise<ServiceResult<StudioProjectSummary>> {
  hydrate();
  await delay(350);
  if (id === state.activeId) {
    const current = state.registry.find((p) => p.id === id);
    return current ? ok(current) : fail('That project is not in your Studio.');
  }
  const target = state.registry.find((p) => p.id === id);
  if (!target) return fail('That project is not in your Studio.');
  if (target.status === 'archived') return fail('Restore this project from the archive before opening it.');
  const blocked = guardSwitch();
  if (blocked) return fail(blocked);
  const working = readJSON<ProductionSnapshot | null>(KEYS.working(id), null);
  if (!working) return fail('This project’s working copy could not be found on this device.');

  autosave();
  apply(working);
  state.activeId = id;
  updateSummary(id, { updatedAt: Date.now() });
  return ok(state.registry.find((p) => p.id === id)!);
}

async function duplicateProject(id: string): Promise<ServiceResult<StudioProjectSummary>> {
  hydrate();
  await delay(500);
  const source = state.registry.find((p) => p.id === id);
  const snapshot = snapshotFor(id);
  if (!source || !snapshot) return fail('That project could not be copied.');

  const copyId = nextId('proj');
  const copy = structuredClone(snapshot);
  copy.director.project = {
    ...copy.director.project,
    id: copyId,
    title: uniqueTitle(`${source.title} (copy)`),
    transitions: [
    {
      id: nextId('tr'),
      from: copy.director.project.state,
      to: copy.director.project.state,
      at: new Date().toISOString(),
      by: copy.director.project.owner,
      reason: `Duplicated from ${source.title}`
    },
    ...copy.director.project.transitions]

  };
  // Job history and pending plans belong to the source project's timeline.
  copy.director.jobs = [];
  copy.director.plans = [];
  // A copy is unpublished until it is published in its own right.
  if (copy.director.project.state === 'PUBLISHED') copy.director.project.state = 'READY_TO_PUBLISH';

  const summary = summaryFrom(copy, { origin: { kind: 'duplicate', fromId: id, fromTitle: source.title } });
  writeJSON(KEYS.working(copyId), copy);
  state.registry = [summary, ...state.registry];
  persistRegistry();
  analytics.emit('studio_project_created', 'studio', copyId, { origin: 'duplicate', from: id });
  return ok(summary);
}

async function archiveProject(id: string): Promise<ServiceResult<StudioProjectSummary>> {
  hydrate();
  await delay(300);
  const target = state.registry.find((p) => p.id === id);
  if (!target) return fail('That project is not in your Studio.');
  if (id === state.activeId) return fail('Open another project first — the open project can’t be archived.');
  // Archiving hides the project; it never deletes it or its versions.
  updateSummary(id, { status: 'archived' });
  return ok(state.registry.find((p) => p.id === id)!);
}

async function unarchiveProject(id: string): Promise<ServiceResult<StudioProjectSummary>> {
  hydrate();
  await delay(300);
  if (!state.registry.some((p) => p.id === id)) return fail('That project is not in your Studio.');
  updateSummary(id, { status: 'active', updatedAt: Date.now() });
  return ok(state.registry.find((p) => p.id === id)!);
}

async function listVersions(id: string): Promise<ServiceResult<ProjectVersion[]>> {
  hydrate();
  await delay(200);
  return ok(versionsOf(id));
}

async function saveVersion(name: string, note?: string): Promise<ServiceResult<ProjectVersion>> {
  hydrate();
  await delay(400);
  if (name.trim().length < 2) return fail('Name the version so you can find it later.');
  const version = writeVersion(state.activeId, capture(), 'named', name.trim(), note?.trim() || undefined);
  autosave();
  return ok(version);
}

/** Marks the exact cut that was published, so it can always be recovered. */
function recordPublishedVersion(label: string): ProjectVersion {
  hydrate();
  return writeVersion(state.activeId, capture(), 'published', label);
}

async function restoreVersion(versionId: string): Promise<ServiceResult<ProjectVersion>> {
  hydrate();
  await delay(600);
  const version = versionsOf(state.activeId).find((v) => v.id === versionId);
  if (!version) return fail('That version belongs to another project — open it first.');
  const snapshot = readJSON<ProductionSnapshot | null>(KEYS.snapshot(versionId), null);
  if (!snapshot) return fail('This version’s snapshot is no longer on this device.');
  const blocked = guardSwitch();
  if (blocked) return fail(blocked);

  // Restoring is itself undoable: the state being replaced is kept first.
  writeVersion(state.activeId, capture(), 'restore-point', `Before restoring v${version.n}`);
  const restored = structuredClone(snapshot);
  restored.director.jobs = [];
  apply(restored);
  autosave();
  return ok(version);
}

async function compareVersion(versionId: string): Promise<ServiceResult<ProjectComparisonRow[]>> {
  hydrate();
  await delay(200);
  const version = versionsOf(state.activeId).find((v) => v.id === versionId);
  if (!version) return fail('That version belongs to another project.');
  const now = countsOf(capture());
  const rows: [keyof ProjectCounts, string][] = [
  ['bibleEntries', 'Story Bible entries'],
  ['characters', 'Characters'],
  ['scenes', 'Scenes'],
  ['shots', 'Shots'],
  ['approvedShots', 'Approved shots']];

  return ok(rows.map(([key, label]) => ({ label, then: version.counts[key], now: now[key] })));
}

function setRelease(release: ProjectReleaseRef) {
  hydrate();
  updateSummary(state.activeId, { release, updatedAt: Date.now() });
}

export const projectsApi = {
  hydrate,
  autosave,
  activeId: () => {
    hydrate();
    return state.activeId;
  },
  listSync: () => {
    hydrate();
    return [...state.registry].sort((a, b) => b.updatedAt - a.updatedAt);
  },
  listProjects,
  createProject,
  switchProject,
  duplicateProject,
  archiveProject,
  unarchiveProject,
  listVersions,
  saveVersion,
  restoreVersion,
  compareVersion,
  recordPublishedVersion,
  setRelease,
  registerSwitchGuard(guard: () => string | null) {
    switchGuards.push(guard);
  }
};