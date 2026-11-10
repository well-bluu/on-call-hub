"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import dashboardBanner1 from "@/components/assets/images/dashboard-banner-1.png";
import dashboardBanner2 from "@/components/assets/images/dashboard-banner-2.png";
import dashboardBanner3 from "@/components/assets/images/dashboard-banner-3.png";

import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Cross,
  User,
} from "lucide-react";

// ==========================================
// DASHBOARD DATA
// ==========================================

const OWNER_NAME = "Mrs. ARENAL!";

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

const WEEK_DAYS = [
  { label: "SUN", hasShift: true },
  { label: "MON", hasShift: true },
  { label: "TUE", hasShift: true },
  { label: "WED", hasShift: false },
  { label: "THU", hasShift: false },
  { label: "FRI", hasShift: false },
  { label: "SAT", hasShift: true },
];

type ShiftStatus = "COMPLETE" | "PENDING";

const TODAY_COLS = "1.2fr 1.4fr 1fr 1fr";
const UPCOMING_COLS = "1.2fr 1.2fr 1fr 0.8fr 1fr";

const TODAYS_SHIFTS: {
  id: number;
  time: string;
  assigned: number;
  required: number;
  status: ShiftStatus;
}[] = [
  {
    id: 1,
    time: "6:00 AM - 5:00 PM",
    assigned: 4,
    required: 4,
    status: "COMPLETE",
  },
  {
    id: 2,
    time: "6:00 AM - 5:00 PM",
    assigned: 2,
    required: 4,
    status: "PENDING",
  },
];

const UPCOMING_SHIFTS: {
  id: number;
  date: string;
  time: string;
  filled: number;
  required: number;
  task: string;
  status: ShiftStatus;
}[] = [
  {
    id: 1,
    date: "JULY 21, 2026",
    time: "6:00 AM - 5:00 PM",
    filled: 4,
    required: 4,
    task: "COATING",
    status: "COMPLETE",
  },
  {
    id: 2,
    date: "JULY 22, 2026",
    time: "6:00 AM - 5:00 PM",
    filled: 2,
    required: 4,
    task: "MIXING",
    status: "PENDING",
  },
];

// ==========================================
// WORKER SUMMARY
// ==========================================

// `label` is used on mobile, `webLabel` is used on the web (desktop) version.
const WORKER_SUMMARY = [
  {
    icon: CalendarCheck,
    value: "2",
    label: "ACTIVE",
    webLabel: "AVAILABLE",
    box: "bg-[#E7F0FF] border-[#0050D3]",
    iconColor: "text-[#0050D3]",
  },
  {
    icon: Cross,
    value: "2",
    label: "INACTIVE",
    webLabel: "ON LEAVE",
    box: "bg-[#FCE5E5] border-[#FF0000]",
    iconColor: "text-[#FF0000]",
  },
  {
    icon: CheckCircle2,
    value: "2",
    label: "TEXT",
    webLabel: "TEXT",
    box: "bg-[#E3F4E6] border-[#009B25]",
    iconColor: "text-[#009B25]",
  },
  {
    icon: Clock3,
    value: "2",
    label: "BUSY",
    webLabel: "BUSY",
    box: "bg-[#FFF2E2] border-[#FF9500]",
    iconColor: "text-[#FF9500]",
  },
];

// ==========================================
// RECENT ACTIVITY
// ==========================================

const RECENT_ACTIVITY = [
  {
    id: 1,
    icon: Calendar,
    iconBox: "bg-[#E3F4E6] text-[#1A9E3A]",
    title: "WORKER ACCEPTED",
    titleColor: "text-[#1A9E3A]",
    description: "Wrapping of Pinipig",
    time: "Today • 2 mins ago",
  },
  {
    id: 2,
    icon: User,
    iconBox: "bg-[#FEF3E6] text-[#FD950F]",
    title: "PROFILE UPDATED BY...",
    titleColor: "text-[hsl(var(--dark-blue))]",
    description: "Description",
    time: "Today • 2 mins ago",
  },
  {
    id: 3,
    icon: Calendar,
    iconBox: "bg-[#E3F4E6] text-[#1A9E3A]",
    title: "TEXT",
    titleColor: "text-[#1A9E3A]",
    description: "Description",
    time: "Today • 2 mins ago",
  },
  {
    id: 4,
    icon: Calendar,
    iconBox: "bg-[#E3F4E6] text-[#1A9E3A]",
    title: "TEXT",
    titleColor: "text-[#1A9E3A]",
    description: "Description",
    time: "Today • 2 mins ago",
  },
];

// ==========================================
// SHIFT STATUS STYLES
// ==========================================

const STATUS_STYLES: Record<
  ShiftStatus,
  {
    row: string;
    text: string;
    badge: string;
    avatar: string;
  }
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

// ==========================================
// REUSABLE COMPONENTS
// ==========================================

function HeaderPill({
  children,
}: {
  children: React.ReactNode;
}) {
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

// ==========================================
// WORKER SUMMARY COMPONENT
// ==========================================

function WorkerSummary() {
  return (
    <section className="rounded-xl border border-border bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:p-5">
      <h3 className="mb-4 text-left text-[15px] font-bold text-[hsl(var(--dark-blue))] sm:text-[16px] lg:text-center lg:text-sm lg:tracking-wide">
        WORKER SUMMARY
      </h3>

      {/* MOBILE VIEW (unchanged layout) */}

      <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:hidden">
        {WORKER_SUMMARY.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`
                flex aspect-square min-w-0
                flex-col items-center justify-center
                rounded-[22px] border-[0.75px]
                px-1 py-2
                ${item.box}
              `}
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

      {/* WEB VIEW (2 x 2 grid, same sizing as the worker's summary) */}

      <div className="hidden grid-cols-2 gap-4 lg:grid">
        {WORKER_SUMMARY.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.webLabel}
              className={`
                flex h-[88px] min-w-0
                flex-col items-center justify-center
                rounded-xl border
                ${item.box}
              `}
            >
              <Icon
                className={`mb-1 h-7 w-7 shrink-0 ${item.iconColor}`}
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

// ==========================================
// RECENT ACTIVITY COMPONENT
// ==========================================

function RecentActivity() {
  return (
    <section className="rounded-xl border border-border bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:p-5">
      <SectionHeader
        title="RECENT ACTIVITY"
        href="/owner/notifications"
      />

      <div className="flex flex-col gap-5">
        {RECENT_ACTIVITY.map((activity) => {
          const Icon = activity.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${activity.iconBox}`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>

              <div className="min-w-0 leading-tight">
                <p
                  className={`text-[11px] font-bold ${activity.titleColor}`}
                >
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
      </div>
    </section>
  );
}

// ==========================================
// PAGE
// ==========================================

export default function OwnerDashboardPage() {
  const [slideIndex, setSlideIndex] = useState(0);

  // HERO CAROUSEL
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[slideIndex];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">

      {/* ================================== */}
      {/* LEFT SIDE */}
      {/* ================================== */}

      <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-2">

        {/* HERO BANNER */}

        <section
          style={{
            backgroundImage: `url(${slide.image.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
          className={`relative min-h-[175px] overflow-hidden rounded-2xl border border-[#D9D9D9] bg-cover bg-no-repeat p-5 shadow-sm sm:min-h-[200px] sm:p-6 lg:min-h-[230px] lg:p-8 ${
            slideIndex === 0
              ? "hero-slide-one"
              : "bg-center"
          }`}
        >
          <div className="relative z-10 max-w-[65%] sm:max-w-sm">
            <h1 className="text-xl font-extrabold leading-tight tracking-tight text-[hsl(var(--dark-blue))] sm:text-2xl lg:text-3xl">
              GOOD DAY,
              <br />
              {OWNER_NAME}
            </h1>

            {/* MOBILE-ONLY LINE BREAK ON FIRST SLIDE */}

            <p className="mt-2 text-xs text-[hsl(var(--dark-blue))] sm:mt-3 sm:text-sm">
              {slideIndex === 0 ? (
                <>
                  Here's your overview
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
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === slideIndex}
                onClick={() => setSlideIndex(i)}
                className={`h-2.5 w-2.5 rounded-full transition-colors sm:h-3 sm:w-3 ${
                  i === slideIndex
                    ? "bg-[#0050D3]"
                    : "bg-[#0050D3]/40"
                }`}
              />
            ))}
          </div>
        </section>

        {/* MOBILE WORKER SUMMARY */}

        <div className="lg:hidden">
          <WorkerSummary />
        </div>

        {/* THIS WEEK */}

        <section className="rounded-xl border border-border bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:p-5">
          <SectionHeader
            title="THIS WEEK"
            href="/owner/shift-management"
          />

          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[480px] grid-cols-7 gap-2 sm:min-w-0 sm:gap-3">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day.label}
                  className={`flex h-[72px] flex-col items-center justify-start rounded-lg border p-2 text-[10px] font-bold text-[hsl(var(--dark-blue))] sm:h-20 sm:text-xs ${
                    day.hasShift
                      ? "border-[#0050D3] bg-[#C9DAF8]"
                      : "border-[#D9D9D9] bg-[#F5F5F5]"
                  }`}
                >
                  <span className="rounded-full bg-white px-2 py-0.5">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================== */}
        {/* TODAY'S SHIFT ASSIGNMENT */}
        {/* ================================== */}

        <section className="rounded-xl border border-border bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:p-5">
          <SectionHeader
            title="TODAY'S SHIFT ASSIGNMENT"
            href="/owner/shift-management"
          />

          {/* MOBILE CARD VIEW */}

          <div className="flex flex-col gap-3 lg:hidden">
            {TODAYS_SHIFTS.map((shift) => {
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
                        {Array.from({ length: shift.assigned }).map(
                          (_, i) => (
                            <CircleUserRound
                              key={i}
                              className="h-5 w-5 text-[hsl(var(--dark-blue))]"
                              strokeWidth={1.8}
                            />
                          )
                        )}
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
          </div>

          {/* DESKTOP TABLE VIEW */}

          <div className="hidden lg:block">
            <div
              className="grid items-center px-3 pb-2 text-center"
              style={{ gridTemplateColumns: TODAY_COLS }}
            >
              <HeaderPill>TIME</HeaderPill>
              <HeaderPill>ASSIGNED WORKERS</HeaderPill>
              <HeaderPill>FILLED / REQUIRED</HeaderPill>
              <HeaderPill>STATUS</HeaderPill>
            </div>

            <div className="flex flex-col gap-3">
              {TODAYS_SHIFTS.map((shift) => {
                const style = STATUS_STYLES[shift.status];

                return (
                  <div
                    key={shift.id}
                    style={{ gridTemplateColumns: TODAY_COLS }}
                    className={`grid items-center rounded-lg px-3 py-3 text-center text-[11px] font-bold ${style.row} ${style.text}`}
                  >
                    <span>{shift.time}</span>

                    <span className="flex items-center justify-center gap-1">
                      {Array.from({ length: shift.assigned }).map(
                        (_, i) => (
                          <CircleUserRound
                            key={i}
                            className={`h-5 w-5 ${style.avatar}`}
                            strokeWidth={1.8}
                          />
                        )
                      )}
                    </span>

                    <span>
                      {shift.assigned}/{shift.required}
                    </span>

                    <span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-bold ${style.badge}`}
                      >
                        {shift.status}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================== */}
        {/* UPCOMING SHIFTS */}
        {/* ================================== */}

        <section className="rounded-xl border border-border bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:p-5">
          <SectionHeader
            title="UPCOMING SHIFTS"
            href="/owner/shift-management"
          />

          {/* MOBILE CARD VIEW */}

          <div className="flex flex-col gap-3 lg:hidden">
            {UPCOMING_SHIFTS.map((shift) => {
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

                  <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                    <div>
                      <p className="text-[9px] font-semibold text-[hsl(var(--dark-blue))]/70">
                        DATE
                      </p>

                      <p className="mt-1 text-[11px] font-bold text-[hsl(var(--dark-blue))] sm:text-xs">
                        {shift.date}
                      </p>
                    </div>

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
                        FILLED / REQUIRED
                      </p>

                      <p className="mt-1 text-sm font-extrabold text-[hsl(var(--dark-blue))]">
                        {shift.filled}/{shift.required}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold text-[hsl(var(--dark-blue))]/70">
                        TASK
                      </p>

                      <p className="mt-1 text-xs font-bold text-[hsl(var(--dark-blue))]">
                        {shift.task}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW */}

          <div className="hidden lg:block">
            <div
              className="grid items-center px-3 pb-2 text-center"
              style={{ gridTemplateColumns: UPCOMING_COLS }}
            >
              <HeaderPill>DATE</HeaderPill>
              <HeaderPill>TIME</HeaderPill>
              <HeaderPill>FILLED / REQUIRED</HeaderPill>
              <HeaderPill>TASK</HeaderPill>
              <HeaderPill>STATUS</HeaderPill>
            </div>

            <div className="flex flex-col gap-3">
              {UPCOMING_SHIFTS.map((shift) => {
                const style = STATUS_STYLES[shift.status];

                return (
                  <div
                    key={shift.id}
                    style={{ gridTemplateColumns: UPCOMING_COLS }}
                    className={`grid items-center rounded-lg px-3 py-3 text-center text-[11px] font-bold ${style.row} ${style.text}`}
                  >
                    <span>{shift.date}</span>
                    <span>{shift.time}</span>

                    <span>
                      {shift.filled}/{shift.required}
                    </span>

                    <span>{shift.task}</span>

                    <span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-bold ${style.badge}`}
                      >
                        {shift.status}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MOBILE RECENT ACTIVITY */}

        <div className="lg:hidden">
          <RecentActivity />
        </div>
      </div>

      {/* ================================== */}
      {/* RIGHT SIDE - DESKTOP */}
      {/* ================================== */}

      <div className="hidden min-w-0 flex-col gap-6 lg:flex">
        <WorkerSummary />

        <RecentActivity />
      </div>
    </div>
  );
}