import { IMAGES } from './catalog';
import type {
  CommerceUniverse,
  CreatorStore,
  Drop,
  HavaPass,
  MarketProduct } from
'../types/commerce';

const SHOT = {
  jacket: "/abefe18b-e661-4398-bc20-dd22ac831981.jpg",

  score: "/f685a9cb-41ca-4115-bc85-508081ad7947.jpg",

  artprint: "/6e4679d2-939a-4136-8a43-67e0463850ad.jpg",

  pass: "/2d66a0a1-d93e-406a-bfb8-c53b7ff87f28.jpg",
  studio: "/9f117948-6ca2-4e72-9fd2-7fc37eef4121.jpg"

};

export const commerceUniverses: CommerceUniverse[] = [
{
  id: 'railway',
  name: 'The Last Train',
  tagline: 'The story continues beyond the screen.',
  kindLine: 'Film · Music · Characters · Merch · Experiences',
  image: IMAGES.heroLastTrain,
  watchTo: '/title/the-last-train',
  communityTo: '/community/the-last-train',
  universeTo: '/universes/railway',
  counts: { products: 6, collectibles: 3, experiences: 2 }
},
{
  id: 'animeverse',
  name: 'Animeverse',
  tagline: 'Hand-drawn worlds, made collectable.',
  kindLine: 'Anime · Comics · Games · Merch',
  image: IMAGES.anime,
  watchTo: '/browse/animation',
  communityTo: '/community/animeverse',
  universeTo: '/market/universe/animeverse',
  counts: { products: 4, collectibles: 2, experiences: 1 }
},
{
  id: 'havaverse-live',
  name: 'HavaVerse Live',
  tagline: 'Be in the room when it happens.',
  kindLine: 'Music · Events · Lifestyle · Merch',
  image: IMAGES.concert,
  watchTo: '/sports',
  communityTo: '/community/afrobeats',
  universeTo: '/market/universe/havaverse-live',
  counts: { products: 5, collectibles: 1, experiences: 3 }
},
{
  id: 'lagos-2042',
  name: 'Lagos 2042',
  tagline: 'A city that outlived its own map.',
  kindLine: 'Sci-fi · Art · Fashion · Experiences',
  image: IMAGES.lagos,
  watchTo: '/title/lagos-2042',
  communityTo: '/community/lagos-2042',
  universeTo: '/market/universe/lagos-2042',
  counts: { products: 4, collectibles: 4, experiences: 1 }
}];


const railwayProvenance = {
  creator: { label: 'Creator', value: 'Adaeze Films', to: '/market/store/adaezefilms' },
  content: { label: 'From', value: 'The Last Train', to: '/title/the-last-train' },
  universe: { label: 'Universe', value: 'The Railway Universe', to: '/universes/railway' },
  community: { label: 'Community', value: 'The Last Train Fan Club', to: '/community/the-last-train' }
};

export const marketProducts: MarketProduct[] = [
{
  id: 'pr1',
  name: "Amara's indigo jacket",
  blurb:
  'The jacket she wears from the platform scene onward, reproduced with the same indigo collar the costume department dyed by hand.',
  category: 'Merchandise',
  action: 'buy',
  price: 18500,
  currency: '₦',
  image: SHOT.jacket,
  universeId: 'railway',
  creatorId: 'adaezefilms',
  stock: 'in-stock',
  provenance: {
    ...railwayProvenance,
    ip: { label: 'Character', value: 'Amara Okonkwo', to: '/characters/amara' }
  },
  split: { creator: 62, rightsHolder: 23, platform: 15 },
  unlocks: ['Railway community badge']
},
{
  id: 'pr2',
  name: 'Night Line — original score',
  blurb:
  'Forty-one minutes of the score, including the two cues cut from the final edit, mastered for the collector edition.',
  category: 'Digital',
  action: 'collect',
  price: 4000,
  currency: '₦',
  image: SHOT.score,
  universeId: 'railway',
  creatorId: 'adaezefilms',
  stock: 'in-stock',
  provenance: {
    ...railwayProvenance,
    ip: { label: 'IP', value: 'Night Line (score)', to: '/universes/railway/media' }
  },
  split: { creator: 70, rightsHolder: 18, platform: 12 },
  unlocks: ['Lossless download', 'Composer commentary track']
},
{
  id: 'pr3',
  name: 'Amara limited edition print',
  blurb:
  'A 500-run giclée of the final frame, numbered and signed by the director. Drops live, then never reprints.',
  category: 'Collectibles',
  action: 'collect',
  price: 25000,
  currency: '₦',
  image: SHOT.artprint,
  universeId: 'railway',
  creatorId: 'adaezefilms',
  stock: 'low',
  edition: { remaining: 87, total: 500 },
  provenance: {
    ...railwayProvenance,
    ip: { label: 'Character', value: 'Amara Okonkwo', to: '/characters/amara' }
  },
  split: { creator: 68, rightsHolder: 20, platform: 12 },
  unlocks: ['Collector tier in the fan club']
},
{
  id: 'pr4',
  name: 'Lagos premiere — Southbound',
  blurb:
  'Seat at the sequel premiere at Filmhouse Lekki, with the cast Q&A afterwards. 320 seats total.',
  category: 'Tickets',
  action: 'ticket',
  price: 22000,
  currency: '₦',
  image: IMAGES.concert,
  universeId: 'railway',
  creatorId: 'adaezefilms',
  stock: 'low',
  edition: { remaining: 44, total: 320 },
  provenance: {
    ...railwayProvenance,
    content: { label: 'From', value: 'The Last Train: Southbound', to: '/title/the-last-train' }
  },
  split: { creator: 55, rightsHolder: 30, platform: 15 },
  unlocks: ['Premiere priority for the next release']
},
{
  id: 'pr5',
  name: 'Set visit — Southbound',
  blurb:
  'Two days on the Southbound shoot in Enugu, on the rig with the camera team. Six places per shooting block.',
  category: 'Experiences',
  action: 'experience',
  price: 140000,
  currency: '₦',
  image: SHOT.studio,
  universeId: 'railway',
  creatorId: 'adaezefilms',
  stock: 'pre-order',
  edition: { remaining: 6, total: 6 },
  provenance: railwayProvenance,
  split: { creator: 74, rightsHolder: 11, platform: 15 },
  releasesAt: 'Shooting block opens March 2026'
},
{
  id: 'pr6',
  name: "The Last Train — director's edition",
  blurb:
  'The film with the alternate ending, 90 minutes of production archive and the annotated shooting script.',
  category: 'Digital',
  action: 'watch',
  price: 25000,
  currency: '₦',
  image: IMAGES.lastTrain,
  universeId: 'railway',
  creatorId: 'adaezefilms',
  stock: 'unreleased',
  provenance: railwayProvenance,
  split: { creator: 66, rightsHolder: 22, platform: 12 },
  releasesAt: 'Friday · 8:00 PM WAT',
  unlocks: ['Alternate ending', 'Annotated script']
},
{
  id: 'pr7',
  name: 'Lagos 2042 original print',
  blurb:
  'The drowned-city skyline plate from the title sequence. The full run of 500 has been collected.',
  category: 'Collectibles',
  action: 'collect',
  price: 12000,
  currency: '₦',
  image: IMAGES.lagos,
  universeId: 'lagos-2042',
  creatorId: 'studioikeja',
  stock: 'sold-out',
  edition: { remaining: 0, total: 500 },
  provenance: {
    creator: { label: 'Creator', value: 'Studio Ikeja', to: '/market/store/studioikeja' },
    content: { label: 'From', value: 'Lagos 2042', to: '/title/lagos-2042' },
    ip: { label: 'IP', value: 'The Drowned City', to: '/market/universe/lagos-2042' },
    universe: { label: 'Universe', value: 'Lagos 2042', to: '/market/universe/lagos-2042' },
    community: { label: 'Community', value: 'Lagos 2042', to: '/community/lagos-2042' }
  },
  split: { creator: 64, rightsHolder: 21, platform: 15 }
},
{
  id: 'pr8',
  name: 'Animeverse pin set',
  blurb:
  'Six hard-enamel pins of the Brush cast, in a fold-out sleeve drawn for this release only.',
  category: 'Collectibles',
  action: 'collect',
  price: 9500,
  currency: '₦',
  image: IMAGES.anime,
  universeId: 'animeverse',
  creatorId: 'kofianimation',
  stock: 'low',
  edition: { remaining: 140, total: 800 },
  provenance: {
    creator: { label: 'Creator', value: 'Kofi Animation', to: '/market/store/kofianimation' },
    content: { label: 'From', value: 'Animeverse', to: '/browse/animation' },
    ip: { label: 'IP', value: 'The Brush', to: '/market/universe/animeverse' },
    universe: { label: 'Universe', value: 'Animeverse', to: '/market/universe/animeverse' }
  },
  split: { creator: 71, rightsHolder: 14, platform: 15 }
},
{
  id: 'pr9',
  name: 'Afrobeats Night — Lagos',
  blurb: 'Standing entry to the May showcase at Muri Okunola Park, eight acts across one night.',
  category: 'Tickets',
  action: 'ticket',
  price: 18000,
  currency: '₦',
  image: IMAGES.concert,
  universeId: 'havaverse-live',
  creatorId: 'havaverselive',
  stock: 'in-stock',
  provenance: {
    creator: { label: 'Promoter', value: 'HavaVerse Live', to: '/market/store/havaverselive' },
    content: { label: 'Event', value: '10 May 2026 · Lagos', to: '/sports' },
    universe: { label: 'Universe', value: 'HavaVerse Live', to: '/market/universe/havaverse-live' },
    community: { label: 'Community', value: 'Afrobeats Discussion', to: '/community/afrobeats' }
  },
  split: { creator: 58, rightsHolder: 27, platform: 15 }
},
{
  id: 'pr10',
  name: 'Support Adaeze Films',
  blurb:
  'A direct contribution to the Southbound production fund. Supporters are credited in the end roll.',
  category: 'Creator products',
  action: 'support',
  price: 5000,
  currency: '₦',
  image: IMAGES.creator,
  universeId: 'railway',
  creatorId: 'adaezefilms',
  stock: 'in-stock',
  provenance: railwayProvenance,
  split: { creator: 92, rightsHolder: 0, platform: 8 },
  unlocks: ['Name in the Southbound credits', 'Supporter badge']
},
{
  id: 'pr11',
  name: 'Rising Eagles matchday scarf',
  blurb: 'Woven scarf in the qualifying-campaign colourway, produced with the supporters union.',
  category: 'Merchandise',
  action: 'buy',
  price: 11000,
  currency: '₦',
  image: IMAGES.eagles,
  universeId: 'havaverse-live',
  creatorId: 'havaverselive',
  stock: 'low',
  provenance: {
    creator: { label: 'Creator', value: 'HavaVerse Live', to: '/market/store/havaverselive' },
    content: { label: 'From', value: 'Rising Eagles', to: '/sports' },
    universe: { label: 'Universe', value: 'HavaVerse Live', to: '/market/universe/havaverse-live' }
  },
  split: { creator: 52, rightsHolder: 33, platform: 15 }
},
{
  id: 'pr12',
  name: "The King's Court story bible",
  blurb: 'The 180-page world document: houses, timelines, unused arcs and the full character tree.',
  category: 'Digital',
  action: 'collect',
  price: 6500,
  currency: '₦',
  image: IMAGES.kings,
  universeId: 'animeverse',
  creatorId: 'kofianimation',
  stock: 'in-stock',
  provenance: {
    creator: { label: 'Creator', value: 'Oyin Media', to: '/market/store/kofianimation' },
    content: { label: 'From', value: "The King's Court", to: '/title/the-kings-court' },
    universe: { label: 'Universe', value: 'Animeverse', to: '/market/universe/animeverse' }
  },
  split: { creator: 69, rightsHolder: 19, platform: 12 }
}];


export const drops: Drop[] = [
{ id: 'dr1', productId: 'pr3', state: 'live', label: 'Live drop', endsInSeconds: 2597 },
{ id: 'dr2', productId: 'pr6', state: 'soon', label: 'Coming soon', opensAt: 'Friday · 8:00 PM WAT' },
{ id: 'dr3', productId: 'pr7', state: 'sold-out', label: 'Sold out' },
{ id: 'dr4', productId: 'pr8', state: 'live', label: 'Limited drop', endsInSeconds: 19800 }];


export const havaPasses: HavaPass[] = [
{
  id: 'pass-railway',
  name: 'The Last Train — Fan Pass',
  universeId: 'railway',
  price: 25000,
  tagline: 'Own the story, not just a copy of it.',
  includes: [
  'Digital collector edition',
  'Night Line original score',
  'Behind-the-scenes archive',
  'Character dossier',
  'Early access to Southbound',
  'Community collector badge',
  '10% off everything in this universe',
  'Premiere priority access'],

  image: SHOT.pass,
  holders: '18.4K holders'
}];


export const creatorStores: CreatorStore[] = [
{
  id: 'adaezefilms',
  name: 'Adaeze Films',
  handle: '@adaezefilms',
  avatar: IMAGES.creator,
  cover: IMAGES.heroLastTrain,
  disciplines: 'Film · TV · Music',
  supporters: '1.2M supporters',
  verified: true,
  bio: 'Director of The Last Train and the Railway universe. Building the Southbound sequel in public, funded by the people who watched the first one.',
  universeIds: ['railway']
},
{
  id: 'kofianimation',
  name: 'Kofi Animation',
  handle: '@kofianimation',
  avatar: IMAGES.anime,
  cover: IMAGES.anime,
  disciplines: 'Animation · Comics · Games',
  supporters: '856K supporters',
  verified: true,
  bio: 'Hand-drawn animation studio out of Accra. The Brush began as a weekly strip and is now a series, a game and a pin set.',
  universeIds: ['animeverse']
},
{
  id: 'havaverselive',
  name: 'HavaVerse Live',
  handle: '@havaverselive',
  avatar: IMAGES.concert,
  cover: IMAGES.concert,
  disciplines: 'Events · Music · Lifestyle',
  supporters: '420K supporters',
  verified: true,
  bio: 'The live arm: showcases, matchday and premieres, with the ticketing settled through HavaPay.',
  universeIds: ['havaverse-live']
},
{
  id: 'studioikeja',
  name: 'Studio Ikeja',
  handle: '@studioikeja',
  avatar: IMAGES.lagos,
  cover: IMAGES.lagos,
  disciplines: 'Sci-fi · Art · Fashion',
  supporters: '649K supporters',
  verified: false,
  bio: 'The collective behind Lagos 2042. Everything they release is a limited run and nothing is reprinted.',
  universeIds: ['lagos-2042']
}];


/** What the signed-in account already owns — the Collection Vault. */
export const ownedProductIds = ['pr2', 'pr9', 'pr12'];