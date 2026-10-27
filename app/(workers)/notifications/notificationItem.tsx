import Link from "next/link";
import {
  Bell,
  Calendar,
  ChevronRight,
  CircleCheck,
  CircleX,
} from "lucide-react";
import type { Notification, NotificationKind } from "./types";

const KIND_STYLES: Record<
  NotificationKind,
  { icon: typeof Bell; tile: string; icon_color: string }
> = {
  offer: { icon: Calendar, tile: "bg-blue-50", icon_color: "text-blue-600" },
  confirmed: {
    icon: CircleCheck,
    tile: "bg-green-50",
    icon_color: "text-green-600",
  },
  reminder: { icon: Bell, tile: "bg-orange-50", icon_color: "text-orange-400" },
  declined: { icon: CircleX, tile: "bg-red-100", icon_color: "text-red-500" },
};

export function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const { icon: Icon, tile, icon_color } = KIND_STYLES[notification.kind];

  return (
    <li className="relative flex items-start gap-3 px-4 py-4 sm:gap-5 sm:px-6 sm:py-6">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg sm:size-14 ${tile}`}
      >
        <Icon
          className={`size-6 sm:size-8 ${icon_color}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </div>

      <div className="min-w-0 flex-1">
        {/* pr-4 keeps the title clear of the mobile unread dot */}
        <h3 className="break-words pr-4 text-sm font-bold uppercase leading-tight text-slate-900 sm:pr-0 sm:text-lg">
          {notification.title}
        </h3>
        <p className="mt-1 text-sm text-slate-800">
          {notification.description}
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <Link
            href={notification.href ?? "#"}
            className="inline-flex items-center gap-0.5 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            View Details
            <ChevronRight className="size-4" aria-hidden />
          </Link>
          {/* Mobile: timestamp sits under the text instead of in its own column */}
          <span className="text-xs text-slate-400 sm:hidden">
            {notification.timeAgo}
          </span>
        </div>
      </div>

      {/* Mobile: unread dot in the top-right corner */}
      {!notification.read && (
        <span className="absolute right-4 top-4 sm:hidden">
          <span
            className="block size-2.5 rounded-full bg-blue-600"
            aria-hidden
          />
          <span className="sr-only">Unread</span>
        </span>
      )}

      {/* sm and up: original right-hand column */}
      <div className="hidden shrink-0 items-center gap-4 pt-1 sm:flex">
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
