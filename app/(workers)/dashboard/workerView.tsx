"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dashboardBanner1 from "@/components/assets/images/dashboard-banner-1.png";
import dashboardBanner2 from "@/components/assets/images/dashboard-banner-2.png";
import dashboardBanner3 from "@/components/assets/images/dashboard-banner-3.png";
import WorkerSummary from "@/components/workerSummary";
import RecentActivity from "@/components/worker-activity";

// Sample data
const WORKER_NAME = "WORKER'S NAME";

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

const INITIAL_SHIFT_REQUESTS = [
  {
    id: 1,
    month: "JULY",
    date: "14",
    day: "TUESDAY",
    time: "6:00 AM - 5:00 PM",
    task: "WRAPPING OF PINIPIG",
  },
  {
    id: 2,
    month: "JULY",
    date: "15",
    day: "WEDNESDAY",
    time: "6:00 AM - 5:00 PM",
    task: "MIXING & COATING",
  },
];

const UPCOMING_SHIFTS = [
  {
    id: 1,
    date: "JULY 21, 2026",
    day: "TUESDAY",
    time: "6:00 AM - 5:00 PM",
    task: "COATING",
    status: "ACCEPTED",
  },
  {
    id: 2,
    date: "JULY 22, 2026",
    day: "WEDNESDAY",
    time: "6:00 AM - 5:00 PM",
    task: "MIXING",
    status: "PENDING",
  },
];

const STATUS_STYLES: Record<string, string> = {
  ACCEPTED: "text-[#1A9E3A] bg-[#E3F4E6]",
  PENDING: "text-[#FD950F] bg-[#FEF3E6]",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${
        STATUS_STYLES[status] ?? "text-neutral-500 bg-neutral-100"
      }`}
    >
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [shiftRequests, setShiftRequests] = useState(
    INITIAL_SHIFT_REQUESTS,
  );

  useEffect(() => {
    const timer = setInterval(
      () => setSlideIndex((index) => (index + 1) % HERO_SLIDES.length),
      SLIDE_INTERVAL_MS,
    );

    return () => clearInterval(timer);
  }, []);

  const handleAccept = (id: number) => {
    console.log("Accepted shift request", id);

    setShiftRequests((previous) =>
      previous.filter((request) => request.id !== id),
    );
  };

  const handleDecline = (id: number) => {
    console.log("Declined shift request", id);

    setShiftRequests((previous) =>
      previous.filter((request) => request.id !== id),
    );
  };

  const slide = HERO_SLIDES[slideIndex];

  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
      {/* Left side */}
      <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
        {/* Hero carousel */}
        <div
          className="relative min-h-[200px] overflow-hidden rounded-2xl border border-[#D9D9D9] bg-gradient-to-br from-sky-300 to-sky-100 bg-cover bg-[position:75%_center] bg-no-repeat p-5 shadow-md transition-[background-image] sm:min-h-[230px] sm:bg-[length:110%] sm:bg-[position:20%_10%] sm:p-8"
          style={{ backgroundImage: `url(${slide.image.src})` }}
        >
          <div className="max-w-sm">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-[hsl(var(--dark-blue))] sm:text-3xl">
              GOOD DAY,
              <br />
              {WORKER_NAME}
            </h1>

            <p className="mt-3 text-sm text-[hsl(var(--dark-blue))]">
              {slide.subtitle}
            </p>
          </div>

          {/* Carousel controls */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3 sm:bottom-5">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-pressed={index === slideIndex}
                onClick={() => setSlideIndex(index)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  index === slideIndex
                    ? "bg-[#0050D3]"
                    : "bg-[#0050D3]/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* This week */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[hsl(var(--dark-blue))]">
              THIS WEEK
            </h2>

            <Link
              href="/shared_calendar"
              className="text-[11px] font-semibold text-[#0050D3] underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
            {WEEK_DAYS.map((day) => (
              <div
                key={day.label}
                className={`h-14 min-w-0 rounded-md border p-1 text-[9px] font-bold text-[hsl(var(--dark-blue))] sm:h-16 sm:p-1.5 sm:text-[10px] ${
                  day.hasShift
                    ? "border-[#0050D3] bg-[#C9DAF8]"
                    : "border-[#D9D9D9] bg-[#F5F5F5]"
                }`}
              >
                {day.label}
              </div>
            ))}
          </div>
        </div>

        {/* Shift requests */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[hsl(var(--dark-blue))]">
              SHIFT REQUESTS
            </h2>

            <Link
              href="/my_shift"
              className="text-[11px] font-semibold text-[#0050D3] underline"
            >
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {shiftRequests.length === 0 && (
              <p className="text-sm text-neutral-400">
                No pending shift requests.
              </p>
            )}

            {shiftRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-start gap-3 lg:items-center"
              >
                {/* Date */}
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-border text-[hsl(var(--dark-blue))]">
                  <span className="text-[9px] font-bold leading-none">
                    {request.month}
                  </span>

                  <span className="text-lg font-extrabold leading-tight">
                    {request.date}
                  </span>
                </div>

                {/* Shift details */}
                <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg border border-border px-3 py-3 sm:px-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-4 lg:py-2">
                  <div className="text-[10px] font-bold leading-snug text-[hsl(var(--dark-blue))]">
                    <p>{request.day}</p>
                    <p>{request.time}</p>
                  </div>

                  <p className="min-w-0 break-words text-[11px] font-bold text-[hsl(var(--dark-blue))] lg:flex-1 lg:text-center">
                    {request.task}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(request.id)}
                      className="flex-1 rounded-lg bg-[#0050D3] px-4 py-2.5 text-[10px] font-bold text-white transition-colors hover:bg-[#003FA7] lg:flex-none lg:px-6 lg:py-2"
                    >
                      ACCEPT
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDecline(request.id)}
                      className="flex-1 rounded-lg border border-[#0050D3] bg-white px-4 py-2.5 text-[10px] font-bold text-[#0050D3] transition-colors hover:bg-blue-50 lg:flex-none lg:px-6 lg:py-2"
                    >
                      DECLINE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming shifts */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[hsl(var(--dark-blue))]">
              UPCOMING SHIFTS
            </h2>

            <Link
              href="/my_shift"
              className="text-[11px] font-semibold text-[#0050D3] underline"
            >
              View All
            </Link>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {UPCOMING_SHIFTS.map((shift) => (
              <div
                key={shift.id}
                className="rounded-lg border border-border p-3 text-[11px] text-[hsl(var(--dark-blue))]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{shift.date}</span>
                  <StatusBadge status={shift.status} />
                </div>

                <p className="mt-1.5 font-semibold">
                  {shift.day} • {shift.time}
                </p>

                <p className="mt-1 font-bold">{shift.task}</p>
              </div>
            ))}
          </div>

          {/* Desktop rows */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-5 gap-1 px-3 pb-2 text-center text-[11px] font-semibold text-[hsl(var(--dark-blue))]">
              <span>DATE</span>
              <span>DAY</span>
              <span>TIME</span>
              <span>TASK</span>
              <span>STATUS</span>
            </div>

            <div className="flex flex-col gap-3">
              {UPCOMING_SHIFTS.map((shift) => (
                <div
                  key={shift.id}
                  className="grid grid-cols-5 items-center gap-1 rounded-lg border border-border px-3 py-2 text-center text-[11px] font-bold text-[hsl(var(--dark-blue))]"
                >
                  <span className="min-w-0 break-words">
                    {shift.date}
                  </span>

                  <span className="min-w-0 break-words">
                    {shift.day}
                  </span>

                  <span className="min-w-0 break-words">
                    {shift.time}
                  </span>

                  <span className="min-w-0 break-words">
                    {shift.task}
                  </span>

                  <span className="min-w-0">
                    <StatusBadge status={shift.status} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Worker Summary & Recent Activity */}
      <div className="grid min-w-0 grid-cols-1 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
        <WorkerSummary />
        <RecentActivity />
      </div>
    </div>
  );
}