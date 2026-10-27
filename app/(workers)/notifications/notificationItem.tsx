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
    <li className="flex items-start gap-5 px-6 py-6">
      <div
        className={`flex size-14 shrink-0 items-center justify-center rounded-lg ${tile}`}
      >
        <Icon
          className={`size-8 ${icon_color}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold uppercase leading-tight text-slate-900">
          {notification.title}
        </h3>
        <p className="mt-1 text-sm text-slate-800">
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
