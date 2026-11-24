import {formatTimeAgo, type NotificationRow} from "@/lib/notifications/queries";
import type {Notification, NotificationKind} from "./types";

function toWorkerKind(kind: string): NotificationKind {
	switch (kind) {
		case "shift_offer":
			return "offer";
		case "shift_confirmation":
		case "cancellation_confirmed":
		case "cancellation_approved":
			return "confirmed";
		case "shift_cancelled":
		case "cancellation_rejected":
			return "declined";
		default:
			return "reminder";
	}
}

export function toWorkerNotification(row: NotificationRow): Notification {
	return {
		id: row.id,
		kind: toWorkerKind(row.kind),
		category:
			row.category === "shift" || row.category === "cancellation"
				? "shifts"
				: "system",
		title: row.title,
		description: row.body ?? "",
		timeAgo: formatTimeAgo(row.created_at),
		read: row.read_at !== null,
	};
}
