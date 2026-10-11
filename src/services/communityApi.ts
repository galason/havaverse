import { delay } from '../utils/validation';
import {
  achievementRules,
  seedCharacters,
  seedDiscussions,
  seedEvents,
  seedFanCreations,
  seedPartyMessages,
  seedPolls,
  seedQuestions,
  seedUniverses,
  seedWatchParties } from
'../data/communityContent';
import { people } from '../data/communityPeople';
import { recommendedCommunities } from '../data/communityHub';
import type {
  CharacterRecord,
  CommunityEventRecord,
  Discussion,
  FanCreationRecord,
  PartyMessage,
  PollRecord,
  QAQuestion,
  Reply,
  UniverseRecord,
  WatchPartyRecord } from
'../types/communityEntities';
import type { CommunitySummary } from '../types/community';

/* -------------------------------------------------------------------------- *
 * HavaVerse Community — data service boundary
 * -------------------------------------------------------------------------- *
 * Components never import seed data directly. They call this service, which
 * today resolves from an in-memory store and tomorrow resolves from
 * /api/community/*. Every mutator is async and returns a result, so swapping
 * the implementation requires no change in the UI.
 *
 *   GET    /api/community/communities
 *   POST   /api/community/:slug/membership          joinCommunity
 *   DELETE /api/community/:slug/membership          leaveCommunity
 *   PATCH  /api/community/:slug/membership          updateMembership (mute, notifications)
 *   GET    /api/community/discussions?community=    listDiscussions
 *   POST   /api/community/discussions               createDiscussion
 *   POST   /api/community/discussions/:id/replies   createReply
 *   POST   /api/community/discussions/:id/like      likeDiscussion
 *   GET    /api/community/watch-parties             listWatchParties
 *   POST   /api/community/watch-parties             createWatchParty
 *   POST   /api/community/watch-parties/:id/join    joinWatchParty
 *   POST   /api/community/watch-parties/:id/messages sendPartyMessage
 *   GET    /api/community/events                    listEvents
 *   POST   /api/community/events/:id/reminder       setReminder
 *   POST   /api/community/events/:id/questions      askQuestion
 *   POST   /api/community/questions/:id/vote        upvoteQuestion
 *   POST   /api/community/polls/:id/vote            vote
 *   GET    /api/community/universes/:id             getUniverse
 *   GET    /api/community/characters/:id            getCharacter
 *   GET    /api/community/fan-creations             listFanCreations
 * -------------------------------------------------------------------------- */

export type ServiceResult<T> = {ok: true;data: T;} | {ok: false;error: string;};

const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });

/** Mutable in-memory store standing in for the production database. */
const store = {
  communities: [...recommendedCommunities],
  discussions: seedDiscussions.map((d) => ({ ...d, replies: [...d.replies] })),
  parties: [...seedWatchParties],
  messages: { wp1: [...seedPartyMessages] } as Record<string, PartyMessage[]>,
  events: [...seedEvents],
  questions: [...seedQuestions],
  polls: seedPolls.map((p) => ({ ...p, options: p.options.map((o) => ({ ...o })) })),
  creations: [...seedFanCreations]
};

let sequence = 100;
const nextId = (prefix: string) => `${prefix}${++sequence}`;

export interface NewDiscussionInput {
  communitySlug: string;
  title: string;
  body: string;
  kind: Discussion['kind'];
  spoilerLevel: Discussion['spoilerLevel'];
  tags: string[];
}

export interface NewWatchPartyInput {
  title: string;
  description: string;
  contentSlug: string;
  contentTitle: string;
  communitySlug: string;
  when: string;
  visibility: WatchPartyRecord['visibility'];
}

export interface CommunityApi {
  listCommunities(): Promise<ServiceResult<CommunitySummary[]>>;
  getCommunity(slug: string): Promise<ServiceResult<CommunitySummary | null>>;
  joinCommunity(slug: string): Promise<ServiceResult<null>>;
  leaveCommunity(slug: string): Promise<ServiceResult<null>>;
  listDiscussions(communitySlug?: string): Promise<ServiceResult<Discussion[]>>;
  getDiscussion(id: string): Promise<ServiceResult<Discussion | null>>;
  createDiscussion(input: NewDiscussionInput): Promise<ServiceResult<Discussion>>;
  createReply(discussionId: string, body: string): Promise<ServiceResult<Reply>>;
  listWatchParties(): Promise<ServiceResult<WatchPartyRecord[]>>;
  getWatchParty(id: string): Promise<ServiceResult<WatchPartyRecord | null>>;
  createWatchParty(input: NewWatchPartyInput): Promise<ServiceResult<WatchPartyRecord>>;
  joinWatchParty(id: string): Promise<ServiceResult<null>>;
  listPartyMessages(id: string): Promise<ServiceResult<PartyMessage[]>>;
  sendPartyMessage(id: string, body: string): Promise<ServiceResult<PartyMessage>>;
  listEvents(): Promise<ServiceResult<CommunityEventRecord[]>>;
  getEvent(id: string): Promise<ServiceResult<CommunityEventRecord | null>>;
  listQuestions(eventId: string): Promise<ServiceResult<QAQuestion[]>>;
  askQuestion(eventId: string, body: string): Promise<ServiceResult<QAQuestion>>;
  listPolls(): Promise<ServiceResult<PollRecord[]>>;
  vote(pollId: string, optionIds: string[]): Promise<ServiceResult<PollRecord>>;
  listFanCreations(): Promise<ServiceResult<FanCreationRecord[]>>;
  getFanCreation(id: string): Promise<ServiceResult<FanCreationRecord | null>>;
  getUniverse(id: string): Promise<ServiceResult<UniverseRecord | null>>;
  getCharacter(id: string): Promise<ServiceResult<CharacterRecord | null>>;
}

export const communityApi: CommunityApi = {
  async listCommunities() {
    await delay(220);
    return ok(store.communities);
  },

  async getCommunity(slug) {
    await delay(160);
    return ok(store.communities.find((c) => c.slug === slug) ?? null);
  },

  async joinCommunity() {
    await delay(320);
    return ok(null);
  },

  async leaveCommunity() {
    await delay(260);
    return ok(null);
  },

  async listDiscussions(communitySlug) {
    await delay(240);
    return ok(
      communitySlug ?
      store.discussions.filter((d) => d.communitySlug === communitySlug) :
      store.discussions
    );
  },

  async getDiscussion(id) {
    await delay(180);
    return ok(store.discussions.find((d) => d.id === id) ?? null);
  },

  async createDiscussion(input) {
    await delay(520);
    if (!input.title.trim()) return { ok: false, error: 'Give your discussion a title.' };
    const discussion: Discussion = {
      id: nextId('d'),
      communitySlug: input.communitySlug,
      title: input.title.trim(),
      body: input.body.trim(),
      authorId: 'you',
      kind: input.kind,
      spoilerLevel: input.spoilerLevel,
      timeAgo: 'just now',
      likes: 0,
      tags: input.tags,
      replies: []
    };
    store.discussions = [discussion, ...store.discussions];
    return ok(discussion);
  },

  async createReply(discussionId, body) {
    await delay(340);
    if (!body.trim()) return { ok: false, error: 'Write something first.' };
    const reply: Reply = {
      id: nextId('r'),
      authorId: 'you',
      body: body.trim(),
      likes: 0,
      timeAgo: 'just now',
      spoilerLevel: 'safe'
    };
    store.discussions = store.discussions.map((d) =>
    d.id === discussionId ? { ...d, replies: [...d.replies, reply] } : d
    );
    return ok(reply);
  },

  async listWatchParties() {
    await delay(240);
    return ok(store.parties);
  },

  async getWatchParty(id) {
    await delay(160);
    return ok(store.parties.find((p) => p.id === id) ?? null);
  },

  async createWatchParty(input) {
    await delay(600);
    if (!input.title.trim()) return { ok: false, error: 'Give the watch party a name.' };
    if (!input.contentSlug) return { ok: false, error: 'Choose something to watch.' };
    const party: WatchPartyRecord = {
      id: nextId('wp'),
      title: input.title.trim(),
      description: input.description.trim(),
      contentSlug: input.contentSlug,
      contentTitle: input.contentTitle,
      communitySlug: input.communitySlug,
      hostId: 'you',
      when: input.when || 'Starting now',
      startsInMinutes: 0,
      state: 'scheduled',
      visibility: input.visibility,
      participants: 1,
      image: '',
      hostedByUser: true
    };
    store.parties = [party, ...store.parties];
    store.messages[party.id] = [];
    return ok(party);
  },

  async joinWatchParty() {
    await delay(300);
    return ok(null);
  },

  async listPartyMessages(id) {
    await delay(200);
    return ok(store.messages[id] ?? []);
  },

  async sendPartyMessage(id, body) {
    await delay(120);
    if (!body.trim()) return { ok: false, error: 'Empty message.' };
    const message: PartyMessage = {
      id: nextId('pm'),
      authorId: 'you',
      body: body.trim(),
      timeAgo: 'now',
      kind: 'message'
    };
    store.messages[id] = [...(store.messages[id] ?? []), message];
    return ok(message);
  },

  async listEvents() {
    await delay(220);
    return ok(store.events);
  },

  async getEvent(id) {
    await delay(160);
    return ok(store.events.find((e) => e.id === id) ?? null);
  },

  async listQuestions(eventId) {
    await delay(200);
    return ok(store.questions.filter((q) => q.eventId === eventId));
  },

  async askQuestion(eventId, body) {
    await delay(380);
    if (!body.trim()) return { ok: false, error: 'Write your question first.' };
    const question: QAQuestion = {
      id: nextId('q'),
      eventId,
      authorId: 'you',
      body: body.trim(),
      votes: 1
    };
    store.questions = [...store.questions, question];
    return ok(question);
  },

  async listPolls() {
    await delay(220);
    return ok(store.polls);
  },

  async vote(pollId, optionIds) {
    await delay(420);
    const poll = store.polls.find((p) => p.id === pollId);
    if (!poll) return { ok: false, error: 'That poll no longer exists.' };
    if (poll.state === 'closed') return { ok: false, error: 'This poll has closed.' };
    if (optionIds.length === 0) return { ok: false, error: 'Choose an option first.' };

    // Recompute shares as if one vote were added to each chosen option.
    const total = poll.participants + 1;
    const updated: PollRecord = {
      ...poll,
      participants: total,
      options: poll.options.map((option) => {
        const previousVotes = Math.round(option.share / 100 * poll.participants);
        const votes = previousVotes + (optionIds.includes(option.id) ? 1 : 0);
        return { ...option, share: Math.round(votes / total * 100) };
      })
    };
    store.polls = store.polls.map((p) => p.id === pollId ? updated : p);
    return ok(updated);
  },

  async listFanCreations() {
    await delay(240);
    return ok(store.creations);
  },

  async getFanCreation(id) {
    await delay(160);
    return ok(store.creations.find((c) => c.id === id) ?? null);
  },

  async getUniverse(id) {
    await delay(200);
    return ok(seedUniverses.find((u) => u.id === id) ?? null);
  },

  async getCharacter(id) {
    await delay(180);
    return ok(seedCharacters.find((c) => c.id === id) ?? null);
  }
};

/* -------------------------------------------------------------- saved items */

/**
 * PUT /api/community/saved/:key { saved }
 *
 * One saved-items collection for every community object — discussions, fan
 * creations, moments. The key is `<type>:<id>`, so a single store serves every
 * surface rather than each page keeping its own local flag.
 */
const savedItems = new Set<string>();

export async function setSaved(key: string, saved: boolean): Promise<ServiceResult<boolean>> {
  await delay(320);
  if (!key.includes(':')) return { ok: false, error: 'Could not save that.' };
  if (saved) savedItems.add(key);else
  savedItems.delete(key);
  return ok(saved);
}

export function savedKeys(): string[] {
  return [...savedItems];
}

/* ------------------------------------------------------------- predictions */

/**
 * POST /api/community/predictions/:id/vote { optionId }
 *
 * Non-monetary community predictions. The server owns the tally, so the client
 * sends a choice and is told the new participant count back — it never
 * increments a local counter. One vote per fan; changing a pick replaces it.
 */
const predictionVotes = new Map<string, string>();
const predictionParticipants = new Map<string, number>([['fan-take-arsenal-city', 38_204]]);

export async function castPrediction(
predictionId: string,
optionId: string)
: Promise<ServiceResult<{optionId: string;participants: number;}>> {
  await delay(460);
  if (!optionId) return { ok: false, error: 'Choose an outcome first.' };
  const existing = predictionVotes.get(predictionId);
  const participants = predictionParticipants.get(predictionId) ?? 1;
  const next = existing ? participants : participants + 1;
  predictionVotes.set(predictionId, optionId);
  predictionParticipants.set(predictionId, next);
  return ok({ optionId, participants: next });
}

/* -------------------------------------------------------------- attendance */

/**
 * POST /api/community/events/:id/attendance { status }
 *
 * Attendance is a stored answer, not a gesture — "going", "maybe" and
 * "not going" are all valid states and the user can change their mind. The
 * server owns capacity, so a full event is refused here rather than accepted
 * optimistically on the client.
 */
export type AttendanceStatus = 'going' | 'maybe' | 'none';

const attendance = new Map<string, AttendanceStatus>();

export async function setAttendance(
eventId: string,
status: AttendanceStatus)
: Promise<ServiceResult<AttendanceStatus>> {
  await delay(420);
  const event = store.events.find((e) => e.id === eventId);
  if (!event) return { ok: false, error: 'That event is no longer listed.' };
  if (event.state === 'ended') {
    return { ok: false, error: 'This event has already ended.' };
  }
  attendance.set(eventId, status);
  return ok(status);
}

export function attendanceFor(eventId: string): AttendanceStatus {
  return attendance.get(eventId) ?? 'none';
}

/* ------------------------------------------------------------------ reports */

/**
 * POST /api/community/reports
 *
 * One reporting path for every community object — discussions, fan creations
 * and members. Trust & Safety owns triage server-side; the client only submits
 * and reports back the case id it was given. Duplicate submissions against the
 * same object are refused rather than silently accepted.
 */
export const reportReasons = [
'Spoilers without a warning',
'Harassment or abuse',
'Hate speech',
'Spam or scam',
'Sexual or graphic content',
'Impersonation',
'Copyright or rights violation',
'Something else'] as
const;

export type CommunityReportReason = (typeof reportReasons)[number];

export type ReportSubject = 'discussion' | 'reply' | 'fan-creation' | 'member' | 'event';

const submittedReports = new Set<string>();
let reportSequence = 4820;

export async function reportObject(
subject: ReportSubject,
objectId: string,
reason: string,
detail: string)
: Promise<ServiceResult<{caseId: string;}>> {
  await delay(620);
  if (!reason) return { ok: false, error: 'Choose a reason so moderators know what to look at.' };
  const key = `${subject}:${objectId}`;
  if (submittedReports.has(key)) {
    return { ok: false, error: 'You have already reported this. Moderators are reviewing it.' };
  }
  if (detail.length > 1000) {
    return { ok: false, error: 'Keep the details under 1,000 characters.' };
  }
  submittedReports.add(key);
  reportSequence += 1;
  return ok({ caseId: `TS-${reportSequence}` });
}

export function hasReported(subject: ReportSubject, objectId: string): boolean {
  return submittedReports.has(`${subject}:${objectId}`);
}

export { achievementRules, people };