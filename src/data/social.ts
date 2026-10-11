import { IMAGES } from './catalog';

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  badge?: string;
  timeAgo: string;
  body: string;
  likes: number;
  replies: number;
}

export const comments: Comment[] = [
{
  id: 'c1',
  author: 'Chidera M.',
  avatar: IMAGES.creator,
  badge: 'Top fan',
  timeAgo: '4 min',
  body: 'The sound design in the tunnel sequence is unreal. Headphones absolutely required for this one.',
  likes: 412,
  replies: 23
},
{
  id: 'c2',
  author: 'Adaeze Films',
  avatar: IMAGES.creator,
  badge: 'Creator',
  timeAgo: '18 min',
  body: 'Scene 23 was the hardest to get right — we re-cut it eleven times before it finally landed. Thank you all for watching.',
  likes: 1840,
  replies: 96
},
{
  id: 'c3',
  author: 'Tunde O.',
  avatar: IMAGES.creator,
  timeAgo: '1 h',
  body: 'Started this expecting a thriller and got a film about a village instead. No complaints.',
  likes: 208,
  replies: 7
},
{
  id: 'c4',
  author: 'Ifeoma K.',
  avatar: IMAGES.creator,
  badge: 'Member',
  timeAgo: '2 h',
  body: 'Watching with the Lagos watch party tonight. Anyone else in?',
  likes: 94,
  replies: 31
}];


export interface WatchPartyMessage {
  id: string;
  author: string;
  body: string;
  tone?: 'tip' | 'system';
}

export const partyMessages: WatchPartyMessage[] = [
{ id: 'p1', author: 'System', body: 'Kelechi joined the watch party', tone: 'system' },
{ id: 'p2', author: 'Kelechi', body: 'made it just in time 😮‍💨' },
{ id: 'p3', author: 'Zainab', body: 'that tracking shot though' },
{ id: 'p4', author: 'Bem', body: 'sent ₦2,000 to Adaeze Films', tone: 'tip' },
{ id: 'p5', author: 'Zainab', body: 'the score drops out here and it kills me every time' },
{ id: 'p6', author: 'Kelechi', body: 'ok who is in the carriage' },
{ id: 'p7', author: 'Amaka', body: 'called it from scene one' }];


export interface CreatorProfile {
  name: string;
  handle: string;
  avatar: string;
  banner: string;
  bio: string;
  location: string;
  followers: string;
  totalViews: string;
  published: number;
  languages: string[];
}

export const adaeze: CreatorProfile = {
  name: 'Adaeze Films',
  handle: '@adaezefilms',
  avatar: IMAGES.creator,
  banner: IMAGES.heroLastTrain,
  bio: 'Telling African stories, one frame at a time. Independent studio working in thriller, drama and speculative fiction out of Enugu and Lagos.',
  location: 'Enugu, Nigeria',
  followers: '1.2M',
  totalViews: '48.6M',
  published: 27,
  languages: ['English', 'Igbo', 'Nigerian Pidgin']
};

export interface MembershipTier {
  id: string;
  name: string;
  price: string;
  perks: string[];
  highlighted?: boolean;
}

export const tiers: MembershipTier[] = [
{
  id: 'm1',
  name: 'Supporter',
  price: '₦1,500 / month',
  perks: ['Members-only posts', 'Early trailers', 'Supporter badge in comments']
},
{
  id: 'm2',
  name: 'Producer',
  price: '₦6,000 / month',
  perks: [
  'Everything in Supporter',
  'Behind-the-scenes cuts and story bibles',
  'Monthly live Q&A',
  'Your name in the end credits'],

  highlighted: true
},
{
  id: 'm3',
  name: 'Executive',
  price: '₦25,000 / month',
  perks: [
  'Everything in Producer',
  'Read scripts in development',
  'Vote on the next project',
  'Signed physical poster each quarter']

}];