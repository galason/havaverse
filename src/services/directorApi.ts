import {
  agents,
  characters as seedCharacters,
  commandExamples,
  locations as seedLocations,
  project as seedProject,
  rightsIssues as seedRights,
  scenes as seedScenes,
  shots as seedShots,
  storyBible as seedBible } from
'../data/director';
import type {
  AgentId,
  AgentRun,
  Character,
  CommandScope,
  CostLine,
  DirectorPlan,
  FilmProject,
  GenerationJob,
  ImpactEntry,
  Location,
  ModelRoute,
  PublicationGate,
  QualityReport,
  RightsIssue,
  RouteRequest,
  Scene,
  Shot,
  ShotVersion,
  StageProgress,
  StoryBibleEntry } from
'../types/director';
import {
  configureContinuity,
  continuityApi,
  evaluateForGeneration,
  getContinuityStatus,
  onShotRendered,
  runAllChecks } from
'./continuityApi';
import {
  commitProposal,
  configureFilmState,
  conflictsFor,
  getStaleShots,
  getViolations,
  proposeWeather,
  recordGeneration,
  versionViolations } from
'./filmStateApi';

/**
 * DIRECTOR ORCHESTRATION SERVICE
 *
 * The single boundary between the console and the production engine. Every
 * route below is the shape the real service will expose:
 *
 *   GET   /api/director/projects/:id
 *   GET   /api/director/projects/:id/scenes
 *   GET   /api/director/projects/:id/shots
 *   GET   /api/director/shots/:id
 *   POST  /api/director/projects/:id/interpret     → DirectorPlan (no side effects)
 *   POST  /api/director/plans/:id/apply            → GenerationJob[]
 *   POST  /api/director/shots/:id/generate         → GenerationJob
 *   POST  /api/director/jobs/:id/cancel
 *   POST  /api/director/jobs/:id/retry
 *   POST  /api/director/versions/:id/approve
 *   POST  /api/director/versions/:id/restore
 *   GET   /api/director/projects/:id/rights
 *   GET   /api/director/projects/:id/cost
 *
 * Interpretation is deliberately SEPARATE from application: the user always
 * sees what will change, what is protected and what it costs before anything
 * runs. That is the product's central UX rule, so it is enforced here rather
 * than left to the view.
 */

export type ServiceResult<T> = {ok: true;data: T;} | {ok: false;error: string;};
const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ store */

const store = {
  project: { ...seedProject } as FilmProject,
  bible: seedBible.map((e) => ({ ...e })) as StoryBibleEntry[],
  characters: seedCharacters.map((c) => ({ ...c })) as Character[],
  locations: seedLocations.map((l) => ({ ...l })) as Location[],
  scenes: seedScenes.map((s) => ({ ...s })) as Scene[],
  shots: seedShots.map((s) => ({ ...s, versions: [...s.versions] })) as Shot[],
  jobs: [] as GenerationJob[],
  plans: new Map<string, DirectorPlan>(),
  rights: seedRights.map((r) => ({ ...r })) as RightsIssue[],
  runs: [
  { id: 'r1', agent: 'continuity' as AgentId, message: 'Amara continuity verified across 24 shots', at: Date.now() - 660_000, tone: 'ok' as const },
  { id: 'r2', agent: 'rights' as AgentId, message: '“Night Line” requires a sync licence before publish', at: Date.now() - 1_320_000, tone: 'warn' as const },
  { id: 'r3', agent: 'quality' as AgentId, message: 'Shot 22C failed wardrobe continuity — flagged for revision', at: Date.now() - 2_100_000, tone: 'warn' as const },
  { id: 'r4', agent: 'screenplay' as AgentId, message: 'Scene 22 dialogue tightened by 18%', at: Date.now() - 2_400_000, tone: 'ok' as const }] as
  AgentRun[]
};

let seq = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq += 1}`;

const log = (agent: AgentId, message: string, tone: AgentRun['tone'] = 'ok') => {
  store.runs.unshift({ id: nextId('run'), agent, message, at: Date.now(), tone });
  store.runs = store.runs.slice(0, 40);
};

// The continuity service reads shots and writes lock state back onto the
// director graph through this bridge rather than owning a second copy.
configureContinuity({
  getShots: () => store.shots,
  setEntityContinuity(type, entityId, state) {
    const list = type === 'character' ? store.characters : store.locations;
    const entity = list.find((e) => e.id === entityId);
    if (entity) entity.continuity = state;
  },
  log,
  currentUser: () => store.project.owner
});

// Film state reads the same shots and scenes; it owns state, rules and
// generation contexts, never a copy of the production graph.
configureFilmState({
  getShots: () => store.shots,
  getScenes: () => store.scenes,
  assetVersionsFor: (shotId) => continuityApi.getRender(shotId)?.assetVersions ?? {},
  log,
  currentUser: () => store.project.owner
});

/* ---------------------------------------------------------- model routing */

const catalogue = [
{ task: 'storyboard', provider: 'Atlas Vision', model: 'atlas-board-1', kobo: 180, seconds: 22, quality: 'draft' },
{ task: 'storyboard', provider: 'Atlas Vision', model: 'atlas-board-2', kobo: 420, seconds: 40, quality: 'standard' },
{ task: 'video', provider: 'Atlas Vision', model: 'atlas-cine-2', kobo: 2_400, seconds: 95, quality: 'standard' },
{ task: 'video', provider: 'Meridian', model: 'meridian-film-xl', kobo: 6_800, seconds: 210, quality: 'master' },
{ task: 'video', provider: 'Meridian', model: 'meridian-draft', kobo: 900, seconds: 45, quality: 'draft' },
{ task: 'voice', provider: 'Kolade Speech', model: 'kolade-voice-3', kobo: 640, seconds: 30, quality: 'standard' },
{ task: 'music', provider: 'HavaVerse Music', model: 'hv-score-1', kobo: 1_200, seconds: 70, quality: 'standard' },
{ task: 'sound', provider: 'HavaVerse Music', model: 'hv-foley-1', kobo: 480, seconds: 35, quality: 'standard' },
{ task: 'image', provider: 'Atlas Vision', model: 'atlas-still-2', kobo: 260, seconds: 18, quality: 'standard' },
{ task: 'edit', provider: 'HavaVerse Edit', model: 'hv-assembly-1', kobo: 320, seconds: 40, quality: 'standard' }] as
const;

/**
 * Chooses provider and model per task. The user is never asked which model to
 * use unless they open Professional mode — routing is a platform decision.
 */
export function routeModel(request: RouteRequest): ModelRoute {
  const forTask = catalogue.filter((entry) => entry.task === request.task);
  const exact = forTask.find((entry) => entry.quality === request.quality);
  const affordable =
  request.budgetKobo === undefined ?
  undefined :
  forTask.filter((e) => e.kobo <= request.budgetKobo!).sort((a, b) => b.kobo - a.kobo)[0];

  const chosen = affordable ?? exact ?? forTask[0];
  return {
    provider: chosen.provider,
    model: chosen.model,
    estimatedCostKobo: chosen.kobo,
    estimatedSeconds: chosen.seconds,
    reason:
    affordable && affordable !== exact ?
    'Routed down to stay inside the remaining budget.' :
    `Best ${request.quality} route for ${request.task} on current availability.`
  };
}

/* ------------------------------------------------------- derived progress */

const doneStatuses: Shot['status'][] = ['generated', 'approved'];

export function deriveStages(): StageProgress[] {
  const shots = store.shots;
  const boarded = shots.filter((s) => s.status !== 'planned').length;
  const generated = shots.filter((s) => doneStatuses.includes(s.status)).length;
  const approved = shots.filter((s) => s.status === 'approved').length;
  const scenesApproved = store.scenes.filter((s) => s.approved).length;
  const blockingRights = store.rights.some((r) => r.severity === 'blocking' && !r.resolved);
  const running = store.jobs.some((j) =>
  ['QUEUED', 'PREPARING', 'GENERATING', 'PROCESSING', 'QUALITY_CHECK', 'RETRYING'].includes(j.status)
  );

  const stage = (
  key: StageProgress['key'],
  name: string,
  agent: string,
  ratio: number,
  detail: string,
  blocked = false)
  : StageProgress => ({
    key,
    name,
    agent,
    ratio,
    status: blocked ? 'blocked' : ratio >= 1 ? 'complete' : ratio > 0 ? 'active' : 'queued',
    detail
  });

  const charLocked = store.characters.filter((c) => c.continuity === 'locked').length;
  const locLocked = store.locations.filter((l) => l.continuity === 'locked').length;

  return [
  stage('concept', 'Concept', 'Story Agent', store.project.logline ? 1 : 0, store.project.logline ? 'Logline and themes set' : 'No logline yet'),
  stage('story-bible', 'Story bible', 'Story Agent', store.bible.length > 0 ? 1 : 0, `${store.bible.length} entries · ${store.bible.filter((e) => e.locked).length} locked`),
  stage('screenplay', 'Screenplay', 'Screenplay Agent', ratioOf(scenesApproved, store.scenes.length), store.scenes.length ? `${scenesApproved} of ${store.scenes.length} scenes approved` : 'No scenes broken down yet'),
  stage('characters', 'Characters', 'Character Agent', ratioOf(charLocked, store.characters.length), store.characters.length ? `${charLocked} of ${store.characters.length} continuity-locked` : 'No reference packages yet'),
  stage('world', 'World', 'World Agent', ratioOf(locLocked, store.locations.length), store.locations.length ? `${locLocked} of ${store.locations.length} locations locked` : 'No locations built yet'),
  stage('storyboard', 'Storyboard', 'Storyboard Agent', ratioOf(boarded, shots.length), `${boarded} of ${shots.length} shots boarded`),
  stage('shots', 'Shots', 'Visual Agent', ratioOf(generated, shots.length), running ? `${generated} of ${shots.length} generated · jobs running` : `${generated} of ${shots.length} generated`),
  stage('performance', 'Performance', 'Acting Agent', ratioOf(approved, shots.length), `${approved} of ${shots.length} approved`),
  stage('audio', 'Audio', 'Voice · Music · Sound', 0, 'Waiting on picture lock'),
  stage('edit', 'Edit', 'Editing Agent', 0, 'Waiting on approved shots'),
  stage('post', 'Post', 'Colour Agent', 0, 'Not started'),
  stage(
    'rights',
    'Rights',
    'Rights Agent',
    blockingRights ? 0.5 : 1,
    blockingRights ? 'One blocking issue' : 'Cleared',
    blockingRights
  ),
  publishStage()];


  function publishStage(): StageProgress {
    const gate = derivePublicationGate();
    const held = gate.conditions.filter((c) => !c.passed && c.key !== 'quality').map((c) => c.key);
    return stage(
      'publish',
      'Publish',
      'Distribution Agent',
      gate.allowed ? 1 : 0,
      held.length > 0 ? `Held by ${held.join(' / ')} gate` : gate.allowed ? 'Cleared' : 'Ready when the cut is',
      held.length > 0
    );
  }
}

/** A stage with nothing in it has not started — never NaN, never "complete". */
function ratioOf(done: number, total: number): number {
  return total === 0 ? 0 : done / total;
}

/* --------------------------------------------------------- intent parsing */

const has = (text: string, ...words: string[]) => words.some((w) => text.includes(w));

function detectScope(text: string): {scope: CommandScope;targetIds: string[];} {
  const shotMatch = text.match(/\b(\d{1,3})\s*([a-e])\b/i);
  if (shotMatch) {
    const code = `${shotMatch[1]}${shotMatch[2].toUpperCase()}`;
    const shot = store.shots.find((s) => s.code === code);
    if (shot) return { scope: 'shot', targetIds: [shot.id] };
  }

  const sceneMatch = text.match(/scene\s*(\d{1,3})/i);
  if (sceneMatch) {
    const scene = store.scenes.find((s) => s.number === Number(sceneMatch[1]));
    if (scene) return { scope: 'scene', targetIds: [scene.id] };
  }

  const character = store.characters.find((c) =>
  text.includes(c.name.split(' ')[0].toLowerCase())
  );
  if (character) return { scope: 'character', targetIds: [character.id] };

  if (has(text, 'whole film', 'entire film', 'whole movie', 'entire movie', 'everywhere'))
  return { scope: 'film', targetIds: [] };

  if (has(text, 'lagos', 'world', 'location', 'yard', 'city'))
  return { scope: 'world', targetIds: [] };

  if (has(text, 'sequence', 'chase', 'across'))
  return { scope: 'sequence', targetIds: [] };

  return { scope: 'scene', targetIds: store.scenes.slice(-2).map((s) => s.id) };
}

interface Dimension {
  match: string[];
  agent: AgentId;
  reading: string;
  change: string;
  kind: ImpactEntry['kind'];
}

/** Maps creative language onto the production dimensions it actually moves. */
const dimensions: Dimension[] = [
{ match: ['tense', 'tension', 'suspense', 'suspenseful', 'scarier', 'dangerous', 'uneasy'], agent: 'acting', reading: 'Tension ↑ — performance held longer before the beat', change: 'Performance restraint increased', kind: 'shot' },
{ match: ['tense', 'tension', 'suspense', 'suspenseful', 'dangerous'], agent: 'camera', reading: 'Camera proximity ↑ — slow push replaces the locked frame', change: 'Movement changed to slow push in', kind: 'shot' },
{ match: ['tense', 'tension', 'suspense', 'dark', 'darker'], agent: 'colour', reading: 'Key level ↓ within the sodium/cyan rule', change: 'Lighting lowered one stop', kind: 'shot' },
{ match: ['score', 'music', 'soundtrack', 'cue'], agent: 'music', reading: 'Score treatment altered against picture', change: 'Music cue rewritten', kind: 'audio' },
{ match: ['sound', 'quiet', 'silence', 'loud', 'drop out'], agent: 'sound', reading: 'Sound design re-balanced around the beat', change: 'Sound cue re-balanced', kind: 'audio' },
{ match: ['closer', 'close', 'push', 'wide', 'wider', 'camera', 'lens', 'frame'], agent: 'camera', reading: 'Framing and lens reconsidered', change: 'Framing re-specified', kind: 'shot' },
{ match: ['emotional', 'emotion', 'less emotional', 'restrained', 'surprised', 'angry', 'hesitate', 'hesitation'], agent: 'acting', reading: 'Performance direction rewritten', change: 'Expression and timing adjusted', kind: 'shot' },
{ match: ['dialogue', 'line', 'says', 'shorter', 'shorten'], agent: 'screenplay', reading: 'Dialogue rewritten — downstream voice and sync affected', change: 'Dialogue revised', kind: 'scene' },
{ match: ['wardrobe', 'jacket', 'costume', 'clothes', 'uniform'], agent: 'character', reading: 'Character reference package updated', change: 'Wardrobe reference replaced', kind: 'character' },
{ match: ['warmer', 'colder', 'grade', 'colour', 'color', 'warm'], agent: 'colour', reading: 'Grade shifted within the locked colour rule', change: 'Grade adjusted', kind: 'shot' },
{ match: ['morning', 'night', 'dawn', 'dusk'], agent: 'world', reading: 'World time variant changed — affects every shot on that location', change: 'Time variant switched', kind: 'location' },
{ match: ['pacing', 'faster', 'slower', 'cut', 'edit'], agent: 'editing', reading: 'Edit pacing recalculated', change: 'Shot durations re-timed', kind: 'edit' },
{ match: ['generate', 'remaining', 'finish', 'board', 'storyboard'], agent: 'storyboard', reading: 'Remaining frames planned and queued', change: 'Storyboard frames generated', kind: 'shot' },
{ match: ['consistent', 'consistency', 'continuity', 'check', 'drift', 'verify'], agent: 'continuity', reading: 'Continuity audit across the affected range', change: 'Continuity re-verified', kind: 'shot' }];


const alwaysProtected = [
'Character identity',
'Story continuity',
'Locked Story Bible rules'];


/**
 * Turns a natural-language direction into an inspectable plan. No side
 * effects — the plan must be applied explicitly.
 */
export async function interpret(command: string): Promise<ServiceResult<DirectorPlan>> {
  await delay(750);
  const text = command.trim().toLowerCase();
  if (text.length < 4) {
    return { ok: false, error: 'Tell me what you want changed and I will work out what it touches.' };
  }

  // 1. A command that contradicts a Director's rule is never silently run.
  const conflicts = conflictsFor(text);
  if (conflicts.length > 0) {
    const blockedPlan: DirectorPlan = {
      id: nextId('plan'),
      command: command.trim(),
      scope: 'film',
      interpretation: conflicts.map((r) => `This contradicts the ${r.level} rule: “${r.text}”`),
      affected: [],
      protected: conflicts.map((r) => r.text),
      agents: ['continuity'],
      estimatedCostKobo: 0,
      estimatedSeconds: [0, 0],
      requiresApproval: false,
      blocked: {
        reason:
        'Nothing will be generated. Change the rule first — suspend it, reword it, or allow a specific shot as an exception.',
        rules: conflicts.map((r) => ({ id: r.id, text: r.text, level: r.level }))
      }
    };
    store.plans.set(blockedPlan.id, blockedPlan);
    log('continuity', `Refused “${command.trim()}” — contradicts ${conflicts.length === 1 ? 'a rule' : `${conflicts.length} rules`}`, 'warn');
    return ok(blockedPlan);
  }

  // 2. Weather is film state, not a prompt: it becomes a new state version and
  //    only the shots whose render depends on it are regenerated.
  // Word boundaries matter: "train" must never read as "rain".
  if (/\b(rain|raining|rainy|weather|dry|haze|hazy|harmattan)\b/.test(text)) {
    const proposal = proposeWeather(text);
    if (!proposal.ok) return { ok: false, error: proposal.error };
    const p = proposal.data;
    const perShot = routeModel({ task: 'video', quality: 'standard' });
    const affected: ImpactEntry[] = p.affectedShotIds.map((id) => {
      const shot = store.shots.find((s) => s.id === id)!;
      return {
        kind: 'shot',
        id,
        label: `Shot ${shot.code}`,
        change: `Regenerated against film state v${p.toVersion}`
      };
    });
    const statePlan: DirectorPlan = {
      id: nextId('plan'),
      command: command.trim(),
      scope: text.match(/scene\s*\d/) ? 'scene' : 'world',
      interpretation: [
      ...p.changes,
      `Film state v${p.fromVersion} → v${p.toVersion}. ${affected.length} rendered ${affected.length === 1 ? 'shot depends' : 'shots depend'} on what changed.`],

      affected,
      protected: [...p.unaffected, 'Dialogue', ...alwaysProtected],
      agents: affected.length > 0 ? ['world', 'visual'] : ['world'],
      estimatedCostKobo: affected.length * perShot.estimatedCostKobo,
      estimatedSeconds: [Math.max(10, affected.length * 40), Math.max(30, affected.length * perShot.estimatedSeconds)],
      requiresApproval: true,
      stateChange: p
    };
    store.plans.set(statePlan.id, statePlan);
    log('world', `State change analysed: ${p.changes.length} changes, ${affected.length} shots affected`, 'ok');
    return ok(statePlan);
  }

  const { scope, targetIds } = detectScope(text);

  const matched = dimensions.filter((d) => d.match.some((m) => text.includes(m)));
  const unique = new Map<string, Dimension>();
  matched.forEach((d) => {
    if (!unique.has(`${d.agent}:${d.change}`)) unique.set(`${d.agent}:${d.change}`, d);
  });
  const picked = [...unique.values()];

  if (picked.length === 0) {
    return {
      ok: false,
      error:
      'I could not tell which part of the production that touches. Name a scene, a shot, a character, or say what should feel different.'
    };
  }

  // Resolve the concrete entities in range.
  let shotsInRange: Shot[] = [];
  if (scope === 'shot') shotsInRange = store.shots.filter((s) => targetIds.includes(s.id));else
  if (scope === 'scene') shotsInRange = store.shots.filter((s) => targetIds.includes(s.sceneId));else
  if (scope === 'character')
  shotsInRange = store.shots.filter((s) => s.characterIds.some((id) => targetIds.includes(id)));else
  if (scope === 'world' || scope === 'film' || scope === 'sequence')
  shotsInRange = store.shots;

  const isAudit = picked.some((d) => d.agent === 'continuity');

  // A pure continuity audit never regenerates anything: it re-verifies the
  // locks and reports the shots that currently fail them.
  if (isAudit && picked.length === 1) {
    const status = getContinuityStatus();
    const targetEntity = scope === 'character' ? targetIds[0] : undefined;
    const failures = status.blockingFailures.filter(
      (f) =>
      !targetEntity ||
      continuityApi.assetForEntity('character', targetEntity)?.id === f.assetId ||
      continuityApi.assetForEntity('wardrobe', targetEntity)?.id === f.assetId
    );
    const lockedCount = status.assets.filter(
      (a) => a.locked && (!targetEntity || continuityApi.assetForEntity(a.type, targetEntity)?.id === a.assetId)
    ).length;
    const auditPlan: DirectorPlan = {
      id: nextId('plan'),
      command: command.trim(),
      scope: targetEntity ? 'character' : 'film',
      interpretation: [
      `Continuity Agent re-verifies ${lockedCount} locked ${lockedCount === 1 ? 'asset' : 'assets'} against every rendered shot`,
      failures.length === 0 ?
      'No shots currently fail a lock' :
      `${failures.length} ${failures.length === 1 ? 'shot currently fails' : 'shots currently fail'} a lock — listed below`],

      affected: failures.map((f) => ({ kind: 'shot', id: f.shotId, label: `Shot ${f.shotCode}`, change: f.reason })),
      protected: ['Every shot — an audit changes nothing', ...alwaysProtected],
      agents: ['continuity'],
      estimatedCostKobo: 0,
      estimatedSeconds: [5, 15],
      requiresApproval: false,
      audit: { entityId: targetEntity }
    };
    store.plans.set(auditPlan.id, auditPlan);
    return ok(auditPlan);
  }

  const isBoarding = picked.some((d) => d.agent === 'storyboard');
  if (isBoarding) shotsInRange = shotsInRange.filter((s) => s.status === 'planned');
  if (shotsInRange.length === 0) shotsInRange = store.shots.slice(0, 3);

  const affected: ImpactEntry[] = [];
  picked.forEach((dimension) => {
    if (dimension.kind === 'shot') {
      shotsInRange.slice(0, 6).forEach((shot) => {
        affected.push({
          kind: 'shot',
          id: shot.id,
          label: `Shot ${shot.code}`,
          change: dimension.change
        });
      });
    } else if (dimension.kind === 'character') {
      const target = store.characters.find((c) => targetIds.includes(c.id)) ?? store.characters[0];
      affected.push({ kind: 'character', id: target.id, label: target.name, change: dimension.change });
      shotsInRange.
      filter((s) => s.characterIds.includes(target.id)).
      slice(0, 6).
      forEach((shot) =>
      affected.push({
        kind: 'shot',
        id: shot.id,
        label: `Shot ${shot.code}`,
        change: 'Regenerated against the new reference package'
      })
      );
    } else if (dimension.kind === 'location') {
      const loc = store.locations.find((l) => shotsInRange.some((s) => s.locationId === l.id));
      if (loc) affected.push({ kind: 'location', id: loc.id, label: loc.name, change: dimension.change });
    } else if (dimension.kind === 'audio') {
      affected.push({ kind: 'audio', id: 'audio-cue', label: 'Score and sound cue', change: dimension.change });
    } else if (dimension.kind === 'edit') {
      affected.push({ kind: 'edit', id: 'edit-timeline', label: 'Edit timeline', change: dimension.change });
    } else if (dimension.kind === 'scene') {
      const scene = store.scenes.find((s) => targetIds.includes(s.id)) ?? store.scenes[0];
      affected.push({ kind: 'scene', id: scene.id, label: `Scene ${scene.number}`, change: dimension.change });
    }
  });

  // De-duplicate: one row per entity, changes merged.
  const merged = new Map<string, ImpactEntry>();
  affected.forEach((entry) => {
    const existing = merged.get(entry.id);
    if (existing) existing.change = `${existing.change}; ${entry.change.toLowerCase()}`;else
    merged.set(entry.id, { ...entry });
  });
  const rows = [...merged.values()];

  const regenerating = rows.filter((r) => r.kind === 'shot').length;
  const perShot = routeModel({ task: 'video', quality: 'standard' });
  const estimatedCostKobo = isAudit ? 0 : regenerating * perShot.estimatedCostKobo;

  const protectedList = [...alwaysProtected];
  if (!picked.some((d) => d.agent === 'screenplay')) protectedList.unshift('Dialogue');
  if (!picked.some((d) => d.agent === 'world')) protectedList.push('Location and weather');
  if (text.includes('keep everything else')) protectedList.push('Everything not named above');

  const plan: DirectorPlan = {
    id: nextId('plan'),
    command: command.trim(),
    scope,
    interpretation: picked.map((d) => d.reading),
    affected: rows,
    protected: protectedList,
    agents: [...new Set(picked.map((d) => d.agent))],
    estimatedCostKobo,
    estimatedSeconds: [
    Math.max(20, regenerating * 40),
    Math.max(60, regenerating * perShot.estimatedSeconds)],

    requiresApproval: regenerating > 0,
    warning:
    scope === 'film' && regenerating > 8 ?
    `This is a film-wide change. It re-runs ${regenerating} shots and cannot be undone in bulk — each shot keeps its previous version.` :
    undefined
  };

  store.plans.set(plan.id, plan);
  log('continuity', `Impact analysed: ${rows.length} entities affected, ${protectedList.length} protected`, 'ok');
  return ok(plan);
}

/* -------------------------------------------------------------- job engine */

function createJob(params: {
  agent: AgentId;
  label: string;
  shotId?: string;
  sceneId?: string;
  task: RouteRequest['task'];
  quality?: RouteRequest['quality'];
}): GenerationJob {
  const route = routeModel({ task: params.task, quality: params.quality ?? 'standard' });
  const job: GenerationJob = {
    id: nextId('job'),
    projectId: store.project.id,
    shotId: params.shotId,
    sceneId: params.sceneId,
    agent: params.agent,
    label: params.label,
    provider: route.provider,
    model: route.model,
    status: 'QUEUED',
    progress: 0,
    costKobo: route.estimatedCostKobo,
    createdAt: Date.now(),
    attempt: 1
  };
  store.jobs.unshift(job);
  return job;
}

export async function applyPlan(planId: string): Promise<ServiceResult<GenerationJob[]>> {
  await delay(400);
  const plan = store.plans.get(planId);
  if (!plan) return { ok: false, error: 'That plan has expired. Describe the change again.' };
  if (plan.blocked) return { ok: false, error: plan.blocked.reason };

  if (plan.stateChange) {
    const committed = commitProposal(plan.stateChange, plan.command);
    if (!committed.ok) return { ok: false, error: committed.error };
  }

  if (plan.audit) {
    const result = await runAllChecks(plan.audit.entityId);
    if (!result.ok) return { ok: false, error: result.error };
    return ok([]);
  }

  const created: GenerationJob[] = [];

  plan.affected.forEach((entry) => {
    if (entry.kind === 'shot') {
      const shot = store.shots.find((s) => s.id === entry.id);
      if (!shot) return;
      shot.status = 'generating';
      created.push(
        createJob({
          agent: plan.agents.includes('storyboard') ? 'storyboard' : 'visual',
          label: `Shot ${shot.code} — ${entry.change}`,
          shotId: shot.id,
          sceneId: shot.sceneId,
          task: plan.agents.includes('storyboard') ? 'storyboard' : 'video'
        })
      );
    } else if (entry.kind === 'audio') {
      created.push(createJob({ agent: 'music', label: entry.change, task: 'music' }));
    } else if (entry.kind === 'edit') {
      created.push(createJob({ agent: 'editing', label: entry.change, task: 'edit' }));
    }
  });

  if (created.length === 0) {
    log('continuity', plan.stateChange ? 'State updated — no rendered shot depended on it' : 'Audit run — no regeneration required', 'ok');
    return ok([]);
  }

  store.project.state = 'GENERATING';
  log('visual', `${created.length} ${created.length === 1 ? 'job' : 'jobs'} queued from “${plan.command}”`, 'run');
  return ok(created);
}

export async function generateShot(shotId: string): Promise<ServiceResult<GenerationJob>> {
  await delay(300);
  const shot = store.shots.find((s) => s.id === shotId);
  if (!shot) return { ok: false, error: 'That shot no longer exists.' };
  if (shot.status === 'generating')
  return { ok: false, error: 'That shot is already generating.' };

  shot.status = 'generating';
  const job = createJob({
    agent: 'visual',
    label: `Shot ${shot.code} — ${shot.description}`,
    shotId: shot.id,
    sceneId: shot.sceneId,
    task: 'video'
  });
  log('visual', `Generating shot ${shot.code}`, 'run');
  return ok(job);
}

const flow: Record<string, GenerationJob['status']> = {
  QUEUED: 'PREPARING',
  PREPARING: 'GENERATING',
  GENERATING: 'PROCESSING',
  PROCESSING: 'QUALITY_CHECK',
  RETRYING: 'GENERATING'
};

function runQualityCheck(shot: Shot): QualityReport {
  // Continuity-aware (FR-7): the report is produced from the locked assets in
  // frame, so an unlocked character fails here rather than drifting silently.
  return evaluateForGeneration(shot);
}

/**
 * Advances every in-flight job one step. Called on an interval by the context;
 * in production this is a websocket pushing real job state.
 */
export function tickJobs(): void {
  store.jobs.forEach((job) => {
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status)) return;

    if (job.status === 'QUALITY_CHECK') {
      const shot = store.shots.find((s) => s.id === job.shotId);
      if (!shot) {
        job.status = 'COMPLETED';
        job.progress = 1;
        return;
      }
      const agentName = agents.find((a) => a.id === job.agent)?.name ?? 'Visual Agent';
      const parentVersionId = shot.currentVersionId;
      const version: ShotVersion = {
        id: nextId('ver'),
        n: shot.versions.length + 1,
        createdAt: 'just now',
        agent: agentName,
        provider: job.provider,
        model: job.model,
        note: job.label,
        frame: shot.frame,
        qc: { passed: true, checks: [] },
        approved: false
      };
      shot.versions = [version, ...shot.versions];
      // Stamp continuity evidence first so the context records the asset
      // versions this render was actually made against.
      onShotRendered(shot);
      // §30: every version records the film state, asset versions and rules
      // it was generated against. Rule and state checks join continuity QC.
      const { checks: stateChecks } = recordGeneration(shot, {
        versionId: version.id,
        provider: job.provider,
        model: job.model,
        agent: agentName,
        instruction: job.label,
        parentVersionId
      });
      const continuityReport = runQualityCheck(shot);
      const checks = [...continuityReport.checks, ...stateChecks];
      const report: QualityReport = { passed: !checks.some((c) => c.result === 'fail'), checks };
      version.qc = report;
      shot.currentVersionId = version.id;
      shot.status = report.passed ? 'generated' : 'needs-revision';
      job.outputVersionId = version.id;
      job.status = 'COMPLETED';
      job.progress = 1;
      store.project.creditsRemaining = Math.max(0, store.project.creditsRemaining - job.costKobo);
      const failedCheck = report.checks.find((c) => c.result === 'fail');
      log(
        'quality',
        report.passed ?
        `Shot ${shot.code} v${version.n} passed QC — awaiting approval` :
        `Shot ${shot.code} v${version.n} failed ${failedCheck?.label.toLowerCase() ?? 'QC'} — needs revision`,
        report.passed ? 'ok' : 'warn'
      );
      return;
    }

    job.progress = Math.min(0.95, job.progress + 0.12 + Math.random() * 0.1);
    if (job.progress > 0.9 || job.status === 'QUEUED' || job.status === 'PREPARING') {
      const next = flow[job.status];
      if (next) {
        job.status = next;
        if (next === 'QUALITY_CHECK') job.progress = 0.96;
      }
    }
  });

  const running = store.jobs.some((j) =>
  ['QUEUED', 'PREPARING', 'GENERATING', 'PROCESSING', 'QUALITY_CHECK'].includes(j.status)
  );
  if (!running && store.project.state === 'GENERATING') {
    store.project.state = 'PERFORMANCE_REVIEW';
    store.project.transitions.unshift({
      id: nextId('tr'),
      from: 'GENERATING',
      to: 'PERFORMANCE_REVIEW',
      at: 'just now',
      by: 'Director Orchestrator',
      reason: 'All queued generation jobs settled'
    });
  }
}

export async function cancelJob(jobId: string): Promise<ServiceResult<null>> {
  await delay(200);
  const job = store.jobs.find((j) => j.id === jobId);
  if (!job) return { ok: false, error: 'That job is gone.' };
  if (['COMPLETED', 'FAILED'].includes(job.status))
  return { ok: false, error: 'That job has already finished.' };
  job.status = 'CANCELLED';
  const shot = store.shots.find((s) => s.id === job.shotId);
  if (shot) shot.status = shot.versions.length > 0 ? 'generated' : 'storyboarded';
  log(job.agent, `${job.label} cancelled`, 'warn');
  return ok(null);
}

export async function retryJob(jobId: string): Promise<ServiceResult<null>> {
  await delay(200);
  const job = store.jobs.find((j) => j.id === jobId);
  if (!job) return { ok: false, error: 'That job is gone.' };
  job.status = 'RETRYING';
  job.progress = 0;
  job.attempt += 1;
  job.error = undefined;
  const shot = store.shots.find((s) => s.id === job.shotId);
  if (shot) shot.status = 'generating';
  return ok(null);
}

/* --------------------------------------------------- versions + approvals */

export async function approveVersion(
shotId: string,
versionId: string)
: Promise<ServiceResult<null>> {
  await delay(300);
  const shot = store.shots.find((s) => s.id === shotId);
  const version = shot?.versions.find((v) => v.id === versionId);
  if (!shot || !version) return { ok: false, error: 'That version is not available.' };
  if (!version.qc.passed)
  return { ok: false, error: 'This version failed quality control. Regenerate or restore an earlier version.' };
  const broken = versionViolations(shot, versionId);
  if (broken.length > 0)
  return { ok: false, error: `This version breaks a Director’s rule: ${broken[0].ruleText}` };

  shot.versions.forEach((v) => v.approved = v.id === versionId);
  shot.currentVersionId = versionId;
  shot.status = 'approved';
  log('visual', `Shot ${shot.code} v${version.n} approved`, 'ok');
  return ok(null);
}

/**
 * Rejects the current version of a shot. An earlier version that honours
 * every rule is restored if one exists; otherwise the shot needs revision.
 * Nothing is deleted — the rejected version stays in history.
 */
export async function rejectVersion(shotId: string): Promise<ServiceResult<{restored?: number;}>> {
  await delay(300);
  const shot = store.shots.find((s) => s.id === shotId);
  const current = shot?.versions.find((v) => v.id === shot.currentVersionId);
  if (!shot || !current) return { ok: false, error: 'That shot has no version to reject.' };

  current.approved = false;
  current.qc = {
    passed: false,
    checks: [...current.qc.checks.filter((c) => c.label !== 'Rejected'), { label: 'Rejected', result: 'fail', note: 'Rejected by the director.' }]
  };
  const fallback = shot.versions.find(
    (v) => v.id !== current.id && v.qc.passed && versionViolations(shot, v.id).length === 0
  );
  if (fallback) {
    shot.currentVersionId = fallback.id;
    shot.status = fallback.approved ? 'approved' : 'generated';
    log('visual', `Shot ${shot.code} v${current.n} rejected — restored v${fallback.n}`, 'warn');
    return ok({ restored: fallback.n });
  }
  shot.status = 'needs-revision';
  log('visual', `Shot ${shot.code} v${current.n} rejected — needs revision`, 'warn');
  return ok({});
}

export async function restoreVersion(
shotId: string,
versionId: string)
: Promise<ServiceResult<null>> {
  await delay(300);
  const shot = store.shots.find((s) => s.id === shotId);
  const version = shot?.versions.find((v) => v.id === versionId);
  if (!shot || !version) return { ok: false, error: 'That version is not available.' };
  shot.currentVersionId = versionId;
  shot.status = version.approved ? 'approved' : version.qc.passed ? 'generated' : 'needs-revision';
  log('visual', `Shot ${shot.code} restored to v${version.n}`, 'ok');
  return ok(null);
}

/**
 * Re-locks a drifted character reference package. Until this runs, every shot
 * containing them fails the consistency check — which is the point.
 */
export async function relockCharacter(characterId: string): Promise<ServiceResult<null>> {
  const character = store.characters.find((c) => c.id === characterId);
  if (!character) return { ok: false, error: 'That character is not in this project.' };
  const asset = continuityApi.assetForEntity('character', characterId);
  if (!asset) return { ok: false, error: `${character.name} has no reference package to lock.` };

  // Re-locking goes through the continuity service so it is versioned and
  // audited like every other lock, and brings a draft wardrobe with it.
  if (asset.status !== 'locked') {
    const locked = await continuityApi.lockAsset(asset.id, 'Re-locked from the Story Bible');
    if (!locked.ok) return { ok: false, error: locked.error };
  }
  const wardrobe = continuityApi.assetForEntity('wardrobe', characterId);
  if (wardrobe && wardrobe.status !== 'locked') {
    const locked = await continuityApi.lockAsset(wardrobe.id, `Locked with ${character.name}`);
    if (!locked.ok) return { ok: false, error: locked.error };
  }
  character.references += 4;
  return ok(null);
}

export async function setSceneApproval(
sceneId: string,
approved: boolean)
: Promise<ServiceResult<null>> {
  await delay(250);
  const scene = store.scenes.find((s) => s.id === sceneId);
  if (!scene) return { ok: false, error: 'That scene is not in this project.' };
  scene.approved = approved;
  log('screenplay', `Scene ${scene.number} ${approved ? 'approved' : 'reopened'}`, 'ok');
  return ok(null);
}

/* ------------------------------------------------------------ cost + rights */

export function deriveCost(): {lines: CostLine[];totalKobo: number;} {
  const completed = store.jobs.filter((j) => j.status === 'COMPLETED');
  const byTask = (agentIds: AgentId[]) =>
  completed.filter((j) => agentIds.includes(j.agent)).reduce((sum, j) => sum + j.costKobo, 0);

  // Historical spend already booked against the project, plus this session.
  const lines: CostLine[] = [
  { label: 'Video generation', kobo: 12_840_000 + byTask(['visual']), units: `${store.shots.reduce((n, s) => n + s.versions.length, 0)} versions` },
  { label: 'Storyboard', kobo: 1_210_000 + byTask(['storyboard']), units: `${store.shots.length} frames` },
  { label: 'Voice', kobo: 2_060_000 + byTask(['voice']), units: '3 principal voices' },
  { label: 'Music', kobo: 1_640_000 + byTask(['music']), units: '9 cues' },
  { label: 'Sound', kobo: 720_000 + byTask(['sound']), units: 'Design and foley' },
  { label: 'Rendering and storage', kobo: 950_000 + byTask(['editing', 'colour']), units: '1.8 TB' }];

  return { lines, totalKobo: lines.reduce((sum, line) => sum + line.kobo, 0) };
}

export async function resolveRightsIssue(issueId: string): Promise<ServiceResult<null>> {
  await delay(600);
  const issue = store.rights.find((r) => r.id === issueId);
  if (!issue) return { ok: false, error: 'That issue is not on this project.' };
  issue.resolved = true;
  log('rights', `${issue.category} resolved — publish gate re-evaluated`, 'ok');
  return ok(null);
}

/**
 * FR-12: the Publication Gate. Rights, continuity and quality are evaluated
 * independently so every blocker is visible at once, not one at a time.
 */
export function derivePublicationGate(): PublicationGate {
  const rights = store.rights.filter((r) => r.severity === 'blocking' && !r.resolved);
  const continuity = getContinuityStatus();
  const unapproved = store.shots.filter((s) => s.status !== 'approved');
  const revision = unapproved.filter((s) => s.status === 'needs-revision');

  const continuityIssues = [
  ...continuity.unlockedInUse.
  filter((a) => a.type === 'character' || a.type === 'location').
  map((a) => `${a.name} is not continuity-locked (${a.shotCount} shots)`),
  ...continuity.blockingFailures.map((f) => `Shot ${f.shotCode} — ${f.reason}`),
  ...getViolations().map((v) => `Shot ${v.shotCode} breaks a rule — ${v.evidence}`),
  ...getStaleShots().map((s) => `Shot ${s.shotCode} rendered against state v${s.renderedStateVersion} — ${s.changes[0]}`)];


  const conditions: PublicationGate['conditions'] = [
  {
    key: 'rights',
    label: 'Rights gate',
    passed: rights.length === 0,
    detail: rights.length === 0 ? 'All clearances on file' : `${rights.length} blocking ${rights.length === 1 ? 'issue' : 'issues'}`,
    issues: rights.map((r) => `${r.category}: ${r.reason}`)
  },
  {
    key: 'continuity',
    label: 'Continuity gate',
    passed: continuityIssues.length === 0,
    detail:
    continuityIssues.length === 0 ?
    'Every lock verified' :
    `${continuityIssues.length} unresolved ${continuityIssues.length === 1 ? 'issue' : 'issues'}`,
    issues: continuityIssues
  },
  {
    key: 'quality',
    label: 'Quality gate',
    // An empty cut is not a cut: nothing to publish is never "cleared".
    passed: store.shots.length > 0 && unapproved.length === 0,
    detail:
    store.shots.length === 0 ?
    'No shots yet — there is nothing to publish' :
    unapproved.length === 0 ?
    'Every shot approved' :
    `${unapproved.length} shots awaiting approval${revision.length > 0 ? ` · ${revision.length} need revision` : ''}`,
    issues:
    store.shots.length === 0 ?
    ['The project has no shots yet'] :
    revision.map((s) => `Shot ${s.code} needs revision`)
  }];


  const failed = conditions.filter((c) => !c.passed);
  return {
    allowed: failed.length === 0,
    reason:
    failed.length === 0 ?
    'Cleared for publish.' :
    failed.map((c) => `${c.label}: ${c.issues[0] ?? c.detail}`).join(' · '),
    conditions
  };
}

export function canPublish(): {allowed: boolean;reason: string;} {
  const gate = derivePublicationGate();
  return { allowed: gate.allowed, reason: gate.reason };
}

/* ------------------------------------------------------- project state I/O */

/**
 * The production engine holds ONE open project at a time — exactly as the
 * server holds one working copy per project id. The projects service swaps
 * working copies in and out through these three functions; nothing else in
 * the app sees a snapshot.
 */
export interface DirectorSnapshot {
  project: FilmProject;
  bible: StoryBibleEntry[];
  characters: Character[];
  locations: Location[];
  scenes: Scene[];
  shots: Shot[];
  jobs: GenerationJob[];
  plans: [string, DirectorPlan][];
  rights: RightsIssue[];
  runs: AgentRun[];
}

export function exportDirectorState(): DirectorSnapshot {
  return structuredClone({
    project: store.project,
    bible: store.bible,
    characters: store.characters,
    locations: store.locations,
    scenes: store.scenes,
    shots: store.shots,
    jobs: store.jobs,
    plans: [...store.plans.entries()],
    rights: store.rights,
    runs: store.runs
  });
}

export function importDirectorState(snapshot: DirectorSnapshot) {
  const s = structuredClone(snapshot);
  store.project = s.project;
  store.bible = s.bible;
  store.characters = s.characters;
  store.locations = s.locations;
  store.scenes = s.scenes;
  store.shots = s.shots;
  store.jobs = s.jobs;
  store.plans = new Map(s.plans);
  store.rights = s.rights;
  store.runs = s.runs;
}

/** Jobs that would be orphaned by closing the project right now. */
export function runningJobCount(): number {
  return store.jobs.filter((j) =>
  ['QUEUED', 'PREPARING', 'GENERATING', 'PROCESSING', 'QUALITY_CHECK', 'RETRYING'].includes(j.status)
  ).length;
}

export interface NewProjectInput {
  id: string;
  title: string;
  format: string;
  logline: string;
  genre: string;
  setting: string;
  characters: {name: string;note: string;}[];
  poster: string;
  owner: string;
}

/**
 * A project starts in story development: its idea is written into the Story
 * Bible, and nothing downstream (reference packages, locations, scenes,
 * shots) exists until the specialist agents produce it. Empty is honest.
 */
export function blankDirectorState(input: NewProjectInput): DirectorSnapshot {
  const at = new Date().toISOString();
  const bible: StoryBibleEntry[] = [
  { id: 'sb-premise', section: 'narrative', label: 'Premise', value: input.logline, locked: false },
  { id: 'sb-genre', section: 'narrative', label: 'Genre', value: input.genre, locked: false }];

  if (input.setting.trim()) {
    bible.push({ id: 'sb-world', section: 'world', label: 'Setting', value: input.setting.trim(), locked: false });
  }
  input.characters.forEach((c, i) => {
    bible.push({
      id: `sb-char-${i + 1}`,
      section: 'character',
      label: c.name,
      value: c.note || 'Described in development — no reference package yet.',
      locked: false
    });
  });
  return {
    project: {
      id: input.id,
      title: input.title,
      format: input.format,
      owner: input.owner,
      logline: input.logline,
      poster: input.poster,
      state: 'STORY_DEVELOPMENT',
      mode: 'simple',
      transitions: [
      { id: 'tr-created', from: 'DRAFT', to: 'STORY_DEVELOPMENT', at, by: input.owner, reason: 'Project created from an idea' }],

      creditsRemaining: seedProject.creditsRemaining
    },
    bible,
    characters: [],
    locations: [],
    scenes: [],
    shots: [],
    jobs: [],
    plans: [],
    rights: [],
    runs: [{ id: nextId('run'), agent: 'screenplay', message: `${input.title} opened in story development`, at: Date.now(), tone: 'ok' }]
  };
}

/** Records a pipeline transition — the only way project.state changes. */
export function transitionProject(to: FilmProject['state'], by: string, reason: string) {
  if (store.project.state === to) return;
  store.project.transitions = [
  { id: nextId('tr'), from: store.project.state, to, at: new Date().toISOString(), by, reason },
  ...store.project.transitions];

  store.project.state = to;
  log('screenplay', reason, 'ok');
}

/* ------------------------------------------------------------------ reads */

export const directorApi = {
  async getProject() {
    await delay(180);
    return ok({ ...store.project });
  },
  async getBible() {
    await delay(160);
    return ok(store.bible.map((e) => ({ ...e })));
  },
  async getCharacters() {
    await delay(160);
    return ok(store.characters.map((c) => ({ ...c })));
  },
  async getLocations() {
    await delay(160);
    return ok(store.locations.map((l) => ({ ...l })));
  },
  async getScenes() {
    await delay(180);
    return ok(store.scenes.map((s) => ({ ...s })));
  },
  async getShots(sceneId?: string) {
    await delay(200);
    const all = store.shots.map((s) => ({ ...s, versions: [...s.versions] }));
    return ok(sceneId ? all.filter((s) => s.sceneId === sceneId) : all);
  },
  async getShot(shotId: string) {
    await delay(180);
    const shot = store.shots.find((s) => s.id === shotId);
    return ok(shot ? { ...shot, versions: [...shot.versions] } : null);
  },
  async getRights() {
    await delay(160);
    return ok(store.rights.map((r) => ({ ...r })));
  },
  getJobs: () => store.jobs.map((j) => ({ ...j })),
  getRuns: () => store.runs.map((r) => ({ ...r })),
  getAgents: () => agents,
  examples: commandExamples,
  interpret,
  applyPlan,
  generateShot,
  cancelJob,
  retryJob,
  approveVersion,
  restoreVersion,
  rejectVersion,
  setSceneApproval,
  relockCharacter,
  resolveRightsIssue,
  routeModel,
  deriveStages,
  deriveCost,
  canPublish,
  derivePublicationGate,
  tickJobs,
  setMode(mode: FilmProject['mode']) {
    store.project.mode = mode;
  }
};