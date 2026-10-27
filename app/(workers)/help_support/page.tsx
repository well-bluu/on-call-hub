import { requirePermission } from "@/lib/auth/require-permission";
import HelpSupportClient from "./help-support-client";

export const instant = false;

export default async function ProtectedPage() {
  await requirePermission("help.view.worker");
  return <HelpSupportClient />;
}
