/**
 * The single user-side analytics contract. Every module emits these names and
 * nothing else, so the platform event system receives one vocabulary.
 */
export type PlatformEventName =
'content_viewed' |
'content_started' |
'content_completed' |
'content_saved' |
'content_unsaved' |
'content_reacted' |
'content_shared' |
'creator_followed' |
'community_joined' |
'comment_created' |
'support_started' |
'support_completed' |
'purchase_started' |
'purchase_completed' |
'search_performed' |
'recommendation_impression' |
'recommendation_clicked' |
'studio_project_created' |
'generation_started' |
'generation_completed' |
'publish_started' |
'publish_completed' |
'payout_requested' |
'reminder_set';

export type PlatformModule =
'watch' |
'title' |
'shorts' |
'search' |
'library' |
'community' |
'market' |
'music' |
'podcast' |
'studio' |
'home' |
'economy' |
'live';

export interface PlatformEvent {
  id: string;
  name: PlatformEventName;
  module: PlatformModule;
  /** Content graph node id when the event concerns an object, e.g. `film:the-last-train`. */
  subject?: string;
  /** Small, non-personal properties. Never free text the user typed, except search queries. */
  props?: Record<string, string | number | boolean>;
  at: number;
}