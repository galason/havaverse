import type { PlatformEvent, PlatformEventName, PlatformModule } from '../types/analytics';
import { readJSON, writeJSON } from '../utils/storage';

/**
 * USER-SIDE ANALYTICS — one event contract for every module.
 *
 * Production contract:
 *   POST /api/events  { events: PlatformEvent[] }   batched, fire-and-forget
 * The server attaches identity from the session cookie; the client never
 * sends user ids, emails or payment details in an event.
 *
 * The stand-in keeps a bounded buffer on this device so the events emitted
 * can be inspected, and so nothing pretends to have been delivered.
 */

const KEY = 'hv.analytics.buffer';
const LIMIT = 200;

let seq = 0;
let buffer: PlatformEvent[] = readJSON<PlatformEvent[]>(KEY, [], (v): v is PlatformEvent[] => Array.isArray(v));

function emit(
name: PlatformEventName,
module: PlatformModule,
subject?: string,
props?: PlatformEvent['props'])
: PlatformEvent {
  const event: PlatformEvent = {
    id: `ev-${Date.now().toString(36)}-${++seq}`,
    name,
    module,
    subject,
    props,
    at: Date.now()
  };
  buffer = [...buffer, event].slice(-LIMIT);
  writeJSON(KEY, buffer);
  return event;
}

/** Events not yet delivered — everything, until an endpoint exists. */
function pending(): PlatformEvent[] {
  return [...buffer];
}

function clear(): void {
  buffer = [];
  writeJSON(KEY, buffer);
}

export const analytics = { emit, pending, clear };