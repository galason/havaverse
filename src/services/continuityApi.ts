import { CONTINUITY_AGENT_VERSION, lockedAssets as seedAssets, renderDeviations } from '../data/continuity';
import { propCarriers, vehicleAppearances } from '../data/filmState';
import type {
  AssetContinuitySummary,
  ContinuityCheck,
  ContinuityFailure,
  ContinuityStatus,
  ContinuityTrigger,
  LockAction,
  LockedAsset,
  ShotRender,
  WardrobePayload } from
'../types/continuity';
import type { AgentId, AgentRun, Character, QualityReport, Shot } from '../types/director';
import type { ServiceResult } from './directorApi';

/**
 * CONTINUITY SERVICE — Phase 1 (HV-ENG-STUDIO-001-TDD-P1)
 *
 * The routes this in-browser store stands in for:
 *
 *   POST  /projects/:projectId/locked-assets
 *   GET   /projects/:projectId/locked-assets
 *   GET   /projects/:projectId/locked-assets/:assetId
 *   POST  /projects/:projectId/locked-assets/:assetId/lock
 *   POST  /projects/:projectId/locked-assets/:assetId/unlock
 *   POST  /projects/:projectId/locked-assets/:assetId/versions
 *   GET   /projects/:projectId/locked-assets/:assetId/versions
 *   POST  /projects/:projectId/continuity/check
 *   GET   /projects/:projectId/continuity/checks
 *   GET   /projects/:projectId/continuity/status
 *
 * VERIFICATION IS A STAND-IN. The production agent compares rendered frames
 * against reference packages (embedding similarity — open decision §8). Here
 * it compares each shot's render evidence (which asset versions and which
 * wardrobe it was generated against) with the current locks. The interface —
 * inputs, ContinuityCheck output, triggers — is the one the real model plugs
 * into unchanged. Confidence is derived from reference-package size, not
 * measured, and is labelled as such in the UI.
 */

export interface ContinuityBridge {
  getShots: () => Shot[];
  setEntityContinuity: (
  type: 'character' | 'location',
  entityId: string,
  state: Character['continuity'])
  => void;
  log: (agent: AgentId, message: string, tone: AgentRun['tone']) => void;
  currentUser: () => string;
}

let bridge: ContinuityBridge | null = null;

/** Wired once by the director service; in production this is service-to-service. */
export function configureContinuity(next: ContinuityBridge) {
  bridge = next;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });
const now = () => new Date().toISOString();
let seq = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq += 1}`;

const renderedStatuses: Shot['status'][] = ['generated', 'approved', 'needs-revision'];

const store = {
  assets: seedAssets.map((a) => ({ ...a, history: [...a.history] })) as LockedAsset[],
  checks: [] as ContinuityCheck[],
  audit: [] as LockAction[],
  renders: new Map<string, ShotRender>(),
  ready: false
};

function requireBridge(): ContinuityBridge {
  if (!bridge) throw new Error('Continuity service used before the director service configured it.');
  return bridge;
}

/* --------------------------------------------------------------- helpers */

function assetFor(type: LockedAsset['type'], entityId: string) {
  return store.assets.find((a) => a.type === type && a.entityId === entityId && a.status !== 'archived');
}

const grade = () => store.assets.find((a) => a.type === 'grade' && a.status !== 'archived');

function shotsForAsset(asset: LockedAsset, shots: Shot[]): Shot[] {
  if (asset.type === 'character') return shots.filter((s) => s.characterIds.includes(asset.entityId ?? ''));
  if (asset.type === 'wardrobe')
  return shots.filter((s) => s.characterIds.includes((asset.payload as WardrobePayload).characterId));
  if (asset.type === 'location') return shots.filter((s) => s.locationId === asset.entityId);
  if (asset.type === 'prop') {
    const carrier = propCarriers[asset.entityId ?? ''];
    return carrier ? shots.filter((s) => s.characterIds.includes(carrier)) : [];
  }
  if (asset.type === 'vehicle') {
    const seen = vehicleAppearances[asset.entityId ?? ''] ?? [];
    return shots.filter((s) => seen.includes(s.id));
  }
  return shots;
}

/** Records what a shot was generated against, at the moment of generation. */
function stamp(shot: Shot, deviations: Record<string, string> = {}): ShotRender {
  const assetVersions: Record<string, number> = {};
  const wardrobe: ShotRender['wardrobe'] = {};
  shot.characterIds.forEach((characterId) => {
    const character = assetFor('character', characterId);
    if (character) assetVersions[character.id] = character.version;
    const wardrobeAsset = assetFor('wardrobe', characterId);
    if (deviations[characterId]) {
      wardrobe[characterId] = { observed: deviations[characterId] };
    } else if (wardrobeAsset) {
      assetVersions[wardrobeAsset.id] = wardrobeAsset.version;
      wardrobe[characterId] = { assetId: wardrobeAsset.id, observed: wardrobeAsset.name };
    }
  });
  const location = assetFor('location', shot.locationId);
  if (location) assetVersions[location.id] = location.version;
  const g = grade();
  if (g) assetVersions[g.id] = g.version;
  store.assets.
  filter((a) => (a.type === 'prop' || a.type === 'vehicle') && a.status !== 'archived').
  filter((a) => shotsForAsset(a, [shot]).length > 0).
  forEach((a) => assetVersions[a.id] = a.version);
  const render = { shotId: shot.id, assetVersions, wardrobe };
  store.renders.set(shot.id, render);
  return render;
}

function confidenceFor(asset: LockedAsset): number {
  return Math.round(Math.min(0.99, 0.85 + asset.referenceCount * 0.004) * 100) / 100;
}

function evaluate(asset: LockedAsset, trigger: ContinuityTrigger, shotIds?: string[]): ContinuityCheck {
  const shots = requireBridge().getShots();
  const inScope = shotsForAsset(asset, shots).filter(
    (s) => store.renders.has(s.id) && (!shotIds || shotIds.includes(s.id))
  );
  const base: ContinuityCheck = {
    id: nextId('cc'),
    projectId: asset.projectId,
    assetId: asset.id,
    shotIds: inScope.map((s) => s.id),
    status: 'verified',
    confidence: confidenceFor(asset),
    failures: [],
    ranAt: now(),
    completedAt: now(),
    agentVersion: CONTINUITY_AGENT_VERSION,
    triggeredBy: trigger
  };

  if (asset.status !== 'locked') {
    return { ...base, status: 'partial', confidence: 0, note: 'Not continuity-locked — nothing to verify against until it is locked.' };
  }
  if (inScope.length === 0) {
    return { ...base, status: 'partial', note: 'No rendered shots use this asset yet.' };
  }

  const failures: ContinuityFailure[] = [];
  inScope.forEach((shot) => {
    const render = store.renders.get(shot.id)!;
    if (asset.type === 'wardrobe') {
      const characterId = (asset.payload as WardrobePayload).characterId;
      const observed = render.wardrobe[characterId];
      if (observed && observed.assetId !== asset.id) {
        failures.push({
          shotId: shot.id,
          shotCode: shot.code,
          severity: 'high',
          reason: `Wardrobe mismatch — ${observed.observed}; locked wardrobe is ${asset.name} v${asset.version}.`,
          suggestedAction: 'Regenerate the shot, or create a new wardrobe version if the change is intentional.'
        });
        return;
      }
    }
    const renderedVersion = render.assetVersions[asset.id];
    if (renderedVersion !== undefined && renderedVersion !== asset.version) {
      failures.push({
        shotId: shot.id,
        shotCode: shot.code,
        severity: 'medium',
        reason: `Rendered against ${asset.name} v${renderedVersion}; the lock is now v${asset.version}.`,
        suggestedAction: 'Regenerate against the current lock.'
      });
    }
  });

  return { ...base, failures, status: failures.length > 0 ? 'failed' : 'verified' };
}

function record(check: ContinuityCheck) {
  store.checks.unshift(check);
  store.checks = store.checks.slice(0, 80);
}

function describe(check: ContinuityCheck, asset: LockedAsset): {message: string;tone: AgentRun['tone'];} {
  if (check.status === 'verified')
  return {
    message: `${asset.name} continuity verified across ${check.shotIds.length} shots · ${Math.round(check.confidence * 100)}% confidence`,
    tone: 'ok'
  };
  if (check.status === 'failed') {
    const first = check.failures[0];
    return {
      message: `${asset.name}: Shot ${first.shotCode} — ${first.reason}${check.failures.length > 1 ? ` (+${check.failures.length - 1} more)` : ''}`,
      tone: 'warn'
    };
  }
  return { message: `${asset.name} could not be verified — ${check.note ?? 'partial result'}`, tone: 'warn' };
}

function audit(asset: LockedAsset, action: LockAction['action'], reason?: string) {
  store.audit.unshift({
    id: nextId('audit'),
    assetId: asset.id,
    assetName: asset.name,
    action,
    version: asset.version,
    userId: requireBridge().currentUser(),
    reason,
    timestamp: now()
  });
}

function syncEntity(asset: LockedAsset, state: Character['continuity']) {
  if ((asset.type === 'character' || asset.type === 'location') && asset.entityId)
  requireBridge().setEntityContinuity(asset.type, asset.entityId, state);
}

/** Seeds render evidence and a baseline check per asset on first use. */
function ensureReady() {
  if (store.ready) return;
  store.ready = true;
  requireBridge().
  getShots().
  filter((s) => renderedStatuses.includes(s.status)).
  forEach((s) => stamp(s, renderDeviations[s.id]));
  store.assets.forEach((asset) => record(evaluate(asset, 'generation')));
}

/* ------------------------------------------------------------ mutations */

export async function lockAsset(assetId: string, reason?: string): Promise<ServiceResult<LockedAsset>> {
  ensureReady();
  await delay(500);
  const asset = store.assets.find((a) => a.id === assetId);
  if (!asset) return { ok: false, error: 'That asset is not on this project.' };
  if (asset.status === 'archived') return { ok: false, error: 'Archived assets cannot be locked.' };
  if (asset.status === 'locked') return { ok: false, error: `${asset.name} is already locked at v${asset.version}.` };

  asset.status = 'locked';
  asset.lockedAt = now();
  asset.lockedBy = requireBridge().currentUser();
  asset.updatedAt = asset.lockedAt;
  audit(asset, 'lock', reason);
  syncEntity(asset, 'locked');
  requireBridge().log('continuity', `${asset.name} v${asset.version} continuity-locked`, 'ok');

  const check = evaluate(asset, 'lock');
  record(check);
  const { message, tone } = describe(check, asset);
  requireBridge().log('continuity', message, tone);
  return ok({ ...asset });
}

export async function unlockAsset(assetId: string, reason: string): Promise<ServiceResult<LockedAsset>> {
  ensureReady();
  await delay(400);
  const asset = store.assets.find((a) => a.id === assetId);
  if (!asset) return { ok: false, error: 'That asset is not on this project.' };
  if (asset.status !== 'locked') return { ok: false, error: `${asset.name} is not locked.` };
  if (reason.trim().length < 4) return { ok: false, error: 'Say why you are unlocking — it goes on the audit log.' };

  asset.status = 'draft';
  asset.updatedAt = now();
  audit(asset, 'unlock', reason.trim());
  syncEntity(asset, 'unverified');
  requireBridge().log(
    'continuity',
    `${asset.name} temporarily unlocked — new generations with it will fail continuity until re-locked`,
    'warn'
  );
  return ok({ ...asset });
}

export async function createAssetVersion(
assetId: string,
input: {description: string;reason: string;})
: Promise<ServiceResult<LockedAsset>> {
  ensureReady();
  await delay(500);
  const asset = store.assets.find((a) => a.id === assetId);
  if (!asset) return { ok: false, error: 'That asset is not on this project.' };
  if (input.reason.trim().length < 4) return { ok: false, error: 'Give a reason for the new version — it is audited.' };

  const field = asset.type === 'character' ? 'faceDescription' : 'description';
  const current = (asset.payload as unknown as Record<string, unknown>)[field];
  if (!input.description.trim() || input.description.trim() === current)
  return { ok: false, error: 'Describe what changes in this version.' };

  const parentVersionId = `${asset.id}@v${asset.version}`;
  const payload = { ...asset.payload, [field]: input.description.trim() } as LockedAsset['payload'];
  asset.version += 1;
  asset.payload = payload;
  asset.parentVersionId = parentVersionId;
  asset.status = 'draft';
  asset.embeddingId = asset.embeddingId ? asset.embeddingId.replace(/v\d+$/, `v${asset.version}`) : undefined;
  asset.updatedAt = now();
  asset.history.unshift({
    id: `${asset.id}@v${asset.version}`,
    version: asset.version,
    payload,
    parentVersionId,
    reason: input.reason.trim(),
    createdAt: asset.updatedAt,
    createdBy: requireBridge().currentUser()
  });
  audit(asset, 'create_version', input.reason.trim());
  syncEntity(asset, 'unverified');
  requireBridge().log(
    'continuity',
    `${asset.name} v${asset.version} created as draft — v${asset.version - 1} preserved; lock it to apply`,
    'ok'
  );
  return ok({ ...asset });
}

export async function runContinuityCheck(
assetId: string,
trigger: ContinuityTrigger = 'manual',
shotIds?: string[])
: Promise<ServiceResult<ContinuityCheck>> {
  ensureReady();
  await delay(900);
  const asset = store.assets.find((a) => a.id === assetId);
  if (!asset) return { ok: false, error: 'That asset is not on this project.' };
  const check = evaluate(asset, trigger, shotIds);
  record(check);
  const { message, tone } = describe(check, asset);
  requireBridge().log('continuity', message, tone);
  return ok(check);
}

/** Re-verifies every locked asset, or those governing one entity. */
export async function runAllChecks(entityId?: string): Promise<ServiceResult<ContinuityCheck[]>> {
  ensureReady();
  await delay(1100);
  const targets = store.assets.filter(
    (a) => a.status === 'locked' && (!entityId || a.entityId === entityId)
  );
  const checks = targets.map((asset) => evaluate(asset, 'manual'));
  checks.forEach(record);
  const failed = checks.filter((c) => c.status === 'failed');
  requireBridge().log(
    'continuity',
    failed.length === 0 ?
    `Re-verified ${checks.length} locked assets — all consistent` :
    `Re-verified ${checks.length} locked assets — ${failed.length} with failures`,
    failed.length === 0 ? 'ok' : 'warn'
  );
  return ok(checks);
}

/* ----------------------------------------------------- generation hooks */

/**
 * FR-2 / FR-7: called by the Quality step before a new shot version is
 * accepted. Generation against an unlocked character or location fails.
 */
export function evaluateForGeneration(shot: Shot): QualityReport {
  ensureReady();
  const characterAssets = shot.characterIds.map((id) => assetFor('character', id)).filter(Boolean) as LockedAsset[];
  const unlockedChars = characterAssets.filter((a) => a.status !== 'locked');
  const wardrobes = shot.characterIds.map((id) => assetFor('wardrobe', id)).filter(Boolean) as LockedAsset[];
  const unlockedWardrobe = wardrobes.filter((a) => a.status !== 'locked');
  const location = assetFor('location', shot.locationId);
  const g = grade();
  const envUnlocked = location && location.status !== 'locked' || g && g.status !== 'locked';

  const checks: QualityReport['checks'] = [
  {
    label: 'Character consistency',
    result: unlockedChars.length > 0 ? 'fail' : 'pass',
    note:
    unlockedChars.length > 0 ?
    `${unlockedChars.map((a) => a.name).join(', ')} not continuity-locked — lock before generating.` :
    characterAssets.length === 0 ?
    'No characters in frame.' :
    `Generated against ${characterAssets.map((a) => `${a.name} v${a.version}`).join(', ')}.`
  },
  {
    label: 'Wardrobe continuity',
    result: unlockedWardrobe.length > 0 ? 'warn' : 'pass',
    note:
    unlockedWardrobe.length > 0 ?
    `${unlockedWardrobe.map((a) => a.name).join(', ')} is still a draft.` :
    wardrobes.length === 0 ?
    'No wardrobe in frame.' :
    `Matches ${wardrobes.map((a) => `${a.name} v${a.version}`).join(', ')}.`
  },
  {
    label: 'Environment continuity',
    result: envUnlocked ? 'fail' : 'pass',
    note: envUnlocked ?
    'Location or grade is not locked.' :
    `${location ? `${location.name} v${location.version}` : 'Location'} · grade ${g ? `${g.name} v${g.version}` : '—'}.`
  },
  { label: 'Framing', result: 'pass', note: 'Matches the shot specification.' }];

  return { passed: !checks.some((c) => c.result === 'fail'), checks };
}

/** Stamps the new render and re-verifies every asset in frame (trigger: generation). */
export function onShotRendered(shot: Shot) {
  ensureReady();
  stamp(shot);
  const touched = store.assets.filter(
    (a) => a.status === 'locked' && shotsForAsset(a, [shot]).length > 0
  );
  const checks = touched.map((asset) => evaluate(asset, 'generation'));
  checks.forEach(record);
  const failing = checks.filter((c) => c.failures.some((f) => f.shotId === shot.id));
  requireBridge().log(
    'continuity',
    failing.length === 0 ?
    `Shot ${shot.code} verified against ${touched.length} locked assets` :
    `Shot ${shot.code} failed ${failing.length} continuity checks`,
    failing.length === 0 ? 'ok' : 'warn'
  );
}

/* ---------------------------------------------------------------- reads */

function latestCheck(assetId: string) {
  return store.checks.find((c) => c.assetId === assetId);
}

export function getContinuityStatus(): ContinuityStatus {
  ensureReady();
  const shots = requireBridge().getShots();
  const assets: AssetContinuitySummary[] = store.assets.
  filter((a) => a.status !== 'archived').
  map((asset) => {
    const check = latestCheck(asset.id);
    const total = shotsForAsset(asset, shots).filter((s) => store.renders.has(s.id)).length;
    const failedShots = new Set(check?.failures.map((f) => f.shotId) ?? []);
    return {
      assetId: asset.id,
      name: asset.name,
      type: asset.type,
      version: asset.version,
      locked: asset.status === 'locked',
      status: check ? check.status : 'unchecked',
      confidence: check?.confidence ?? 0,
      verifiedShotCount: asset.status === 'locked' && check ? check.shotIds.length - failedShots.size : 0,
      totalShotCount: total,
      lastCheckedAt: check?.completedAt
    };
  });

  const blockingFailures = store.assets.
  filter((a) => a.status === 'locked').
  flatMap((asset) =>
  (latestCheck(asset.id)?.failures ?? []).
  filter((f) => f.severity !== 'low').
  map((f) => ({ ...f, assetId: asset.id, assetName: asset.name }))
  );

  const unlockedInUse = store.assets.
  filter((a) => a.status === 'draft').
  map((a) => ({ assetId: a.id, name: a.name, type: a.type, shotCount: shotsForAsset(a, shots).length })).
  filter((a) => a.shotCount > 0);

  return {
    overall: blockingFailures.length > 0 ? 'failed' : unlockedInUse.length > 0 ? 'partial' : 'verified',
    assets,
    blockingFailures,
    unlockedInUse
  };
}

/* ------------------------------------------------------- project state I/O */

/** One project's continuity working copy; swapped by the projects service. */
export interface ContinuitySnapshot {
  assets: LockedAsset[];
  checks: ContinuityCheck[];
  audit: LockAction[];
  renders: [string, ShotRender][];
  ready: boolean;
}

export function exportContinuityState(): ContinuitySnapshot {
  return structuredClone({
    assets: store.assets,
    checks: store.checks,
    audit: store.audit,
    renders: [...store.renders.entries()],
    ready: store.ready
  });
}

export function importContinuityState(snapshot: ContinuitySnapshot) {
  const s = structuredClone(snapshot);
  store.assets = s.assets;
  store.checks = s.checks;
  store.audit = s.audit;
  store.renders = new Map(s.renders);
  store.ready = s.ready;
}

/** A new project has no reference packages to lock until agents build them. */
export function blankContinuityState(): ContinuitySnapshot {
  return { assets: [], checks: [], audit: [], renders: [], ready: true };
}

export const continuityApi = {
  getAssets(): LockedAsset[] {
    ensureReady();
    return store.assets.map((a) => ({ ...a, history: [...a.history] }));
  },
  getChecks(assetId?: string): ContinuityCheck[] {
    ensureReady();
    return store.checks.filter((c) => !assetId || c.assetId === assetId).map((c) => ({ ...c }));
  },
  getAudit(): LockAction[] {
    ensureReady();
    return store.audit.map((a) => ({ ...a }));
  },
  getRender(shotId: string): ShotRender | undefined {
    ensureReady();
    return store.renders.get(shotId);
  },
  assetForEntity(type: LockedAsset['type'], entityId: string): LockedAsset | undefined {
    ensureReady();
    return assetFor(type, entityId);
  },
  getStatus: getContinuityStatus,
  lockAsset,
  unlockAsset,
  createAssetVersion,
  runContinuityCheck,
  runAllChecks
};