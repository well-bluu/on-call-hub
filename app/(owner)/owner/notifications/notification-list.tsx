import { NotificationItem } from "./notification-item";
import type { Notification } from "@/lib/notifications/types";

// ==========================================
// NOTIFICATION LIST
// ==========================================
// Renders the card containing all visible notifications, or the empty state.
//
// BACKEND: `notifications` is the already-filtered, already-paginated
// array from `useNotifications()`. Add a loading skeleton / error state
// here if the API call needs one.

export function NotificationList({
  notifications,
  onMarkAsRead,
}: {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}) {
  return (
    <section
      className="
      overflow-hidden rounded-xl
      border border-border
      bg-white
      shadow-[0_2px_6px_rgba(0,0,0,0.12)]
    "
    >
      {notifications.length === 0 ? (
        <p className="px-4 py-10 text-center text-xs text-slate-500 sm:px-6 sm:py-12 sm:text-sm">
          No notifications to show.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
