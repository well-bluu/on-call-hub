import { requirePermission } from "@/lib/auth/require-permission";
import OwnerShiftManagementPage from "./shift-management-client";

export const instant = false;

export default async function Page() {
  await requirePermission("shift.view.all");
  return <OwnerShiftManagementPage />;
}
