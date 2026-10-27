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
    // On narrow screens the tabs scroll sideways instead of wrapping or overflowing
    <div
      role="tablist"
      aria-label="Filter notifications"
      className="flex min-w-0 max-w-full items-center gap-1.5 overflow-x-auto sm:gap-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:px-5 sm:text-sm ${
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
