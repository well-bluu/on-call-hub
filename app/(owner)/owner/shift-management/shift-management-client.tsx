"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { StaticImageData } from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight, Users } from "lucide-react";
import bannerImage from "@/components/assets/images/shift-management-banner.png";

/* Shift types */
type ShiftColor = "green" | "blue" | "orange";

/* TODO: Database shift record (date: yyyy-mm-dd, start/end: HH:mm in 24-hour time) */
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

/* Calendar cell data, one shift per day (keyed by yyyy-mm-dd) */
interface CalendarShift {
  time: string;
  label: string;
  color: ShiftColor;
  extraCount?: number;
}

/* TODO: Replace mock shifts with database records */
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

/* TODO: Remove this once the calendar is built from the shift records */
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

/* TODO: Load shift names from database */
const TASKS = ["Coating", "Packaging", "Mixing", "Ice Cream Production"];

/* Required workers dropdown options (change the range here) */
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

/* TODO: Add colors for new shift names (keys are lowercase, unlisted names default to blue) */
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

/* Expects HH:mm (24-hour), returns 6:00 AM (or 6:00 am when lower is true) */
function fmtTime(t: string, lower = false) {
  const [h, m] = t.split(":").map(Number);
  const s = `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
  return lower ? s.toLowerCase() : s;
}

/* Expects yyyy-mm-dd */
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
    cells.push({ day, monthOffset: -1, key: toKey(y, m, day) });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, monthOffset: 0, key: toKey(year, month, day) });
  }
  let next = 1;
  while (cells.length % 7 !== 0) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    cells.push({ day: next, monthOffset: 1, key: toKey(y, m, next) });
    next++;
  }
  return cells;
}

/* Time input helpers (typed time is h:mm plus AM or PM, stored as HH:mm in 24-hour time) */
type Period = "AM" | "PM";

/* Convert HH:mm (24-hour) to typed text and AM or PM */
function to12h(t: string): { text: string; period: Period } {
  const [h, m] = t.split(":").map(Number);
  return { text: `${h % 12 || 12}:${pad(m)}`, period: h >= 12 ? "PM" : "AM" };
}

/* Convert h, m and AM or PM to HH:mm (24-hour) */
function to24h(h: number, m: number, period: Period) {
  return `${pad((h % 12) + (period === "PM" ? 12 : 0))}:${pad(m)}`;
}

/* Auto-format typing: 630 becomes 6:30, 1230 becomes 12:30 */
function formatTypedTime(raw: string) {
  if (raw.includes(":")) {
    const [hour, minute = ""] = raw.split(":");
    return `${hour.replace(/\D/g, "").slice(0, 2)}:${minute.replace(/\D/g, "").slice(0, 2)}`;
  }
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  if (d.length === 3) {
    const twoDigitHour =
      Number(d.slice(0, 2)) >= 10 && Number(d.slice(0, 2)) <= 12;
    return twoDigitHour ? `${d.slice(0, 2)}:${d[2]}` : `${d[0]}:${d.slice(1)}`;
  }
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

/* Returns the hour (1-12) and minute, or null while the typed time is incomplete or invalid */
function parseTime(text: string): { h: number; m: number } | null {
  let hourText = text;
  let minuteText = "00";

  if (text.includes(":")) {
    [hourText, minuteText] = text.split(":");
    if (minuteText.length !== 2) return null;
  }

  if (!/^\d{1,2}$/.test(hourText) || !/^\d{2}$/.test(minuteText)) return null;

  const h = Number(hourText);
  const m = Number(minuteText);
  return h >= 1 && h <= 12 && m <= 59 ? { h, m } : null;
}

/* Shared styles */
const card =
  "rounded-xl border border-[#D9D9D9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]";
const navy = "text-[hsl(var(--dark-blue))]";
const inputClass =
  "h-8 w-full rounded-lg bg-[#E6EEFC] px-3 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-700";
const popoverClass =
  "absolute left-0 top-full z-30 mt-1 rounded-lg border border-[#D9D9D9] bg-white shadow-[0_6px_18px_rgba(1,34,71,0.18)]";

/* Shift management banner (remove if the owner layout already renders it) */
function Banner({ image }: { image: StaticImageData }) {
  return (
    <div
      className={`flex h-[150px] items-center overflow-hidden bg-cover bg-[position:right_center] px-9 ${card}`}
      style={{ backgroundImage: `url(${image.src})` }}
    >
      <div className="max-w-md">
        <h1
          className={`text-4xl font-extrabold uppercase leading-none ${navy}`}
        >
          Shift Management
        </h1>
        <p className={`mt-2 text-sm font-medium ${navy}`}>
          Manage shift schedules and assign <br />
          workers efficiently.
        </p>
      </div>
    </div>
  );
}

/* Close a popup when clicking outside or pressing Escape */
function useDismiss(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
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

/* Reusable styled dropdown (options are { value, label } with string values) */
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
          className={`size-4 shrink-0 ${navy} transition-transform ${open ? "rotate-180" : ""}`}
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
                  className={`w-full px-3 py-1.5 text-left text-sm ${
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

/* Shift date calendar (value and onChange use yyyy-mm-dd) */
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
  /* Fixed fallback month, replaced with the current month after mounting */
  const [view, setView] = useState(() => {
    const start = value ? parseKey(value) : new Date(2026, 0, 1);
    return new Date(start.getFullYear(), start.getMonth(), 1);
  });
  const [todayKey, setTodayKey] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  /* DYNAMIC: Today's date is read on the client after mounting (new Date() can't run during render in Next.js) */
  useEffect(() => {
    const now = new Date();
    setTodayKey(toKey(now.getFullYear(), now.getMonth(), now.getDate()));
    if (!value) setView(new Date(now.getFullYear(), now.getMonth(), 1));
    // Run once after mounting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const year = view.getFullYear();
  const month = view.getMonth();
  const cells = buildMonthGrid(year, month);
  const navBtn =
    "flex size-7 items-center justify-center rounded-full bg-[#012247] text-white transition-colors hover:bg-[#0050D3]";

  return (
    <div ref={ref} className="relative">
      {/* Date input */}
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className="truncate">{value ? fmtDateShort(value) : ""}</span>
        <ChevronDown
          className={`size-4 shrink-0 ${navy} transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {/* Calendar popup */}
      {open && (
        <div
          role="dialog"
          aria-label="Choose date"
          className={`${popoverClass} w-64 p-3`}
        >
          {/* Month navigation */}
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
              <span key={d} className="text-[9px] font-medium text-neutral-500">
                {d.slice(0, 3)}
              </span>
            ))}
          </div>

          {/* Calendar days */}
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
                        } ${key === todayKey ? "border border-[#012247]" : ""}`
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

/* Typed time input with AM/PM toggle (value and onChange use HH:mm in 24-hour time) */
function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const initial = value ? to12h(value) : { text: "", period: "AM" as Period };
  const [text, setText] = useState(initial.text);
  const [period, setPeriod] = useState<Period>(initial.period);
  const [touched, setTouched] = useState(false);
  const lastEmitted = useRef(value);

  /* Keep the field in sync when the form is reset from outside */
  useEffect(() => {
    if (value === lastEmitted.current) return;

    lastEmitted.current = value;
    const next = value ? to12h(value) : { text: "", period: "AM" as Period };
    setText(next.text);
    setPeriod(next.period);
    setTouched(false);
  }, [value]);

  /* Send HH:mm to the form (empty while the typed time is incomplete or invalid) */
  const commit = (nextText: string, nextPeriod: Period) => {
    const parsed = parseTime(nextText);
    const out = parsed ? to24h(parsed.h, parsed.m, nextPeriod) : "";

    lastEmitted.current = out;
    onChange(out);
  };

  const invalid = touched && text !== "" && parseTime(text) === null;

  return (
    <div
      className={`flex h-8 w-full items-center gap-2 rounded-lg bg-[#E6EEFC] pl-3 pr-1 focus-within:ring-2 focus-within:ring-blue-700 ${
        invalid ? "ring-2 ring-red-500" : ""
      }`}
    >
      {/* Typed time */}
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

      {/* AM / PM toggle */}
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
            className={`h-6 rounded-md px-2 text-[11px] font-bold transition-colors ${
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

/* Default form values */
const EMPTY_FORM = {
  name: "",
  date: "",
  start: "",
  end: "",
  required: "",
  notes: "",
};
type FormState = typeof EMPTY_FORM;

/* Reusable field label */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span
        className={`pl-3 text-[13px] font-bold uppercase leading-4 ${navy}`}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

/* Add shift form */
function AddShiftForm({ onAdd }: { onAdd: (f: FormState) => void }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const update = (key: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  /* TODO: Submit form data to database (handled in addShift on the page) */
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.date || !form.start || !form.end) {
      setError(
        "Please choose a shift name and date, and enter a valid start and end time (e.g. 6:00 AM).",
      );
      return;
    }
    if (form.end <= form.start) {
      setError("End time must be after the start time.");
      return;
    }
    setError("");
    onAdd(form);
    setForm(EMPTY_FORM);
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setError("");
  };

  return (
    <form onSubmit={submit} className={`p-6 ${card}`}>
      <h2 className={`px-1 text-[22px] font-bold uppercase leading-7 ${navy}`}>
        Add Shift
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-7 md:grid-cols-3">
        {/* Shift name */}
        <Field label="Shift Name">
          <Dropdown
            label="Shift name"
            value={form.name}
            onChange={update("name")}
            options={TASKS.map((t) => ({ value: t, label: t }))}
          />
        </Field>

        {/* Start time */}
        <Field label="Start Time">
          <TimeInput
            label="Start time"
            value={form.start}
            onChange={update("start")}
          />
        </Field>

        {/* Required workers */}
        <Field label="Required Workers">
          <Dropdown
            label="Required workers"
            value={form.required}
            onChange={update("required")}
            options={WORKER_OPTIONS}
          />
        </Field>

        {/* Date */}
        <Field label="Date">
          <DatePicker
            label="Date"
            value={form.date}
            onChange={update("date")}
          />
        </Field>

        {/* End time */}
        <Field label="End Time">
          <TimeInput
            label="End time"
            value={form.end}
            onChange={update("end")}
          />
        </Field>

        {/* Notes */}
        <Field label="Notes (Optional)">
          <textarea
            aria-label="Notes"
            className={`${inputClass} h-[72px] resize-none py-2`}
            value={form.notes}
            onChange={(e) => update("notes")(e.target.value)}
          />
        </Field>
      </div>

      {/* Reset and Add Shift buttons */}
      <div className="mt-6 flex items-center justify-end gap-4">
        {error && (
          <p
            role="alert"
            className="mr-auto text-xs font-semibold text-red-600"
          >
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className={`h-8 rounded-lg border-2 border-[hsl(var(--dark-blue))] bg-white px-4 text-sm font-bold uppercase ${navy} hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700`}
        >
          Reset
        </button>
        <button
          type="submit"
          className={`h-8 w-[123px] rounded-lg bg-[#C9DAF5] text-sm font-bold uppercase ${navy} hover:bg-[#b7cdf0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700`}
        >
          Add Shift
        </button>
      </div>
    </form>
  );
}

const GRID = "grid grid-cols-[191fr_220fr_213fr_185fr_146fr] items-center";

/* Shifts table (used for Upcoming Shifts and All Shifts, only needs ShiftRow[]) */
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
    <section id={id} className={`scroll-mt-6 px-7 py-6 ${card}`}>
      <div className="flex items-start justify-between">
        <h2
          className={`mt-3 text-[22px] font-bold uppercase leading-7 ${navy}`}
        >
          {title}
        </h2>
        <button
          type="button"
          onClick={onLinkClick}
          className="text-xs font-semibold text-blue-700 underline"
        >
          {linkLabel}
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[44rem]">
          {/* Table header */}
          <div className={GRID}>
            {["Date", "Time", "Filled / Required", "Task", "Status"].map(
              (h) => (
                <span
                  key={h}
                  className={`justify-self-center whitespace-nowrap rounded-lg bg-[#C9DAF5] px-4 py-1 text-base font-bold uppercase ${navy}`}
                >
                  {h}
                </span>
              ),
            )}
          </div>

          <div className="mt-8 flex flex-col gap-8">
            {rows.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                No shifts yet.
              </p>
            )}

            {rows.map((r) => {
              /* DYNAMIC: Status is based on filled vs required workers */
              /* TODO: Use the database status field instead if there is one */
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

/* Shift calendar (only needs Record<yyyy-mm-dd, CalendarShift>) */
function ShiftCalendar({ shifts }: { shifts: Record<string, CalendarShift> }) {
  /* TODO: Start on the current month instead of July 2026 (set it in a useEffect after mounting, not new Date() during render) */
  const [current, setCurrent] = useState(new Date(2026, 6, 1));
  const year = current.getFullYear();
  const month = current.getMonth();
  const cells = buildMonthGrid(year, month);

  /* TODO: If shifts are fetched per month, refetch when year or month changes */

  const navBtn =
    "flex size-12 items-center justify-center rounded-full bg-[#012247] text-white transition-colors hover:bg-[#0050D3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

  return (
    <section className="rounded-[20px] border-2 border-[#012247] bg-white p-6 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setCurrent(new Date(year, month - 1, 1))}
          className={navBtn}
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <h2 className={`text-3xl font-extrabold ${navy}`}>
          {MONTHS[month]} {year}
        </h2>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setCurrent(new Date(year, month + 1, 1))}
          className={navBtn}
        >
          <ChevronRight className="size-6" aria-hidden />
        </button>
      </div>

      <div className="mt-4 border-t border-[#012247]" />

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 py-3 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-xs font-medium text-neutral-500">
            {d}
          </span>
        ))}
      </div>

      {/* DYNAMIC: Calendar days are generated for the displayed month */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ day, monthOffset, key }) => {
          const shift = shifts[key];
          const other = monthOffset !== 0;

          /* Day without a shift */
          if (!shift) {
            return (
              <div
                key={key}
                className="h-24 rounded-[3px] border-2 border-[#D3D3D3] bg-white p-2 pr-3 text-right"
              >
                <span
                  className={`text-sm font-medium ${
                    other ? "text-neutral-400" : "text-slate-900"
                  }`}
                >
                  {day}
                </span>
              </div>
            );
          }

          /* Day with a shift */
          const s = SHIFT_STYLES[shift.color];
          return (
            <div
              key={key}
              className={`flex h-24 cursor-pointer flex-col justify-between rounded-[3px] border-2 p-1.5 transition hover:brightness-95 ${s.bg} ${s.border}`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="flex min-w-0 items-center gap-1">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${s.border} bg-white/60 ${s.text}`}
                  >
                    <Users className="size-3" aria-hidden />
                  </span>
                  {shift.extraCount ? (
                    <span
                      className={`truncate text-[8px] font-medium ${s.text}`}
                    >
                      +{shift.extraCount} more
                    </span>
                  ) : null}
                </span>
                <span className="pr-1.5 text-sm font-medium leading-5 text-slate-900">
                  {day}
                </span>
              </div>

              <div className="text-center text-[10px] leading-[13px] text-slate-900">
                <p>{shift.time}</p>
                <p className="uppercase">{shift.label}</p>
              </div>

              {/* TODO: Link to the shift details page or modal */}
              <button
                type="button"
                className={`self-end text-[8px] font-semibold underline ${s.text}`}
              >
                View Details
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* Owner Shift Management page */
export default function OwnerShiftManagementPage() {
  /* TODO: Load shifts from database instead of mock data */
  const [rows, setRows] = useState(INITIAL_ROWS);

  /* TODO: Build the calendar from rows instead of keeping a second copy:
     key = row.date, time = start - end (lowercase am/pm), label = task,
     color = COLOR_BY_TASK[task.toLowerCase()] ?? "blue",
     extraCount = required - 1 (when above 0) */
  const [calendar, setCalendar] = useState(INITIAL_CALENDAR);
  const [showAllRows, setShowAllRows] = useState(false);

  /* DYNAMIC: Shifts are sorted by date, Upcoming shows the first 2 */
  /* TODO: Filter Upcoming to today onward once real dates are used */
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));

  /* TODO: Save shift to database (name, date, start, end, required, notes), then refresh the list */
  const addShift = (f: FormState) => {
    const required = Math.max(1, Number(f.required) || 1);

    setRows((prev) => [
      ...prev,
      {
        /* TODO: Use the id returned by the database */
        id: crypto.randomUUID(),
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
    <div className="flex flex-col gap-10">
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

      <div className="flex flex-col gap-6">
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
