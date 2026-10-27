import { requirePermission } from "@/lib/auth/require-permission";
import SharedCalendar from "./sharedCalendar";

export default async function ProtectedPage() {
  await requirePermission("calendar.view");
  return <SharedCalendar />;
}
