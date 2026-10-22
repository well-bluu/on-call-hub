import { requirePermission } from "@/lib/auth/require-permission";
import OwnerNotificationsPage from "./notification-client";

export const instant = false;

export default async function Page() {
  await requirePermission("notification.view.owner");
  return <OwnerNotificationsPage />;
}
