"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import bannerImage from "@/components/assets/images/my-shifts-banner.png";
import WorkerSummary from "@/components/workerSummary";
import RecentActivity from "@/components/worker-Activity";

type TabKey = "upcoming" | "requests" | "past" | "cancelled";
type ShiftStatus = "accepted" | "pending" | "cancelled";

interface Shift {
  date: string;
  time: string;
  task: string;
  status: ShiftStatus;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "UPCOMING SHIFTS" },
  { key: "requests", label: "SHIFT REQUESTS" },
  { key: "past", label: "PAST SHIFTS" },
  { key: "cancelled", label: "CANCELLED SHIFTS" },
];

const SHIFTS: Record<TabKey, Shift[]> = {
  upcoming: [
    {
      date: "2026-09-21",
      time: "6:00 AM - 5:00 PM",
      task: "COATING",
      status: "accepted",
    },
    {
      date: "2026-09-22",
      time: "6:00 AM - 5:00 PM",
      task: "MIXING",
      status: "pending",
    },
    {
      date: "2026-09-23",
      time: "6:00 AM - 5:00 PM",
      task: "COATING",
      status: "pending",
    },
  ],
  requests: [],
  past: [],
  cancelled: [],
};

const STATUS_STYLES: Record<
  ShiftStatus,
  { label: string; pill: string }
> = {
  accepted: {
    label: "ACCEPTED",
    pill: "bg-[#E5F8EC] text-[#1FAA59]",
  },
  pending: {
    label: "PENDING",
    pill: "bg-[#FEF3E6] text-[#FD950F]",
  },
  cancelled: {
    label: "CANCELLED",
    pill: "bg-[#FBDEDE] text-[#FF0000]",
  },
};

function parseDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(iso: string) {
  return parseDate(iso)
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

function formatWeekday(iso: string) {
  return parseDate(iso)
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
}

export default function MyShiftPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const rows = SHIFTS[activeTab];

  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="flex min-w-0 flex-col gap-6">
        {/* Banner */}
        <div
          className="relative rounded-2xl border border-[#D9D9D9] bg-[#E6EFFD] bg-cover bg-[position:40%_center] p-6 sm:p-8"
          style={{ backgroundImage: `url(${bannerImage.src})` }}
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))]">
                MY SHIFTS
              </h1>

              <p className="mt-2 text-sm text-[hsl(var(--dark-blue))]">
                View and manage
                <br />
                all your shifts.
              </p>
            </div>

            <button
              type="button"
              className="flex max-w-full items-center gap-2 rounded-lg bg-[#0050D3] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#003FA7]"
            >
              SEPTEMBER 2026
              <ChevronDown
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Shifts card */}
        <div className="min-w-0 rounded-xl border border-border bg-white shadow-sm">
          <div className="grid w-full min-w-0 grid-cols-4 border-b border-border">
            {TABS.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-pressed={active}
                  className={`
                    min-w-0 whitespace-normal break-words
                    border-b-2 px-1 py-4
                    text-center text-[10px] font-bold leading-4
                    transition-colors sm:text-xs xl:text-sm
                    ${
                      active
                        ? "border-[#0050D3] text-[hsl(var(--dark-blue))]"
                        : "border-transparent text-[hsl(var(--dark-blue))] hover:text-[#0050D3]"
                    }
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="min-w-0 px-3 pb-4 pt-1 sm:px-5">
            <table className="w-full table-fixed border-separate border-spacing-0 text-center text-xs text-[hsl(var(--dark-blue))]">
              <caption className="sr-only">
                {TABS.find((tab) => tab.key === activeTab)?.label}
              </caption>

              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[19%]" />
                <col className="w-[23%]" />
                <col className="w-[16%]" />
                <col className="w-[18%]" />
              </colgroup>

              <thead>
                <tr>
                  {["DATE", "DAY", "TIME", "TASK", "STATUS"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="break-words px-1 py-2 font-bold"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-sm text-neutral-400"
                    >
                      No shifts to show here yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((shift, index) => {
                    const status = STATUS_STYLES[shift.status];
                    const cellStyle =
                      "whitespace-normal break-words border-y border-neutral-300 px-1 py-3 align-middle font-semibold";

                    return (
                      <Fragment key={`${shift.date}-${shift.task}`}>
                        {/* Gap only between shift rows */}
                        {index > 0 && (
                          <tr aria-hidden="true">
                            <td
                              colSpan={5}
                              className="h-3 border-0 p-0"
                            />
                          </tr>
                        )}

                        <tr className="transition-colors hover:bg-neutral-50">
                          <td
                            className={`${cellStyle} rounded-l-lg border-l`}
                          >
                            {formatDate(shift.date)}
                          </td>

                          <td className={cellStyle}>
                            {formatWeekday(shift.date)}
                          </td>

                          <td className={cellStyle}>
                            {shift.time}
                          </td>

                          <td className={cellStyle}>
                            {shift.task}
                          </td>

                          <td
                            className={`${cellStyle} rounded-r-lg border-r`}
                          >
                            <span
                              className={`inline-block max-w-full whitespace-normal break-words rounded-full px-1.5 py-1 text-[10px] font-bold ${status.pill}`}
                            >
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Worker Summary & Recent Activity */}
      <div className="flex min-w-0 flex-col gap-4">
        <WorkerSummary />
        <RecentActivity />
      </div>
    </div>
  );
}