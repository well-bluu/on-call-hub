import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/require-permission";
import WorkerDetail from "./worker-detail";

export const instant = false;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requirePermission("worker.view");
  const { id } = await params;
  const { data, error } = await supabase.rpc("list_workers").select("id").eq("id", id).maybeSingle();
  if (error && error.code !== "22P02") throw error;
  if (!data) notFound();
  return <WorkerDetail key={id} workerId={id} />;
}
