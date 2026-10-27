"use client";
import { useState } from "react";

/* ----------------------------- Types ----------------------------- */

export type ShiftStatus =
  | "ACCEPTED"
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "DECLINED";

export interface Shift {
  id: string;
  date: string; // e.g. "JULY 21, 2026"
  day: string; // e.g. "TUESDAY"
  time: string; // e.g. "6:00 AM - 5:00 PM"
  task: string; // e.g. "COATING"
  status: ShiftStatus;
}

export type ShiftTabKey = "upcoming" | "requests" | "past" | "cancelled";

export type ShiftsByTab = Record<ShiftTabKey, Shift[]>;

export interface ShiftListProps {
  /** Shifts grouped by tab. Falls back to sample data if omitted. */
  shifts?: ShiftsByTab;
  /** Tab selected on first render. */
  defaultTab?: ShiftTabKey;
  /** Called when a row is clicked. */
  onShiftClick?: (shift: Shift, tab: ShiftTabKey) => void;
}

/* --------------------------- Sample data -------------------------- */

const TIME = "6:00 AM - 5:00 PM";

export const SAMPLE_SHIFTS: ShiftsByTab = {
  upcoming: [
    {
      id: "u1",
      date: "JULY 21, 2026",
      day: "TUESDAY",
      time: TIME,
      task: "COATING",
      status: "ACCEPTED",
    },
    {
      id: "u2",
      date: "JULY 22, 2026",
      day: "WEDNESDAY",
      time: TIME,
      task: "MIXING",
      status: "PENDING",
    },
    {
      id: "u3",
      date: "JULY 23, 2026",
      day: "THURSDAY",
      time: TIME,
      task: "COATING",
      status: "PENDING",
    },
  ],
  requests: [
    {
      id: "r1",
      date: "JULY 27, 2026",
      day: "MONDAY",
      time: TIME,
      task: "MIXING",
      status: "PENDING",
    },
    {
      id: "r2",
      date: "JULY 28, 2026",
      day: "TUESDAY",
      time: TIME,
      task: "PACKING",
      status: "PENDING",
    },
    {
      id: "r3",
      date: "JULY 30, 2026",
      day: "THURSDAY",
      time: TIME,
      task: "COATING",
      status: "DECLINED",
    },
  ],
  past: [
    {
      id: "p1",
      date: "JULY 14, 2026",
      day: "TUESDAY",
      time: TIME,
      task: "COATING",
      status: "COMPLETED",
    },
    {
      id: "p2",
      date: "JULY 15, 2026",
      day: "WEDNESDAY",
      time: TIME,
      task: "PACKING",
      status: "COMPLETED",
    },
    {
      id: "p3",
      date: "JULY 16, 2026",
      day: "THURSDAY",
      time: TIME,
      task: "MIXING",
      status: "COMPLETED",
    },
  ],
  cancelled: [
    {
      id: "c1",
      date: "JULY 17, 2026",
      day: "FRIDAY",
      time: TIME,
      task: "COATING",
      status: "CANCELLED",
    },
    {
      id: "c2",
      date: "JULY 18, 2026",
      day: "SATURDAY",
      time: TIME,
      task: "MIXING",
      status: "CANCELLED",
    },
  ],
};

/* ----------------------------- Config ----------------------------- */

const TABS: { key: ShiftTabKey; label: string; empty: string }[] = [
  {
    key: "upcoming",
    label: "UPCOMING SHIFTS",
    empty: "You have no upcoming shifts.",
  },
  {
    key: "requests",
    label: "SHIFT REQUESTS",
    empty: "You have no open shift requests.",
  },
  { key: "past", label: "PAST SHIFTS", empty: "No past shifts to show." },
  {
    key: "cancelled",
    label: "CANCELLED SHIFTS",
    empty: "No cancelled shifts.",
  },
];

const COLUMNS = ["DATE", "DAY", "TIME", "TASK", "STATUS"] as const;

const STATUS_STYLES: Record<ShiftStatus, string> = {
  ACCEPTED: "bg-green-100 text-green-700",
  PENDING: "bg-orange-100 text-orange-500",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-600",
  DECLINED: "bg-red-100 text-red-600",
};

// Shared by the header and every row so the columns line up
const GRID =
  "grid min-w-[560px] grid-cols-[1.25fr_1.1fr_1.5fr_1fr_1fr] items-center gap-x-2 text-center";

/* ---------------------------- Component --------------------------- */

export default function ShiftList({
  shifts = SAMPLE_SHIFTS,
  defaultTab = "upcoming",
  onShiftClick,
}: ShiftListProps) {
  const [active, setActive] = useState<ShiftTabKey>(defaultTab);

  const activeTab = TABS.find((t) => t.key === active)!;
  const rows = shifts[active] ?? [];

  return (
    <section
      aria-label="Shifts"
      className="w-full max-w-2xl overflow-hidden rounded-lg border border-gray-200 bg-white font-sans text-slate-900"
    >
      {/* Tabs */}
      <div
        role="tablist"
        className="flex overflow-x-auto border-b border-gray-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((tab) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.key)}
              className={`-mb-px flex-1 whitespace-nowrap border-b-2 px-2 pb-3 pt-4 text-[11px] sm:px-5 sm:text-[13px] font-bold ${
                selected ? "border-blue-700" : "border-transparent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div role="tabpanel" className="overflow-x-auto px-5 pb-6 pt-5">
        <div
          className={`${GRID} px-4 pb-3.5 text-[13px] font-bold`}
          aria-hidden="true"
        >
          {COLUMNS.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {activeTab.empty}
          </p>
        ) : (
          <ul className="grid gap-3.5">
            {rows.map((shift) => (
              <li key={shift.id}>
                <div
                  onClick={
                    onShiftClick ? () => onShiftClick(shift, active) : undefined
                  }
                  className={`${GRID} rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-xs font-bold ${
                    onShiftClick ? "cursor-pointer hover:border-gray-400" : ""
                  }`}
                >
                  <span>{shift.date}</span>
                  <span>{shift.day}</span>
                  <span>{shift.time}</span>
                  <span>{shift.task}</span>
                  <span>
                    <span
                      className={`inline-block min-w-[72px] rounded-full px-3 py-0.5 text-[11px] font-bold leading-normal ${STATUS_STYLES[shift.status]}`}
                    >
                      {shift.status}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
