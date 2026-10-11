/**
 * HavaVerse AI Entertainment Director — domain model.
 *
 * The Director is an ORCHESTRATOR, not a generator. It owns the FilmProject
 * state, decides what needs to happen, dispatches specialist agents as async
 * jobs, protects continuity, versions every output and stops at approval and
 * rights gates.
 *
 * Nothing here is a view model. Every percentage, cost and status shown in the
 * console is derived from these entities — never authored as a display string.
 */

import type { StateChangeProposal } from './filmState';

/* ---------------------------------------------------------------- pipeline */

export type ProductionState =
'DRAFT' |
'CONCEPT_READY' |
'STORY_DEVELOPMENT' |
'STORY_LOCKED' |
'SCREENPLAY_GENERATING' |
'SCREENPLAY_READY' |
'CHARACTER_DEVELOPMENT' |
'WORLD_DEVELOPMENT' |
'PRE_PRODUCTION' |
'STORYBOARDING' |
'SHOT_PLANNING' |
'GENERATING' |
'PERFORMANCE_REVIEW' |
'EDITING' |
'SOUND' |
'POST_PRODUCTION' |
'QUALITY_CONTROL' |
'READY_TO_PUBLISH' |
'PUBLISHED';

export interface StateTransition {
  id: string;
  from: ProductionState;
  to: ProductionState;
  at: string;
  by: string;
  reason: string;
}

/** A pipeline stage's status is computed, never stored as a literal. */
export type StageKey =
'concept' |
'story-bible' |
'screenplay' |
'characters' |
'world' |
'storyboard' |
'shots' |
'performance' |
'audio' |
'edit' |
'post' |
'rights' |
'publish';

export interface StageProgress {
  key: StageKey;
  name: string;
  agent: string;
  /** 0–1, derived from the entities that stage owns. */
  ratio: number;
  status: 'complete' | 'active' | 'queued' | 'blocked';
  detail: string;
}

/* ------------------------------------------------------------ story bible */

export interface StoryBibleEntry {
  id: string;
  section: 'narrative' | 'character' | 'world' | 'production-rules';
  label: string;
  value: string;
  /** Continuity authority: locked entries cannot be contradicted by agents. */
  locked: boolean;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  portrait: string;
  age: string;
  appearance: string;
  wardrobe: string;
  personality: string;
  motivation: string;
  voice: string;
  accent: string;
  arc: string;
  relationships: {characterId: string;relation: string;}[];
  /** Reference package handed to visual/acting/voice agents on every shot. */
  references: number;
  continuity: 'locked' | 'drifting' | 'unverified';
}

export interface Location {
  id: string;
  name: string;
  plate: string;
  period: string;
  architecture: string;
  geography: string;
  weather: string;
  lighting: string;
  props: string[];
  timeVariants: string[];
  continuity: 'locked' | 'drifting' | 'unverified';
}

/* ------------------------------------------------------- scenes and shots */

export type ShotStatus =
'planned' |
'storyboarded' |
'generating' |
'needs-revision' |
'generated' |
'approved';

export interface ShotSpec {
  camera: string;
  lens: string;
  movement: string;
  framing: string;
  lighting: string;
  performance: string;
  durationSeconds: number;
  transition: string;
}

export interface ShotVersion {
  id: string;
  n: number;
  createdAt: string;
  agent: string;
  provider: string;
  model: string;
  note: string;
  frame: string;
  qc: QualityReport;
  approved: boolean;
}

export interface QualityReport {
  passed: boolean;
  checks: {label: string;result: 'pass' | 'warn' | 'fail';note: string;}[];
}

export interface Shot {
  id: string;
  /** 23C — human-facing production slug. */
  code: string;
  sceneId: string;
  order: number;
  description: string;
  action: string;
  dialogue?: string;
  characterIds: string[];
  locationId: string;
  spec: ShotSpec;
  status: ShotStatus;
  frame: string;
  versions: ShotVersion[];
  currentVersionId?: string;
}

export interface Scene {
  id: string;
  number: number;
  act: 1 | 2 | 3;
  slug: string;
  synopsis: string;
  locationId: string;
  characterIds: string[];
  pages: number;
  approved: boolean;
}

/* -------------------------------------------------------------- job engine */

export type JobStatus =
'QUEUED' |
'PREPARING' |
'GENERATING' |
'PROCESSING' |
'QUALITY_CHECK' |
'COMPLETED' |
'FAILED' |
'CANCELLED' |
'RETRYING';

/** FR-12: publish is allowed only when every condition passes. */
export interface GateCondition {
  key: 'rights' | 'continuity' | 'quality';
  label: string;
  passed: boolean;
  detail: string;
  issues: string[];
}

export interface PublicationGate {
  allowed: boolean;
  reason: string;
  conditions: GateCondition[];
}

export type AgentId =
'story' |
'screenplay' |
'character' |
'world' |
'continuity' |
'storyboard' |
'shot-planning' |
'visual' |
'acting' |
'camera' |
'voice' |
'music' |
'sound' |
'editing' |
'colour' |
'quality' |
'rights' |
'distribution';

export interface AgentDefinition {
  id: AgentId;
  name: string;
  version: string;
  purpose: string;
  /** Which asset classes it may write. Enforced by the orchestrator. */
  writes: string[];
  requiresApproval: boolean;
  timeoutSeconds: number;
  retries: number;
}

export interface GenerationJob {
  id: string;
  projectId: string;
  sceneId?: string;
  shotId?: string;
  agent: AgentId;
  label: string;
  provider: string;
  model: string;
  status: JobStatus;
  /** 0–1. Advanced by the job runner, never faked by the view. */
  progress: number;
  costKobo: number;
  createdAt: number;
  error?: string;
  outputVersionId?: string;
  attempt: number;
}

/* ---------------------------------------------------------- model routing */

export interface RouteRequest {
  task: 'storyboard' | 'video' | 'voice' | 'music' | 'sound' | 'image' | 'edit';
  quality: 'draft' | 'standard' | 'master';
  budgetKobo?: number;
}

export interface ModelRoute {
  provider: string;
  model: string;
  estimatedCostKobo: number;
  estimatedSeconds: number;
  reason: string;
}

/* ------------------------------------------------- director command engine */

export type CommandScope = 'shot' | 'scene' | 'sequence' | 'character' | 'world' | 'film';

export interface ImpactEntry {
  kind: 'shot' | 'scene' | 'character' | 'location' | 'audio' | 'edit';
  id: string;
  label: string;
  change: string;
}

export interface DirectorPlan {
  id: string;
  command: string;
  scope: CommandScope;
  /** Layer 2 — what HavaVerse understood. */
  interpretation: string[];
  /** Layer 3 — what will actually run. */
  affected: ImpactEntry[];
  protected: string[];
  agents: AgentId[];
  estimatedCostKobo: number;
  estimatedSeconds: [number, number];
  requiresApproval: boolean;
  warning?: string;
  /** Present on continuity audits — applying re-verifies instead of regenerating. */
  audit?: {entityId?: string;};
  /** Present when the change is to film state — applying writes a new state version first. */
  stateChange?: StateChangeProposal;
  /** Present when the command contradicts a Director's rule. It cannot be applied. */
  blocked?: {reason: string;rules: {id: string;text: string;level: string;}[];};
}

/* --------------------------------------------------------- rights and cost */

export interface RightsIssue {
  id: string;
  severity: 'blocking' | 'advisory';
  category: string;
  reason: string;
  affects: string[];
  resolution: string;
  resolved: boolean;
}

export interface CostLine {
  label: string;
  kobo: number;
  units: string;
}

/* ------------------------------------------------------------------ feed */

export interface AgentRun {
  id: string;
  agent: AgentId;
  message: string;
  at: number;
  tone: 'ok' | 'warn' | 'run' | 'fail';
}

/* --------------------------------------------------------------- project */

export interface FilmProject {
  id: string;
  title: string;
  format: string;
  owner: string;
  logline: string;
  poster: string;
  state: ProductionState;
  mode: 'simple' | 'director' | 'professional';
  transitions: StateTransition[];
  creditsRemaining: number;
}