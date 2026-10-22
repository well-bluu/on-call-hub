import { CalendarCheck, User } from "lucide-react";

/* ----------------------------- Types ----------------------------- */

export type ActivityType = "shift" | "profile" | "text";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string; // e.g. "NEW SHIFT ASSIGNED"
  description: string; // e.g. "Wrapping of Pinipig"
  time: string; // e.g. "Today • 2 mins ago"
}

export interface RecentActivityProps {
  /** Activity items. Falls back to sample data if omitted. */
  activities?: Activity[];
  /** Called when "View All" is clicked. The link is hidden if omitted. */
  onViewAll?: () => void;
}

/* --------------------------- Sample data -------------------------- */

export const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: "a1",
    type: "shift",
    title: "NEW SHIFT ASSIGNED",
    description: "Wrapping of Pinipig",
    time: "Today • 2 mins ago",
  },
  {
    id: "a2",
    type: "profile",
    title: "PROFILE UPDATED",
    description: "Description",
    time: "Today • 2 mins ago",
  },
  {
    id: "a3",
    type: "text",
    title: "TEXT",
    description: "Description",
    time: "Today • 2 mins ago",
  },
  {
    id: "a4",
    type: "text",
    title: "TEXT",
    description: "Description",
    time: "Today • 2 mins ago",
  },
];

/* ---------------------------- Component --------------------------- */

export default function RecentActivity({
  activities = SAMPLE_ACTIVITIES,
  onViewAll,
}: RecentActivityProps) {
  return (
    <section
      aria-label="Recent activity"
      className="w-full max-w-xs rounded-2xl border border-gray-200 bg-white p-5 font-sans shadow-md"
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">RECENT ACTIVITY</h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 underline"
          >
            View All
          </button>
        )}
      </div>

      {/* List */}
      {activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No recent activity.
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {activities.map((item) => {
            const isProfile = item.type === "profile";

            return (
              <li key={item.id} className="flex items-center gap-3">
                {/* Icon tile FAKE DATA*/}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    isProfile
                      ? "bg-orange-100 text-orange-500"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {isProfile ? (
                    <User
                      className="h-7 w-7"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  ) : (
                    <CalendarCheck
                      className="h-6 w-6"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Text */}
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-bold ${
                      isProfile ? "text-slate-900" : "text-green-600"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="truncate text-xs font-bold text-slate-900">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-gray-400">{item.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
