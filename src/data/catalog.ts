import type { ContentTitle, HappeningItem, LiveFixture } from '../types/content';

const POSTERS = {
  lastTrain: "/20261922-cb8b-4e06-b803-7e5d5ef6852b.jpg",

  lagos: "/259452e2-8341-4c2a-9ae3-3e27071c51c1.jpg",

  kings: "/1efb6540-23d6-46fb-a9d9-51e193a7c465.jpg",

  afro: "/cd125b5a-0c52-439b-824d-7c03f65265b0.jpg",

  eagles: "/cbe7295c-1bd3-45a3-9a40-ff1701f5eda5.jpg",

  anime: "/fb163dc4-1df9-4f42-b4a4-a380a584eccd.jpg"

};

export const IMAGES = {
  ...POSTERS,
  heroLastTrain: "/abc66313-6246-489d-8118-9dfbbb206d35.jpg",

  stadium: "/d125bb88-cd2f-46e3-9ab0-395545714b60.jpg",

  creator: "/a5a337e4-e160-4f17-9a1a-72ef9e489fb4.jpg",

  concert: "/9fa41f4e-d44d-4d50-b687-deab31a5db0f.jpg"

  // The logo is not a catalog image — it lives in data/brand.ts (BRAND.master).
};

export const titles: ContentTitle[] = [
{
  id: 't1',
  slug: 'the-last-train',
  name: 'The Last Train',
  kind: 'Film',
  badge: 'HavaVerse Original',
  genre: 'Thriller',
  runtime: '96 min',
  year: 2025,
  rating: 8.7,
  maturity: 'PG-16',
  poster: POSTERS.lastTrain,
  backdrop: "/abc66313-6246-489d-8118-9dfbbb206d35.jpg",

  logline:
  'When a young engineer discovers that the abandoned railway near her village is being used to move something at night, she uncovers a conspiracy that could change the fate of her community.',
  creator: 'Adaeze Films',
  creatorHandle: '@adaezefilms',
  languages: ['English', 'Igbo'],
  aiAssisted: true,
  progress: 42
},
{
  id: 't2',
  slug: 'lagos-2042',
  name: 'Lagos 2042',
  kind: 'Film',
  badge: 'HavaVerse Original',
  genre: 'Sci-Fi',
  runtime: '102 min',
  year: 2025,
  rating: 8.4,
  maturity: 'PG-16',
  poster: POSTERS.lagos,
  logline:
  'In a flooded, neon-drowned Lagos, a courier carrying stolen memories has nine hours to decide who gets to remember the city as it was.',
  creator: 'Studio Ikeja',
  creatorHandle: '@studioikeja',
  languages: ['English', 'Nigerian Pidgin'],
  aiAssisted: true
},
{
  id: 't3',
  slug: 'the-kings-court',
  name: "The King's Court",
  kind: 'Series',
  badge: 'Series',
  genre: 'Drama',
  runtime: 'S1 · 8 eps',
  year: 2024,
  rating: 8.2,
  maturity: 'PG-16',
  poster: POSTERS.kings,
  logline:
  'A succession crisis in a pre-colonial kingdom forces three heirs into an alliance none of them survives intact.',
  creator: 'Oyin Media',
  creatorHandle: '@oyinmedia',
  languages: ['Yoruba', 'English'],
  aiAssisted: false,
  progress: 18
},
{
  id: 't4',
  slug: 'afro-beats-rising',
  name: 'Afro Beats Rising',
  kind: 'Music',
  badge: 'Music Video',
  genre: 'Music',
  runtime: '4 min',
  year: 2026,
  rating: 8.9,
  maturity: 'PG',
  poster: POSTERS.afro,
  logline:
  'A one-take music video following a rising Afrobeats artist through a single night in Surulere.',
  creator: 'Nneka Sound',
  creatorHandle: '@nnekasound',
  languages: ['English'],
  aiAssisted: true
},
{
  id: 't5',
  slug: 'rising-eagles',
  name: 'Rising Eagles',
  kind: 'Sports',
  badge: 'Live',
  genre: 'Sports',
  runtime: '120 min',
  year: 2026,
  rating: 9.1,
  maturity: 'PG',
  poster: POSTERS.eagles,
  logline:
  'Full match coverage and analysis as a new generation chases continental qualification.',
  creator: 'HavaVerse Live',
  creatorHandle: '@havaverselive',
  languages: ['English'],
  aiAssisted: false
},
{
  id: 't6',
  slug: 'animeverse',
  name: 'Animeverse',
  kind: 'Anime',
  badge: 'Anime',
  genre: 'Action',
  runtime: '24 min',
  year: 2026,
  rating: 8.5,
  maturity: 'PG-13',
  poster: POSTERS.anime,
  logline:
  'A street artist in Accra inherits a brush that renders anything he draws real — and something has started drawing back.',
  creator: 'Kofi Animation',
  creatorHandle: '@kofianim',
  languages: ['English', 'Twi'],
  aiAssisted: true,
  progress: 66
}];


export const bySlug = (slug: string) => titles.find((t) => t.slug === slug);

export const trending = titles;
export const continueWatching = titles.filter((t) => typeof t.progress === 'number');
export const newOnHava = [titles[1], titles[5], titles[3], titles[0], titles[2], titles[4]];

export const fixtures: LiveFixture[] = [
{
  id: 'f1',
  competition: 'Premier League',
  homeTeam: 'Arsenal',
  awayTeam: 'Man City',
  homeScore: 1,
  awayScore: 1,
  clock: "62'",
  kickoff: 'Today',
  isLive: true,
  image: IMAGES.stadium
},
{
  id: 'f2',
  competition: 'CAF Champions League',
  homeTeam: 'Enyimba',
  awayTeam: 'Al Ahly',
  kickoff: 'Sat, 26 Apr · 8:00 PM',
  isLive: false,
  image: IMAGES.stadium
},
{
  id: 'f3',
  competition: 'NPFL',
  homeTeam: 'Rivers United',
  awayTeam: 'Rangers',
  kickoff: 'Sun, 27 Apr · 7:00 PM',
  isLive: false,
  image: IMAGES.stadium
},
{
  id: 'f4',
  competition: 'AFCON Qualifier',
  homeTeam: 'Nigeria',
  awayTeam: 'Ghana',
  kickoff: 'Sun, 27 Apr · 10:00 PM',
  isLive: false,
  image: IMAGES.eagles
}];


export const happenings: HappeningItem[] = [
{
  id: 'h1',
  label: 'Live now',
  labelTone: 'live',
  title: 'Arsenal vs Man City',
  meta: "Premier League · 62'",
  image: IMAGES.stadium
},
{
  id: 'h2',
  label: 'Trending',
  labelTone: 'trending',
  title: 'The Last Train',
  meta: '#1 in Nigeria',
  image: IMAGES.lastTrain
},
{
  id: 'h3',
  label: 'New release',
  labelTone: 'new',
  title: 'Lagos 2042',
  meta: 'Just added',
  image: IMAGES.lagos
},
{
  id: 'h4',
  label: 'Community',
  labelTone: 'community',
  title: 'Afrobeats Discussion',
  meta: '12.4K members',
  image: IMAGES.afro
}];


export const suggestedPrompts = [
'Find me Nigerian sci-fi',
'Something for the family tonight',
'Best films this week',
'Live football right now'];