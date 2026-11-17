"use client";

import bannerImage from "@/components/assets/images/notification-banner.png";
import { NotificationActions } from "./notification-actions";
import { NotificationBanner } from "./notification-banner";
import { NotificationFilterTabs } from "./notification-filter-tabs";
import { NotificationList } from "./notification-list";
import { NotificationPagination } from "./notification-pagination";
import { useNotifications } from "@/lib/notifications/use-notifications";

// ==========================================
// PAGE
// ==========================================
// Layout only. All data + logic lives in `use-notifications.ts`.
//
// BACKEND: To connect real data, edit `use-notifications.ts`
// (look for the "BACKEND:" comments). Nothing in this file needs data.

export default function OwnerNotificationsPage() {
  const {
    visible,
    filter,
    changeFilter,
    currentPage,
    totalPages,
    setPage,
    showAll,
    toggleShowAll,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
      {/* BANNER */}
      <NotificationBanner image={bannerImage} />

      {/* FILTER TABS + ACTION BUTTONS (web: everything on ONE row) */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <NotificationFilterTabs activeFilter={filter} onChange={changeFilter} />

        <NotificationActions
          showAll={showAll}
          onMarkAllAsRead={markAllAsRead}
          onToggleShowAll={toggleShowAll}
        />
      </div>

      {/* NOTIFICATION LIST */}
      <NotificationList notifications={visible} onMarkAsRead={markAsRead} />

      {/* PAGINATION */}
      {!showAll && totalPages > 1 && (
        <NotificationPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
