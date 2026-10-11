import { fixtures, titles as catalogTitles } from '../data/catalog';
import { releaseRegistry } from './releaseRegistry';
import { availabilityBySlug } from '../data/home';
import { experienceFor } from '../data/titleHub';
import { artists, liveDates, tracks, worlds as musicWorlds } from '../data/music';
import {
  episodes,
  hosts,
  liveConversations,
  shows,
  topics,
  worlds as podcastWorlds } from
'../data/podcast';
import { shorts } from '../data/shorts';
import { recommendedCommunities } from '../data/communityHub';
import {
  seedCharacters,
  seedDiscussions,
  seedEvents,
  seedFanCreations,
  seedUniverses } from
'../data/communityContent';
import { people } from '../data/communityPeople';
import { commerceUniverses, creatorStores, marketProducts } from '../data/commerce';
import type {
  GraphEdge,
  GraphNode,
  GraphNodeType,
  GraphRelation,
  GraphStep,
  Neighbour } from
'../types/graph';

/**
 * HavaVerse Content Graph service.
 *
 * The single place relationships are resolved. Every domain seed is ingested
 * once into typed nodes and typed edges; domain-local link arrays (a track's
 * `graph`, an episode's `graph`, a Short's `graph`, a product's provenance, a
 * character's `appearsIn`, a universe's nodes) are read as edge ASSERTIONS and
 * resolved against the canonical nodes by their destination. A link that
 * resolves to no node is dropped rather than invented.
 *
 * Production contract (the in-browser build below is the stand-in):
 *   GET /api/graph/nodes/:id                 → GraphNode
 *   GET /api/graph/nodes/:id/neighbours      → Neighbour[]
 *   GET /api/graph/resolve?href=             → GraphNode | 404
 *   GET /api/graph/reach?from=&types=&hops=  → { node, path }[]
 * The server owns the graph (Postgres/graph store) and applies rights and
 * regional availability before returning nodes.
 */

export const nodeTypeLabel: Record<GraphNodeType, {one: string;many: string;}> = {
  film: { one: 'Film', many: 'Films' },
  series: { one: 'Series', many: 'Series' },
  short: { one: 'Short', many: 'Shorts' },
  track: { one: 'Track', many: 'Music' },
  artist: { one: 'Artist', many: 'Artists' },
  show: { one: 'Podcast', many: 'Podcasts' },
  episode: { one: 'Episode', many: 'Podcast episodes' },
  match: { one: 'Match', many: 'Matches' },
  team: { one: 'Team', many: 'Teams' },
  creator: { one: 'Creator', many: 'Creators' },
  person: { one: 'Member', many: 'People' },
  character: { one: 'Character', many: 'Characters' },
  universe: { one: 'Universe', many: 'Universes' },
  world: { one: 'World', many: 'Worlds' },
  topic: { one: 'Topic', many: 'Topics' },
  community: { one: 'Community', many: 'Communities' },
  discussion: { one: 'Discussion', many: 'Discussions' },
  'fan-creation': { one: 'Fan creation', many: 'Fan creations' },
  event: { one: 'Event', many: 'Events' },
  product: { one: 'Product', many: 'Products' },
  store: { one: 'Store', many: 'Stores' }
};

/** Phrase for the edge's `from` node relative to its `to` node. */
const forwardPhrase: Record<GraphRelation, string> = {
  created_by: 'made by',
  features: 'features',
  part_of: 'part of',
  soundtrack_of: 'soundtrack of',
  performed_by: 'by',
  episode_of: 'episode of',
  hosted_by: 'hosted by',
  about: 'about',
  in_world: 'in',
  community_for: 'community for',
  posted_in: 'posted in',
  authored_by: 'by',
  fan_work_of: 'fan work of',
  merch_of: 'from',
  sold_by: 'sold by',
  clip_of: 'clip from',
  uses_track: 'uses',
  event_of: 'event in',
  plays_in: 'plays in',
  links_to: 'connected to'
};

/** Phrase for the edge's `to` node relative to its `from` node. */
const inversePhrase: Record<GraphRelation, string> = {
  created_by: 'creator of',
  features: 'appears in',
  part_of: 'includes',
  soundtrack_of: 'has soundtrack',
  performed_by: 'performs',
  episode_of: 'has episode',
  hosted_by: 'hosts',
  about: 'discussed in',
  in_world: 'includes',
  community_for: 'has community',
  posted_in: 'has post',
  authored_by: 'author of',
  fan_work_of: 'inspired',
  merch_of: 'has merchandise',
  sold_by: 'sells',
  clip_of: 'has clip',
  uses_track: 'used in',
  event_of: 'hosts event',
  plays_in: 'has match',
  links_to: 'connected to'
};

/** Node types a multi-hop reach may pass THROUGH. Leaf types never relay. */
const hubTypes = new Set<GraphNodeType>([
'film',
'series',
'universe',
'character',
'creator',
'artist',
'show',
'world',
'topic']
);

interface GraphStore {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  byHref: Map<string, string>;
  adjacency: Map<string, GraphEdge[]>;
}

let store: GraphStore | null = null;

const bare = (handle: string) => handle.replace(/^@/, '').toLowerCase();
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function normaliseHref(href: string): string {
  const path = href.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return path.replace(/^\/creator\/@/, '/creator/').toLowerCase();
}

function build(): GraphStore {
  // Catalogue plus every public, live title published from Studio.
  const titles = [...catalogTitles, ...releaseRegistry.discoverableTitles()];
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const byHref = new Map<string, string>();
  const pairs = new Set<string>();

  const add = (node: GraphNode) => {
    if (nodes.has(node.id)) return;
    nodes.set(node.id, node);
    const key = normaliseHref(node.href);
    // First registrant owns a shared destination (e.g. several teams → /sports).
    if (!byHref.has(key)) byHref.set(key, node.id);
  };
  const alias = (href: string, id: string) => {
    if (nodes.has(id)) byHref.set(normaliseHref(href), id);
  };
  const resolve = (href?: string) => href ? byHref.get(normaliseHref(href)) : undefined;
  const link = (from: string | undefined, to: string | undefined, relation: GraphRelation, source: string) => {
    if (!from || !to || from === to || !nodes.has(from) || !nodes.has(to)) return;
    const pair = [from, to].sort().join('|');
    // One edge per pair: the first, most specific assertion wins.
    if (pairs.has(pair)) return;
    pairs.add(pair);
    edges.push({ from, to, relation, source });
  };
  const linkHref = (from: string, href: string | undefined, relation: GraphRelation, source: string) =>
  link(from, resolve(href), relation, source);
  const linkHrefInto = (href: string | undefined, to: string, relation: GraphRelation, source: string) =>
  link(resolve(href), to, relation, source);

  /* ------------------------------ nodes ------------------------------ */

  for (const t of titles) {
    const availability = availabilityBySlug[t.slug];
    add({
      id: `${t.kind === 'Series' ? 'series' : 'film'}:${t.slug}`,
      type: t.kind === 'Series' ? 'series' : 'film',
      ref: t.slug,
      label: t.name,
      subtitle: `${t.kind} · ${t.genre} · ${t.year}`,
      image: t.poster,
      href: `/title/${t.slug}`,
      keywords: [t.genre, t.kind, t.creator, ...t.languages, t.logline],
      availability: availability && availability.state !== 'available' ? availability.label : undefined
    });
    const handle = bare(t.creatorHandle);
    add({
      id: `creator:${handle}`,
      type: 'creator',
      ref: handle,
      label: t.creator,
      subtitle: 'Creator',
      image: undefined,
      href: `/creator/${handle}`,
      keywords: [t.creatorHandle]
    });
  }

  for (const s of creatorStores) {
    const creatorId = `creator:${bare(s.handle)}`;
    const creator = nodes.get(creatorId);
    if (creator && !creator.image) nodes.set(creatorId, { ...creator, image: s.avatar, subtitle: `Creator · ${s.disciplines}` });
    add({
      id: `store:${s.id}`,
      type: 'store',
      ref: s.id,
      label: s.name,
      subtitle: `Creator store · ${s.disciplines}`,
      image: s.avatar,
      href: `/market/store/${s.id}`,
      keywords: [s.handle, s.bio]
    });
  }

  for (const h of hosts) {
    add({
      id: `creator:host-${h.id}`,
      type: 'creator',
      ref: h.id,
      label: h.name,
      subtitle: `Podcast host · ${h.city}`,
      image: h.avatar,
      href: `/podcast/creator/${h.id}`,
      keywords: [h.handle, h.roles, h.city, h.country]
    });
  }

  for (const a of artists) {
    add({
      id: `artist:${a.id}`,
      type: 'artist',
      ref: a.id,
      label: a.name,
      subtitle: `Artist · ${a.city}, ${a.country}`,
      image: a.avatar,
      href: `/music/artist/${a.id}`,
      keywords: [a.handle, a.disciplines, a.city, a.country, a.tagline]
    });
  }

  for (const p of people) {
    // A member who IS a creator already in the graph is the same entity:
    // their profile route resolves to that creator instead of a duplicate.
    const creatorId = `creator:${bare(p.handle)}`;
    if (nodes.has(creatorId)) {
      const creator = nodes.get(creatorId)!;
      if (!creator.image) nodes.set(creatorId, { ...creator, image: p.avatar });
      alias(`/people/${p.id}`, creatorId);
      continue;
    }
    add({
      id: `person:${p.id}`,
      type: 'person',
      ref: p.id,
      label: p.name,
      subtitle: `${p.role} · ${p.followers} followers`,
      image: p.avatar,
      href: `/people/${p.id}`,
      keywords: [p.handle, p.focus, p.bio]
    });
  }

  for (const u of seedUniverses) {
    add({
      id: `universe:${u.id}`,
      type: 'universe',
      ref: u.id,
      label: u.name,
      subtitle: `Universe · ${u.members} members`,
      image: u.image,
      href: `/universes/${u.id}`,
      keywords: [u.description],
      origin: 'official'
    });
  }
  for (const u of commerceUniverses) {
    if (nodes.has(`universe:${u.id}`)) {
      alias(`/market/universe/${u.id}`, `universe:${u.id}`);
      continue;
    }
    add({
      id: `universe:${u.id}`,
      type: 'universe',
      ref: u.id,
      label: u.name,
      subtitle: `Universe · ${u.kindLine}`,
      image: u.image,
      href: u.universeTo,
      keywords: [u.tagline, u.kindLine],
      origin: 'official'
    });
    alias(`/market/universe/${u.id}`, `universe:${u.id}`);
  }

  for (const c of seedCharacters) {
    add({
      id: `character:${c.id}`,
      type: 'character',
      ref: c.id,
      label: c.name,
      subtitle: c.role,
      image: c.image,
      href: `/characters/${c.id}`,
      keywords: [c.bio, ...c.quotes],
      origin: 'official'
    });
  }

  for (const w of musicWorlds) {
    add({
      id: `world:m-${w.id}`,
      type: 'world',
      ref: w.id,
      label: w.name,
      subtitle: `Music world · ${w.city}`,
      image: w.image,
      href: `/music/world/${w.id}`,
      keywords: [w.city, w.blurb]
    });
  }
  for (const w of podcastWorlds) {
    add({
      id: `world:p-${w.id}`,
      type: 'world',
      ref: w.id,
      label: w.name,
      subtitle: `Conversation world · ${w.strapline}`,
      image: w.image,
      href: `/podcast/world/${w.id}`,
      keywords: [w.blurb, w.strapline]
    });
  }
  for (const t of topics) {
    add({
      id: `topic:${t.id}`,
      type: 'topic',
      ref: t.id,
      label: t.label,
      subtitle: `Topic · ${t.followers} following`,
      href: `/podcast/topic/${t.id}`,
      keywords: []
    });
  }

  for (const c of recommendedCommunities) {
    add({
      id: `community:${c.slug}`,
      type: 'community',
      ref: c.slug,
      label: c.name,
      subtitle: `Community · ${c.members} members`,
      image: c.image,
      href: `/community/${c.slug}`,
      keywords: [c.anchorLabel, c.description, ...c.categories]
    });
  }

  for (const t of tracks) {
    const artist = artists.find((a) => a.id === t.artistId);
    add({
      id: `track:${t.id}`,
      type: 'track',
      ref: t.id,
      label: t.title,
      subtitle: `${t.releaseKind} · ${artist?.name ?? 'Unknown artist'}`,
      image: t.artwork,
      href: `/music/track/${t.id}`,
      keywords: [t.language, t.releaseKind, artist?.name ?? '', ...(t.featuring ?? [])]
    });
  }

  for (const s of shows) {
    add({
      id: `show:${s.id}`,
      type: 'show',
      ref: s.id,
      label: s.title,
      subtitle: `Podcast · ${s.episodeCount} episodes`,
      image: s.artwork,
      href: `/podcast/show/${s.id}`,
      keywords: [s.tagline, s.about, s.origin]
    });
  }
  for (const e of episodes) {
    const show = shows.find((s) => s.id === e.showId);
    add({
      id: `episode:${e.id}`,
      type: 'episode',
      ref: e.id,
      label: e.title,
      subtitle: `${show?.title ?? 'Podcast'} · S${e.season} E${e.number}`,
      image: e.artwork,
      href: `/podcast/episode/${e.id}`,
      keywords: [e.summary]
    });
  }

  for (const s of shorts) {
    add({
      id: `short:${s.slug}`,
      type: 'short',
      ref: s.slug,
      label: s.caption,
      subtitle: `Short · ${s.creator.name}`,
      image: s.poster,
      href: `/shorts/${s.slug}`,
      keywords: [...s.hashtags, s.story]
    });
  }

  for (const f of fixtures) {
    add({
      id: `match:${f.id}`,
      type: 'match',
      ref: f.id,
      label: `${f.homeTeam} vs ${f.awayTeam}`,
      subtitle: `${f.competition} · ${f.isLive ? `Live ${f.clock ?? ''}`.trim() : f.kickoff}`,
      image: f.image,
      href: '/sports',
      keywords: [f.competition]
    });
    for (const team of [f.homeTeam, f.awayTeam]) {
      add({
        id: `team:${slugify(team)}`,
        type: 'team',
        ref: slugify(team),
        label: team,
        subtitle: `Team · ${f.competition}`,
        href: '/sports',
        keywords: [f.competition]
      });
    }
  }

  for (const d of seedDiscussions) {
    const community = recommendedCommunities.find((c) => c.slug === d.communitySlug);
    add({
      id: `discussion:${d.id}`,
      type: 'discussion',
      ref: d.id,
      label: d.title,
      subtitle: `${d.kind} · ${community?.name ?? 'Community'} · ${d.replies.length} replies`,
      href: `/discussions/${d.id}`,
      keywords: [...d.tags, d.body]
    });
  }

  for (const f of seedFanCreations) {
    add({
      id: `fan-creation:${f.id}`,
      type: 'fan-creation',
      ref: f.id,
      label: f.title,
      subtitle: `${f.kind} · fan creation`,
      image: f.image,
      href: `/fan-creations/${f.id}`,
      keywords: [f.kind, f.body],
      origin: 'fan'
    });
  }

  for (const e of seedEvents) {
    add({
      id: `event:${e.id}`,
      type: 'event',
      ref: e.id,
      label: e.name,
      subtitle: `${e.kind} · ${e.state === 'live' ? 'Live now' : e.when}`,
      image: e.image,
      href: `/events/${e.id}`,
      keywords: [e.kind, e.description]
    });
  }
  for (const l of liveDates) {
    add({
      id: `event:m-${l.id}`,
      type: 'event',
      ref: l.id,
      label: l.title,
      subtitle: `${l.kind} · ${l.venue}, ${l.city} · ${l.date}`,
      image: l.image,
      href: `/music/live/${l.id}`,
      keywords: [l.kind, l.city, l.venue]
    });
  }
  for (const l of liveConversations) {
    add({
      id: `event:p-${l.id}`,
      type: 'event',
      ref: l.id,
      label: l.title,
      subtitle: `${l.kind} · ${l.city} · ${l.status === 'live' ? 'Live now' : l.date}`,
      image: l.image,
      href: `/podcast/live/${l.id}`,
      keywords: [l.kind, l.city, l.venue]
    });
  }

  for (const p of marketProducts) {
    add({
      id: `product:${p.id}`,
      type: 'product',
      ref: p.id,
      label: p.name,
      subtitle: `${p.category} · ${p.currency}${p.price.toLocaleString('en-NG')}`,
      image: p.image,
      href: `/market/product/${p.id}`,
      keywords: [p.category, p.blurb, p.provenance.content.value, p.provenance.universe.value]
    });
  }

  // Characters defined only on a title record (and not held back as spoilers).
  for (const t of titles) {
    for (const c of experienceFor(t).characters) {
      if (c.spoiler || !c.appearsIn.includes(t.slug) || nodes.has(`character:${c.id}`)) continue;
      add({
        id: `character:${c.id}`,
        type: 'character',
        ref: c.id,
        label: c.name,
        subtitle: c.role,
        image: c.image,
        href: c.to ?? `/title/${t.slug}`,
        keywords: [c.bio],
        origin: 'official'
      });
    }
  }

  /* ------------------------------ edges ------------------------------ */

  for (const t of titles) {
    const id = `${t.kind === 'Series' ? 'series' : 'film'}:${t.slug}`;
    link(id, `creator:${bare(t.creatorHandle)}`, 'created_by', 'catalog.creatorHandle');
    const exp = experienceFor(t);
    for (const c of exp.characters) {
      if (c.spoiler || !c.appearsIn.includes(t.slug)) continue;
      link(id, `character:${c.id}`, 'features', 'titleHub.characters');
    }
    if (exp.universe) link(id, `universe:${exp.universe.id}`, 'part_of', 'titleHub.universe');
    if (exp.soundtrack) linkHrefInto(exp.soundtrack.to, id, 'soundtrack_of', 'titleHub.soundtrack');
    link(`community:${t.slug}`, id, 'community_for', 'titleHub.community');
  }

  for (const c of seedCharacters) {
    const id = `character:${c.id}`;
    link(id, `universe:${c.universeId}`, 'part_of', 'character.universeId');
    for (const a of c.appearsIn) linkHrefInto(a.to, id, 'features', 'character.appearsIn');
    for (const r of c.relationships) linkHref(id, r.to, 'links_to', 'character.relationships');
  }

  for (const u of seedUniverses) {
    const id = `universe:${u.id}`;
    link(`community:${u.communitySlug}`, id, 'community_for', 'universe.communitySlug');
    for (const n of u.nodes) linkHrefInto(n.to, id, 'part_of', 'universe.nodes');
  }
  for (const u of commerceUniverses) {
    const id = `universe:${u.id}`;
    linkHrefInto(u.watchTo, id, 'part_of', 'commerceUniverse.watchTo');
    linkHrefInto(u.communityTo, id, 'community_for', 'commerceUniverse.communityTo');
  }

  for (const s of creatorStores) {
    link(`store:${s.id}`, `creator:${bare(s.handle)}`, 'created_by', 'creatorStore.handle');
    for (const u of s.universeIds) link(`store:${s.id}`, `universe:${u}`, 'links_to', 'creatorStore.universeIds');
  }

  for (const p of marketProducts) {
    const id = `product:${p.id}`;
    if (p.provenance.ip) linkHref(id, p.provenance.ip.to, 'merch_of', 'product.provenance.ip');
    linkHref(id, p.provenance.content.to, 'merch_of', 'product.provenance.content');
    link(id, `universe:${p.universeId}`, 'merch_of', 'product.universeId');
    link(id, `store:${p.creatorId}`, 'sold_by', 'product.creatorId');
  }

  for (const a of artists) {
    const id = `artist:${a.id}`;
    if (a.communitySlug) link(`community:${a.communitySlug}`, id, 'community_for', 'artist.communitySlug');
    link(id, `creator:${bare(a.handle)}`, 'links_to', 'artist.handle');
  }

  for (const t of tracks) {
    const id = `track:${t.id}`;
    link(id, `artist:${t.artistId}`, 'performed_by', 'track.artistId');
    if (t.story) linkHref(id, t.story.to, 'soundtrack_of', 'track.story');
    link(id, `world:m-${t.worldId}`, 'in_world', 'track.worldId');
    for (const g of t.graph) linkHref(id, g.to, 'links_to', 'track.graph');
  }
  for (const w of musicWorlds) {
    linkHrefInto(w.communityTo, `world:m-${w.id}`, 'community_for', 'musicWorld.communityTo');
    for (const trackId of w.trackIds) link(`track:${trackId}`, `world:m-${w.id}`, 'in_world', 'musicWorld.trackIds');
  }
  for (const l of liveDates) link(`event:m-${l.id}`, `artist:${l.artistId}`, 'performed_by', 'liveDate.artistId');

  for (const s of shows) {
    const id = `show:${s.id}`;
    link(id, `creator:host-${s.hostId}`, 'hosted_by', 'show.hostId');
    for (const t of s.topicIds) link(id, `topic:${t}`, 'about', 'show.topicIds');
    link(`community:${s.communitySlug}`, id, 'community_for', 'show.communitySlug');
  }
  for (const w of podcastWorlds) {
    for (const showId of w.showIds) link(`show:${showId}`, `world:p-${w.id}`, 'in_world', 'podcastWorld.showIds');
  }
  for (const t of topics) link(`topic:${t.id}`, `world:p-${t.worldId}`, 'in_world', 'topic.worldId');
  for (const e of episodes) {
    const id = `episode:${e.id}`;
    link(id, `show:${e.showId}`, 'episode_of', 'episode.showId');
    for (const t of e.topicIds) link(id, `topic:${t}`, 'about', 'episode.topicIds');
    if (e.relatedStory) linkHref(id, e.relatedStory.to, 'about', 'episode.relatedStory');
    for (const g of e.graph) linkHref(id, g.to, 'links_to', 'episode.graph');
  }
  for (const l of liveConversations) link(`event:p-${l.id}`, `show:${l.showId}`, 'event_of', 'liveConversation.showId');

  const shortRelation: Record<string, GraphRelation> = {
    title: 'clip_of',
    character: 'features',
    music: 'uses_track',
    universe: 'part_of',
    creator: 'created_by'
  };
  for (const s of shorts) {
    const id = `short:${s.slug}`;
    linkHref(id, s.creator.to, 'created_by', 'short.creator');
    if (s.music) link(id, `track:${s.music.trackId}`, 'uses_track', 'short.music');
    for (const g of s.graph) linkHref(id, g.to, shortRelation[g.kind] ?? 'links_to', 'short.graph');
    if (s.community) linkHrefInto(s.community.to, id, 'community_for', 'short.community');
    for (const p of s.products) linkHrefInto(p.to, id, 'links_to', 'short.products');
  }

  for (const f of fixtures) {
    link(`team:${slugify(f.homeTeam)}`, `match:${f.id}`, 'plays_in', 'fixture.homeTeam');
    link(`team:${slugify(f.awayTeam)}`, `match:${f.id}`, 'plays_in', 'fixture.awayTeam');
  }

  for (const d of seedDiscussions) {
    const id = `discussion:${d.id}`;
    link(id, `community:${d.communitySlug}`, 'posted_in', 'discussion.communitySlug');
    linkHref(id, `/people/${d.authorId}`, 'authored_by', 'discussion.authorId');
  }
  for (const f of seedFanCreations) {
    const id = `fan-creation:${f.id}`;
    link(id, `universe:${f.universeId}`, 'fan_work_of', 'fanCreation.universeId');
    link(id, `community:${f.communitySlug}`, 'posted_in', 'fanCreation.communitySlug');
    linkHref(id, `/people/${f.authorId}`, 'authored_by', 'fanCreation.authorId');
  }
  for (const e of seedEvents) {
    const id = `event:${e.id}`;
    link(id, `community:${e.communitySlug}`, 'event_of', 'event.communitySlug');
    linkHref(id, `/people/${e.hostId}`, 'hosted_by', 'event.hostId');
    if (e.relatedContentSlug) linkHref(id, `/title/${e.relatedContentSlug}`, 'links_to', 'event.relatedContentSlug');
  }

  const adjacency = new Map<string, GraphEdge[]>();
  for (const e of edges) {
    adjacency.set(e.from, [...(adjacency.get(e.from) ?? []), e]);
    adjacency.set(e.to, [...(adjacency.get(e.to) ?? []), e]);
  }

  return { nodes, edges, byHref, adjacency };
}

let builtAtRevision = -1;

/** Rebuilt when a release is published — the graph update step of publishing. */
function graph(): GraphStore {
  if (!store || builtAtRevision !== releaseRegistry.revision()) {
    store = build();
    builtAtRevision = releaseRegistry.revision();
  }
  return store;
}

/** Phrase for `node` relative to the other end of `edge`. */
function phraseFor(edge: GraphEdge, nodeId: string): string {
  return edge.from === nodeId ? forwardPhrase[edge.relation] : inversePhrase[edge.relation];
}

function getNode(id: string): GraphNode | null {
  return graph().nodes.get(id) ?? null;
}

function resolveHref(href: string): GraphNode | null {
  const id = graph().byHref.get(normaliseHref(href));
  return id ? getNode(id) : null;
}

function allNodes(): GraphNode[] {
  return [...graph().nodes.values()];
}

function neighbours(id: string): Neighbour[] {
  const g = graph();
  return (g.adjacency.get(id) ?? []).flatMap((edge): Neighbour[] => {
    const otherId = edge.from === id ? edge.to : edge.from;
    const node = g.nodes.get(otherId);
    return node ? [{ node, relation: edge.relation, phrase: phraseFor(edge, otherId) }] : [];
  });
}

/**
 * Breadth-first reach from an anchor to nodes of the target types, relaying
 * only through hub nodes (works, universes, characters, creators…). Returns
 * each reached node once, with the shortest path that explains it.
 */
function reach(
anchorId: string,
targetTypes: GraphNodeType[] | null,
maxHops = 2)
: {node: GraphNode;path: GraphStep[];}[] {
  const g = graph();
  const seen = new Set<string>([anchorId]);
  const results: {node: GraphNode;path: GraphStep[];}[] = [];
  let frontier: {id: string;path: GraphStep[];}[] = [{ id: anchorId, path: [] }];

  for (let hop = 1; hop <= maxHops && frontier.length > 0; hop++) {
    const next: {id: string;path: GraphStep[];}[] = [];
    for (const { id, path } of frontier) {
      for (const edge of g.adjacency.get(id) ?? []) {
        const otherId = edge.from === id ? edge.to : edge.from;
        if (seen.has(otherId)) continue;
        const node = g.nodes.get(otherId);
        if (!node) continue;
        seen.add(otherId);
        const step: GraphStep = { node, phrase: phraseFor(edge, otherId) };
        const nextPath = [...path, step];
        if (!targetTypes || targetTypes.includes(node.type)) results.push({ node, path: nextPath });
        if (hubTypes.has(node.type)) next.push({ id: otherId, path: nextPath });
      }
    }
    frontier = next;
  }
  return results;
}

/** "soundtrack of The Last Train" / "from Amara · appears in The Last Train" */
function explainPath(anchor: GraphNode, path: GraphStep[]): string {
  const parts: string[] = [];
  for (let i = path.length - 1; i >= 0; i--) {
    const previous = i === 0 ? anchor : path[i - 1].node;
    parts.push(`${path[i].phrase} ${previous.label}`);
  }
  return parts.join(' · ');
}

function stats(): {nodes: number;edges: number;} {
  const g = graph();
  return { nodes: g.nodes.size, edges: g.edges.length };
}

export const contentGraph = {
  getNode,
  resolveHref,
  allNodes,
  neighbours,
  reach,
  explainPath,
  stats
};