import { IMAGES } from './catalog';
import type {
  AgentDefinition,
  Character,
  FilmProject,
  Location,
  RightsIssue,
  Scene,
  Shot,
  ShotStatus,
  StoryBibleEntry } from
'../types/director';

/**
 * Seed state for one FilmProject. This stands in for the production database;
 * the service layer is the only thing that reads it.
 */

export const project: FilmProject = {
  id: 'proj-last-train',
  title: 'The Last Train',
  format: 'Feature film · 96 pages',
  owner: 'Adaeze Films',
  logline:
  'A signal engineer discovers the night train she has maintained for nine years has been carrying something the city was never told about.',
  poster: IMAGES.heroLastTrain,
  state: 'STORYBOARDING',
  mode: 'simple',
  transitions: [
  {
    id: 'tr1',
    from: 'PRE_PRODUCTION',
    to: 'STORYBOARDING',
    at: '2 days ago',
    by: 'Storyboard Agent',
    reason: 'Screenplay, characters and world all approved'
  }],

  creditsRemaining: 41_200
};

export const storyBible: StoryBibleEntry[] = [
{
  id: 'sb1',
  section: 'narrative',
  label: 'Premise',
  value:
  'Lagos, 2042. The southbound night line runs on a schedule nobody signed off. Amara Okonkwo, nine years a signal engineer, starts reading the gaps.',
  locked: true
},
{
  id: 'sb2',
  section: 'narrative',
  label: 'Theme',
  value: 'Institutional silence, and what it costs the people who keep the machine running.',
  locked: true
},
{
  id: 'sb3',
  section: 'narrative',
  label: 'Tone',
  value: 'Restrained. Procedural until it is not. No score under dialogue before Act Three.',
  locked: true
},
{
  id: 'sb4',
  section: 'narrative',
  label: 'Chronology',
  value: 'Six nights, told in order. One flashback only, in Scene 31.',
  locked: true
},
{
  id: 'sb5',
  section: 'production-rules',
  label: 'Aspect ratio',
  value: '2.39:1 throughout. No ratio change for the flashback.',
  locked: true
},
{
  id: 'sb6',
  section: 'production-rules',
  label: 'Camera language',
  value:
  'Locked-off frames while Amara still trusts the system. Handheld only after Scene 23.',
  locked: true
},
{
  id: 'sb7',
  section: 'production-rules',
  label: 'Colour',
  value: 'Sodium amber for railway property, cold cyan for everything the state controls.',
  locked: true
},
{
  id: 'sb8',
  section: 'production-rules',
  label: 'Dialogue',
  value: 'Nigerian English and Pidgin, code-switched by class not by character.',
  locked: false
},
{
  id: 'sb9',
  section: 'world',
  label: 'Technology rule',
  value: 'No holograms. 2042 Lagos is patched, not rebuilt — new systems on old concrete.',
  locked: true
},
{
  id: 'sb10',
  section: 'world',
  label: 'Weather',
  value: 'Harmattan haze in Act One, rain from Scene 22 onward.',
  locked: true
}];


export const characters: Character[] = [
{
  id: 'ch-amara',
  name: 'Amara Okonkwo',
  role: 'Protagonist · Signal engineer',
  portrait: IMAGES.creator,
  age: '34',
  appearance:
  'Tall, close-cropped hair, a burn scar along the left forearm from a relay fire in 2038.',
  wardrobe:
  'Railway-issue navy coverall, reflective band at the cuff, a grey jacket she never zips.',
  personality: 'Methodical, unsentimental, slow to speak and very hard to move once decided.',
  motivation: 'She signed the safety logs. If the line is lying, her name is on it.',
  voice: 'Low, unhurried, drops to almost nothing when she is angry.',
  accent: 'Lagos English, Igbo at home.',
  arc: 'From custodian of the system to the person who stops it.',
  relationships: [
  { characterId: 'ch-daniel', relation: 'Former apprentice, now reports against her' },
  { characterId: 'ch-controller', relation: 'Nine years under the same supervisor' }],

  references: 34,
  continuity: 'locked'
},
{
  id: 'ch-daniel',
  name: 'Daniel Eze',
  role: 'Junior controller',
  portrait: IMAGES.kings,
  age: '26',
  appearance: 'Slight, always in the newer uniform, glasses he keeps cleaning.',
  wardrobe: 'Pressed control-room blues, lanyard with three passes.',
  personality: 'Eager, frightened of being blamed, decent underneath it.',
  motivation: 'Keep the job. His mother is on the housing list.',
  voice: 'Quick, higher register, trails off mid-sentence.',
  accent: 'Lagos English with Pidgin under pressure.',
  arc: 'From compliance to the one who hands her the manifest.',
  relationships: [{ characterId: 'ch-amara', relation: 'Trained by her, testifies against her' }],
  references: 21,
  continuity: 'locked'
},
{
  id: 'ch-controller',
  name: 'Mrs Bassey',
  role: 'Line controller',
  portrait: IMAGES.afro,
  age: '58',
  appearance: 'Short, immaculate, reading glasses on a chain.',
  wardrobe: 'Civil-service grey, a railway pin from a service that no longer exists.',
  personality: 'Courteous and immovable. Never raises her voice.',
  motivation: 'The line runs. Everything else is somebody else’s department.',
  voice: 'Measured, formal, slightly antique diction.',
  accent: 'Received Nigerian English.',
  arc: 'Holds the line until she cannot, then chooses it anyway.',
  relationships: [{ characterId: 'ch-amara', relation: 'Supervisor and obstacle' }],
  references: 12,
  continuity: 'drifting'
}];


export const locations: Location[] = [
{
  id: 'loc-yard',
  name: 'Lagos Railway Yard',
  plate: IMAGES.heroLastTrain,
  period: '2042',
  architecture: 'Colonial-era sheds re-skinned in corrugated composite, new gantries bolted over.',
  geography: 'Twelve sidings running north-east, flood channel along the western edge.',
  weather: 'Rain from Scene 22. Standing water between sleepers.',
  lighting: 'Sodium floods every 40m, half of them dead.',
  props: ['Signal lever frame', 'Relay cabinet 7', 'Hand lamp', 'Manifest clipboard'],
  timeVariants: ['Night', 'Pre-dawn', 'Harmattan dusk'],
  continuity: 'locked'
},
{
  id: 'loc-carriage',
  name: 'Carriage 4 — Interior',
  plate: IMAGES.lastTrain,
  period: '2042',
  architecture: 'Refitted 1990s stock, new seat shells over original steel ribs.',
  geography: 'Fourth of nine. Sealed door at the rear that is not on the plan.',
  weather: 'Condensation on glass.',
  lighting: 'Failing strip light, one tube strobing.',
  props: ['Sealed rear door', 'Seat 4F', 'Emergency handle, wired shut'],
  timeVariants: ['Night', 'Lights out'],
  continuity: 'locked'
},
{
  id: 'loc-control',
  name: 'Central Control',
  plate: IMAGES.lagos,
  period: '2042',
  architecture: 'Open floor, twenty desks, one wall of live track diagram.',
  geography: 'Ninth floor, overlooking the yard she works in.',
  weather: 'Sealed. Rain only as sound.',
  lighting: 'Cold cyan from the diagram wall — state colour, per the bible.',
  props: ['Track diagram wall', 'Log terminal', 'Bassey’s desk'],
  timeVariants: ['Night shift', 'Day shift'],
  continuity: 'locked'
}];


const sceneSeed: Omit<Scene, 'id'>[] = [
{
  number: 20,
  act: 2,
  slug: 'INT. CENTRAL CONTROL — NIGHT',
  synopsis: 'Amara requests the manifest for the 02:40. Bassey refuses, politely.',
  locationId: 'loc-control',
  characterIds: ['ch-amara', 'ch-controller'],
  pages: 3,
  approved: true
},
{
  number: 21,
  act: 2,
  slug: 'EXT. RAILWAY YARD — NIGHT',
  synopsis: 'She walks the sidings counting carriages. There are nine. The plan says eight.',
  locationId: 'loc-yard',
  characterIds: ['ch-amara'],
  pages: 2,
  approved: true
},
{
  number: 22,
  act: 2,
  slug: 'EXT. RAILWAY YARD — NIGHT (RAIN)',
  synopsis: 'Rain starts. Daniel finds her at relay cabinet 7 and tells her to go home.',
  locationId: 'loc-yard',
  characterIds: ['ch-amara', 'ch-daniel'],
  pages: 4,
  approved: true
},
{
  number: 23,
  act: 2,
  slug: 'INT. CARRIAGE 4 — NIGHT',
  synopsis: 'Amara reaches the sealed door at the rear of carriage four.',
  locationId: 'loc-carriage',
  characterIds: ['ch-amara'],
  pages: 3,
  approved: true
},
{
  number: 24,
  act: 2,
  slug: 'INT. CARRIAGE 4 — CONTINUOUS',
  synopsis: 'The door opens. What she finds is never shown — only her face, and the sound.',
  locationId: 'loc-carriage',
  characterIds: ['ch-amara'],
  pages: 2,
  approved: false
},
{
  number: 25,
  act: 2,
  slug: 'INT. CENTRAL CONTROL — PRE-DAWN',
  synopsis: 'Bassey is already at her desk. She has been waiting.',
  locationId: 'loc-control',
  characterIds: ['ch-amara', 'ch-controller', 'ch-daniel'],
  pages: 5,
  approved: false
}];


export const scenes: Scene[] = sceneSeed.map((scene) => ({
  ...scene,
  id: `sc-${scene.number}`
}));

const frameFor = (locationId: string) =>
locations.find((l) => l.id === locationId)?.plate ?? IMAGES.lastTrain;

interface ShotSeed {
  scene: number;
  letter: string;
  description: string;
  action: string;
  dialogue?: string;
  characterIds: string[];
  camera: string;
  lens: string;
  movement: string;
  framing: string;
  lighting: string;
  performance: string;
  duration: number;
  status: ShotStatus;
}

const shotSeed: ShotSeed[] = [
// Scene 20 — approved
{ scene: 20, letter: 'A', description: 'Wide — control floor', action: 'Amara crosses the floor.', characterIds: ['ch-amara'], camera: 'Static', lens: '35mm', movement: 'Locked off', framing: 'Wide', lighting: 'Cold cyan key', performance: 'Neutral', duration: 6, status: 'approved' },
{ scene: 20, letter: 'B', description: 'Two-shot at the desk', action: 'She asks. Bassey does not look up.', dialogue: 'AMARA: The manifest for the 02:40.', characterIds: ['ch-amara', 'ch-controller'], camera: 'Static', lens: '50mm', movement: 'Locked off', framing: 'Medium two', lighting: 'Desk practical', performance: 'Restrained', duration: 9, status: 'approved' },
{ scene: 20, letter: 'C', description: 'CU Bassey', action: 'The refusal, courteously.', dialogue: 'BASSEY: That is not a yard document.', characterIds: ['ch-controller'], camera: 'Static', lens: '85mm', movement: 'Locked off', framing: 'Close', lighting: 'Soft fill', performance: 'Immovable', duration: 5, status: 'approved' },
{ scene: 20, letter: 'D', description: 'CU Amara', action: 'She accepts it. She does not believe it.', characterIds: ['ch-amara'], camera: 'Static', lens: '85mm', movement: 'Locked off', framing: 'Close', lighting: 'Cyan edge', performance: 'Withheld', duration: 4, status: 'approved' },

// Scene 21 — approved
{ scene: 21, letter: 'A', description: 'Wide — sidings', action: 'Amara walks the line, counting.', characterIds: ['ch-amara'], camera: 'Static', lens: '28mm', movement: 'Locked off', framing: 'Very wide', lighting: 'Sodium floods', performance: 'Procedural', duration: 11, status: 'approved' },
{ scene: 21, letter: 'B', description: 'Tracking — coupling line', action: 'Carriages pass camera left.', characterIds: [], camera: 'Dolly', lens: '35mm', movement: 'Lateral track', framing: 'Medium', lighting: 'Sodium, half dead', performance: '—', duration: 8, status: 'approved' },
{ scene: 21, letter: 'C', description: 'CU Amara — the ninth', action: 'The count does not resolve.', characterIds: ['ch-amara'], camera: 'Static', lens: '85mm', movement: 'Locked off', framing: 'Close', lighting: 'Hand lamp', performance: 'Stillness', duration: 6, status: 'approved' },

// Scene 22 — generated, awaiting approval
{ scene: 22, letter: 'A', description: 'Wide — rain begins', action: 'Rain starts across the floods.', characterIds: [], camera: 'Static', lens: '28mm', movement: 'Locked off', framing: 'Wide', lighting: 'Sodium through rain', performance: '—', duration: 7, status: 'generated' },
{ scene: 22, letter: 'B', description: 'Amara at relay cabinet 7', action: 'She works the relay with the lamp in her teeth.', characterIds: ['ch-amara'], camera: 'Handheld', lens: '35mm', movement: 'Slight drift', framing: 'Medium', lighting: 'Hand lamp key', performance: 'Absorbed', duration: 10, status: 'generated' },
{ scene: 22, letter: 'C', description: 'Daniel arrives', action: 'He approaches from the dark, umbrella-less.', dialogue: 'DANIEL: Ma, they said go home.', characterIds: ['ch-daniel'], camera: 'Handheld', lens: '50mm', movement: 'Follow', framing: 'Medium', lighting: 'Backlit by floods', performance: 'Nervous', duration: 8, status: 'needs-revision' },
{ scene: 22, letter: 'D', description: 'Two-shot in rain', action: 'Neither of them moves.', characterIds: ['ch-amara', 'ch-daniel'], camera: 'Handheld', lens: '35mm', movement: 'Drift', framing: 'Medium two', lighting: 'Sodium, rain highlights', performance: 'Held', duration: 12, status: 'generated' },
{ scene: 22, letter: 'E', description: 'CU Amara — decision', action: 'She looks toward carriage four.', characterIds: ['ch-amara'], camera: 'Handheld', lens: '85mm', movement: 'Micro push', framing: 'Close', lighting: 'Rim only', performance: 'Resolve', duration: 5, status: 'generated' },

// Scene 23 — storyboarded, mid-generation
{ scene: 23, letter: 'A', description: 'Amara enters carriage', action: 'Door slides. Strobing tube.', characterIds: ['ch-amara'], camera: 'Handheld', lens: '28mm', movement: 'Follow in', framing: 'Wide', lighting: 'Failing strip', performance: 'Cautious', duration: 9, status: 'storyboarded' },
{ scene: 23, letter: 'B', description: 'POV — the aisle', action: 'Nine rows to the sealed door.', characterIds: [], camera: 'Handheld', lens: '35mm', movement: 'Slow advance', framing: 'POV', lighting: 'Strobe', performance: '—', duration: 11, status: 'storyboarded' },
{ scene: 23, letter: 'C', description: 'CU Amara — hesitation', action: 'She stops before the handle.', characterIds: ['ch-amara'], camera: 'Handheld', lens: '85mm', movement: 'Slow push in', framing: 'Close', lighting: 'Strobe on one side', performance: 'Fear, suppressed', duration: 7, status: 'storyboarded' },
{ scene: 23, letter: 'D', description: 'Insert — the wired handle', action: 'Emergency handle, wired shut.', characterIds: [], camera: 'Static', lens: '100mm macro', movement: 'Locked off', framing: 'Insert', lighting: 'Lamp', performance: '—', duration: 3, status: 'storyboarded' },
{ scene: 23, letter: 'E', description: 'Wide — she reaches', action: 'Her hand finds the seal.', characterIds: ['ch-amara'], camera: 'Handheld', lens: '35mm', movement: 'Drift', framing: 'Wide', lighting: 'Strobe', performance: 'Committed', duration: 6, status: 'planned' },

// Scene 24 — planned
{ scene: 24, letter: 'A', description: 'CU Amara — the door opens', action: 'Light from beyond frame, on her face only.', characterIds: ['ch-amara'], camera: 'Static', lens: '85mm', movement: 'Locked off', framing: 'Close', lighting: 'Off-frame source', performance: 'Unreadable', duration: 14, status: 'planned' },
{ scene: 24, letter: 'B', description: 'Wide — carriage, from behind', action: 'She stands in the doorway. We do not see in.', characterIds: ['ch-amara'], camera: 'Static', lens: '28mm', movement: 'Locked off', framing: 'Wide', lighting: 'Silhouette', performance: 'Still', duration: 10, status: 'planned' },
{ scene: 24, letter: 'C', description: 'Insert — her hand on the frame', action: 'Grip tightens.', characterIds: ['ch-amara'], camera: 'Static', lens: '100mm macro', movement: 'Locked off', framing: 'Insert', lighting: 'Spill', performance: '—', duration: 4, status: 'planned' },

// Scene 25 — planned
{ scene: 25, letter: 'A', description: 'Wide — control, pre-dawn', action: 'Bassey alone at the diagram wall.', characterIds: ['ch-controller'], camera: 'Static', lens: '35mm', movement: 'Locked off', framing: 'Wide', lighting: 'Cyan wall', performance: 'Waiting', duration: 8, status: 'planned' },
{ scene: 25, letter: 'B', description: 'Amara enters, soaked', action: 'She does not sit.', characterIds: ['ch-amara', 'ch-controller'], camera: 'Handheld', lens: '50mm', movement: 'Follow', framing: 'Medium two', lighting: 'Cyan key', performance: 'Contained fury', duration: 13, status: 'planned' },
{ scene: 25, letter: 'C', description: 'CU Bassey — the admission', action: 'She has been waiting nine years too.', dialogue: 'BASSEY: Sit down, Amara.', characterIds: ['ch-controller'], camera: 'Static', lens: '85mm', movement: 'Locked off', framing: 'Close', lighting: 'Cyan, soft', performance: 'Finally tired', duration: 9, status: 'planned' },
{ scene: 25, letter: 'D', description: 'Daniel in the doorway', action: 'He is holding the manifest.', characterIds: ['ch-daniel'], camera: 'Handheld', lens: '50mm', movement: 'Drift', framing: 'Medium', lighting: 'Corridor spill', performance: 'Terrified, decided', duration: 7, status: 'planned' }];


let versionCounter = 0;

function seedVersion(shot: ShotSeed, frame: string) {
  versionCounter += 1;
  return {
    id: `ver-${shot.scene}${shot.letter}-1`,
    n: 1,
    createdAt: 'yesterday',
    agent: 'Visual Agent',
    provider: 'Atlas Vision',
    model: 'atlas-cine-2',
    note: 'First pass from the approved storyboard frame.',
    frame,
    qc: {
      passed: shot.status !== 'needs-revision',
      checks:
      shot.status === 'needs-revision' ?
      [
      { label: 'Character consistency', result: 'pass' as const, note: 'Daniel matches reference set.' },
      { label: 'Wardrobe continuity', result: 'fail' as const, note: 'Lanyard missing — present in 22B and 25D.' },
      { label: 'Environment continuity', result: 'pass' as const, note: 'Rain and flood levels match 22B.' },
      { label: 'Temporal artifacts', result: 'warn' as const, note: 'Slight flicker on the reflective band, frames 40–52.' }] :

      [
      { label: 'Character consistency', result: 'pass' as const, note: 'Face and build within tolerance.' },
      { label: 'Wardrobe continuity', result: 'pass' as const, note: 'Matches the locked reference package.' },
      { label: 'Environment continuity', result: 'pass' as const, note: 'Lighting rule honoured.' },
      { label: 'Framing', result: 'pass' as const, note: 'Matches the shot specification.' }]

    },
    approved: shot.status === 'approved'
  };
}

export const shots: Shot[] = shotSeed.map((seed, i) => {
  const scene = scenes.find((s) => s.number === seed.scene)!;
  const frame = frameFor(scene.locationId);
  const hasVersion = ['generated', 'approved', 'needs-revision'].includes(seed.status);
  const version = hasVersion ? seedVersion(seed, frame) : null;

  return {
    id: `shot-${seed.scene}${seed.letter}`,
    code: `${seed.scene}${seed.letter}`,
    sceneId: scene.id,
    order: i,
    description: seed.description,
    action: seed.action,
    dialogue: seed.dialogue,
    characterIds: seed.characterIds,
    locationId: scene.locationId,
    spec: {
      camera: seed.camera,
      lens: seed.lens,
      movement: seed.movement,
      framing: seed.framing,
      lighting: seed.lighting,
      performance: seed.performance,
      durationSeconds: seed.duration,
      transition: 'Cut'
    },
    status: seed.status,
    frame,
    versions: version ? [version] : [],
    currentVersionId: version?.id
  };
});

export const agents: AgentDefinition[] = [
{ id: 'story', name: 'Story Agent', version: '2.4', purpose: 'Premise, theme, chronology and canon.', writes: ['StoryBible'], requiresApproval: true, timeoutSeconds: 120, retries: 1 },
{ id: 'screenplay', name: 'Screenplay Agent', version: '3.1', purpose: 'Scene construction and dialogue.', writes: ['Scene', 'Dialogue'], requiresApproval: true, timeoutSeconds: 180, retries: 1 },
{ id: 'character', name: 'Character Agent', version: '2.0', purpose: 'Identity, wardrobe and reference packages.', writes: ['Character'], requiresApproval: true, timeoutSeconds: 120, retries: 2 },
{ id: 'world', name: 'World Agent', version: '1.9', purpose: 'Locations, time variants and world rules.', writes: ['Location'], requiresApproval: true, timeoutSeconds: 120, retries: 2 },
{ id: 'continuity', name: 'Continuity Agent', version: '2.2', purpose: 'Guards the Story Bible against contradiction.', writes: [], requiresApproval: false, timeoutSeconds: 60, retries: 0 },
{ id: 'storyboard', name: 'Storyboard Agent', version: '2.6', purpose: 'Turns scenes into planned frames.', writes: ['Shot'], requiresApproval: false, timeoutSeconds: 180, retries: 2 },
{ id: 'shot-planning', name: 'Shot Planning Agent', version: '1.7', purpose: 'Coverage, order and duration.', writes: ['ShotSpec'], requiresApproval: false, timeoutSeconds: 90, retries: 1 },
{ id: 'visual', name: 'Visual Agent', version: '4.0', purpose: 'Generates shot media from the spec package.', writes: ['ShotVersion'], requiresApproval: true, timeoutSeconds: 600, retries: 2 },
{ id: 'acting', name: 'Acting Agent', version: '2.1', purpose: 'Performance direction and expression.', writes: ['ShotVersion'], requiresApproval: true, timeoutSeconds: 300, retries: 2 },
{ id: 'camera', name: 'Camera Agent', version: '2.3', purpose: 'Lens, movement and framing.', writes: ['ShotSpec'], requiresApproval: false, timeoutSeconds: 90, retries: 1 },
{ id: 'voice', name: 'Voice Agent', version: '3.4', purpose: 'Dialogue performance and sync.', writes: ['AudioAsset'], requiresApproval: true, timeoutSeconds: 240, retries: 2 },
{ id: 'music', name: 'Music Agent', version: '2.8', purpose: 'Score cues against picture.', writes: ['AudioAsset'], requiresApproval: true, timeoutSeconds: 300, retries: 1 },
{ id: 'sound', name: 'Sound Agent', version: '2.0', purpose: 'Design, foley and mix.', writes: ['AudioAsset'], requiresApproval: true, timeoutSeconds: 300, retries: 1 },
{ id: 'editing', name: 'Editing Agent', version: '1.8', purpose: 'Assembly and pacing.', writes: ['EditTimeline'], requiresApproval: true, timeoutSeconds: 240, retries: 1 },
{ id: 'colour', name: 'Colour Agent', version: '1.5', purpose: 'Grade against the colour rule.', writes: ['ShotVersion'], requiresApproval: true, timeoutSeconds: 180, retries: 1 },
{ id: 'quality', name: 'Quality Agent', version: '2.5', purpose: 'Automated QC on every generated asset.', writes: ['QualityReport'], requiresApproval: false, timeoutSeconds: 60, retries: 0 },
{ id: 'rights', name: 'Rights Agent', version: '3.0', purpose: 'Licence, likeness and consent before publish.', writes: ['RightsIssue'], requiresApproval: false, timeoutSeconds: 60, retries: 0 },
{ id: 'distribution', name: 'Distribution Agent', version: '1.4', purpose: 'Master, package and publish.', writes: ['Distribution'], requiresApproval: true, timeoutSeconds: 600, retries: 1 }];


export const rightsIssues: RightsIssue[] = [
{
  id: 'ri1',
  severity: 'blocking',
  category: 'Music licence',
  reason: '“Night Line” is a published recording. A sync licence is required before publish.',
  affects: ['Scene 22', 'Scene 25', 'Trailer'],
  resolution: 'Attach a valid sync licence, or replace with a Music Agent original.',
  resolved: false
},
{
  id: 'ri2',
  severity: 'advisory',
  category: 'Likeness',
  reason: 'Two background performers were generated from a crowd reference set.',
  affects: ['Scene 20'],
  resolution: 'Cleared — the reference set is licensed for synthetic background use.',
  resolved: true
},
{
  id: 'ri3',
  severity: 'advisory',
  category: 'Voice consent',
  reason: 'All three principal voices are Voice Agent originals with recorded consent on file.',
  affects: [],
  resolution: 'No action required.',
  resolved: true
}];


/** Named examples shown under the command box — each one actually parses. */
export const commandExamples = [
'Make scene 23 more tense — hold on Amara and let the score drop out',
'Generate the remaining storyboard for scene 24',
'Make it rain',
'Amara draws the revolver in 24A',
'Show me the shots that are not consistent',
'Re-verify Amara continuity',
'Change Amara’s wardrobe — lose the grey jacket from scene 22',
'Make the whole film visually warmer'];