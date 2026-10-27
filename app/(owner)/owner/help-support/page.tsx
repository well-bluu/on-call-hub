import { requirePermission } from "@/lib/auth/require-permission";
import OwnerHelpSupportPage from "./help-support-client";

export const instant = false;

export default async function Page() {
  await requirePermission("help.view.owner");
  return <OwnerHelpSupportPage />;
}
