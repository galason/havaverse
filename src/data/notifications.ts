import { IMAGES } from './catalog';
import type {
  AppNotification,
  CategoryMeta,
  NotificationChannel,
  NotificationPreferences } from
'../types/notifications';

export const channels: {id: NotificationChannel;label: string;}[] = [
{ id: 'in-app', label: 'In HavaVerse' },
{ id: 'push', label: 'Push' },
{ id: 'email', label: 'Email' },
{ id: 'sms', label: 'SMS' }];


/** SMS costs the user attention and money, so it is only offered where it earns it. */
export const categories: CategoryMeta[] = [
{
  id: 'social',
  label: 'Social',
  description: 'Replies, mentions, new followers, watch party invites and community activity.',
  locked: [],
  unavailable: ['sms']
},
{
  id: 'creator',
  label: 'Creator',
  description: 'New releases from creators you follow, and your own publishing jobs.',
  locked: [],
  unavailable: ['sms']
},
{
  id: 'economy',
  label: 'Economy',
  description: 'Wallet, earnings, payouts, tips and memberships.',
  locked: [],
  unavailable: []
},
{
  id: 'commerce',
  label: 'Commerce',
  description: 'Orders, delivery updates and refunds from HavaMarket.',
  locked: [],
  unavailable: []
},
{
  id: 'live',
  label: 'Live',
  description: 'Matches, concerts, premieres and events starting that you follow.',
  locked: [],
  unavailable: ['sms']
},
{
  id: 'security',
  label: 'Security',
  description: 'Failed sign-ins, password and sign-in method changes, account deletion.',
  locked: ['in-app', 'email'],
  unavailable: []
},
{
  id: 'system',
  label: 'System',
  description: 'Changes to your account, rights checks and important product notices.',
  locked: ['in-app'],
  unavailable: ['sms']
}];


export const defaultPreferences: NotificationPreferences = {
  social: { 'in-app': true, push: true, email: false, sms: false },
  creator: { 'in-app': true, push: true, email: false, sms: false },
  economy: { 'in-app': true, push: true, email: true, sms: false },
  commerce: { 'in-app': true, push: true, email: true, sms: false },
  live: { 'in-app': true, push: true, email: false, sms: false },
  security: { 'in-app': true, push: true, email: true, sms: true },
  system: { 'in-app': true, push: false, email: true, sms: false }
};

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const seededAt = Date.now();

export const initialNotifications: AppNotification[] = [
{
  id: 'n1',
  kind: 'live',
  title: 'Arsenal vs Man City is live',
  body: "Second half just kicked off — 1–1 at 62'.",
  createdAt: seededAt - 2 * MIN,
  to: '/sports',
  image: IMAGES.stadium,
  read: false,
  delivery: { 'in-app': 'delivered', push: 'queued' }
},
{
  id: 'n2',
  kind: 'creator',
  title: 'Adaeze Films published Southbound trailer',
  body: 'The sequel to The Last Train has a first look.',
  createdAt: seededAt - HOUR,
  to: '/creator/adaezefilms',
  image: IMAGES.creator,
  read: false,
  delivery: { 'in-app': 'delivered', push: 'queued' }
},
{
  id: 'n3',
  kind: 'social',
  title: 'Watch party starts in 40 minutes',
  body: 'The Last Train — full rewatch · 412 going.',
  createdAt: seededAt - 3 * HOUR,
  to: '/community/the-last-train',
  image: IMAGES.lastTrain,
  read: false,
  delivery: { 'in-app': 'delivered', push: 'queued' }
},
{
  id: 'n6',
  kind: 'commerce',
  title: 'Your scarf is on its way',
  body: 'HV-4811 left the Ikeja hub with GIG Logistics. Expected 28 Sep.',
  createdAt: seededAt - 20 * HOUR,
  to: '/market/orders/HV-4811',
  read: true,
  delivery: { 'in-app': 'delivered', push: 'queued', email: 'queued' }
},
{
  id: 'n4',
  kind: 'economy',
  title: 'Payout settled',
  body: '₦412,800 in August earnings cleared to your wallet.',
  createdAt: seededAt - DAY - 4 * HOUR,
  to: '/wallet',
  read: true,
  delivery: { 'in-app': 'delivered', push: 'queued', email: 'queued' }
},
{
  id: 'n5',
  kind: 'system',
  title: 'Rights check needed',
  body: 'Publishing The Last Train is blocked until a sync licence is attached.',
  createdAt: seededAt - 2 * DAY,
  to: '/studio',
  read: true,
  delivery: { 'in-app': 'delivered', email: 'queued' }
}];