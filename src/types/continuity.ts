/**
 * CONTINUITY LAYER — Phase 1 (HV-ENG-STUDIO-001-TDD-P1)
 *
 * Locked assets are the single source of truth downstream generation must
 * respect. A lock is never silently mutated: changing a locked asset creates
 * a new version (draft) that must be locked again, and every lock, unlock and
 * version is written to the audit log.
 */

export type LockedAssetType = 'character' | 'location' | 'wardrobe' | 'grade' | 'prop' | 'vehicle';
export type LockedAssetStatus = 'draft' | 'locked' | 'archived';

export interface CharacterPayload {
  displayName: string;
  faceDescription?: string;
  bodyDescription?: string;
  defaultWardrobeId?: string;
  voiceId?: string;
  referenceImages: string[];
}

export interface LocationPayload {
  displayName: string;
  description?: string;
  referenceImages: string[];
  timeOfDayDefault?: 'day' | 'night' | 'dawn' | 'dusk';
}

export interface WardrobePayload {
  displayName: string;
  characterId: string;
  description?: string;
  referenceImages: string[];
}

export interface GradePayload {
  displayName: string;
  description?: string;
  lutUrl?: string;
  referenceImages?: string[];
}

export interface PropPayload {
  displayName: string;
  description?: string;
  /** Character who carries it; the prop appears wherever they do. */
  carriedBy?: string;
  referenceImages: string[];
}

export interface VehiclePayload {
  displayName: string;
  description?: string;
  make: string;
  model: string;
  year: number;
  colour: string;
  damage: string[];
  referenceImages: string[];
}

export type LockedAssetPayload =
CharacterPayload |
LocationPayload |
WardrobePayload |
GradePayload |
PropPayload |
VehiclePayload;

/** An immutable snapshot. Previous versions are never edited. */
export interface LockedAssetVersion {
  id: string;
  version: number;
  payload: LockedAssetPayload;
  parentVersionId?: string;
  reason: string;
  createdAt: string;
  createdBy: string;
}

export interface LockedAsset {
  id: string;
  projectId: string;
  type: LockedAssetType;
  name: string;
  version: number;
  status: LockedAssetStatus;
  payload: LockedAssetPayload;
  /** The director-graph entity this asset governs (character / location id). */
  entityId?: string;
  lockedAt?: string;
  lockedBy?: string;
  parentVersionId?: string;
  /** Size of the reference package — drives agent confidence. */
  referenceCount: number;
  embeddingId?: string;
  history: LockedAssetVersion[];
  createdAt: string;
  updatedAt: string;
}

export type ContinuityCheckStatus = 'verified' | 'failed' | 'partial' | 'running';
export type ContinuityTrigger = 'generation' | 'manual' | 'lock' | 'approval';

export interface ContinuityFailure {
  shotId: string;
  shotCode: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  suggestedAction?: string;
}

export interface ContinuityCheck {
  id: string;
  projectId: string;
  assetId: string;
  shotIds: string[];
  status: ContinuityCheckStatus;
  confidence: number;
  failures: ContinuityFailure[];
  /** Why a check could not fully verify (e.g. the asset is not locked). */
  note?: string;
  ranAt: string;
  completedAt?: string;
  agentVersion: string;
  triggeredBy: ContinuityTrigger;
}

export interface LockAction {
  id: string;
  assetId: string;
  assetName: string;
  action: 'lock' | 'unlock' | 'create_version';
  version: number;
  userId: string;
  reason?: string;
  timestamp: string;
}

export interface AssetContinuitySummary {
  assetId: string;
  name: string;
  type: LockedAssetType;
  version: number;
  locked: boolean;
  status: ContinuityCheckStatus | 'unchecked';
  confidence: number;
  verifiedShotCount: number;
  totalShotCount: number;
  lastCheckedAt?: string;
}

export interface ContinuityStatus {
  overall: 'verified' | 'partial' | 'failed';
  assets: AssetContinuitySummary[];
  blockingFailures: (ContinuityFailure & {assetId: string;assetName: string;})[];
  /** Assets that govern rendered or planned shots but are not locked. */
  unlockedInUse: {assetId: string;name: string;type: LockedAssetType;shotCount: number;}[];
}

/** What a shot was actually rendered against — the verification evidence. */
export interface ShotRender {
  shotId: string;
  assetVersions: Record<string, number>;
  /** characterId → wardrobe asset id observed, or an unregistered description. */
  wardrobe: Record<string, {assetId?: string;observed: string;}>;
}