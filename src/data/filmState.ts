import type { FilmStateVersion, ProductionRule, Sequence } from '../types/filmState';

/**
 * Seed film state for The Last Train.
 *
 * Deliberate states for the P0 acceptance loop:
 * - Rule Test: Shot 22E was rendered with Amara's revolver drawn, which breaks
 *   the film rule that she never draws it.
 * - "Make it rain": Scene 21 is the one dry exterior. Everything from Scene 22
 *   on is already rain; interiors take rain only as sound.
 */

const SEEDED_AT = '2026-09-18T09:30:00.000Z';
const OWNER = 'Adaeze Films';

/** Interiors never change weather on picture — rain reaches them as sound. */
export const interiorLocations = ['loc-carriage', 'loc-control'];

/** Props travel with whoever carries them. */
export const propCarriers: Record<string, string> = {
  'prop-revolver': 'ch-amara'
};

/** Vehicles appear where the storyboard put them. */
export const vehicleAppearances: Record<string, string[]> = {
  'veh-504': ['shot-21A', 'shot-22A']
};

export const entityNames: Record<string, string> = {
  'ch-amara': 'Amara',
  'ch-daniel': 'Daniel',
  'ch-controller': 'Mrs Bassey',
  'prop-revolver': 'Service revolver',
  'veh-504': "Brown '73 Peugeot 504",
  'door-contents': 'Behind the sealed door'
};

export const initialState: FilmStateVersion = {
  id: 'fs-v1',
  n: 1,
  createdAt: SEEDED_AT,
  createdBy: OWNER,
  reason: 'Built from the approved screenplay and Story Bible',
  weather: {
    'sc-20': 'dry',
    'sc-21': 'dry',
    'sc-22': 'rain',
    'sc-23': 'rain',
    'sc-24': 'rain',
    'sc-25': 'rain'
  },
  facts: [
  { id: 'f1', entityId: 'prop-revolver', property: 'state', value: 'holstered', fromScene: 20, cause: 'Issued to Amara before the film opens' },
  { id: 'f2', entityId: 'ch-amara', property: 'condition', value: 'dry', fromScene: 20, cause: 'Start of the night shift' },
  { id: 'f3', entityId: 'ch-amara', property: 'condition', value: 'soaked', fromScene: 22, cause: 'Caught in the rain at relay cabinet 7' },
  { id: 'f4', entityId: 'veh-504', property: 'dent', value: 'present', fromScene: 20, cause: 'Passenger door — nobody ever fixes it' },
  { id: 'f5', entityId: 'veh-504', property: 'position', value: 'parked by siding 3', fromScene: 21, cause: 'Bassey drove in before the shift' }],

  changes: []
};

export const sequences: Sequence[] = [
{
  id: 'seq-1',
  number: 1,
  title: 'The manifest',
  narrativeObjective: 'Amara learns the 02:40 is not the train on the plan.',
  dramaticObjective: 'A polite refusal hardens into certainty.',
  sceneIds: ['sc-20', 'sc-21'],
  versions: [{ n: 1, stateVersion: 1, reason: 'Assembled from the approved screenplay', createdAt: SEEDED_AT }]
},
{
  id: 'seq-2',
  number: 2,
  title: 'Cabinet 7',
  narrativeObjective: 'Daniel is sent to bring her in; he tells her to go home.',
  dramaticObjective: 'Loyalty tested in the rain — neither of them moves.',
  sceneIds: ['sc-22'],
  versions: [{ n: 1, stateVersion: 1, reason: 'Assembled from the approved screenplay', createdAt: SEEDED_AT }]
},
{
  id: 'seq-3',
  number: 3,
  title: 'The sealed door',
  narrativeObjective: 'She opens what the line has hidden.',
  dramaticObjective: 'Dread, withheld. We only ever see her face.',
  sceneIds: ['sc-23', 'sc-24'],
  versions: [{ n: 1, stateVersion: 1, reason: 'Assembled from the approved screenplay', createdAt: SEEDED_AT }]
},
{
  id: 'seq-4',
  number: 4,
  title: 'Bassey was waiting',
  narrativeObjective: 'The controller admits she has known all along.',
  dramaticObjective: 'Nine years of silence ends at a desk.',
  sceneIds: ['sc-25'],
  versions: [{ n: 1, stateVersion: 1, reason: 'Assembled from the approved screenplay', createdAt: SEEDED_AT }]
}];


const rule = (r: Omit<ProductionRule, 'version' | 'history' | 'status' | 'exceptions'>): ProductionRule => ({
  ...r,
  status: 'active',
  exceptions: [],
  version: 1,
  history: [
  { version: 1, text: r.text, predicate: r.predicate, exceptions: [], reason: 'Written into the Director’s Plan', createdAt: SEEDED_AT, createdBy: OWNER }]

});

export const rules: ProductionRule[] = [
rule({
  id: 'rule-revolver',
  level: 'film',
  text: 'Amara carries the service revolver the entire film and never draws it.',
  predicate: { subject: 'prop-revolver', property: 'state', operator: 'never', value: 'drawn' },
  compliant: 'holstered',
  conflictTerms: [
  ['draw', 'pull', 'aim', 'fire', 'shoot', 'unholster'],
  ['revolver', 'gun', 'pistol', 'weapon']]

}),
rule({
  id: 'rule-dent',
  level: 'film',
  text: "Bassey's brown '73 keeps its passenger-door dent. Nobody ever fixes it.",
  predicate: { subject: 'veh-504', property: 'dent', operator: 'always', value: 'present' },
  compliant: 'present',
  conflictTerms: [
  ['fix', 'repair', 'remove', 'restore'],
  ['dent', 'car', '504', 'peugeot']]

}),
rule({
  id: 'rule-door',
  level: 'sequence',
  scopeId: 'seq-3',
  text: 'What is behind the sealed door is never shown — only her face, and the sound.',
  predicate: { subject: 'door-contents', property: 'visible', operator: 'never', value: 'shown' },
  compliant: 'hidden',
  conflictTerms: [
  ['show', 'reveal', 'see'],
  ['behind the door', 'inside the door', 'what she finds', 'through the door']]

})];


/** Render evidence at seed time that deviates from the rules. */
export const observedDeviations: Record<string, Record<string, string>> = {
  'shot-22E': { 'prop-revolver': 'drawn' }
};