"use server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calendarFor } from "@/lib/google_calendar";

import { db } from "@/db";
import {
  owners,
  workers,
  shifts,
  shiftAssignments,
  googleTokens,
} from "@/db/schema";

export async function createShift(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [owner] = await db
    .select()
    .from(owners)
    .where(eq(owners.authId, user.id));
  if (!owner) throw new Error("Only owners can create shifts");

  // 1. save the shift in Supabase
  const [shift] = await db
    .insert(shifts)
    .values({
      ownerId: owner.ownerId,
      shiftName: String(formData.get("name")),
      shiftDate: String(formData.get("date")),
      startTime: String(formData.get("startTime")),
      endTime: String(formData.get("endTime")),
      status: "pending",
    })
    .returning();

  // 2. assign each chosen worker + add to their Google Calendar
  for (const workerId of formData.getAll("workerIds").map(String)) {
    await assignWorker(shift, workerId);
  }

  redirect("/protected");
}

async function assignWorker(
  shift: typeof shifts.$inferSelect,
  workerId: string,
) {
  const [assignment] = await db
    .insert(shiftAssignments)
    .values({ shiftId: shift.shiftId, workerId })
    .returning();

  //select.from(..) will return wrapper array container so thats why nasasulod bracket
  const [worker] = await db
    .select()
    .from(workers)
    .where(eq(workers.workerId, workerId));
  if (!worker) return;

  const [token] = await db
    .select()
    .from(googleTokens)
    .where(eq(googleTokens.authId, worker.authId));
  if (!token) return; // basta kailangan login google

  try {
    const calendar = calendarFor(token.refreshToken);
    //basta naas docs insert event sa calendar
    //sa google workspace docs
    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        start: {
          dateTime: `${shift.shiftDate}T${shift.startTime.slice(0, 5)}:00`,
          timeZone: "Asia/Manila",
        },
        end: {
          dateTime: `${shift.shiftDate}T${shift.endTime.slice(0, 5)}:00`,
          timeZone: "Asia/Manila",
        },
      },
    });

    await db
      .update(shiftAssignments)
      .set({ googleEventId: res.data.id })
      .where(eq(shiftAssignments.assignmentId, assignment.assignmentId));
  } catch (e) {
    console.error("Calendar insert failed:", e); // shit and assignment work but wala ra cal if fail
  }
}
