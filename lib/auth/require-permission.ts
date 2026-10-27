import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requirePermission(permission: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/auth/login");

  const { data: allowed, error: rpcError } = await supabase.rpc(
    "has_permission",
    {
      requested_permission: permission,
    },
  );
  if (rpcError || allowed !== true) redirect("/dashboard");

  return { supabase };
}
