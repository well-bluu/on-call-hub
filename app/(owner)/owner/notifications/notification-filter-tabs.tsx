import { TABS } from "@/lib/notifications/constants";
import type { NotificationFilter } from "@/lib/notifications/types";

// ==========================================
// FILTER TABS
// ==========================================
// Presentational. Filtering happens in `use-notifications.ts`.
// BACKEND: If you filter server-side, `onChange` should trigger a refetch
// with the new filter value.

export function NotificationFilterTabs({
  activeFilter,
  onChange,
}: {
  activeFilter: NotificationFilter;
  onChange: (filter: NotificationFilter) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter notifications"
      className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0 lg:mx-0 lg:min-w-0 lg:flex-1 lg:flex-nowrap lg:justify-between lg:gap-0 lg:px-0"
    >
      {TABS.map((tab) => {
        const isActive = tab.value === activeFilter;

        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:px-5 sm:text-sm lg:whitespace-nowrap lg:px-5 lg:py-1 lg:text-xs lg:font-bold ${
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
