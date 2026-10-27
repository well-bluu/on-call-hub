import {
  CalendarCheck,
  Cross,
  CircleCheck,
  Clock,
} from "lucide-react";

const SUMMARY = [
  {
    icon: CalendarCheck,
    value: "2",
    suffix: "",
    label: "TOTAL SHIFTS",
    box: "bg-[#E6EFFD] border-[#0050D3]",
    iconColor: "text-[#0050D3]",
  },
  {
    icon: Cross,
    value: "2",
    suffix: "/5",
    label: "SICK LEAVE USED",
    box: "bg-[#FBDEDE] border-[#FF0000]",
    iconColor: "text-[#FF0000]",
  },
  {
    icon: CircleCheck,
    value: "2",
    suffix: "",
    label: "ATTENDANCE",
    box: "bg-[#E5F8EC] border-[#1FAA59]",
    iconColor: "text-[#1FAA59]",
  },
  {
    icon: Clock,
    value: "2",
    suffix: "",
    label: "TEXT",
    box: "bg-[#FEF3E6] border-[#FD950F]",
    iconColor: "text-[#FD950F]",
  },
];

export default function WorkerSummary() {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-center text-sm font-bold leading-5 text-[hsl(var(--dark-blue))]">
        WORKER SUMMARY
      </h2>

      <div className="grid auto-rows-fr grid-cols-2 gap-4">
        {SUMMARY.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`flex aspect-square w-full min-w-0 flex-col items-center justify-center gap-1 rounded-lg border p-2 ${item.box}`}
            >
              <Icon
                className={`h-6 w-6 shrink-0 ${item.iconColor}`}
                aria-hidden="true"
              />

              <p className="text-xl font-bold leading-6 text-[hsl(var(--dark-blue))]">
                {item.value}
                {item.suffix && (
                  <span className="text-neutral-400">
                    {item.suffix}
                  </span>
                )}
              </p>

              <p className="text-center text-[11px] font-semibold leading-4 text-[hsl(var(--dark-blue))]">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}