import { delay } from '../utils/validation';
import { charge } from './havapayLedger';
import {
  cities,
  drops,
  episodes,
  guests,
  hosts,
  liveConversations,
  podMemberships,
  shows,
  topics,
  worlds } from
'../data/podcast';
import type {
  ConversationWorld,
  Episode,
  Guest,
  Host,
  LiveConversation,
  PodCity,
  PodDrop,
  PodMembership,
  Show,
  Topic } from
'../types/podcast';

/* -------------------------------------------------------------------------- *
 * HavaVerse Podcast — data boundary
 *
 * Same contract shape as communityApi / commerceApi / musicApi. Components
 * never read data/podcast.ts for anything that will eventually be served;
 * they call this. Replacing the in-memory reads with fetch() against the
 * routes below requires no UI change.
 *
 *   GET    /api/podcast/shows                    listShows
 *   GET    /api/podcast/shows/:id                getShow
 *   GET    /api/podcast/episodes                 listEpisodes
 *   GET    /api/podcast/episodes/:id             getEpisode
 *   GET    /api/podcast/creators                 listHosts
 *   GET    /api/podcast/creators/:id             getHost
 *   GET    /api/podcast/worlds                   listWorlds
 *   GET    /api/podcast/worlds/:id               getWorld
 *   GET    /api/podcast/topics                   listTopics
 *   GET    /api/podcast/cities                   listCities
 *   GET    /api/podcast/live                     listLive
 *   GET    /api/podcast/drops                    listDrops
 *   GET    /api/podcast/memberships              listMemberships
 *   POST   /api/podcast/creators/:id/support     supportHost
 *   POST   /api/podcast/memberships/:id          joinMembership
 *   POST   /api/podcast/drops/:id/collect        collectDrop
 *   POST   /api/podcast/drops/:id/notify         notifyDrop
 *   POST   /api/podcast/live/:id/tickets         reserveSeat
 *   POST   /api/podcast/moments/:id/save         saveMoment
 *   POST   /api/podcast/journeys                 buildJourney
 *   POST   /api/podcast/episodes/:id/ask         askEpisode
 * -------------------------------------------------------------------------- */

export type ServiceResult<T> = {ok: true;data: T;} | {ok: false;error: string;};

const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });

export interface JourneyLeg {
  episodeId: string;
  minutes: number;
  why: string;
}

export interface ListeningJourney {
  title: string;
  rationale: string;
  legs: JourneyLeg[];
  totalMinutes: number;
}

export interface EpisodeAnswer {
  answer: string;
  /** Timestamps the answer is drawn from, so the listener can verify it. */
  citations: {atSeconds: number;speaker: string;text: string;}[];
}

export const podcastApi = {
  async listShows(worldId?: string): Promise<ServiceResult<Show[]>> {
    await delay(220);
    if (!worldId) return ok(shows);
    const world = worlds.find((w) => w.id === worldId);
    return ok(world ? shows.filter((s) => world.showIds.includes(s.id)) : []);
  },

  async getShow(id: string): Promise<ServiceResult<Show | null>> {
    await delay(150);
    return ok(shows.find((s) => s.id === id) ?? null);
  },

  async listEpisodes(showId?: string): Promise<ServiceResult<Episode[]>> {
    await delay(220);
    return ok(showId ? episodes.filter((e) => e.showId === showId) : episodes);
  },

  async getEpisode(id: string): Promise<ServiceResult<Episode | null>> {
    await delay(160);
    return ok(episodes.find((e) => e.id === id) ?? null);
  },

  async listHosts(): Promise<ServiceResult<Host[]>> {
    await delay(200);
    return ok(hosts);
  },

  async getHost(id: string): Promise<ServiceResult<Host | null>> {
    await delay(150);
    return ok(hosts.find((h) => h.id === id) ?? null);
  },

  async listGuests(ids?: string[]): Promise<ServiceResult<Guest[]>> {
    await delay(120);
    return ok(ids ? guests.filter((g) => ids.includes(g.id)) : guests);
  },

  async listWorlds(): Promise<ServiceResult<ConversationWorld[]>> {
    await delay(220);
    return ok(worlds);
  },

  async getWorld(id: string): Promise<ServiceResult<ConversationWorld | null>> {
    await delay(150);
    return ok(worlds.find((w) => w.id === id) ?? null);
  },

  async listTopics(worldId?: string): Promise<ServiceResult<Topic[]>> {
    await delay(150);
    return ok(worldId ? topics.filter((t) => t.worldId === worldId) : topics);
  },

  async listCities(): Promise<ServiceResult<PodCity[]>> {
    await delay(160);
    return ok(cities);
  },

  async listLive(showId?: string): Promise<ServiceResult<LiveConversation[]>> {
    await delay(200);
    return ok(showId ? liveConversations.filter((l) => l.showId === showId) : liveConversations);
  },

  async listDrops(showId?: string): Promise<ServiceResult<PodDrop[]>> {
    await delay(200);
    return ok(showId ? drops.filter((d) => d.showId === showId) : drops);
  },

  async listMemberships(hostId?: string): Promise<ServiceResult<PodMembership[]>> {
    await delay(180);
    return ok(hostId ? podMemberships.filter((m) => m.hostId === hostId) : podMemberships);
  },

  /**
   * Paid actions charge the HavaPay wallet through the shared ledger. Prices
   * come from the catalogue here, never from the caller; each charge stays
   * held until HavaPay settles it and writes the creator split.
   */
  async supportHost(hostId: string, amount: number): Promise<ServiceResult<null>> {
    await delay(650);
    if (amount <= 0) return { ok: false, error: 'Choose an amount first.' };
    const host = hosts.find((h) => h.id === hostId);
    if (!host) return { ok: false, error: 'This creator is not accepting support right now.' };
    const paid = charge({
      kind: 'support',
      amount,
      label: `Support · ${host.name}`,
      detail: 'Podcast',
      prefix: 'PC-SP',
      to: `/podcast/creator/${host.id}`
    });
    return paid.ok ? ok(null) : paid;
  },

  async joinMembership(membershipId: string): Promise<ServiceResult<null>> {
    await delay(650);
    const membership = podMemberships.find((m) => m.id === membershipId);
    if (!membership) return { ok: false, error: 'That membership has closed.' };
    const host = hosts.find((h) => h.id === membership.hostId);
    const paid = charge({
      kind: 'membership',
      amount: membership.pricePerMonth,
      label: `Membership · ${host?.name ?? membership.name}`,
      detail: `${membership.name} · first month`,
      prefix: 'PC-MB',
      to: host ? `/podcast/creator/${host.id}` : undefined
    });
    return paid.ok ? ok(null) : paid;
  },

  async collectDrop(dropId: string): Promise<ServiceResult<null>> {
    await delay(600);
    const drop = drops.find((d) => d.id === dropId);
    if (!drop) return { ok: false, error: 'That collection no longer exists.' };
    if (drop.state === 'sold-out') return { ok: false, error: 'This collection is fully claimed.' };
    if (drop.state === 'upcoming') return { ok: false, error: 'This one has not opened yet.' };
    if (drop.price <= 0) return ok(null);
    const paid = charge({
      kind: 'purchase',
      amount: drop.price,
      label: `Collection · ${drop.name}`,
      detail: `Podcast · ${drop.kind}`,
      prefix: 'PC-DR',
      to: `/podcast/drop/${drop.id}`
    });
    return paid.ok ? ok(null) : paid;
  },

  async reserveSeat(liveId: string): Promise<ServiceResult<null>> {
    await delay(600);
    const event = liveConversations.find((l) => l.id === liveId);
    if (!event) return { ok: false, error: 'That conversation is no longer listed.' };
    if (event.status === 'sold-out') return { ok: false, error: 'This one is full.' };
    if (event.price <= 0) return ok(null);
    const paid = charge({
      kind: 'ticket',
      amount: event.price,
      label: `Seat · ${event.title}`,
      detail: `${event.venue}, ${event.city} · ${event.date}`,
      prefix: 'PC-TK',
      to: '/podcast/live'
    });
    return paid.ok ? ok(null) : paid;
  },

  async saveMoment(momentId: string): Promise<ServiceResult<null>> {
    await delay(250);
    const exists = episodes.some((e) => e.moments.some((m) => m.id === momentId));
    if (!exists) return { ok: false, error: 'That moment could not be saved.' };
    return ok(null);
  },

  /**
   * Natural-language discovery. Returns a sequenced journey rather than a
   * playlist, because the unit here is an argument, not a mood.
   */
  async buildJourney(prompt: string): Promise<ServiceResult<ListeningJourney>> {
    await delay(900);
    const q = prompt.trim().toLowerCase();
    if (q.length < 3) return { ok: false, error: 'Tell me a little more about what you want to understand.' };

    const words = q.split(/\s+/).filter((w) => w.length > 3);
    const scored = episodes.
    map((episode) => {
      const show = shows.find((s) => s.id === episode.showId);
      const haystack = [
      episode.title,
      episode.summary,
      show?.title ?? '',
      ...episode.topicIds.map((id) => topics.find((t) => t.id === id)?.label ?? '')].

      join(' ').
      toLowerCase();
      const score = words.filter((word) => haystack.includes(word)).length;
      return { episode, score };
    }).
    filter((entry) => entry.score > 0).
    sort((a, b) => b.score - a.score);

    const chosen = (scored.length > 0 ? scored.map((s) => s.episode) : episodes).slice(0, 3);
    const legs: JourneyLeg[] = chosen.map((episode, i) => ({
      episodeId: episode.id,
      minutes: [12, 18, 12][i] ?? 12,
      why:
      i === 0 ?
      'Sets the terms of the argument.' :
      i === 1 ?
      'The counter-case, from someone who disagrees.' :
      'Where it lands, and what is still unresolved.'
    }));

    return ok({
      title: scored.length > 0 ? 'Your listening journey' : 'A place to start',
      rationale:
      scored.length > 0 ?
      'Sequenced so the argument builds rather than repeats — each leg is a segment, not a whole episode.' :
      'Nothing matched those words directly, so this starts from the most-discussed conversations instead.',
      legs,
      totalMinutes: legs.reduce((total, leg) => total + leg.minutes, 0)
    });
  },

  /**
   * Answers a question about one episode, strictly from its transcript.
   * It will not speculate — when the transcript does not cover it, it says so.
   */
  async askEpisode(episodeId: string, question: string): Promise<ServiceResult<EpisodeAnswer>> {
    await delay(800);
    const episode = episodes.find((e) => e.id === episodeId);
    if (!episode) return { ok: false, error: 'That episode is not available.' };
    const q = question.trim().toLowerCase();
    if (q.length < 3) return { ok: false, error: 'Ask a full question and I will find it.' };

    const words = q.split(/\s+/).filter((w) => w.length > 3);
    const hits = episode.transcript.filter((line) =>
    words.some((word) => line.text.toLowerCase().includes(word))
    );

    if (hits.length === 0) {
      return ok({
        answer:
        'That is not covered in this recording. I only answer from the transcript, so rather than guess: nothing in this episode addresses it directly.',
        citations: []
      });
    }

    return ok({
      answer: `Found ${hits.length} ${hits.length === 1 ? 'moment' : 'moments'} in the transcript. Jump to any of them to hear it in context.`,
      citations: hits.slice(0, 4)
    });
  }
};