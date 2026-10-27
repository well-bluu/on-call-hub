"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import {
  Shift,
  SAMPLE_SHIFTS,
  SHIFT_STYLES,
  WEEKDAYS,
  MONTHS,
  buildMonthGrid,
  formatFullDate,
} from "./calendar_utils";
import bannerImage from "@/components/assets/images/shared-calendar-banner.png";
import CalendarBanner from "./sharedCalendarBanner";

// Breakpoint notes: the sidebar takes ~320px on desktop, so the page content
// is much narrower than the viewport. The full day cells (time, label, "View
// Details") need ~110px each, so they only appear from `xl`. Below that the
// calendar uses compact cells (day number + badge) and tapping a day shows
// its details in a panel under the grid.

export default function SharedCalendarPage() {
  const [current, setCurrent] = useState(new Date(2026, 8, 28)); // defaults to September 2026 (09/28/26)
  const [shifts, setShifts] = useState<Record<string, Shift>>(SAMPLE_SHIFTS);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null); // selected date key, e.g. "2026-09-28"

  const year = current.getFullYear();
  const month = current.getMonth();
  const cells = buildMonthGrid(year, month);

  const goPrev = () => {
    setCurrent(new Date(year, month - 1, 1));
    setSelected(null);
  };
  const goNext = () => {
    setCurrent(new Date(year, month + 1, 1));
    setSelected(null);
  };

  // Replace the URL/response-shape below with data
  useEffect(() => {
    let cancelled = false;

    async function loadShifts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/shifts?year=${year}&month=${month + 1}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data: Record<string, Shift> = await res.json();
        if (!cancelled) setShifts(data);
      } catch {
        // Sample data
        // Calendar renders something during development (loading)
        if (!cancelled) setShifts(SAMPLE_SHIFTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadShifts();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const selectedShift = selected ? shifts[selected] : undefined;
  const selectedStyles = selectedShift
    ? SHIFT_STYLES[selectedShift.color]
    : null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Hero banner */}
      <CalendarBanner
        image={bannerImage}
        title={"SHARED CALENDAR"}
        description={
          "Keep everyone on the same schedule by viewing assigned shifts and important work dates."
        }
      />
      <div className="min-w-0 rounded-2xl border border-border bg-white p-3 sm:p-6">
        {/* Month nav */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous month"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#012247] text-white transition-colors hover:bg-[#0050D3] sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Fix later */}
          <h2 className="text-center text-lg font-extrabold tracking-tight text-[hsl(var(--dark-blue))] sm:text-2xl">
            {MONTHS[month]} {year}
            {loading && (
              <span className="ml-2 align-middle text-xs font-medium text-neutral-400"></span>
            )}
          </h2>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next month"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#012247] text-white transition-colors hover:bg-[#0050D3] sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-3 border-t border-border" />

        {/* Weekday row (3-letter abbreviations on mobile) */}
        <div className="mb-2 grid grid-cols-7 text-center">
          {WEEKDAYS.map((d) => (
            <span
              key={d}
              className="text-[10px] font-semibold tracking-wide text-neutral-400 sm:text-xs"
            >
              <span className="sm:hidden">{d.slice(0, 3)}</span>
              <span className="hidden sm:inline">{d}</span>
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 border-l border-t border-border">
          {cells.map(({ day, monthOffset, key }) => {
            const shift = shifts[key];
            const isOtherMonth = monthOffset !== 0;

            if (!shift) {
              return (
                <div
                  key={key}
                  className="h-12 cursor-pointer border-b border-r border-border p-1 text-center transition-colors hover:bg-neutral-100 sm:h-16 xl:h-28 xl:p-2 xl:text-right"
                >
                  <span
                    className={`text-xs xl:text-sm ${
                      isOtherMonth
                        ? "text-neutral-300"
                        : "text-[hsl(var(--dark-blue))]"
                    }`}
                  >
                    {day}
                  </span>
                </div>
              );
            }

            const styles = SHIFT_STYLES[shift.color];
            const isSelected = selected === key;

            return (
              <div
                key={key}
                className="h-12 border-b border-r border-border p-0.5 sm:h-16 xl:h-28 xl:p-1"
              >
                {/* Compact cell: below xl, tap to show details under the grid */}
                <button
                  type="button"
                  onClick={() => setSelected(key)}
                  aria-label={`Shift on day ${day}, ${shift.time}`}
                  className={`flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-md border xl:hidden ${styles.bg} ${styles.border} ${
                    isSelected ? "ring-2 ring-[#0050D3]" : ""
                  }`}
                >
                  <span className="text-xs font-bold text-[hsl(var(--dark-blue))]">
                    {day}
                  </span>
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${styles.badge} text-white`}
                  >
                    <Users className="h-2 w-2" />
                  </span>
                </button>

                {/* Full cell: xl and up */}
                <div
                  className={`hidden h-full cursor-pointer flex-col justify-between rounded-lg border p-2 transition hover:brightness-95 xl:flex ${styles.bg} ${styles.border}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${styles.badge} text-white`}
                      >
                        <Users className="h-2.5 w-2.5" />
                      </span>
                      {shift.extraCount ? (
                        <span className="text-[9px] font-medium text-neutral-500">
                          +{shift.extraCount} more
                        </span>
                      ) : null}
                    </span>
                    <span className="text-sm font-bold text-[hsl(var(--dark-blue))]">
                      {day}
                    </span>
                  </div>

                  <div className="text-center leading-tight">
                    <p className={`text-[10px] font-semibold ${styles.text}`}>
                      {shift.time}
                    </p>
                    <p className={`text-[10px] font-bold ${styles.text}`}>
                      {shift.label.toUpperCase()}
                    </p>
                  </div>

                  {/* Add data */}
                  <button
                    type="button"
                    className={`self-end text-[9px] font-semibold underline ${styles.text}`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Details panel for compact cells (hidden from xl, where cells show everything) */}
        <div className="mt-4 xl:hidden">
          {selected && selectedShift && selectedStyles ? (
            <div
              className={`rounded-xl border p-4 ${selectedStyles.bg} ${selectedStyles.border}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-[hsl(var(--dark-blue))]">
                  {formatFullDate(selected)}
                </p>
                {selectedShift.extraCount ? (
                  <span className="shrink-0 text-xs font-medium text-neutral-500">
                    +{selectedShift.extraCount} more
                  </span>
                ) : null}
              </div>

              <div className={`mt-3 text-sm ${selectedStyles.text}`}>
                <p className="font-semibold">{selectedShift.time}</p>
                <p className="font-bold">{selectedShift.label.toUpperCase()}</p>
                {selectedShift.location && (
                  <p className="mt-1 text-xs font-medium">
                    {selectedShift.location}
                  </p>
                )}
              </div>

              {selectedShift.assignedWorkers?.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedShift.assignedWorkers.map((w) => (
                    <span
                      key={w}
                      className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--dark-blue))]"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-center text-xs text-neutral-400">
              Tap a highlighted day to see its shift details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
