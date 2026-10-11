import type { FeedMode, RelatedGroup, Short, ShortAnalytics, ShortComment } from '../types/shorts';
import { IMAGES } from './catalog';

export const SHORT_IMAGES = {
  amaraRain: "/ca3d235f-593e-4738-8570-8b625ab2307a.jpg",

  railwayYard: "/b4f36d21-719f-4598-b9e1-124addacadb9.jpg",

  afrobeats: "/02bb9348-c717-47f6-8f0d-fe88fd8798e2.jpg",

  goal: "/b48bf062-5fd6-495c-b6c7-d812be3a9af5.jpg",
  behindScenes: "/cf64123d-3c6c-486f-921a-256867040791.jpg"

};

export const feedModes: {id: FeedMode;label: string;blurb: string;}[] = [
{ id: 'for-you', label: 'For You', blurb: 'Shaped by what you watch, save and follow.' },
{ id: 'following', label: 'Following', blurb: 'Only creators and communities you follow.' },
{ id: 'trending', label: 'Trending', blurb: 'Moving fastest in your market right now.' },
{ id: 'new', label: 'New', blurb: 'Published in the last 48 hours.' },
{ id: 'ai-picks', label: 'AI Picks', blurb: 'Hava AI’s picks, with its reasoning attached.' },
{ id: 'near-you', label: 'Near You', blurb: 'Made in and around Lagos.' },
{
  id: 'continue-universe',
  label: 'Continue Universe',
  blurb: 'Moments from worlds you already follow.'
}];


const adaeze = {
  handle: 'adaeze-films',
  name: 'Adaeze Films',
  kind: 'Independent Studio',
  followers: '1.2M followers',
  avatar: IMAGES.creator,
  bio: 'Stories from Africa, one frame at a time.',
  location: 'Lagos, Nigeria',
  languages: ['English', 'Igbo', 'Yoruba'],
  verified: true,
  to: '/creator/adaeze-films'
};

const ikeja = {
  handle: 'studio-ikeja',
  name: 'Studio Ikeja',
  kind: 'Production House',
  followers: '824K followers',
  avatar: IMAGES.lagos,
  bio: 'Building the future of Lagos on screen.',
  location: 'Ikeja, Nigeria',
  languages: ['English', 'Pidgin'],
  verified: true,
  to: '/creator/studio-ikeja'
};

const mayaK = {
  handle: 'maya-k',
  name: 'Maya K.',
  kind: 'Artist · Producer',
  followers: '2.4M followers',
  avatar: IMAGES.afro,
  bio: 'Night music for a city that never sleeps.',
  location: 'Lagos · London',
  languages: ['English', 'Yoruba'],
  verified: true,
  to: '/music/artist/maya-k'
};

const havaLive = {
  handle: 'havaverse-live',
  name: 'HavaVerse Live',
  kind: 'Official',
  followers: '4.1M followers',
  avatar: IMAGES.stadium,
  bio: 'Every moment, the second it happens.',
  location: 'Global',
  languages: ['English', 'French'],
  verified: true,
  to: '/sports'
};

const openRights = {
  watch: true,
  share: true,
  download: false,
  remix: false,
  aiReference: true,
  availableRegions: ['NG', 'GH', 'KE', 'ZA', 'GB'],
  restrictionNote: null,
  maturity: 'PG-16'
};

export const shorts: Short[] = [
{
  id: 'sh-1',
  slug: 'the-last-train-scene-04',
  kind: 'scene',
  poster: SHORT_IMAGES.amaraRain,
  caption: 'The Last Train — Scene 04',
  story:
  'A young engineer discovers the abandoned railway near her village is being used to move something at night.',
  durationSeconds: 45,
  hashtags: ['#TheLastTrain', '#AfricanSciFi', '#Thriller'],
  language: 'English',
  region: 'NG',
  publishedAgo: '2 days ago',
  views: '3.4M views',
  likes: 124000,
  comments: 4218,
  shares: 8600,
  saves: 32000,
  watchingNow: 342,
  creator: adaeze,
  graph: [
  {
    id: 'g1',
    kind: 'title',
    label: 'The Last Train',
    sub: 'Film · 96 min',
    image: IMAGES.lastTrain,
    to: '/title/the-last-train'
  },
  {
    id: 'g2',
    kind: 'creator',
    label: 'Adaeze Films',
    sub: 'Creator · 1.2M followers',
    image: IMAGES.creator,
    to: '/creator/adaeze-films'
  },
  {
    id: 'g3',
    kind: 'character',
    label: 'Amara',
    sub: 'Character · Protagonist',
    image: SHORT_IMAGES.amaraRain,
    to: '/characters/amara'
  },
  {
    id: 'g4',
    kind: 'music',
    label: 'The Last Train OST',
    sub: 'Music · 8 tracks',
    image: IMAGES.afro,
    to: '/music/track/night-line'
  },
  {
    id: 'g5',
    kind: 'community',
    label: 'The Last Train Community',
    sub: 'Community · 18.4K fans',
    image: IMAGES.lastTrain,
    to: '/community/the-last-train'
  },
  {
    id: 'g6',
    kind: 'universe',
    label: 'The Railway Universe',
    sub: 'Universe · 7 works',
    image: SHORT_IMAGES.railwayYard,
    to: '/universes/railway'
  }],

  primaryCta: { label: 'Watch full film', sub: 'The Last Train · 96 min', to: '/title/the-last-train' },
  music: {
    trackId: 'night-line',
    title: 'Night Line',
    artist: 'Maya K.',
    artwork: IMAGES.afro,
    to: '/music/track/night-line'
  },
  products: [
  { id: 'poster-lt', name: 'Official Poster', price: '₦12,000', image: IMAGES.lastTrain, to: '/market/product/poster-lt' },
  { id: 'amara-tee', name: 'Character Tee', price: '₦18,500', image: SHORT_IMAGES.amaraRain, to: '/market/product/amara-tee' },
  { id: 'ost-lt', name: 'Original Score', price: '₦4,000', image: IMAGES.afro, to: '/market/product/ost-lt' }],

  community: {
    id: 'the-last-train',
    name: 'The Last Train Community',
    fans: '18.4K fans',
    discussing: '4,218 discussing now',
    image: IMAGES.lastTrain,
    to: '/community/the-last-train',
    discussTo: '/discussions/who-knew-railway'
  },
  sports: null,
  provenance: {
    mode: 'ai-assisted',
    lines: [
    { label: 'Story & screenplay', value: 'Adaeze Okafor (human)' },
    { label: 'Visual generation', value: 'HavaVerse Visual Agent v4' },
    { label: 'Voice', value: 'Performed by Ngozi Eze (human)' },
    { label: 'Music', value: 'Night Line — Maya K. (licensed)' }]

  },
  rights: { ...openRights, remix: true },
  reason: {
    short: 'Because you watched The Last Train',
    detail:
    'You are 42% through the film and open African science fiction more than any other genre. This is the scene most viewers rewatch.'
  },
  modes: ['for-you', 'trending', 'continue-universe', 'near-you'],
  spoiler: null,
  ownedByViewer: false
},
{
  id: 'sh-2',
  slug: 'night-line-video',
  kind: 'music',
  poster: SHORT_IMAGES.afrobeats,
  caption: 'Night Line — rooftop session',
  story: 'Maya K. performs the closing theme from The Last Train above Ikoyi, one take, no playback.',
  durationSeconds: 38,
  hashtags: ['#NightLine', '#Afrobeats', '#Lagos'],
  language: 'English',
  region: 'NG',
  publishedAgo: '9 hours ago',
  views: '1.8M views',
  likes: 88400,
  comments: 2140,
  shares: 5200,
  saves: 21000,
  watchingNow: null,
  creator: mayaK,
  graph: [
  {
    id: 'g1',
    kind: 'music',
    label: 'Night Line',
    sub: 'Track · 3:56',
    image: IMAGES.afro,
    to: '/music/track/night-line'
  },
  {
    id: 'g2',
    kind: 'creator',
    label: 'Maya K.',
    sub: 'Artist · 2.4M listeners',
    image: IMAGES.afro,
    to: '/music/artist/maya-k'
  },
  {
    id: 'g3',
    kind: 'title',
    label: 'The Last Train',
    sub: 'Film this scores',
    image: IMAGES.lastTrain,
    to: '/title/the-last-train'
  },
  {
    id: 'g4',
    kind: 'event',
    label: 'Lagos After Dark',
    sub: 'Live · 14 Oct',
    image: IMAGES.concert,
    to: '/music/live'
  }],

  primaryCta: { label: 'Play the full track', sub: 'Night Line · 3:56', to: '/music/track/night-line' },
  music: {
    trackId: 'night-line',
    title: 'Night Line',
    artist: 'Maya K.',
    artwork: IMAGES.afro,
    to: '/music/track/night-line'
  },
  products: [],
  community: null,
  sports: null,
  provenance: null,
  rights: { ...openRights, remix: true, download: true },
  reason: {
    short: 'Because you saved Afrobeats Rising',
    detail:
    'You have played three tracks from the Lagos After Dark world this week. Maya K. appears in all three of their rotations.'
  },
  modes: ['for-you', 'trending', 'near-you', 'new', 'following'],
  spoiler: null,
  ownedByViewer: false
},
{
  id: 'sh-3',
  slug: 'eagles-78th-minute',
  kind: 'sports',
  poster: SHORT_IMAGES.goal,
  caption: 'Nigeria 2 — 1 Ghana · 78’',
  story: 'Osimhen turns it in at the near post and the whole stadium goes up.',
  durationSeconds: 22,
  hashtags: ['#RisingEagles', '#AFCON', '#Goal'],
  language: 'English',
  region: 'NG',
  publishedAgo: '1 hour ago',
  views: '6.1M views',
  likes: 241000,
  comments: 9840,
  shares: 31000,
  saves: 12000,
  watchingNow: 5911,
  creator: havaLive,
  graph: [
  {
    id: 'g1',
    kind: 'event',
    label: 'Nigeria vs Ghana',
    sub: 'Live · 78’',
    image: IMAGES.stadium,
    to: '/sports'
  },
  {
    id: 'g2',
    kind: 'community',
    label: 'Super Eagles',
    sub: 'Community · 206K members',
    image: IMAGES.eagles,
    to: '/community/super-eagles'
  },
  {
    id: 'g3',
    kind: 'title',
    label: 'Rising Eagles',
    sub: 'Documentary · 48 min',
    image: IMAGES.eagles,
    to: '/title/rising-eagles'
  }],

  primaryCta: { label: 'Watch the match live', sub: 'AFCON Qualifier · 78’', to: '/sports' },
  music: null,
  products: [],
  community: {
    id: 'super-eagles',
    name: 'Super Eagles',
    fans: '206K members',
    discussing: '12,480 discussing now',
    image: IMAGES.eagles,
    to: '/community/super-eagles',
    discussTo: '/discussions/should-coach-start-him'
  },
  sports: {
    competition: 'AFCON Qualifier',
    moment: 'Goal · 78’',
    score: 'Nigeria 2 — 1 Ghana',
    matchTo: '/sports',
    highlightsTo: '/community/super-eagles'
  },
  provenance: null,
  rights: { ...openRights, share: true, remix: false, maturity: 'All ages' },
  reason: {
    short: 'Because you follow the Super Eagles',
    detail: 'You set a reminder for this fixture and you open live sport more than any other category.'
  },
  modes: ['for-you', 'trending', 'new', 'near-you', 'following'],
  spoiler: null,
  ownedByViewer: false
},
{
  id: 'sh-4',
  slug: 'inside-the-signal',
  kind: 'behind-the-scenes',
  poster: SHORT_IMAGES.behindScenes,
  caption: 'How we shot “The Signal” in one night',
  story:
  'Four hours, one generator, and a borrowed dolly. Adaeze walks through the hardest setup of the production.',
  durationSeconds: 58,
  hashtags: ['#BehindTheScenes', '#IndieFilm', '#TheLastTrain'],
  language: 'English',
  region: 'NG',
  publishedAgo: '3 days ago',
  views: '742K views',
  likes: 41200,
  comments: 1180,
  shares: 2400,
  saves: 18400,
  watchingNow: null,
  creator: adaeze,
  graph: [
  {
    id: 'g1',
    kind: 'title',
    label: 'The Last Train',
    sub: 'Film · 96 min',
    image: IMAGES.lastTrain,
    to: '/title/the-last-train'
  },
  {
    id: 'g2',
    kind: 'creator',
    label: 'Adaeze Films',
    sub: 'Creator · 1.2M followers',
    image: IMAGES.creator,
    to: '/creator/adaeze-films'
  },
  {
    id: 'g3',
    kind: 'community',
    label: 'Independent Filmmakers',
    sub: 'Community · 18.7K members',
    image: SHORT_IMAGES.behindScenes,
    to: '/community/independent-filmmakers'
  }],

  primaryCta: { label: 'Explore the production', sub: 'Story Bible · The Last Train', to: '/title/the-last-train' },
  music: null,
  products: [],
  community: {
    id: 'independent-filmmakers',
    name: 'Independent Filmmakers',
    fans: '18.7K members',
    discussing: '426 discussing now',
    image: SHORT_IMAGES.behindScenes,
    to: '/community/independent-filmmakers',
    discussTo: '/discussions/best-nigerian-scifi'
  },
  sports: null,
  provenance: null,
  rights: { ...openRights, remix: true },
  reason: {
    short: 'From a creator you follow',
    detail: 'You follow Adaeze Films and you watch behind-the-scenes material to the end more often than not.'
  },
  modes: ['following', 'ai-picks', 'for-you', 'near-you'],
  spoiler: null,
  ownedByViewer: false
},
{
  id: 'sh-5',
  slug: 'lagos-2042-first-look',
  kind: 'trailer',
  poster: IMAGES.lagos,
  caption: 'Lagos 2042 — first look',
  story: 'The city forty years from now, built entirely inside the AI Entertainment Director.',
  durationSeconds: 31,
  hashtags: ['#Lagos2042', '#MadeWithHavaVerseAI'],
  language: 'English',
  region: 'NG',
  publishedAgo: '20 hours ago',
  views: '2.2M views',
  likes: 96800,
  comments: 3420,
  shares: 7100,
  saves: 26000,
  watchingNow: null,
  creator: ikeja,
  graph: [
  {
    id: 'g1',
    kind: 'title',
    label: 'Lagos 2042',
    sub: 'Film · 102 min',
    image: IMAGES.lagos,
    to: '/title/lagos-2042'
  },
  {
    id: 'g2',
    kind: 'creator',
    label: 'Studio Ikeja',
    sub: 'Creator · 824K followers',
    image: IMAGES.lagos,
    to: '/creator/studio-ikeja'
  },
  {
    id: 'g3',
    kind: 'universe',
    label: 'Lagos 2042 Universe',
    sub: 'Universe · characters & world',
    image: IMAGES.lagos,
    to: '/universes/railway'
  }],

  primaryCta: { label: 'Explore the title', sub: 'Lagos 2042 · 102 min', to: '/title/lagos-2042' },
  music: null,
  products: [
  { id: 'lagos-print', name: 'Lagos 2042 Art Print', price: '₦15,000', image: IMAGES.lagos, to: '/market/product/lagos-print' }],

  community: null,
  sports: null,
  provenance: {
    mode: 'ai-directed',
    lines: [
    { label: 'Concept & direction', value: 'Studio Ikeja (human)' },
    { label: 'Shot generation', value: 'HavaVerse Visual Agent v4' },
    { label: 'Edit', value: 'HavaVerse Editor Agent' },
    { label: 'Score', value: 'Generated — no third-party samples' }]

  },
  rights: { ...openRights, remix: true, aiReference: true },
  reason: {
    short: 'Hava AI picked this for you',
    detail:
    'You have opened three AI-produced works this month and finished all three. This is the highest-rated new one in your region.'
  },
  modes: ['ai-picks', 'new', 'for-you', 'trending'],
  spoiler: null,
  ownedByViewer: false
},
{
  id: 'sh-6',
  slug: 'kings-court-throne-room',
  kind: 'scene',
  poster: IMAGES.kings,
  caption: 'The King’s Court — the throne room',
  story: 'Season one’s turning point, in ninety seconds of silence and one line of dialogue.',
  durationSeconds: 52,
  hashtags: ['#TheKingsCourt', '#Series'],
  language: 'Yoruba',
  region: 'NG',
  publishedAgo: '4 days ago',
  views: '1.1M views',
  likes: 52300,
  comments: 2860,
  shares: 3100,
  saves: 14200,
  watchingNow: null,
  creator: ikeja,
  graph: [
  {
    id: 'g1',
    kind: 'title',
    label: 'The King’s Court',
    sub: 'Series · S1 E4',
    image: IMAGES.kings,
    to: '/title/the-kings-court'
  },
  {
    id: 'g2',
    kind: 'creator',
    label: 'Studio Ikeja',
    sub: 'Creator · 824K followers',
    image: IMAGES.lagos,
    to: '/creator/studio-ikeja'
  }],

  primaryCta: {
    label: 'Unlock the series',
    sub: 'Premium premiere · ₦1,500',
    to: '/title/the-kings-court'
  },
  music: null,
  products: [],
  community: null,
  sports: null,
  provenance: null,
  rights: { ...openRights, remix: false, download: false },
  reason: {
    short: 'Trending in Nigeria',
    detail: 'This is the most-shared Short in your region over the last 24 hours.'
  },
  modes: ['trending', 'for-you', 'near-you'],
  spoiler: { note: 'This scene resolves an episode 4 storyline.' },
  ownedByViewer: false
},
{
  id: 'sh-7',
  slug: 'railway-after-midnight',
  kind: 'fan',
  poster: SHORT_IMAGES.railwayYard,
  caption: 'Railway: After Midnight — fan cut',
  story:
  'A fan-made continuation of the railway story. Connected to the universe, but not part of its canon.',
  durationSeconds: 41,
  hashtags: ['#FanCreation', '#RailwayUniverse'],
  language: 'English',
  region: 'NG',
  publishedAgo: '6 days ago',
  views: '418K views',
  likes: 18400,
  comments: 942,
  shares: 1200,
  saves: 6400,
  watchingNow: null,
  creator: {
    handle: 'you',
    name: 'Daniel Okafor',
    kind: 'Viewer · Creator',
    followers: '2,140 followers',
    avatar: IMAGES.creator,
    bio: 'Making things in the Railway universe.',
    location: 'Lagos, Nigeria',
    languages: ['English'],
    verified: false,
    to: '/people/daniel-okafor'
  },
  graph: [
  {
    id: 'g1',
    kind: 'universe',
    label: 'The Railway Universe',
    sub: 'Universe · fan layer',
    image: SHORT_IMAGES.railwayYard,
    to: '/universes/railway'
  },
  {
    id: 'g2',
    kind: 'community',
    label: 'The Last Train Community',
    sub: 'Community · 18.4K fans',
    image: IMAGES.lastTrain,
    to: '/community/the-last-train'
  }],

  primaryCta: { label: 'Explore the universe', sub: 'Official and fan work, clearly separated', to: '/universes/railway' },
  music: null,
  products: [],
  community: null,
  sports: null,
  provenance: {
    mode: 'ai-assisted',
    lines: [
    { label: 'Concept', value: 'Daniel Okafor (human)' },
    { label: 'Visual generation', value: 'HavaVerse Visual Agent v4' },
    { label: 'Canon status', value: 'Fan creation — not official canon' }]

  },
  rights: { ...openRights, remix: false, aiReference: false },
  reason: {
    short: 'From a universe you follow',
    detail: 'You follow the Railway universe. Fan work is always labelled and never presented as canon.'
  },
  modes: ['following', 'continue-universe'],
  spoiler: null,
  ownedByViewer: true
},
{
  id: 'sh-8',
  slug: 'animeverse-opening',
  kind: 'scene',
  poster: IMAGES.anime,
  caption: 'Animeverse — cold open',
  story: 'The opening two minutes of the series.',
  durationSeconds: 47,
  hashtags: ['#Animeverse', '#Anime'],
  language: 'Japanese',
  region: 'JP',
  publishedAgo: '1 week ago',
  views: '3.9M views',
  likes: 168000,
  comments: 5120,
  shares: 9800,
  saves: 44000,
  watchingNow: null,
  creator: {
    handle: 'animeverse',
    name: 'Animeverse Studio',
    kind: 'Studio',
    followers: '3.8M followers',
    avatar: IMAGES.anime,
    bio: 'Serialised animation from Tokyo.',
    location: 'Tokyo, Japan',
    languages: ['Japanese', 'English'],
    verified: true,
    to: '/creator/animeverse'
  },
  graph: [
  {
    id: 'g1',
    kind: 'title',
    label: 'Animeverse',
    sub: 'Series · 12 episodes',
    image: IMAGES.anime,
    to: '/title/animeverse'
  }],

  primaryCta: null,
  music: null,
  products: [],
  community: null,
  sports: null,
  provenance: null,
  rights: {
    watch: false,
    share: false,
    download: false,
    remix: false,
    aiReference: false,
    availableRegions: ['JP', 'KR', 'US'],
    restrictionNote:
    'This Short is licensed for Japan, South Korea and the United States. It is not currently licensed in Nigeria.',
    maturity: 'PG-13'
  },
  reason: {
    short: 'Related to what you were watching',
    detail: 'Surfaced because you opened a science-fiction Short. Playback is blocked by its licence, not by you.'
  },
  modes: [],
  spoiler: null,
  ownedByViewer: false
}];


export const commentsBySlug: Record<string, ShortComment[]> = {
  'the-last-train-scene-04': [
  {
    id: 'c1',
    author: 'Adaeze Films',
    handle: '@adaeze-films',
    avatar: IMAGES.creator,
    body: 'The rain was real. The train was not. Ask me anything about this setup.',
    likes: 8420,
    postedAgo: '2d',
    atSecond: null,
    spoiler: false,
    fromCreator: true,
    pinned: true,
    replies: []
  },
  {
    id: 'c2',
    author: 'Chinelo A.',
    handle: '@chinelo',
    avatar: IMAGES.afro,
    body: 'That look back at 00:18 says more than the whole second act.',
    likes: 2140,
    postedAgo: '1d',
    atSecond: 18,
    spoiler: false,
    fromCreator: false,
    pinned: false,
    replies: [
    {
      id: 'c2r1',
      author: 'Tobi',
      handle: '@tobi',
      avatar: IMAGES.lagos,
      body: 'Rewound it four times.',
      likes: 210,
      postedAgo: '22h',
      atSecond: null,
      spoiler: false,
      fromCreator: false,
      pinned: false,
      replies: []
    }]

  },
  {
    id: 'c3',
    author: 'Musa K.',
    handle: '@musak',
    avatar: IMAGES.kings,
    body: 'She already knew about the second railway by this point — watch her hands at 00:31.',
    likes: 1180,
    postedAgo: '1d',
    atSecond: 31,
    spoiler: true,
    fromCreator: false,
    pinned: false,
    replies: []
  },
  {
    id: 'c4',
    author: 'Ifeoma',
    handle: '@ifeoma',
    avatar: IMAGES.eagles,
    body: 'Where can I watch the full film?',
    likes: 604,
    postedAgo: '9h',
    atSecond: null,
    spoiler: false,
    fromCreator: false,
    pinned: false,
    replies: []
  }],

  'eagles-78th-minute': [
  {
    id: 'c1',
    author: 'Segun',
    handle: '@segun',
    avatar: IMAGES.eagles,
    body: 'Near post again. Keepers never learn.',
    likes: 12400,
    postedAgo: '48m',
    atSecond: 11,
    spoiler: false,
    fromCreator: false,
    pinned: false,
    replies: []
  },
  {
    id: 'c2',
    author: 'Ama',
    handle: '@ama',
    avatar: IMAGES.stadium,
    body: 'Ghana still have fifteen minutes. Do not celebrate yet.',
    likes: 3800,
    postedAgo: '31m',
    atSecond: null,
    spoiler: false,
    fromCreator: false,
    pinned: false,
    replies: []
  }]

};

export const relatedGroups: RelatedGroup[] = [
{
  id: 'african-scifi',
  label: 'African sci-fi',
  shorts: [
  { id: 'sh-5', slug: 'lagos-2042-first-look', poster: IMAGES.lagos, caption: 'Lagos 2042 — first look', views: '2.2M' },
  { id: 'sh-7', slug: 'railway-after-midnight', poster: SHORT_IMAGES.railwayYard, caption: 'Railway: After Midnight', views: '418K' },
  { id: 'sh-8', slug: 'animeverse-opening', poster: IMAGES.anime, caption: 'Animeverse — cold open', views: '3.9M' }]

},
{
  id: 'from-creator',
  label: 'From this creator',
  shorts: [
  { id: 'sh-4', slug: 'inside-the-signal', poster: SHORT_IMAGES.behindScenes, caption: 'How we shot “The Signal”', views: '742K' },
  { id: 'sh-1', slug: 'the-last-train-scene-04', poster: SHORT_IMAGES.amaraRain, caption: 'The Last Train — Scene 04', views: '3.4M' }]

},
{
  id: 'trending-now',
  label: 'Trending now',
  shorts: [
  { id: 'sh-3', slug: 'eagles-78th-minute', poster: SHORT_IMAGES.goal, caption: 'Nigeria 2 — 1 Ghana · 78’', views: '6.1M' },
  { id: 'sh-2', slug: 'night-line-video', poster: SHORT_IMAGES.afrobeats, caption: 'Night Line — rooftop', views: '1.8M' },
  { id: 'sh-6', slug: 'kings-court-throne-room', poster: IMAGES.kings, caption: 'The throne room', views: '1.1M' }]

}];


export const ownerAnalytics: ShortAnalytics = {
  views: '418K',
  uniqueViewers: '311K',
  completionRate: '38%',
  averageWatch: '16s of 41s',
  followersGained: '+1,204',
  retentionNote:
  'Viewers tend to leave around the 12-second mark, just before the lantern reveal. Moving that beat earlier would likely hold them.'
};

export const askSuggestions = [
'Who is this character?',
'What film is this from?',
'Why am I seeing this?',
'Find similar African sci-fi',
'Where is the soundtrack?'];


export const createOptions = [
{ id: 'response', label: 'Create a response', blurb: 'Reply to this Short with one of your own.' },
{ id: 'remix', label: 'Create a remix', blurb: 'Re-cut this material under its remix licence.' },
{ id: 'trailer', label: 'Create a fan trailer', blurb: 'Build a trailer concept in the AI Director.' },
{ id: 'inspired', label: 'Create something inspired by this', blurb: 'New work in the same mood — not a copy.' }];