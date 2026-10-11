import type {
  AiCapability,
  Episode,
  Extra,
  Review,
  Season,
  TitleCharacter,
  TitleExperience,
  TitleSectionId,
  UniverseEntry } from
'../types/title';
import type { ContentTitle } from '../types/content';
import { IMAGES, titles } from './catalog';

const PORTRAITS = {
  amara: "/4f400e0b-5099-452c-a54d-72fc10d9a579.jpg",
  daniel: "/974b3511-fff4-4674-a303-74ad72b2f233.jpg",

  okocha: "/f297f452-b8d8-43d3-ac10-e151d2df7a33.jpg",

  zara: "/bd0def00-5b3c-4a34-be8c-dc368836306d.jpg"
};

export const UNIVERSE_BANNER = "/4151229f-7306-423c-b68a-56ac381dd005.jpg";


const poster = (slug: string) => titles.find((t) => t.slug === slug)?.poster ?? IMAGES.lastTrain;

/* -------------------------------------------------------------- characters */

const railwayCharacters: TitleCharacter[] = [
{
  id: 'amara',
  name: 'Amara',
  role: 'Protagonist · Engineer',
  image: PORTRAITS.amara,
  bio: 'A signals engineer who grew up beside the line she now maintains. When the night freight starts running without a manifest, she is the only person who notices.',
  appearsIn: ['the-last-train', 'lagos-2042'],
  relationships: [
  { name: 'Daniel', relation: 'Colleague, then accomplice' },
  { name: 'Chief Okocha', relation: 'Her late father’s closest friend' },
  { name: 'Zara', relation: 'Adversary' }],

  to: '/characters/amara'
},
{
  id: 'daniel',
  name: 'Daniel',
  role: 'Rail engineer',
  image: PORTRAITS.daniel,
  bio: 'Twenty years on the southbound line. He knows which questions are safe to ask, which is exactly why Amara needs him.',
  appearsIn: ['the-last-train'],
  relationships: [
  { name: 'Amara', relation: 'Colleague, then accomplice' },
  { name: 'Chief Okocha', relation: 'Distrusts him' }],

  to: '/characters/daniel'
},
{
  id: 'okocha',
  name: 'Chief Okocha',
  role: 'Community leader',
  image: PORTRAITS.okocha,
  bio: 'Holds the village together and, quietly, holds its silence too. His authority is the story’s real obstacle.',
  appearsIn: ['the-last-train'],
  relationships: [{ name: 'Amara', relation: 'Guardian figure' }]
},
{
  id: 'zara',
  name: 'Zara',
  role: 'Antagonist',
  image: PORTRAITS.zara,
  bio: 'Runs logistics for the consortium that leased the line. Everything she does is legal, which is the point.',
  appearsIn: ['the-last-train', 'lagos-2042'],
  relationships: [{ name: 'Amara', relation: 'Adversary' }],
  spoiler: true
}];


/* ---------------------------------------------------------------- universe */

const railwayUniverse: UniverseEntry[] = [
{
  order: '01',
  name: 'The Last Train',
  year: 2025,
  image: poster('the-last-train'),
  to: '/title/the-last-train',
  kind: 'Feature film',
  current: true
},
{
  order: '02',
  name: 'The Last Train: Origins',
  year: 2026,
  image: poster('lagos-2042'),
  to: '/universes/railway',
  kind: 'Prequel short',
  status: 'In production'
},
{
  order: '03',
  name: 'Chidi’s Story',
  year: 2026,
  image: poster('the-kings-court'),
  to: '/universes/railway/stories',
  kind: 'Serialised story'
},
{
  order: '04',
  name: 'Railway Files',
  year: 2027,
  image: poster('animeverse'),
  to: '/universes/railway/media',
  kind: 'Documentary series',
  status: 'Announced'
},
{
  order: '05',
  name: 'Behind the Signal',
  year: 2025,
  image: poster('afro-beats-rising'),
  to: '/universes/railway/media',
  kind: 'Behind the scenes'
}];


/* ------------------------------------------------------------------ extras */

const railwayExtras: Extra[] = [
{
  id: 'x1',
  kind: 'Trailer',
  name: 'Official trailer',
  runtime: '2:14',
  still: IMAGES.heroLastTrain
},
{
  id: 'x2',
  kind: 'Behind the scenes',
  name: 'Building the southbound line',
  runtime: '8:42',
  still: UNIVERSE_BANNER
},
{
  id: 'x3',
  kind: 'Interview',
  name: 'Adaeze on directing with AI',
  runtime: '11:05',
  still: IMAGES.creator
},
{
  id: 'x4',
  kind: 'Deleted scene',
  name: 'The second manifest',
  runtime: '3:27',
  still: poster('lagos-2042'),
  spoiler: true
},
{
  id: 'x5',
  kind: 'Character clip',
  name: 'Amara at the junction',
  runtime: '1:48',
  still: PORTRAITS.amara
},
{
  id: 'x6',
  kind: 'Production diary',
  name: 'Ninety-six minutes, forty shots',
  runtime: '6:12',
  still: poster('animeverse')
}];


/* ----------------------------------------------------------------- reviews */

const railwayReviews: Review[] = [
{
  id: 'r1',
  author: 'Chinelo A.',
  avatar: IMAGES.creator,
  rating: 9,
  body: 'The restraint is the achievement. It never explains the conspiracy to you — it lets Amara work it out at the same speed you do.',
  postedAt: '4 days ago',
  helpful: 412,
  spoiler: false,
  source: 'community'
},
{
  id: 'r2',
  author: 'Lagos Review',
  avatar: poster('lagos-2042'),
  rating: 8,
  body: 'A genuinely tense piece of Nigerian science fiction that treats its infrastructure as a character. The final act asks more of its audience than most thrillers dare.',
  postedAt: '1 week ago',
  helpful: 1280,
  spoiler: false,
  source: 'critic'
},
{
  id: 'r3',
  author: 'Tunde O.',
  avatar: poster('the-kings-court'),
  rating: 7,
  body: 'Everything works until the reveal about who signed the lease — that lands too quickly for how long it was set up.',
  postedAt: '2 weeks ago',
  helpful: 96,
  spoiler: true,
  source: 'community'
}];


/* ------------------------------------------------------------- ai capability */

const railwayAi: AiCapability[] = [
{
  id: 'trailer',
  label: 'Create a trailer concept',
  blurb: 'Cut a new trailer from approved footage and score.',
  allowed: true
},
{
  id: 'scene',
  label: 'Create a character scene',
  blurb: 'Write and stage a new scene with an existing character.',
  allowed: true
},
{
  id: 'story',
  label: 'Create a story in this universe',
  blurb: 'Start a new work inside the Railway universe.',
  allowed: true
},
{
  id: 'reuse-score',
  label: 'Reuse the original score',
  blurb: 'Carry the existing music into a derivative work.',
  allowed: false,
  reason: 'The sync licence covers this title only. Compose or licence separately.'
}];


/* ----------------------------------------------------------------- seasons */

function kingsCourtSeasons(): Season[] {
  const make = (
  season: number,
  n: number,
  names: string[],
  progress?: Record<number, number>)
  : Season => ({
    number: season,
    name: `Season ${season}`,
    episodes: Array.from({ length: n }, (_, i): Episode => {
      const number = i + 1;
      return {
        id: `s${season}e${number}`,
        number,
        name: names[i] ?? `Episode ${number}`,
        runtime: `${41 + number * 3 % 9} min`,
        synopsis:
        'The court closes ranks while the palace decides what the public is allowed to know.',
        still: [poster('the-kings-court'), poster('lagos-2042'), poster('animeverse')][
        number % 3],

        progress: progress?.[number],
        watched: season === 1 && number <= 3
      };
    })
  });

  return [
  make(
    1,
    6,
    [
    'The Summons',
    'A Seat at the Table',
    'Inheritance',
    'The Long Night',
    'What the River Knows',
    'Coronation'],

    { 4: 61 }
  ),
  make(2, 4, ['New Regents', 'The Auditor', 'Salt and Silver', 'The Verdict'])];

}

/* ------------------------------------------------------------------ builder */

function creatorFor(title: ContentTitle) {
  return {
    name: title.creator,
    handle: title.creatorHandle,
    avatar: IMAGES.creator,
    kind: 'Independent studio',
    followers: '1.2M',
    location: 'Lagos, Nigeria',
    languages: title.languages,
    verified: true,
    aiProduction: title.aiAssisted ? 'AI-assisted production' : 'Conventional production',
    works: [
    { label: 'Films', slugs: ['the-last-train', 'lagos-2042'] },
    { label: 'Series', slugs: ['the-kings-court'] },
    { label: 'Shorts', slugs: ['afro-beats-rising'] },
    { label: 'Behind the scenes', slugs: ['animeverse'] }]

  };
}

function sectionsFor(title: ContentTitle, hasUniverse: boolean): TitleSectionId[] {
  if (title.kind === 'Sports' || title.kind === 'Live') {
    return ['overview', 'live', 'stats', 'highlights', 'community', 'market'];
  }
  const base: TitleSectionId[] = ['overview'];
  if (title.kind === 'Series' || title.kind === 'Anime') base.push('episodes');
  base.push('characters');
  if (hasUniverse) base.push('universe');
  base.push('extras', 'community', 'reviews');
  if (title.slug === 'the-last-train' || title.slug === 'lagos-2042') base.push('soundtrack');
  base.push('market');
  return base;
}

function recommendationsFor(title: ContentTitle) {
  const others = titles.filter((t) => t.slug !== title.slug).map((t) => t.slug);
  return [
  {
    id: 'because',
    label: 'Because you watched this',
    why: `You finished most of ${title.name} and keep returning to ${title.genre.toLowerCase()} from African creators.`,
    slugs: others.slice(0, 6)
  },
  {
    id: 'creator',
    label: 'From this creator',
    why: `Other work published by ${title.creator}.`,
    slugs: others.slice(0, 3)
  },
  {
    id: 'similar',
    label: 'Similar stories',
    why: `Shares themes and pacing with ${title.name} according to the content graph.`,
    slugs: others.slice(1, 5)
  },
  {
    id: 'region',
    label: `More Nigerian ${title.genre.toLowerCase()}`,
    why: 'Produced in Nigeria and licensed in your region.',
    slugs: others.slice(0, 4)
  },
  {
    id: 'character',
    label: 'If you liked this character',
    why: 'Amara appears in, or is referenced by, each of these.',
    slugs: ['lagos-2042', 'animeverse']
  },
  {
    id: 'universe',
    label: 'Continue this universe',
    why: 'Connected to the same story world in the HavaVerse content graph.',
    slugs: ['lagos-2042', 'the-kings-court', 'animeverse']
  }];

}

function build(title: ContentTitle): TitleExperience {
  const railway = title.slug === 'the-last-train';
  const series = title.kind === 'Series';
  const sports = title.kind === 'Sports';
  const blocked = title.slug === 'animeverse';

  return {
    slug: title.slug,
    kind: title.kind,
    releaseState: sports ? 'live' : title.slug === 'afro-beats-rising' ? 'premiere' : 'released',
    sections: sectionsFor(title, railway),
    synopsis: railway ?
    'The Last Train is a gripping science-fiction thriller set in a near-future Lagos, where a young engineer discovers that the abandoned railway near her village is being used to move something at night. As she uncovers a conspiracy, she must choose between staying silent and risking everything to stop it.' :
    `${title.logline} ${title.name} was produced in ${title.languages[0]} and published on HavaVerse by ${title.creator}.`,
    themes: railway ?
    ['Infrastructure', 'Complicity', 'Inheritance', 'Near-future Lagos'] :
    [title.genre, 'African storytelling'],
    releaseDate: railway ? 'Jan 17, 2025' : `${title.year}`,
    country: 'Nigeria',
    audio: title.languages,
    subtitles: ['English', 'French', 'Yoruba', 'Igbo'],
    advisories: railway ? ['Contains violence', 'Strong language'] : ['Mild themes'],
    productionStatus: sports ? 'Live event' : 'Completed',
    aiProduction: title.aiAssisted ? 'AI-assisted' : 'No AI generation',
    formats: ['4K', 'HDR', 'Dolby Atmos'],
    creator: creatorFor(title),
    characters: railway ? railwayCharacters : railwayCharacters.slice(0, 2),
    universe: railway ?
    {
      id: 'railway',
      name: 'The Last Train Universe',
      to: '/universes/railway',
      entries: railwayUniverse
    } :
    undefined,
    seasons: series ? kingsCourtSeasons() : [],
    extras: railway ? railwayExtras : railwayExtras.slice(0, 3),
    reviews: {
      hava: title.rating,
      community: Math.min(10, title.rating + 0.2),
      critics: Math.max(0, title.rating - 0.5),
      communityCount: '18.4K ratings',
      criticCount: '24 reviews',
      yourRating: null,
      reviews: railwayReviews
    },
    recommendations: recommendationsFor(title),
    soundtrack:
    railway || title.slug === 'lagos-2042' ?
    {
      name: `The Sound of ${title.name}`,
      to: '/music/world/lagos-after-dark',
      composer: 'Maya',
      trackCount: '12 tracks',
      duration: '1h 08m',
      trackIds: []
    } :
    undefined,
    community: {
      slug: title.slug,
      name: title.name,
      fans: '18.4K',
      discussing: '4,182',
      watching: '342',
      parties: 12,
      newSinceLastVisit: 3
    },
    availability: blocked ?
    {
      region: 'Nigeria',
      available: false,
      streaming: 'Not licensed here',
      audio: title.languages,
      subtitles: ['English'],
      note: 'This title isn’t currently licensed for streaming in your region.',
      licensedIn: ['Japan', 'United States', 'United Kingdom']
    } :
    {
      region: 'Nigeria',
      available: true,
      streaming: 'Worldwide',
      audio: title.languages,
      subtitles: ['English', 'French', 'Yoruba', 'Igbo']
    },
    provenance: [
    { label: 'Content origin', value: title.badge ?? 'Creator production' },
    { label: 'AI production', value: title.aiAssisted ? 'AI-assisted' : 'No AI generation' },
    { label: 'Rights holder', value: title.creator },
    {
      label: 'Generation record',
      value: title.aiAssisted ?
      'Shots generated under project PRJ-114, 38 shots, all human-approved' :
      'Not applicable',
      detailed: true
    },
    {
      label: 'Music licence',
      value: 'Original score, sync licence held by the rights holder',
      detailed: true
    },
    {
      label: 'Likeness',
      value: 'All performers under signed likeness agreement',
      detailed: true
    }],

    aiCapabilities: railway ?
    railwayAi :
    railwayAi.map((c) =>
    c.allowed ?
    c :
    { ...c, reason: 'The rights holder has not granted derivative use of the score.' }
    ),
    downloadable: !blocked && !sports,
    // The demo identity owns nothing; owner mode is proven on a title the
    // Studio project actually produces.
    ownedByViewer: railway,
    suggestedQuestions: [
    'What is this about?',
    'Is this suitable for teenagers?',
    'Who are the main characters?',
    'What languages are available?',
    'Why might I like it?',
    'Give me a spoiler-free summary.',
    'Explain the ending.',
    'Tell me about the creator.',
    'What should I watch next?']

  };
}

const cache = new Map<string, TitleExperience>();

export function experienceFor(title: ContentTitle): TitleExperience {
  const hit = cache.get(title.slug);
  if (hit) return hit;
  const built = build(title);
  cache.set(title.slug, built);
  return built;
}