/**
 * USER LIBRARY — Slice 2 of the User-Side Completion Program.
 *
 * The Library is a PROJECTION, not a store. Every shelf is read from the
 * service that already owns that state (watch, title, music, podcast, shorts,
 * community, commerce, director, app). Removing something from the Library
 * calls that owning service — there is never a second copy to drift.
 */

export type ShelfId =
'continue' |
'watchlist' |
'favourites' |
'history' |
'music' |
'podcasts' |
'saved' |
'creators' |
'communities' |
'purchased' |
'downloads' |
'creations';

export type LibraryItemKind =
'title' |
'track' |
'episode' |
'show' |
'short' |
'discussion' |
'fan-creation' |
'creator' |
'community' |
'product' |
'edition' |
'project';

export interface LibraryItem {
  /** `<shelf>:<kind>:<id>` — unique across the whole Library. */
  key: string;
  shelf: ShelfId;
  kind: LibraryItemKind;
  /** Id inside the owning service. */
  refId: string;
  title: string;
  subtitle: string;
  image?: string;
  href: string;
  /** 0–100 where the owning service tracks progress. */
  progress?: number;
  /** Short status line, e.g. "Finished", "Downloading 42%". */
  status?: string;
  /** Epoch ms, when the owning service records it. */
  at?: number;
  /** Whether the owning service supports removing it from here. */
  removable: boolean;
  removeLabel?: string;
}

export interface ShelfDefinition {
  id: ShelfId;
  label: string;
  description: string;
  /** Where to go to put something on an empty shelf. */
  emptyAction: {label: string;to: string;};
  emptyBody: string;
  /** Owning service, stated so the projection stays honest. */
  source: string;
}

export interface LibraryShelf extends ShelfDefinition {
  items: LibraryItem[];
}