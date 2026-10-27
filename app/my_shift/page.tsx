"use client";

import { useState } from "react";
import {
  CalendarCheck,
  Cross,
  CircleCheck,
  Clock,
  Calendar,
  User,
  ChevronDown,
} from "lucide-react";
// Once the banner asset exists at components/assets/images/my-shifts-banner.png,
// uncomment this import and the style prop on the banner div below.
// import bannerImage from "@/components/assets/images/my-shifts-banner.png";

type TabKey = "upcoming" | "requests" | "past" | "cancelled";
type ShiftStatus = "accepted" | "pending" | "cancelled";

interface Shift {
  date: string; // "YYYY-MM-DD" — the date and weekday columns are derived from this
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

// Sample data — replace with shifts fetched from your API.
const SHIFTS: Record<TabKey, Shift[]> = {
  upcoming: [
    { date: "2026-09-21", time: "6:00 AM - 5:00 PM", task: "COATING", status: "accepted" },
    { date: "2026-09-22", time: "6:00 AM - 5:00 PM", task: "MIXING", status: "pending" },
    { date: "2026-09-23", time: "6:00 AM - 5:00 PM", task: "COATING", status: "pending" },
  ],
  requests: [],
  past: [],
  cancelled: [],
};

// Same palette as the FAQS / calendar chips: light bg + matching text color
const STATUS_STYLES: Record<ShiftStatus, { label: string; pill: string }> = {
  accepted: { label: "ACCEPTED", pill: "bg-[#E5F8EC] text-[#1FAA59]" },
  pending: { label: "PENDING", pill: "bg-[#FEF3E6] text-[#FD950F]" },
  cancelled: { label: "CANCELLED", pill: "bg-[#FBDEDE] text-[#FF0000]" },
};

const SUMMARY = [
  {
    icon: CalendarCheck,
    value: "2",
    suffix: "",
    label: "TOTAL SHIFTS",
    box: "bg-[#E6EFFD] border-[#0050D3]",
    iconColor: "text-[#0050D3]",
  },
  {
    icon: Cross,
    value: "2",
    suffix: "/5",
    label: "SICK LEAVE USED",
    box: "bg-[#FBDEDE] border-[#FF0000]",
    iconColor: "text-[#FF0000]",
  },
  {
    icon: CircleCheck,
    value: "2",
    suffix: "",
    label: "ATTENDANCE",
    box: "bg-[#E5F8EC] border-[#1FAA59]",
    iconColor: "text-[#1FAA59]",
  },
  {
    icon: Clock,
    value: "2",
    suffix: "",
    label: "TEXT", // placeholder label from the mockup — rename later
    box: "bg-[#FEF3E6] border-[#FD950F]",
    iconColor: "text-[#FD950F]",
  },
];

const ACTIVITY = [
  {
    icon: Calendar,
    iconBox: "bg-[#E5F8EC] text-[#1FAA59]",
    titleColor: "text-[#1FAA59]",
    title: "NEW SHIFT ASSIGNED",
    description: "Wrapping of Pinipig",
    time: "Today • 2 mins ago",
  },
  {
    icon: User,
    iconBox: "bg-[#FEF3E6] text-[#FD950F]",
    titleColor: "text-[hsl(var(--dark-blue))]",
    title: "PROFILE UPDATED",
    description: "Description",
    time: "Today • 2 mins ago",
  },
  {
    icon: Calendar,
    iconBox: "bg-[#E5F8EC] text-[#1FAA59]",
    titleColor: "text-[#1FAA59]",
    title: "TEXT",
    description: "Description",
    time: "Today • 2 mins ago",
  },
  {
    icon: Calendar,
    iconBox: "bg-[#E5F8EC] text-[#1FAA59]",
    titleColor: "text-[#1FAA59]",
    title: "TEXT",
    description: "Description",
    time: "Today • 2 mins ago",
  },
];

function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
const formatDate = (iso: string) =>
  parseDate(iso)
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
const formatWeekday = (iso: string) =>
  parseDate(iso).toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

// Shared column template so the header row and the data rows line up
const COLS = "grid grid-cols-[1.3fr_1.1fr_1.5fr_1fr_1fr] items-center gap-2 text-center";

export default function MyShiftPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const rows = SHIFTS[activeTab];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT SIDE */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Hero banner */}
        <div
          className="relative overflow-hidden rounded-2xl border-[1px] border-[#D9D9D9] bg-gradient-to-r from-[#E6EFFD] to-[#DCE6FB] bg-cover bg-[position:40%_center] p-8"
          // style={{ backgroundImage: `url(${bannerImage.src})` }}
        >
          <div className="max-w-lg">
            <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))]">
              MY SHIFTS
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--dark-blue))]">
              View and manage <br /> all your shifts.
            </p>
          </div>

          {/* Month dropdown — not wired up yet */}
          <button
            type="button"
            className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2 rounded-lg bg-[#0050D3] px-5 py-3 text-sm font-bold text-white hover:bg-[#003FA7] transition-colors"
          >
            SEPTEMBER 2026
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Shifts card */}
        <div className="rounded-xl border border-border bg-white shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-border overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 whitespace-nowrap px-6 py-4 text-sm font-bold -mb-px border-b-2 transition-colors ${
                    isActive
                      ? "border-[#0050D3] text-[hsl(var(--dark-blue))]"
                      : "border-transparent text-[hsl(var(--dark-blue))] hover:text-[#0050D3]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[640px] p-6">
              <div
                className={`${COLS} px-6 pb-4 pt-2 text-sm font-bold text-[hsl(var(--dark-blue))]`}
              >
                <span>DATE</span>
                <span>DAY</span>
                <span>TIME</span>
                <span>TASK</span>
                <span>STATUS</span>
              </div>

              <div className="flex flex-col gap-4">
                {rows.length === 0 && (
                  <p className="py-10 text-center text-sm text-neutral-400">
                    No shifts to show here yet.
                  </p>
                )}

                {rows.map((shift) => {
                  const status = STATUS_STYLES[shift.status];
                  return (
                    <div
                      key={`${shift.date}-${shift.task}`}
                      className={`${COLS} rounded-lg border-2 border-neutral-300 px-6 py-3 text-sm font-semibold text-[hsl(var(--dark-blue))] transition-colors hover:bg-neutral-50`}
                    >
                      <span>{formatDate(shift.date)}</span>
                      <span>{formatWeekday(shift.date)}</span>
                      <span>{shift.time}</span>
                      <span>{shift.task}</span>
                      <span>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${status.pill}`}
                        >
                          {status.label}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col gap-6">
        {/* WORKER SUMMARY */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h3 className="text-[16px] font-bold tracking-wide text-[hsl(var(--dark-blue))] mb-4 text-center">
            WORKER SUMMARY
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {SUMMARY.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-4 ${item.box}`}
                >
                  <Icon className={`h-8 w-8 ${item.iconColor}`} />
                  <p className="text-2xl font-bold text-[hsl(var(--dark-blue))]">
                    {item.value}
                    {item.suffix && (
                      <span className="text-neutral-400">{item.suffix}</span>
                    )}
                  </p>
                  <p className="text-[11px] font-semibold tracking-wide text-[hsl(var(--dark-blue))] text-center">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-bold tracking-wide text-[hsl(var(--dark-blue))]">
              RECENT ACTIVITY
            </h3>
            <button
              type="button"
              className="text-xs font-semibold text-[#0050D3] underline hover:text-[#003FA7]"
            >
              View All
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {ACTIVITY.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={`${item.title}-${i}`} className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconBox}`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold ${item.titleColor}`}>
                      {item.title}
                    </p>
                    <p className="text-xs font-semibold text-[hsl(var(--dark-blue))]">
                      {item.description}
                    </p>
                    <p className="text-[11px] text-neutral-400">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}