"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { requirePermission } from "@/lib/auth/require-permission";
import type { Database } from "@/lib/supabase/database.types";

type WorkerInput = {
  email: string;
  fullName: string;
  phone?: string;
};

export async function createWorker(input: WorkerInput): Promise<
  { ok: true; workerId: string } | { ok: false; error: string }
> {
  const { supabase } = await requirePermission("worker.create");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { ok: false, error: "Please sign in again." };

  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const fullName = typeof input?.fullName === "string" ? input.fullName.trim() : "";
  if (!fullName || fullName.length > 200 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter the worker’s name and a valid email address." };
  }

  if (input.phone !== undefined && (typeof input.phone !== "string" || input.phone.length > 50)) {
    return { ok: false, error: "Check the worker’s phone number." };
  }

  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return { ok: false, error: "Worker invitations are not configured." };

  const admin = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: allowed, error: checkError } = await admin.rpc("reserve_worker_invite", {
    owner_id: user.id, worker_email: email,
  });
  if (checkError) return { ok: false, error: "Unable to check invitation eligibility." };
  if (!allowed) return { ok: false, error: "This account already exists or an invitation is in progress." };

  const [firstName, ...rest] = fullName.split(/\s+/);
  const inviteId = randomUUID();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      worker_invite_id: inviteId,
      first_name: firstName,
      last_name: rest.join(" "),
      phone_number: input.phone?.trim() || null,
    },
  });
  if (error || data.user?.user_metadata.worker_invite_id !== inviteId) {
    return { ok: false, error: "Could not add this worker. Check the worker list. If the worker is missing, retry in five minutes." };
  }
  return { ok: true, workerId: data.user.id };
}
