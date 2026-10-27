import { requirePermission } from "@/lib/auth/require-permission";
import NotificationPage from "./notificationPage";

export default async function ProtectedPage() {
  await requirePermission("notification.view.worker");

  return <NotificationPage />;
}
