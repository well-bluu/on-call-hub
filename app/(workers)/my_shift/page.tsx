import {requirePermission} from "@/lib/auth/require-permission";
import MyShiftPage from "./shifts";

export const instant = false;

export default async function ProtectedPage() {
	await requirePermission("shift.view.own");
	return <MyShiftPage />;
}
