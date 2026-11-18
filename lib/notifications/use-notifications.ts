"use client";

import { useMemo, useState } from "react";
import { PAGE_SIZE } from "./constants";
import { INITIAL_NOTIFICATIONS } from "./mock-data";
import type { Notification, NotificationFilter } from "./types";

// ==========================================
// useNotifications
// ==========================================
// Holds ALL notification state + logic (filtering, pagination, read actions).
// This hook is the single place backend engineers need to touch.

export function useNotifications() {
  // ------------------------------------------
  // DATA SOURCE
  // ------------------------------------------
  // BACKEND: Replace `INITIAL_NOTIFICATIONS` with real data.
  //
  // Option A (simple): fetch the owner's notifications on load
  //   e.g. GET /api/owner/notifications  ->  Notification[]
  //   and seed this state with the response (React Query / SWR / server
  //   component prop all work). Keep the local `notifications` state so
  //   optimistic updates below still feel instant.
  //
  // Option B (server-side filtering/pagination): pass `filter`, `page`
  //   and `PAGE_SIZE` to the API and drop the client-side filtering and
  //   slicing below. The API should also return the total count so
  //   `totalPages` can be calculated.
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS,
  );

  // BACKEND: add loading / error state here if needed (isLoading, error).

  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  // ------------------------------------------
  // FILTER NOTIFICATIONS
  // ------------------------------------------
  // BACKEND: Only needed for client-side filtering (Option A).

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

  // ------------------------------------------
  // PAGINATION
  // ------------------------------------------
  // BACKEND: With server-side pagination, `totalPages` should come from
  // the API's total count instead of `filtered.length`.

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visible = showAll
    ? filtered
    : filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ------------------------------------------
  // ACTIONS
  // ------------------------------------------

  const changeFilter = (next: NotificationFilter) => {
    setFilter(next);
    setPage(1);
  };

  const markAsRead = (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

    // BACKEND: Persist to the database here.
    //   e.g. PATCH /api/owner/notifications/:id  { read: true }
    // On failure, roll the notification back to `read: false`.
  };

  const markAllAsRead = () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // BACKEND: Persist to the database here.
    //   e.g. POST /api/owner/notifications/mark-all-read
    // On failure, restore the previous state.
  };

  const toggleShowAll = () => setShowAll((v) => !v);

  return {
    // data
    visible,
    // filter
    filter,
    changeFilter,
    // pagination
    currentPage,
    totalPages,
    setPage,
    showAll,
    toggleShowAll,
    // actions
    markAsRead,
    markAllAsRead,
  };
}
