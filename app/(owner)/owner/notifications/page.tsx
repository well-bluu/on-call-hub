"use client";

import { useMemo, useState } from "react";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
} from "lucide-react";
import bannerImage from "@/components/assets/images/notification-banner.png";


type NotificationKind =
  | "accepted"
  | "declined"
  | "worker_added"
  | "shift_updated";
type NotificationCategory = "worker_responses" | "shift_updates";
type NotificationFilter =
  | "all"
  | "worker_responses"
  | "shift_updates"
  | "unread"
  | "read";

interface Notification {
  id: string;
  kind: NotificationKind;
  category: NotificationCategory;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  href?: string;
}

/* Placeholder data (replace with real data) */

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    kind: "accepted",
    category: "worker_responses",
    title: "Worker 1 accepted a shift",
    description: "Worker 1 accepted the shift scheduled for July 21, 2026",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "2",
    kind: "declined",
    category: "worker_responses",
    title: "Worker 2 declined a shift",
    description: "Reason: Personal leave.",
    timeAgo: "2 hours ago",
    read: false,
  },
  {
    id: "3",
    kind: "worker_added",
    category: "shift_updates",
    title: "New worker added",
    description: "Worker 3 has been added to your workforce.",
    timeAgo: "3 hours ago",
    read: false,
  },
  {
    id: "4",
    kind: "shift_updated",
    category: "shift_updates",
    title: "Shift updated",
    description: "Description",
    timeAgo: "5 hours ago",
    read: true,
  },
];

const PAGE_SIZE = 4;

const KIND_STYLES: Record<
  NotificationKind,
  { icon: typeof Bell; tile: string; iconColor: string }
> = {
  accepted: {
    icon: CircleCheck,
    tile: "bg-green-50",
    iconColor: "text-green-600",
  },
  declined: { icon: CircleX, tile: "bg-red-100", iconColor: "text-red-500" },
  worker_added: {
    icon: Bell,
    tile: "bg-orange-50",
    iconColor: "text-orange-400",
  },
  shift_updated: {
    icon: Calendar,
    tile: "bg-blue-50",
    iconColor: "text-blue-600",
  },
};

const TABS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "worker_responses", label: "Worker Responses" },
  { value: "shift_updates", label: "Shift Updates" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

/* Banner */

function Banner({ image }: { image: StaticImageData }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#D9D9D9] bg-cover bg-[position:40%_center] p-8"
      style={{ backgroundImage: `url(${image.src})` }}
    >
      <div className="max-w-lg">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[hsl(var(--dark-blue))]">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-[hsl(var(--dark-blue))]">
          View and manage all system updates, <br />
          shift offers, and schedule changes.
        </p>
      </div>
    </div>
  );
}

/* Item */

function NotificationItem({ notification }: { notification: Notification }) {
  const { icon: Icon, tile, iconColor } = KIND_STYLES[notification.kind];

  return (
    <li className="flex items-start gap-5 px-6 py-6">
      <div
        className={`flex size-14 shrink-0 items-center justify-center rounded-lg ${tile}`}
      >
        <Icon
          className={`size-8 ${iconColor}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold uppercase leading-tight text-slate-900">
          {notification.title}
        </h3>
        <p className="mt-1 text-sm uppercase text-slate-800">
          {notification.description}
        </p>
        <Link
          href={notification.href ?? "#"}
          className="mt-1 inline-flex items-center gap-0.5 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          View Details
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-4 pt-1">
        <span className="text-sm text-slate-400">{notification.timeAgo}</span>
        {/* Fixed-width slot keeps timestamps aligned for read items */}
        <span className="flex size-3.5 items-center justify-center">
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

/* Page */

export default function OwnerNotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(
    () =>
      notifications.filter((n) => {
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
      }),
    [notifications, filter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = showAll
    ? filtered
    : filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changeFilter = (next: NotificationFilter) => {
    setFilter(next);
    setPage(1);
  };

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Banner image={bannerImage} />

      {/* Tabs + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Filter notifications"
          className="flex flex-wrap items-center gap-2"
        >
          {TABS.map((tab) => {
            const isActive = tab.value === filter;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => changeFilter(tab.value)}
                className={`rounded-full px-5 py-1.5 text-sm font-semibold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            className="rounded-full border border-blue-700 px-5 py-1.5 text-sm font-semibold uppercase text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Mark all as read
          </button>
          <button
            onClick={() => setShowAll((v) => !v)}
            aria-pressed={showAll}
            className="rounded-full bg-blue-700 px-5 py-1.5 text-sm font-semibold uppercase text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {showAll ? "Show less" : "View all"}
          </button>
        </div>
      </div>

      {/* List */}
      <section className="rounded-2xl border border-[#D9D9D9] bg-white shadow-sm">
        {visible.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            No notifications to show.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {visible.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </ul>
        )}
      </section>

      {/* Pagination */}
      {!showAll && totalPages > 1 && (
        <nav
          aria-label="Notifications pagination"
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="flex size-10 items-center justify-center rounded-lg bg-white shadow disabled:opacity-40"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`flex size-10 items-center justify-center rounded-lg text-lg font-bold shadow ${
                p === currentPage
                  ? "bg-blue-700 text-white"
                  : "bg-white text-slate-900"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="flex size-10 items-center justify-center rounded-lg bg-white shadow disabled:opacity-40"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </nav>
      )}
    </div>
  );
}