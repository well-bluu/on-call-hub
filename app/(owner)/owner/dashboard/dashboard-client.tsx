"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Cross,
  // UserX,
} from "lucide-react";

import dashboardBanner1 from "@/components/assets/images/dashboard-banner-1.png";
import dashboardBanner2 from "@/components/assets/images/dashboard-banner-2.png";
import dashboardBanner3 from "@/components/assets/images/dashboard-banner-3.png";
import { createClient } from "@/lib/supabase/client";
import {
  fmtClock,
  fmtLongDate,
  timeAgo,
  toLocalKey,
} from "@/lib/shifts/format";

const HERO_SLIDES = [
  {
    subtitle: "Here's your overview for today.",
    image: dashboardBanner1,
  },
  {
    subtitle: "Check your shifts for this week.",
    image: dashboardBanner2,
  },
  {
    subtitle: "Review your pending shift requests.",
    image: dashboardBanner3,
  },
];

const SLIDE_INTERVAL_MS = 5000;
const WEEK_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type ShiftStatus = "COMPLETE" | "PENDING";

type SummaryItem = {
  icon: typeof CheckCircle2;
  value: string;
  label: string;
  webLabel: string;
  box: string;
  iconColor: string;
};

const WORKER_SUMMARY: Omit<SummaryItem, "value">[] = [
  {
    icon: CalendarCheck,
    label: "ACTIVE",
    webLabel: "AVAILABLE",
    box: "bg-[#E7F0FF] border-[#0050D3]",
    iconColor: "text-[#0050D3]",
  },
  {
    icon: Cross,
    label: "INACTIVE",
    webLabel: "ON LEAVE",
    box: "bg-[#FCE5E5] border-[#FF0000]",
    iconColor: "text-[#FF0000]",
  },
  {
    icon: CheckCircle2,
    label: "TEXT",
    webLabel: "TEXT",
    box: "bg-[#E3F4E6] border-[#009B25]",
    iconColor: "text-[#009B25]",
  },
  {
    icon: Clock3,
    label: "BUSY",
    webLabel: "BUSY",
    box: "bg-[#FFF2E2] border-[#FF9500]",
    iconColor: "text-[#FF9500]",
  },
];

const ACTIVITY_STYLE: Record<string, { iconBox: string; titleColor: string }> = {
  accepted: {
    iconBox: "bg-[#E3F4E6] text-[#1A9E3A]",
    titleColor: "text-[#1A9E3A]",
  },
  declined: {
    iconBox: "bg-[#FEF3E6] text-[#FD950F]",
    titleColor: "text-[#FD950F]",
  },
  expired: {
    iconBox: "bg-[#FEF3E6] text-[#FD950F]",
    titleColor: "text-[#FD950F]",
  },
  cancelled: {
    iconBox: "bg-slate-100 text-slate-500",
    titleColor: "text-slate-500",
  },
};

type DashboardData = {
  ownerName: string;
  weekDays: { label: string; hasShift: boolean }[];
  todaysShifts: {
    id: string;
    time: string;
    assigned: number;
    required: number;
    status: ShiftStatus;
  }[];
  upcomingShifts: {
    id: string;
    date: string;
    time: string;
    filled: number;
    required: number;
    task: string;
    status: ShiftStatus;
  }[];
  workerCounts: { active: number; inactive: number };
  recentActivity: {
    id: string;
    icon: typeof Calendar;
    iconBox: string;
    title: string;
    titleColor: string;
    description: string;
    time: string;
  }[];
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
  const weekStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay(),
  );
  const todayKey = toLocalKey(now);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, shiftsRes, workersRes, activityRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user?.id ?? "")
      .maybeSingle(),
    supabase
      .from("shifts")
      .select(
        "id, shift_name, starts_at, ends_at, required_workers, status, shift_assignments(response_status)",
      )
      .neq("status", "cancelled")
      .gte("ends_at", weekStart.toISOString())
      .order("starts_at"),
    supabase.rpc("list_workers"),
    supabase
      .from("shift_assignments")
      .select(
        "id, worker_id, response_status, responded_at, shifts!inner(shift_name)",
      )
      .not("responded_at", "is", null)
      .order("responded_at", { ascending: false })
      .limit(4),
  ]);

  if (profileRes.error || shiftsRes.error || workersRes.error || activityRes.error) {
    throw (
      profileRes.error ??
      shiftsRes.error ??
      workersRes.error ??
      activityRes.error
    );
  }

  const shifts = (shiftsRes.data ?? []).map((shift) => {
    const start = new Date(shift.starts_at);
    const end = new Date(shift.ends_at);

    return {
      id: shift.id,
      key: toLocalKey(start),
      start,
      time: `${fmtClock(start)} - ${fmtClock(end)}`,
      name: shift.shift_name,
      required: shift.required_workers,
      accepted: (shift.shift_assignments ?? []).filter(
        (assignment) => assignment.response_status === "accepted",
      ).length,
      status: statusOf(shift.status),
    };
  });

  const workers = workersRes.data ?? [];
  const names = new Map(
    workers.map((worker) => [
      worker.id,
      `${worker.first_name ?? ""} ${worker.last_name ?? ""}`.trim(),
    ]),
  );
  const active = workers.filter(
    (worker) => worker.account_status === "active",
  ).length;

  return {
    ownerName: `${(profileRes.data?.first_name ?? "").toUpperCase()}!`,
    weekDays: WEEK_LABELS.map((label, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);
      return {
        label,
        hasShift: shifts.some((shift) => shift.key === toLocalKey(date)),
      };
    }),
    todaysShifts: shifts
      .filter((shift) => shift.key === todayKey)
      .map((shift) => ({
        id: shift.id,
        time: shift.time,
        assigned: shift.accepted,
        required: shift.required,
        status: shift.status,
      })),
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
    workerCounts: {
      active,
      inactive: workers.length - active,
    },
    recentActivity: (activityRes.data ?? []).map((activity) => {
      const responseStatus = activity.response_status ?? "cancelled";
      const style = ACTIVITY_STYLE[responseStatus] ?? ACTIVITY_STYLE.cancelled;

      return {
        id: activity.id,
        icon: Calendar,
        ...style,
        title: `WORKER ${responseStatus.toUpperCase()}`,
        description: `${names.get(activity.worker_id) || "A worker"} · ${activity.shifts.shift_name}`,
        time: timeAgo(activity.responded_at!),
      };
    }),
  };
}

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

function HeaderPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-auto inline-block whitespace-nowrap rounded-full bg-[#C9DAF8] px-3 py-0.5 text-[10px] font-bold text-[hsl(var(--dark-blue))]">
      {children}
    </span>
  );
}

function SectionHeader({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="text-[15px] font-bold text-[hsl(var(--dark-blue))] sm:text-[16px]">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-[11px] font-semibold text-[#0050D3] underline sm:text-xs"
        >
          View All
        </Link>
      )}
    </div>
  );
}

// Displays the four worker summary cards using the same layout as the Owner Workers page.
// Active and inactive counts are connected to Supabase; other counts are placeholders.
function WorkerSummary({
  active,
  inactive,
}: {
  active: number;
  inactive: number;
}) {
  const summary: SummaryItem[] = [
    { ...WORKER_SUMMARY[0], value: String(active) },
    { ...WORKER_SUMMARY[1], value: String(inactive) },
    { ...WORKER_SUMMARY[2], value: "0" },
    { ...WORKER_SUMMARY[3], value: "0" },
  ];

  return (
    <section className="rounded-xl border border-border bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:p-5">
      <h3 className="mb-4 text-left text-[15px] font-bold text-[hsl(var(--dark-blue))] sm:text-[16px] lg:text-center lg:text-sm lg:tracking-wide">
        WORKER SUMMARY
      </h3>

      {/* MOBILE AND TABLET VIEW */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:hidden">
        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`flex aspect-square min-w-0 flex-col items-center justify-center rounded-[22px] border-[0.75px] px-1 py-2 ${item.box}`}
            >
              <Icon
                className={`h-6 w-6 shrink-0 sm:h-8 sm:w-8 ${item.iconColor}`}
                strokeWidth={2.2}
              />

              <p className="mt-1 text-lg font-extrabold leading-none text-[hsl(var(--dark-blue))] sm:text-2xl">
                {item.value}
              </p>

              <p className="mt-1 text-center text-[8px] font-extrabold leading-tight text-[hsl(var(--dark-blue))] sm:text-[11px]">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden grid-cols-2 gap-4 lg:grid">
        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`flex h-[88px] min-w-0 flex-col items-center justify-center rounded-xl border ${item.box}`}
            >
              <Icon
                className={`mb-1 h-7 w-7 shrink-0 ${item.iconColor}`}
                strokeWidth={2.2}
              />

              <span className="text-xl font-bold leading-none text-[hsl(var(--dark-blue))]">
                {item.value}
              </span>

              <span className="mt-1 text-center text-[10px] font-bold text-[hsl(var(--dark-blue))]">
                {item.webLabel}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecentActivity({
  activities,
}: {
  activities: DashboardData["recentActivity"];
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:p-5">
      <SectionHeader title="RECENT ACTIVITY" href="/owner/notifications" />

      <div className="flex flex-col gap-5">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${activity.iconBox}`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 leading-tight">
                <p className={`text-[11px] font-bold ${activity.titleColor}`}>
                  {activity.title}
                </p>
                <p className="text-[10px] font-semibold text-[hsl(var(--dark-blue))]">
                  {activity.description}
                </p>
                <p className="mt-1 text-[9px] text-neutral-400">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && (
          <p className="py-4 text-center text-xs text-slate-500">
            No recent activity.
          </p>
        )}
      </div>
    </section>
  );
}

export default function OwnerDashboardPage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    void loadDashboard()
      .then((dashboard) => {
        if (alive) {
          setData(dashboard);
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to load owner dashboard:", error);
        if (alive) setLoadError("Unable to load dashboard data.");
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((index) => (index + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[slideIndex];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      {/* LEFT SIDE */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-2">
        {/* HERO BANNER */}
        <section
          style={{
            backgroundImage: `url(${slide.image.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
          className={`relative min-h-[175px] overflow-hidden rounded-2xl border border-[#D9D9D9] bg-cover bg-no-repeat p-5 shadow-sm sm:min-h-[200px] sm:p-6 lg:min-h-[230px] lg:p-8 ${
            slideIndex === 0 ? "hero-slide-one" : "bg-center"
          }`}
        >
          <div className="max-w-sm">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[hsl(var(--dark-blue))]">
              GOOD DAY, <br />
              {data.ownerName}
            </h1>
            <p className="mt-2 text-xs text-[hsl(var(--dark-blue))] sm:mt-3 sm:text-sm">
              {slideIndex === 0 ? (
                <>
                  Here&apos;s your overview
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline"> </span>
                  for today.
                </>
              ) : (
                slide.subtitle
              )}
            </p>
          </div>

          {/* CAROUSEL DOTS */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === slideIndex}
                onClick={() => setSlideIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition-colors sm:h-3 sm:w-3 ${
                  index === slideIndex
                    ? "bg-[#0050D3]"
                    : "bg-[#0050D3]/40"
                }`}
              />
            ))}
          </div>
        </section>

        {/* MOBILE WORKER SUMMARY */}
        <div className="lg:hidden">
          <WorkerSummary
            active={data.workerCounts.active}
            inactive={data.workerCounts.inactive}
          />
        </div>

        {loadError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {loadError}
          </p>
        )}

        {/* THIS WEEK */}
        <section className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[hsl(var(--dark-blue))]">
              THIS WEEK
            </h2>
            <Link
              href="/owner/shift-management"
              className="text-[11px] font-semibold text-[#0050D3] underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {data.weekDays.map((day) => (
              <div
                key={day.label}
                className={`flex h-16 items-center justify-center rounded-md border p-1.5 text-[10px] font-bold text-[hsl(var(--dark-blue))] ${
                  day.hasShift
                    ? "border-[#0050D3] bg-[#C9DAF8]"
                    : "border-[#D9D9D9] bg-[#F5F5F5]"
                }`}
              >
                {day.label}
              </div>
            ))}
          </div>
        </section>

        {/* TODAY'S SHIFT ASSIGNMENT */}
        <section className="rounded-xl border border-border bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:p-5">
          <SectionHeader
            title="TODAY'S SHIFT ASSIGNMENT"
            href="/owner/shift-management"
          />

          {/* MOBILE CARD VIEW */}
          <div className="flex flex-col gap-3 lg:hidden">
            {data.todaysShifts.map((shift) => {
              const style = STATUS_STYLES[shift.status];
              return (
                <div
                  key={shift.id}
                  className={`rounded-lg p-3 sm:p-4 ${style.row}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2 border-b border-current/20 pb-2">
                    <span className="text-[10px] font-bold text-[hsl(var(--dark-blue))] sm:text-xs">
                      SHIFT STATUS
                    </span>
                    <span
                      className={`rounded-full border bg-white px-3 py-1 text-[9px] font-bold ${style.badge}`}
                    >
                      {shift.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                    <div>
                      <p className="text-[9px] font-semibold text-[hsl(var(--dark-blue))]/70">
                        TIME
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-[hsl(var(--dark-blue))] sm:text-xs">
                        {shift.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-[hsl(var(--dark-blue))]/70">
                        ASSIGNED WORKERS
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        {Array.from({ length: shift.assigned }).map((_, index) => (
                          <CircleUserRound
                            key={index}
                            className="h-5 w-5 text-[hsl(var(--dark-blue))]"
                            strokeWidth={1.8}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-[hsl(var(--dark-blue))]/70">
                        FILLED / REQUIRED
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-[hsl(var(--dark-blue))]">
                        {shift.assigned}/{shift.required}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-[hsl(var(--dark-blue))]/70">
                        STATUS
                      </p>
                      <p className={`mt-1 text-xs font-bold ${style.text}`}>
                        {shift.status}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {data.todaysShifts.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-500">
                No shifts today.
              </p>
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr] items-center px-3 pb-2 text-center">
              <HeaderPill>TIME</HeaderPill>
              <HeaderPill>ASSIGNED WORKERS</HeaderPill>
              <HeaderPill>FILLED / REQUIRED</HeaderPill>
              <HeaderPill>STATUS</HeaderPill>
            </div>

            <div className="flex flex-col gap-3">
              {data.todaysShifts.map((shift) => {
                const style = STATUS_STYLES[shift.status];
                return (
                  <div
                    key={shift.id}
                    className={`grid grid-cols-[1.2fr_1.4fr_1fr_1fr] items-center rounded-lg px-3 py-2 text-center text-[11px] font-bold ${style.row} ${style.text}`}
                  >
                    <span>{shift.time}</span>
                    <span className="flex items-center justify-center gap-1">
                      {Array.from({ length: shift.assigned }).map((_, index) => (
                        <CircleUserRound
                          key={index}
                          className={`h-5 w-5 ${style.avatar}`}
                          strokeWidth={1.8}
                        />
                      ))}
                    </span>
                    <span>
                      {shift.assigned}/{shift.required}
                    </span>
                    <span>
                      <span
                        className={`rounded-full border px-3 py-0.5 text-[10px] font-bold ${style.badge}`}
                      >
                        {shift.status}
                      </span>
                    </span>
                  </div>
                );
              })}
              {data.todaysShifts.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-500">
                  No shifts today.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* UPCOMING SHIFTS */}
        <section className="rounded-xl border border-border bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:p-5">
          <SectionHeader
            title="UPCOMING SHIFTS"
            href="/owner/shift-management"
          />

          {/* MOBILE CARD VIEW */}
          <div className="flex flex-col gap-3 lg:hidden">
            {data.upcomingShifts.map((shift) => {
              const style = STATUS_STYLES[shift.status];
              return (
                <div
                  key={shift.id}
                  className={`rounded-lg p-3 sm:p-4 ${style.row}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2 border-b border-current/20 pb-2">
                    <span className="text-[10px] font-bold text-[hsl(var(--dark-blue))] sm:text-xs">
                      {shift.date}
                    </span>
                    <span
                      className={`rounded-full border bg-white px-3 py-1 text-[9px] font-bold ${style.badge}`}
                    >
                      {shift.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                    <div>
                      <p className="text-[9px] font-semibold text-[hsl(var(--dark-blue))]/70">
                        TIME
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-[hsl(var(--dark-blue))]">
                        {shift.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-[hsl(var(--dark-blue))]/70">
                        TASK
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-[hsl(var(--dark-blue))]">
                        {shift.task}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-[hsl(var(--dark-blue))]/70">
                        FILLED / REQUIRED
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-[hsl(var(--dark-blue))]">
                        {shift.filled}/{shift.required}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-[hsl(var(--dark-blue))]/70">
                        STATUS
                      </p>
                      <p className={`mt-1 text-xs font-bold ${style.text}`}>
                        {shift.status}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {data.upcomingShifts.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-500">
                No upcoming shifts.
              </p>
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-[1.2fr_1.2fr_1fr_0.8fr_1fr] items-center px-3 pb-2 text-center">
                <HeaderPill>DATE</HeaderPill>
                <HeaderPill>TIME</HeaderPill>
                <HeaderPill>FILLED / REQUIRED</HeaderPill>
                <HeaderPill>TASK</HeaderPill>
                <HeaderPill>STATUS</HeaderPill>
              </div>
              <div className="flex flex-col gap-3">
                {data.upcomingShifts.map((shift) => {
                  const style = STATUS_STYLES[shift.status];
                  return (
                    <div
                      key={shift.id}
                      className={`grid grid-cols-[1.2fr_1.2fr_1fr_0.8fr_1fr] items-center rounded-lg px-3 py-3 text-center text-[11px] font-bold ${style.row} ${style.text}`}
                    >
                      <span>{shift.date}</span>
                      <span>{shift.time}</span>
                      <span>
                        {shift.filled}/{shift.required}
                      </span>
                      <span>{shift.task}</span>
                      <span>
                        <span
                          className={`rounded-full border bg-white px-3 py-0.5 text-[10px] font-bold ${style.badge}`}
                        >
                          {shift.status}
                        </span>
                      </span>
                    </div>
                  );
                })}
                {data.upcomingShifts.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-500">
                    No upcoming shifts.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT SIDE - DESKTOP */}
      <div className="hidden min-w-0 flex-col gap-6 lg:flex">
        <WorkerSummary
          active={data.workerCounts.active}
          inactive={data.workerCounts.inactive}
        />
        <RecentActivity activities={data.recentActivity} />
      </div>

      {/* RECENT ACTIVITY - MOBILE/TABLET */}
      <div className="lg:hidden">
        <RecentActivity activities={data.recentActivity} />
      </div>
    </div>
  );
}