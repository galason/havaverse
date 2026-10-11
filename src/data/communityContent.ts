import { IMAGES } from './catalog';
import { COMMUNITY_IMAGES } from './communityHub';
import type {
  AchievementRule,
  CharacterRecord,
  CommunityEventRecord,
  Discussion,
  FanCreationRecord,
  PartyMessage,
  PollRecord,
  QAQuestion,
  UniverseRecord,
  WatchPartyRecord } from
'../types/communityEntities';

export const seedDiscussions: Discussion[] = [
{
  id: 'd1',
  communitySlug: 'the-last-train',
  title: 'Who actually knew about the railway?',
  body: 'Freeze at 24:08. Amara reacts to the junction before the camera shows it to us — she is not learning, she is confirming. If that reading holds, the whole first act is a woman pretending to be surprised.',
  authorId: 'chidera',
  kind: 'Theory',
  spoilerLevel: 'safe',
  timeAgo: '5 h',
  likes: 1204,
  tags: ['Amara', 'Continuity', 'Act one'],
  replies: [
  {
    id: 'r1',
    authorId: 'ifeoma',
    body: 'The story bible puts the junction north of the village, which makes her glance east even stranger. Either a slip or she is looking at something else entirely.',
    likes: 318,
    timeAgo: '4 h',
    spoilerLevel: 'safe'
  },
  {
    id: 'r2',
    authorId: 'adaeze',
    body: 'I will only say this: nothing in that frame is accidental. The rest you get in Southbound.',
    likes: 2140,
    timeAgo: '3 h',
    spoilerLevel: 'safe',
    isCreator: true
  },
  {
    id: 'r3',
    authorId: 'emeka',
    body: 'What the theory misses is the sound design — the score drops out two beats before she turns. That is the tell, not the eyeline.',
    likes: 486,
    timeAgo: '2 h',
    spoilerLevel: 'safe'
  },
  {
    id: 'r4',
    authorId: 'tunde',
    body: 'Episode 7 settles this outright and I am amazed nobody has said so yet — the carriage reveal makes her foreknowledge explicit.',
    likes: 92,
    timeAgo: '1 h',
    spoilerLevel: 'full'
  }]

},
{
  id: 'd2',
  communitySlug: 'the-last-train',
  title: 'Episode 7 ending — nobody saw who was in the carriage',
  body: 'Screenshot thread. Frame 03:41:12 has a reflection in the window that I do not think we were meant to catch this early.',
  authorId: 'ifeoma',
  kind: 'Discussion',
  spoilerLevel: 'full',
  timeAgo: '2 h',
  likes: 3401,
  tags: ['Episode 7', 'Spoilers'],
  replies: [
  {
    id: 'r5',
    authorId: 'chidera',
    body: 'Enhanced it. It is a coat, not a face. Everyone calm down.',
    likes: 640,
    timeAgo: '1 h',
    spoilerLevel: 'full'
  }]

},
{
  id: 'd3',
  communitySlug: 'the-last-train',
  title: 'The railway map in scene 12 contradicts the story bible',
  body: 'Junction is drawn east of the village but every other reference puts it north. Deliberate or continuity slip?',
  authorId: 'ifeoma',
  kind: 'Debate',
  spoilerLevel: 'current',
  timeAgo: '9 h',
  likes: 1960,
  tags: ['Continuity', 'Worldbuilding'],
  replies: [
  {
    id: 'r6',
    authorId: 'emeka',
    body: 'Production design confirmed at the Enugu screening that the bible was revised after the shoot. So: both.',
    likes: 221,
    timeAgo: '7 h',
    spoilerLevel: 'current'
  }]

},
{
  id: 'd4',
  communitySlug: 'independent-filmmakers',
  title: 'Best Nigerian sci-fi film this year?',
  body: 'Lagos 2042 is the obvious answer but I want to hear the unobvious ones.',
  authorId: 'emeka',
  kind: 'Debate',
  spoilerLevel: 'safe',
  timeAgo: '6 h',
  likes: 982,
  tags: ['Sci-fi', 'Nigeria'],
  replies: [
  {
    id: 'r7',
    authorId: 'chidera',
    body: 'Anything from Studio Ikeja this year has been stronger than the budget suggests.',
    likes: 140,
    timeAgo: '5 h',
    spoilerLevel: 'safe'
  }]

},
{
  id: 'd5',
  communitySlug: 'super-eagles',
  title: 'Should the coach start him next match?',
  body: 'Two goals off the bench in three games. The case for starting him is obvious, the case against is the shape.',
  authorId: 'amarab',
  kind: 'Debate',
  spoilerLevel: 'safe',
  timeAgo: '3 h',
  likes: 2310,
  tags: ['AFCON', 'Selection'],
  replies: [
  {
    id: 'r8',
    authorId: 'tunde',
    body: 'Start him. The shape can move.',
    likes: 410,
    timeAgo: '2 h',
    spoilerLevel: 'safe'
  }]

},
{
  id: 'd6',
  communitySlug: 'afrobeats',
  title: 'That final verse changed the whole song',
  body: 'Three minutes of restraint and then the whole arrangement opens. Best closing verse of the year.',
  authorId: 'kemi',
  kind: 'Review',
  spoilerLevel: 'safe',
  timeAgo: '8 h',
  likes: 876,
  tags: ['Night Line', 'Production'],
  replies: []
},
{
  id: 'd7',
  communitySlug: 'the-last-train',
  title: 'Southbound is 71% storyboarded — ask me anything on Friday',
  body: 'I will be live at 8pm WAT answering questions about the sequel, the new characters, and what we changed after your notes on the first film.',
  authorId: 'adaeze',
  kind: 'Question',
  spoilerLevel: 'safe',
  timeAgo: '2 h',
  likes: 4820,
  tags: ['Southbound', 'Creator'],
  pinned: true,
  replies: []
}];


export const seedWatchParties: WatchPartyRecord[] = [
{
  id: 'wp1',
  title: 'The Last Train — Episode 7',
  description: 'Synced playback with the Railway fan club. Spoiler chat is on.',
  contentSlug: 'the-last-train',
  contentTitle: 'The Last Train',
  communitySlug: 'the-last-train',
  hostId: 'adaeze',
  when: 'Live now',
  startsInMinutes: 0,
  state: 'live',
  visibility: 'public',
  participants: 1204,
  image: IMAGES.heroLastTrain
},
{
  id: 'wp2',
  title: 'Super Eagles vs Ghana',
  description: 'AFCON qualifier with the African Football Community.',
  contentSlug: 'super-eagles',
  contentTitle: 'AFCON Qualifier',
  communitySlug: 'super-eagles',
  hostId: 'amarab',
  when: 'Tonight · 8:00 PM',
  startsInMinutes: 95,
  state: 'scheduled',
  visibility: 'public',
  participants: 206000,
  image: IMAGES.eagles
},
{
  id: 'wp3',
  title: 'Lagos 2042 Rewatch',
  description: 'Hosted by Studio Ikeja with director commentary in chat.',
  contentSlug: 'lagos-2042',
  contentTitle: 'Lagos 2042',
  communitySlug: 'lagos-2042',
  hostId: 'chidera',
  when: 'Tomorrow · 7:30 PM',
  startsInMinutes: 1320,
  state: 'scheduled',
  visibility: 'community',
  participants: 318,
  image: IMAGES.lagos
},
{
  id: 'wp4',
  title: 'Afrobeats New Releases',
  description: 'Listening party for this week’s releases.',
  contentSlug: 'afrobeats',
  contentTitle: 'New releases',
  communitySlug: 'afrobeats',
  hostId: 'kemi',
  when: 'Saturday · 9:00 PM',
  startsInMinutes: 4200,
  state: 'scheduled',
  visibility: 'public',
  participants: 1240,
  image: IMAGES.afro
},
{
  id: 'wp5',
  title: 'Director commentary track',
  description: 'Adaeze walks the first act frame by frame.',
  contentSlug: 'the-last-train',
  contentTitle: 'The Last Train',
  communitySlug: 'the-last-train',
  hostId: 'adaeze',
  when: 'Sunday · 7:00 PM',
  startsInMinutes: 6000,
  state: 'scheduled',
  visibility: 'community',
  participants: 196,
  image: IMAGES.lastTrain
}];


export const seedPartyMessages: PartyMessage[] = [
{ id: 'pm1', authorId: 'chidera', body: 'The score drops out here. Listen.', timeAgo: '0:12', kind: 'message' },
{ id: 'pm2', authorId: 'ifeoma', body: 'Called it — east junction again.', timeAgo: '0:40', kind: 'message' },
{ id: 'pm3', authorId: 'adaeze', body: 'Watch the window in about ten seconds.', timeAgo: '1:04', kind: 'message' },
{ id: 'pm4', authorId: 'tunde', body: 'No way. Rewinding.', timeAgo: '1:22', kind: 'message' },
{ id: 'pm5', authorId: 'emeka', body: 'This is the best sequence in the film and it is not close.', timeAgo: '1:51', kind: 'message' }];


export const seedEvents: CommunityEventRecord[] = [
{
  id: 'ev1',
  name: 'The Last Train Watch Party',
  kind: 'Watch party',
  communitySlug: 'the-last-train',
  hostId: 'adaeze',
  when: 'Today · 7:00 PM',
  description: 'Episode 7, synced, with the Railway fan club and the director in chat.',
  image: IMAGES.heroLastTrain,
  attendees: '1,204 going',
  state: 'live',
  relatedContentSlug: 'the-last-train',
  watchPartyId: 'wp1'
},
{
  id: 'ev2',
  name: 'Creator Q&A — Adaeze Films',
  kind: 'Creator Q&A',
  communitySlug: 'the-last-train',
  hostId: 'adaeze',
  when: 'Today · 8:30 PM',
  description:
  'Ask about The Last Train, the Railway universe and what changed in Southbound after your notes.',
  image: IMAGES.creator,
  attendees: '2,410 attending',
  state: 'upcoming',
  relatedContentSlug: 'the-last-train'
},
{
  id: 'ev3',
  name: 'Super Eagles Matchday',
  kind: 'Live sport',
  communitySlug: 'super-eagles',
  hostId: 'amarab',
  when: 'Today · 9:00 PM',
  description: 'AFCON qualifier against Ghana with live match centre and community predictions.',
  image: IMAGES.eagles,
  attendees: '206K going',
  state: 'upcoming',
  watchPartyId: 'wp2'
},
{
  id: 'ev4',
  name: 'Afrobeats Listening Party',
  kind: 'Listening party',
  communitySlug: 'afrobeats',
  hostId: 'kemi',
  when: 'Saturday · 9:00 PM',
  description: 'This week’s releases, played in order, argued about in real time.',
  image: IMAGES.afro,
  attendees: '1,240 going',
  state: 'upcoming',
  watchPartyId: 'wp4'
},
{
  id: 'ev5',
  name: 'Lagos 2042 Worldbuilding',
  kind: 'Community discussion',
  communitySlug: 'lagos-2042',
  hostId: 'chidera',
  when: 'Sunday · 7:30 PM',
  description: 'Open session on the canon timeline and the flood maps.',
  image: IMAGES.lagos,
  attendees: '642 going',
  state: 'upcoming'
},
{
  id: 'ev6',
  name: 'Southbound Trailer Premiere',
  kind: 'Premiere',
  communitySlug: 'the-last-train',
  hostId: 'adaeze',
  when: 'Friday · 8:00 PM',
  description: 'First look at the sequel, premiered to the community before public release.',
  image: IMAGES.lastTrain,
  attendees: '2,840 going',
  state: 'upcoming',
  relatedContentSlug: 'the-last-train'
}];


export const seedQuestions: QAQuestion[] = [
{
  id: 'q1',
  eventId: 'ev2',
  authorId: 'ifeoma',
  body: 'Why did Amara leave the station instead of boarding with Daniel?',
  votes: 842,
  answer:
  'Because the film is about the cost of staying, not the romance of leaving. She had already made her choice two scenes earlier.',
  pinned: true
},
{
  id: 'q2',
  eventId: 'ev2',
  authorId: 'chidera',
  body: 'What does the red lantern actually signify?',
  votes: 614
},
{
  id: 'q3',
  eventId: 'ev2',
  authorId: 'tunde',
  body: 'Is Daniel coming back in Southbound?',
  votes: 1180
},
{
  id: 'q4',
  eventId: 'ev2',
  authorId: 'emeka',
  body: 'How much of the score was written before the edit was locked?',
  votes: 209
}];


export const seedPolls: PollRecord[] = [
{
  id: 'pr1',
  question: 'Who scores first?',
  context: 'Super Eagles vs Ghana',
  communitySlug: 'super-eagles',
  kind: 'prediction',
  options: [
  { id: 'o1', label: 'Osimhen', share: 48 },
  { id: 'o2', label: 'Lookman', share: 31 },
  { id: 'o3', label: 'Someone else', share: 21 }],

  participants: 38204,
  closes: 'Closes at kick-off · 8:00 PM',
  state: 'open'
},
{
  id: 'pr2',
  question: 'Who betrayed Amara?',
  context: 'The Last Train',
  communitySlug: 'the-last-train',
  kind: 'prediction',
  options: [
  { id: 'o1', label: 'The station master', share: 44 },
  { id: 'o2', label: 'Daniel', share: 38 },
  { id: 'o3', label: 'Nobody — she chose', share: 18 }],

  participants: 12980,
  closes: 'Resolves when episode 8 airs',
  state: 'open'
},
{
  id: 'po1',
  question: 'Which ending would you have chosen?',
  context: 'The Last Train',
  communitySlug: 'the-last-train',
  kind: 'poll',
  options: [
  { id: 'o1', label: 'She boards the train', share: 56 },
  { id: 'o2', label: 'She walks back', share: 28 },
  { id: 'o3', label: 'Neither', share: 16 }],

  participants: 18402,
  closes: 'Closes in 3 days',
  state: 'open'
},
{
  id: 'po2',
  question: 'What should Adaeze Films make next?',
  context: 'Adaeze Films',
  communitySlug: 'the-last-train',
  kind: 'poll',
  multiple: true,
  options: [
  { id: 'o1', label: 'Science fiction', share: 41 },
  { id: 'o2', label: 'Historical drama', share: 34 },
  { id: 'o3', label: 'Thriller', share: 25 }],

  participants: 9118,
  closes: 'Closes in 6 days · pick up to two',
  state: 'open'
},
{
  id: 'po3',
  question: 'Who should headline the next HavaVerse Live event?',
  context: 'HavaVerse Live',
  communitySlug: 'afrobeats',
  kind: 'poll',
  options: [
  { id: 'o1', label: 'Kemi Adebayo', share: 47 },
  { id: 'o2', label: 'The Night Line band', share: 33 },
  { id: 'o3', label: 'A new act', share: 20 }],

  participants: 6402,
  closes: 'Closed',
  state: 'closed',
  resultNote: 'Kemi Adebayo won and headlines on 14 March.'
}];


export const seedFanCreations: FanCreationRecord[] = [
{
  id: 'fc1',
  kind: 'Fan art',
  title: 'Railway World Map',
  authorId: 'chidera',
  universeId: 'railway',
  communitySlug: 'the-last-train',
  views: '12.4K',
  likes: 2140,
  body: 'Hand-drawn reconstruction of every route named in the film, cross-checked against the story bible and the two maps visible on screen.',
  image: COMMUNITY_IMAGES.fanArt,
  icon: 'art'
},
{
  id: 'fc2',
  kind: 'Theory',
  title: 'Amara knew about the second railway',
  authorId: 'tunde',
  universeId: 'railway',
  communitySlug: 'the-last-train',
  views: '8.4K',
  likes: 1106,
  body: 'A frame-by-frame case that the first act is a performance, built from eyeline matches, the score drop at 24:06 and one line of dialogue everyone reads as throwaway.',
  icon: 'theory'
},
{
  id: 'fc3',
  kind: 'Fan edit',
  title: 'Lagos 2042 — neon cut',
  authorId: 'ifeoma',
  universeId: 'lagos',
  communitySlug: 'lagos-2042',
  views: '31.2K',
  likes: 4820,
  body: 'A regrade of the third act pushing the city into full neon. Not official colour — an experiment in what the film could have looked like.',
  image: IMAGES.lagos,
  icon: 'edit'
},
{
  id: 'fc4',
  kind: 'Analysis',
  title: 'Why the score drops out in scene 23',
  authorId: 'emeka',
  universeId: 'railway',
  communitySlug: 'the-last-train',
  views: '4.1K',
  likes: 612,
  body: 'On silence as a directorial choice, and why the two beats before Amara turns are the most important sound design in the film.',
  icon: 'analysis'
},
{
  id: 'fc5',
  kind: 'Podcast',
  title: 'Platform Nine — episode 12',
  authorId: 'chidera',
  universeId: 'railway',
  communitySlug: 'the-last-train',
  views: '6.8K',
  likes: 388,
  body: 'Weekly Railway universe podcast. This episode: the continuity debate, and an interview with a production designer.',
  icon: 'podcast'
},
{
  id: 'fc6',
  kind: 'Fan story',
  title: 'The Station Master’s Daughter',
  authorId: 'ifeoma',
  universeId: 'railway',
  communitySlug: 'the-last-train',
  views: '2.9K',
  likes: 244,
  body: 'A side story set two years before the film. Fan-written, not canon, published with the creator’s permission under the Railway fan licence.',
  icon: 'story'
},
{
  id: 'fc7',
  kind: 'Music',
  title: 'Night Line (community remix)',
  authorId: 'kemi',
  universeId: 'railway',
  communitySlug: 'afrobeats',
  views: '18.6K',
  likes: 2980,
  body: 'Remix built from the stems Kemi released to the community. Cleared for non-commercial use only.',
  image: IMAGES.afro,
  icon: 'music'
},
{
  id: 'fc8',
  kind: 'Review',
  title: 'The Last Train is about infrastructure, not love',
  authorId: 'emeka',
  universeId: 'railway',
  communitySlug: 'the-last-train',
  views: '9.7K',
  likes: 1420,
  body: 'A long read arguing the romance is the film’s misdirection and the railway itself is the protagonist.',
  icon: 'analysis'
}];


export const seedCharacters: CharacterRecord[] = [
{
  id: 'amara',
  name: 'Amara',
  universeId: 'railway',
  image: IMAGES.heroLastTrain,
  role: 'Protagonist · The Last Train',
  bio: 'A station clerk in a village the railway was never meant to reach. Amara knows the timetable better than the men who wrote it, which is the whole problem.',
  appearsIn: [
  { label: 'The Last Train', to: '/title/the-last-train' },
  { label: 'Railway Chronicles', to: '/universes/railway/stories' },
  { label: 'Railway: After Midnight', to: '/community/railway-after-midnight' }],

  relationships: [
  { name: 'Daniel', relation: 'Travelling companion', to: '/characters/daniel' },
  { name: 'The station master', relation: 'Employer, possibly worse', to: '/characters/amara' }],

  quotes: [
  '“The train does not stop here. That has never stopped me.”',
  '“You think I am waiting. I am counting.”']

},
{
  id: 'daniel',
  name: 'Daniel',
  universeId: 'railway',
  image: IMAGES.lastTrain,
  role: 'Supporting · The Last Train',
  bio: 'An engineer sent to survey a line that officially does not exist. Arrives certain, leaves otherwise.',
  appearsIn: [
  { label: 'The Last Train', to: '/title/the-last-train' },
  { label: 'Railway Chronicles', to: '/universes/railway/stories' }],

  relationships: [{ name: 'Amara', relation: 'Travelling companion', to: '/characters/amara' }],
  quotes: ['“Every map I was given is wrong in the same direction.”']
}];


export const seedUniverses: UniverseRecord[] = [
{
  id: 'railway',
  name: 'The Railway Universe',
  communitySlug: 'the-last-train',
  description:
  'One film became a serialised story, a soundtrack, a game and thousands of fan works — all held together by the same content graph.',
  image: IMAGES.heroLastTrain,
  members: '84.2K',
  nodes: [
  { id: 'u1', label: 'The Last Train', kind: 'Film', meta: 'Feature · Adaeze Films', to: '/title/the-last-train', official: true },
  { id: 'u2', label: 'Railway Chronicles', kind: 'Book', meta: 'Serialised · 14 chapters', to: '/universes/railway/stories', official: true },
  { id: 'u3', label: 'Amara', kind: 'Character', meta: 'Appears in 3 works', to: '/characters/amara', official: true },
  { id: 'u4', label: 'Daniel', kind: 'Character', meta: 'Appears in 2 works', to: '/characters/daniel', official: true },
  { id: 'u5', label: 'Original Soundtrack', kind: 'Music', meta: '11 tracks · licensed', to: '/universes/railway/media', official: true },
  { id: 'u6', label: 'Behind the Scenes', kind: 'Behind the scenes', meta: '6 featurettes', to: '/creator/adaezefilms', official: true },
  { id: 'u7', label: 'Railway: After Midnight', kind: 'Game', meta: 'Interactive · 9.6K players', to: '/community/railway-after-midnight', official: true },
  { id: 'u8', label: 'Fan theories & art', kind: 'Fan work', meta: '2,114 contributions', to: '/fan-creations', official: false }]

}];


export const achievementRules: AchievementRule[] = [
{ id: 'ac1', name: 'Founding member', detail: 'Join a community', icon: 'trophy', metric: 'daysActive', threshold: 1 },
{ id: 'ac2', name: 'First watch party', detail: 'Host a synced screening', icon: 'tv', metric: 'partiesHosted', threshold: 1 },
{ id: 'ac3', name: 'Regular', detail: 'Join 3 watch parties', icon: 'flame', metric: 'partiesJoined', threshold: 3 },
{ id: 'ac4', name: 'Contributor', detail: 'Start 2 discussions', icon: 'message', metric: 'discussions', threshold: 2 },
{ id: 'ac5', name: 'Theory master', detail: 'Post 10 replies', icon: 'brain', metric: 'replies', threshold: 10 },
{ id: 'ac6', name: 'Fan artist', detail: 'Publish a fan creation', icon: 'mic', metric: 'creations', threshold: 1 }];