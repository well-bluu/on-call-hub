import { requirePermission } from "@/lib/auth/require-permission";
import OwnerDashboardPage from "./dashboard-client";

export const instant = false;

export default async function Page() {
  await requirePermission("dashboard.view.owner");
  return <OwnerDashboardPage />;
}
