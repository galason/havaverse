import { notificationsApi, type NotificationInput } from './notificationsApi';

/**
 * NOTIFICATION DELIVERY SEAM
 *
 * Services raise notifications here. In production this is the realtime
 * channel fed by the notification service (POST /api/notifications is
 * server-to-server, never the client). The notification service applies the
 * user's channel preferences before anything reaches the inbox.
 */

export type { NotificationInput };

export const notificationBus = {
  deliver(input: NotificationInput) {
    return notificationsApi.receive(input);
  }
};