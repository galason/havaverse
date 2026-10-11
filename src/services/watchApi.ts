import type {
  AiAnswer,
  AnalyticsEvent,
  AnalyticsRecord,
  CommentSort,
  ResumePoint,
  TitleReaction,
  TitleReactionRecord,
  WatchAsset,
  WatchComment,
  WatchSession } from
'../types/watch';
import type { PlatformEventName } from '../types/analytics';
import { commentsFor, watchAssetFor } from '../data/watch';
import { titles } from '../data/catalog';
import { analytics } from './analytics';
import { charge } from './havapayLedger';
import { deviceLabel, isStringArray, readJSON, writeJSON } from '../utils/storage';

/**
 * HavaVerse Play — watch service boundary.
 *
 * Every function here maps to a documented endpoint. Views never reach past
 * this file into the seed data, so replacing the in-memory store with HTTP is
 * a swap of the bodies below and nothing else.
 *
 *   GET    /api/play/:slug                  → getAsset
 *   GET    /api/play/:slug/entitlement      → getAsset().entitlement (server-authoritative)
 *   GET    /api/play/:slug/resume           → getResume
 *   PUT    /api/play/:slug/resume           → saveResume
 *   DELETE /api/play/:slug/resume           → clearResume
 *   GET    /api/play/:slug/comments         → listComments
 *   POST   /api/play/:slug/comments         → postComment
 *   POST   /api/play/comments/:id/like      → likeComment
 *   POST   /api/play/:slug/support          → supportCreator
 *   POST   /api/play/:slug/unlock           → unlock
 *   POST   /api/play/:slug/party            → createParty
 *   POST   /api/play/:slug/report           → reportContent
 *   POST   /api/play/:slug/ask              → ask
 *   POST   /api/play/events                 → track (forwarded to POST /api/events)
 *   GET    /api/watch/resume                → listResume
 *   GET    /api/watch/history?cursor=       → listHistory
 *   DELETE /api/watch/history/:slug         → clearHistory
 *   GET    /api/watch/reactions             → listReactions
 *   PUT    /api/watch/reactions/:slug       → setReaction  { reaction: 'up'|'down'|null }
 *   GET    /api/watch/watchlist             → listWatchlist
 *   PUT    /api/watch/watchlist/:titleId    → setWatchlisted(true)
 *   DELETE /api/watch/watchlist/:titleId    → setWatchlisted(false)
 *
 * Resume, history, reactions and watchlist are user state the SERVER owns.
 * Until it exists they persist on this device (localStorage) so they survive
 * reloads — they do not yet follow the account to another device.
 *
 * Entitlement, rights and media URLs are decided SERVER-SIDE. The client
 * renders the state it is handed; it never grants itself access.
 */

const KEYS = {
  resume: 'hv.watch.resume',
  history: 'hv.watch.history',
  reactions: 'hv.watch.reactions',
  watchlist: 'hv.watch.watchlist'
};

/** A gap longer than this starts a new history session. */
const SESSION_GAP_MS = 30 * 60_000;
const HISTORY_LIMIT = 300;

const seedResume: ResumePoint = {
  slug: 'the-last-train',
  positionSeconds: 2537,
  completion: 44,
  updatedAt: Date.now() - 86_400_000,
  device: 'Chrome on Windows'
};

const isArray = <T,>(v: unknown): v is T[] => Array.isArray(v);

export type ServiceResult<T> = {ok: true;data: T;} | {ok: false;error: string;};

const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let seq = 0;
const nextId = (p: string) => `${p}-${++seq}`;

interface Store {
  resume: Map<string, ResumePoint>;
  history: WatchSession[];
  reactions: Map<string, TitleReactionRecord>;
  watchlist: string[];
  comments: Map<string, WatchComment[]>;
  likedComments: Set<string>;
  unlocked: Set<string>;
  supported: Map<string, number>;
  analytics: AnalyticsRecord[];
  milestones: Set<string>;
}

const storedResume = readJSON<ResumePoint[]>(KEYS.resume, [seedResume], isArray);
const store: Store = {
  resume: new Map(storedResume.map((r) => [r.slug, r])),
  history: readJSON<WatchSession[]>(
    KEYS.history,
    [
    {
      id: 'ws-seed-1',
      slug: seedResume.slug,
      startedAt: seedResume.updatedAt - seedResume.positionSeconds * 1000,
      endedAt: seedResume.updatedAt,
      fromSeconds: 0,
      toSeconds: seedResume.positionSeconds,
      completion: seedResume.completion,
      device: seedResume.device
    }],

    isArray
  ),
  reactions: new Map(
    readJSON<TitleReactionRecord[]>(KEYS.reactions, [], isArray).map((r) => [r.slug, r])
  ),
  watchlist: readJSON<string[]>(KEYS.watchlist, ['t3'], isStringArray),
  comments: new Map(),
  likedComments: new Set(),
  unlocked: new Set(),
  supported: new Map(),
  analytics: [],
  milestones: new Set()
};

/* ------------------------------------------------------------------ assets */

export async function getAsset(slug: string): Promise<ServiceResult<WatchAsset>> {
  await delay(280);
  const asset = watchAssetFor(slug);
  if (!asset) return { ok: false, error: 'This title is not available.' };
  // A purchase recorded this session changes the entitlement the server returns.
  if (store.unlocked.has(slug)) {
    return ok({
      ...asset,
      entitlement: { state: 'available', reason: 'Unlocked on this account.' }
    });
  }
  return ok(asset);
}

/* ------------------------------------------------------------------ resume */

export function getResume(slug: string): ResumePoint | null {
  return store.resume.get(slug) ?? null;
}

function persistResume() {
  writeJSON(KEYS.resume, [...store.resume.values()]);
}

export function saveResume(slug: string, positionSeconds: number, duration: number): void {
  if (positionSeconds < 15 || duration <= 0) return;
  const completion = Math.min(100, Math.round(positionSeconds / duration * 100));
  const now = Date.now();
  const device = deviceLabel();
  store.resume.set(slug, {
    slug,
    positionSeconds: completion >= 97 ? 0 : positionSeconds,
    completion,
    updatedAt: now,
    device
  });
  persistResume();
  logSession(slug, positionSeconds, completion, now, device);
}

export function clearResume(slug: string): void {
  store.resume.delete(slug);
  persistResume();
}

/** Every resume point on this account, newest first. */
export function listResume(): ResumePoint[] {
  return [...store.resume.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

/* ----------------------------------------------------------------- history */

function logSession(slug: string, position: number, completion: number, now: number, device: string) {
  const last = [...store.history].reverse().find((s) => s.slug === slug);
  if (last && now - last.endedAt < SESSION_GAP_MS && last.device === device) {
    last.endedAt = now;
    last.toSeconds = Math.max(last.toSeconds, position);
    last.completion = Math.max(last.completion, completion);
  } else {
    store.history.push({
      id: `ws-${now.toString(36)}`,
      slug,
      startedAt: now,
      endedAt: now,
      fromSeconds: position,
      toSeconds: position,
      completion,
      device
    });
  }
  store.history = store.history.slice(-HISTORY_LIMIT);
  writeJSON(KEYS.history, store.history);
}

/** Every viewing session, newest first. A title watched three times appears three times. */
export function listHistory(): WatchSession[] {
  return [...store.history].sort((a, b) => b.endedAt - a.endedAt);
}

/** Removes a title from history entirely: every session and its resume point. */
export function clearHistory(slug: string): void {
  store.history = store.history.filter((s) => s.slug !== slug);
  writeJSON(KEYS.history, store.history);
  clearResume(slug);
}

/* --------------------------------------------------------------- reactions */

export function getReaction(slug: string): TitleReaction | null {
  return store.reactions.get(slug)?.reaction ?? null;
}

/** One reaction per title per account, shared by the title page and the player. */
export function setReaction(slug: string, reaction: TitleReaction | null): TitleReaction | null {
  if (reaction) store.reactions.set(slug, { slug, reaction, at: Date.now() });else
  store.reactions.delete(slug);
  writeJSON(KEYS.reactions, [...store.reactions.values()]);
  if (reaction) {
    analytics.emit('content_reacted', 'watch', graphIdFor(slug), { reaction });
  }
  return reaction;
}

export function listReactions(): TitleReactionRecord[] {
  return [...store.reactions.values()].sort((a, b) => b.at - a.at);
}

/* --------------------------------------------------------------- watchlist */

export function listWatchlist(): string[] {
  return [...store.watchlist];
}

export function setWatchlisted(titleId: string, saved: boolean): string[] {
  const has = store.watchlist.includes(titleId);
  if (saved && !has) store.watchlist = [...store.watchlist, titleId];
  if (!saved && has) store.watchlist = store.watchlist.filter((x) => x !== titleId);
  writeJSON(KEYS.watchlist, store.watchlist);
  const t = titles.find((x) => x.id === titleId);
  if (t && saved !== has) {
    analytics.emit(saved ? 'content_saved' : 'content_unsaved', 'watch', graphIdFor(t.slug), {
      list: 'watchlist'
    });
  }
  return listWatchlist();
}

function graphIdFor(slug: string): string {
  const t = titles.find((x) => x.slug === slug);
  return `${t?.kind === 'Series' ? 'series' : 'film'}:${slug}`;
}

/* ---------------------------------------------------------------- comments */

export async function listComments(
slug: string,
sort: CommentSort)
: Promise<ServiceResult<WatchComment[]>> {
  await delay(420);
  const base = store.comments.get(slug) ?? commentsFor(slug);
  store.comments.set(slug, base);
  const list = [...base];
  if (sort === 'top') list.sort((a, b) => b.likes - a.likes);
  if (sort === 'discussed') list.sort((a, b) => b.replies.length - a.replies.length);
  if (sort === 'newest') list.reverse();
  return ok(list);
}

export async function postComment(
slug: string,
body: string,
atSeconds?: number)
: Promise<ServiceResult<WatchComment>> {
  await delay(380);
  const text = body.trim();
  if (text.length < 2) return { ok: false, error: 'Write something first.' };
  if (text.length > 1200) return { ok: false, error: 'Comments are limited to 1,200 characters.' };

  const created: WatchComment = {
    id: nextId('c'),
    author: 'Daniel K.',
    handle: 'danielk',
    avatar: "/a5a337e4-e160-4f17-9a1a-72ef9e489fb4.jpg",
    body: text,
    postedAt: 'just now',
    likes: 0,
    atSeconds,
    fromCreator: false,
    replies: []
  };
  const list = store.comments.get(slug) ?? commentsFor(slug);
  store.comments.set(slug, [created, ...list]);
  return ok(created);
}

export async function postReply(
slug: string,
parentId: string,
body: string)
: Promise<ServiceResult<WatchComment>> {
  await delay(340);
  const text = body.trim();
  if (text.length < 2) return { ok: false, error: 'Write something first.' };
  const list = store.comments.get(slug) ?? commentsFor(slug);
  const parent = list.find((c) => c.id === parentId);
  if (!parent) return { ok: false, error: 'That comment is no longer available.' };

  const reply: WatchComment = {
    id: nextId('r'),
    author: 'Daniel K.',
    handle: 'danielk',
    avatar: "/a5a337e4-e160-4f17-9a1a-72ef9e489fb4.jpg",
    body: text,
    postedAt: 'just now',
    likes: 0,
    fromCreator: false,
    replies: []
  };
  parent.replies = [...parent.replies, reply];
  store.comments.set(slug, [...list]);
  return ok(reply);
}

export function isCommentLiked(id: string): boolean {
  return store.likedComments.has(id);
}

export async function likeComment(id: string): Promise<ServiceResult<boolean>> {
  await delay(180);
  const liked = store.likedComments.has(id);
  if (liked) store.likedComments.delete(id);else
  store.likedComments.add(id);
  return ok(!liked);
}

/* ----------------------------------------------------------------- economy */

export async function supportCreator(
slug: string,
minor: number,
message: string)
: Promise<ServiceResult<{reference: string;}>> {
  await delay(900);
  if (minor <= 0) return { ok: false, error: 'Choose an amount first.' };
  if (message.length > 280) return { ok: false, error: 'Keep the message under 280 characters.' };
  const title = titles.find((t) => t.slug === slug);
  // Held in the HavaPay ledger until settlement; the split is written server-side.
  const paid = charge({
    kind: 'support',
    amount: Math.round(minor / 100),
    label: `Support · ${title?.name ?? slug}`,
    detail: 'From the player',
    prefix: 'HVP',
    to: `/title/${slug}`
  });
  if (!paid.ok) return paid;
  store.supported.set(slug, (store.supported.get(slug) ?? 0) + minor);
  return ok({ reference: paid.reference });
}

export function supportedTotal(slug: string): number {
  return store.supported.get(slug) ?? 0;
}

/**
 * The price comes from the entitlement the server issued, never the caller.
 * The charge is held against the wallet; access is granted for this session
 * while HavaPay settles, and the server revokes it if settlement fails.
 */
export async function unlock(slug: string): Promise<ServiceResult<null>> {
  await delay(1100);
  const priceMinor = watchAssetFor(slug).entitlement.priceMinor ?? 0;
  if (priceMinor > 0) {
    const title = titles.find((t) => t.slug === slug);
    const paid = charge({
      kind: 'unlock',
      amount: Math.round(priceMinor / 100),
      label: `Unlock · ${title?.name ?? slug}`,
      detail: 'Pay-per-view',
      prefix: 'PPV',
      to: `/title/${slug}`
    });
    if (!paid.ok) return paid;
  }
  store.unlocked.add(slug);
  return ok(null);
}

/* -------------------------------------------------------- party and safety */

export async function createParty(
slug: string,
visibility: 'private' | 'friends' | 'community')
: Promise<ServiceResult<{id: string;inviteUrl: string;}>> {
  await delay(700);
  const id = `wp-${Date.now().toString().slice(-6)}`;
  return ok({
    id,
    inviteUrl: `${window.location.origin}/watch-parties/${id}`
  });
}

export async function reportContent(
slug: string,
reason: string,
detail: string)
: Promise<ServiceResult<{caseId: string;}>> {
  await delay(650);
  if (!reason) return { ok: false, error: 'Choose a reason.' };
  return ok({ caseId: `TS-${Date.now().toString().slice(-6)}` });
}

/* ---------------------------------------------------------------- hava ai */

const NO_ANSWER: AiAnswer = {
  body: "I can only answer from what this title actually carries — its credits, chapters, transcript and graph. That is not in there, so I would be making it up. Try asking about the characters, the ending, the creator or the soundtrack."
};

export async function ask(slug: string, question: string): Promise<ServiceResult<AiAnswer>> {
  await delay(750);
  const q = question.trim().toLowerCase();
  if (q.length < 3) return { ok: false, error: 'Ask a full question.' };

  const asset = watchAssetFor(slug);
  let best: {score: number;answer: AiAnswer;} | null = null;
  asset.knowledge.forEach((entry) => {
    const score = entry.match.reduce((n, m) => q.includes(m) ? n + m.length : n, 0);
    if (score > 0 && (!best || score > best.score)) best = { score, answer: entry.answer };
  });
  return ok(best ? best.answer : NO_ANSWER);
}

/* -------------------------------------------------------------- analytics */

export function track(event: AnalyticsEvent, slug: string, detail?: string): void {
  // Milestones fire once per title per session, not on every repaint.
  if (event.startsWith('progress_') || event === 'play_completed') {
    const key = `${slug}:${event}`;
    if (store.milestones.has(key)) return;
    store.milestones.add(key);
  }
  store.analytics.push({ id: nextId('ev'), event, slug, at: Date.now(), detail });
  // Player-specific telemetry stays here; the events the platform cares about
  // are forwarded under the shared contract. Watchlist and reactions emit
  // from their own mutations, so they are not forwarded twice.
  const platform = platformEvent[event];
  if (platform) analytics.emit(platform, 'watch', graphIdFor(slug), detail ? { detail } : undefined);
}

const platformEvent: Partial<Record<AnalyticsEvent, PlatformEventName>> = {
  content_view: 'content_viewed',
  play_started: 'content_started',
  play_completed: 'content_completed',
  share_created: 'content_shared',
  comment_created: 'comment_created',
  creator_followed: 'creator_followed',
  creator_supported: 'support_completed',
  recommendation_clicked: 'recommendation_clicked'
};

export function analyticsLog(): AnalyticsRecord[] {
  return [...store.analytics];
}

export const watchApi = {
  listResume,
  listHistory,
  clearHistory,
  getReaction,
  setReaction,
  listReactions,
  listWatchlist,
  setWatchlisted,
  getAsset,
  getResume,
  saveResume,
  clearResume,
  listComments,
  postComment,
  postReply,
  likeComment,
  isCommentLiked,
  supportCreator,
  supportedTotal,
  unlock,
  createParty,
  reportContent,
  ask,
  track,
  analyticsLog
};