import { Bell, Calendar, CircleCheck, CircleX } from "lucide-react";
import type { NotificationFilter, NotificationKind } from "./types";

// ==========================================
// PAGINATION
// ==========================================
// BACKEND: If you move to server-side pagination, this becomes the
// `limit` / `pageSize` query param you send to the API.

export const PAGE_SIZE = 4;

// ==========================================
// NOTIFICATION STYLES (icon + colors per kind)
// ==========================================
// UI only. Backend just needs to send a valid `kind`.

export const KIND_STYLES: Record<
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

// ==========================================
// FILTER TABS
// ==========================================

export const TABS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "worker_responses", label: "Worker Responses" },
  { value: "shift_updates", label: "Shift Updates" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];
