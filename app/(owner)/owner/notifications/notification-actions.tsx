// ==========================================
// ACTION BUTTONS ("Mark all as read" + "View all")
// ==========================================
// Presentational. The API calls live in `use-notifications.ts`
// (see `markAllAsRead`).

export function NotificationActions({
  showAll,
  onMarkAllAsRead,
  onToggleShowAll,
}: {
  showAll: boolean;
  onMarkAllAsRead: () => void;
  onToggleShowAll: () => void;
}) {
  return (
    <div
      className="
      flex w-full items-center
      justify-between gap-3

      lg:w-auto lg:shrink-0 lg:justify-end lg:gap-4
    "
    >
      <button
        onClick={onMarkAllAsRead}
        className="
          w-1/2 rounded-full
          border border-blue-700
          px-4 py-2

          text-xs font-semibold
          uppercase text-blue-700

          transition-colors hover:bg-blue-50

          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-blue-700

          sm:px-5 sm:py-1.5 sm:text-sm

          lg:w-auto lg:whitespace-nowrap
          lg:px-3 lg:py-1 lg:text-xs lg:font-bold
        "
      >
        Mark all as read
      </button>

      <button
        onClick={onToggleShowAll}
        aria-pressed={showAll}
        className="
          w-1/2 rounded-full
          border border-blue-700 bg-blue-700
          px-4 py-2

          text-xs font-semibold
          uppercase text-white

          transition-colors hover:bg-blue-800

          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-blue-700

          sm:px-5 sm:py-1.5 sm:text-sm

          lg:w-auto lg:whitespace-nowrap
          lg:px-3 lg:py-1 lg:text-xs lg:font-bold
        "
      >
        {showAll ? "Show less" : "View all"}
      </button>
    </div>
  );
}
