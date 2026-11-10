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

// ==========================================
// TYPES
// ==========================================

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

// ==========================================
// NOTIFICATION DATA
// ==========================================

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

// ==========================================
// NOTIFICATION STYLES
// ==========================================

const KIND_STYLES: Record<
  NotificationKind,
  { icon: typeof Bell; tile: string; iconColor: string }
> = {
  accepted: {
    icon: CircleCheck,
    tile: "bg-green-50",
    iconColor: "text-green-600",
  },
  declined: {
    icon: CircleX,
    tile: "bg-red-100",
    iconColor: "text-red-500",
  },
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

// ==========================================
// BANNER
// ==========================================

// ==========================================
// BANNER
// ==========================================

function Banner({ image }: { image: StaticImageData }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#D9D9D9] bg-cover bg-[position:40%_center] p-5 shadow-sm sm:p-6 lg:p-8"
      style={{
        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.96) 0%,
            rgba(255, 255, 255, 0.94) 15%,
            rgba(255, 255, 255, 0.88) 30%,
            rgba(255, 255, 255, 0.74) 45%,
            rgba(255, 255, 255, 0.54) 60%,
            rgba(255, 255, 255, 0.32) 75%,
            rgba(255, 255, 255, 0.14) 88%,
            rgba(255, 255, 255, 0.04) 96%,
            rgba(255, 255, 255, 0) 100%
          ),
          url(${image.src})
        `,
        backgroundSize: "100% 100%, cover",
        backgroundPosition: "center, 35% center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-lg">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[hsl(var(--dark-blue))] sm:text-3xl">
          Notifications
        </h1>

        <p className="mt-2 text-xs text-[hsl(var(--dark-blue))] sm:text-sm">
          View and manage all system updates,
          <br />
          shift offers, and schedule changes.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// NOTIFICATION ITEM
// ==========================================

function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const { icon: Icon, tile, iconColor } = KIND_STYLES[notification.kind];

  return (
    <li className="
      flex items-start gap-4
      px-4 py-4

      sm:gap-5 sm:px-6 sm:py-6
    ">
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

        {/* TITLE */}

        <h3 className="
          text-sm font-bold
          uppercase leading-tight
          text-slate-900

          sm:text-lg
        ">
          {notification.title}
        </h3>

        {/* DESCRIPTION */}

        <p className="
          mt-1 text-xs uppercase
          leading-relaxed text-slate-800

          sm:text-sm
        ">
          {notification.description}
        </p>

        {/* VIEW DETAILS */}

        <Link
          href={notification.href ?? "#"}
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
          View Details
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>

      {/* TIMESTAMP + UNREAD INDICATOR */}

      <div className="
        flex shrink-0
        items-center gap-4
        pt-0.5

        sm:pt-1
      ">
        <span className="
          whitespace-nowrap
          text-[10px] text-slate-400

          sm:text-sm
        ">
          {notification.timeAgo}
        </span>

        <span className="flex size-3.5 shrink-0 items-center justify-center">
          {!notification.read && (
            <>
              <span
                className="size-3.5 rounded-full bg-blue-600"
                aria-hidden
              />
              <span className="sr-only">Unread</span>
            </>
          )}
        </span>
      </div>
    </li>
  );
}

// ==========================================
// PAGE
// ==========================================

export default function OwnerNotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  // ==========================================
  // FILTER NOTIFICATIONS
  // ==========================================

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

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visible = showAll
    ? filtered
    : filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      );

  // ==========================================
  // ACTIONS
  // ==========================================

  const changeFilter = (next: NotificationFilter) => {
    setFilter(next);
    setPage(1);
  };

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6">

      {/* ================================== */}
      {/* BANNER */}
      {/* ================================== */}

      <Banner image={bannerImage} />

      {/* ================================== */}
      {/* FILTER TABS + ACTION BUTTONS */}
      {/* (web: everything on ONE row) */}
      {/* ================================== */}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">

        {/* FILTER TABS (web: spread across the row) */}

        <div
          role="tablist"
          aria-label="Filter notifications"
          className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0 lg:mx-0 lg:min-w-0 lg:flex-1 lg:flex-nowrap lg:justify-between lg:gap-0 lg:px-0"
        >
          {TABS.map((tab) => {
            const isActive = tab.value === filter;

            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => changeFilter(tab.value)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:px-5 sm:text-sm lg:whitespace-nowrap lg:px-5 lg:py-1 lg:text-xs lg:font-bold ${
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

        {/* ACTION BUTTONS (web: right side of the same row, same height as tabs) */}

        <div className="
          flex w-full items-center
          justify-between gap-3

          lg:w-auto lg:shrink-0 lg:justify-end lg:gap-4
        ">
          <button
            onClick={markAllAsRead}
            className="
              w-1/2 rounded-full
              border border-blue-700
              px-4 py-2

              text-xs font-semibold
              uppercase text-blue-700

              transition-colors hover:bg-blue-50

              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-blue-700

              sm:px-5 sm:py-1.5 sm:text-sm

              lg:w-auto lg:whitespace-nowrap
              lg:px-3 lg:py-1 lg:text-xs lg:font-bold
            "
          >
            Mark all as read
          </button>

          <button
            onClick={() => setShowAll((v) => !v)}
            aria-pressed={showAll}
            className="
              w-1/2 rounded-full
              border border-blue-700 bg-blue-700
              px-4 py-2

              text-xs font-semibold
              uppercase text-white

              transition-colors hover:bg-blue-800

              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-blue-700

              sm:px-5 sm:py-1.5 sm:text-sm

              lg:w-auto lg:whitespace-nowrap
              lg:px-3 lg:py-1 lg:text-xs lg:font-bold
            "
          >
            {showAll ? "Show less" : "View all"}
          </button>
        </div>
      </div>

      {/* ================================== */}
      {/* NOTIFICATION LIST */}
      {/* ================================== */}

      <section className="
        overflow-hidden rounded-xl
        border border-border
        bg-white
        shadow-[0_2px_6px_rgba(0,0,0,0.12)]
      ">
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-slate-500 sm:px-6 sm:py-12 sm:text-sm">
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

      {/* ================================== */}
      {/* PAGINATION */}
      {/* ================================== */}

      {!showAll && totalPages > 1 && (
        <nav
          aria-label="Notifications pagination"
          className="flex items-center justify-center gap-2 sm:gap-4"
        >
          {/* PREVIOUS PAGE */}

          <button
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="flex size-9 items-center justify-center rounded-lg bg-white shadow disabled:opacity-40 sm:size-10"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>

          {/* PAGE NUMBERS */}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`flex size-9 items-center justify-center rounded-lg text-sm font-bold shadow sm:size-10 sm:text-lg ${
                p === currentPage
                  ? "bg-blue-700 text-white"
                  : "bg-white text-slate-900"
              }`}
            >
              {p}
            </button>
          ))}

          {/* NEXT PAGE */}

          <button
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="flex size-9 items-center justify-center rounded-lg bg-white shadow disabled:opacity-40 sm:size-10"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </nav>
      )}
    </div>
  );
}