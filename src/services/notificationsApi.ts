import { categories, defaultPreferences, initialNotifications } from '../data/notifications';
import { readJSON, writeJSON } from '../utils/storage';
import { delay } from '../utils/validation';
import type {
  AppNotification,
  DeliveryStatus,
  NotificationCategory,
  NotificationChannel,
  NotificationPreferences } from
'../types/notifications';

/**
 * NOTIFICATION SERVICE (stand-in)
 *
 *   GET    /api/notifications                   list
 *   POST   /api/notifications/:id/read          markRead
 *   DELETE /api/notifications/:id/read          markUnread
 *   POST   /api/notifications/read-all          markAllRead
 *   DELETE /api/notifications/:id               dismiss
 *   GET    /api/notifications/preferences       getPreferences
 *   PATCH  /api/notifications/preferences       setPreference
 *
 * Creating notifications is server-to-server; on the client they arrive via
 * notificationBus (the realtime channel). Push, email and SMS are sent by the
 * delivery service: this device only records them as queued, never as sent.
 */

export type ServiceResult<T> = {ok: true;data: T;} | {ok: false;error: string;};

export type NotificationInput = Pick<AppNotification, 'kind' | 'title' | 'body' | 'to' | 'image'>;

const KEYS = { inbox: 'hv.notifications.inbox', prefs: 'hv.notifications.prefs' };
const MAX_INBOX = 100;

const isInbox = (v: unknown): v is AppNotification[] =>
Array.isArray(v) && v.every((n) => n && typeof n === 'object' && typeof (n as AppNotification).createdAt === 'number');

const isPrefs = (v: unknown): v is NotificationPreferences =>
!!v && typeof v === 'object' && categories.every((c) => typeof (v as Record<string, unknown>)[c.id] === 'object');

let inbox: AppNotification[] = readJSON(KEYS.inbox, initialNotifications, isInbox);
let prefs: NotificationPreferences = readJSON(KEYS.prefs, defaultPreferences, isPrefs);

type Listener = (notifications: AppNotification[]) => void;
const listeners = new Set<Listener>();

function commit(next: AppNotification[]) {
  inbox = next.slice(0, MAX_INBOX);
  writeJSON(KEYS.inbox, inbox);
  listeners.forEach((l) => l(inbox));
}

function metaOf(category: NotificationCategory) {
  return categories.find((c) => c.id === category)!;
}

export function channelState(category: NotificationCategory, channel: NotificationChannel) {
  const meta = metaOf(category);
  if (meta.unavailable.includes(channel)) return 'unavailable' as const;
  if (meta.locked.includes(channel)) return 'locked' as const;
  return prefs[category][channel] ? 'on' as const : 'off' as const;
}

function deliveryFor(category: NotificationCategory): AppNotification['delivery'] {
  const out: AppNotification['delivery'] = {};
  for (const channel of ['in-app', 'push', 'email', 'sms'] as NotificationChannel[]) {
    const state = channelState(category, channel);
    const status: DeliveryStatus =
    state === 'unavailable' ?
    'unavailable' :
    state === 'off' ?
    'off' :
    channel === 'in-app' ?
    'delivered' :
    'queued';
    out[channel] = status;
  }
  return out;
}

let seq = 0;

/** Called by the realtime seam only. Honours the user's in-app preference. */
function receive(input: NotificationInput): AppNotification | null {
  const notification: AppNotification = {
    ...input,
    id: `nt-${Date.now().toString(36)}-${seq += 1}`,
    createdAt: Date.now(),
    read: false,
    delivery: deliveryFor(input.kind)
  };
  if (notification.delivery['in-app'] !== 'delivered') return null;
  commit([notification, ...inbox]);
  return notification;
}

function snapshot() {
  return inbox;
}

async function list(): Promise<ServiceResult<AppNotification[]>> {
  await delay(280);
  return { ok: true, data: inbox };
}

function setRead(id: string, read: boolean) {
  commit(inbox.map((n) => n.id === id ? { ...n, read } : n));
}

function markAllRead(category?: NotificationCategory) {
  commit(inbox.map((n) => !category || n.kind === category ? { ...n, read: true } : n));
}

function dismiss(id: string) {
  commit(inbox.filter((n) => n.id !== id));
}

function getPreferences(): NotificationPreferences {
  return prefs;
}

async function setPreference(
category: NotificationCategory,
channel: NotificationChannel,
on: boolean)
: Promise<ServiceResult<NotificationPreferences>> {
  await delay(220);
  const state = channelState(category, channel);
  if (state === 'unavailable') return { ok: false, error: `${channel.toUpperCase()} isn't offered for this category.` };
  if (state === 'locked') return { ok: false, error: 'This one stays on so you always hear about it.' };
  prefs = { ...prefs, [category]: { ...prefs[category], [channel]: on } };
  writeJSON(KEYS.prefs, prefs);
  return { ok: true, data: prefs };
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const notificationsApi = {
  receive,
  snapshot,
  list,
  markRead: (id: string) => setRead(id, true),
  markUnread: (id: string) => setRead(id, false),
  markAllRead,
  dismiss,
  getPreferences,
  setPreference,
  channelState,
  subscribe
};