"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { shifts } from "@/db/schema";

const PAGE = "/actions";

export async function createShift(formData: FormData) {
  // 1. who is asking?
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. only owners can add shifts

  // 3. read and clean the form values
  const shiftName = String(formData.get("shiftName") ?? "").trim();
  const shiftDate = String(formData.get("shiftDate") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const requiredWorkers = Number(formData.get("requiredWorkers"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (
    !shiftName ||
    !shiftDate ||
    !startTime ||
    !endTime ||
    !Number.isInteger(requiredWorkers) ||
    requiredWorkers < 1
  ) {
    redirect(`${PAGE}?error=invalid`);
  }

  // 4. save it in Supabase (profileId = the owner creating the shift)
  try {
    await db.insert(shifts).values({
      profileId: user.id,
      shiftName,
      shiftDate,
      startTime,
      endTime,
      requiredWorkers,
      notes: notes || null,
    });
  } catch (e) {
    console.error("Saving shift failed:", e);
    redirect(`${PAGE}?error=save-failed`);
  }

  revalidatePath(PAGE);
  redirect(`${PAGE}?created=1`);
}
