import type {
  Availability,
  CommunityActivity,
  CreatorActivity,
  ExperienceItem,
  HomeModuleConfig,
  IntentChip,
  ListenItem,
  MarketItem,
  SportsItem,
  UniverseSummary } from
'../types/home';
import { IMAGES } from './catalog';

/**
 * HOMEPAGE MODULE MANIFEST
 *
 * In production this is a Control Room table, not a file. Every field here is
 * an operator decision: enable, reorder, target an audience, restrict to a
 * region, schedule a window, gate behind a flag, pick a recommendation
 * strategy. The frontend renders whatever this returns and hardcodes nothing.
 */
export const homeModules: HomeModuleConfig[] = [
{
  id: 'hero',
  enabled: true,
  position: 10,
  audience: [],
  regions: 'all'
},
{
  id: 'intent',
  heading: 'What do you feel like experiencing?',
  enabled: true,
  position: 20,
  audience: [],
  regions: 'all'
},
{
  id: 'continue',
  heading: 'Continue watching',
  enabled: true,
  position: 30,
  audience: ['returning'],
  regions: 'all',
  viewAllTo: '/browse/continue'
},
{
  id: 'next',
  heading: 'Your next experience',
  enabled: true,
  position: 40,
  audience: ['returning'],
  regions: 'all',
  strategy: 'graph-adjacency'
},
{
  id: 'live',
  heading: 'Live now',
  enabled: true,
  position: 50,
  audience: [],
  regions: 'all',
  viewAllTo: '/live'
},
{
  id: 'sports',
  heading: 'Live sports',
  subheading: 'Following the Super Eagles and the Premier League',
  enabled: true,
  position: 60,
  audience: ['sports'],
  regions: ['NG', 'GH', 'KE', 'ZA', 'GB'],
  viewAllTo: '/sports'
},
{
  id: 'foryou',
  heading: 'For you',
  enabled: true,
  position: 70,
  audience: [],
  regions: 'all',
  strategy: 'because-you-watched',
  viewAllTo: '/browse/film'
},
{
  id: 'creators',
  heading: 'From creators you follow',
  enabled: true,
  position: 80,
  audience: ['returning', 'creator'],
  regions: 'all',
  strategy: 'followed-creators',
  viewAllTo: '/creator/adaezefilms'
},
{
  id: 'communities',
  heading: 'Happening in your communities',
  enabled: true,
  position: 90,
  audience: ['community'],
  regions: 'all',
  strategy: 'community-signal',
  viewAllTo: '/communities'
},
{
  id: 'universes',
  heading: 'Explore universes',
  subheading: 'A title is a door, not a file',
  enabled: true,
  position: 100,
  audience: [],
  regions: 'all',
  viewAllTo: '/universes/railway'
},
{
  id: 'listen',
  heading: 'Your soundtrack',
  enabled: true,
  position: 110,
  audience: ['listener', 'returning'],
  regions: 'all',
  viewAllTo: '/music'
},
{
  id: 'ai-creations',
  heading: 'Created with HavaVerse AI',
  enabled: true,
  position: 120,
  audience: [],
  regions: 'all',
  strategy: 'editorial',
  viewAllTo: '/studio'
},
{
  id: 'market',
  heading: 'From your entertainment',
  subheading: 'Own a piece of the worlds you watch',
  enabled: true,
  position: 130,
  audience: ['returning'],
  regions: 'all',
  viewAllTo: '/market'
},
{
  id: 'experiences',
  heading: 'Experience HavaVerse',
  enabled: true,
  position: 140,
  audience: [],
  regions: ['NG', 'GH', 'KE', 'ZA'],
  viewAllTo: '/events'
},
{
  id: 'create',
  enabled: true,
  position: 150,
  audience: [],
  regions: 'all'
},
{
  id: 'welcome',
  heading: 'New to HavaVerse',
  enabled: true,
  position: 25,
  audience: ['anonymous', 'new'],
  regions: 'all'
}];


/**
 * Rights and availability, keyed by slug. The homepage never renders a play
 * control for something the viewer cannot actually open — it states the reason
 * and offers the action that IS available.
 */
export const availabilityBySlug: Record<string, Availability> = {
  'the-last-train': { state: 'available' },
  'lagos-2042': { state: 'available' },
  'the-kings-court': {
    state: 'ppv',
    label: 'Premium premiere',
    price: '₦1,500'
  },
  'afro-beats-rising': { state: 'available' },
  'rising-eagles': { state: 'available' },
  animeverse: {
    state: 'region-blocked',
    label: 'Not licensed in Nigeria'
  }
};

export const intentChips: IntentChip[] = [
{ id: 'watch', label: 'Watch something', to: '/browse/film' },
{ id: 'sport', label: 'Live sports', to: '/sports' },
{ id: 'listen', label: 'Listen', to: '/music' },
{ id: 'podcast', label: 'Podcasts', to: '/podcast' },
{ id: 'community', label: 'Join a community', to: '/communities' },
{ id: 'surprise', label: 'Discover something unexpected', to: '/shorts' }];


/* Live Now is no longer authored here: Home reads it from the Live service's
   schedule (services/liveApi.ts), which projects sports, music, podcast,
   community and Studio premieres. */

export const sportsItems: SportsItem[] = [
{
  id: 's1',
  competition: 'Premier League',
  home: 'Arsenal',
  away: 'Man City',
  homeScore: 1,
  awayScore: 1,
  clock: "62'",
  kickoff: 'Today',
  live: true,
  image: IMAGES.stadium,
  to: '/sports'
},
{
  id: 's2',
  competition: 'CAF Champions League',
  home: 'Enyimba',
  away: 'Al Ahly',
  kickoff: 'Today · 8:00 PM',
  live: false,
  image: IMAGES.stadium,
  to: '/sports'
},
{
  id: 's3',
  competition: 'AFCON Qualifier',
  home: 'Nigeria',
  away: 'Ghana',
  kickoff: 'Tomorrow · 10:00 PM',
  live: false,
  image: IMAGES.eagles,
  to: '/sports'
}];


export const creatorActivity: CreatorActivity[] = [
{
  id: 'ca1',
  creator: 'Adaeze Films',
  handle: '@adaezefilms',
  avatar: IMAGES.creator,
  label: 'New release',
  headline: 'The Railway Files',
  image: IMAGES.lastTrain,
  to: '/title/the-last-train',
  action: 'Watch'
},
{
  id: 'ca2',
  creator: 'Studio Ikeja',
  handle: '@studioikeja',
  avatar: IMAGES.lagos,
  label: 'Behind the scenes',
  headline: 'Building the flooded city',
  image: IMAGES.lagos,
  to: '/creator/studioikeja',
  action: 'Explore'
},
{
  id: 'ca3',
  creator: 'Nneka Sound',
  handle: '@nnekasound',
  avatar: IMAGES.afro,
  label: 'New music',
  headline: 'Night Line',
  image: IMAGES.afro,
  to: '/music/track/night-line',
  action: 'Listen'
},
{
  id: 'ca4',
  creator: 'Kofi Animation',
  handle: '@kofianim',
  avatar: IMAGES.anime,
  label: 'In development',
  headline: 'Animeverse season two',
  image: IMAGES.anime,
  to: '/creator/kofianim',
  action: 'Explore'
}];


export const communityActivity: CommunityActivity[] = [
{
  id: 'cm1',
  community: 'The Last Train',
  label: 'Trending discussion',
  headline: '“Who actually knew about the railway?”',
  meta: '8.4K replies · 4,182 fans discussing',
  image: IMAGES.lastTrain,
  to: '/discussions/d1',
  cta: 'Join discussion'
},
{
  id: 'cm2',
  community: 'Lagos 2042',
  label: 'Watch party',
  headline: 'Lagos 2042 rewatch',
  meta: 'Starts in 18 minutes · 642 going',
  image: IMAGES.lagos,
  to: '/watch-parties',
  cta: 'Join party'
},
{
  id: 'cm3',
  community: 'Super Eagles',
  label: 'Prediction open',
  headline: 'Who scores first against Ghana?',
  meta: '12.4K votes · no stake',
  image: IMAGES.eagles,
  to: '/predictions',
  cta: 'Make a prediction'
}];


export const universes: UniverseSummary[] = [
{
  id: 'railway',
  name: 'The Railway Universe',
  blurb: 'A film, a serialised story, two characters, a score and the fan work around them.',
  image: IMAGES.lastTrain,
  to: '/universes/railway',
  entries: ['The Last Train', 'Railway Chronicles', 'Amara', 'Original score']
},
{
  id: 'lagos',
  name: 'Lagos 2042',
  blurb: 'The flooded city, its couriers, its memory trade and the music made inside it.',
  image: IMAGES.lagos,
  to: '/universes/lagos',
  entries: ['Lagos 2042', 'Characters', 'Soundtrack', 'Short stories']
},
{
  id: 'anime',
  name: 'Animeverse',
  blurb: 'An Accra street artist, a brush that renders, and the thing drawing back.',
  image: IMAGES.anime,
  to: '/universes/anime',
  entries: ['Animeverse', 'Characters', 'Fan art']
}];


export const listenItems: ListenItem[] = [
{
  id: 'li1',
  name: 'The Last Train — Original Score',
  meta: 'Nneka Sound · 12 tracks',
  image: IMAGES.lastTrain,
  to: '/music/world/lagos-after-dark',
  medium: 'Music',
  reason: 'From a film you watched'
},
{
  id: 'li2',
  name: 'Lagos After Dark',
  meta: '48 artists · 126 tracks',
  image: IMAGES.concert,
  to: '/music/world/lagos-after-dark',
  medium: 'Music',
  reason: 'Your most-played scene'
},
{
  id: 'li3',
  name: 'The Future Is African',
  meta: 'Aisha Bello · S03 E08 · 52 min',
  image: IMAGES.creator,
  to: '/podcast',
  medium: 'Podcast',
  reason: 'You follow this show'
},
{
  id: 'li4',
  name: 'Why Africa’s cities will define the decade',
  meta: '52 min · Culture · Technology',
  image: IMAGES.lagos,
  to: '/podcast',
  medium: 'Podcast',
  reason: 'Related to Lagos 2042'
}];


export const marketItems: MarketItem[] = [
{
  id: 'mk1',
  name: 'The Last Train — official poster',
  price: '₦12,000',
  image: IMAGES.lastTrain,
  to: '/market',
  from: 'The Railway Universe'
},
{
  id: 'mk2',
  name: 'Amara character tee',
  price: '₦18,500',
  image: IMAGES.creator,
  to: '/market',
  from: 'Amara · The Last Train'
},
{
  id: 'mk3',
  name: 'Original score — collector edition',
  price: '₦4,000',
  image: IMAGES.afro,
  to: '/market',
  from: 'Nneka Sound'
},
{
  id: 'mk4',
  name: 'Lagos premiere — two seats',
  price: '₦25,000',
  image: IMAGES.concert,
  to: '/market',
  from: 'HavaVerse Live'
}];


export const experiences: ExperienceItem[] = [
{
  id: 'ex1',
  name: 'The Last Train — Lagos premiere',
  kind: 'Premiere',
  when: 'Fri, 2 Oct · 7:00 PM',
  where: 'Landmark Centre, Lagos',
  image: IMAGES.lastTrain,
  to: '/events'
},
{
  id: 'ex2',
  name: 'Afrobeats listening party',
  kind: 'Live music',
  when: 'Sat, 3 Oct · 9:00 PM',
  where: 'Virtual · HavaVerse Live',
  image: IMAGES.concert,
  to: '/events'
},
{
  id: 'ex3',
  name: 'Adaeze Films — creator Q&A',
  kind: 'Creator event',
  when: 'Tomorrow · 7:00 PM',
  where: 'The Last Train community',
  image: IMAGES.creator,
  to: '/events'
}];