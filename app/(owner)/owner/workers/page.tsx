import { requirePermission } from "@/lib/auth/require-permission";

import WorkersClient from "./workers-client";

export const instant = false;

export default async function Page() {
  await requirePermission("worker.view");

  return <WorkersClient />;
}
