import { IMAGES, fixtures } from '../data/catalog';
import { artists, liveDates } from '../data/music';
import { liveConversations, shows } from '../data/podcast';
import { communityApi } from './communityApi';
import { releaseRegistry, titleBySlug } from './releaseRegistry';
import { liveReminders } from './liveReminders';
import { notificationBus } from './notificationBus';
import { analytics } from './analytics';
import { formatDay } from '../utils/time';
import { isStringArray, readJSON, writeJSON } from '../utils/storage';
import type { LiveEntry, LiveSource } from '../types/live';
import type { CommunityEventRecord, WatchPartyRecord } from '../types/communityEntities';

/**
 * LIVE SERVICE — one schedule for everything happening now or soon.
 *
 *   GET  /api/live                 -> entries across sports, music, podcast,
 *                                     community and Studio premieres
 *   PUT  /api/live/reminders/:key  -> see liveReminders
 *
 * Every entry is a PROJECTION of a record another service owns. Tickets,
 * seats, attendance and joining stay on the source page; this service only
 * lists, links and reminds. Server-side the schedule is assembled per viewer
 * (region, rights, community visibility); here it reads the same seeds the
 * source pages read, so /live can never disagree with them.
 */

type Result<T> = {ok: true;data: T;} | {ok: false;error: string;};

const NOTIFIED_KEY = 'hv.live.notified';
let notified: string[] = readJSON<string[]>(NOTIFIED_KEY, [], isStringArray);

/* ------------------------------ projections ------------------------------- */

function fromFixtures(): LiveEntry[] {
  return fixtures.map((f) => ({
    id: `sports:${f.id}`,
    source: 'sports' as const,
    state: f.isLive ? 'live' as const : 'upcoming' as const,
    kindLabel: f.competition,
    title: `${f.homeTeam} vs ${f.awayTeam}`,
    context: f.competition,
    when: f.isLive ? f.clock ?? 'In play' : f.kickoff,
    score:
    f.isLive && typeof f.homeScore === 'number' && typeof f.awayScore === 'number' ?
    { home: f.homeTeam, away: f.awayTeam, homeScore: f.homeScore, awayScore: f.awayScore, clock: f.clock ?? '' } :
    undefined,
    image: f.image,
    // Sports has one match centre today; there are no per-match pages yet.
    to: '/sports'
  }));
}

function fromConcerts(): LiveEntry[] {
  return liveDates.map((d) => {
    const artist = artists.find((a) => a.id === d.artistId);
    return {
      id: `music:${d.id}`,
      source: 'concert' as const,
      // Music live dates carry a sales state, not a broadcast state.
      state: 'upcoming' as const,
      kindLabel: d.kind,
      title: d.title,
      context: [artist?.name, d.city === 'Online' ? d.venue : `${d.venue}, ${d.city}`].filter(Boolean).join(' · '),
      when: d.date,
      access: d.status === 'sold-out' ? 'sold-out' : d.price === 0 ? 'free' : 'ticketed',
      price: d.price || undefined,
      image: d.image,
      to: `/music/live/${d.id}`
    };
  });
}

function fromPodcasts(): LiveEntry[] {
  return liveConversations.map((c) => {
    const show = shows.find((s) => s.id === c.showId);
    return {
      id: `podcast:${c.id}`,
      source: 'podcast' as const,
      state: c.status === 'live' ? 'live' as const : 'upcoming' as const,
      kindLabel: c.kind,
      title: c.title,
      context: [show?.title, c.city === 'Online' ? c.venue : `${c.venue}, ${c.city}`].filter(Boolean).join(' · '),
      when: c.date,
      audience: c.attending,
      access: c.status === 'sold-out' ? 'sold-out' : c.price === 0 ? 'free' : 'ticketed',
      price: c.price || undefined,
      image: c.image,
      to: `/podcast/live/${c.id}`
    };
  });
}

function imageForContent(slug: string | undefined): string {
  const t = slug ? titleBySlug(slug) : undefined;
  return t?.backdrop ?? t?.poster ?? IMAGES.stadium;
}

function fromParties(parties: WatchPartyRecord[]): LiveEntry[] {
  return parties.
  filter((p) => p.state !== 'ended')
  // Invite-only parties aren't public listings unless you're hosting.
  .filter((p) => p.visibility !== 'invite' || p.hostedByUser).
  map((p) => ({
    id: `community:${p.id}`,
    source: 'watch-party' as const,
    state: p.state === 'live' ? 'live' as const : 'upcoming' as const,
    kindLabel: 'Watch party',
    title: p.title,
    context: `Watching ${p.contentTitle}`,
    when: p.state === 'live' ? 'In progress' : p.when,
    audience: `${p.participants.toLocaleString()} ${p.state === 'live' ? 'watching' : 'going'}`,
    access: 'free' as const,
    image: p.image || imageForContent(p.contentSlug),
    to: `/watch-parties/${p.id}`
  }));
}

function fromEvents(events: CommunityEventRecord[], partyIds: Set<string>): LiveEntry[] {
  return events.
  filter((e) => e.state !== 'ended')
  // An event that is just a watch party is already listed as that party.
  .filter((e) => !(e.watchPartyId && partyIds.has(e.watchPartyId))).
  map((e) => ({
    id: `community:${e.id}`,
    source: 'event' as const,
    state: e.state === 'live' ? 'live' as const : 'upcoming' as const,
    kindLabel: e.kind,
    title: e.name,
    context: e.description,
    when: e.state === 'live' ? 'Happening now' : e.when,
    audience: e.attendees,
    access: 'free' as const,
    image: e.image || imageForContent(e.relatedContentSlug),
    to: `/events/${e.id}`
  }));
}

function fromPremieres(): LiveEntry[] {
  return releaseRegistry.scheduledPremieres().map((r) => {
    const time = new Date(r.releaseAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return {
      id: `premiere:${r.slug}`,
      source: 'premiere' as const,
      state: 'upcoming' as const,
      kindLabel: 'Premiere',
      title: r.title.name,
      context: `${r.title.creator} · ${r.title.genre}`,
      when: `${formatDay(r.releaseAt)} · ${time}`,
      image: r.title.backdrop ?? r.title.poster,
      to: `/title/${r.slug}`
    };
  });
}

/* --------------------------------- public --------------------------------- */

/**
 * Server-side, a reminder whose event goes live triggers a Live notification.
 * The stand-in does the same check whenever the schedule is read, once per
 * entry, so nothing is announced twice.
 */
function announceRemindedLive(entries: LiveEntry[]) {
  const due = entries.filter((e) => e.state === 'live' && liveReminders.has(e.id) && !notified.includes(e.id));
  if (due.length === 0) return;
  due.forEach((e) =>
  notificationBus.deliver({
    kind: 'live',
    title: `${e.title} is live`,
    body: `${e.kindLabel} · ${e.context}. You asked to be reminded.`,
    to: e.to,
    image: e.image
  })
  );
  notified = [...notified, ...due.map((e) => e.id)];
  writeJSON(NOTIFIED_KEY, notified);
}

async function list(): Promise<Result<LiveEntry[]>> {
  const [parties, events] = await Promise.all([communityApi.listWatchParties(), communityApi.listEvents()]);
  if (!parties.ok || !events.ok) return { ok: false, error: 'The live schedule could not be loaded.' };

  const partyEntries = fromParties(parties.data);
  const partyIds = new Set(parties.data.map((p) => p.id));

  const entries = [
  ...fromFixtures(),
  ...fromPodcasts(),
  ...partyEntries,
  ...fromEvents(events.data, partyIds),
  ...fromConcerts(),
  ...fromPremieres()];

  announceRemindedLive(entries);
  return { ok: true, data: entries };
}

/** Sets or clears a reminder. Only upcoming entries take reminders. */
function toggleReminder(entry: Pick<LiveEntry, 'id' | 'source' | 'state'>): boolean {
  const on = liveReminders.toggle(entry.id);
  if (on) analytics.emit('reminder_set', 'live', entry.id, { source: entry.source });
  return on;
}

function recordOpen(entry: Pick<LiveEntry, 'id' | 'source' | 'state'>) {
  analytics.emit('content_viewed', 'live', entry.id, { source: entry.source, state: entry.state });
}

export const sourceLabels: Record<LiveSource, string> = {
  sports: 'Sports',
  concert: 'Concerts',
  podcast: 'Podcasts',
  event: 'Events',
  'watch-party': 'Watch parties',
  premiere: 'Premieres'
};

export const liveApi = { list, toggleReminder, recordOpen };