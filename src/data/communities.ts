import { IMAGES } from './catalog';

export interface Community {
  slug: string;
  name: string;
  kind: 'Fan club' | 'Community' | 'Watch club';
  linkedTo: string;
  members: string;
  online: string;
  banner: string;
  description: string;
}

export const communities: Community[] = [
{
  slug: 'the-last-train',
  name: 'The Last Train',
  kind: 'Fan club',
  linkedTo: 'Film · Adaeze Films',
  members: '84.2K',
  online: '1,204',
  banner: IMAGES.heroLastTrain,
  description:
  'Theories, frame breakdowns and watch parties for The Last Train and everything set in the Railway world.'
},
{
  slug: 'afrobeats',
  name: 'Afrobeats Discussion',
  kind: 'Community',
  linkedTo: 'Music · 42 linked works',
  members: '12.4K',
  online: '388',
  banner: IMAGES.afro,
  description: 'New releases, live sets and the endless argument about who owns the summer.'
},
{
  slug: 'lagos-2042',
  name: 'Lagos 2042',
  kind: 'Fan club',
  linkedTo: 'Film · Studio Ikeja',
  members: '31.8K',
  online: '642',
  banner: IMAGES.lagos,
  description: 'Afrofuturism, worldbuilding and the canon timeline of a drowned city.'
},
{
  slug: 'super-eagles',
  name: 'Super Eagles',
  kind: 'Watch club',
  linkedTo: 'Sports · AFCON qualifiers',
  members: '206K',
  online: '5,911',
  banner: IMAGES.eagles,
  description: 'Every matchday, every qualifier, every heartbreak. Watch parties on fixture nights.'
}];


export interface Thread {
  id: string;
  author: string;
  avatar: string;
  badge?: string;
  timeAgo: string;
  title: string;
  excerpt: string;
  replies: number;
  reactions: number;
  pinned?: boolean;
}

export const threads: Thread[] = [
{
  id: 'th1',
  author: 'Adaeze Films',
  avatar: IMAGES.creator,
  badge: 'Creator',
  timeAgo: '2 h',
  title: 'Southbound is 71% storyboarded — ask me anything on Friday',
  excerpt:
  'I will be live at 8pm WAT answering questions about the sequel, the new characters and what we changed after your notes on the first film.',
  replies: 312,
  reactions: 4820,
  pinned: true
},
{
  id: 'th2',
  author: 'Chidera M.',
  avatar: IMAGES.creator,
  badge: 'Top fan',
  timeAgo: '5 h',
  title: 'The railway map in scene 12 contradicts the story bible',
  excerpt:
  'Freeze frame at 24:08. The junction is drawn east of the village but every other reference puts it north. Deliberate or continuity slip?',
  replies: 148,
  reactions: 1960
},
{
  id: 'th3',
  author: 'Ifeoma K.',
  avatar: IMAGES.creator,
  badge: 'Member',
  timeAgo: '9 h',
  title: 'Lagos watch party tonight — 40 seats left',
  excerpt: 'Starting 9pm WAT, synced playback with voice chat. First timers very welcome.',
  replies: 67,
  reactions: 842
}];


export const poll = {
  question: 'What should Adaeze Films make next?',
  options: [
  { id: 'p1', label: 'The Last Train: Southbound', share: 52 },
  { id: 'p2', label: 'An Amara origin series', share: 31 },
  { id: 'p3', label: 'Something entirely new', share: 17 }],

  votes: '18,402 votes · closes in 3 days'
};

export const upcomingParties = [
{ id: 'w1', title: 'The Last Train — full rewatch', when: 'Tonight · 9:00 PM WAT', going: 412 },
{ id: 'w2', title: 'Southbound trailer premiere', when: 'Fri · 8:00 PM WAT', going: 2840 },
{ id: 'w3', title: 'Director commentary track', when: 'Sun · 7:00 PM WAT', going: 196 }];