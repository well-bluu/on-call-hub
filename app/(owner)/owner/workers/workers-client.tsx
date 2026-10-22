
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SubmitEvent,
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  SquarePen,
  Trash2,
  User,
  UserX,
} from "lucide-react";

import bannerImage from "@/components/assets/images/workerBanner.png";

/* Worker types */
type WorkerStatus = "Active" | "Inactive";

interface Worker {
  id: string;
  name: string;
  contact: string;
  status: WorkerStatus;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: "green" | "orange";
}

/* TODO: Replace mock workers with database records */
const INITIAL_WORKERS: Worker[] = Array.from(
  { length: 5 },
  (_, i) => ({
    id: String(i + 1),
    name: `Worker ${i + 1}`,
    contact: "00000000000",
    status: "Active",
  })
);

/* TODO: Fetch activities and timestamps from database */
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

/* Shared styles */
const card =
  "rounded-xl border border-[#D9D9D9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]";

const navy = "text-[hsl(var(--dark-blue))]";

const inputClass =
  "h-10 w-full rounded-xl bg-[#E6EEFC] px-4 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-700";

/* Workers banner */
function Banner({ image }: { image: StaticImageData }) {
  return (
    <div
      className={`flex h-[150px] items-center overflow-hidden bg-cover bg-[position:right_center] px-9 ${card}`}
      style={{ backgroundImage: `url(${image.src})` }}
    >
      <div className="max-w-sm">
        <h1
          className={`text-4xl font-extrabold uppercase leading-none ${navy}`}
        >
          Workers
        </h1>

        <p className={`mt-2 text-sm font-medium ${navy}`}>
          Keep track of your team and manage <br />
          worker details from one place.
        </p>
      </div>
    </div>
  );
}

/* Worker summary tile */
function SummaryTile({
  icon: Icon,
  count,
  label,
  className,
}: {
  icon: typeof CalendarCheck;
  count: number;
  label: string;
  className: string;
}) {
  return (
    <div
      className={`flex h-[97px] flex-col items-center justify-center rounded-[14px] border ${className}`}
    >
      <Icon className="size-7" strokeWidth={1.75} aria-hidden />

      <span className="mt-1 text-2xl font-extrabold leading-none text-slate-900">
        {count}
      </span>

      <span className="mt-1 text-xs font-semibold uppercase leading-none text-slate-900">
        {label}
      </span>
    </div>
  );
}

/* DYNAMIC: Summary counts use the workers array */
function WorkerSummary({ workers }: { workers: Worker[] }) {
  const count = (status: WorkerStatus) =>
    workers.filter((worker) => worker.status === status).length;

  return (
    <section className={`p-6 ${card}`}>
      <h2 className={`text-center text-base font-bold uppercase ${navy}`}>
        Worker Summary
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-5">
        <SummaryTile
          icon={CircleCheck}
          count={count("Active")}
          label="Active"
          className="border-green-600 bg-[#E2F1E6] text-green-600"
        />

        <SummaryTile
          icon={UserX}
          count={count("Inactive")}
          label="Inactive"
          className="border-slate-400 bg-slate-100 text-slate-500"
        />
      </div>
    </section>
  );
}

/* Recent worker activity */
function RecentActivity({
  items,
}: {
  items: Activity[];
}) {
  return (
    <section className={`flex-1 p-6 ${card}`}>
      <div className="flex items-center justify-between">
        <h2 className={`text-base font-bold uppercase ${navy}`}>
          Recent Activity
        </h2>

        <Link
          href="/owner/notifications"
          className="text-xs font-semibold text-blue-700 underline"
        >
          View All
        </Link>
      </div>

      <ul className="mt-5 flex flex-col gap-4">
        {items.map((activity) => {
          const isGreen = activity.tone === "green";
          const Icon = isGreen ? Calendar : User;

          return (
            <li
              key={activity.id}
              className="flex items-center gap-3.5"
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                  isGreen
                    ? "bg-[#E2F3E6] text-green-600"
                    : "bg-orange-50 text-orange-400"
                }`}
              >
                <Icon
                  className="size-6"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>

              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-bold uppercase leading-tight ${
                    isGreen ? "text-green-600" : navy
                  }`}
                >
                  {activity.title}
                </p>

                <p className="text-[13px] font-semibold leading-tight text-slate-900">
                  {activity.description}
                </p>

                <p className="text-[11px] leading-tight text-slate-400">
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

/* Default form values */
const EMPTY_FORM = {
  fullName: "",
  phone: "",
  dob: "",
  email: "",
  gender: "",
  address: "",
};

type FormState = typeof EMPTY_FORM;

/* Reusable field label */
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
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className={`text-base font-bold uppercase ${navy}`}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

/* Reusable styled dropdown */
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
        } flex items-center justify-between bg-[#E6EEFC] text-slate-900 outline-none transition-colors hover:bg-[#DCE7FA] focus-visible:ring-2 focus-visible:ring-blue-700`}
      >
        <Select.Value placeholder={placeholder} />

        <Select.Icon>
          <ChevronDown className="size-4 shrink-0 text-slate-700" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          data-calendar-dropdown="true"
          position="popper"
          sideOffset={5}
          collisionPadding={8}
          className="z-[100] max-h-[min(18rem,var(--radix-select-content-available-height))] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
          style={{
            minWidth: "var(--radix-select-trigger-width)",
          }}
        >
          <Select.ScrollUpButton className="flex h-6 items-center justify-center text-slate-500">
            <ChevronDown className="size-4 rotate-180" />
          </Select.ScrollUpButton>

          <Select.Viewport className="max-h-60">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none data-[highlighted]:bg-[#E6EEFC] data-[state=checked]:bg-[#E6EEFC]"
              >
                <Select.ItemText>
                  {option.label}
                </Select.ItemText>

                <Select.ItemIndicator>
                  <Check className="size-4 text-blue-600" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex h-6 items-center justify-center text-slate-500">
            <ChevronDown className="size-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

/* Calendar month options */
const MONTHS = Array.from({ length: 12 }, (_, month) => ({
  value: String(month),
  label: format(new Date(2020, month, 1), "MMMM"),
}));

/* Date of Birth calendar */
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
  const selected =
    parsed && isValid(parsed) ? parsed : undefined;

  // Fixed initial date avoids reading the current time during render.
  const [month, setMonth] = useState<Date>(
    () => selected ?? new Date(2000, 0, 1)
  );

  // Current date is initialized after mounting.
  const [today, setToday] = useState<Date | null>(null);

  const earliest = new Date(1900, 0, 1);

  /* DYNAMIC: Initialize today's date on the client */
  useEffect(() => {
    const currentDate = new Date();

    setToday(currentDate);
    setMonth(selected ?? currentDate);
    // Run once after mounting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* DYNAMIC: Generate years through the current year */
  const currentYear = today?.getFullYear() ?? 2000;

  const years = Array.from(
    { length: currentYear - 1899 },
    (_, index) => ({
      value: String(currentYear - index),
      label: String(currentYear - index),
    })
  );

  const canPrevious =
    month.getFullYear() > 1900 || month.getMonth() > 0;

  const canNext =
    today !== null &&
    (month.getFullYear() < today.getFullYear() ||
      (month.getFullYear() === today.getFullYear() &&
        month.getMonth() < today.getMonth()));

  /* Close calendar when clicking outside */
  useEffect(() => {
    if (!open) return;

    const handleOutside = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      // Ignore clicks inside the calendar.
      if (containerRef.current?.contains(target)) {
        return;
      }

      // Ignore clicks inside Radix dropdown portals.
      if (
        target.closest(
          '[data-calendar-dropdown="true"], [role="option"], [role="listbox"]'
        )
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutside
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  /* Change displayed month or year */
  function changeMonth(year: number, monthIndex: number) {
    if (!today) return;

    const next = new Date(year, monthIndex, 1);

    const latest = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (next >= earliest && next <= latest) {
      setMonth(next);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Date input */}
      <button
        id="worker-dob"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) {
            setMonth(
              selected ?? today ?? new Date(2000, 0, 1)
            );
          }

          setOpen(!open);
        }}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span
          className={
            selected ? "text-slate-900" : "text-slate-500"
          }
        >
          {selected
            ? format(selected, "dd/MM/yyyy")
            : "dd/mm/yyyy"}
        </span>

        <CalendarDays
          className="size-4 shrink-0 text-slate-700"
          aria-hidden
        />
      </button>

      {/* Calendar popup */}
      {open && (
        <div
          role="dialog"
          aria-label="Choose date of birth"
          className="absolute left-0 top-full z-50 mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
        >
          {/* Month and year navigation */}
          <div className="mb-3 flex items-center justify-between gap-1">
            {/* Previous month */}
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canPrevious}
              onClick={() =>
                changeMonth(
                  month.getFullYear(),
                  month.getMonth() - 1
                )
              }
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-[#E6EEFC] disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex min-w-0 items-center justify-center gap-1.5">
              {/* Month dropdown */}
              <StyledSelect
                compact
                ariaLabel="Calendar month"
                value={String(month.getMonth())}
                onChange={(value) =>
                  changeMonth(
                    month.getFullYear(),
                    Number(value)
                  )
                }
                options={MONTHS}
              />

              {/* Year dropdown */}
              <StyledSelect
                compact
                ariaLabel="Calendar year"
                value={String(month.getFullYear())}
                onChange={(value) =>
                  changeMonth(
                    Number(value),
                    Math.min(
                      month.getMonth(),
                      today &&
                        Number(value) === today.getFullYear()
                        ? today.getMonth()
                        : 11
                    )
                  )
                }
                options={years}
              />
            </div>

            {/* Next month */}
            <button
              type="button"
              aria-label="Next month"
              disabled={!canNext}
              onClick={() =>
                changeMonth(
                  month.getFullYear(),
                  month.getMonth() + 1
                )
              }
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-[#E6EEFC] disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Calendar days */}
          <DayPicker
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={(date) => {
              if (!date) return;

              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }}
            disabled={{
              before: earliest,
              after: today ?? undefined,
            }}
            hideNavigation
            showOutsideDays={false}
            classNames={{
              root: "w-full text-slate-800",
              months: "w-full",
              month: "w-full",
              month_caption: "hidden",
              month_grid:
                "w-full table-fixed border-collapse",
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

/* Personal information form */
function PersonalInformationForm({
  onAdd,
}: {
  onAdd: (form: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const set =
    (key: keyof FormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) => {
      setForm((previous) => ({
        ...previous,
        [key]: event.target.value,
      }));
    };

  /* TODO: Submit form data to database */
  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.fullName.trim()) return;

    onAdd(form);
    setForm(EMPTY_FORM);
  };

  return (
    <form
      onSubmit={submit}
      className={`flex flex-1 flex-col p-6 ${card}`}
    >
      <h2
        className={`px-1 pt-1 text-xl font-bold uppercase ${navy}`}
      >
        Personal Information
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-x-11 gap-y-6 px-1 sm:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Full Name */}
          <Field label="Full Name" htmlFor="worker-name">
            <input
              id="worker-name"
              className={inputClass}
              value={form.fullName}
              onChange={set("fullName")}
              required
            />
          </Field>

          {/* Date of Birth */}
          <Field label="Date of Birth" htmlFor="worker-dob">
            <DatePicker
              value={form.dob}
              onChange={(dob) =>
                setForm((previous) => ({
                  ...previous,
                  dob,
                }))
              }
            />
          </Field>

          {/* Gender */}
          <Field label="Gender" htmlFor="worker-gender">
            <StyledSelect
              id="worker-gender"
              ariaLabel="Gender"
              value={form.gender}
              onChange={(gender) =>
                setForm((previous) => ({
                  ...previous,
                  gender,
                }))
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

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Phone Number */}
          <Field label="Phone Number" htmlFor="worker-phone">
            <input
              id="worker-phone"
              className={inputClass}
              type="tel"
              value={form.phone}
              onChange={set("phone")}
            />
          </Field>

          {/* Email Address */}
          <Field label="Email Address" htmlFor="worker-email">
            <input
              id="worker-email"
              className={inputClass}
              type="email"
              value={form.email}
              onChange={set("email")}
            />
          </Field>

          {/* Address */}
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

      {/* Add Worker button */}
      <div className="mt-auto flex justify-end px-1 pt-7">
        <button
          type="submit"
          className="h-10 rounded-lg border-2 border-blue-700 bg-white px-6 text-base font-bold uppercase text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Add Worker
        </button>
      </div>
    </form>
  );
}

/* Workers table */
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
    <section className={`overflow-hidden ${card}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] table-fixed">
          <colgroup>
            <col className="w-[9%]" />
            <col className="w-[21%]" />
            <col className="w-[19%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[15%]" />
          </colgroup>

          <thead
            className={`bg-[#E6EEFC] text-base uppercase ${navy}`}
          >
            <tr className="h-20 border-b-[3px] border-slate-300/70">
              <th scope="col" className="font-bold">
                #
              </th>

              <th
                scope="col"
                className="pl-12 text-left font-bold"
              >
                Worker Name
              </th>

              <th scope="col" className="font-bold">
                Contact
              </th>

              <th scope="col" className="font-bold">
                Status
              </th>

              <th scope="col" className="font-bold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {workers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="h-24 text-center text-sm text-slate-500"
                >
                  No workers yet.
                </td>
              </tr>
            )}

            {workers.map((worker, index) => (
              <tr
                key={worker.id}
                className="h-24 text-center uppercase text-slate-900"
              >
                <td className="text-xs font-bold">
                  {index + 1}
                </td>

                {/* Worker name */}
                <td className="pl-12 text-left">
                  <div className="flex items-center gap-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User
                        className="size-5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </span>

                    <span className="truncate text-xs font-bold">
                      {worker.name}
                    </span>
                  </div>
                </td>

                {/* Contact number */}
                <td className="text-[13px] font-bold">
                  {worker.contact}
                </td>

                {/* Worker status */}
                <td>
                  <span
                    className={`inline-block w-24 rounded-lg py-1.5 text-[13px] font-bold ${
                      worker.status === "Active"
                        ? "bg-[#E2F3E6] text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {worker.status}
                  </span>
                </td>

                {/* Worker actions */}
                <td>
                  <div className="flex items-center justify-center gap-3">
                    {/* TODO: Connect Edit to database update */}
                    <button
                      type="button"
                      aria-label={`Edit ${worker.name}`}
                      className={`flex size-[38px] items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${editClass}`}
                    >
                      <SquarePen
                        className="size-5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </button>

                    {/* TODO: Connect Delete to database */}
                    <button
                      type="button"
                      onClick={() => onDelete(worker.id)}
                      aria-label={`Delete ${worker.name}`}
                      className={`flex size-[38px] items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 ${deleteClass}`}
                    >
                      <Trash2
                        className="size-5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
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

/* Owner Workers page */
export default function WorkersClient() {
  /* TODO: Load workers from database instead of mock data */
  const [workers, setWorkers] = useState(INITIAL_WORKERS);

  /* TODO: Save all worker fields to database */
  const addWorker = (form: FormState) => {
    setWorkers((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        name: form.fullName.trim(),
        contact: form.phone,
        status: "Active",
      },
    ]);
  };

  /* TODO: Delete worker from database */
  const deleteWorker = (id: string) => {
    setWorkers((previous) =>
      previous.filter((worker) => worker.id !== id)
    );
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_17.75rem]">
        <div className="flex flex-col gap-12">
          <Banner image={bannerImage} />
          <PersonalInformationForm onAdd={addWorker} />
        </div>

        <aside className="flex flex-col gap-10">
          <WorkerSummary workers={workers} />
          <RecentActivity items={ACTIVITIES} />
        </aside>
      </div>

      <WorkersTable
        workers={workers}
        onDelete={deleteWorker}
        actionStyle="outline"
      />
    </div>
  );
}
