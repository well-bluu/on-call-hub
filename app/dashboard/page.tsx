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
  Clock,
  Cross,
  User,
} from "lucide-react";

// HARD-CODED DATA - CHANGE LATER
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
const SLIDE_INTERVAL_MS = 5000; // Auto-slide speed

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
  { id: 1, month: "JULY", date: "14", day: "TUESDAY", time: "6:00 AM - 5:00 PM", task: "WRAPPING OF PINIPIG" },
  { id: 2, month: "JULY", date: "15", day: "WEDNESDAY", time: "6:00 AM - 5:00 PM", task: "MIXING & COATING" },
];

const UPCOMING_SHIFTS = [
  { id: 1, date: "JULY 21, 2026", day: "TUESDAY", time: "6:00 AM - 5:00 PM", task: "COATING", status: "ACCEPTED" },
  { id: 2, date: "JULY 22, 2026", day: "WEDNESDAY", time: "6:00 AM - 5:00 PM", task: "MIXING", status: "PENDING" },
];

const WORKER_SUMMARY = [
  { icon: CalendarCheck, value: "2", label: "TOTAL SHIFTS", box: "bg-[#E6EFFD] border-[#0050D3]", iconColor: "text-[#0050D3]" },
  { icon: Cross, value: "2/5", label: "SICK LEAVE USED", box: "bg-[#FBDEDE] border-[#FF0000]", iconColor: "text-[#FF0000]" },
  { icon: CheckCircle2, value: "2", label: "ATTENDANCE", box: "bg-[#E3F4E6] border-[#1A9E3A]", iconColor: "text-[#1A9E3A]" },
  { icon: Clock, value: "2", label: "TEXT", box: "bg-[#FEF3E6] border-[#FD950F]", iconColor: "text-[#FD950F]" },
];

const RECENT_ACTIVITY = [
  { id: 1, icon: Calendar, iconBox: "bg-[#E3F4E6] text-[#1A9E3A]", title: "NEW SHIFT ASSIGNED", titleColor: "text-[#1A9E3A]", description: "Wrapping of Pinipig", time: "Today • 2 mins ago" },
  { id: 2, icon: User, iconBox: "bg-[#FEF3E6] text-[#FD950F]", title: "PROFILE UPDATED", titleColor: "text-[hsl(var(--dark-blue))]", description: "Description", time: "Today • 2 mins ago" },
  { id: 3, icon: Calendar, iconBox: "bg-[#E3F4E6] text-[#1A9E3A]", title: "TEXT", titleColor: "text-[#1A9E3A]", description: "Description", time: "Today • 2 mins ago" },
  { id: 4, icon: Calendar, iconBox: "bg-[#E3F4E6] text-[#1A9E3A]", title: "TEXT", titleColor: "text-[#1A9E3A]", description: "Description", time: "Today • 2 mins ago" },
];

const STATUS_STYLES: Record<string, string> = {
  ACCEPTED: "text-[#1A9E3A] bg-[#E3F4E6]",
  PENDING: "text-[#FD950F] bg-[#FEF3E6]",
};

// PAGE

export default function DashboardPage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [shiftRequests, setShiftRequests] = useState(INITIAL_SHIFT_REQUESTS);

  // Hero carousel auto-slide
  useEffect(() => {
    const timer = setInterval(
      () => setSlideIndex((i) => (i + 1) % HERO_SLIDES.length),
      SLIDE_INTERVAL_MS
    );
    return () => clearInterval(timer);
  }, []);

  const handleAccept = (id: number) => {
    console.log("Accepted shift request", id);
    setShiftRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = (id: number) => {
    console.log("Declined shift request", id);
    setShiftRequests((prev) => prev.filter((r) => r.id !== id));
  };

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
              {WORKER_NAME}
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
            
            <Link href="/shared_calendar" className="text-[11px] font-semibold text-[#0050D3] underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {WEEK_DAYS.map((d) => (
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

        {/* SHIFT REQUESTS */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[hsl(var(--dark-blue))]">
              SHIFT REQUESTS
            </h2>

            <Link href="/my_shift" className="text-[11px] font-semibold text-[#0050D3] underline">
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {shiftRequests.length === 0 && (
              <p className="text-sm text-neutral-400">No pending shift requests.</p>
            )}

            {shiftRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-3">
                {/* Date box */}
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-border text-[hsl(var(--dark-blue))]">
                  <span className="text-[9px] font-bold leading-none">{req.month}</span>
                  <span className="text-lg font-extrabold leading-tight">{req.date}</span>
                </div>

                {/* Shift info */}
                <div className="flex flex-1 items-center gap-4 rounded-lg border border-border px-4 py-2">
                  <div className="text-[10px] font-bold leading-snug text-[hsl(var(--dark-blue))]">
                    <p>{req.day}</p>
                    <p>{req.time}</p>
                  </div>
                  <p className="flex-1 text-center text-[11px] font-bold text-[hsl(var(--dark-blue))]">
                    {req.task}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAccept(req.id)}
                    className="rounded-lg bg-[#0050D3] px-6 py-2 text-[10px] font-bold text-white hover:bg-[#003FA7] transition-colors"
                  >
                    ACCEPT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(req.id)}
                    className="rounded-lg border border-[#0050D3] bg-white px-6 py-2 text-[10px] font-bold text-[#0050D3] hover:bg-blue-50 transition-colors"
                  >
                    DECLINE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING SHIFTS */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[hsl(var(--dark-blue))]">
              UPCOMING SHIFTS
            </h2>
            
            <Link href="/my_shift" className="text-[11px] font-semibold text-[#0050D3] underline">
              View All
            </Link>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-5 px-3 pb-2 text-center text-[11px] font-semibold text-[hsl(var(--dark-blue))]">
            <span>DATE</span>
            <span>DAY</span>
            <span>TIME</span>
            <span>TASK</span>
            <span>STATUS</span>
          </div>

          {/* Table rows */}
          <div className="flex flex-col gap-3">
            {UPCOMING_SHIFTS.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-5 items-center rounded-lg border border-border px-3 py-2 text-center text-[11px] font-bold text-[hsl(var(--dark-blue))]"
              >
                <span>{s.date}</span>
                <span>{s.day}</span>
                <span>{s.time}</span>
                <span>{s.task}</span>
                <span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      STATUS_STYLES[s.status] ?? "text-neutral-500 bg-neutral-100"
                    }`}
                  >
                    {s.status}
                  </span>
                </span>
              </div>
            ))}
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
            {WORKER_SUMMARY.map((item) => {
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
            
            <Link href="/notifications" className="text-[11px] font-semibold text-[#0050D3] underline">
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            {RECENT_ACTIVITY.map((a) => {
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
          </div>
        </div>
      </div>
    </div>
  );
}