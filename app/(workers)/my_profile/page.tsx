import AccountSettings from "@/components/accountSettings";
import WorkerSummary from "@/components/workerSummary";
import { requirePermission } from "@/lib/auth/require-permission";
import MyProfileClient from "./my-profile-client";

export const instant = false;

export default async function ProtectedPage() {
  await requirePermission("profile.view.own");

  return (
    <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:gap-10">
      <div className="min-w-0 flex-1">
        <MyProfileClient />
      </div>
      <aside className="flex flex-col gap-3 lg:w-72">
        <WorkerSummary />
        <AccountSettings />
      </aside>
    </div>
  );
}
