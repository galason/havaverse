import { IMAGES } from './catalog';
import type {
  ConversationPassport,
  ConversationWorld,
  Episode,
  Guest,
  Host,
  LiveConversation,
  PodCity,
  PodDrop,
  PodMembership,
  Show,
  Topic } from
'../types/podcast';

/* -------------------------------------------------------------------------- *
 * Seed content for HavaVerse Podcast. Read only through services/podcastApi.
 * -------------------------------------------------------------------------- */

const ART = {
  hero: "/d7de21bb-ce4e-4f6c-a60e-8ae960da9382.jpg",
  aisha: "/36ff45e5-11b3-4c76-83cf-6306725ebea6.jpg",
  david: "/5dc78e24-47f9-4e60-ad3f-b9eb9b3c901b.jpg",
  ai: "/e9aa7422-7cc1-407f-9617-d279f82dc2b5.jpg",
  stories: "/7d68e74a-d659-4387-acd5-95cfa37bba31.jpg"
};

export const hosts: Host[] = [
{
  id: 'aisha',
  name: 'Aisha Bello',
  handle: '@aishabello',
  avatar: ART.aisha,
  roles: 'Host · Journalist · Storyteller',
  city: 'Lagos',
  country: 'Nigeria',
  listeners: '1.8M',
  supporters: '94K',
  bio: 'Fifteen years reporting on how African cities actually work, now asking the same questions out loud. She records at night because that is when Lagos tells the truth.',
  communitySlug: 'afrobeats',
  verified: true
},
{
  id: 'david',
  name: 'David Okafor',
  handle: '@davidokafor',
  avatar: ART.david,
  roles: 'Host · Technology leader · Investor',
  city: 'Lagos',
  country: 'Nigeria',
  listeners: '943K',
  supporters: '38K',
  bio: 'Builds companies and then argues with people about why they failed. The show is the argument, continued in public.',
  verified: true
},
{
  id: 'zainab',
  name: 'Zainab Sule',
  handle: '@zainabsule',
  avatar: IMAGES.creator,
  roles: 'Host · Entrepreneur · Creator',
  city: 'Abuja',
  country: 'Nigeria',
  listeners: '621K',
  supporters: '22K',
  bio: 'Started recording in a spare room to explain what nobody explained to her. Now the show funds the room.',
  verified: false
},
{
  id: 'thandiwe',
  name: 'Thandiwe Mokoena',
  handle: '@thandiwe',
  avatar: IMAGES.kings,
  roles: 'Host · Historian',
  city: 'Johannesburg',
  country: 'South Africa',
  listeners: '412K',
  supporters: '14K',
  bio: 'Reads the archive so the argument can start from facts rather than from feeling.',
  verified: true
}];


export const topics: Topic[] = [
{ id: 'ai', label: 'Artificial intelligence', worldId: 'human-after-ai', followers: '128K' },
{ id: 'cities', label: 'Cities & infrastructure', worldId: 'africa-futures', followers: '84K' },
{ id: 'culture', label: 'Culture', worldId: 'african-stories', followers: '212K' },
{ id: 'creator-economy', label: 'Creator economy', worldId: 'creator-economy', followers: '96K' },
{ id: 'startups', label: 'Startups', worldId: 'business-without-borders', followers: '71K' },
{ id: 'history', label: 'History', worldId: 'african-stories', followers: '58K' },
{ id: 'identity', label: 'Identity', worldId: 'human-after-ai', followers: '44K' },
{ id: 'money', label: 'Money & markets', worldId: 'business-without-borders', followers: '63K' },
{ id: 'mind', label: 'Mind & body', worldId: 'wellness-of-life', followers: '39K' }];


export const cities: PodCity[] = [
{ id: 'lagos', city: 'Lagos', country: 'Nigeria', listeners: '18.4K', topics: ['Cities', 'AI', 'Culture'], x: 47, y: 62, intensity: 'high' },
{ id: 'accra', city: 'Accra', country: 'Ghana', listeners: '7.2K', topics: ['Culture', 'Startups'], x: 43, y: 61, intensity: 'medium' },
{ id: 'joburg', city: 'Johannesburg', country: 'South Africa', listeners: '6.1K', topics: ['History', 'Markets'], x: 54, y: 82, intensity: 'medium' },
{ id: 'nairobi', city: 'Nairobi', country: 'Kenya', listeners: '5.4K', topics: ['Startups', 'Climate'], x: 58, y: 66, intensity: 'medium' },
{ id: 'london', city: 'London', country: 'United Kingdom', listeners: '9.8K', topics: ['Diaspora', 'Media'], x: 46, y: 33, intensity: 'high' },
{ id: 'newyork', city: 'New York', country: 'United States', listeners: '12.4K', topics: ['Business', 'Culture'], x: 25, y: 39, intensity: 'high' },
{ id: 'saopaulo', city: 'São Paulo', country: 'Brazil', listeners: '6.8K', topics: ['Culture', 'Music'], x: 31, y: 79, intensity: 'medium' },
{ id: 'dubai', city: 'Dubai', country: 'UAE', listeners: '2.2K', topics: ['Markets', 'Trade'], x: 66, y: 50, intensity: 'low' },
{ id: 'tokyo', city: 'Tokyo', country: 'Japan', listeners: '5.6K', topics: ['Technology', 'Design'], x: 82, y: 42, intensity: 'low' }];


export const shows: Show[] = [
{
  id: 'future-is-african',
  title: 'The Future Is African',
  hostId: 'aisha',
  artwork: ART.hero,
  cover: ART.hero,
  tagline: 'Stories, ideas and conversations shaping Africa and the world.',
  about:
  'A weekly conversation recorded in Lagos about the decisions that will decide the next decade — who builds the cities, who owns the data, and who gets to tell the story afterwards.',
  topicIds: ['cities', 'ai', 'culture'],
  cityId: 'lagos',
  listeners: '1.8M',
  communityMembers: '94K',
  communitySlug: 'afrobeats',
  seasons: 3,
  episodeCount: 68,
  origin: 'Original HavaVerse Podcast'
},
{
  id: 'african-business',
  title: 'The Future of African Business',
  hostId: 'david',
  artwork: IMAGES.lagos,
  cover: IMAGES.lagos,
  tagline: 'Founders, capital and the arguments nobody has in public.',
  about:
  'Long-form interviews with the people building companies on the continent, including the parts of the story that usually get edited out.',
  topicIds: ['startups', 'money'],
  cityId: 'lagos',
  listeners: '943K',
  communityMembers: '31K',
  communitySlug: 'afrobeats',
  seasons: 4,
  episodeCount: 112,
  origin: 'Independent'
},
{
  id: 'creator-hours',
  title: 'Creator Hours',
  hostId: 'zainab',
  artwork: IMAGES.creator,
  cover: IMAGES.creator,
  tagline: 'What making things actually costs.',
  about:
  'A practical show about audiences, money and burnout, made by someone still in the middle of it.',
  topicIds: ['creator-economy', 'money'],
  cityId: 'lagos',
  listeners: '621K',
  communityMembers: '18K',
  communitySlug: 'afrobeats',
  seasons: 2,
  episodeCount: 44,
  origin: 'Independent'
},
{
  id: 'the-archive',
  title: 'The Archive Speaks',
  hostId: 'thandiwe',
  artwork: ART.stories,
  cover: ART.stories,
  tagline: 'History, read closely.',
  about:
  'Each episode takes a single document, photograph or recording and follows it until it explains something about now.',
  topicIds: ['history', 'culture'],
  cityId: 'joburg',
  listeners: '412K',
  communityMembers: '12K',
  communitySlug: 'afrobeats',
  seasons: 5,
  episodeCount: 96,
  origin: 'Partner'
}];


export const guests: Guest[] = [
{ id: 'g-david', name: 'David Okafor', role: 'Technology leader · Investor', avatar: ART.david, to: '/podcast/creator/david' },
{ id: 'g-adaeze', name: 'Adaeze Films', role: 'Director · The Last Train', avatar: IMAGES.creator, to: '/creator/@adaezefilms' },
{ id: 'g-zainab', name: 'Zainab Sule', role: 'Entrepreneur · Creator', avatar: IMAGES.creator, to: '/podcast/creator/zainab' },
{ id: 'g-thandiwe', name: 'Thandiwe Mokoena', role: 'Historian', avatar: IMAGES.kings, to: '/podcast/creator/thandiwe' }];


export const episodes: Episode[] = [
{
  id: 'ep1',
  showId: 'future-is-african',
  title: 'Why Africa’s cities will define the next decade',
  season: 3,
  number: 8,
  durationSeconds: 3134,
  artwork: ART.hero,
  summary:
  'Lagos adds a city the size of Bristol every year. Aisha and David argue about whether that is a crisis, an opportunity, or simply the thing everyone else will have to learn from.',
  publishedAt: 'Published 3 days ago',
  topicIds: ['cities', 'ai', 'culture'],
  guestIds: ['g-david'],
  chapters: [
  { startSeconds: 0, label: 'Opening' },
  { startSeconds: 402, label: 'The Lagos transformation' },
  { startSeconds: 1040, label: 'Building a digital economy' },
  { startSeconds: 1875, label: 'What a future city owes its people' },
  { startSeconds: 2648, label: 'Final thoughts' }],

  moments: [
  {
    id: 'mo1',
    atSeconds: 763,
    speaker: 'David Okafor',
    text: 'Africa isn’t waiting for the future. It is building it, mostly without permission.',
    reactions: 2840,
    comments: 421
  },
  {
    id: 'mo2',
    atSeconds: 1502,
    speaker: 'Aisha Bello',
    text: 'A city is not its skyline. It is whether a nurse can get across it at six in the morning.',
    reactions: 1904,
    comments: 288
  },
  {
    id: 'mo3',
    atSeconds: 2201,
    speaker: 'David Okafor',
    text: 'If the model is trained somewhere else, the city gets optimised for somewhere else.',
    reactions: 1322,
    comments: 196
  }],

  transcript: [
  { atSeconds: 0, speaker: 'Aisha Bello', text: 'It is just past midnight in Lagos, which is the only honest time to have this conversation.' },
  { atSeconds: 34, speaker: 'David Okafor', text: 'The traffic agrees with you.' },
  { atSeconds: 402, speaker: 'Aisha Bello', text: 'Let us start with the number everyone quotes and nobody interrogates — the growth figure.' },
  { atSeconds: 511, speaker: 'David Okafor', text: 'Right, and the number is real. What is unclear is who it is growth for.' },
  { atSeconds: 763, speaker: 'David Okafor', text: 'Africa isn’t waiting for the future. It is building it, mostly without permission.' },
  { atSeconds: 1040, speaker: 'Aisha Bello', text: 'So take the digital economy piece. Where does the value actually settle?' },
  { atSeconds: 1211, speaker: 'David Okafor', text: 'Downstream of whoever owns the rails. That is the whole argument, in one sentence.' },
  { atSeconds: 1502, speaker: 'Aisha Bello', text: 'A city is not its skyline. It is whether a nurse can get across it at six in the morning.' },
  { atSeconds: 1875, speaker: 'David Okafor', text: 'And that is a design question before it is a technology question.' },
  { atSeconds: 2201, speaker: 'David Okafor', text: 'If the model is trained somewhere else, the city gets optimised for somewhere else.' },
  { atSeconds: 2648, speaker: 'Aisha Bello', text: 'Last thing — what would change your mind about any of this?' },
  { atSeconds: 2890, speaker: 'David Okafor', text: 'Evidence that the people already here are the ones being built for. Show me that and I will happily be wrong.' }],

  graph: [
  { kind: 'Creator', label: 'Aisha Bello', detail: 'Lagos', to: '/podcast/creator/aisha' },
  { kind: 'Show', label: 'The Future Is African', detail: 'Season 3', to: '/podcast/show/future-is-african' },
  { kind: 'Episode', label: 'Africa’s cities', detail: 'S03 E08', to: '/podcast/episode/ep1' },
  { kind: 'Topic', label: 'Artificial intelligence', detail: '128K following', to: '/podcast/topic/ai' },
  { kind: 'Guest', label: 'David Okafor', detail: 'Investor', to: '/podcast/creator/david' },
  { kind: 'Community', label: 'Future Builders', detail: '42.8K members', to: '/community/afrobeats' },
  { kind: 'Live', label: 'Live recording', detail: 'Lagos · 14 Oct', to: '/podcast/live/pl1' },
  { kind: 'Collection', label: 'The lost episodes', detail: '87 remaining', to: '/podcast/drop/pd1' }],

  relatedStory: { label: 'Lagos 2042', to: '/title/lagos-2042' },
  liveEventId: 'pl1',
  collectionId: 'pd1'
},
{
  id: 'ep2',
  showId: 'future-is-african',
  title: 'AI and Lagos: building the next digital economy',
  season: 3,
  number: 7,
  durationSeconds: 2880,
  artwork: IMAGES.lagos,
  summary:
  'What happens when the tools are trained elsewhere but deployed here — and what it would take to change that.',
  publishedAt: 'Published 10 days ago',
  topicIds: ['ai', 'startups'],
  guestIds: ['g-zainab'],
  chapters: [
  { startSeconds: 0, label: 'Opening' },
  { startSeconds: 520, label: 'Where the data lives' },
  { startSeconds: 1480, label: 'Who gets paid' },
  { startSeconds: 2300, label: 'Final thoughts' }],

  moments: [
  {
    id: 'mo4',
    atSeconds: 1610,
    speaker: 'Zainab Sule',
    text: 'Everyone wants the creativity. Very few want to pay for the electricity it runs on.',
    reactions: 1108,
    comments: 173
  }],

  transcript: [
  { atSeconds: 0, speaker: 'Aisha Bello', text: 'We keep saying digital economy as though it is one thing.' },
  { atSeconds: 520, speaker: 'Zainab Sule', text: 'It is at least three, and they do not agree with each other.' },
  { atSeconds: 1610, speaker: 'Zainab Sule', text: 'Everyone wants the creativity. Very few want to pay for the electricity it runs on.' },
  { atSeconds: 2300, speaker: 'Aisha Bello', text: 'So what do we do on Monday?' }],

  graph: [
  { kind: 'Creator', label: 'Aisha Bello', detail: 'Lagos', to: '/podcast/creator/aisha' },
  { kind: 'Show', label: 'The Future Is African', detail: 'Season 3', to: '/podcast/show/future-is-african' },
  { kind: 'Episode', label: 'AI and Lagos', detail: 'S03 E07', to: '/podcast/episode/ep2' },
  { kind: 'Topic', label: 'Artificial intelligence', detail: '128K following', to: '/podcast/topic/ai' },
  { kind: 'Community', label: 'Future Builders', detail: '42.8K members', to: '/community/afrobeats' }]

},
{
  id: 'ep3',
  showId: 'african-business',
  title: 'Africa’s tech revolution, honestly assessed',
  season: 5,
  number: 3,
  durationSeconds: 2640,
  artwork: IMAGES.kings,
  summary:
  'A decade of funding announcements, and a much shorter list of companies still standing. David walks through both.',
  publishedAt: 'Published 5 days ago',
  topicIds: ['startups', 'money'],
  guestIds: [],
  chapters: [
  { startSeconds: 0, label: 'Opening' },
  { startSeconds: 640, label: 'The funding decade' },
  { startSeconds: 1720, label: 'What survived' }],

  moments: [
  {
    id: 'mo5',
    atSeconds: 980,
    speaker: 'David Okafor',
    text: 'We measured announcements. We should have been measuring payroll.',
    reactions: 2216,
    comments: 340
  }],

  transcript: [
  { atSeconds: 0, speaker: 'David Okafor', text: 'I want to do something uncomfortable and go back through the numbers.' },
  { atSeconds: 640, speaker: 'David Okafor', text: 'Because the decade reads differently if you start from the end.' },
  { atSeconds: 980, speaker: 'David Okafor', text: 'We measured announcements. We should have been measuring payroll.' },
  { atSeconds: 1720, speaker: 'David Okafor', text: 'Here is the shorter, more interesting list.' }],

  graph: [
  { kind: 'Creator', label: 'David Okafor', detail: 'Lagos', to: '/podcast/creator/david' },
  { kind: 'Show', label: 'African Business', detail: 'Season 5', to: '/podcast/show/african-business' },
  { kind: 'Episode', label: 'Tech revolution', detail: 'S05 E03', to: '/podcast/episode/ep3' },
  { kind: 'Topic', label: 'Startups', detail: '71K following', to: '/podcast/topic/startups' }]

},
{
  id: 'ep4',
  showId: 'creator-hours',
  title: 'Diaspora and belonging',
  season: 2,
  number: 6,
  durationSeconds: 2640,
  artwork: IMAGES.afro,
  summary:
  'Three creators who left, three who stayed, and the money that follows each decision.',
  publishedAt: 'Published 2 weeks ago',
  topicIds: ['identity', 'creator-economy'],
  guestIds: ['g-adaeze'],
  chapters: [
  { startSeconds: 0, label: 'Opening' },
  { startSeconds: 720, label: 'Leaving' },
  { startSeconds: 1680, label: 'Staying' }],

  moments: [
  {
    id: 'mo6',
    atSeconds: 1320,
    speaker: 'Adaeze Films',
    text: 'I did not move for the audience. I moved for the equipment, and the audience came anyway.',
    reactions: 940,
    comments: 128
  }],

  transcript: [
  { atSeconds: 0, speaker: 'Zainab Sule', text: 'Nobody makes this decision once. You make it every year.' },
  { atSeconds: 720, speaker: 'Adaeze Films', text: 'The first time I left it was supposed to be for six weeks.' },
  { atSeconds: 1320, speaker: 'Adaeze Films', text: 'I did not move for the audience. I moved for the equipment, and the audience came anyway.' },
  { atSeconds: 1680, speaker: 'Zainab Sule', text: 'And the people who stayed?' }],

  graph: [
  { kind: 'Creator', label: 'Zainab Sule', detail: 'Abuja', to: '/podcast/creator/zainab' },
  { kind: 'Show', label: 'Creator Hours', detail: 'Season 2', to: '/podcast/show/creator-hours' },
  { kind: 'Episode', label: 'Diaspora', detail: 'S02 E06', to: '/podcast/episode/ep4' },
  { kind: 'Guest', label: 'Adaeze Films', detail: 'Director', to: '/creator/@adaezefilms' },
  { kind: 'Community', label: 'Independent filmmakers', detail: '18.7K members', to: '/community/afrobeats' }],

  relatedStory: { label: 'The Last Train', to: '/title/the-last-train' }
},
{
  id: 'ep5',
  showId: 'the-archive',
  title: 'One photograph, 1961',
  season: 5,
  number: 12,
  durationSeconds: 2280,
  artwork: ART.stories,
  summary:
  'A single press photograph, and everything the caption left out.',
  publishedAt: 'Published 6 days ago',
  topicIds: ['history', 'culture'],
  guestIds: ['g-thandiwe'],
  chapters: [
  { startSeconds: 0, label: 'The photograph' },
  { startSeconds: 880, label: 'The caption' },
  { startSeconds: 1640, label: 'What happened next' }],

  moments: [
  {
    id: 'mo7',
    atSeconds: 1210,
    speaker: 'Thandiwe Mokoena',
    text: 'The archive is not neutral. Somebody chose what to keep, and that choice is the story.',
    reactions: 1640,
    comments: 214
  }],

  transcript: [
  { atSeconds: 0, speaker: 'Thandiwe Mokoena', text: 'There are eleven people in this photograph and the caption names two.' },
  { atSeconds: 880, speaker: 'Thandiwe Mokoena', text: 'So we start with the nine.' },
  { atSeconds: 1210, speaker: 'Thandiwe Mokoena', text: 'The archive is not neutral. Somebody chose what to keep, and that choice is the story.' },
  { atSeconds: 1640, speaker: 'Thandiwe Mokoena', text: 'By 1964, three of them had left the country.' }],

  graph: [
  { kind: 'Creator', label: 'Thandiwe Mokoena', detail: 'Johannesburg', to: '/podcast/creator/thandiwe' },
  { kind: 'Show', label: 'The Archive Speaks', detail: 'Season 5', to: '/podcast/show/the-archive' },
  { kind: 'Episode', label: 'One photograph', detail: 'S05 E12', to: '/podcast/episode/ep5' },
  { kind: 'Topic', label: 'History', detail: '58K following', to: '/podcast/topic/history' }]

}];


export const worlds: ConversationWorld[] = [
{
  id: 'africa-futures',
  name: 'Africa Futures',
  strapline: 'Technology · Culture · Business',
  blurb: 'The decisions being made now about how the continent will work in twenty years.',
  image: ART.hero,
  showCount: 342,
  episodeCount: 4821,
  communityCount: 86,
  liveCount: 19,
  showIds: ['future-is-african', 'african-business'],
  communityTo: '/community/afrobeats'
},
{
  id: 'creator-economy',
  name: 'The Creator Economy',
  strapline: 'Creators · Entrepreneurship · Media',
  blurb: 'How people who make things get paid, and what it costs them when they do not.',
  image: IMAGES.creator,
  showCount: 218,
  episodeCount: 3140,
  communityCount: 64,
  liveCount: 12,
  showIds: ['creator-hours'],
  communityTo: '/community/afrobeats'
},
{
  id: 'human-after-ai',
  name: 'Human After AI',
  strapline: 'AI · Society · Identity',
  blurb: 'Not whether the machines can, but what we become once they do.',
  image: ART.ai,
  showCount: 164,
  episodeCount: 2288,
  communityCount: 41,
  liveCount: 8,
  showIds: ['future-is-african'],
  communityTo: '/community/afrobeats'
},
{
  id: 'african-stories',
  name: 'African Stories',
  strapline: 'History · Culture · People',
  blurb: 'The archive, the oral record and the people who kept both alive.',
  image: ART.stories,
  showCount: 296,
  episodeCount: 5104,
  communityCount: 72,
  liveCount: 14,
  showIds: ['the-archive'],
  communityTo: '/community/afrobeats'
},
{
  id: 'business-without-borders',
  name: 'Business Without Borders',
  strapline: 'Startups · Leadership · Markets',
  blurb: 'Capital, companies and the arguments that only happen off the record.',
  image: IMAGES.lagos,
  showCount: 187,
  episodeCount: 2960,
  communityCount: 53,
  liveCount: 11,
  showIds: ['african-business'],
  communityTo: '/community/afrobeats'
},
{
  id: 'wellness-of-life',
  name: 'The Wellness of Life',
  strapline: 'Mind · Body · Relationships',
  blurb: 'Quieter conversations, held at the pace they actually need.',
  image: IMAGES.anime,
  showCount: 124,
  episodeCount: 1840,
  communityCount: 38,
  liveCount: 6,
  showIds: [],
  communityTo: '/community/afrobeats'
}];


export const liveConversations: LiveConversation[] = [
{
  id: 'pl1',
  title: 'The Future of Africa — live recording',
  showId: 'future-is-african',
  kind: 'Live recording',
  venue: 'Alliance Française',
  city: 'Lagos',
  date: 'Tue 14 Oct · 7:00 PM',
  image: ART.hero,
  price: 12000,
  attending: '640 attending',
  status: 'low'
},
{
  id: 'pl2',
  title: 'Ask me anything with David Okafor',
  showId: 'african-business',
  kind: 'Ask me anything',
  venue: 'HavaVerse Live room',
  city: 'Online',
  date: 'Tonight · 8:00 PM',
  image: IMAGES.lagos,
  price: 0,
  attending: '2.4K waiting',
  status: 'live'
},
{
  id: 'pl3',
  title: 'The next decade — audience roundtable',
  showId: 'african-business',
  kind: 'Roundtable',
  venue: 'Constitution Hill',
  city: 'Johannesburg',
  date: 'Sat 25 Oct · 4:00 PM',
  image: IMAGES.kings,
  price: 8000,
  attending: '1,240 attending',
  status: 'on-sale'
},
{
  id: 'pl4',
  title: 'Season 6 premiere — The Archive Speaks',
  showId: 'the-archive',
  kind: 'Premiere',
  venue: 'HavaVerse Live room',
  city: 'Online',
  date: 'Fri 31 Oct · 6:00 PM',
  image: ART.stories,
  price: 2500,
  attending: '3.1K attending',
  status: 'sold-out'
}];


export const drops: PodDrop[] = [
{
  id: 'pd1',
  name: 'The lost episodes',
  showId: 'future-is-african',
  blurb: 'Eleven conversations pulled before release, restored and released once.',
  image: ART.hero,
  kind: 'Archive collection',
  price: 14000,
  state: 'closing',
  remaining: 87,
  total: 500,
  includes: ['11 unreleased episodes', 'Full transcripts', 'Collector badge in the community']
},
{
  id: 'pd2',
  name: 'Founders’ conversations',
  showId: 'african-business',
  blurb: 'Twelve interviews recorded without an audience and never broadcast.',
  image: IMAGES.lagos,
  kind: 'Interview series',
  price: 18000,
  state: 'upcoming',
  releasesAt: 'Releases Friday · 8:00 PM WAT',
  includes: ['12 exclusive interviews', 'Annotated transcripts']
},
{
  id: 'pd3',
  name: 'Season zero',
  showId: 'creator-hours',
  blurb: 'The eight episodes recorded before anyone was listening.',
  image: IMAGES.creator,
  kind: 'Unreleased season',
  price: 7500,
  state: 'open',
  remaining: 212,
  total: 600,
  includes: ['8 recordings', 'Written postscript']
},
{
  id: 'pd4',
  name: 'Live from Lagos — collector edition',
  showId: 'future-is-african',
  blurb: 'The room recording, unmixed, as it actually sounded.',
  image: IMAGES.concert,
  kind: 'Collector edition',
  price: 9500,
  state: 'sold-out',
  remaining: 0,
  total: 300,
  includes: ['Room recording', 'Photographs from the night']
}];


export const podMemberships: PodMembership[] = [
{
  id: 'pm-aisha',
  hostId: 'aisha',
  name: 'The Future Is African — Inner Circle',
  pricePerMonth: 2500,
  members: '4.1K members',
  benefits: [
  'Episodes three days early, unedited',
  'The reading list behind each episode',
  'Member-only community room',
  'Monthly live call with Aisha',
  'Priority on live recording tickets']

},
{
  id: 'pm-david',
  hostId: 'david',
  name: 'Founders’ Table',
  pricePerMonth: 4000,
  members: '890 members',
  benefits: [
  'The full unedited interviews',
  'Quarterly private roundtable',
  'Deal memos and notes']

}];


export const conversationPassport: ConversationPassport = {
  topics: 27,
  cities: 14,
  creators: 182,
  communities: 31,
  liveConversations: 8,
  creatorsSupported: 12,
  savedIdeas: 42
};

export const listeningRooms = [
{ id: 'pr1', name: 'Listening rooms', detail: '12.4K online', to: '/community/afrobeats' },
{ id: 'pr2', name: 'Timestamp discussions', detail: '8.6K comments', to: '/discussions/d1' },
{ id: 'pr3', name: 'Creator Q&A', detail: '1.8K live now', to: '/events' },
{ id: 'pr4', name: 'Collaborative episode lists', detail: '12.6K lists', to: '/communities' }];


/** Creator-side view. Attributed activity, never a royalty rate. */
export const podEconomyLines = [
{ label: 'Listeners', amount: 0, display: '1.82M', share: 0, trend: '+9%' },
{ label: 'Support', amount: 420000, display: '₦420K', share: 22, trend: '+31%' },
{ label: 'Memberships', amount: 310000, display: '₦310K', share: 16, trend: '+12%' },
{ label: 'Collections', amount: 185000, display: '₦185K', share: 10, trend: '+48%' },
{ label: 'Live', amount: 760000, display: '₦760K', share: 39, trend: '+21%' },
{ label: 'Commerce', amount: 240000, display: '₦240K', share: 13, trend: '+5%' }];