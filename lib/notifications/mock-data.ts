import type { Notification } from "./types";

// ==========================================
// MOCK NOTIFICATION DATA
// ==========================================
// BACKEND: DELETE THIS FILE once the real API is connected.
// The only consumer is `use-notifications.ts`.

export const INITIAL_NOTIFICATIONS: Notification[] = [
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
