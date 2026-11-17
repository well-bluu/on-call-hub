import { ChevronRight } from "lucide-react";
import { KIND_STYLES } from "@/lib/notifications/constants";
import type { Notification } from "@/lib/notifications/types";

// ==========================================
// NOTIFICATION ITEM
// ==========================================
// Renders ONE notification row.
//
// BACKEND: Every field shown here comes from the `Notification` object
// passed in as a prop:
//   - notification.kind        -> icon + color
//   - notification.title       -> bold headline
//   - notification.description -> detail line
//   - notification.timeAgo     -> timestamp on the right
//   - notification.read        -> unread dot + "Mark as Read" button
//   - notification.href        -> (optional) not wired up yet; add a link
//                                 here if rows should navigate somewhere
// No data needs to be inserted in this file directly.

export function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  const { icon: Icon, tile, iconColor } = KIND_STYLES[notification.kind];

  return (
    <li
      className="
      flex items-start gap-4
      px-4 py-4

      sm:gap-5 sm:px-6 sm:py-6
    "
    >
      {/* NOTIFICATION ICON */}

      <div
        className={`
          flex size-11 shrink-0
          items-center justify-center
          rounded-lg

          sm:size-14

          ${tile}
        `}
      >
        <Icon
          className={`size-6 sm:size-8 ${iconColor}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </div>

      {/* NOTIFICATION DETAILS */}

      <div className="min-w-0 flex-1">
        {/* TITLE (BACKEND: notification.title) */}

        <h3
          className="
          text-sm font-bold
          uppercase leading-tight
          text-slate-900

          sm:text-lg
        "
        >
          {notification.title}
        </h3>

        {/* DESCRIPTION (BACKEND: notification.description) */}

        <p
          className="
          mt-1 text-xs uppercase
          leading-relaxed text-slate-800

          sm:text-sm
        "
        >
          {notification.description}
        </p>

        {/* MARK AS READ (only for unread items) */}

        {!notification.read && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            className="
              mt-2 inline-flex
              items-center gap-0.5
              text-xs font-semibold
              text-blue-700 hover:underline

              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-blue-700

              sm:text-sm
            "
          >
            Mark as Read
            <ChevronRight className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {/* TIMESTAMP + UNREAD INDICATOR */}

      <div
        className="
        flex shrink-0
        items-center gap-4
        pt-0.5

        sm:pt-1
      "
      >
        {/* BACKEND: notification.timeAgo (see note in types.ts) */}
        <span
          className="
          whitespace-nowrap
          text-[10px] text-slate-400

          sm:text-sm
        "
        >
          {notification.timeAgo}
        </span>

        <span className="flex size-3.5 shrink-0 items-center justify-center">
          {!notification.read && (
            <>
              <span className="size-3.5 rounded-full bg-blue-600" aria-hidden />
              <span className="sr-only">Unread</span>
            </>
          )}
        </span>
      </div>
    </li>
  );
}
