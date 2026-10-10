import { redirect } from "next/navigation";
import { asc, eq, gte, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { shifts, shiftAssignments, userRoles } from "@/db/schema";
import { createShift } from "@/app/actions/create-shift";

const NAV = [
  { label: "DASHBOARD", href: "/protected/dashboard" },
  { label: "SHIFT MANAGEMENT", href: "/protected", active: true },
  { label: "WORKERS", href: "/protected/workers" },
  { label: "NOTIFICATIONS", href: "/protected/notifications" },
  { label: "HELP & SUPPORT", href: "/protected/help" },
];

const MESSAGES: Record<string, string> = {
  invalid: "Fill in every field except notes, and use at least 1 worker.",
  "not-owner": "Only owners can add shifts.",
  "save-failed":
    "The shift could not be saved. Check the terminal for details.",
};

const STATUS_STYLES = {
  complete: "bg-green-50 text-green-700 [&_span]:border-green-600",
  pending: "bg-orange-50 text-orange-500 [&_span]:border-orange-400",
  cancelled: "bg-gray-100 text-gray-500 [&_span]:border-gray-400",
} as const;

function formatDate(d: string) {
  return new Date(`${d}T00:00:00Z`)
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

const label = "mb-2 block text-xs font-bold tracking-wide text-[#0B2245]";
const field =
  "w-full rounded-xl bg-[#E8EEFC] px-4 py-3 text-[#0B2245] outline-none focus:ring-2 focus:ring-blue-500";

// ---------- page ----------
export default async function ShiftManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const { error, created } = await searchParams;

  // must be logged in and be an owner
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [userRole] = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.authUsersId, user.id));
  if (userRole?.role !== "owner") redirect("/");

  // upcoming shifts, with how many workers are assigned (declined ones don't count)
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila",
  });
  const upcoming = await db
    .select({
      id: shifts.shiftId,
      name: shifts.shiftName,
      date: shifts.shiftDate,
      start: shifts.startTime,
      end: shifts.endTime,
      required: shifts.requiredWorkers,
      status: shifts.status,
      filled:
        sql<number>`count(${shiftAssignments.shiftAssignmentId}) filter (where ${shiftAssignments.responseStatus} <> 'declined')`.mapWith(
          Number,
        ),
    })
    .from(shifts)
    .leftJoin(shiftAssignments, eq(shiftAssignments.shiftId, shifts.shiftId))
    .where(gte(shifts.shiftDate, today))
    .groupBy(shifts.shiftId)
    .orderBy(asc(shifts.shiftDate), asc(shifts.startTime))
    .limit(5);

  return (
    <div className="flex min-h-screen bg-white text-[#0B2245]">
      {/* SIDEBAR */}
      <aside className="flex w-72 shrink-0 flex-col bg-[#0B2245] p-6 text-white">
        <div className="mb-10 text-center">
          <p className="text-4xl font-bold">
            OnCall <span className="text-blue-400">Hub</span>
          </p>
          <p className="mt-1 text-sm">Right People. Right Time.</p>
        </div>

        <nav className="flex flex-col gap-4">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`rounded-xl border px-5 py-3 text-sm font-bold ${
                item.active
                  ? "border-white bg-white text-[#0B2245]"
                  : "border-white/80 hover:bg-white/10"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <form
          className="mt-auto"
          action={async () => {
            "use server";
            const supabase = await createClient();
            await supabase.auth.signOut();
            redirect("/login");
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl border border-white/80 px-5 py-3 text-left text-sm font-bold hover:bg-white/10"
          >
            Logout
          </button>
        </form>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">
        <header className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold">FRENS ICE CREAM</h2>
          <div className="flex items-center gap-4">
            <input
              type="search"
              placeholder="Search..."
              className="w-80 rounded-full bg-[#0B2245] px-5 py-3 text-sm text-white placeholder:text-white/70 outline-none"
            />
          </div>
        </header>

        {/* BANNER */}
        <section className="mb-8 rounded-xl bg-gradient-to-r from-[#EEF2FC] via-[#DCE6FA] to-[#7FA2F2] p-8 shadow">
          <h1 className="text-4xl font-extrabold">SHIFT MANAGEMENT</h1>
          <p className="mt-2 max-w-xs text-sm">
            Manage shift schedules and assign workers efficiently.
          </p>
        </section>

        {/* MESSAGES */}
        {created && (
          <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            Shift added.
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {MESSAGES[error] ?? "Something went wrong."}
          </p>
        )}

        {/* ADD SHIFT */}
        <section className="mb-8 rounded-xl border border-gray-200 p-8 shadow">
          <h2 className="mb-6 text-2xl font-extrabold">ADD SHIFT</h2>
          <form action={createShift}>
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-3">
              <div>
                <label htmlFor="shiftName" className={label}>
                  SHIFT NAME
                </label>
                <input
                  id="shiftName"
                  name="shiftName"
                  type="text"
                  required
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="startTime" className={label}>
                  START TIME
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  required
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="requiredWorkers" className={label}>
                  REQUIRED WORKERS
                </label>
                <input
                  id="requiredWorkers"
                  name="requiredWorkers"
                  type="number"
                  min={1}
                  required
                  className={field}
                />
              </div>

              <div>
                <label htmlFor="shiftDate" className={label}>
                  DATE
                </label>
                <input
                  id="shiftDate"
                  name="shiftDate"
                  type="date"
                  required
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="endTime" className={label}>
                  END TIME
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  required
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="notes" className={label}>
                  NOTES (OPTIONAL)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className={`${field} resize-none`}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="reset"
                className="rounded-lg border-2 border-[#0B2245] px-4 py-2 text-sm font-bold"
              >
                RESET
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#C9D6EE] px-6 py-2 text-sm font-bold hover:bg-[#B5C7E8]"
              >
                ADD SHIFT
              </button>
            </div>
          </form>
        </section>

        {/* UPCOMING SHIFTS */}
        <section className="rounded-xl border-2 border-blue-500 p-8">
          <div className="mb-6 flex items-start justify-between">
            <h2 className="text-2xl font-extrabold">UPCOMING SHIFTS</h2>
            <a
              href="/protected/shifts"
              className="text-xs font-semibold text-blue-600 underline"
            >
              View All
            </a>
          </div>

          <div className="grid grid-cols-[1.3fr_1.3fr_1fr_1fr_1fr] gap-2 px-4 text-center text-sm font-extrabold">
            {["DATE", "TIME", "FILLED / REQUIRED", "TASK", "STATUS"].map(
              (h) => (
                <span key={h} className="rounded-lg bg-[#C9D6EE] py-2">
                  {h}
                </span>
              ),
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {upcoming.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                No upcoming shifts yet. Add one above.
              </p>
            )}
            {upcoming.map((s) => (
              <div
                key={s.id}
                className={`grid grid-cols-[1.3fr_1.3fr_1fr_1fr_1fr] items-center gap-2 rounded-lg px-4 py-4 text-center text-sm font-bold ${STATUS_STYLES[s.status]}`}
              >
                <span>{formatDate(s.date)}</span>
                <span>
                  {formatTime(s.start)} - {formatTime(s.end)}
                </span>
                <span>
                  {s.filled}/{s.required}
                </span>
                <span className="uppercase">{s.name}</span>
                <span className="mx-auto w-fit rounded-md border px-3 py-1 uppercase">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
