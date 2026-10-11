import { IMAGES } from './catalog';
import type {
  ActivityCard,
  CommunityEvent,
  CommunityPerson,
  CommunityPoll,
  CommunitySummary,
  Conversation,
  CreatorPresence,
  FanCreation,
  WatchParty } from
'../types/community';

export const COMMUNITY_IMAGES = {
  hero: "/f48b87b6-cd57-4e01-8408-ddbd461e84bd.jpg",
  fanArt: "/10a071c8-9a12-44db-8ec9-9c29fcd76ad2.jpg",

  kemi: "/f0f174c4-d903-4131-8035-41297297c67c.jpg",
  critic: "/371f2b74-3ccd-4d6f-9fd2-7086fd36910a.jpg",

  analyst: "/f438bbe3-65fa-490e-a89b-d0960c0298aa.jpg"

};

export const liveFeature = {
  title: 'Super Eagles Matchday',
  subtitle: 'AFCON Qualifiers · Watch Party',
  watching: '5,911',
  image: IMAGES.eagles,
  to: '/events/ev3'
};

export const activityCards: ActivityCard[] = [
{
  id: 'a1',
  title: 'The Last Train',
  meta: '1,204 people discussing the latest episode',
  image: IMAGES.lastTrain,
  to: '/community/the-last-train?tab=Discuss'
},
{
  id: 'a2',
  title: 'Afrobeats Discussion',
  meta: '388 people active',
  image: IMAGES.afro,
  to: '/community/afrobeats'
},
{
  id: 'a3',
  title: 'Lagos 2042',
  meta: '642 people building theories',
  image: IMAGES.lagos,
  to: '/community/lagos-2042'
},
{
  id: 'a4',
  title: 'Creator Q&A',
  meta: 'Adaeze Films is answering fan questions',
  image: IMAGES.creator,
  to: '/events/ev2',
  live: true
}];


export const recommendedCommunities: CommunitySummary[] = [
{
  slug: 'the-last-train',
  name: 'The Last Train Fan Club',
  anchor: 'Film',
  anchorLabel: 'Film · Adaeze Films',
  categories: ['For you', 'Trending', 'Films', 'Stories & Worlds'],
  members: '84.2K',
  online: '1,204',
  image: IMAGES.heroLastTrain,
  description:
  'Theories, frame breakdowns, character discussions and watch parties from the Railway world.',
  liveNow: true
},
{
  slug: 'lagos-2042',
  name: 'Nigerian Sci-Fi & Afrofuturism',
  anchor: 'Story universe',
  anchorLabel: 'Story universe · 31.8K works',
  categories: ['For you', 'Films', 'Stories & Worlds'],
  members: '31.8K',
  online: '642',
  image: IMAGES.lagos,
  description:
  'Explore the future, our way. Afrofuturist stories, worldbuilding and the canon timeline.'
},
{
  slug: 'super-eagles',
  name: 'African Football Community',
  anchor: 'Sport',
  anchorLabel: 'Sport · AFCON qualifiers',
  categories: ['For you', 'Trending', 'Live now', 'Sports'],
  members: '412K',
  online: '8,201',
  image: IMAGES.eagles,
  description: 'Match discussions, transfers, tactical analysis and matchday watch parties.',
  liveNow: true
},
{
  slug: 'independent-filmmakers',
  name: 'Independent Filmmakers',
  anchor: 'Creator',
  anchorLabel: 'Creators · 18.7K members',
  categories: ['For you', 'Creators'],
  members: '18.7K',
  online: '426',
  image: IMAGES.kings,
  description: 'For African storytellers, dreamers and indie filmmakers building it themselves.'
},
{
  slug: 'afrobeats',
  name: 'Afrobeats Discussion',
  anchor: 'Music',
  anchorLabel: 'Music · 42 linked works',
  categories: ['Trending', 'Music'],
  members: '12.4K',
  online: '388',
  image: IMAGES.afro,
  description: 'New releases, live sets and the endless argument about who owns the summer.'
},
{
  slug: 'african-anime',
  name: 'African Anime Community',
  anchor: 'Series',
  anchorLabel: 'Anime · Kofi Animation',
  categories: ['Anime', 'Series'],
  members: '22.8K',
  online: '714',
  image: IMAGES.anime,
  description: 'Animeverse episode threads, sakuga appreciation and original character design.'
},
{
  slug: 'havaverse-originals',
  name: 'HavaVerse Originals',
  anchor: 'Film',
  anchorLabel: 'Films & Series · Official',
  categories: ['Films', 'Series', 'Trending'],
  members: '14.2K',
  online: '512',
  image: IMAGES.kings,
  description: 'First looks, release nights and behind-the-scenes from every HavaVerse Original.'
},
{
  slug: 'railway-after-midnight',
  name: 'Railway: After Midnight',
  anchor: 'Story universe',
  anchorLabel: 'Game · Railway universe',
  categories: ['Gaming', 'Stories & Worlds'],
  members: '9.6K',
  online: '284',
  image: IMAGES.heroLastTrain,
  description: 'The interactive side of the Railway universe — routes, endings and speedruns.'
}];


export const myCommunities = recommendedCommunities.slice(0, 4);

export const conversations: Conversation[] = [
{
  id: 'c1',
  quote: 'Who actually knew about the railway?',
  community: 'The Last Train',
  communitySlug: 'the-last-train',
  kind: 'Theory',
  replies: '8.4K',
  likes: '1.2K',
  image: IMAGES.lastTrain,
  spoilerLevel: 'safe'
},
{
  id: 'c2',
  quote: 'Best Nigerian sci-fi film this year?',
  community: 'African Cinema',
  communitySlug: 'lagos-2042',
  kind: 'Debate',
  replies: '5.7K',
  likes: '982',
  image: IMAGES.lagos,
  spoilerLevel: 'safe'
},
{
  id: 'c3',
  quote: 'Should the coach start him next match?',
  community: 'Super Eagles',
  communitySlug: 'super-eagles',
  kind: 'Discussion',
  replies: '12.4K',
  likes: '2.3K',
  image: IMAGES.eagles,
  spoilerLevel: 'safe'
},
{
  id: 'c4',
  quote: 'That final verse changed the whole song.',
  community: 'Afrobeats Discussion',
  communitySlug: 'afrobeats',
  kind: 'Review',
  replies: '3.1K',
  likes: '876',
  image: IMAGES.afro,
  spoilerLevel: 'safe'
},
{
  id: 'c5',
  quote: 'The junction in episode 6 contradicts the story bible.',
  community: 'The Last Train',
  communitySlug: 'the-last-train',
  kind: 'Theory',
  replies: '2.2K',
  likes: '611',
  image: IMAGES.heroLastTrain,
  spoilerLevel: 'current'
},
{
  id: 'c6',
  quote: 'Episode 7 ending — nobody saw who was in the carriage.',
  community: 'The Last Train',
  communitySlug: 'the-last-train',
  kind: 'Discussion',
  replies: '9.8K',
  likes: '3.4K',
  image: IMAGES.kings,
  spoilerLevel: 'full'
}];


export const watchParties: WatchParty[] = [
{
  id: 'w1',
  title: 'The Last Train',
  subtitle: 'Episode 7 · Adaeze Films',
  when: 'Happening now',
  image: IMAGES.lastTrain,
  attending: '1,204 watching together',
  state: 'live'
},
{
  id: 'w2',
  title: 'Super Eagles vs Ghana',
  subtitle: 'AFCON Qualifier',
  when: 'Tonight · 8:00 PM',
  image: IMAGES.eagles,
  attending: '206K community members',
  state: 'soon'
},
{
  id: 'w3',
  title: 'Lagos 2042 Rewatch',
  subtitle: 'Hosted by Studio Ikeja',
  when: 'Tomorrow · 7:30 PM',
  image: IMAGES.lagos,
  attending: '31.8K members',
  state: 'scheduled'
},
{
  id: 'w4',
  title: 'Afrobeats New Releases',
  subtitle: 'Listening party',
  when: 'Saturday · 9:00 PM',
  image: IMAGES.afro,
  attending: '12.4K members',
  state: 'scheduled'
}];


export const communityEvents: CommunityEvent[] = [
{
  id: 'e1',
  name: 'The Last Train Watch Party',
  community: 'The Last Train',
  time: 'Today · 7:00 PM',
  action: 'Join',
  image: IMAGES.lastTrain
},
{
  id: 'e2',
  name: 'Creator Q&A — Adaeze Films',
  community: 'Adaeze Films',
  time: 'Today · 8:30 PM',
  action: 'Remind me',
  image: IMAGES.creator
},
{
  id: 'e3',
  name: 'Super Eagles Matchday',
  community: 'Super Eagles',
  time: 'Today · 9:00 PM',
  action: 'Join',
  image: IMAGES.eagles
},
{
  id: 'e4',
  name: 'Afrobeats Listening Party',
  community: 'Afrobeats',
  time: 'Saturday · 9:00 PM',
  action: 'Join',
  image: IMAGES.afro
},
{
  id: 'e5',
  name: 'Lagos 2042 Worldbuilding',
  community: 'Lagos 2042',
  time: 'Sunday · 7:30 PM',
  action: 'Join',
  image: IMAGES.lagos
}];


export const creatorPresence: CreatorPresence[] = [
{
  id: 'cp1',
  name: 'Adaeze Films',
  avatar: IMAGES.creator,
  status: 'Live now',
  note: '“Ask me anything about The Last Train.”',
  action: 'Join Q&A',
  live: true,
  watching: '2.4K fans watching'
},
{
  id: 'cp2',
  name: 'Kemi Adebayo',
  avatar: COMMUNITY_IMAGES.kemi,
  status: 'New release discussion',
  note: 'Breaking down the production on “Night Line”.',
  action: 'Ask a question'
},
{
  id: 'cp3',
  name: 'HavaVerse Originals',
  avatar: IMAGES.kings,
  status: 'Behind the scenes',
  note: 'How the palace hall sequence was built in Studio.',
  action: 'Watch'
}];


export const fanCreations: FanCreation[] = [
{
  id: 'f1',
  kind: 'Fan art',
  title: 'Railway World Map',
  author: 'Chidera M.',
  views: '12.4K views',
  image: COMMUNITY_IMAGES.fanArt,
  icon: 'art'
},
{
  id: 'f2',
  kind: 'Theory',
  title: 'Amara knew about the second railway',
  author: 'Tunde O.',
  views: '8.4K reads',
  icon: 'theory'
},
{
  id: 'f3',
  kind: 'Fan edit',
  title: 'Lagos 2042 — neon cut',
  author: 'Zainab A.',
  views: '31.2K views',
  image: IMAGES.lagos,
  icon: 'edit'
},
{
  id: 'f4',
  kind: 'Analysis',
  title: 'Why the score drops out in scene 23',
  author: 'Ifeoma K.',
  views: '4.1K reads',
  icon: 'analysis'
},
{
  id: 'f5',
  kind: 'Fan podcast',
  title: 'Platform Nine — episode 12',
  author: 'The Junction',
  views: '6.8K listens',
  icon: 'podcast'
},
{
  id: 'f6',
  kind: 'Fan story',
  title: 'The Station Master’s Daughter',
  author: 'Bem T.',
  views: '2.9K reads',
  icon: 'story'
}];


export const communityPolls: CommunityPoll[] = [
{
  id: 'p1',
  question: 'Who scores first?',
  context: 'Super Eagles vs Ghana',
  kind: 'prediction',
  options: [
  { id: 'o1', label: 'Osimhen', share: 48 },
  { id: 'o2', label: 'Lookman', share: 31 },
  { id: 'o3', label: 'Someone else', share: 21 }],

  votes: '38,204 predictions'
},
{
  id: 'p2',
  question: 'Which ending would you have chosen?',
  context: 'The Last Train',
  kind: 'poll',
  options: [
  { id: 'o1', label: 'She boards the train', share: 56 },
  { id: 'o2', label: 'She walks back', share: 28 },
  { id: 'o3', label: 'Neither', share: 16 }],

  votes: '18,402 votes · closes in 3 days'
},
{
  id: 'p3',
  question: 'What should Adaeze Films make next?',
  context: 'Adaeze Films',
  kind: 'poll',
  options: [
  { id: 'o1', label: 'Science fiction', share: 41 },
  { id: 'o2', label: 'Historical drama', share: 34 },
  { id: 'o3', label: 'Thriller', share: 25 }],

  votes: '9,118 votes'
}];


export const peopleToFollow: CommunityPerson[] = [
{
  id: 'pp1',
  name: 'Emeka Nwosu',
  role: 'Film critic',
  avatar: COMMUNITY_IMAGES.critic,
  focus: 'Writes on African cinema'
},
{
  id: 'pp2',
  name: 'Amara Bello',
  role: 'Sports analyst',
  avatar: COMMUNITY_IMAGES.analyst,
  focus: 'Covers the Super Eagles'
},
{
  id: 'pp3',
  name: 'Kemi Adebayo',
  role: 'Music creator',
  avatar: COMMUNITY_IMAGES.kemi,
  focus: 'Afrobeats production'
},
{
  id: 'pp4',
  name: 'Adaeze Films',
  role: 'Filmmaker',
  avatar: IMAGES.creator,
  focus: 'The Railway universe'
},
{
  id: 'pp5',
  name: 'Chidera M.',
  role: 'Community host',
  avatar: IMAGES.afro,
  focus: 'Runs Lagos watch parties'
}];


export const becauseYouWatched: CommunitySummary[] = [
recommendedCommunities[1],
recommendedCommunities[5],
recommendedCommunities[3],
recommendedCommunities[7]];


export const havaAiCommunityPrompts = [
'Catch me up on the main theories',
'What are people saying about The Last Train?',
'Which watch parties are tonight?',
'Summarise the debate without spoilers',
'Find me a small film community'];