import type { GraphNode, GraphNodeType } from './graph';

/**
 * HavaVerse Search contract.
 *
 * Search reads the Content Graph. A plain query ranks nodes by how well they
 * match; a relationship query ("music from The Last Train") is interpreted,
 * anchored to one node and answered by walking the graph — each result then
 * carries the path that explains why it is there.
 */

export interface SearchIntent {
  /** e.g. "Music connected to" — what Search understood you want. */
  understood: string;
  targetTypes: GraphNodeType[];
  /** The words the anchor was read from. */
  anchorText: string;
  /** The node the relationship was resolved against, or null when nothing matched. */
  anchor: GraphNode | null;
}

export interface SearchHit {
  node: GraphNode;
  score: number;
  /** Present on relationship results: why this node is connected. */
  path?: string;
}

export interface SearchGroup {
  type: GraphNodeType;
  hits: SearchHit[];
}

export interface SearchResponse {
  query: string;
  intent: SearchIntent | null;
  /** True when results came from walking the graph rather than text matching. */
  relational: boolean;
  top: SearchHit | null;
  groups: SearchGroup[];
  total: number;
}

export interface SearchSuggestion {
  node: GraphNode;
}