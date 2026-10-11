import { contentGraph } from './contentGraph';
import { analytics } from './analytics';
import type { GraphNode, GraphNodeType } from '../types/graph';
import type { SearchGroup, SearchHit, SearchIntent, SearchResponse } from '../types/search';

/**
 * HavaVerse Search service.
 *
 * Every query runs against the canonical Content Graph, never against one
 * domain's list. Two modes:
 *
 *   TEXT      — rank every node by label / keyword / subtitle match.
 *   RELATION  — "music from X", "products from X", "films with X",
 *               "more from X", "podcasts about X", "characters in X",
 *               "communities for X", "events for X", "shorts from X".
 *               X is resolved to one anchor node, then the graph is walked
 *               and every result carries the path that explains it.
 *
 * Search never claims more than it did: when a relationship is understood but
 * the anchor does not exist, it says so and falls back to text matching.
 *
 * Production contract (the in-browser build is the stand-in):
 *   GET  /api/search?q=&type=&cursor=      → SearchResponse (server applies
 *                                             rights, region and ranking)
 *   GET  /api/search/suggest?q=            → { node }[]
 *   GET  /api/search/recent                → string[]
 *   POST /api/search/recent  { q }
 *   DELETE /api/search/recent
 */

const RECENT_KEY = 'hv.search.recent';
const RECENT_LIMIT = 6;

/** Group order when relevance ties — what people most often came to search for. */
const typeOrder: GraphNodeType[] = [
'film',
'series',
'character',
'universe',
'creator',
'artist',
'track',
'show',
'episode',
'short',
'community',
'event',
'product',
'store',
'match',
'team',
'world',
'topic',
'discussion',
'fan-creation',
'person'];


interface RelationPattern {
  pattern: RegExp;
  understood: string;
  targetTypes: GraphNodeType[];
  /** Preferred anchor types, best first. Any node may anchor if none match. */
  anchorTypes?: GraphNodeType[];
  maxHops?: number;
}

const relationPatterns: RelationPattern[] = [
{
  pattern: /^(?:music|songs?|tracks?|soundtrack|score)\s+(?:from|of|in|for)\s+(.+)$/,
  understood: 'Music connected to',
  targetTypes: ['track']
},
{
  pattern: /^(?:products?|merch(?:andise)?|things to buy|shop)\s+(?:from|of|for)\s+(.+)$/,
  understood: 'Products from',
  targetTypes: ['product']
},
{
  pattern: /^(?:films?|movies?|titles?|series|shows)\s+(?:with|featuring|starring)\s+(.+)$/,
  understood: 'Films and series featuring',
  targetTypes: ['film', 'series'],
  anchorTypes: ['character', 'creator', 'artist']
},
{
  pattern: /^(?:more|everything)\s+(?:from|by)\s+(.+)$/,
  understood: 'Everything from',
  targetTypes: ['film', 'series', 'track', 'show', 'short', 'product', 'store', 'event', 'universe'],
  anchorTypes: ['creator', 'artist', 'store'],
  maxHops: 1
},
{
  pattern: /^(?:podcasts?|episodes?|conversations?)\s+(?:about|on)\s+(.+)$/,
  understood: 'Podcasts about',
  targetTypes: ['show', 'episode'],
  anchorTypes: ['topic', 'film', 'series', 'universe', 'world']
},
{
  pattern: /^characters?\s+(?:in|from|of)\s+(.+)$/,
  understood: 'Characters in',
  targetTypes: ['character'],
  anchorTypes: ['film', 'series', 'universe']
},
{
  pattern: /^(?:communit(?:y|ies)|fans?|fan clubs?)\s+(?:for|of|around|about)\s+(.+)$/,
  understood: 'Communities around',
  targetTypes: ['community']
},
{
  pattern: /^(?:events?|live|watch parties)\s+(?:for|of|around|about|with)\s+(.+)$/,
  understood: 'Events connected to',
  targetTypes: ['event']
},
{
  pattern: /^(?:shorts?|clips?)\s+(?:from|of|about|with)\s+(.+)$/,
  understood: 'Shorts connected to',
  targetTypes: ['short']
},
{
  pattern: /^(?:fan (?:art|work|creations?)|fan-made)\s+(?:from|of|about|for)\s+(.+)$/,
  understood: 'Fan creations inspired by',
  targetTypes: ['fan-creation']
}];


export function normalise(text: string): string {
  return text.
  toLowerCase().
  replace(/ɗ/g, 'd').
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/[“”"’']/g, '').
  replace(/\s+/g, ' ').
  trim();
}

const stopwords = new Set(['the', 'a', 'an', 'of', 'and', 'in', 'on', 'for', 'to']);

function tokens(text: string): string[] {
  const all = normalise(text).split(' ').filter(Boolean);
  const meaningful = all.filter((t) => !stopwords.has(t));
  return meaningful.length > 0 ? meaningful : all;
}

/** Text relevance. 0 means "not a match". Every meaningful token must appear somewhere. */
function textScore(node: GraphNode, phrase: string, queryTokens: string[]): number {
  const label = normalise(node.label);
  const subtitle = normalise(node.subtitle);
  const keywords = normalise(node.keywords.join(' '));
  const haystack = `${label} ${subtitle} ${keywords}`;
  if (!queryTokens.every((t) => haystack.includes(t))) return 0;

  let score = 0;
  if (label === phrase) score += 120;else
  if (label.startsWith(phrase)) score += 70;else
  if (label.includes(phrase)) score += 45;
  for (const t of queryTokens) {
    if (label.split(' ').some((w) => w.startsWith(t))) score += 18;else
    if (label.includes(t)) score += 10;else
    if (subtitle.includes(t)) score += 6;else
    score += 3;
  }
  return score;
}

function rankText(phrase: string, restrictTo?: GraphNodeType[]): SearchHit[] {
  const norm = normalise(phrase);
  const queryTokens = tokens(phrase);
  if (queryTokens.length === 0) return [];
  return contentGraph.
  allNodes().
  filter((n) => !restrictTo || restrictTo.includes(n.type)).
  map((node) => ({ node, score: textScore(node, norm, queryTokens) })).
  filter((h) => h.score > 0).
  sort((a, b) => b.score - a.score || typeOrder.indexOf(a.node.type) - typeOrder.indexOf(b.node.type));
}

function findAnchor(text: string, preferred?: GraphNodeType[]): GraphNode | null {
  const hits = rankText(text);
  if (hits.length === 0) return null;
  if (preferred) {
    const best = hits[0].score;
    // Prefer an anchor of the expected kind when it is nearly as good a match.
    const typed = hits.find((h) => preferred.includes(h.node.type) && h.score >= best * 0.6);
    if (typed) return typed.node;
  }
  return hits[0].node;
}

function interpret(query: string): {pattern: RelationPattern;anchorText: string;} | null {
  const q = normalise(query);
  for (const pattern of relationPatterns) {
    const match = q.match(pattern.pattern);
    if (match && match[1].trim()) return { pattern, anchorText: match[1].trim() };
  }
  return null;
}

function group(hits: SearchHit[]): SearchGroup[] {
  const map = new Map<GraphNodeType, SearchHit[]>();
  for (const hit of hits) map.set(hit.node.type, [...(map.get(hit.node.type) ?? []), hit]);
  return [...map.entries()].
  map(([type, list]) => ({ type, hits: list })).
  sort((a, b) => b.hits[0].score - a.hits[0].score || typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type));
}

function respond(query: string, intent: SearchIntent | null, hits: SearchHit[], relational: boolean): SearchResponse {
  return {
    query,
    intent,
    relational,
    top: hits[0] ?? null,
    groups: group(hits),
    total: hits.length
  };
}

function run(query: string): SearchResponse {
  const trimmed = query.trim();
  if (!trimmed) return respond('', null, [], false);

  const parsed = interpret(trimmed);
  if (parsed) {
    const { pattern, anchorText } = parsed;
    const anchor = findAnchor(anchorText, pattern.anchorTypes);
    const intent: SearchIntent = {
      understood: pattern.understood,
      targetTypes: pattern.targetTypes,
      anchorText,
      anchor
    };
    if (anchor) {
      const reached = contentGraph.reach(anchor.id, pattern.targetTypes, pattern.maxHops ?? 2);
      const hits: SearchHit[] = reached.map(({ node, path }) => ({
        node,
        // Direct connections rank above second-hop ones.
        score: 100 - path.length * 20,
        path: contentGraph.explainPath(anchor, path)
      }));
      if (hits.length > 0) return respond(trimmed, intent, hits, true);
    }
    // Understood, but nothing to walk from (or nothing connected): say so, then text-match.
    return respond(trimmed, intent, rankText(anchorText, pattern.targetTypes), false);
  }

  return respond(trimmed, null, rankText(trimmed), false);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function search(query: string): Promise<{ok: true;data: SearchResponse;} | {ok: false;error: string;}> {
  await delay(120);
  try {
    return { ok: true, data: run(query) };
  } catch {
    return { ok: false, error: 'Search is unavailable right now. Your query was not lost — try again.' };
  }
}

/** Instant, synchronous label suggestions for the top bar. */
function suggest(query: string, limit = 6): GraphNode[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const parsed = interpret(trimmed);
  return rankText(parsed ? parsed.anchorText : trimmed).
  slice(0, limit).
  map((h) => h.node);
}

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function recent(): string[] {
  return readRecent();
}

function remember(query: string): void {
  const q = query.trim();
  if (!q) return;
  // Emitted when a search is committed (submitted or a result opened), not per keystroke.
  const settled = run(q);
  analytics.emit('search_performed', 'search', settled.intent?.anchor?.id, {
    q: q.slice(0, 120),
    results: settled.total,
    relational: settled.relational
  });
  const next = [q, ...readRecent().filter((r) => normalise(r) !== normalise(q))].slice(0, RECENT_LIMIT);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {

    /* storage unavailable: recent searches are a convenience, not state */}
}

function clearRecent(): void {
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {

    /* ignore */}
}

/** Relationship queries that are guaranteed to have an anchor in the current graph. */
const examples = [
'music from The Last Train',
'products from Amara',
'films with Amara',
'more from Adaeze Films',
'characters in The Railway Universe',
'communities for Lagos 2042'];


export const searchApi = { search, suggest, recent, remember, clearRecent, examples, typeOrder };