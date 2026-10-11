import { IMAGES } from './catalog';
import { COMMUNITY_IMAGES } from './communityHub';
import type { Person } from '../types/communityEntities';

export const people: Person[] = [
{
  id: 'adaeze',
  name: 'Adaeze Films',
  handle: '@adaezefilms',
  role: 'Filmmaker',
  avatar: IMAGES.creator,
  bio: 'Building the Railway universe out of Enugu. Director of The Last Train.',
  focus: 'The Railway universe',
  isCreator: true,
  communities: ['the-last-train', 'independent-filmmakers', 'havaverse-originals'],
  followers: '184K',
  posts: 212,
  creations: 14
},
{
  id: 'kemi',
  name: 'Kemi Adebayo',
  handle: '@kemiadebayo',
  role: 'Music creator',
  avatar: COMMUNITY_IMAGES.kemi,
  bio: 'Producer and sound designer. Scored Night Line and three HavaVerse Originals.',
  focus: 'Afrobeats production',
  isCreator: true,
  communities: ['afrobeats', 'havaverse-originals'],
  followers: '96.4K',
  posts: 148,
  creations: 31
},
{
  id: 'emeka',
  name: 'Emeka Nwosu',
  handle: '@emekanwosu',
  role: 'Film critic',
  avatar: COMMUNITY_IMAGES.critic,
  bio: 'Twenty years writing on African cinema. Long reads, no star ratings.',
  focus: 'Writes on African cinema',
  isCreator: false,
  communities: ['the-last-train', 'independent-filmmakers', 'lagos-2042'],
  followers: '42.1K',
  posts: 604,
  creations: 8
},
{
  id: 'amarab',
  name: 'Amara Bello',
  handle: '@amarabello',
  role: 'Sports analyst',
  avatar: COMMUNITY_IMAGES.analyst,
  bio: 'Tactics, not takes. Covering the Super Eagles since 2016.',
  focus: 'Covers the Super Eagles',
  isCreator: false,
  communities: ['super-eagles'],
  followers: '128K',
  posts: 1840,
  creations: 2
},
{
  id: 'chidera',
  name: 'Chidera M.',
  handle: '@chidera',
  role: 'Community host',
  avatar: IMAGES.afro,
  bio: 'Runs the Lagos watch parties. Frame-by-frame obsessive.',
  focus: 'Runs Lagos watch parties',
  isCreator: false,
  communities: ['the-last-train', 'lagos-2042'],
  followers: '18.9K',
  posts: 412,
  creations: 19
},
{
  id: 'ifeoma',
  name: 'Ifeoma K.',
  handle: '@ifeoma',
  role: 'Theorist',
  avatar: IMAGES.lagos,
  bio: 'I read the story bible so you do not have to.',
  focus: 'Continuity and worldbuilding',
  isCreator: false,
  communities: ['the-last-train', 'railway-after-midnight'],
  followers: '9.2K',
  posts: 286,
  creations: 24
},
{
  id: 'tunde',
  name: 'Tunde O.',
  handle: '@tunde',
  role: 'Member',
  avatar: IMAGES.eagles,
  bio: 'Here for the matchdays and the arguments after.',
  focus: 'Football and film',
  isCreator: false,
  communities: ['super-eagles', 'the-last-train'],
  followers: '1.4K',
  posts: 96,
  creations: 3
},
{
  id: 'you',
  name: 'Tunde Bakare',
  handle: '@you',
  role: 'You',
  avatar: IMAGES.creator,
  bio: 'Watching, discussing and occasionally hosting.',
  focus: 'Sci-fi, football and Afrobeats',
  isCreator: false,
  communities: ['the-last-train', 'afrobeats', 'super-eagles'],
  followers: '212',
  posts: 34,
  creations: 1
}];


export const personById = (id: string) => people.find((p) => p.id === id) ?? people[0];