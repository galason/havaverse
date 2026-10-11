import {
  entityNames,
  initialState,
  interiorLocations,
  observedDeviations,
  propCarriers,
  rules as seedRules,
  sequences as seedSequences,
  vehicleAppearances } from
'../data/filmState';
import type { AgentId, AgentRun, QualityReport, Scene, Shot } from '../types/director';
import type {
  FilmStateVersion,
  GenerationContext,
  ProductionRule,
  ResolvedShotState,
  RuleViolation,
  Sequence,
  StaleShot,
  StateChangeProposal,
  StateFact,
  Weather } from
'../types/filmState';
import type { ServiceResult } from './directorApi';

/**
 * FILM STATE SERVICE — P0 (HV-AIFILM-001 §7, §17, §18, §30)
 *
 * The routes this in-browser store stands in for:
 *
 *   GET   /api/studio/projects/:id/state                   → current FilmStateVersion
 *   GET   /api/studio/projects/:id/state/versions
 *   POST  /api/studio/projects/:id/state/proposals         → StateChangeProposal (no side effects)
 *   POST  /api/studio/projects/:id/state/versions          → commit a proposal
 *   GET   /api/studio/projects/:id/sequences
 *   GET   /api/studio/projects/:id/rules
 *   POST  /api/studio/rules/:id/versions                   → edit / suspend / add exception
 *   GET   /api/studio/versions/:id/context                 → GenerationContext
 *   GET   /api/studio/projects/:id/violations
 *   GET   /api/studio/projects/:id/stale
 *
 * WHAT IS REAL: state versions, the fact timeline, resolution of state per
 * shot, staleness detection, rule evaluation, generation contexts, and the
 * refusal of commands that contradict a rule.
 *
 * WHAT IS A STAND-IN: `observed` — what a render actually shows — is recorded
 * evidence, not read from pixels. A real generation honours the context it is
 * given; the production Rules Agent will read frames to confirm it. The rule
 * check consumes `observed` unchanged either way.
 */

export interface FilmStateBridge {
  getShots: () => Shot[];
  getScenes: () => Scene[];
  assetVersionsFor: (shotId: string) => Record<string, number>;
  log: (agent: AgentId, message: string, tone: AgentRun['tone']) => void;
  currentUser: () => string;
}

let bridge: FilmStateBridge | null = null;
export function configureFilmState(next: FilmStateBridge) {
  bridge = next;
}
function requireBridge(): FilmStateBridge {
  if (!bridge) throw new Error('Film state service used before the director service configured it.');
  return bridge;
}

const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();
let seq = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq += 1}`;

const renderedStatuses: Shot['status'][] = ['generated', 'approved', 'needs-revision'];

const store = {
  versions: [structuredClone(initialState)] as FilmStateVersion[],
  sequences: structuredClone(seedSequences) as Sequence[],
  rules: structuredClone(seedRules) as ProductionRule[],
  /** versionId → context. */
  contexts: new Map<string, GenerationContext>(),
  ready: false
};

const current = () => store.versions[0];

/* ------------------------------------------------------------- resolution */

function sceneOf(shot: Shot) {
  return requireBridge().getScenes().find((s) => s.id === shot.sceneId);
}

function sequenceOfScene(sceneId: string) {
  return store.sequences.find((s) => s.sceneIds.includes(sceneId));
}

/** Every production entity present in a shot: cast, carried props, vehicles. */
function entitiesInFrame(shot: Shot): string[] {
  const ids = [...shot.characterIds];
  Object.entries(propCarriers).forEach(([prop, carrier]) => {
    if (shot.characterIds.includes(carrier)) ids.push(prop);
  });
  Object.entries(vehicleAppearances).forEach(([vehicle, seen]) => {
    if (seen.includes(shot.id)) ids.push(vehicle);
  });
  return ids;
}

function resolveFacts(facts: StateFact[], entityIds: string[], sceneNumber: number) {
  const latest = new Map<string, StateFact>();
  facts.
  filter((f) => entityIds.includes(f.entityId) && f.fromScene <= sceneNumber).
  sort((a, b) => a.fromScene - b.fromScene).
  forEach((f) => latest.set(`${f.entityId}.${f.property}`, f));
  return [...latest.values()].
  map((f) => ({ entityId: f.entityId, property: f.property, value: f.value, cause: f.cause })).
  sort((a, b) => `${a.entityId}.${a.property}`.localeCompare(`${b.entityId}.${b.property}`));
}

/** The state a shot must be generated against, under a given film state. */
function resolve(shot: Shot, state: FilmStateVersion = current()): ResolvedShotState {
  const scene = sceneOf(shot);
  const interior = interiorLocations.includes(shot.locationId);
  const weather = state.weather[shot.sceneId] ?? 'dry';
  const facts = resolveFacts(state.facts, entitiesInFrame(shot), scene?.number ?? 0);
  // Interiors take weather as sound only, so it is not part of what the
  // picture depends on — a weather change never makes an interior shot stale.
  const digest = JSON.stringify({ w: interior ? 'interior' : weather, f: facts.map((f) => [f.entityId, f.property, f.value]) });
  return { shotId: shot.id, sceneId: shot.sceneId, weather, interior, facts, digest };
}

function diffStates(from: ResolvedShotState, to: ResolvedShotState): string[] {
  const changes: string[] = [];
  if (!to.interior && from.weather !== to.weather) changes.push(`Weather ${from.weather} → ${to.weather}`);
  to.facts.forEach((fact) => {
    const before = from.facts.find((f) => f.entityId === fact.entityId && f.property === fact.property);
    if (!before || before.value !== fact.value)
    changes.push(`${entityNames[fact.entityId] ?? fact.entityId} ${fact.property}: ${before?.value ?? '—'} → ${fact.value}`);
  });
  return changes;
}

/* ------------------------------------------------------------------ rules */

function subjectPresent(rule: ProductionRule, shot: Shot): boolean {
  const subject = rule.predicate.subject;
  if (subject === 'door-contents') return true;
  return entitiesInFrame(shot).includes(subject);
}

function ruleApplies(rule: ProductionRule, shot: Shot): boolean {
  if (rule.status !== 'active') return false;
  if (rule.level === 'sequence' && sequenceOfScene(shot.sceneId)?.id !== rule.scopeId) return false;
  if (rule.level === 'scene' && shot.sceneId !== rule.scopeId) return false;
  if (rule.level === 'shot' && shot.id !== rule.scopeId) return false;
  if (rule.level === 'character' && !shot.characterIds.includes(rule.scopeId ?? '')) return false;
  return subjectPresent(rule, shot);
}

function breaks(rule: ProductionRule, observed: string | undefined): boolean {
  if (observed === undefined) return false;
  return rule.predicate.operator === 'never' ? observed === rule.predicate.value : observed !== rule.predicate.value;
}

/** A generation honours every rule in its context, unless evidence says otherwise. */
function observedFor(shot: Shot, deviations: Record<string, string> = {}): Record<string, string> {
  const observed: Record<string, string> = {};
  store.rules.forEach((rule) => {
    if (rule.level === 'sequence' && sequenceOfScene(shot.sceneId)?.id !== rule.scopeId) return;
    if (!subjectPresent(rule, shot)) return;
    observed[rule.predicate.subject] = rule.compliant;
  });
  return { ...observed, ...deviations };
}

function buildContext(
shot: Shot,
params: {versionId: string;provider: string;model: string;agent: string;instruction: string;parentVersionId?: string;},
deviations?: Record<string, string>)
: GenerationContext {
  const context: GenerationContext = {
    id: nextId('ctx'),
    shotId: shot.id,
    versionId: params.versionId,
    stateVersion: current().n,
    state: resolve(shot),
    assetVersions: { ...requireBridge().assetVersionsFor(shot.id) },
    rules: store.rules.filter((r) => ruleApplies(r, shot)).map((r) => ({ ruleId: r.id, version: r.version })),
    observed: observedFor(shot, deviations),
    provider: params.provider,
    model: params.model,
    agent: params.agent,
    instruction: params.instruction,
    parentVersionId: params.parentVersionId,
    createdAt: now()
  };
  store.contexts.set(params.versionId, context);
  return context;
}

function ensureReady() {
  if (store.ready) return;
  store.ready = true;
  requireBridge().
  getShots().
  filter((s) => renderedStatuses.includes(s.status) && s.currentVersionId).
  forEach((shot) => {
    const version = shot.versions.find((v) => v.id === shot.currentVersionId)!;
    buildContext(
      shot,
      { versionId: version.id, provider: version.provider, model: version.model, agent: version.agent, instruction: version.note },
      observedDeviations[shot.id]
    );
  });
}

function violationsFor(shot: Shot, versionId?: string): RuleViolation[] {
  const context = versionId ? store.contexts.get(versionId) : undefined;
  if (!context) return [];
  const version = shot.versions.find((v) => v.id === versionId);
  return store.rules.
  filter((rule) => ruleApplies(rule, shot) && !rule.exceptions.includes(shot.id)).
  filter((rule) => breaks(rule, context.observed[rule.predicate.subject])).
  map((rule) => ({
    id: `${rule.id}:${shot.id}`,
    ruleId: rule.id,
    ruleText: rule.text,
    shotId: shot.id,
    shotCode: shot.code,
    versionId: context.versionId,
    versionN: version?.n ?? 0,
    evidence: `${entityNames[rule.predicate.subject] ?? rule.predicate.subject} is ${context.observed[rule.predicate.subject]} in v${version?.n ?? '?'}`
  }));
}

/* ---------------------------------------------------------- public reads */

export function getViolations(): RuleViolation[] {
  ensureReady();
  return requireBridge().
  getShots().
  flatMap((shot) => violationsFor(shot, shot.currentVersionId));
}

export function versionViolations(shot: Shot, versionId: string): RuleViolation[] {
  ensureReady();
  return violationsFor(shot, versionId);
}

export function getStaleShots(): StaleShot[] {
  ensureReady();
  return requireBridge().
  getShots().
  filter((s) => s.currentVersionId && s.status !== 'generating').
  flatMap((shot) => {
    const context = store.contexts.get(shot.currentVersionId!);
    if (!context) return [];
    const latest = resolve(shot);
    if (latest.digest === context.state.digest) return [];
    return [{ shotId: shot.id, shotCode: shot.code, renderedStateVersion: context.stateVersion, changes: diffStates(context.state, latest) }];
  });
}

/** Active rules a natural-language command would contradict. */
export function conflictsFor(text: string): ProductionRule[] {
  ensureReady();
  const lower = text.toLowerCase();
  return store.rules.filter(
    (rule) => rule.status === 'active' && rule.conflictTerms.every((group) => group.some((term) => lower.includes(term)))
  );
}

/* ------------------------------------------------------ state proposals */

function targetWeather(text: string): Weather | null {
  if (/\b(stop|no|without)\s+(the\s+)?rain|\bdry\b/.test(text)) return 'dry';
  if (/\brain/.test(text)) return 'rain';
  if (/\b(haze|hazy|harmattan)\b/.test(text)) return 'haze';
  return null;
}

/**
 * "Make it rain" → a proposal: the state change, the shots whose render now
 * depends on something different, and — as important — what does not change.
 * No side effects.
 */
export function proposeWeather(command: string): ServiceResult<StateChangeProposal> {
  ensureReady();
  const text = command.toLowerCase();
  const weather = targetWeather(text);
  if (!weather) return { ok: false, error: 'Say what the weather should become — rain, dry or harmattan haze.' };

  const scenes = [...requireBridge().getScenes()].sort((a, b) => a.number - b.number);
  const sceneMatch = text.match(/scene\s*(\d{1,3})/);
  const onward = /(from|onward|onwards|after)/.test(text);
  const anchor = sceneMatch ? scenes.find((s) => s.number === Number(sceneMatch[1])) : undefined;
  if (sceneMatch && !anchor) return { ok: false, error: `There is no Scene ${sceneMatch[1]} in this film.` };

  const inScope = anchor ?
  scenes.filter((s) => onward ? s.number >= anchor.number : s.id === anchor.id) :
  scenes.filter((s) => !interiorLocations.includes(s.locationId));

  const state = current();
  const changing = inScope.filter((s) => state.weather[s.id] !== weather);
  if (changing.length === 0)
  return {
    ok: false,
    error: anchor ?
    `Scene ${anchor.number}${onward ? ' onward is' : ' is'} already ${weather}. Nothing to change.` :
    `Every exterior scene is already ${weather}. Name a scene if you meant an interior.`
  };

  const nextWeather = { ...state.weather };
  changing.forEach((s) => nextWeather[s.id] = weather);
  const changes = changing.map((s) => `Scene ${s.number} weather: ${state.weather[s.id]} → ${weather}`);

  // Causality: rain on an exterior Amara is in soaks her from that scene on.
  const facts = state.facts.map((f) => ({ ...f }));
  if (weather === 'rain') {
    const firstWet = changing.find(
      (s) => !interiorLocations.includes(s.locationId) && s.characterIds.includes('ch-amara')
    );
    if (firstWet) {
      const conditionThen = resolveFacts(facts, ['ch-amara'], firstWet.number).find((f) => f.property === 'condition');
      if (conditionThen?.value !== 'soaked') {
        facts.push({
          id: nextId('fact'),
          entityId: 'ch-amara',
          property: 'condition',
          value: 'soaked',
          fromScene: firstWet.number,
          cause: `Caught in the rain in Scene ${firstWet.number}`
        });
        changes.push(`Amara soaked from Scene ${firstWet.number} (was dry until Scene 22)`);
      }
    }
  }

  const proposed: FilmStateVersion = { ...state, weather: nextWeather, facts };
  const shots = requireBridge().getShots();
  const affected = shots.filter(
    (shot) => renderedStatuses.includes(shot.status) && resolve(shot, proposed).digest !== resolve(shot).digest
  );
  const planned = shots.filter((s) => !renderedStatuses.includes(s.status) && changing.some((c) => c.id === s.sceneId));

  const unaffected: string[] = [];
  changing.
  filter((s) => interiorLocations.includes(s.locationId)).
  forEach((s) => unaffected.push(`Scene ${s.number} is interior — rain reaches it as sound only`));
  if (planned.length > 0)
  unaffected.push(`${planned.length} not-yet-generated shots will simply be generated against the new state`);
  unaffected.push(`${shots.filter((s) => renderedStatuses.includes(s.status)).length - affected.length} rendered shots keep their current render`);

  return ok({
    fromVersion: state.n,
    toVersion: state.n + 1,
    weather: nextWeather,
    facts,
    changes,
    affectedShotIds: affected.map((s) => s.id),
    unaffected
  });
}

/** Writes a proposal as a new, immutable film state version. */
export function commitProposal(proposal: StateChangeProposal, reason: string): ServiceResult<FilmStateVersion> {
  ensureReady();
  const state = current();
  if (state.n !== proposal.fromVersion)
  return { ok: false, error: `The film state moved to v${state.n} since this was planned. Describe the change again.` };

  const next: FilmStateVersion = {
    id: `fs-v${state.n + 1}`,
    n: state.n + 1,
    parentId: state.id,
    createdAt: now(),
    createdBy: requireBridge().currentUser(),
    reason,
    weather: proposal.weather,
    facts: proposal.facts,
    changes: proposal.changes
  };
  store.versions.unshift(next);

  const shots = requireBridge().getShots();
  const touchedScenes = new Set(
    shots.filter((s) => proposal.affectedShotIds.includes(s.id)).map((s) => s.sceneId)
  );
  Object.entries(proposal.weather).forEach(([sceneId, w]) => {
    if (state.weather[sceneId] !== w) touchedScenes.add(sceneId);
  });
  store.sequences.forEach((sequence) => {
    if (!sequence.sceneIds.some((id) => touchedScenes.has(id))) return;
    sequence.versions.unshift({
      n: sequence.versions[0].n + 1,
      stateVersion: next.n,
      reason,
      createdAt: next.createdAt
    });
  });

  requireBridge().log('world', `Film state v${next.n}: ${proposal.changes[0]}${proposal.changes.length > 1 ? ` (+${proposal.changes.length - 1})` : ''}`, 'ok');
  return ok(structuredClone(next));
}

/* ------------------------------------------------------ generation hooks */

/** Records the context for a new version and returns its rule/state QC rows. */
export function recordGeneration(
shot: Shot,
params: {versionId: string;provider: string;model: string;agent: string;instruction: string;parentVersionId?: string;})
: {context: GenerationContext;checks: QualityReport['checks'];} {
  ensureReady();
  const context = buildContext(shot, params);
  // The new version must already be on the shot so its number resolves.
  const broken = violationsFor(shot, params.versionId);
  const ruleNames = context.rules.map((r) => store.rules.find((x) => x.id === r.ruleId)?.text ?? r.ruleId);
  return {
    context,
    checks: [
    {
      label: 'Director’s rules',
      result: broken.length > 0 ? 'fail' : 'pass',
      note:
      broken.length > 0 ?
      broken.map((b) => b.ruleText).join(' ') :
      ruleNames.length === 0 ?
      'No rules apply to this shot.' :
      `Honoured: ${ruleNames.join(' ')}`
    },
    {
      label: 'Film state',
      result: 'pass',
      note: `Generated against state v${context.stateVersion}${context.state.interior ? ' · interior' : ` · ${context.state.weather}`}.`
    }]

  };
}

/* ------------------------------------------------------------ rule edits */

function reviseRule(
rule: ProductionRule,
patch: Partial<Pick<ProductionRule, 'text' | 'exceptions' | 'status'>>,
reason: string)
{
  Object.assign(rule, patch);
  rule.version += 1;
  rule.history.unshift({
    version: rule.version,
    text: rule.text,
    predicate: rule.predicate,
    exceptions: [...rule.exceptions],
    reason,
    createdAt: now(),
    createdBy: requireBridge().currentUser()
  });
}

export async function allowException(ruleId: string, shotId: string, reason: string): Promise<ServiceResult<ProductionRule>> {
  ensureReady();
  await delay(400);
  const rule = store.rules.find((r) => r.id === ruleId);
  const shot = requireBridge().getShots().find((s) => s.id === shotId);
  if (!rule || !shot) return { ok: false, error: 'That rule or shot is no longer in the film.' };
  if (reason.trim().length < 4) return { ok: false, error: 'Say why this shot may break the rule — it is audited.' };
  if (rule.exceptions.includes(shotId)) return { ok: false, error: `Shot ${shot.code} is already an exception.` };
  reviseRule(rule, { exceptions: [...rule.exceptions, shotId] }, `Exception for Shot ${shot.code}: ${reason.trim()}`);
  requireBridge().log('continuity', `Rule v${rule.version}: Shot ${shot.code} allowed to break “${rule.text}”`, 'warn');
  return ok(structuredClone(rule));
}

export async function editRule(
ruleId: string,
patch: {text?: string;status?: ProductionRule['status'];},
reason: string)
: Promise<ServiceResult<ProductionRule>> {
  ensureReady();
  await delay(400);
  const rule = store.rules.find((r) => r.id === ruleId);
  if (!rule) return { ok: false, error: 'That rule is no longer in the film.' };
  if (reason.trim().length < 4) return { ok: false, error: 'Give a reason — rule changes are audited.' };
  const text = patch.text?.trim();
  if (patch.text !== undefined && (!text || text === rule.text) && patch.status === undefined)
  return { ok: false, error: 'Change the wording, or suspend the rule.' };
  reviseRule(rule, { ...(text ? { text } : {}), ...(patch.status ? { status: patch.status } : {}) }, reason.trim());
  requireBridge().log(
    'continuity',
    `Rule v${rule.version}${rule.status === 'suspended' ? ' suspended' : ''}: ${rule.text}`,
    rule.status === 'suspended' ? 'warn' : 'ok'
  );
  return ok(structuredClone(rule));
}

/* ------------------------------------------------------- project state I/O */

/** One project's film memory; swapped by the projects service. */
export interface FilmStateSnapshot {
  versions: FilmStateVersion[];
  sequences: Sequence[];
  rules: ProductionRule[];
  contexts: [string, GenerationContext][];
  ready: boolean;
}

export function exportFilmState(): FilmStateSnapshot {
  return structuredClone({
    versions: store.versions,
    sequences: store.sequences,
    rules: store.rules,
    contexts: [...store.contexts.entries()],
    ready: store.ready
  });
}

export function importFilmState(snapshot: FilmStateSnapshot) {
  const s = structuredClone(snapshot);
  store.versions = s.versions;
  store.sequences = s.sequences;
  store.rules = s.rules;
  store.contexts = new Map(s.contexts);
  store.ready = s.ready;
}

/** Film memory for a new project: one empty state version, no rules yet. */
export function blankFilmState(createdBy: string): FilmStateSnapshot {
  return {
    versions: [
    {
      id: 'fs-v1',
      n: 1,
      createdAt: now(),
      createdBy,
      reason: 'Created with the project — nothing established yet',
      weather: {},
      facts: [],
      changes: []
    }],

    sequences: [],
    rules: [],
    contexts: [],
    ready: true
  };
}

/* ---------------------------------------------------------------- reads */

export const filmStateApi = {
  getCurrent: () => {
    ensureReady();
    return structuredClone(current());
  },
  getVersions: () => {
    ensureReady();
    return structuredClone(store.versions);
  },
  getSequences: () => {
    ensureReady();
    return structuredClone(store.sequences);
  },
  getRules: () => {
    ensureReady();
    return structuredClone(store.rules);
  },
  getContext: (versionId: string) => {
    ensureReady();
    const context = store.contexts.get(versionId);
    return context ? structuredClone(context) : undefined;
  },
  resolveShot: (shot: Shot) => {
    ensureReady();
    return resolve(shot);
  },
  entityName: (id: string) => entityNames[id] ?? id,
  getViolations,
  getStaleShots,
  conflictsFor,
  proposeWeather,
  commitProposal,
  allowException,
  editRule
};