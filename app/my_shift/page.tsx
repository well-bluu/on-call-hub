import WorkerSummary from "@/components/workerSummary";
import { requirePermission } from "@/lib/auth/require-permission";
import ShiftList from "@/components/ShiftList";
import RecentActivity from "@/components/RecentActivity";
import bannerImage from "@/components/assets/images/my-shifts.png";
import ShiftBanner from "./ShiftBanner";
export const instant = false;

export default async function ProtectedPage() {
  await requirePermission("shift.view.own");

  return (
    <div className=" flex flex-col gap-6 justify-center p-20">
      <div className="flex flex-row flex-1 gap-10 mt-8">
        <div className="flex flex-col gap-3">
          <ShiftBanner
            image={bannerImage}
            title={"My Shifts"}
            description={"View and manage your shifts"}
          />
          <ShiftList />
        </div>
        <div className="flex flex-col gap-3">
          <WorkerSummary />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
