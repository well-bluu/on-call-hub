
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import * as Select from "@radix-ui/react-select";
import { DayPicker } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import {
  Calendar,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Cross,
  SquarePen,
  Trash2,
  User,
} from "lucide-react";

import bannerImage from "@/components/assets/images/workerBanner.png";
import { createClient } from "@/lib/supabase/client";

// ==========================================
// WORKER AND ACTIVITY TYPES
// ==========================================

type Availability = "Available" | "On Leave" | "Busy";
type WorkerStatus = "Active" | "Inactive";

interface Worker {
  id: string;
  name: string;
  contact: string;
  availability: Availability;
  status: WorkerStatus;
}

interface WorkerRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  account_status: string | null;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: "green" | "orange";
}

type SummaryItem = {
  icon: typeof CheckCircle2;
  value: string;
  label: string;
  webLabel: string;
  box: string;
  iconColor: string;
};

// ==========================================
// WORKER SUMMARY CARD DEFINITIONS
// Same definitions as the Owner Dashboard
// ==========================================

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

// ==========================================
// SAMPLE RECENT ACTIVITY
// ==========================================

const ACTIVITIES: Activity[] = [
  {
    id: "a1",
    title: "Worker accepted",
    description: "Wrapping of Pinipig",
    time: "Today • 2 mins ago",
    tone: "green",
  },
  {
    id: "a2",
    title: "Profile updated by...",
    description: "Description",
    time: "Today • 2 mins ago",
    tone: "orange",
  },
  {
    id: "a3",
    title: "Text",
    description: "Description",
    time: "Today • 2 mins ago",
    tone: "green",
  },
  {
    id: "a4",
    title: "Text",
    description: "Description",
    time: "Today • 2 mins ago",
    tone: "green",
  },
];

// ==========================================
// SHARED STYLES
// ==========================================

const card =
  "rounded-xl border border-[#D9D9D9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]";

const navy = "text-[hsl(var(--dark-blue))]";

const inputClass =
  "h-10 w-full min-w-0 rounded-xl bg-[#E6EEFC] px-4 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-700";

const AVAILABILITY_STYLES: Record<Availability, string> = {
  Available: "bg-[#E2F3E6] text-green-700",
  "On Leave": "bg-red-100 text-red-600",
  Busy: "bg-orange-100 text-orange-600",
};

// ==========================================
// WORKERS PAGE BANNER
// ==========================================

function Banner({ image }: { image: StaticImageData }) {
  return (
    <section
      className={`worker-banner relative flex min-h-[145px] items-center overflow-hidden px-5 py-5 sm:min-h-[165px] sm:px-8 lg:min-h-[175px] ${card}`}
      style={{
        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(255,255,255,0.96) 0%,
            rgba(255,255,255,0.94) 25%,
            rgba(255,255,255,0.88) 35%,
            rgba(255,255,255,0.74) 45%,
            rgba(255,255,255,0.54) 55%,
            rgba(255,255,255,0.32) 65%,
            rgba(255,255,255,0.14) 75%,
            rgba(255,255,255,0.04) 85%,
            rgba(255,255,255,0) 100%
          ),
          url(${image.src})
        `,
        backgroundSize: "100% 100%, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      }}
    >
      <div className="relative z-10 max-w-[70%] sm:max-w-sm">
        <h1
          className={`text-2xl font-extrabold uppercase leading-tight sm:text-3xl lg:text-4xl ${navy}`}
        >
          Workers
        </h1>

        <p
          className={`mt-2 text-[11px] font-medium leading-relaxed sm:text-sm ${navy}`}
        >
          Keep track of your team and manage worker{" "}
          <span className="sm:hidden">
            details <br />
          </span>
          <span className="hidden sm:inline">
            <br />
            details{" "}
          </span>
          from one place.
        </p>
      </div>
    </section>
  );
}

// ==========================================
// WORKER SUMMARY
// ==========================================

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

// ==========================================
// RECENT ACTIVITY
// ==========================================

function RecentActivity({ items }: { items: Activity[] }) {
  return (
    <section className={`p-4 sm:p-5 ${card}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className={`text-[15px] font-bold uppercase sm:text-base ${navy}`}>
          Recent Activity
        </h2>

        <Link
          href="/owner/notifications"
          className="shrink-0 text-[11px] font-semibold text-blue-700 underline sm:text-xs"
        >
          View All
        </Link>
      </div>

      <ul className="flex flex-col gap-4 sm:gap-5">
        {items.map((activity) => {
          const isGreen = activity.tone === "green";
          const Icon = isGreen ? Calendar : User;

          return (
            <li key={activity.id} className="flex min-w-0 items-start gap-3">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10 ${
                  isGreen
                    ? "bg-[#E2F3E6] text-green-600"
                    : "bg-orange-50 text-orange-400"
                }`}
              >
                <Icon
                  className="size-5 sm:size-6"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>

              <div className="min-w-0 leading-tight">
                <p
                  className={`truncate text-[11px] font-bold uppercase ${
                    isGreen ? "text-green-600" : navy
                  }`}
                >
                  {activity.title}
                </p>

                <p className="text-[10px] font-semibold text-slate-900">
                  {activity.description}
                </p>

                <p className="mt-1 text-[9px] text-neutral-400">
                  {activity.time}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ==========================================
// PERSONAL INFORMATION FORM TYPES
// ==========================================

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  dob: "",
  email: "",
  gender: "",
  address: "",
};

type FormState = typeof EMPTY_FORM;

// ==========================================
// FORM FIELD
// ==========================================

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className={`text-sm font-bold uppercase sm:text-base ${navy}`}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

// ==========================================
// STYLED SELECT
// ==========================================

function StyledSelect({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  id,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  ariaLabel: string;
  id?: string;
  compact?: boolean;
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        id={id}
        aria-label={ariaLabel}
        className={`${
          compact
            ? "h-9 min-w-0 gap-1 rounded-lg px-2 text-xs font-semibold"
            : "h-10 w-full rounded-xl px-4 text-sm"
        } flex min-w-0 items-center justify-between bg-[#E6EEFC] text-slate-900 outline-none transition-colors hover:bg-[#DCE7FA] focus-visible:ring-2 focus-visible:ring-blue-700`}
      >
        <Select.Value placeholder={placeholder} />

        <Select.Icon>
          <ChevronDown className="size-4 shrink-0 text-slate-700" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={5}
          collisionPadding={8}
          className="z-[100] max-h-[min(18rem,var(--radix-select-content-available-height))] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
          style={{ minWidth: "var(--radix-select-trigger-width)" }}
        >
          <Select.ScrollUpButton className="flex h-6 items-center justify-center text-slate-500">
            ⌃
          </Select.ScrollUpButton>

          <Select.Viewport className="max-h-60">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none data-[highlighted]:bg-[#E6EEFC] data-[state=checked]:bg-[#E6EEFC]"
              >
                <Select.ItemText>{option.label}</Select.ItemText>

                <Select.ItemIndicator>
                  <Check className="size-4 text-blue-600" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex h-6 items-center justify-center text-slate-500">
            ⌄
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

// ==========================================
// DATE OF BIRTH PICKER
// ==========================================

const MONTHS = Array.from({ length: 12 }, (_, month) => ({
  value: String(month),
  label: format(new Date(2020, month, 1), "MMMM"),
}));

const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, index) => ({
  value: String(CURRENT_YEAR - index),
  label: String(CURRENT_YEAR - index),
}));

function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsed = value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  const [month, setMonth] = useState<Date>(() => selected ?? new Date());

  const today = new Date();
  const earliest = new Date(1900, 0, 1);

  const canPrevious =
    month.getFullYear() > 1900 || month.getMonth() > 0;

  const canNext =
    month.getFullYear() < today.getFullYear() ||
    (month.getFullYear() === today.getFullYear() &&
      month.getMonth() < today.getMonth());

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function changeMonth(year: number, monthIndex: number) {
    const next = new Date(year, monthIndex, 1);

    if (next >= earliest && next <= today) {
      setMonth(next);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <button
        id="worker-dob"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) setMonth(selected ?? new Date());
          setOpen(!open);
        }}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={selected ? "text-slate-900" : "text-slate-500"}>
          {selected ? format(selected, "dd/MM/yyyy") : "dd/mm/yyyy"}
        </span>

        <CalendarDays className="size-4 shrink-0 text-slate-700" aria-hidden />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose date of birth"
          className="absolute left-0 top-full z-50 mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-1">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canPrevious}
              onClick={() =>
                changeMonth(month.getFullYear(), month.getMonth() - 1)
              }
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-[#E6EEFC] disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex min-w-0 items-center justify-center gap-1.5">
              <StyledSelect
                compact
                ariaLabel="Calendar month"
                value={String(month.getMonth())}
                onChange={(v) =>
                  changeMonth(month.getFullYear(), Number(v))
                }
                options={MONTHS}
              />

              <StyledSelect
                compact
                ariaLabel="Calendar year"
                value={String(month.getFullYear())}
                onChange={(v) =>
                  changeMonth(
                    Number(v),
                    Math.min(
                      month.getMonth(),
                      Number(v) === today.getFullYear()
                        ? today.getMonth()
                        : 11
                    )
                  )
                }
                options={YEARS}
              />
            </div>

            <button
              type="button"
              aria-label="Next month"
              disabled={!canNext}
              onClick={() =>
                changeMonth(month.getFullYear(), month.getMonth() + 1)
              }
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-[#E6EEFC] disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <DayPicker
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
            disabled={{ before: earliest, after: today }}
            hideNavigation
            showOutsideDays={false}
            classNames={{
              root: "w-full text-slate-800",
              months: "w-full",
              month: "w-full",
              month_caption: "hidden",
              month_grid: "w-full table-fixed border-collapse",
              weekdays: "",
              weekday:
                "pb-2 text-center text-[11px] font-medium text-slate-500",
              week: "",
              day: "p-0 text-center",
              day_button:
                "mx-auto flex size-8 max-w-full items-center justify-center rounded-lg text-xs transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-600",
              selected:
                "[&>button]:bg-blue-600 [&>button]:text-white [&>button]:hover:bg-blue-700",
              today: "font-bold text-blue-600",
              disabled: "text-slate-300 opacity-35",
              outside: "text-slate-300",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ==========================================
// PERSONAL INFORMATION FORM
// ==========================================

function PersonalInformationForm({
  onAdd,
}: {
  onAdd: (form: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const set =
    (key: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((previous) => ({
        ...previous,
        [key]: event.target.value,
      }));
    };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.fullName.trim()) return;

    onAdd(form);
    setForm(EMPTY_FORM);
  };

  return (
    <form onSubmit={submit} className={`flex flex-col p-4 sm:p-6 ${card}`}>
      <h2 className={`px-1 pt-1 text-lg font-bold uppercase sm:text-xl ${navy}`}>
        Personal Information
      </h2>

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-x-8 gap-y-5 px-1 sm:mt-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 lg:gap-x-11">
        <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
          <Field label="Full Name" htmlFor="worker-name">
            <input
              id="worker-name"
              className={inputClass}
              value={form.fullName}
              onChange={set("fullName")}
              required
            />
          </Field>

          <Field label="Date of Birth" htmlFor="worker-dob">
            <DatePicker
              value={form.dob}
              onChange={(dob) =>
                setForm((previous) => ({ ...previous, dob }))
              }
            />
          </Field>

          <Field label="Gender" htmlFor="worker-gender">
            <StyledSelect
              id="worker-gender"
              ariaLabel="Gender"
              value={form.gender}
              onChange={(gender) =>
                setForm((previous) => ({ ...previous, gender }))
              }
              placeholder="Select gender"
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />
          </Field>
        </div>

        <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
          <Field label="Phone Number" htmlFor="worker-phone">
            <input
              id="worker-phone"
              className={inputClass}
              type="tel"
              value={form.phone}
              onChange={set("phone")}
            />
          </Field>

          <Field label="Email Address" htmlFor="worker-email">
            <input
              id="worker-email"
              className={inputClass}
              type="email"
              value={form.email}
              onChange={set("email")}
            />
          </Field>

          <Field label="Address" htmlFor="worker-address">
            <textarea
              id="worker-address"
              className={`${inputClass} h-16 resize-none py-2`}
              value={form.address}
              onChange={set("address")}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex justify-end px-1 sm:mt-auto sm:pt-7">
        <button
          type="submit"
          className="h-10 w-full rounded-lg border-2 border-blue-700 bg-white px-6 text-sm font-bold uppercase text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:w-auto sm:text-base"
        >
          Add Worker
        </button>
      </div>
    </form>
  );
}

// ==========================================
// WORKERS TABLE + MOBILE CARD VIEW
// ==========================================

export function WorkersTable({
  workers,
  onDelete,
  actionStyle = "outline",
}: {
  workers: Worker[];
  onDelete: (id: string) => void;
  actionStyle?: "outline" | "solid";
}) {
  const editClass =
    actionStyle === "solid"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "border border-blue-600 bg-blue-50 text-blue-600 hover:bg-blue-100";

  const deleteClass =
    actionStyle === "solid"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "border border-red-500 bg-red-50 text-red-500 hover:bg-red-100";

  return (
    <section className={`min-w-0 overflow-hidden ${card}`}>
      <div className="flex items-center justify-between gap-2 px-4 py-4 sm:px-6">
        <h2 className={`text-base font-bold uppercase sm:text-lg ${navy}`}>
          Workers List
        </h2>

        <span className="text-xs font-semibold text-slate-500">
          {workers.length} {workers.length === 1 ? "Worker" : "Workers"}
        </span>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="flex flex-col gap-3 px-4 pb-4 md:hidden">
        {workers.length === 0 && (
          <p className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No workers yet.
          </p>
        )}

        {workers.map((worker, index) => (
          <article
            key={worker.id}
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <User className="size-5" strokeWidth={1.75} aria-hidden />
                </span>

                <div className="min-w-0">
                  <p className={`truncate text-sm font-bold ${navy}`}>
                    {worker.name}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Worker #{index + 1}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                  worker.status === "Active"
                    ? "bg-[#E2F3E6] text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {worker.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase text-slate-400">
                  Contact
                </p>

                <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                  {worker.contact || "—"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase text-slate-400">
                  Availability
                </p>

                <span
                  className={`mt-1 inline-block max-w-full truncate rounded-lg px-2.5 py-1 text-[10px] font-bold ${AVAILABILITY_STYLES[worker.availability]}`}
                >
                  {worker.availability}
                </span>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                aria-label={`Edit ${worker.name}`}
                className={`flex size-9 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${editClass}`}
              >
                <SquarePen className="size-4" strokeWidth={1.75} aria-hidden />
              </button>

              <button
                type="button"
                onClick={() => onDelete(worker.id)}
                aria-label={`Delete ${worker.name}`}
                className={`flex size-9 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 ${deleteClass}`}
              >
                <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* TABLE VIEW FOR TABLET AND DESKTOP */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[700px] table-fixed">
          <colgroup>
            <col className="w-[7%]" />
            <col className="w-[23%]" />
            <col className="w-[19%]" />
            <col className="w-[18%]" />
            <col className="w-[17%]" />
            <col className="w-[16%]" />
          </colgroup>

          <thead className={`bg-[#E6EEFC] text-sm uppercase sm:text-base ${navy}`}>
            <tr className="h-16 border-b-[3px] border-slate-300/70">
              <th scope="col" className="font-bold">#</th>
              <th scope="col" className="pl-6 text-left font-bold">Worker Name</th>
              <th scope="col" className="font-bold">Contact</th>
              <th scope="col" className="font-bold">Availability</th>
              <th scope="col" className="font-bold">Status</th>
              <th scope="col" className="font-bold">Action</th>
            </tr>
          </thead>

          <tbody>
            {workers.length === 0 && (
              <tr>
                <td colSpan={6} className="h-24 text-center text-sm text-slate-500">
                  No workers yet.
                </td>
              </tr>
            )}

            {workers.map((worker, index) => (
              <tr
                key={worker.id}
                className="h-20 text-center uppercase text-slate-900"
              >
                <td className="text-xs font-bold">{index + 1}</td>

                <td className="pl-6 text-left">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>

                    <span className="truncate text-xs font-bold">
                      {worker.name}
                    </span>
                  </div>
                </td>

                <td className="truncate px-2 text-xs font-bold">
                  {worker.contact}
                </td>

                <td>
                  <span
                    className={`inline-block max-w-[90%] rounded-lg px-2 py-1.5 text-xs font-bold ${AVAILABILITY_STYLES[worker.availability]}`}
                  >
                    {worker.availability}
                  </span>
                </td>

                <td>
                  <span
                    className={`inline-block rounded-lg px-3 py-1.5 text-xs font-bold ${
                      worker.status === "Active"
                        ? "bg-[#E2F3E6] text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {worker.status}
                  </span>
                </td>

                <td>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      aria-label={`Edit ${worker.name}`}
                      className={`flex size-9 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${editClass}`}
                    >
                      <SquarePen className="size-4" strokeWidth={1.75} aria-hidden />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(worker.id)}
                      aria-label={`Delete ${worker.name}`}
                      className={`flex size-9 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 ${deleteClass}`}
                    >
                      <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ==========================================
// OWNER'S WORKERS PAGE
// ==========================================

export default function OwnerWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  // Load workers using the same Supabase RPC as the Owner Dashboard.
  useEffect(() => {
    let alive = true;

    async function loadWorkers() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("list_workers");

        if (error) throw error;

        const rows = (data ?? []) as WorkerRow[];

        const mappedWorkers: Worker[] = rows.map((worker) => {
          const name =
            `${worker.first_name ?? ""} ${worker.last_name ?? ""}`.trim();

          return {
            id: worker.id,
            name: name || "Unnamed Worker",
            contact: "",
            availability: "Available",
            status:
              worker.account_status === "active" ? "Active" : "Inactive",
          };
        });

        if (alive) {
          setWorkers(mappedWorkers);
        }
      } catch (error) {
        console.error("Failed to load workers:", error);
      } finally {
        if (alive) {
          setLoadingWorkers(false);
        }
      }
    }

    void loadWorkers();

    return () => {
      alive = false;
    };
  }, []);

  const addWorker = (form: FormState) => {
    setWorkers((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        name: form.fullName.trim(),
        contact: form.phone,
        availability: "Available",
        status: "Active",
      },
    ]);
  };

  const deleteWorker = (id: string) => {
    setWorkers((previous) =>
      previous.filter((worker) => worker.id !== id)
    );
  };

  const activeWorkers = workers.filter(
    (worker) => worker.status === "Active"
  ).length;

  const inactiveWorkers = workers.filter(
    (worker) => worker.status === "Inactive"
  ).length;

  return (
    <div className="flex min-w-0 flex-col gap-6 sm:gap-8 lg:gap-10">
      <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_17.75rem] lg:gap-6">
        {/* LEFT COLUMN */}
        <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
          <Banner image={bannerImage} />

          {/* MOBILE WORKER SUMMARY */}
          <div className="lg:hidden">
            <WorkerSummary
              active={activeWorkers}
              inactive={inactiveWorkers}
            />
          </div>

          {loadingWorkers && (
            <p className="text-center text-xs text-slate-500">
              Loading workers...
            </p>
          )}

          <PersonalInformationForm onAdd={addWorker} />

          {/* MOBILE RECENT ACTIVITY */}
          <div className="lg:hidden">
            <RecentActivity items={ACTIVITIES} />
          </div>
        </div>

        {/* RIGHT COLUMN - DESKTOP */}
        <aside className="hidden min-w-0 flex-col gap-6 lg:flex">
          <WorkerSummary
            active={activeWorkers}
            inactive={inactiveWorkers}
          />

          <RecentActivity items={ACTIVITIES} />
        </aside>
      </div>

      {/* WORKERS LIST */}
      <WorkersTable
        workers={workers}
        onDelete={deleteWorker}
        actionStyle="outline"
      />
    </div>
  );
}
