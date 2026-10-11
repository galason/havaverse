/**
 * HavaVerse Content Graph — the one canonical model of what exists and how it
 * connects.
 *
 * Every domain (Watch, Title, Shorts, Music, Podcast, Community, Market,
 * Sports) used to carry its own little graph: a `graph` array of links on a
 * track, an episode, a Short; a provenance chain on a product; `appearsIn` on a
 * character. Those are now PROJECTIONS. `services/contentGraph.ts` ingests all
 * of them into one set of typed nodes and typed edges, so a relationship only
 * has to be true in one place for Search, the Library and every rail to agree.
 *
 * Node ids are `<type>:<ref>` where `ref` is the domain id or slug, so a node
 * can always be traced back to the record that owns it.
 */

export type GraphNodeType =
'film' |
'series' |
'short' |
'track' |
'artist' |
'show' |
'episode' |
'match' |
'team' |
'creator' |
'person' |
'character' |
'universe' |
'world' |
'topic' |
'community' |
'discussion' |
'fan-creation' |
'event' |
'product' |
'store';

export interface GraphNode {
  /** `<type>:<ref>` */
  id: string;
  type: GraphNodeType;
  /** The owning domain's id or slug. */
  ref: string;
  label: string;
  subtitle: string;
  image?: string;
  /** The in-app destination. Every node is a real page. */
  href: string;
  /** Extra words this node should be findable by (genre, city, language, tags). */
  keywords: string[];
  /** Official canon vs fan-made. Only set where the distinction applies. */
  origin?: 'official' | 'fan';
  /** A rights or availability note to show instead of implying it can be opened. */
  availability?: string;
}

export type GraphRelation =
'created_by' |
'features' |
'part_of' |
'soundtrack_of' |
'performed_by' |
'episode_of' |
'hosted_by' |
'about' |
'in_world' |
'community_for' |
'posted_in' |
'authored_by' |
'fan_work_of' |
'merch_of' |
'sold_by' |
'clip_of' |
'uses_track' |
'event_of' |
'plays_in' |
'links_to';

export interface GraphEdge {
  from: string;
  to: string;
  relation: GraphRelation;
  /** Which domain record asserted this edge. Useful when a projection disagrees. */
  source: string;
}

/** One step of a path, described from the perspective of the node it leads to. */
export interface GraphStep {
  node: GraphNode;
  /** e.g. "soundtrack of", "appears in" — reads "<result> <phrase> <node>". */
  phrase: string;
}

export interface Neighbour {
  node: GraphNode;
  relation: GraphRelation;
  /** Human phrase relative to the anchor, e.g. "has soundtrack", "appears in". */
  phrase: string;
}