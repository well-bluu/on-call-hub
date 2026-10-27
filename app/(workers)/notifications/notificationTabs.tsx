import type { NotificationFilter } from "./types";

const TABS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "shifts", label: "Shifts" },
  { value: "system", label: "System" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

interface Props {
  active: NotificationFilter;
  onChange: (filter: NotificationFilter) => void;
}

export function NotificationTabs({ active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Filter notifications"
      className="flex items-center gap-2"
    >
      {TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
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
  );
}
