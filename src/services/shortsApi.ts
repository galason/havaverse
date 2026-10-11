import type {
  DismissReason,
  FeedMode,
  RelatedGroup,
  ReportReason,
  Short,
  ShortAnalytics,
  ShortAnswer,
  ShortComment } from
'../types/shorts';
import { commentsBySlug, ownerAnalytics, relatedGroups, shorts } from '../data/shorts';
import { charge } from './havapayLedger';

/**
 * SHORTS API — the boundary between the Shorts theatre and the platform.
 *
 * Production routes this maps onto:
 *   GET    /api/shorts/feed?mode=            -> ranked, rights-filtered feed
 *   GET    /api/shorts/:slug
 *   GET    /api/shorts/:slug/related
 *   GET    /api/shorts/:slug/comments?sort=
 *   GET    /api/shorts/:slug/analytics       -> owner only
 *   POST   /api/shorts/:slug/like
 *   POST   /api/shorts/:slug/save
 *   POST   /api/shorts/:slug/comment
 *   POST   /api/shorts/:slug/share
 *   POST   /api/shorts/:slug/support
 *   POST   /api/shorts/:slug/report
 *   POST   /api/shorts/:slug/not-interested
 *   POST   /api/shorts/:slug/ask
 *   POST   /api/shorts/events                -> analytics
 *
 * Ranking, rights, geography, age restriction, moderation state and creator
 * permissions are resolved SERVER-SIDE. The client never computes eligibility
 * and never receives a playable source it is not entitled to. View counts,
 * likes and revenue are server-authoritative; the values returned here are
 * read-only projections.
 */

type Result<T> = {ok: true;data: T;} | {ok: false;error: string;};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Session-scoped signals. Server-side these are persisted per identity. */
const liked = new Set<string>();
const saved = new Set<string>();
const dismissed = new Set<string>();
const postedComments: Record<string, ShortComment[]> = {};

function ordered(mode: FeedMode): Short[] {
  const pool = shorts.filter((s) => s.modes.includes(mode) && !dismissed.has(s.slug));
  if (mode === 'trending') {
    return [...pool].sort((a, b) => b.likes - a.likes);
  }
  if (mode === 'new') {
    return [...pool].sort((a, b) => a.publishedAgo.localeCompare(b.publishedAgo));
  }
  return pool;
}

async function getFeed(mode: FeedMode): Promise<Result<Short[]>> {
  await delay(280);
  return { ok: true, data: ordered(mode) };
}

async function getShort(slug: string): Promise<Result<Short>> {
  await delay(180);
  const short = shorts.find((s) => s.slug === slug);
  if (!short) return { ok: false, error: 'This Short is no longer available.' };
  return { ok: true, data: short };
}

async function getRelated(slug: string): Promise<Result<RelatedGroup[]>> {
  await delay(220);
  return {
    ok: true,
    data: relatedGroups.map((g) => ({
      ...g,
      shorts: g.shorts.filter((s) => s.slug !== slug)
    }))
  };
}

async function getComments(
slug: string,
sort: 'top' | 'new')
: Promise<Result<ShortComment[]>> {
  await delay(260);
  const base = commentsBySlug[slug] ?? [];
  const mine = postedComments[slug] ?? [];
  const all = [...mine, ...base];
  const pinned = all.filter((c) => c.pinned);
  const rest = all.filter((c) => !c.pinned);
  rest.sort((a, b) => sort === 'top' ? b.likes - a.likes : 0);
  return { ok: true, data: [...pinned, ...rest] };
}

async function postComment(
slug: string,
body: string,
atSecond: number | null,
spoiler: boolean)
: Promise<Result<ShortComment>> {
  await delay(320);
  if (body.trim().length < 2) return { ok: false, error: 'Write something first.' };
  const comment: ShortComment = {
    id: `local-${Date.now()}`,
    author: 'Daniel Okafor',
    handle: '@david',
    avatar: "/cf64123d-3c6c-486f-921a-256867040791.jpg",

    body: body.trim(),
    likes: 0,
    postedAgo: 'now',
    atSecond,
    spoiler,
    fromCreator: false,
    pinned: false,
    replies: []
  };
  postedComments[slug] = [comment, ...(postedComments[slug] ?? [])];
  return { ok: true, data: comment };
}

async function toggleLike(slug: string): Promise<Result<boolean>> {
  await delay(120);
  if (liked.has(slug)) liked.delete(slug);else
  liked.add(slug);
  return { ok: true, data: liked.has(slug) };
}

async function toggleSave(slug: string): Promise<Result<boolean>> {
  await delay(140);
  if (saved.has(slug)) saved.delete(slug);else
  saved.add(slug);
  return { ok: true, data: saved.has(slug) };
}

async function share(slug: string, atSecond: number | null): Promise<Result<string>> {
  await delay(120);
  const base = `${window.location.origin}/shorts/${slug}`;
  return { ok: true, data: atSecond === null ? base : `${base}?at=${atSecond}` };
}

async function support(
handle: string,
amountMinor: number,
message: string)
: Promise<Result<{reference: string;}>> {
  await delay(520);
  if (amountMinor < 10000) {
    return { ok: false, error: 'The minimum support amount is ₦100.' };
  }
  if (message.length > 280) return { ok: false, error: 'Keep the message under 280 characters.' };
  // Held in the HavaPay ledger until settlement; the split is written server-side.
  const paid = charge({
    kind: 'support',
    amount: Math.round(amountMinor / 100),
    label: `Support · @${handle}`,
    detail: 'From Shorts',
    prefix: 'HP'
  });
  return paid.ok ? { ok: true, data: { reference: paid.reference } } : paid;
}

async function report(slug: string, reason: ReportReason): Promise<Result<string>> {
  await delay(380);
  void slug;
  void reason;
  return {
    ok: true,
    data: 'Thanks — this is with Trust & Safety. We’ll let you know the outcome.'
  };
}

async function notInterested(slug: string, reason: DismissReason): Promise<Result<string>> {
  await delay(160);
  dismissed.add(slug);
  const copy: Record<DismissReason, string> = {
    'this-short': 'You’ll see fewer like this',
    'this-creator': 'We’ll stop recommending this creator',
    'this-topic': 'We’ll ease off this topic',
    'seen-it': 'Noted — you’ve seen it'
  };
  return { ok: true, data: copy[reason] };
}

async function getAnalytics(slug: string): Promise<Result<ShortAnalytics>> {
  await delay(300);
  const short = shorts.find((s) => s.slug === slug);
  if (!short?.ownedByViewer) {
    return { ok: false, error: 'You don’t have access to analytics for this Short.' };
  }
  return { ok: true, data: ownerAnalytics };
}

/**
 * Grounded answers only. The assistant may use the Short's own record and its
 * graph edges; anything outside that returns a refusal rather than an
 * invention. Story canon is never guessed.
 */
async function ask(slug: string, question: string): Promise<Result<ShortAnswer>> {
  await delay(620);
  const short = shorts.find((s) => s.slug === slug);
  if (!short) return { ok: false, error: 'This Short is no longer available.' };

  const q = question.toLowerCase();
  const link = (kind: string) => short.graph.find((g) => g.kind === kind);

  if (q.includes('why') && (q.includes('seeing') || q.includes('recommend'))) {
    return {
      ok: true,
      data: {
        body: `${short.reason.short}. ${short.reason.detail}`,
        citations: [{ label: 'Manage what shapes this', to: '/settings/recommendations' }],
        grounded: true
      }
    };
  }

  if (q.includes('character') || q.includes('who is')) {
    const character = link('character');
    if (!character) {
      return {
        ok: true,
        data: {
          body: 'This Short has no character record attached, so I can’t tell you who appears in it without guessing.',
          citations: [],
          grounded: false
        }
      };
    }
    return {
      ok: true,
      data: {
        body: `That is ${character.label} — ${character.sub.toLowerCase()} of ${short.caption.split('—')[0].trim()}. Her full appearances, relationships and quotes are on her page.`,
        citations: [{ label: character.label, to: character.to }],
        grounded: true
      }
    };
  }

  if (q.includes('film') || q.includes('full') || q.includes('watch') || q.includes('series')) {
    const title = link('title');
    if (!title) {
      return {
        ok: true,
        data: {
          body: 'This Short isn’t a clip from a longer work — it stands on its own.',
          citations: [],
          grounded: true
        }
      };
    }
    return {
      ok: true,
      data: {
        body: `It’s from ${title.label} — ${title.sub}. ${short.story}`,
        citations: [{ label: `Open ${title.label}`, to: title.to }],
        grounded: true
      }
    };
  }

  if (q.includes('music') || q.includes('soundtrack') || q.includes('song') || q.includes('track')) {
    if (!short.music) {
      return {
        ok: true,
        data: {
          body: 'No track is credited on this Short, so there’s nothing for me to point you at.',
          citations: [],
          grounded: false
        }
      };
    }
    return {
      ok: true,
      data: {
        body: `The track is ${short.music.title} by ${short.music.artist}. It also scores the film this scene comes from.`,
        citations: [{ label: `Play ${short.music.title}`, to: short.music.to }],
        grounded: true
      }
    };
  }

  if (q.includes('creator') || q.includes('made') || q.includes('who created')) {
    return {
      ok: true,
      data: {
        body: `${short.creator.name} — ${short.creator.kind}, based in ${short.creator.location}. ${short.creator.bio}`,
        citations: [{ label: `Open ${short.creator.name}`, to: short.creator.to }],
        grounded: true
      }
    };
  }

  if (q.includes('similar') || q.includes('like this') || q.includes('more')) {
    return {
      ok: true,
      data: {
        body: `Closest matches are the other works in this register — same city, same genre, mostly the same people behind them.`,
        citations: relatedGroups[0].shorts.
        slice(0, 2).
        map((s) => ({ label: s.caption, to: `/shorts/${s.slug}` })),
        grounded: true
      }
    };
  }

  if (q.includes('community') || q.includes('discussing') || q.includes('fans')) {
    if (!short.community) {
      return {
        ok: true,
        data: {
          body: 'No community is attached to this Short yet.',
          citations: [],
          grounded: true
        }
      };
    }
    return {
      ok: true,
      data: {
        body: `${short.community.name} — ${short.community.fans}, ${short.community.discussing}.`,
        citations: [{ label: 'Open the community', to: short.community.to }],
        grounded: true
      }
    };
  }

  return {
    ok: true,
    data: {
      body: 'That isn’t covered by anything attached to this Short — its credits, graph and rights are all I can read here. Ask me about the film, the creator, the character, the music or why it reached you.',
      citations: [],
      grounded: false
    }
  };
}

/** Meaningful playback and interaction events only — never UI repaints. */
function track(event: string, slug: string, detail?: string) {
  void event;
  void slug;
  void detail;
}

export const shortsApi = {
  getFeed,
  getShort,
  getRelated,
  getComments,
  postComment,
  toggleLike,
  toggleSave,
  share,
  support,
  report,
  notInterested,
  getAnalytics,
  ask,
  track,
  isLiked: (slug: string) => liked.has(slug),
  isSaved: (slug: string) => saved.has(slug),
  listLiked: () => [...liked],
  listSaved: () => [...saved]
};