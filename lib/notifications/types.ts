// ==========================================
// NOTIFICATION TYPES
// ==========================================
// BACKEND: These types describe the shape the UI expects.
// Your API response should map to `Notification` (or add a mapper
// in `use-notifications.ts` that converts the DB row into this shape).

export type NotificationKind =
  | "accepted"
  | "declined"
  | "worker_added"
  | "shift_updated";

export type NotificationCategory = "worker_responses" | "shift_updates";

export type NotificationFilter =
  | "all"
  | "worker_responses"
  | "shift_updates"
  | "unread"
  | "read";

export interface Notification {
  /** BACKEND: unique notification ID (DB primary key, as a string). */
  id: string;

  /** BACKEND: controls which icon/color the UI shows. */
  kind: NotificationKind;

  /** BACKEND: controls which filter tab the notification appears under. */
  category: NotificationCategory;

  /** BACKEND: short headline, e.g. "Worker 1 accepted a shift". */
  title: string;

  /** BACKEND: detail line, e.g. "Reason: Personal leave." */
  description: string;

  /**
   * BACKEND: currently a pre-formatted string ("1 hour ago").
   * Recommended: send an ISO timestamp (createdAt) instead and format it
   * on the client (e.g. date-fns `formatDistanceToNow`).
   * If you do, update this type and the `NotificationItem` component.
   */
  timeAgo: string;

  /** BACKEND: whether the owner has already read this notification. */
  read: boolean;

  /** BACKEND (optional): link to the related shift/worker page. */
  href?: string;
}
