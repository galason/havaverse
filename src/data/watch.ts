import type {
  AudioTrack,
  EconomyConfig,
  QualityOption,
  SubtitleTrack,
  WatchAsset,
  WatchComment } from
'../types/watch';
import { IMAGES, titles } from './catalog';
import { titleBySlug } from '../services/releaseRegistry';

const STILLS = {
  lagosBackdrop: "/c67708bf-f86a-4d9a-8fd0-07f8b4803053.jpg",

  courier: "/3a6af438-6f1c-429f-be83-2c78c9f25c1e.jpg",

  fixer: "/403a1abc-ee16-476f-a227-c43d956c5836.jpg",

  syndicate: "/a7a1f493-aa2d-4642-89c6-89644fd9f3b0.jpg"

};

/* ------------------------------------------------------------------ config */

const ladder = (heights: number[]): QualityOption[] =>
[2160, 1440, 1080, 720, 480, 360].map((height) => ({
  id: `q${height}`,
  label: `${height}p`,
  height,
  available: heights.includes(height)
}));

const audio = (labels: [string, AudioTrack['kind']][]): AudioTrack[] =>
labels.map(([label, kind]) => ({ id: label.toLowerCase().replace(/\s+/g, '-'), label, kind }));

const subs = (labels: string[]): SubtitleTrack[] =>
labels.map((label) => ({
  id: label.toLowerCase().replace(/\s+/g, '-'),
  label,
  kind: label.includes('CC') ? 'captions' : 'subtitles'
}));

/**
 * In production this is served by the economy control plane per creator and
 * per region. Nothing here is decided in a component.
 */
const economy = (
enabled: EconomyConfig['enabled'],
membershipMinor?: number,
membershipLabel?: string)
: EconomyConfig => ({
  currency: 'NGN',
  currencySymbol: '₦',
  supportTiers: [
  { id: 's1', minor: 50_000, label: '₦500' },
  { id: 's2', minor: 100_000, label: '₦1,000' },
  { id: 's3', minor: 500_000, label: '₦5,000' },
  { id: 's4', minor: 1_000_000, label: '₦10,000' }],

  enabled,
  membershipMinor,
  membershipLabel
});

/* ---------------------------------------------------------------- comments */

const avatars = [IMAGES.creator, STILLS.fixer, STILLS.courier, STILLS.syndicate];

const comment = (
id: string,
author: string,
handle: string,
body: string,
postedAt: string,
likes: number,
atSeconds?: number,
fromCreator = false,
replies: WatchComment[] = [])
: WatchComment => ({
  id,
  author,
  handle,
  avatar: avatars[Number(id.replace(/\D/g, '')) % avatars.length],
  body,
  postedAt,
  likes,
  atSeconds,
  fromCreator,
  replies
});

const railwayComments: WatchComment[] = [
comment(
  'wc1',
  'Tunde Adeyemi',
  'tundecreative',
  'That transition at 42:17 was incredible. The way the carriage lights fail one row at a time and she keeps counting anyway — that is the whole film in six seconds.',
  '2h ago',
  1243,
  2537,
  false,
  [
  comment(
    'wc2',
    'Adaeze Films',
    'adaezefilms',
    'We shot that practical, on a real yard, with nine working lamps and a timer. Nothing in that shot is generated.',
    '1h ago',
    842,
    undefined,
    true
  )]

),
comment(
  'wc3',
  'Zainab Bello',
  'zainabfilm',
  'Amara is such a specific character. She never explains herself and the film never apologises for that.',
  '3h ago',
  842
),
comment(
  'wc4',
  'Chidera Nwosu',
  'movielover',
  'Watch the manifest board at 08:14 — the ninth carriage is already listed. It is there the whole time.',
  '4h ago',
  620,
  494
),
comment(
  'wc5',
  'Ifeoma Chukwu',
  'ifeomawrites',
  'The sound design during the chase does something strange — the score drops out entirely and you only hear the rails. More films should trust silence.',
  '6h ago',
  418,
  3521
)];


const lagosComments: WatchComment[] = [
comment(
  'lc1',
  'Kemi Adebayo',
  'kemi',
  'The flooded market sequence is the best thing in Nigerian sci-fi this year. No notes.',
  '1h ago',
  2140,
  1088
),
comment(
  'lc2',
  'Studio Ikeja',
  'studioikeja',
  'Everything in that market was built practically and then extended. The water is real — we shot in a tank in Ikeja for eleven nights.',
  '58m ago',
  1320,
  undefined,
  true
),
comment(
  'lc3',
  'Emeka Obi',
  'emeka',
  'At 58:41 she chooses to keep the memory rather than sell it, and the film never tells you whether she was right.',
  '3h ago',
  904,
  3521
),
comment(
  'lc4',
  'Amara Bright',
  'amarab',
  'The Pidgin dub is genuinely better than the English track. Different performance, not just a translation.',
  '5h ago',
  512
)];


/* -------------------------------------------------------------------- data */

const railway: WatchAsset = {
  slug: 'the-last-train',
  durationSeconds: 5760,
  backdrop: IMAGES.heroLastTrain,
  entitlement: { state: 'available', reason: 'Included with your HavaVerse account.' },
  qualities: ladder([2160, 1080, 720, 480, 360]),
  audio: audio([
  ['English', 'original'],
  ['Igbo', 'dub'],
  ['Nigerian Pidgin', 'dub'],
  ['English — audio described', 'described']]
  ),
  subtitles: subs(['English', 'English (CC)', 'Igbo', 'Yoruba', 'French']),
  chapters: [
  { id: 'c1', label: 'Arrival', startSeconds: 0, kind: 'intro', still: IMAGES.heroLastTrain },
  { id: 'c2', label: 'The Signal', startSeconds: 494, kind: 'scene', still: IMAGES.lastTrain },
  { id: 'c3', label: 'The Discovery', startSeconds: 1292, kind: 'scene', still: IMAGES.heroLastTrain, generated: true },
  { id: 'c4', label: 'The Station', startSeconds: 2537, kind: 'scene', still: IMAGES.lastTrain, generated: true },
  { id: 'c5', label: 'The Chase', startSeconds: 3521, kind: 'scene', still: IMAGES.heroLastTrain, generated: true },
  { id: 'c6', label: 'The Decision', startSeconds: 4870, kind: 'scene', still: IMAGES.lastTrain },
  { id: 'c7', label: 'Credits', startSeconds: 5580, kind: 'credits' }],

  cast: [
  { id: 'cast1', name: 'Adaeze Okafor', role: 'Director', portrait: IMAGES.creator, to: '/creator/@adaezefilms' },
  { id: 'cast2', name: 'Ngozi Eze', role: 'Amara', portrait: STILLS.courier, to: '/characters/amara' },
  { id: 'cast3', name: 'Daniel Umeh', role: 'Daniel', portrait: STILLS.fixer, to: '/characters/daniel' }],

  graph: [
  {
    id: 'g1',
    kind: 'character',
    name: 'Amara',
    meta: 'Lead · Signal engineer',
    image: STILLS.courier,
    to: '/characters/amara',
    bio: 'A signal engineer who counts the carriages every night because nobody else does. She does not explain herself, and the film never makes her.',
    appearsIn: [
    { label: 'The Last Train', to: '/title/the-last-train' },
    { label: 'Railway Chronicles', to: '/universes/railway/stories' }]

  },
  {
    id: 'g2',
    kind: 'character',
    name: 'Daniel',
    meta: 'Co-lead · Yard clerk',
    image: STILLS.fixer,
    to: '/characters/daniel',
    bio: 'The yard clerk who logs what passes through and has stopped asking what it is. He arrives in the rain without an umbrella, which tells you everything.',
    appearsIn: [{ label: 'The Last Train', to: '/title/the-last-train' }]
  },
  {
    id: 'g3',
    kind: 'location',
    name: 'Lagos Railway Yard',
    meta: 'Primary location',
    image: IMAGES.heroLastTrain,
    to: '/universes/railway'
  },
  {
    id: 'g4',
    kind: 'story',
    name: 'Railway Chronicles',
    meta: 'Serialised story · 9 parts',
    image: IMAGES.lastTrain,
    to: '/universes/railway/stories'
  },
  {
    id: 'g5',
    kind: 'soundtrack',
    name: 'Night Line',
    meta: 'Original score · Maya Okonkwo',
    image: IMAGES.concert,
    to: '/music/track/tr1'
  },
  {
    id: 'g6',
    kind: 'product',
    name: "Amara's field jacket",
    meta: 'Costume reproduction',
    image: IMAGES.lastTrain,
    to: '/market/universe/railway'
  }],

  economy: economy(['tip', 'membership', 'merch'], 200_000, 'Railway Inner Circle'),
  knowledge: [
  {
    match: ['amara', 'who is she', 'protagonist', 'lead'],
    answer: {
      body: 'Amara is the signal engineer at the centre of the film. She walks the sidings every night counting carriages, and the story begins the night the count does not resolve. The film deliberately withholds her backstory — what you learn about her, you learn from what she does.',
      citations: [
      { label: 'Amara', meta: 'Character · The Last Train', to: '/characters/amara', image: STILLS.courier }]

    }
  },
  {
    match: ['railway', 'significance', 'ninth', 'carriage', 'meaning'],
    answer: {
      body: 'The ninth carriage is the film\'s central object. It appears on the manifest board at 08:14 — before anyone acknowledges it exists — and the rest of the film is about who already knew. The creator has not confirmed what is inside it, so I will not invent an answer.',
      seekTo: 494
    }
  },
  {
    match: ['ending', 'explain the ending', 'end'],
    answer: {
      body: 'In the final scene Amara opens the sealed door and the film cuts before we see inside. That choice is intentional: the story is about who is willing to look, not about what is there. The community has several readings — the most argued one is in the theory thread.',
      citations: [
      { label: 'Who actually knew about the railway?', meta: 'Discussion · 8.4K replies', to: '/discussions/d1' }],

      seekTo: 4870
    }
  },
  {
    match: ['previous scene', 'what happened', 'catch me up', 'recap'],
    answer: {
      body: 'Before this point, Amara has found relay cabinet 7 rewired and Daniel has warned her off the yard without saying who sent him. The chapter you are in opens immediately after she decides to go back anyway.',
      seekTo: 2537
    }
  },
  {
    match: ['director', 'who directed', 'creator', 'made this'],
    answer: {
      body: 'Directed by Adaeze Okafor for Adaeze Films, a HavaVerse Original. The production used generated shots for three sequences, all labelled in the content credits.',
      citations: [
      { label: 'Adaeze Films', meta: 'Creator · 1.2M supporters', to: '/creator/@adaezefilms', image: IMAGES.creator }]

    }
  },
  {
    match: ['soundtrack', 'music', 'score', 'song'],
    answer: {
      body: 'The score is "Night Line" by Maya Okonkwo, written against picture rather than licensed afterwards. It is on HavaVerse Music with the film credited in its graph.',
      citations: [
      { label: 'Night Line', meta: 'Original score · Maya Okonkwo', to: '/music/track/tr1', image: IMAGES.concert }]

    }
  },
  {
    match: ['like this', 'similar', 'other films', 'recommend'],
    answer: {
      body: 'If it is the slow-dread register you want rather than the setting, Lagos 2042 is the closest match in the catalogue. The King\'s Court shares the withheld-information structure but not the tone.',
      citations: [
      { label: 'Lagos 2042', meta: 'Film · Sci-Fi · 102 min', to: '/title/lagos-2042', image: IMAGES.lagos }]

    }
  },
  {
    match: ['language', 'spoken', 'dub', 'pidgin', 'igbo'],
    answer: {
      body: 'The original performance is in English with Igbo throughout the yard scenes. Igbo and Nigerian Pidgin dubs are available from the audio menu, along with an audio-described English track.'
    }
  },
  {
    match: ['jacket', 'buy', 'merch', 'wear', 'costume'],
    answer: {
      body: "Amara's field jacket is reproduced from the production costume and sold through the Railway universe store, with the creator share going to Adaeze Films.",
      citations: [
      { label: 'Railway universe store', meta: 'Market · 12 products', to: '/market/universe/railway', image: IMAGES.lastTrain }]

    }
  }],

  suggestedQuestions: [
  'Who is Amara?',
  'What happened in the previous scene?',
  'What is the significance of the railway?',
  'Explain the ending.',
  'Where can I find the soundtrack?'],

  discussionCount: '32.4K',
  likes: 12_400,
  followers: '1.2M'
};

const lagos: WatchAsset = {
  slug: 'lagos-2042',
  durationSeconds: 6120,
  backdrop: STILLS.lagosBackdrop,
  entitlement: { state: 'available', reason: 'Included with your HavaVerse account.' },
  qualities: ladder([2160, 1440, 1080, 720, 480]),
  audio: audio([
  ['English', 'original'],
  ['Nigerian Pidgin', 'dub'],
  ['Yoruba', 'dub']]
  ),
  subtitles: subs(['English', 'English (CC)', 'Nigerian Pidgin', 'Yoruba', 'Hausa']),
  chapters: [
  { id: 'l1', label: 'Nine Hours', startSeconds: 0, kind: 'intro', still: STILLS.lagosBackdrop },
  { id: 'l2', label: 'The Handoff', startSeconds: 512, kind: 'scene', still: IMAGES.lagos },
  { id: 'l3', label: 'Flooded Market', startSeconds: 1088, kind: 'scene', still: STILLS.lagosBackdrop, generated: true },
  { id: 'l4', label: 'Ikeja District', startSeconds: 2160, kind: 'scene', still: IMAGES.lagos },
  { id: 'l5', label: 'What She Keeps', startSeconds: 3521, kind: 'scene', still: STILLS.lagosBackdrop, generated: true },
  { id: 'l6', label: 'Dawn', startSeconds: 5240, kind: 'scene', still: IMAGES.lagos },
  { id: 'l7', label: 'Credits', startSeconds: 5940, kind: 'credits' }],

  cast: [
  { id: 'lc1', name: 'Kemi Adetiba', role: 'Director', portrait: IMAGES.creator, to: '/creator/@studioikeja' },
  { id: 'lc2', name: 'Tunde Babalola', role: 'Writer', portrait: STILLS.fixer },
  { id: 'lc3', name: 'Bimbo Manuel', role: 'Producer', portrait: STILLS.syndicate }],

  graph: [
  {
    id: 'lg1',
    kind: 'character',
    name: 'Adunni',
    meta: 'Lead · Memory courier',
    image: STILLS.courier,
    bio: 'A courier who carries other people\'s memories for money and has nine hours to decide who gets to remember Lagos as it was. She is the only character in the film who never lies.',
    appearsIn: [{ label: 'Lagos 2042', to: '/title/lagos-2042' }]
  },
  {
    id: 'lg2',
    kind: 'character',
    name: 'Femi',
    meta: 'Co-lead · Fixer',
    image: STILLS.fixer,
    bio: 'The fixer who sets up the handoff and spends the rest of the night trying to undo it. Warm, compromised, and the closest thing the film has to a conscience.',
    appearsIn: [{ label: 'Lagos 2042', to: '/title/lagos-2042' }]
  },
  {
    id: 'lg3',
    kind: 'character',
    name: 'Chief Okoro',
    meta: 'Antagonist · Syndicate',
    image: STILLS.syndicate,
    bio: 'He does not want the memory destroyed. He wants to be the only one who has it — which the film treats as the more frightening ambition.',
    appearsIn: [{ label: 'Lagos 2042', to: '/title/lagos-2042' }]
  },
  {
    id: 'lg4',
    kind: 'location',
    name: 'Ikeja District',
    meta: 'Flooded quarter · 2042',
    image: STILLS.lagosBackdrop,
    to: '/market/universe/lagos-2042'
  },
  {
    id: 'lg5',
    kind: 'soundtrack',
    name: 'Lagos After Dark',
    meta: 'Score world · 7 cues',
    image: IMAGES.concert,
    to: '/music/world/lagos-after-dark'
  },
  {
    id: 'lg6',
    kind: 'product',
    name: 'Lagos 2042 art print',
    meta: 'Limited edition',
    image: IMAGES.lagos,
    to: '/market/universe/lagos-2042'
  }],

  economy: economy(['tip', 'merch']),
  knowledge: [
  {
    match: ['adunni', 'who is', 'protagonist', 'lead', 'courier', 'amara'],
    answer: {
      body: 'Adunni is the memory courier at the centre of the film. She carries a package containing stolen memories of Lagos before the flood, and has nine hours to decide who gets to keep them. The film gives her no backstory on purpose — she is defined entirely by that decision.',
      citations: [{ label: 'Adunni', meta: 'Character · Lagos 2042', to: '#character-lg1', image: STILLS.courier }]
    }
  },
  {
    match: ['ending', 'explain the ending', 'end', 'keep'],
    answer: {
      body: 'At 58:41 she chooses to keep the memory rather than sell it or destroy it, and the film ends without telling you whether that was right. The last shot is deliberately ambiguous about whether the city is remembering or being remembered.',
      seekTo: 3521
    }
  },
  {
    match: ['previous scene', 'what happened', 'recap', 'catch me up'],
    answer: {
      body: 'Before this point the handoff in the flooded market has gone wrong, Femi has admitted he knew who the buyer was, and Chief Okoro has made an offer Adunni has not answered.',
      seekTo: 1088
    }
  },
  {
    match: ['director', 'who directed', 'creator', 'studio'],
    answer: {
      body: 'Directed by Kemi Adetiba for Studio Ikeja. The market sequence was built practically in a water tank in Ikeja over eleven nights and then extended digitally.',
      citations: [{ label: 'Studio Ikeja', meta: 'Creator · 24.8K followers', to: '/creator/@studioikeja', image: IMAGES.creator }]
    }
  },
  {
    match: ['similar', 'like this', 'other films', 'recommend'],
    answer: {
      body: 'The Last Train is the closest neighbour — same withheld-information structure, different register. If you want the city rather than the dread, Lagos After Dark on HavaVerse Music is the same world in sound.',
      citations: [{ label: 'The Last Train', meta: 'Film · Thriller · 96 min', to: '/title/the-last-train', image: IMAGES.lastTrain }]
    }
  },
  {
    match: ['language', 'spoken', 'pidgin', 'dub', 'yoruba'],
    answer: {
      body: 'The original track is English with Nigerian Pidgin throughout the market scenes. Full Pidgin and Yoruba dubs are available — the Pidgin track is a different performance, not a translation of the English one.'
    }
  },
  {
    match: ['soundtrack', 'music', 'score'],
    answer: {
      body: 'The score belongs to the Lagos After Dark world on HavaVerse Music — seven cues written for the film and released as a world rather than an album.',
      citations: [{ label: 'Lagos After Dark', meta: 'Music world · 48 artists', to: '/music/world/lagos-after-dark', image: IMAGES.concert }]
    }
  }],

  suggestedQuestions: [
  'Who is Adunni?',
  'What happened in the previous scene?',
  'Explain the ending.',
  'Show me other films like this.',
  'Who directed this?'],

  discussionCount: '18.6K',
  likes: 9_180,
  followers: '24.8K'
};

/** Titles without a bespoke package still get a coherent, honest one. */
function fallback(slug: string): WatchAsset {
  const title = titleBySlug(slug) ?? titles[0];
  const minutes = Number(title.runtime.match(/\d+/)?.[0] ?? 48);
  const duration = Math.max(240, minutes * 60);

  const entitlement: WatchAsset['entitlement'] =
  slug === 'the-kings-court' ?
  {
    state: 'ppv-required',
    reason: 'This premiere is not part of the standard catalogue yet.',
    priceMinor: 150_000,
    includedWith: 'HavaVerse Premium'
  } :
  slug === 'animeverse' ?
  {
    state: 'region-restricted',
    reason: 'The rights holder has not licensed this title in your region.',
    availableRegions: ['Ghana', 'Kenya', 'United Kingdom']
  } :
  { state: 'available', reason: 'Included with your HavaVerse account.' };

  return {
    slug,
    durationSeconds: duration,
    backdrop: title.backdrop ?? title.poster,
    entitlement,
    qualities: ladder([1080, 720, 480, 360]),
    audio: audio(title.languages.map((l, i) => [l, i === 0 ? 'original' : 'dub'])),
    subtitles: subs([...title.languages, 'English (CC)']),
    chapters: [
    { id: 'f1', label: 'Opening', startSeconds: 0, kind: 'intro', still: title.poster },
    { id: 'f2', label: 'Part one', startSeconds: Math.round(duration * 0.18), kind: 'scene', still: title.poster },
    { id: 'f3', label: 'Part two', startSeconds: Math.round(duration * 0.48), kind: 'scene', still: title.poster },
    { id: 'f4', label: 'Final act', startSeconds: Math.round(duration * 0.78), kind: 'scene', still: title.poster }],

    cast: [{ id: 'fc1', name: title.creator, role: 'Creator', portrait: IMAGES.creator, to: `/creator/${title.creatorHandle}` }],
    graph: [],
    economy: economy(['tip']),
    knowledge: [
    {
      match: ['director', 'creator', 'who made'],
      answer: {
        body: `${title.name} was made by ${title.creator}.`,
        citations: [
        { label: title.creator, meta: 'Creator', to: `/creator/${title.creatorHandle}`, image: IMAGES.creator }]

      }
    }],

    suggestedQuestions: ['Who made this?', 'What is it about?'],
    discussionCount: '2.1K',
    likes: 1_840,
    followers: '18.4K'
  };
}

const bespoke: Record<string, WatchAsset> = {
  'the-last-train': railway,
  'lagos-2042': lagos
};

export function watchAssetFor(slug: string): WatchAsset {
  return bespoke[slug] ?? fallback(slug);
}

export function commentsFor(slug: string): WatchComment[] {
  if (slug === 'the-last-train') return railwayComments;
  if (slug === 'lagos-2042') return lagosComments;
  return [];
}

export const shareTargets = ['WhatsApp', 'X', 'Facebook', 'Instagram', 'Telegram'] as const;

export const reportReasons = [
'Copyright concern',
'Inappropriate content',
'Violence',
'Hate or harassment',
'Misleading information',
'Spam',
'Technical issue',
'Other'] as
const;