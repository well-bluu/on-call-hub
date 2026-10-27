import { Calendar, User } from "lucide-react";

const ACTIVITY = [
  {
    icon: Calendar,
    iconBox: "bg-[#E5F8EC] text-[#1FAA59]",
    titleColor: "text-[#1FAA59]",
    title: "NEW SHIFT ASSIGNED",
    description: "Wrapping of Pinipig",
    time: "Today • 2 mins ago",
  },
  {
    icon: User,
    iconBox: "bg-[#FEF3E6] text-[#FD950F]",
    titleColor: "text-[hsl(var(--dark-blue))]",
    title: "PROFILE UPDATED",
    description: "Description",
    time: "Today • 2 mins ago",
  },
  {
    icon: Calendar,
    iconBox: "bg-[#E5F8EC] text-[#1FAA59]",
    titleColor: "text-[#1FAA59]",
    title: "TEXT",
    description: "Description",
    time: "Today • 2 mins ago",
  },
  {
    icon: Calendar,
    iconBox: "bg-[#E5F8EC] text-[#1FAA59]",
    titleColor: "text-[#1FAA59]",
    title: "TEXT",
    description: "Description",
    time: "Today • 2 mins ago",
  },
];

export default function RecentActivity() {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold leading-5 text-[hsl(var(--dark-blue))]">
          RECENT ACTIVITY
        </h2>

        <button
          type="button"
          className="shrink-0 text-xs font-semibold text-[#0050D3] underline transition-colors hover:text-[#003FA7]"
        >
          View All
        </button>
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4">
        {ACTIVITY.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={`${item.title}-${index}`}
              className="flex min-h-[48px] min-w-0 items-center gap-3"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconBox}`}
              >
                <Icon
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </span>

              <div className="min-w-0 break-words">
                <p
                  className={`text-xs font-bold leading-4 ${item.titleColor}`}
                >
                  {item.title}
                </p>

                <p className="text-xs font-medium leading-4 text-[hsl(var(--dark-blue))]">
                  {item.description}
                </p>

                <p className="text-[11px] leading-4 text-neutral-400">
                  {item.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}