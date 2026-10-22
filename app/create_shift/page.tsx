import { CreateShiftForm } from "@/components/createShift-form";
import { requirePermission } from "@/lib/auth/require-permission";

export const instant = false;

export default async function Page() {
  await requirePermission("shift.create");

  return <CreateShiftForm />;
}
