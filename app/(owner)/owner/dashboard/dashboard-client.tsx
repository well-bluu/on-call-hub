"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dashboardBanner1 from "@/components/assets/images/dashboard-banner-1.png";
import dashboardBanner2 from "@/components/assets/images/dashboard-banner-2.png";
import dashboardBanner3 from "@/components/assets/images/dashboard-banner-3.png";
import {
  Calendar,
  CheckCircle2,
  CircleUserRound,
  UserX,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fmtClock, fmtLongDate, timeAgo, toLocalKey } from "@/lib/shifts/format";

const HERO_SLIDES = [
  { subtitle: "Here's your overview for today.", image: dashboardBanner1 },
  { subtitle: "Check your shifts for this week.", image: dashboardBanner2 },
  { subtitle: "Review your pending shift requests.", image: dashboardBanner3 },
];
const SLIDE_INTERVAL_MS = 5000; // Auto-slide speed

const WEEK_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type ShiftStatus = "COMPLETE" | "PENDING";

// Column widths for the two tables (inline so they always apply)
const TODAY_COLS = "1.2fr 1.4fr 1fr 1fr";
const UPCOMING_COLS = "1.2fr 1.2fr 1fr 0.8fr 1fr";

const WORKER_SUMMARY = [
  { icon: CheckCircle2, value: "0", label: "ACTIVE", box: "bg-[#E3F4E6] border-[#1A9E3A]", iconColor: "text-[#1A9E3A]" },
  { icon: UserX, value: "0", label: "INACTIVE", box: "bg-slate-100 border-slate-400", iconColor: "text-slate-500" },
];

const ACTIVITY_STYLE: Record<string, { iconBox: string; titleColor: string }> = {
  accepted: { iconBox: "bg-[#E3F4E6] text-[#1A9E3A]", titleColor: "text-[#1A9E3A]" },
  declined: { iconBox: "bg-[#FEF3E6] text-[#FD950F]", titleColor: "text-[#FD950F]" },
  expired: { iconBox: "bg-[#FEF3E6] text-[#FD950F]", titleColor: "text-[#FD950F]" },
  cancelled: { iconBox: "bg-slate-100 text-slate-500", titleColor: "text-slate-500" },
};

type DashboardData = {
  ownerName: string;
  weekDays: { label: string; hasShift: boolean }[];
  todaysShifts: { id: string; time: string; assigned: number; required: number; status: ShiftStatus }[];
  upcomingShifts: { id: string; date: string; time: string; filled: number; required: number; task: string; status: ShiftStatus }[];
  workerCounts: { active: number; inactive: number };
  recentActivity: { id: string; icon: typeof Calendar; iconBox: string; title: string; titleColor: string; description: string; time: string }[];
};

const EMPTY_DASHBOARD: DashboardData = {
  ownerName: "",
  weekDays: WEEK_LABELS.map((label) => ({ label, hasShift: false })),
  todaysShifts: [],
  upcomingShifts: [],
  workerCounts: { active: 0, inactive: 0 },
  recentActivity: [],
};

const statusOf = (status: string): ShiftStatus =>
  status === "filled" || status === "completed" ? "COMPLETE" : "PENDING";

async function loadDashboard(): Promise<DashboardData> {
  const supabase = createClient();
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const todayKey = toLocalKey(now);
  const { data: { user } } = await supabase.auth.getUser();
  const [profileRes, shiftsRes, workersRes, activityRes] = await Promise.all([
    supabase.from("profiles").select("first_name").eq("id", user?.id ?? "").maybeSingle(),
    supabase
      .from("shifts")
      .select("id, shift_name, starts_at, ends_at, required_workers, status, shift_assignments(response_status)")
      .neq("status", "cancelled")
      .gte("ends_at", weekStart.toISOString())
      .order("starts_at"),
    supabase.rpc("list_workers"),
    supabase
      .from("shift_assignments")
      .select("id, worker_id, response_status, responded_at, shifts!inner(shift_name)")
      .not("responded_at", "is", null)
      .order("responded_at", { ascending: false })
      .limit(4),
  ]);
  if (profileRes.error || shiftsRes.error || workersRes.error || activityRes.error) {
    throw profileRes.error ?? shiftsRes.error ?? workersRes.error ?? activityRes.error;
  }

  const shifts = shiftsRes.data.map((shift) => {
    const start = new Date(shift.starts_at);
    const end = new Date(shift.ends_at);
    return {
      id: shift.id,
      key: toLocalKey(start),
      start,
      time: `${fmtClock(start)} - ${fmtClock(end)}`,
      name: shift.shift_name,
      required: shift.required_workers,
      accepted: shift.shift_assignments.filter((a) => a.response_status === "accepted").length,
      status: statusOf(shift.status),
    };
  });
  const workers = workersRes.data ?? [];
  const names = new Map(workers.map((worker) => [worker.id, `${worker.first_name ?? ""} ${worker.last_name ?? ""}`.trim()]));
  const active = workers.filter((worker) => worker.account_status === "active").length;

  return {
    ownerName: `${(profileRes.data?.first_name ?? "").toUpperCase()}!`,
    weekDays: WEEK_LABELS.map((label, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);
      return { label, hasShift: shifts.some((shift) => shift.key === toLocalKey(date)) };
    }),
    todaysShifts: shifts
      .filter((shift) => shift.key === todayKey)
      .map((shift) => ({ id: shift.id, time: shift.time, assigned: shift.accepted, required: shift.required, status: shift.status })),
    upcomingShifts: shifts
      .filter((shift) => shift.start >= now)
      .slice(0, 5)
      .map((shift) => ({
        id: shift.id,
        date: fmtLongDate(shift.start),
        time: shift.time,
        filled: shift.accepted,
        required: shift.required,
        task: shift.name.toUpperCase(),
        status: shift.status,
      })),
    workerCounts: { active, inactive: workers.length - active },
    recentActivity: (activityRes.data ?? []).map((activity) => ({
      id: activity.id,
      icon: Calendar,
      ...(ACTIVITY_STYLE[activity.response_status] ?? ACTIVITY_STYLE.cancelled),
      title: `WORKER ${activity.response_status.toUpperCase()}`,
      description: `${names.get(activity.worker_id) || "A worker"} · ${activity.shifts.shift_name}`,
      time: timeAgo(activity.responded_at!),
    })),
  };
}

// Row / badge colors based on shift status
const STATUS_STYLES: Record<
  ShiftStatus,
  { row: string; text: string; badge: string; avatar: string }
> = {
  COMPLETE: {
    row: "bg-[#E3F4E6]",
    text: "text-[#1A9E3A]",
    badge: "border-[#1A9E3A] text-[#1A9E3A]",
    avatar: "text-[#1A9E3A]",
  },
  PENDING: {
    row: "bg-[#FEF3E6]",
    text: "text-[#FD950F]",
    badge: "border-[#FD950F] text-[#FD950F]",
    avatar: "text-[#FD950F]",
  },
};

// Small blue pill used for table column headers
function HeaderPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-auto inline-block whitespace-nowrap rounded-full bg-[#C9DAF8] px-3 py-0.5 text-[10px] font-bold text-[hsl(var(--dark-blue))]">
      {children}
    </span>
  );
}

// PAGE

export default function OwnerDashboardPage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD);

  useEffect(() => {
    let alive = true;
    void loadDashboard().then((dashboard) => {
      if (alive) setData(dashboard);
    });
    return () => {
      alive = false;
    };
  }, []);

  const workerSummary = [
    { ...WORKER_SUMMARY[0], value: String(data.workerCounts.active) },
    { ...WORKER_SUMMARY[1], value: String(data.workerCounts.inactive) },
  ];

  // Hero carousel auto-slide
  useEffect(() => {
    const timer = setInterval(
      () => setSlideIndex((i) => (i + 1) % HERO_SLIDES.length),
      SLIDE_INTERVAL_MS
    );
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[slideIndex];

  return (
    <div className="px-0.1 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT SIDE */}
      <div className="lg:col-span-2 flex flex-col gap-6">

        {/* Hero banner (carousel) */}
        <div
          className="relative overflow-hidden rounded-2xl border border-[#D9D9D9] bg-gradient-to-br from-sky-300 to-sky-100 bg-cover bg-right p-8 shadow-md min-h-[230px] transition-[background-image]"
          style={{
            backgroundImage: `url(${slide.image.src})`,
            backgroundRepeat: "no-repeat",

            // Size
            backgroundSize: "110%",

            // Position
            backgroundPosition: "20% 10%",
          }}
        >
          <div className="max-w-sm">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[hsl(var(--dark-blue))]">
              GOOD DAY, <br />
              {data.ownerName}
            </h1>
            <p className="mt-3 text-sm text-[hsl(var(--dark-blue))]">
              {slide.subtitle}
            </p>
          </div>

          {/* Carousel dots */}
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-3">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setSlideIndex(i)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  i === slideIndex ? "bg-[#0050D3]" : "bg-[#0050D3]/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* THIS WEEK */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[hsl(var(--dark-blue))]">
              THIS WEEK
            </h2>

            <Link href="/owner/shift-management" className="text-[11px] font-semibold text-[#0050D3] underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {data.weekDays.map((d) => (
              <div
                key={d.label}
                className={`h-16 rounded-md border p-1.5 text-[10px] font-bold text-[hsl(var(--dark-blue))] ${
                  d.hasShift
                    ? "border-[#0050D3] bg-[#C9DAF8]" // has a shift
                    : "border-[#D9D9D9] bg-[#F5F5F5]" // no shift
                }`}
              >
                {d.label}
              </div>
            ))}
          </div>
        </div>

        {/* TODAY'S SHIFT ASSIGNMENT */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[hsl(var(--dark-blue))]">
              TODAY&apos;S SHIFT ASSIGNMENT
            </h2>

            <Link href="/owner/shift-management" className="text-[11px] font-semibold text-[#0050D3] underline">
              View All
            </Link>
          </div>

          {/* Table header */}
          <div className="grid items-center px-3 pb-2 text-center" style={{ gridTemplateColumns: TODAY_COLS }}>
            <HeaderPill>TIME</HeaderPill>
            <HeaderPill>ASSIGNED WORKERS</HeaderPill>
            <HeaderPill>FILLED / REQUIRED</HeaderPill>
            <HeaderPill>STATUS</HeaderPill>
          </div>

          {/* Table rows */}
          <div className="flex flex-col gap-3">
            {data.todaysShifts.map((s) => {
              const style = STATUS_STYLES[s.status];
              return (
                <div
                  key={s.id}
                  style={{ gridTemplateColumns: TODAY_COLS }}
                  className={`grid items-center rounded-lg px-3 py-2 text-center text-[11px] font-bold ${style.row} ${style.text}`}
                >
                  <span>{s.time}</span>
                  <span className="flex items-center justify-center gap-1">
                    {Array.from({ length: s.assigned }).map((_, i) => (
                      <CircleUserRound
                        key={i}
                        className={`h-5 w-5 ${style.avatar}`}
                        strokeWidth={1.8}
                      />
                    ))}
                  </span>
                  <span>
                    {s.assigned}/{s.required}
                  </span>
                  <span>
                    <span
                      className={`rounded-full border px-3 py-0.5 text-[10px] font-bold ${style.badge}`}
                    >
                      {s.status}
                    </span>
                  </span>
                </div>
              );
            })}
            {data.todaysShifts.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-500">No shifts today.</p>
            )}
          </div>
        </div>

        {/* UPCOMING SHIFTS */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[hsl(var(--dark-blue))]">
              UPCOMING SHIFTS
            </h2>

            <Link href="/owner/shift-management" className="text-[11px] font-semibold text-[#0050D3] underline">
              View All
            </Link>
          </div>

          {/* Table header */}
          <div className="grid items-center px-3 pb-2 text-center" style={{ gridTemplateColumns: UPCOMING_COLS }}>
            <HeaderPill>DATE</HeaderPill>
            <HeaderPill>TIME</HeaderPill>
            <HeaderPill>FILLED / REQUIRED</HeaderPill>
            <HeaderPill>TASK</HeaderPill>
            <HeaderPill>STATUS</HeaderPill>
          </div>

          {/* Table rows */}
          <div className="flex flex-col gap-3">
            {data.upcomingShifts.map((s) => {
              const style = STATUS_STYLES[s.status];
              return (
                <div
                  key={s.id}
                  style={{ gridTemplateColumns: UPCOMING_COLS }}
                  className={`grid items-center rounded-lg px-3 py-2 text-center text-[11px] font-bold ${style.row} ${style.text}`}
                >
                  <span>{s.date}</span>
                  <span>{s.time}</span>
                  <span>
                    {s.filled}/{s.required}
                  </span>
                  <span>{s.task}</span>
                  <span>
                    <span
                      className={`rounded-full border px-3 py-0.5 text-[10px] font-bold ${style.badge}`}
                    >
                      {s.status}
                    </span>
                  </span>
                </div>
              );
            })}
            {data.upcomingShifts.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-500">No upcoming shifts.</p>
            )}
          </div>
        </div>
      </div>
      {/* CLOSE LEFT SIDE */}

      {/* RIGHT SIDE */}
      <div className="flex flex-col gap-6">

        {/* WORKER SUMMARY */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-center text-[14px] font-bold text-[hsl(var(--dark-blue))]">
            WORKER SUMMARY
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {workerSummary.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex flex-col items-center rounded-lg border px-2 py-3 ${item.box}`}
                >
                  <Icon className={`h-8 w-8 ${item.iconColor}`} strokeWidth={1.8} />
                  <p className="mt-1 text-xl font-extrabold text-[hsl(var(--dark-blue))]">
                    {item.value}
                  </p>
                  <p className="text-[9px] font-bold text-[hsl(var(--dark-blue))] text-center">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[hsl(var(--dark-blue))]">
              RECENT ACTIVITY
            </h3>

            <Link href="/owner/notifications" className="text-[11px] font-semibold text-[#0050D3] underline">
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            {data.recentActivity.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${a.iconBox}`}>
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <div className="leading-tight">
                    <p className={`text-[11px] font-bold ${a.titleColor}`}>{a.title}</p>
                    <p className="text-[10px] font-semibold text-[hsl(var(--dark-blue))]">
                      {a.description}
                    </p>
                    <p className="mt-0.5 text-[8px] text-neutral-400">{a.time}</p>
                  </div>
                </div>
              );
            })}
            {data.recentActivity.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-500">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}