import type { LockedAsset } from '../types/continuity';
import { characters, locations, project } from './director';

/**
 * Seed continuity layer for The Last Train. Characters and locations are
 * derived from the director graph so the two can never disagree about who
 * exists; wardrobe and grade are continuity-only assets.
 *
 * Deliberate states for the Phase 1 acceptance loop:
 * - Mrs Bassey and her wardrobe are DRAFT — not continuity-locked.
 * - Shot 22C was rendered with Daniel in an unregistered jacket, so the
 *   Continuity Agent flags a wardrobe mismatch on it.
 * - The grade already has a v1 → v2 history to show immutable versions.
 */

const SEEDED_AT = '2026-09-18T09:30:00.000Z';
const OWNER = 'Adaeze Films';

const wardrobeIdFor = (characterId: string) => `la-wd-${characterId.replace('ch-', '')}`;

const characterAssets: LockedAsset[] = characters.map((c): LockedAsset => {
  const locked = c.continuity === 'locked';
  const payload = {
    displayName: c.name,
    faceDescription: c.appearance,
    defaultWardrobeId: wardrobeIdFor(c.id),
    voiceId: `voice-${c.id}`,
    referenceImages: [c.portrait]
  };
  return {
    id: `la-${c.id}`,
    projectId: project.id,
    type: 'character',
    name: c.name,
    version: 1,
    status: locked ? 'locked' : 'draft',
    payload,
    entityId: c.id,
    lockedAt: locked ? SEEDED_AT : undefined,
    lockedBy: locked ? OWNER : undefined,
    referenceCount: c.references,
    embeddingId: `emb-${c.id}-v1`,
    history: [
    { id: `la-${c.id}@v1`, version: 1, payload, reason: 'Initial reference package', createdAt: SEEDED_AT, createdBy: OWNER }],

    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT
  };
});

const wardrobeAssets: LockedAsset[] = characters.map((c): LockedAsset => {
  const locked = c.continuity === 'locked';
  const payload = {
    displayName: `${c.name.split(' ')[0]} — principal wardrobe`,
    characterId: c.id,
    description: c.wardrobe,
    referenceImages: [c.portrait]
  };
  const id = wardrobeIdFor(c.id);
  return {
    id,
    projectId: project.id,
    type: 'wardrobe',
    name: payload.displayName,
    version: 1,
    status: locked ? 'locked' : 'draft',
    payload,
    entityId: c.id,
    lockedAt: locked ? SEEDED_AT : undefined,
    lockedBy: locked ? OWNER : undefined,
    referenceCount: Math.round(c.references / 3),
    history: [
    { id: `${id}@v1`, version: 1, payload, reason: 'Costume approved in fitting', createdAt: SEEDED_AT, createdBy: OWNER }],

    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT
  };
});

const locationAssets: LockedAsset[] = locations.map((l): LockedAsset => {
  const payload = {
    displayName: l.name,
    description: `${l.architecture} ${l.lighting}`,
    referenceImages: [l.plate],
    timeOfDayDefault: 'night' as const
  };
  return {
    id: `la-${l.id}`,
    projectId: project.id,
    type: 'location',
    name: l.name,
    version: 1,
    status: 'locked',
    payload,
    entityId: l.id,
    lockedAt: SEEDED_AT,
    lockedBy: OWNER,
    referenceCount: 18,
    history: [
    { id: `la-${l.id}@v1`, version: 1, payload, reason: 'World plate approved', createdAt: SEEDED_AT, createdBy: OWNER }],

    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT
  };
});

const gradeV1 = {
  displayName: 'Sodium & Cyan',
  description: 'Sodium orange practicals, neutral skin, crushed blacks.',
  lutUrl: 'luts/last-train-v1.cube'
};
const gradeV2 = {
  displayName: 'Sodium & Cyan',
  description: 'Sodium orange for the yard, cyan for state spaces — colour carries power, per the bible.',
  lutUrl: 'luts/last-train-v2.cube'
};

const gradeAsset: LockedAsset = {
  id: 'la-grade',
  projectId: project.id,
  type: 'grade',
  name: 'Sodium & Cyan',
  version: 2,
  status: 'locked',
  payload: gradeV2,
  lockedAt: SEEDED_AT,
  lockedBy: OWNER,
  parentVersionId: 'la-grade@v1',
  referenceCount: 24,
  history: [
  { id: 'la-grade@v2', version: 2, payload: gradeV2, parentVersionId: 'la-grade@v1', reason: 'Cyan reserved for state spaces', createdAt: SEEDED_AT, createdBy: OWNER },
  { id: 'la-grade@v1', version: 1, payload: gradeV1, reason: 'First look', createdAt: '2026-09-02T11:00:00.000Z', createdBy: OWNER }],

  createdAt: '2026-09-02T11:00:00.000Z',
  updatedAt: SEEDED_AT
};

const revolverPayload = {
  displayName: 'Service revolver',
  description: 'Railway-security issue .38, worn holstered on Amara’s right hip. Cracked grip tape.',
  carriedBy: 'ch-amara',
  referenceImages: [characters[0].portrait]
};

const vehiclePayload = {
  displayName: "Brown '73 Peugeot 504",
  description: 'Brown 1973 Peugeot 504 saloon. Dent in the passenger door that nobody ever fixes.',
  make: 'Peugeot',
  model: '504',
  year: 1973,
  colour: 'Brown',
  damage: ['Dent, passenger door'],
  referenceImages: [locations[0].plate]
};

const propAssets: LockedAsset[] = [
{
  id: 'la-prop-revolver',
  projectId: project.id,
  type: 'prop',
  name: 'Service revolver',
  version: 1,
  status: 'locked',
  payload: revolverPayload,
  entityId: 'prop-revolver',
  lockedAt: SEEDED_AT,
  lockedBy: OWNER,
  referenceCount: 14,
  history: [
  { id: 'la-prop-revolver@v1', version: 1, payload: revolverPayload, reason: 'Prop approved by the armourer', createdAt: SEEDED_AT, createdBy: OWNER }],

  createdAt: SEEDED_AT,
  updatedAt: SEEDED_AT
},
{
  id: 'la-veh-504',
  projectId: project.id,
  type: 'vehicle',
  name: "Brown '73 Peugeot 504",
  version: 1,
  status: 'locked',
  payload: vehiclePayload,
  entityId: 'veh-504',
  lockedAt: SEEDED_AT,
  lockedBy: OWNER,
  referenceCount: 22,
  history: [
  { id: 'la-veh-504@v1', version: 1, payload: vehiclePayload, reason: 'Picture car approved', createdAt: SEEDED_AT, createdBy: OWNER }],

  createdAt: SEEDED_AT,
  updatedAt: SEEDED_AT
}];


export const lockedAssets: LockedAsset[] = [
...characterAssets,
...locationAssets,
...wardrobeAssets,
gradeAsset,
...propAssets];


/** Shots whose render evidence deviates from the locks at seed time. */
export const renderDeviations: Record<string, Record<string, string>> = {
  'shot-22C': { 'ch-daniel': 'Civilian bomber jacket — grey, unregistered' }
};

export const CONTINUITY_AGENT_VERSION = 'continuity-agent 1.4.0';