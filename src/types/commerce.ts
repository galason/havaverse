/* -------------------------------------------------------------------------- *
 * HavaVerse Market — commerce entities
 * -------------------------------------------------------------------------- *
 * Commerce sits DOWNSTREAM of the content graph. A product is never a
 * free-floating SKU: it always resolves back through an IP, a work and the
 * creator who made it. That chain is modelled explicitly here because it is
 * what the interface shows the buyer, and what HavaPay settles against.
 *
 *   CREATOR → CONTENT → CHARACTER / IP → PRODUCT → AUDIENCE → CREATOR REVENUE
 * -------------------------------------------------------------------------- */

/** What the buyer is actually doing. Not every transaction is "add to bag". */
export type CommerceAction =
'buy' // physical goods
| 'collect' // digital editions, limited art, character cards
| 'watch' // paid or premium content access
| 'ticket' // events, premieres, matches
| 'experience' // set visits, workshops, creator sessions
| 'support' // tips, memberships, direct creator support
| 'unlock' // access granted by something already owned
| 'preorder'; // not released yet

export type ProductCategory =
'Merchandise' |
'Digital' |
'Tickets' |
'Collectibles' |
'Experiences' |
'Creator products';

export type StockState = 'in-stock' | 'low' | 'sold-out' | 'pre-order' | 'unreleased';

/** The visible provenance chain. Every link is a real destination in the app. */
export interface ProvenanceLink {
  label: string;
  value: string;
  to: string;
}

export interface Provenance {
  creator: ProvenanceLink;
  content: ProvenanceLink;
  /** Present when the product is tied to a specific character or IP asset. */
  ip?: ProvenanceLink;
  universe: ProvenanceLink;
  community?: ProvenanceLink;
}

/** How the money splits. Shown plainly, without exposing the whole ledger. */
export interface RevenueSplit {
  creator: number;
  rightsHolder: number;
  platform: number;
}

export interface MarketProduct {
  id: string;
  name: string;
  blurb: string;
  category: ProductCategory;
  action: CommerceAction;
  price: number;
  /** Currency is Naira platform-wide in this build. */
  currency: '₦';
  image: string;
  universeId: string;
  creatorId: string;
  stock: StockState;
  /** Remaining/total, present only on limited runs. */
  edition?: {remaining: number;total: number;};
  provenance: Provenance;
  split: RevenueSplit;
  /** What ownership unlocks elsewhere in HavaVerse. */
  unlocks?: string[];
  releasesAt?: string;
}

export type DropState = 'live' | 'soon' | 'sold-out';

export interface Drop {
  id: string;
  productId: string;
  state: DropState;
  label: string;
  /** Seconds remaining while live; used for the countdown. */
  endsInSeconds?: number;
  opensAt?: string;
}

/** A bundle that creates an ongoing relationship with an IP, not a one-off sale. */
export interface HavaPass {
  id: string;
  name: string;
  universeId: string;
  price: number;
  tagline: string;
  includes: string[];
  image: string;
  holders: string;
}

export interface CommerceUniverse {
  id: string;
  name: string;
  tagline: string;
  kindLine: string;
  image: string;
  /** Routes into the rest of HavaVerse from the store. */
  watchTo: string;
  communityTo: string;
  universeTo: string;
  counts: {products: number;collectibles: number;experiences: number;};
}

export interface CreatorStore {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  cover: string;
  disciplines: string;
  supporters: string;
  verified: boolean;
  bio: string;
  universeIds: string[];
}

export type CollectionKind = 'Digital' | 'Physical' | 'Ticket' | 'Membership' | 'Experience';

export interface CollectionEntry {
  productId: string;
  kind: CollectionKind;
  acquired: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
}