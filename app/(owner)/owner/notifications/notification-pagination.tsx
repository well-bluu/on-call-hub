import { ChevronLeft, ChevronRight } from "lucide-react";

// ==========================================
// PAGINATION
// ==========================================
// Presentational.
// BACKEND: With server-side pagination, `totalPages` should come from the
// API's total count, and `onPageChange` should trigger a refetch.

export function NotificationPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label="Notifications pagination"
      className="flex items-center justify-center gap-2 sm:gap-4"
    >
      {/* PREVIOUS PAGE */}

      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex size-9 items-center justify-center rounded-lg bg-white shadow disabled:opacity-40 sm:size-10"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>

      {/* PAGE NUMBERS */}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-current={p === currentPage ? "page" : undefined}
          className={`flex size-9 items-center justify-center rounded-lg text-sm font-bold shadow sm:size-10 sm:text-lg ${
            p === currentPage
              ? "bg-blue-700 text-white"
              : "bg-white text-slate-900"
          }`}
        >
          {p}
        </button>
      ))}

      {/* NEXT PAGE */}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex size-9 items-center justify-center rounded-lg bg-white shadow disabled:opacity-40 sm:size-10"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </nav>
  );
}
