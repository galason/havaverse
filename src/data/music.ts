import { IMAGES } from './catalog';
import type {
  Artist,
  EconomyLine,
  LiveDate,
  Membership,
  MusicEdition,
  MusicWorld,
  Passport,
  Scene,
  SupportProject,
  Track } from
'../types/music';

const ART = {
  nightLine: "/ef874d40-cc66-4ceb-83bc-483a8b3367ed.jpg",
  lagos: "/106a721f-740b-4c00-9c28-e21b50d09ed8.jpg",
  joburg: "/504e9e09-3c8b-4a8a-aed3-b4e0711b8db0.jpg",
  accra: "/40fd4cd6-598d-400e-a2b5-6078a1366ce5.jpg",
  london: "/5d04a0cf-e2d9-4629-864c-3ccee7d89e30.jpg",
  nairobi: "/4e03fd9f-90f5-4cb8-bb5d-6bc28e5ac310.jpg",
  maya: "/1a3bc878-a896-4e78-a71a-bdb333023830.jpg",
  thabo: "/b83b6907-e151-4f99-8857-1f82777f01d3.jpg",
  kwesi: "/748b69b4-6640-455a-885e-41d90aacb327.jpg",
  wanjiru: "/cd9d685a-81c9-4ace-b532-4b5aa3dbc36a.jpg"
};

export const artists: Artist[] = [
{
  id: 'maya',
  name: 'Maya K.',
  handle: '@mayak',
  avatar: ART.maya,
  cover: ART.nightLine,
  city: 'Lagos',
  country: 'Nigeria',
  disciplines: 'Artist · Producer · Storyteller',
  tagline: 'The sound of the city after midnight.',
  bio: 'Maya K. writes about Lagos at the hour when it finally goes quiet. Night Line began as the closing cue for The Last Train and grew into a record of its own.',
  listeners: '2.8M',
  supporters: '184K',
  communitySlug: 'afrobeats',
  verified: true
},
{
  id: 'thabo',
  name: 'Thabo Zwane',
  handle: '@thabozwane',
  avatar: ART.thabo,
  cover: ART.joburg,
  city: 'Johannesburg',
  country: 'South Africa',
  disciplines: 'Producer · DJ',
  tagline: 'Amapiano built for the long night.',
  bio: 'Thabo has been cutting log-drum records out of a Yeoville flat since 2019. He releases everything with the stems attached so other producers can take it further.',
  listeners: '4.1M',
  supporters: '87K',
  communitySlug: 'afrobeats',
  verified: true
},
{
  id: 'kwesi',
  name: 'Kwesi Owura',
  handle: '@kwesiowura',
  avatar: ART.kwesi,
  cover: ART.accra,
  city: 'Accra',
  country: 'Ghana',
  disciplines: 'Singer · Alté',
  tagline: 'Highlife guitars, run through everything.',
  bio: 'Kwesi plays his grandfather\u2019s highlife lines over drum machines. The Accra Nights world grew out of the sessions he runs on Thursdays.',
  listeners: '1.9M',
  supporters: '62K',
  verified: true
},
{
  id: 'wanjiru',
  name: 'Wanjiru',
  handle: '@wanjiru',
  avatar: ART.wanjiru,
  cover: ART.nairobi,
  city: 'Nairobi',
  country: 'Kenya',
  disciplines: 'Singer · Writer',
  tagline: 'Alternative Nairobi, unhurried.',
  bio: 'Wanjiru records mostly at home, mostly at night, and releases in small batches. Her listeners tend to stay for years.',
  listeners: '940K',
  supporters: '41K',
  verified: false
}];


export const scenes: Scene[] = [
{ id: 'lagos', city: 'Lagos', country: 'Nigeria', listeners: '412K', genres: ['Afrobeats', 'Alté', 'Afrofusion', 'Highlife'], x: 47, y: 62, intensity: 'high' },
{ id: 'accra', city: 'Accra', country: 'Ghana', listeners: '186K', genres: ['Highlife', 'Alté', 'Drill'], x: 43, y: 61, intensity: 'medium' },
{ id: 'joburg', city: 'Johannesburg', country: 'South Africa', listeners: '296K', genres: ['Amapiano', 'House', 'Hip-hop'], x: 54, y: 82, intensity: 'high' },
{ id: 'nairobi', city: 'Nairobi', country: 'Kenya', listeners: '128K', genres: ['Afropop', 'Gengetone', 'Alternative'], x: 58, y: 66, intensity: 'medium' },
{ id: 'london', city: 'London', country: 'United Kingdom', listeners: '196K', genres: ['Afroswing', 'UK rap', 'Electronic'], x: 46, y: 33, intensity: 'high' },
{ id: 'newyork', city: 'New York', country: 'United States', listeners: '245K', genres: ['Hip-hop', 'R&B', 'Afro-fusion'], x: 25, y: 39, intensity: 'high' },
{ id: 'saopaulo', city: 'São Paulo', country: 'Brazil', listeners: '142K', genres: ['Baile funk', 'Pop', 'Hip-hop'], x: 31, y: 79, intensity: 'medium' },
{ id: 'tokyo', city: 'Tokyo', country: 'Japan', listeners: '167K', genres: ['City pop', 'Electronic', 'Jazz'], x: 82, y: 42, intensity: 'low' }];


export const tracks: Track[] = [
{
  id: 'tr1',
  title: 'Night Line',
  artistId: 'maya',
  artwork: ART.nightLine,
  durationSeconds: 236,
  sceneId: 'lagos',
  worldId: 'lagos-after-dark',
  releaseKind: 'Single',
  plays: '12.4M',
  language: 'English · Yoruba',
  story: { label: 'The Last Train', to: '/title/the-last-train' },
  supportsCollect: 'ed1',
  liveEventId: 'lv1',
  graph: [
  { kind: 'Artist', label: 'Maya K.', detail: 'Lagos', to: '/music/artist/maya' },
  { kind: 'Song', label: 'Night Line', detail: 'Single', to: '/music/track/tr1' },
  { kind: 'Story', label: 'The Last Train', detail: 'Closing cue', to: '/title/the-last-train' },
  { kind: 'IP', label: 'Railway universe', detail: 'Rights held', to: '/universes/railway' },
  { kind: 'Community', label: 'Afrobeats', detail: '12.4K fans', to: '/community/afrobeats' },
  { kind: 'Live', label: 'Lagos Night Live', detail: '26 Apr', to: '/music/live/lv1' },
  { kind: 'Collection', label: 'Limited edition', detail: '87 left', to: '/music/track/tr1' }]

},
{
  id: 'tr2',
  title: 'Southbound (Reprise)',
  artistId: 'maya',
  artwork: IMAGES.lastTrain,
  durationSeconds: 198,
  sceneId: 'lagos',
  worldId: 'lagos-after-dark',
  releaseKind: 'Score',
  plays: '3.1M',
  language: 'Instrumental',
  story: { label: 'The Last Train', to: '/title/the-last-train' },
  graph: [
  { kind: 'Artist', label: 'Maya K.', detail: 'Lagos', to: '/music/artist/maya' },
  { kind: 'Song', label: 'Southbound', detail: 'Score', to: '/music/track/tr2' },
  { kind: 'Story', label: 'The Last Train', detail: 'Sequel score', to: '/title/the-last-train' },
  { kind: 'Community', label: 'The Last Train', detail: '84.2K fans', to: '/community/the-last-train' }]

},
{
  id: 'tr3',
  title: 'Log Drum Sermon',
  artistId: 'thabo',
  artwork: ART.joburg,
  durationSeconds: 412,
  sceneId: 'joburg',
  worldId: 'johannesburg-pulse',
  releaseKind: 'Album track',
  plays: '8.7M',
  language: 'Zulu · English',
  supportsCollect: 'ed3',
  graph: [
  { kind: 'Artist', label: 'Thabo Zwane', detail: 'Johannesburg', to: '/music/artist/thabo' },
  { kind: 'Song', label: 'Log Drum Sermon', detail: 'Album track', to: '/music/track/tr3' },
  { kind: 'Collection', label: 'Stems pack', detail: 'Open', to: '/music/track/tr3' },
  { kind: 'Community', label: 'Afrobeats', detail: '12.4K fans', to: '/community/afrobeats' }]

},
{
  id: 'tr4',
  title: 'Osu After Rain',
  artistId: 'kwesi',
  artwork: ART.accra,
  durationSeconds: 254,
  sceneId: 'accra',
  worldId: 'accra-nights',
  releaseKind: 'Single',
  plays: '2.2M',
  language: 'Twi · English',
  liveEventId: 'lv3',
  graph: [
  { kind: 'Artist', label: 'Kwesi Owura', detail: 'Accra', to: '/music/artist/kwesi' },
  { kind: 'Song', label: 'Osu After Rain', detail: 'Single', to: '/music/track/tr4' },
  { kind: 'Live', label: 'Thursday session', detail: 'Weekly', to: '/music/live/lv3' }]

},
{
  id: 'tr5',
  title: 'Riverside, 4AM',
  artistId: 'wanjiru',
  artwork: ART.nairobi,
  durationSeconds: 289,
  sceneId: 'nairobi',
  worldId: 'nairobi-new-wave',
  releaseKind: 'Visual album',
  plays: '1.4M',
  language: 'Swahili · English',
  graph: [
  { kind: 'Artist', label: 'Wanjiru', detail: 'Nairobi', to: '/music/artist/wanjiru' },
  { kind: 'Song', label: 'Riverside, 4AM', detail: 'Visual album', to: '/music/track/tr5' },
  { kind: 'Collection', label: 'Visual edition', detail: 'Upcoming', to: '/music/track/tr5' }]

},
{
  id: 'tr6',
  title: 'Third Mainland',
  artistId: 'maya',
  artwork: IMAGES.lagos,
  durationSeconds: 221,
  sceneId: 'lagos',
  worldId: 'lagos-after-dark',
  releaseKind: 'Single',
  plays: '6.9M',
  language: 'English',
  graph: [
  { kind: 'Artist', label: 'Maya K.', detail: 'Lagos', to: '/music/artist/maya' },
  { kind: 'Song', label: 'Third Mainland', detail: 'Single', to: '/music/track/tr6' },
  { kind: 'Community', label: 'Afrobeats', detail: '12.4K fans', to: '/community/afrobeats' }]

},
{
  id: 'tr7',
  title: 'Yeoville Tape',
  artistId: 'thabo',
  artwork: IMAGES.concert,
  durationSeconds: 367,
  sceneId: 'joburg',
  worldId: 'johannesburg-pulse',
  releaseKind: 'Live session',
  plays: '2.8M',
  language: 'Instrumental',
  graph: [
  { kind: 'Artist', label: 'Thabo Zwane', detail: 'Johannesburg', to: '/music/artist/thabo' },
  { kind: 'Song', label: 'Yeoville Tape', detail: 'Live session', to: '/music/track/tr7' }]

},
{
  id: 'tr8',
  title: 'Peckham Highlife',
  artistId: 'kwesi',
  artwork: ART.london,
  durationSeconds: 243,
  sceneId: 'london',
  worldId: 'london-afrofuture',
  releaseKind: 'Single',
  plays: '3.6M',
  language: 'English · Twi',
  graph: [
  { kind: 'Artist', label: 'Kwesi Owura', detail: 'Accra · London', to: '/music/artist/kwesi' },
  { kind: 'Song', label: 'Peckham Highlife', detail: 'Single', to: '/music/track/tr8' }]

}];


export const worlds: MusicWorld[] = [
{
  id: 'lagos-after-dark',
  name: 'Lagos After Dark',
  city: 'Lagos',
  blurb: 'A sonic journey through Lagos after midnight — the hour the city finally exhales.',
  image: ART.lagos,
  artistCount: 12,
  trackCount: 126,
  communityCount: 6,
  liveCount: 2,
  trackIds: ['tr1', 'tr6', 'tr2'],
  communityTo: '/community/afrobeats'
},
{
  id: 'johannesburg-pulse',
  name: 'Johannesburg Pulse',
  city: 'Johannesburg',
  blurb: 'Log drums, rooftops and the long night. Amapiano as it is actually played at home.',
  image: ART.joburg,
  artistCount: 18,
  trackCount: 94,
  communityCount: 10,
  liveCount: 3,
  trackIds: ['tr3', 'tr7'],
  communityTo: '/community/afrobeats'
},
{
  id: 'accra-nights',
  name: 'Accra Nights',
  city: 'Accra',
  blurb: 'Highlife guitars carried into new rooms by a generation that never left them behind.',
  image: ART.accra,
  artistCount: 14,
  trackCount: 78,
  communityCount: 7,
  liveCount: 2,
  trackIds: ['tr4', 'tr8'],
  communityTo: '/community/afrobeats'
},
{
  id: 'london-afrofuture',
  name: 'London AfroFuture',
  city: 'London',
  blurb: 'The diaspora writing back — afroswing, UK rap and everything between the two.',
  image: ART.london,
  artistCount: 11,
  trackCount: 64,
  communityCount: 4,
  liveCount: 1,
  trackIds: ['tr8'],
  communityTo: '/community/afrobeats'
},
{
  id: 'nairobi-new-wave',
  name: 'Nairobi New Wave',
  city: 'Nairobi',
  blurb: 'Small batches, patient records and an audience that stays for years.',
  image: ART.nairobi,
  artistCount: 9,
  trackCount: 41,
  communityCount: 3,
  liveCount: 1,
  trackIds: ['tr5'],
  communityTo: '/community/afrobeats'
}];


export const memberships: Membership[] = [
{
  id: 'mb-maya',
  artistId: 'maya',
  name: 'Maya K. Inner Circle',
  pricePerMonth: 2000,
  members: '3.2K members',
  benefits: [
  'Releases a week early',
  'Private listening sessions',
  'Member-only community room',
  'Behind-the-scenes from the studio',
  'Digital collectibles each quarter',
  'Merchandise priority']

},
{
  id: 'mb-thabo',
  artistId: 'thabo',
  name: 'Thabo Stems Club',
  pricePerMonth: 1500,
  members: '1.1K members',
  benefits: [
  'Every release with stems attached',
  'Monthly production breakdown',
  'Clearance to release your own version',
  'Member-only sessions']

}];


export const supportProjects: SupportProject[] = [
{
  id: 'sp1',
  artistId: 'maya',
  title: 'Night Line — the visual album',
  blurb:
  'Nine tracks, nine films, shot across Lagos between midnight and dawn. Backers are credited and get the record before release.',
  image: ART.nightLine,
  raised: 2400000,
  goal: 4000000,
  backers: 1284,
  daysLeft: 22
},
{
  id: 'sp2',
  artistId: 'wanjiru',
  title: 'Riverside sessions — pressing',
  blurb:
  'A short vinyl run of the Riverside record, pressed in Nairobi rather than shipped in.',
  image: ART.nairobi,
  raised: 620000,
  goal: 1500000,
  backers: 341,
  daysLeft: 9
}];


export const editions: MusicEdition[] = [
{
  id: 'ed1',
  name: 'Night Line — digital collectible',
  artistId: 'maya',
  trackId: 'tr1',
  kind: 'Digital collectible',
  price: 9000,
  image: ART.nightLine,
  state: 'closing',
  remaining: 87,
  total: 500,
  closesIn: '02:14:32',
  includes: ['Lossless master', 'Alternate mix', 'Collector badge in the community']
},
{
  id: 'ed2',
  name: 'Behind the record — session film',
  artistId: 'maya',
  kind: 'Visual album',
  price: 3500,
  image: ART.lagos,
  state: 'open',
  remaining: 142,
  total: 400,
  includes: ['48-minute session film', 'Two unreleased takes']
},
{
  id: 'ed3',
  name: 'Log Drum Sermon — stems',
  artistId: 'thabo',
  trackId: 'tr3',
  kind: 'Stems',
  price: 6500,
  image: ART.joburg,
  state: 'open',
  includes: ['All 24 stems', 'Clearance to release your own version', 'Project file']
},
{
  id: 'ed4',
  name: 'Signed edition — Riverside',
  artistId: 'wanjiru',
  trackId: 'tr5',
  kind: 'Signed edition',
  price: 18000,
  image: ART.nairobi,
  state: 'sold-out',
  remaining: 0,
  total: 250,
  includes: ['Signed physical pressing', 'Handwritten lyric card']
}];


export const liveDates: LiveDate[] = [
{
  id: 'lv1',
  title: 'Lagos Night Live',
  artistId: 'maya',
  venue: 'Muri Okunola Park',
  city: 'Lagos',
  date: 'Sat 26 Apr · 9:00 PM',
  image: ART.lagos,
  price: 18000,
  status: 'low',
  kind: 'Concert'
},
{
  id: 'lv2',
  title: 'Rooftop Pulse',
  artistId: 'thabo',
  venue: 'Braamfontein',
  city: 'Johannesburg',
  date: 'Fri 8 May · 10:00 PM',
  image: ART.joburg,
  price: 14000,
  status: 'on-sale',
  kind: 'Festival'
},
{
  id: 'lv3',
  title: 'Thursday session',
  artistId: 'kwesi',
  venue: 'Osu, live from the yard',
  city: 'Accra',
  date: 'Every Thursday · 8:00 PM',
  image: ART.accra,
  price: 0,
  status: 'free',
  kind: 'Studio session'
},
{
  id: 'lv4',
  title: 'Riverside listening party',
  artistId: 'wanjiru',
  venue: 'HavaVerse Live room',
  city: 'Online',
  date: 'Sun 4 May · 7:30 PM',
  image: ART.nairobi,
  price: 2500,
  status: 'sold-out',
  kind: 'Listening party'
}];


export const passport: Passport = {
  countries: 38,
  artists: 412,
  communities: 27,
  liveExperiences: 14,
  creatorsSupported: 8,
  collectedWorks: 23,
  topCities: ['Lagos', 'London', 'Johannesburg', 'Accra', 'Nairobi']
};

/** Creator-side view. Attributed activity, not an opaque royalty rate. */
export const economyLines: EconomyLine[] = [
{ label: 'Streams', amount: 248600, share: 22, trend: '+12%' },
{ label: 'Direct support', amount: 420000, share: 18, trend: '+31%' },
{ label: 'Memberships', amount: 310000, share: 14, trend: '+8%' },
{ label: 'Collections', amount: 185000, share: 12, trend: '+52%' },
{ label: 'Live', amount: 760000, share: 22, trend: '+19%' },
{ label: 'Commerce', amount: 240000, share: 12, trend: '+6%' }];


export const listeningRooms = [
{ id: 'rm1', name: 'Lagos Vibes Listening Room', detail: 'Afrobeats · 2.3K listening', to: '/community/afrobeats' },
{ id: 'rm2', name: 'Amapiano All Night', detail: 'Johannesburg · 1.1K listening', to: '/community/afrobeats' },
{ id: 'rm3', name: 'The Last Train — score room', detail: 'Film music · 640 listening', to: '/community/the-last-train' }];