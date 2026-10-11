# HavaVerse AI Film Production Engine — Engineering Response

Response to HV-AIFILM-001 v1.0 · 23 September 2026
Basis: inspection of the current Studio implementation. No code was changed for this document.

**What this codebase is.** A React/TypeScript prototype. The Studio runs against in-browser services (`services/directorApi.ts`, `services/continuityApi.ts`) that behave like the eventual backend: typed results, persistent in-memory state, a job queue with a lifecycle. **No real generation model is called.** Jobs advance a real state machine and create real version records, but the "frame" is seeded artwork. Everything below separates *exists as working state* from *exists only as a label*.

---

## 1. Architecture mapping — what exists and where

| Layer | Exists | Where |
|---|---|---|
| Film project + production state machine (19 states, audited transitions) | Working | `types/director.ts:36-43, 338-349` |
| Pipeline stages derived from entity state (13 stages, no authored numbers) | Working | `directorApi.deriveStages()` |
| Story Bible (narrative / character / world / production-rules, per-entry lock) | Working | `types/director.ts:73-80`, `data/director.ts:73-100`, `/studio/bible` |
| Characters (appearance, wardrobe, voice, accent, arc, relationships) | Working, descriptive text | `types/director.ts:82-99` |
| Locations (architecture, geography, weather, lighting, props[], time variants) | Working, descriptive text | `types/director.ts:101-113` |
| Scenes (act, synopsis, location, cast, approval) | Working | `types/director.ts:172-182`, `/studio/scene/:id` |
| Shots with ShotSpec (camera, lens, movement, framing, lighting, performance, duration, transition) | Working | `types/director.ts:125-170`, `/studio/shot/:id` |
| Shot versions — never overwritten, approve/restore, QC per version | Working | `ShotVersion`, `approveVersion`, `restoreVersion` |
| Natural-language direction → scoped plan → explicit accept → execute | Working | `interpret()` / `applyPlan()` in `directorApi.ts:226-451` |
| Generation job queue (QUEUED → … → COMPLETED / FAILED / CANCELLED / RETRYING) | Working state machine, no model | `GenerationJob`, `tickJobs()`, `/studio/jobs` |
| Model router (task + quality/budget → provider/model/cost/eta) | Working, static catalogue | `routeModel()` |
| Agent registry (18 agents, version, `writes[]`, approval, timeout, retries) | Declared; `writes[]` not enforced at runtime | `data/director.ts:411-430` |
| Agent activity feed | Working | `AgentRun`, `components/director/AgentFeed.tsx` |
| Continuity layer — locked, versioned, audited assets (character / location / wardrobe / grade) | Working | `types/continuity.ts`, `services/continuityApi.ts`, `/studio/continuity` |
| Render provenance (which asset versions + wardrobe a shot was rendered against) | Working | `ShotRender`, `continuityApi.stamp()` |
| Continuity checks (lock / generation / manual triggers, shot-level failures) | Working; compares recorded evidence, not pixels | `evaluate()`, `ContinuityCheck` |
| Pre-generation QC gate | Working | `evaluateForGeneration()` |
| Rights issues (blocking / advisory) | Working | `RightsIssue`, `resolveRightsIssue()` |
| Publication gate (rights + continuity + quality) | Working | `derivePublicationGate()`, `PublicationGatePanel.tsx` |
| Cost ledger per task line + credits | Working | `deriveCost()` |
| Dashboard / Creative Universe consume Director state | Working | `services/dashboardApi.ts` |

**Exists only as a label (not a data structure):** sequence (a `CommandScope` value only), edit/timeline (agent + stage + impact kind, no `EditTimeline`), audio/score (agents + cost lines, no `AudioAsset`), screenplay (agent exists, no screenplay document — only `Scene.synopsis` + `Shot.dialogue`), props (strings on a location).

**Absent:** series/season/episode, vehicles, prop identity, wardrobe damage state, character physical/emotional state over time, spatial map / blocking, camera path, choreography, weather as state (only a location attribute), director rules as enforceable predicates, takes as parallel alternatives, beat sheet, dependency graph, assembly.

`data/production.ts` is a legacy seed from the first Studio mock and is no longer the source for the live Studio. It should be deleted in P0.

---

## 2. Reusable systems — usable without modification

- **Plan → accept → execute contract** (`interpret`/`applyPlan`). This is exactly the spec's §36 "filmmaker control" pattern. Keep it as the only way consequential changes happen.
- **Job queue lifecycle and cancel/retry.** Provider-agnostic already; becomes the generation orchestrator's queue.
- **Model router interface** (`RouteRequest` → `ModelRoute`). Stable internal interface; providers are adapters behind it (§29).
- **Version-never-overwrite semantics** on shots and locked assets (§20).
- **Locked asset lifecycle + audit log** (§24). Extend the type union; do not rebuild.
- **Render provenance stamp** (`ShotRender`). Becomes the "state version used" half of §30 provenance.
- **Publication gate structure** (independent conditions, each with issues and a resolution path). New conditions slot in (§32).
- **Agent activity feed and registry display.**
- **Continuity bridge pattern** (`configureContinuity`) — a service consuming Director state without owning a duplicate store. The model for every new state service.

## 3. Extension points

| Extend | How |
|---|---|
| `LockedAssetType` | Add `prop`, `vehicle`, `voice`, `score`, `rule`. Same lock/version/audit path. |
| `ShotRender` | Grow from asset versions to a full **Generation Context** snapshot id (state version + rules + inherited sequence state). |
| `CommandScope` / `dimensions` table | Add `episode`, `season`, `series`; dimensions for weather-as-state, choreography, camera path, style, take requests ("four ways"), take merging ("v3 choreography + v1 cinematography"). |
| `interpret()` impact resolution | Replace scope-range heuristics with a dependency-graph query (§27). The plan shape (`affected`, `protected`) stays. |
| `evaluateForGeneration()` | Add rule evaluation, inherited-state checks and spatial-continuity checks as further QC rows. |
| `derivePublicationGate()` | Add narrative integrity, audio, captions, technical delivery, consent, trust & safety conditions. |
| `AgentDefinition.writes[]` | Enforce in the orchestrator: an agent job that writes outside its classes is rejected. |
| `FilmProject.format` | Becomes a discriminated production container: `film` or `series`. |
| Studio pipeline rail | Stages become Story / World / Sequences / Takes / Assembly / Delivery, still derived. |

## 4. Missing capabilities — genuinely new

1. **Persistent Film State** — a versioned, machine-readable state document per project with typed slices (narrative, character, world, spatial, prop, wardrobe, vehicle, temporal, camera, audio, visual, rules). Today state is spread across entity fields as prose.
2. **State timeline** — character/prop/wardrobe/vehicle state *changes at story events* (injury in shot 34 available in 35). Needs state deltas keyed to shots, and a resolver that computes "state at shot N".
3. **Sequence entity** with objective, cast, location, spatial map, choreography, camera plan, rules, takes and an approved take.
4. **Director rules as predicates** — "hero never draws the gun" must be checkable, not only protected text.
5. **Spatial model** — location topology (floors, landings, doors, windows, connections) plus per-beat positions/orientation of characters, props and camera.
6. **Choreography** — structured action beats (stance → movement → contact → reaction → recovery) linked to spatial positions.
7. **Camera path** — continuous-take representation (keyframed path, subject tracking, focus/framing changes) distinct from per-shot specs.
8. **Takes** — N parallel generations from one state version, compare, select canonical, merge dimensions.
9. **Production dependency graph** — explicit edges from state/asset versions to sequences, shots, takes and assembly; invalidation propagation.
10. **Assembly / edit timeline** — ordered approved takes with duration, transitions, audio tracks; watchable in the existing `/watch` player.
11. **Series container** — series → season → episode, with a shared universe that owns recurring assets.
12. **Real generation adapters** — none exist. Requires a server.

## 5. Data model changes

```ts
// Production container
Production { id; kind: 'film' | 'series'; universeId; title; logline; stateVersionId }
Series { id; productionId; seasons: Season[] }
Season { id; number; episodeIds[] }
Episode { id; seasonId; number; title; sequenceIds[]; stateVersionId }
Universe { id; assetIds[]; ruleIds[]; styleId }        // shared across episodes

// Narrative (screenplay stays authoritative)
Beat { id; order; summary; sequenceId? }
ScreenplayDocument { id; version; scenes: { sceneId; heading; action; dialogue[] }[] }

// Sequence engine
Sequence {
  id; episodeId | filmId; order; title;
  narrativeObjective; dramaticObjective;
  sceneIds[]; castIds[]; locationId;
  spatialMapId; choreographyId?; cameraPlanId?;
  styleId; ruleIds[];
  versions: SequenceVersion[]; approvedVersionId?
}
SequenceVersion { id; n; parentId?; changes: Dimension[]; stateVersionId; takeIds[]; selectedTakeId? }
Take { id; sequenceVersionId; label; variation: Partial<Record<Dimension, string>>; shotVersionIds[]; qc; selected }

// Persistent film state
FilmStateVersion { id; productionId; n; parentId?; createdAt; createdBy; reason; slices: FilmStateSlices }
StateDelta { id; atShotId; entityId; path: string; from: unknown; to: unknown; cause: string }
// e.g. { entityId:'char-hero', path:'wardrobe.jacket.damage', to:'torn left sleeve', cause:'Shot 34 fall' }

// Assets (extend LockedAssetType)
PropPayload { displayName; kind; heldBy?; state; referenceImages[] }
VehiclePayload { make; model; year; colour; bodyCondition; damage: {area; note}[]; plate?; referenceImages[] }

// Rules
ProductionRule {
  id; level: 'universe'|'film'|'series'|'episode'|'sequence'|'scene'|'character'|'shot';
  scopeId; text;
  predicate: { subject: string; property: string; operator: 'never'|'always'|'equals'; value: unknown };
  version; status: 'active'|'suspended'
}
RuleViolation { ruleId; shotVersionId; evidence; detectedBy: AgentId }

// Spatial
SpatialMap { id; locationId; nodes: { id; kind:'floor'|'landing'|'door'|'window'|'room'; label }[]; edges: { from; to; kind:'stairs'|'door'|'sightline' }[] }
BlockingKeyframe { t; entityId; nodeId; position:[x,y,z]; facing }

// Choreography & camera
ActionBeat { id; order; actorId; targetId?; phase:'stance'|'move'|'contact'|'reaction'|'recovery'; nodeId; durationMs }
CameraPlan { id; continuous: boolean; keyframes: { t; position; target; lensMm; focusEntityId }[] }

// Graph + provenance
DependencyEdge { from: EntityRef; to: EntityRef; kind: 'reads'|'derivedFrom'|'assembledFrom' }
GenerationContext { id; stateVersionId; assetVersions: Record<assetId, number>; ruleIds[]; inheritedFromShotId?; spatialKeyframes[]; styleId }
// ShotVersion gains: generationContextId, parentVersionId, parameters, instruction

// Assembly
Timeline { id; productionId; episodeId?; version; clips: { takeId; shotVersionId; in; out; transition }[]; audio: AudioTrack[] }
```

Relationships that matter: `ShotVersion → GenerationContext → FilmStateVersion + asset versions + rules`. That chain is what answers "why does this shot look this way?" and "which character version generated this?".

## 6. Service changes

| Service | Change |
|---|---|
| `filmStateApi` (new) | Create state versions, apply deltas, resolve `stateAt(shotId)`, diff two versions. The single source every generation reads. |
| `sequenceApi` (new) | CRUD, versions, takes (`requestTakes(n, variations)`), `selectTake`, `mergeTakes(dimensionSources)`. |
| `rulesApi` (new) | CRUD with level scoping, `evaluate(shotVersion)` → violations, suspend/modify with audit. |
| `graphApi` (new) | Maintain `DependencyEdge`s; `impactOf(change)` → affected entities; used by `interpret()`. |
| `assemblyApi` (new) | Timeline from selected takes; export to `/watch` via the existing `watchApi` entitlement path. |
| `directorApi` | `interpret()` uses `graphApi.impactOf`; plans can create versions (sequence/state) instead of only jobs; `applyPlan` writes a new `FilmStateVersion` before queueing. |
| `continuityApi` | New asset types; checks for inherited state (state-at-shot vs rendered), spatial continuity, vehicle damage. |
| Generation orchestrator | Builds `GenerationContext` per job; routes via `routeModel`; enforces agent `writes[]`. Server-side. |
| Publication gate | New conditions listed in §3. |

All new services follow the existing boundary pattern: typed `ServiceResult`, documented `/api/studio/*` routes, in-browser implementation until the server exists.

## 7. AI agent changes

| Agent | Status | Change |
|---|---|---|
| Screenplay | Exists (v3.1) | Owns `ScreenplayDocument`; on edit, emits affected-material via graph. |
| Director | New (orchestration logic lives in `interpret`) | Formalise as an agent: direction → plan → state/sequence versions. |
| Continuity | Exists (v2.2) | Add inherited-state, spatial, prop, vehicle checks. |
| Choreography / Action | New | Produces `ActionBeat[]` + blocking keyframes against the `SpatialMap`. |
| Camera | Exists (v2.3) | Produces `CameraPlan`, including continuous takes. |
| Generation | Split out of `visual`/`acting` | Coordinates multi-model generation from `GenerationContext`. |
| Quality | Exists (v2.5) | Multi-level: shot, scene (cuts connect), sequence (geography/causality), episode, film. |
| Rules | New (could live in Continuity) | Detects `RuleViolation`s on every new version. |
| Rights | Exists (v3.0) | Unchanged; stays distinct from continuity and consent (§33). |
| Editorial | Exists as `editing` (v1.8) | Owns `Timeline`, take comparison, pacing. |
| Publication | Exists as `distribution` (v1.4) | Owns the extended gate. |

## 8. Studio changes

- **Studio home → "My Film"**: the §50 summary (sequences, scenes, shots, approved takes, locks, checks, issues, runtime, Watch film). Built from derived counts, like the pipeline today.
- **New `/studio/sequence/:id`**: objective, cast, spatial map, choreography beats, camera plan, rules, takes side-by-side, selected take.
- **ScenePage / ShotDetail**: show inherited state ("Hero: jacket torn left sleeve since Shot 34"), rule checks, generation context.
- **StoryBible**: add Rules (levelled), Props, Vehicles.
- **Continuity page**: new asset types; rule violations section with Reject / Regenerate / Modify rule / Create version.
- **DirectorConsole**: plans show "Changing this will affect: 3 scenes · 18 shots · 2 vehicle appearances · 1 lock" with Review / Create new version / Cancel.
- **New `/studio/timeline`**: assembly of selected takes, playable in the existing player.
- **Series**: season/episode navigator above sequences.

Existing design tokens, dark/light themes and component language stay the source of truth. The filmmaker sees *Locked · Verified · Needs attention · Generating · Ready*; the underlying state is inspectable in Professional mode only (the existing mode switch already provides this split).

## 9. Production graph — how current entities form persistent film state

```
Universe ── assets (Character, Location, Wardrobe, Grade, +Prop, +Vehicle, +Voice, +Score)
   │         └── LockedAsset versions (exists)
   ├── Rules (Story Bible production-rules → ProductionRule predicates)
   └── Production (FilmProject today)
         ├── ScreenplayDocument ── Scenes (exist)
         ├── FilmStateVersion ── StateDeltas keyed to Shots
         └── Sequences (new) ── Scenes ── Shots (exist)
                  │                         └── ShotVersions (exist) ── GenerationContext (new; ShotRender today)
                  └── SequenceVersions ── Takes ── ShotVersions
                                               └── Timeline clips ── /watch
```

Today's `ShotRender` already captures asset-version provenance, and today's continuity check already detects "rendered against v1, lock is v2". Generalising that from asset versions to state versions and rules is the core of P0 — the mechanism is proven in the current code; its coverage is what grows.

## 10. Implementation roadmap

### P0 — the film has a memory
1. Delete `data/production.ts`. Introduce `Production` container (film only) wrapping `FilmProject`.
2. `FilmStateVersion` + `StateDelta` + `stateAt(shotId)`; seed from current entity prose.
3. `Sequence` + `SequenceVersion`; group existing scenes into sequences.
4. `ProductionRule` with predicates; migrate Story Bible production rules; rule evaluation in QC.
5. `GenerationContext` replaces `ShotRender`; every `ShotVersion` references one.
6. Extend `LockedAssetType` with `prop`, `vehicle`; the Brown '73 as a seeded vehicle.
7. `interpret()` produces version-creating plans; consequence summary in the console.
8. Studio: My Film summary, Sequence page (without spatial/choreography), rule violations on Continuity.

*P0 acceptance:* The Rule Test (§47) and the Creative Change Test (§49) pass against in-browser state: a violating version is flagged with Reject / Regenerate / Modify rule / Create version, and "Make it rain" produces a new state version, lists affected shots, and queues only those.

### P1 — the film has geography
Spatial maps and blocking · choreography beats · continuous camera plans · takes with compare/select/merge (§48 Four Takes Test) · dependency graph replacing heuristic impact · multi-level Quality agent · assembly timeline playable in `/watch`.

*P1 acceptance:* The Stairwell Test (§45) is representable end to end as structured data (map, beats, camera path, rules) and a four-take comparison produces one canonical take.

### P2 — the film becomes a series
Series/season/episode + shared universe (§46 Brown '73 Test across episodes) · advanced routing · performance, voice and score continuity · delivery variants · automation at scale.

### Dependencies outside this prototype
Real generation, embedding-based continuity verification, spatially consistent video models and durable storage all require a server and model providers. The prototype can make every structure, plan, check and gate real; it cannot make the pixels real. Each of those capabilities sits behind an interface that already exists (`routeModel`, `evaluate`, the job queue), so connecting them replaces implementations, not the Studio.
