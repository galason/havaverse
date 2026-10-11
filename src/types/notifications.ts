/**
 * Notification contract shared by the inbox, the header menu, Settings and
 * every service that raises a notification. The notification service owns
 * all of it; the client only reads and records read state.
 */

export type NotificationCategory =
'social' |
'creator' |
'economy' |
'commerce' |
'live' |
'security' |
'system';

export type NotificationChannel = 'in-app' | 'push' | 'email' | 'sms';

/**
 * What happened on each channel for one notification.
 * - delivered: shown in the in-app inbox
 * - queued: handed to the delivery service, not yet confirmed sent
 * - off: you turned this channel off for this category
 * - unavailable: this channel is not offered for this category
 */
export type DeliveryStatus = 'delivered' | 'queued' | 'off' | 'unavailable';

export interface AppNotification {
  id: string;
  kind: NotificationCategory;
  title: string;
  body: string;
  /** Epoch ms. Relative labels ("2 min ago") are derived, never stored. */
  createdAt: number;
  to: string;
  image?: string;
  read: boolean;
  delivery: Partial<Record<NotificationChannel, DeliveryStatus>>;
}

export type NotificationPreferences = Record<NotificationCategory, Record<NotificationChannel, boolean>>;

export interface CategoryMeta {
  id: NotificationCategory;
  label: string;
  description: string;
  /** Channels that cannot be turned off for this category. */
  locked: NotificationChannel[];
  /** Channels not offered for this category at all. */
  unavailable: NotificationChannel[];
}