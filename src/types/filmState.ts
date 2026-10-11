/**
 * PERSISTENT FILM STATE — P0 (HV-AIFILM-001 §7)
 *
 * The production memory of the film. Generated media is an OUTPUT of this
 * state, never the state itself: every generation records the state version it
 * was made against, and changes create a new version rather than editing one.
 */

export type Weather = 'dry' | 'rain' | 'haze';

/**
 * A fact about a production entity that holds from a point in the story
 * onward — "Amara is soaked from Scene 22". The timeline of facts is what lets
 * an injury in one scene carry into the next without anybody re-typing it.
 */
export interface StateFact {
  id: string;
  /** Entity the fact is about: a character, prop or vehicle id. */
  entityId: string;
  property: string;
  value: string;
  /** Holds from this scene number onward, until a later fact overrides it. */
  fromScene: number;
  cause: string;
}

export interface FilmStateVersion {
  id: string;
  n: number;
  parentId?: string;
  createdAt: string;
  createdBy: string;
  reason: string;
  /** Weather per scene id. Interiors keep their own rule (see location). */
  weather: Record<string, Weather>;
  facts: StateFact[];
  /** Human-readable diff against the parent. */
  changes: string[];
}

/** State resolved for one shot — the exact inputs a generation must honour. */
export interface ResolvedShotState {
  shotId: string;
  sceneId: string;
  weather: Weather;
  interior: boolean;
  facts: {entityId: string;property: string;value: string;cause: string;}[];
  /** Stable fingerprint of the above; a change means the shot is stale. */
  digest: string;
}

/* ------------------------------------------------------------------ rules */

export type RuleLevel = 'film' | 'sequence' | 'scene' | 'character' | 'shot';

export interface RulePredicate {
  subject: string;
  property: string;
  operator: 'never' | 'always';
  value: string;
}

export interface RuleVersion {
  version: number;
  text: string;
  predicate: RulePredicate;
  exceptions: string[];
  reason: string;
  createdAt: string;
  createdBy: string;
}

/**
 * A creative constraint the production must hold — "he never draws the gun".
 * Rules are checkable predicates, not prose: every generation is evaluated
 * against them, and a contradicting command is refused before it runs.
 */
export interface ProductionRule {
  id: string;
  level: RuleLevel;
  /** Sequence / scene / character / shot id the rule is scoped to; absent for film rules. */
  scopeId?: string;
  text: string;
  predicate: RulePredicate;
  /** What a compliant render shows for the subject, e.g. "holstered". */
  compliant: string;
  /** Shots explicitly allowed to break the rule, each an audited decision. */
  exceptions: string[];
  status: 'active' | 'suspended';
  version: number;
  history: RuleVersion[];
  /** Words that, together, mean a command would break this rule. */
  conflictTerms: string[][];
}

export interface RuleViolation {
  id: string;
  ruleId: string;
  ruleText: string;
  shotId: string;
  shotCode: string;
  versionId: string;
  versionN: number;
  evidence: string;
}

/* -------------------------------------------------------------- sequences */

export interface SequenceVersion {
  n: number;
  stateVersion: number;
  reason: string;
  createdAt: string;
}

/** A coherent production unit — not a loose collection of clips (§5). */
export interface Sequence {
  id: string;
  number: number;
  title: string;
  narrativeObjective: string;
  dramaticObjective: string;
  sceneIds: string[];
  versions: SequenceVersion[];
}

/* ----------------------------------------------------- generation context */

/**
 * Everything a shot version was generated against (§30). Answers "why does
 * this shot look this way?" and "which version of X made it?".
 */
export interface GenerationContext {
  id: string;
  shotId: string;
  versionId: string;
  stateVersion: number;
  state: ResolvedShotState;
  assetVersions: Record<string, number>;
  rules: {ruleId: string;version: number;}[];
  /** What the render actually shows, per rule subject — the evidence rules are checked against. */
  observed: Record<string, string>;
  provider: string;
  model: string;
  agent: string;
  instruction: string;
  parentVersionId?: string;
  createdAt: string;
}

/** A shot whose render no longer matches the current film state. */
export interface StaleShot {
  shotId: string;
  shotCode: string;
  renderedStateVersion: number;
  changes: string[];
}

export interface StateChangeProposal {
  fromVersion: number;
  toVersion: number;
  weather: Record<string, Weather>;
  facts: StateFact[];
  changes: string[];
  affectedShotIds: string[];
  unaffected: string[];
}