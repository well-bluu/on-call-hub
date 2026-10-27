import {NotificationsPanel} from "./notificationPanel";
import type {Notification} from "./types";
import {requirePermission} from "@/lib/auth/require-permission";

export const instant = false;

// Replace with real data thank u
// -Tyrone :))
const NOTIFICATIONS: Notification[] = [
	{
		id: "1",
		kind: "offer",
		category: "shifts",
		title: "New shift offer - July 14",
		description:
			"A shift for wrapping of pinipig from 6:00 AM - 5:00 PM is offered.",
		timeAgo: "1 hour ago",
		read: false,
	},
	{
		id: "2",
		kind: "confirmed",
		category: "shifts",
		title: "Shift confirmed - July 21",
		description: "Description",
		timeAgo: "2 hours ago",
		read: false,
	},
	{
		id: "4",
		kind: "declined",
		category: "shifts",
		title: "Shift offer declined",
		description: "Description",
		timeAgo: "5 hours ago",
		read: true,
	},
];

export default async function ProtectedPage() {
	await requirePermission("notification.view.worker");

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 sm:p-10">
			<NotificationsPanel initial={NOTIFICATIONS} />
		</div>
	);
}
