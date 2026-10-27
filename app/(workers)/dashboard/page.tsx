import { requirePermission } from "@/lib/auth/require-permission";
import WorkerView from "./workerView";

export default async function ProtectedPage() {
  await requirePermission("dashboard.view.worker");
  return <WorkerView />;
}
