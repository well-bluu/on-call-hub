export type NotificationKind = "offer" | "confirmed" | "reminder" | "declined";
export type NotificationCategory = "shifts" | "system";

export interface Notification {
  id: string;
  kind: NotificationKind;
  category: NotificationCategory;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  href?: string;
}

export type NotificationFilter =
  | "all"
  | "shifts"
  | "system"
  | "unread"
  | "read";
