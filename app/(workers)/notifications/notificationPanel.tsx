"use client";

import { useMemo, useState } from "react";
import { NotificationItem } from "./notificationItem";
import { NotificationTabs } from "./notificationTabs";
import type { Notification, NotificationFilter } from "./types";

function matchesFilter(n: Notification, filter: NotificationFilter) {
  switch (filter) {
    case "all":
      return true;
    case "unread":
      return !n.read;
    case "read":
      return n.read;
    default:
      return n.category === filter;
  }
}

export function NotificationsPanel({ initial }: { initial: Notification[] }) {
  const [notifications, setNotifications] = useState(initial);
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const visible = useMemo(
    () => notifications.filter((n) => matchesFilter(n, filter)),
    [notifications, filter],
  );

  const hasUnread = notifications.some((n) => !n.read);

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <section className="flex min-w-0 flex-col gap-4">
      {/* Mobile: tabs on one row, buttons on the next. sm+: single row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <NotificationTabs active={filter} onChange={setFilter} />

        <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:gap-3">
          <button
            onClick={markAllAsRead}
            disabled={!hasUnread}
            className="rounded-full border border-blue-700 px-2 py-2 text-xs font-semibold uppercase text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:px-4 sm:py-1.5 sm:text-sm"
          >
            Mark all as read
          </button>
          <button className="rounded-full bg-blue-700 px-2 py-2 text-xs font-semibold uppercase text-white transition-colors hover:bg-blue-800 sm:px-5 sm:py-1.5 sm:text-sm">
            View all
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {visible.length > 0 ? (
          <ul className="divide-y divide-slate-200">
            {visible.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </ul>
        ) : (
          <p className="px-4 py-12 text-center text-sm text-slate-500 sm:px-6 sm:py-16">
            No notifications in this view.
          </p>
        )}
      </div>
    </section>
  );
}
