import { requirePermission } from "@/lib/auth/require-permission";
import MyShiftPage from "./shifts";

export default async function ProtectedPage() {
  await requirePermission("shift.view.own");
  return <MyShiftPage />;
}
