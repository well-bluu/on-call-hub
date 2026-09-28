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
} from "./calendar_utils";

export default function SharedCalendarPage() {
  const [current, setCurrent] = useState(new Date(2026, 8, 28)); // defaults to September 2026 (09/28/26)
  const [shifts, setShifts] = useState<Record<string, Shift>>(SAMPLE_SHIFTS);
  const [loading, setLoading] = useState(false);

  const year = current.getFullYear();
  const month = current.getMonth();
  const cells = buildMonthGrid(year, month);

  const goPrev = () => setCurrent(new Date(year, month - 1, 1));
  const goNext = () => setCurrent(new Date(year, month + 1, 1));

  // Replace the URL/response-shape below with data
  useEffect(() => {
    let cancelled = false;

    async function loadShifts() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/shifts?year=${year}&month=${month + 1}`,
          { cache: "no-store" }
        );
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

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous month"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#012247] text-white hover:bg-[#0050D3] transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Fix later */}
        <h2 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))]">
          {MONTHS[month]} {year}
          {loading && (
            <span className="ml-2 align-middle text-xs font-medium text-neutral-400">
            </span>
          )}
        </h2> 

        <button
          type="button"
          onClick={goNext}
          aria-label="Next month"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#012247] text-white hover:bg-[#0050D3] transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="border-t border-border mb-3" />

      {/* Weekday row */}
      <div className="grid grid-cols-7 text-center mb-2">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="text-xs font-semibold text-neutral-400 tracking-wide"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 border-t border-l border-border">
        {cells.map(({ day, monthOffset, key }) => {
          const shift = shifts[key];
          const isOtherMonth = monthOffset !== 0;

          if (!shift) {
            return (
              <div
                key={key}
                className="h-28 border-r border-b border-border p-2 text-right transition-colors hover:bg-neutral-100 cursor-pointer"
              >
                <span
                  className={`text-sm ${
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
          return (
            <div
              key={key}
              className="h-28 border-r border-b border-border p-1"
            >
              <div
                className={`h-full rounded-lg border p-2 flex flex-col justify-between transition hover:brightness-95 cursor-pointer ${styles.bg} ${styles.border}`}
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
                  className={`text-[9px] font-semibold underline self-end ${styles.text}`}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}