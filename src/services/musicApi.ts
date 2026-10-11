import { delay } from '../utils/validation';
import { charge } from './havapayLedger';
import {
  artists,
  editions,
  liveDates,
  memberships,
  scenes,
  supportProjects,
  tracks,
  worlds } from
'../data/music';
import type {
  Artist,
  LiveDate,
  Membership,
  MusicEdition,
  MusicWorld,
  Scene,
  SupportProject,
  Track } from
'../types/music';

/* -------------------------------------------------------------------------- *
 * HavaVerse Music — data service boundary
 * -------------------------------------------------------------------------- *
 * Components never import music seed data directly. They call this service,
 * which today resolves from an in-memory store and tomorrow resolves from
 * /api/music/*. Every mutator is async and returns a result, so replacing the
 * implementation requires no change in the UI.
 *
 * Money never moves here. Support, memberships, editions and tickets all
 * record an intent and hand off to HavaPay on the server, which owns the
 * ledger entry and the creator allocation.
 *
 *   GET    /api/music/tracks                     listTracks
 *   GET    /api/music/tracks/:id                 getTrack
 *   GET    /api/music/artists                    listArtists
 *   GET    /api/music/artists/:id                getArtist
 *   GET    /api/music/worlds                     listWorlds
 *   GET    /api/music/worlds/:id                 getWorld
 *   GET    /api/music/scenes                     listScenes
 *   GET    /api/music/editions                   listEditions
 *   GET    /api/music/live                       listLive
 *   GET    /api/music/projects                   listProjects
 *   GET    /api/music/memberships                listMemberships
 *   POST   /api/music/artists/:id/support        supportCreator
 *   POST   /api/music/memberships/:id            joinMembership
 *   POST   /api/music/editions/:id/collect       collectEdition
 *   POST   /api/music/projects/:id/back          backProject
 *   POST   /api/music/live/:id/tickets           reserveTicket
 *   POST   /api/music/journeys                   buildJourney
 * -------------------------------------------------------------------------- */

export type ServiceResult<T> = {ok: true;data: T;} | {ok: false;error: string;};

const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });

export interface Journey {
  title: string;
  rationale: string;
  trackIds: string[];
}

export const musicApi = {
  async listTracks(worldId?: string): Promise<ServiceResult<Track[]>> {
    await delay(220);
    return ok(worldId ? tracks.filter((t) => t.worldId === worldId) : tracks);
  },

  async getTrack(id: string): Promise<ServiceResult<Track | null>> {
    await delay(150);
    return ok(tracks.find((t) => t.id === id) ?? null);
  },

  async listArtists(): Promise<ServiceResult<Artist[]>> {
    await delay(200);
    return ok(artists);
  },

  async getArtist(id: string): Promise<ServiceResult<Artist | null>> {
    await delay(150);
    return ok(artists.find((a) => a.id === id) ?? null);
  },

  async listWorlds(): Promise<ServiceResult<MusicWorld[]>> {
    await delay(220);
    return ok(worlds);
  },

  async getWorld(id: string): Promise<ServiceResult<MusicWorld | null>> {
    await delay(150);
    return ok(worlds.find((w) => w.id === id) ?? null);
  },

  async listScenes(): Promise<ServiceResult<Scene[]>> {
    await delay(180);
    return ok(scenes);
  },

  async listEditions(artistId?: string): Promise<ServiceResult<MusicEdition[]>> {
    await delay(200);
    return ok(artistId ? editions.filter((e) => e.artistId === artistId) : editions);
  },

  async listLive(artistId?: string): Promise<ServiceResult<LiveDate[]>> {
    await delay(200);
    return ok(artistId ? liveDates.filter((l) => l.artistId === artistId) : liveDates);
  },

  async listProjects(artistId?: string): Promise<ServiceResult<SupportProject[]>> {
    await delay(200);
    return ok(artistId ? supportProjects.filter((p) => p.artistId === artistId) : supportProjects);
  },

  async listMemberships(artistId?: string): Promise<ServiceResult<Membership[]>> {
    await delay(180);
    return ok(artistId ? memberships.filter((m) => m.artistId === artistId) : memberships);
  },

  /**
   * Every paid action below charges the HavaPay wallet through the shared
   * ledger. Prices are read from the catalogue here, never from the caller;
   * the charge stays held until HavaPay settles it and writes the split.
   */
  async supportCreator(artistId: string, amount: number): Promise<ServiceResult<null>> {
    await delay(650);
    if (amount <= 0) return { ok: false, error: 'Choose an amount first.' };
    const artist = artists.find((a) => a.id === artistId);
    if (!artist) return { ok: false, error: 'That artist is no longer accepting support.' };
    const paid = charge({
      kind: 'support',
      amount,
      label: `Support · ${artist.name}`,
      detail: 'Music',
      prefix: 'MU-SP',
      to: `/music/artist/${artist.id}`
    });
    return paid.ok ? ok(null) : paid;
  },

  async joinMembership(membershipId: string): Promise<ServiceResult<null>> {
    await delay(650);
    const membership = memberships.find((m) => m.id === membershipId);
    if (!membership) return { ok: false, error: 'That membership has closed.' };
    const artist = artists.find((a) => a.id === membership.artistId);
    const paid = charge({
      kind: 'membership',
      amount: membership.pricePerMonth,
      label: `Membership · ${artist?.name ?? membership.name}`,
      detail: `${membership.name} · first month`,
      prefix: 'MU-MB',
      to: artist ? `/music/artist/${artist.id}` : undefined
    });
    return paid.ok ? ok(null) : paid;
  },

  async collectEdition(editionId: string): Promise<ServiceResult<null>> {
    await delay(600);
    const edition = editions.find((e) => e.id === editionId);
    if (!edition) return { ok: false, error: 'That edition no longer exists.' };
    if (edition.state === 'sold-out') return { ok: false, error: 'This edition is fully collected.' };
    if (edition.state === 'upcoming') return { ok: false, error: 'This edition has not opened yet.' };
    if (edition.price <= 0) return ok(null);
    const paid = charge({
      kind: 'purchase',
      amount: edition.price,
      label: `Edition · ${edition.name}`,
      detail: `Music · ${edition.kind}`,
      prefix: 'MU-ED'
    });
    return paid.ok ? ok(null) : paid;
  },

  async backProject(projectId: string, amount: number): Promise<ServiceResult<null>> {
    await delay(650);
    if (amount <= 0) return { ok: false, error: 'Choose an amount first.' };
    const project = supportProjects.find((p) => p.id === projectId);
    if (!project) return { ok: false, error: 'This project has closed.' };
    const paid = charge({
      kind: 'support',
      amount,
      label: `Backed · ${project.title}`,
      detail: 'Music project',
      prefix: 'MU-BK'
    });
    return paid.ok ? ok(null) : paid;
  },

  async reserveTicket(liveId: string): Promise<ServiceResult<null>> {
    await delay(600);
    const date = liveDates.find((l) => l.id === liveId);
    if (!date) return { ok: false, error: 'That date is no longer listed.' };
    if (date.status === 'sold-out') return { ok: false, error: 'This one has sold out.' };
    if (date.price <= 0) return ok(null);
    const paid = charge({
      kind: 'ticket',
      amount: date.price,
      label: `Ticket · ${date.title}`,
      detail: `${date.venue}, ${date.city} · ${date.date}`,
      prefix: 'MU-TK',
      to: '/music/live'
    });
    return paid.ok ? ok(null) : paid;
  },

  /**
   * Natural-language discovery. The server will route this through the AI
   * orchestration layer; here it matches against scene, genre and mood words
   * so the behaviour is honest rather than a canned response.
   */
  async buildJourney(prompt: string): Promise<ServiceResult<Journey>> {
    await delay(900);
    const q = prompt.trim().toLowerCase();
    if (q.length < 3) return { ok: false, error: 'Tell me a bit more about the mood.' };

    const matched = tracks.filter((track) => {
      const scene = scenes.find((s) => s.id === track.sceneId);
      const haystack = [
      track.title,
      track.language,
      track.releaseKind,
      scene?.city ?? '',
      ...(scene?.genres ?? []),
      artists.find((a) => a.id === track.artistId)?.name ?? ''].

      join(' ').
      toLowerCase();
      return q.split(/\s+/).some((word) => word.length > 3 && haystack.includes(word));
    });

    const nightWords = ['night', 'late', 'midnight', 'drive', 'rain', 'dark', 'quiet'];
    const isNight = nightWords.some((word) => q.includes(word));
    const pool = matched.length > 0 ? matched : isNight ? tracks.filter((t) => t.worldId === 'lagos-after-dark') : tracks;

    return ok({
      title: isNight ? 'After midnight, moving' : 'Your sound journey',
      rationale:
      matched.length > 0 ?
      `Matched on what you said, then widened out through the cities those artists record in.` :
      `Nothing matched those words exactly, so this is built from the mood instead — ${isNight ? 'late, low and unhurried' : 'the scenes you already listen to'}.`,
      trackIds: pool.slice(0, 5).map((t) => t.id)
    });
  }
};