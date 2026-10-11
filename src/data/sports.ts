import { IMAGES } from './catalog';

export interface MatchEvent {
  id: string;
  minute: string;
  type: 'goal' | 'card' | 'sub' | 'var';
  team: 'home' | 'away';
  text: string;
}

export const matchEvents: MatchEvent[] = [
{ id: 'e1', minute: "58'", type: 'goal', team: 'away', text: 'Haaland equalises from the edge of the area' },
{ id: 'e2', minute: "51'", type: 'card', team: 'home', text: 'Rice booked for a tactical foul' },
{ id: 'e3', minute: "46'", type: 'sub', team: 'away', text: 'Foden on for Grealish' },
{ id: 'e4', minute: "34'", type: 'var', team: 'home', text: 'VAR check complete — goal stands' },
{ id: 'e5', minute: "31'", type: 'goal', team: 'home', text: 'Saka finishes a counter from the right' }];


export interface MatchStat {
  label: string;
  home: number;
  away: number;
  unit?: string;
}

export const matchStats: MatchStat[] = [
{ label: 'Possession', home: 44, away: 56, unit: '%' },
{ label: 'Shots', home: 9, away: 13 },
{ label: 'On target', home: 4, away: 5 },
{ label: 'Corners', home: 3, away: 7 },
{ label: 'Fouls', home: 11, away: 8 },
{ label: 'Expected goals', home: 1.2, away: 1.6 }];


export interface StandingRow {
  position: number;
  club: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
  points: number;
  highlight?: boolean;
}

export const standings: StandingRow[] = [
{ position: 1, club: 'Man City', played: 32, won: 22, drawn: 6, lost: 4, goalDifference: 44, points: 72, highlight: true },
{ position: 2, club: 'Arsenal', played: 32, won: 21, drawn: 7, lost: 4, goalDifference: 41, points: 70, highlight: true },
{ position: 3, club: 'Liverpool', played: 32, won: 20, drawn: 8, lost: 4, goalDifference: 38, points: 68 },
{ position: 4, club: 'Aston Villa', played: 32, won: 17, drawn: 6, lost: 9, goalDifference: 14, points: 57 },
{ position: 5, club: 'Tottenham', played: 32, won: 16, drawn: 6, lost: 10, goalDifference: 12, points: 54 },
{ position: 6, club: 'Chelsea', played: 32, won: 14, drawn: 9, lost: 9, goalDifference: 8, points: 51 }];


export interface Highlight {
  id: string;
  title: string;
  meta: string;
  duration: string;
  image: string;
}

export const highlights: Highlight[] = [
{ id: 'hl1', title: 'Saka opens the scoring', meta: "Arsenal vs Man City · 31'", duration: '1:12', image: IMAGES.stadium },
{ id: 'hl2', title: 'Enyimba stun Al Ahly in Aba', meta: 'CAF Champions League', duration: '8:40', image: IMAGES.eagles },
{ id: 'hl3', title: 'Every goal — NPFL matchday 28', meta: 'Nigeria Premier Football League', duration: '12:05', image: IMAGES.stadium },
{ id: 'hl4', title: 'Super Eagles training camp', meta: 'AFCON qualifiers', duration: '6:22', image: IMAGES.eagles }];


export const fanTake = {
  question: 'Who takes this one?',
  options: [
  { id: 'o1', label: 'Arsenal', share: 46 },
  { id: 'o2', label: 'Draw', share: 21 },
  { id: 'o3', label: 'Man City', share: 33 }],

  votes: '38,204 predictions'
};