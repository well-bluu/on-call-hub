import {requirePermission} from "@/lib/auth/require-permission";
import HelpSupportClient from "./help-support-client";

export const instant = false;

export default async function HelpSupportPage() {
	await requirePermission("help.view.worker");
	return <HelpSupportClient />;
}
