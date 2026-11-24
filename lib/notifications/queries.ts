import {formatDistanceToNow} from "date-fns";
import {createClient} from "@/lib/supabase/client";
import type {Database} from "@/lib/supabase/database.types";
import type {
	Notification,
	NotificationCategory,
	NotificationKind,
} from "./types";

export type NotificationRow =
	Database["public"]["Tables"]["notifications"]["Row"];

const WORKER_RESPONSE_KINDS = new Set([
	"worker_accepted",
	"worker_declined",
	"cancellation_request",
]);

function toUiKind(kind: string): NotificationKind {
	switch (kind) {
		case "worker_accepted":
			return "accepted";
		case "worker_declined":
		case "cancellation_request":
			return "declined";
		case "worker_added":
			return "worker_added";
		default:
			return "shift_updated";
	}
}

function toUiCategory(kind: string): NotificationCategory {
	return WORKER_RESPONSE_KINDS.has(kind) ? "worker_responses" : "shift_updates";
}

export function formatTimeAgo(createdAt: string): string {
	return formatDistanceToNow(new Date(createdAt), {addSuffix: true});
}

export function toUiNotification(row: NotificationRow): Notification {
	return {
		id: row.id,
		kind: toUiKind(row.kind),
		category: toUiCategory(row.kind),
		title: row.title,
		description: row.body ?? "",
		timeAgo: formatTimeAgo(row.created_at),
		read: row.read_at !== null,
	};
}

export async function loadNotificationRows(): Promise<NotificationRow[]> {
	const {data, error} = await createClient()
		.from("notifications")
		.select("*")
		.order("created_at", {ascending: false})
		.limit(200);

	if (error) throw error;
	return data;
}

export async function loadNotifications(): Promise<Notification[]> {
	const rows = await loadNotificationRows();
	return rows.map(toUiNotification);
}

export function subscribeToNotificationRows(
	onInsert: (row: NotificationRow) => void,
): () => void {
	const supabase = createClient();
	const channel = supabase
		.channel("notifications-feed")
		.on(
			"postgres_changes",
			{event: "INSERT", schema: "public", table: "notifications"},
			(payload) => onInsert(payload.new as NotificationRow),
		)
		.subscribe();

	return () => {
		void supabase.removeChannel(channel);
	};
}

export function subscribeToNotifications(
	onInsert: (notification: Notification) => void,
): () => void {
	return subscribeToNotificationRows((row) => onInsert(toUiNotification(row)));
}

export async function markNotificationRead(id: string): Promise<void> {
	const {error} = await createClient()
		.from("notifications")
		.update({read_at: new Date().toISOString()})
		.eq("id", id)
		.is("read_at", null);

	if (error) throw error;
}

export async function markAllNotificationsRead(): Promise<void> {
	const {error} = await createClient()
		.from("notifications")
		.update({read_at: new Date().toISOString()})
		.is("read_at", null);

	if (error) throw error;
}
