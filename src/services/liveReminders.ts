import { isStringArray, readJSON, writeJSON } from '../utils/storage';

/**
 * LIVE REMINDERS — the one reminder store for everything that starts later.
 *
 *   GET    /api/live/reminders
 *   PUT    /api/live/reminders/:key
 *   DELETE /api/live/reminders/:key
 *
 * Keys are `<namespace>:<id>` (`sports:f2`, `music:lv1`, `podcast:pl1`,
 * `community:ev3`, `premiere:<slug>`). Community events and watch parties,
 * Home's Live Now rail and the /live page all read and write here, so a
 * reminder set in one place shows as set everywhere. Server-side the
 * reminder is what triggers the "is live" notification.
 */

const KEY = 'hv.live.reminders';

let keys: string[] = readJSON<string[]>(KEY, [], isStringArray);

type Listener = (keys: string[]) => void;
const listeners = new Set<Listener>();

function commit(next: string[]) {
  keys = next;
  writeJSON(KEY, keys);
  listeners.forEach((l) => l(keys));
}

export const liveReminders = {
  all: () => [...keys],
  has: (key: string) => keys.includes(key),
  /** Returns the new state: true when the reminder is now on. */
  toggle(key: string): boolean {
    const on = keys.includes(key);
    commit(on ? keys.filter((k) => k !== key) : [...keys, key]);
    return !on;
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};