
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { StaticImageData } from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import bannerImage from "@/components/assets/images/shift-management-banner.png";
import { createClient } from "@/lib/supabase/client";

/* Shift types */
type ShiftColor = "green" | "blue" | "orange";

interface ShiftRow {
  id: string;
  date: string;
  start: string;
  end: string;
  task: string;
  required: number;
  filled: number;
  notes?: string;
}

interface CalendarShift {
  time: string;
  label: string;
  color: ShiftColor;
  extraCount?: number;
}

const INITIAL_ROWS: ShiftRow[] = [
  {
    id: "1",
    date: "2026-07-21",
    start: "06:00",
    end: "17:00",
    task: "Coating",
    required: 4,
    filled: 4,
  },
  {
    id: "2",
    date: "2026-07-22",
    start: "06:00",
    end: "17:00",
    task: "Mixing",
    required: 4,
    filled: 2,
  },
];

const INITIAL_CALENDAR: Record<string, CalendarShift> = {
  "2026-07-14": {
    time: "6:00 am - 5:00 pm",
    label: "Coating",
    color: "green",
    extraCount: 2,
  },
  "2026-07-15": {
    time: "6:00 am - 5:00 pm",
    label: "Packaging",
    color: "blue",
    extraCount: 2,
  },
  "2026-07-16": {
    time: "6:00 am - 5:00 pm",
    label: "Mixing",
    color: "orange",
    extraCount: 2,
  },
};

const TASKS = [
  "Coating",
  "Packaging",
  "Mixing",
  "Ice Cream Production",
];

const WORKER_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({
  value: String(n),
  label: String(n),
}));

const SHIFT_STYLES: Record<
  ShiftColor,
  { bg: string; border: string; text: string; badge: string }
> = {
  green: {
    bg: "bg-[#E5F8EC]",
    border: "border-[#1FAA59]",
    text: "text-[#1FAA59]",
    badge: "bg-[#1FAA59]",
  },
  blue: {
    bg: "bg-[#E6EFFD]",
    border: "border-[#0050D3]",
    text: "text-[#0050D3]",
    badge: "bg-[#0050D3]",
  },
  orange: {
    bg: "bg-[#FEF3E6]",
    border: "border-[#FD950F]",
    text: "text-[#FD950F]",
    badge: "bg-[#FD950F]",
  },
};

const COLOR_BY_TASK: Record<string, ShiftColor> = {
  coating: "green",
  packaging: "blue",
  mixing: "orange",
};

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THURS", "FRI", "SAT"];

const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

/* Helpers */
const pad = (n: number) => n.toString().padStart(2, "0");

const toKey = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`;

function fmtTime(t: string, lower = false) {
  const [h, m] = t.split(":").map(Number);
  const s = `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
  return lower ? s.toLowerCase() : s;
}

function parseKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtDate(key: string) {
  return parseKey(key)
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

function fmtDateShort(key: string) {
  return parseKey(key).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Cell {
  day: number;
  monthOffset: -1 | 0 | 1;
  key: string;
}

function buildMonthGrid(year: number, month: number): Cell[] {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrev - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;

    cells.push({
      day,
      monthOffset: -1,
      key: toKey(y, m, day),
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      monthOffset: 0,
      key: toKey(year, month, day),
    });
  }

  let next = 1;

  while (cells.length % 7 !== 0) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;

    cells.push({
      day: next,
      monthOffset: 1,
      key: toKey(y, m, next),
    });

    next++;
  }

  return cells;
}

/* Time input helpers */
type Period = "AM" | "PM";

function to12h(t: string): { text: string; period: Period } {
  const [h, m] = t.split(":").map(Number);

  return {
    text: `${h % 12 || 12}:${pad(m)}`,
    period: h >= 12 ? "PM" : "AM",
  };
}

function to24h(h: number, m: number, period: Period) {
  return `${pad((h % 12) + (period === "PM" ? 12 : 0))}:${pad(m)}`;
}

function formatTypedTime(raw: string) {
  if (raw.includes(":")) {
    const [hour, minute = ""] = raw.split(":");

    return `${hour.replace(/\D/g, "").slice(0, 2)}:${minute
      .replace(/\D/g, "")
      .slice(0, 2)}`;
  }

  const d = raw.replace(/\D/g, "").slice(0, 4);

  if (d.length <= 2) return d;

  if (d.length === 3) {
    const twoDigitHour =
      Number(d.slice(0, 2)) >= 10 &&
      Number(d.slice(0, 2)) <= 12;

    return twoDigitHour
      ? `${d.slice(0, 2)}:${d[2]}`
      : `${d[0]}:${d.slice(1)}`;
  }

  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

function parseTime(
  text: string,
): { h: number; m: number } | null {
  let hourText = text;
  let minuteText = "00";

  if (text.includes(":")) {
    [hourText, minuteText] = text.split(":");

    if (minuteText.length !== 2) return null;
  }

  if (
    !/^\d{1,2}$/.test(hourText) ||
    !/^\d{2}$/.test(minuteText)
  ) {
    return null;
  }

  const h = Number(hourText);
  const m = Number(minuteText);

  return h >= 1 && h <= 12 && m <= 59 ? { h, m } : null;
}

/* Shared styles */
const card =
  "rounded-xl border border-[#D9D9D9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]";

const navy = "text-[hsl(var(--dark-blue))]";

const inputClass =
  "h-9 w-full rounded-lg bg-[#E6EEFC] px-3 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-700";

const popoverClass =
  "absolute left-0 top-full z-30 mt-1 rounded-lg border border-[#D9D9D9] bg-white shadow-[0_6px_18px_rgba(1,34,71,0.18)]";

/* ==========================================
   BANNER
========================================== */

function Banner({ image }: { image: StaticImageData }) {
  return (
    <div
      className={`flex min-h-[125px] items-center overflow-hidden rounded-xl border border-[#D9D9D9] bg-[#EAF1FB] bg-cover bg-[position:right_center] px-4 py-5 shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:h-[150px] sm:px-9 sm:py-0`}
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.85) 38%, rgba(255,255,255,0.12) 100%), url(${image.src})`,
      }}
    >
      <div className="max-w-[75%] sm:max-w-md">
        <h1
          className={`text-2xl font-extrabold uppercase leading-tight sm:text-4xl sm:leading-none ${navy}`}
        >
          Shift Management
        </h1>

        <p className={`mt-2 text-xs font-medium sm:text-sm ${navy}`}>
          Manage shift schedules and assign
          <br />
          workers efficiently.
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   DISMISS POPUP
========================================== */

function useDismiss(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, ref, close]);
}

/* ==========================================
   DROPDOWN
========================================== */

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useDismiss(ref, open, () => setOpen(false));

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className="truncate">{selected?.label ?? ""}</span>

        <ChevronDown
          className={`size-4 shrink-0 ${navy} transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className={`${popoverClass} max-h-56 w-full overflow-y-auto py-1`}
        >
          {options.map((o) => {
            const isSel = o.value === value;

            return (
              <li key={o.value} role="option" aria-selected={isSel}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm ${
                    isSel
                      ? `bg-[#C9DAF5] font-bold ${navy}`
                      : "text-slate-900 hover:bg-[#E6EEFC]"
                  }`}
                >
                  {o.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ==========================================
   DATE PICKER
========================================== */

function DatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const [view, setView] = useState(() => {
    const start = value ? parseKey(value) : new Date(2026, 0, 1);

    return new Date(start.getFullYear(), start.getMonth(), 1);
  });

  const [todayKey, setTodayKey] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useDismiss(ref, open, () => setOpen(false));

  useEffect(() => {
    const now = new Date();

    setTodayKey(
      toKey(now.getFullYear(), now.getMonth(), now.getDate()),
    );

    if (!value) {
      setView(new Date(now.getFullYear(), now.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const year = view.getFullYear();
  const month = view.getMonth();
  const cells = buildMonthGrid(year, month);

  const navBtn =
    "flex size-7 items-center justify-center rounded-full bg-[#012247] text-white transition-colors hover:bg-[#0050D3]";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className="truncate">
          {value ? fmtDateShort(value) : ""}
        </span>

        <ChevronDown
          className={`size-4 shrink-0 ${navy} transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose date"
          className={`${popoverClass} w-[min(16rem,calc(100vw-3rem))] p-3`}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setView(new Date(year, month - 1, 1))}
              className={navBtn}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>

            <span className={`text-sm font-extrabold ${navy}`}>
              {MONTHS[month]} {year}
            </span>

            <button
              type="button"
              aria-label="Next month"
              onClick={() => setView(new Date(year, month + 1, 1))}
              className={navBtn}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>

          <div className="mt-2 border-t border-[#012247]" />

          <div className="grid grid-cols-7 py-2 text-center">
            {WEEKDAYS.map((d) => (
              <span
                key={d}
                className="text-[9px] font-medium text-neutral-500"
              >
                {d.slice(0, 3)}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map(({ day, monthOffset, key }) => {
              const isSel = key === value;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={`flex size-8 items-center justify-center rounded-md text-xs font-medium ${
                    isSel
                      ? "bg-[#012247] text-white"
                      : `hover:bg-[#E6EEFC] ${
                          monthOffset !== 0
                            ? "text-neutral-400"
                            : "text-slate-900"
                        } ${
                          key === todayKey
                            ? "border border-[#012247]"
                            : ""
                        }`
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   TIME INPUT
========================================== */

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const initial = value
    ? to12h(value)
    : { text: "", period: "AM" as Period };

  const [text, setText] = useState(initial.text);
  const [period, setPeriod] = useState<Period>(initial.period);
  const [touched, setTouched] = useState(false);
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value === lastEmitted.current) return;

    lastEmitted.current = value;

    const next = value
      ? to12h(value)
      : { text: "", period: "AM" as Period };

    setText(next.text);
    setPeriod(next.period);
    setTouched(false);
  }, [value]);

  const commit = (nextText: string, nextPeriod: Period) => {
    const parsed = parseTime(nextText);

    const out = parsed
      ? to24h(parsed.h, parsed.m, nextPeriod)
      : "";

    lastEmitted.current = out;
    onChange(out);
  };

  const invalid = touched && text !== "" && parseTime(text) === null;

  return (
    <div
      className={`flex h-9 w-full items-center gap-1 rounded-lg bg-[#E6EEFC] pl-3 pr-1 focus-within:ring-2 focus-within:ring-blue-700 ${
        invalid ? "ring-2 ring-red-500" : ""
      }`}
    >
      <input
        aria-label={label}
        aria-invalid={invalid}
        inputMode="numeric"
        autoComplete="off"
        placeholder="h:mm"
        maxLength={5}
        value={text}
        onChange={(e) => {
          const next = formatTypedTime(e.target.value);

          setText(next);
          commit(next, period);
        }}
        onBlur={() => {
          const parsed = parseTime(text);

          if (parsed) setText(`${parsed.h}:${pad(parsed.m)}`);

          setTouched(true);
        }}
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />

      <div
        role="group"
        aria-label={`${label} AM or PM`}
        className="flex shrink-0 gap-0.5"
      >
        {(["AM", "PM"] as const).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={period === p}
            onClick={() => {
              setPeriod(p);
              commit(text, p);
            }}
            className={`h-7 rounded-md px-2 text-[10px] font-bold transition-colors sm:text-[11px] ${
              period === p
                ? "bg-[#012247] text-white"
                : `${navy} hover:bg-[#C9DAF5]`
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   FORM
========================================== */

const EMPTY_FORM = {
  name: "",
  date: "",
  start: "",
  end: "",
  required: "",
  notes: "",
};

type FormState = typeof EMPTY_FORM;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span
        className={`pl-2 text-xs font-bold uppercase leading-4 sm:pl-3 sm:text-[13px] ${navy}`}
      >
        {label}
      </span>

      {children}
    </div>
  );
}

function AddShiftForm({
  onAdd,
}: {
  onAdd: (f: FormState) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  const update = (key: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.date ||
      !form.start ||
      !form.end ||
      !form.required
    ) {
      setError(
        "Please complete all required fields and enter valid times.",
      );
      return;
    }

    if (form.end <= form.start) {
      setError("End time must be after the start time.");
      return;
    }

    setError("");

    void onAdd(form)
      .then(() => setForm(EMPTY_FORM))
      .catch((submitError) => {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to create the shift.",
        );
      });
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setError("");
  };

  return (
    <form className={`p-4 sm:p-6 ${card}`} onSubmit={submit}>
      <h2
        className={`px-1 text-xl font-bold uppercase leading-7 sm:text-[22px] ${navy}`}
      >
        Add Shift
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 sm:gap-y-6 md:grid-cols-3"> 
        <Field label="Shift Name">
          <Dropdown
            label="Shift name"
            value={form.name}
            onChange={update("name")}
            options={TASKS.map((t) => ({
              value: t,
              label: t,
            }))}
          />
        </Field>

        <Field label="Start Time">
          <TimeInput
            label="Start time"
            value={form.start}
            onChange={update("start")}
          />
        </Field>

        <Field label="End Time">
          <TimeInput
            label="End time"
            value={form.end}
            onChange={update("end")}
          />
        </Field>

        <Field label="Required Workers">
          <Dropdown
            label="Required workers"
            value={form.required}
            onChange={update("required")}
            options={WORKER_OPTIONS}
          />
        </Field>

        <Field label="Date">
          <DatePicker
            label="Date"
            value={form.date}
            onChange={update("date")}
          />
        </Field>

        <Field label="Notes (Optional)">
          <textarea
            aria-label="Notes"
            className={`${inputClass} h-[72px] resize-none py-2`}
            value={form.notes}
            onChange={(e) => update("notes")(e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        {error && (
          <p
            role="alert"
            className="text-xs font-semibold text-red-600 sm:mr-auto"
          >
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={reset}
            className={`h-9 rounded-lg border-2 border-[hsl(var(--dark-blue))] bg-white px-4 text-xs font-bold uppercase sm:text-sm ${navy} hover:bg-slate-50`}
          >
            Reset
          </button>

          <button
            type="submit"
            className={`h-9 rounded-lg bg-[#C9DAF5] px-5 text-xs font-bold uppercase sm:w-[123px] sm:text-sm ${navy} hover:bg-[#b7cdf0]`}
          >
            Add Shift
          </button>
        </div>
      </div>
    </form>
  );
}

/* ==========================================
   SHIFT TABLE / MOBILE CARDS
========================================== */

const GRID =
  "grid grid-cols-[191fr_220fr_213fr_185fr_146fr] items-center";

function ShiftsTable({
  id,
  title,
  linkLabel,
  onLinkClick,
  rows,
}: {
  id?: string;
  title: string;
  linkLabel: string;
  onLinkClick: () => void;
  rows: ShiftRow[];
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-6 p-4 sm:px-7 sm:py-6 ${card}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          className={`text-lg font-bold uppercase leading-7 sm:mt-3 sm:text-[22px] ${navy}`}
        >
          {title}
        </h2>

        <button
          type="button"
          onClick={onLinkClick}
          className="shrink-0 text-[11px] font-semibold text-blue-700 underline sm:text-xs"
        >
          {linkLabel}
        </button>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="mt-5 flex flex-col gap-3 lg:hidden">
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            No shifts yet.
          </p>
        )}

        {rows.map((r) => {
          const complete = r.filled >= r.required;

          const tone = complete
            ? {
                row: "bg-[#E3F2E7]",
                text: "text-[#0E9A1E]",
                pill: "border-[#0E9A1E]",
              }
            : {
                row: "bg-[#FEF1E4]",
                text: "text-[#FD950F]",
                pill: "border-[#FD950F]",
              };

          return (
            <div
              key={r.id}
              className={`rounded-lg p-3 sm:p-4 ${tone.row}`}
            >
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-current/20 pb-2">
                <span className={`text-[10px] font-bold uppercase sm:text-xs ${navy}`}>
                  {fmtDate(r.date)}
                </span>

                <span
                  className={`shrink-0 rounded-lg border px-2 py-1 text-[9px] font-bold uppercase sm:px-3 sm:text-[10px] ${tone.pill} ${tone.text}`}
                >
                  {complete ? "Complete" : "Pending"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                <div>
                  <p className={`text-[9px] font-semibold uppercase ${navy}/70`}>
                    Time
                  </p>

                  <p className={`mt-1 text-[11px] font-bold sm:text-xs ${navy}`}>
                    {fmtTime(r.start)} - {fmtTime(r.end)}
                  </p>
                </div>

                <div>
                  <p className={`text-[9px] font-semibold uppercase ${navy}/70`}>
                    Filled / Required
                  </p>

                  <p className={`mt-1 text-sm font-extrabold ${navy}`}>
                    {r.filled}/{r.required}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className={`text-[9px] font-semibold uppercase ${navy}/70`}>
                    Task
                  </p>

                  <p className={`mt-1 text-xs font-bold uppercase ${navy}`}>
                    {r.task}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="mt-6 hidden overflow-x-auto lg:block">
        <div className="min-w-[44rem]">
          <div className={GRID}>
            {[
              "Date",
              "Time",
              "Filled / Required",
              "Task",
              "Status",
            ].map((h) => (
              <span
                key={h}
                className={`justify-self-center whitespace-nowrap rounded-lg bg-[#C9DAF5] px-4 py-1 text-base font-bold uppercase ${navy}`}
              >
                {h}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-8">
            {rows.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                No shifts yet.
              </p>
            )}

            {rows.map((r) => {
              const complete = r.filled >= r.required;

              const tone = complete
                ? {
                    row: "bg-[#E3F2E7]",
                    text: "text-[#0E9A1E]",
                    pill: "border-[#0E9A1E]",
                  }
                : {
                    row: "bg-[#FEF1E4]",
                    text: "text-[#FD950F]",
                    pill: "border-[#FD950F]",
                  };

              return (
                <div
                  key={r.id}
                  className={`${GRID} h-[60px] rounded-xl text-[17px] font-bold uppercase ${tone.row} ${tone.text}`}
                >
                  <span className="text-center">{fmtDate(r.date)}</span>

                  <span className="text-center">
                    {fmtTime(r.start)} - {fmtTime(r.end)}
                  </span>

                  <span className="text-center">
                    {r.filled}/{r.required}
                  </span>

                  <span className="text-center">{r.task}</span>

                  <span
                    className={`justify-self-center rounded-lg border-2 px-4 py-1.5 leading-none ${tone.pill}`}
                  >
                    {complete ? "Complete" : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================
   SHIFT CALENDAR
========================================== */

function ShiftCalendar({
  shifts,
}: {
  shifts: Record<string, CalendarShift>;
}) {
  const [current, setCurrent] = useState(new Date(2026, 6, 1));
  const [selected, setSelected] = useState<string | null>(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  const cells = buildMonthGrid(year, month);

  const selectedShift = selected ? shifts[selected] : undefined;
  const selectedStyles = selectedShift
    ? SHIFT_STYLES[selectedShift.color]
    : null;

  const goPrev = () => {
    setCurrent(new Date(year, month - 1, 1));
    setSelected(null);
  };

  const goNext = () => {
    setCurrent(new Date(year, month + 1, 1));
    setSelected(null);
  };

  const navBtn =
    "flex size-8 shrink-0 items-center justify-center rounded-full bg-[#012247] text-white transition-colors hover:bg-[#0050D3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:size-10";

  return (
    <section className="min-w-0 rounded-xl border-2 border-[#012247] bg-white p-3 shadow-[0_4px_14px_rgba(0,0,0,0.08)] sm:rounded-[20px] sm:p-6">

      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={goPrev}
          className={navBtn}
        >
          <ChevronLeft className="size-4 sm:size-5" aria-hidden />
        </button>

        <h2 className={`text-center text-lg font-extrabold tracking-tight sm:text-2xl ${navy}`}>
          {MONTHS[month]} {year}
        </h2>

        <button
          type="button"
          aria-label="Next month"
          onClick={goNext}
          className={navBtn}
        >
          <ChevronRight className="size-4 sm:size-5" aria-hidden />
        </button>
      </div>

      <div className="border-t border-[#012247]" />

      {/* Weekday labels */}
      <div className="mb-2 grid grid-cols-7 text-center">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="py-2 text-[10px] font-semibold tracking-wide text-neutral-400 sm:text-xs"
          >
            <span className="sm:hidden">{d.slice(0, 3)}</span>
            <span className="hidden sm:inline">{d}</span>
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-t border-[#D3D3D3]">
        {cells.map(({ day, monthOffset, key }) => {
          const shift = shifts[key];
          const isOtherMonth = monthOffset !== 0;
          const isSelected = selected === key;

          // Empty date
          if (!shift) {
            return (
              <div
                key={key}
                className="flex h-12 items-start justify-center border-b border-r border-[#D3D3D3] p-1 text-center sm:h-16 xl:h-28 xl:p-2 xl:text-right"
              >
                <span
                  className={`text-xs xl:text-sm ${
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
              className="h-12 border-b border-r border-[#D3D3D3] p-0.5 sm:h-16 xl:h-28 xl:p-1"
            >
              {/* Compact cell: mobile and tablet */}
              <button
                type="button"
                onClick={() =>
                  setSelected((previous) =>
                    previous === key ? null : key,
                  )
                }
                aria-label={`Shift on ${fmtDateShort(key)}: ${shift.label}, ${shift.time}`}
                aria-pressed={isSelected}
                className={`flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-md border transition-colors xl:hidden ${styles.bg} ${styles.border} ${
                  isSelected ? "ring-2 ring-[#0050D3]" : ""
                }`}
              >
                <span className="text-xs font-bold text-[hsl(var(--dark-blue))]">
                  {day}
                </span>

                <span
                  className={`flex size-3.5 items-center justify-center rounded-full ${styles.badge} text-white`}
                >
                  <Users className="size-2" aria-hidden />
                </span>
              </button>

              {/* Full cell: desktop */}
              <div
                className={`hidden h-full flex-col justify-between rounded-lg border p-2 transition hover:brightness-95 xl:flex ${styles.bg} ${styles.border}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="flex min-w-0 items-center gap-1">
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded-full ${styles.badge} text-white`}
                    >
                      <Users className="size-2.5" aria-hidden />
                    </span>

                    {shift.extraCount ? (
                      <span className="truncate text-[9px] font-medium text-neutral-500">
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

                <button
                  type="button"
                  onClick={() => setSelected(key)}
                  className={`self-end text-[9px] font-semibold underline ${styles.text}`}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected shift details: mobile and tablet */}
      <div className="mt-4 xl:hidden">
        {selected && selectedShift && selectedStyles ? (
          <div
            className={`rounded-xl border p-4 ${selectedStyles.bg} ${selectedStyles.border}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-[hsl(var(--dark-blue))]">
                {fmtDate(selected)}
              </p>

              {selectedShift.extraCount ? (
                <span className="shrink-0 text-xs font-medium text-neutral-500">
                  +{selectedShift.extraCount} more
                </span>
              ) : null}
            </div>

            <div className={`mt-3 text-sm ${selectedStyles.text}`}>
              <p className="font-semibold">
                {selectedShift.time}
              </p>

              <p className="font-bold">
                {selectedShift.label.toUpperCase()}
              </p>
            </div>
          </div>
        ) : (
          <p className="py-2 text-center text-xs text-neutral-400">
            Tap a highlighted day to see its shift details.
          </p>
        )}
      </div>
    </section>
  );
}

/* ==========================================
   OWNER SHIFT MANAGEMENT PAGE
========================================== */

export default function OwnerShiftManagementPage() {
  const supabase = createClient();

  const [rows, setRows] = useState(INITIAL_ROWS);
  const [calendar, setCalendar] = useState(INITIAL_CALENDAR);
  const [showAllRows, setShowAllRows] = useState(false);

  const sorted = [...rows].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const addShift = async (f: FormState) => {
    const required = Math.max(1, Number(f.required) || 1);

    const startDate = new Date(`${f.date}T${f.start}`);
    const endDate = new Date(`${f.date}T${f.end}`);

    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const { data: shift, error } = await supabase
      .from("shifts")
      .insert({
        shift_name: f.name,
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        required_workers: required,
        notes: f.notes.trim() || null,
      })
      .select("id")
      .single();

    if (error) throw error;

    setRows((prev) => [
      ...prev,
      {
        id: shift.id,
        date: f.date,
        start: f.start,
        end: f.end,
        task: f.name,
        required,
        filled: 0,
        notes: f.notes.trim() || undefined,
      },
    ]);

    setCalendar((prev) => ({
      ...prev,
      [f.date]: {
        time: `${fmtTime(f.start, true)} - ${fmtTime(f.end, true)}`,
        label: f.name,
        color: COLOR_BY_TASK[f.name.toLowerCase()] ?? "blue",
        extraCount: required > 1 ? required - 1 : undefined,
      },
    }));
  };

  return (
    <div className="flex min-w-0 flex-col gap-5 sm:gap-8 lg:gap-10">
      <Banner image={bannerImage} />

      <AddShiftForm onAdd={addShift} />

      {/* Upcoming shifts */}
      <ShiftsTable
        title="Upcoming Shifts"
        linkLabel="View All"
        onLinkClick={() =>
          document
            .getElementById("all-shifts")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        rows={sorted.slice(0, 2)}
      />

      <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
        {/* All shifts */}
        <ShiftsTable
          id="all-shifts"
          title="All Shifts"
          linkLabel={showAllRows ? "Show Less" : "View All"}
          onLinkClick={() => setShowAllRows((v) => !v)}
          rows={showAllRows ? sorted : sorted.slice(0, 2)}
        />

        {/* Shift calendar */}
        <ShiftCalendar shifts={calendar} />
      </div>
    </div>
  );
}
