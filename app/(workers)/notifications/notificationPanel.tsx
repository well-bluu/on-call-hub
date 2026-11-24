"use client";

import {useEffect, useMemo, useState} from "react";
import {
	loadNotificationRows,
	markAllNotificationsRead,
	markNotificationRead,
	subscribeToNotificationRows,
} from "@/lib/notifications/queries";
import {toWorkerNotification} from "./mapNotification";
import {NotificationItem} from "./notificationItem";
import {NotificationTabs} from "./notificationTabs";
import type {Notification, NotificationFilter} from "./types";

function matchesFilter(n: Notification, filter: NotificationFilter) {
	switch (filter) {
		case "all":
			return true;
		case "unread":
			return !n.read;
		case "read":
			return n.read;
		default:
			return n.category === filter;
	}
}

export function NotificationsPanel() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState<NotificationFilter>("all");

	useEffect(() => {
		let alive = true;

		loadNotificationRows()
			.then((rows) => {
				if (alive) setNotifications(rows.map(toWorkerNotification));
			})
			.catch(() => {
				if (alive) setError("Could not load notifications. Please refresh.");
			})
			.finally(() => {
				if (alive) setIsLoading(false);
			});

		const unsubscribe = subscribeToNotificationRows((row) => {
			const incoming = toWorkerNotification(row);
			setNotifications((prev) =>
				prev.some((n) => n.id === incoming.id) ? prev : [incoming, ...prev],
			);
		});

		return () => {
			alive = false;
			unsubscribe();
		};
	}, []);

	const visible = useMemo(
		() => notifications.filter((n) => matchesFilter(n, filter)),
		[notifications, filter],
	);

	const hasUnread = notifications.some((n) => !n.read);

	const markAsRead = (id: string) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? {...n, read: true} : n)),
		);

		markNotificationRead(id).catch(() => {
			setNotifications((prev) =>
				prev.map((n) => (n.id === id ? {...n, read: false} : n)),
			);
		});
	};

	const markAllAsRead = () => {
		const previous = notifications;
		setNotifications((prev) => prev.map((n) => ({...n, read: true})));

		markAllNotificationsRead().catch(() => setNotifications(previous));
	};

	return (
		<section className="flex min-w-0 flex-col gap-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
				<NotificationTabs active={filter} onChange={setFilter} />

				<div className="grid grid-cols-2 items-center gap-2 sm:flex sm:gap-3">
					<button
						onClick={markAllAsRead}
						disabled={!hasUnread}
						className="rounded-full border border-blue-700 px-2 py-2 text-xs font-semibold uppercase text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:px-4 sm:py-1.5 sm:text-sm">
						Mark all as read
					</button>
					<button className="rounded-full bg-blue-700 px-2 py-2 text-xs font-semibold uppercase text-white transition-colors hover:bg-blue-800 sm:px-5 sm:py-1.5 sm:text-sm">
						View all
					</button>
				</div>
			</div>

			<div className="rounded-xl border border-slate-200 bg-white shadow-sm">
				{isLoading ? (
					<p className="px-4 py-12 text-center text-sm text-slate-500 sm:px-6 sm:py-16">
						Loading notifications...
					</p>
				) : error ? (
					<p className="px-4 py-12 text-center text-sm text-red-600 sm:px-6 sm:py-16">
						{error}
					</p>
				) : visible.length > 0 ? (
					<ul className="divide-y divide-slate-200">
						{visible.map((n) => (
							<NotificationItem
								key={n.id}
								notification={n}
								onMarkAsRead={markAsRead}
							/>
						))}
					</ul>
				) : (
					<p className="px-4 py-12 text-center text-sm text-slate-500 sm:px-6 sm:py-16">
						No notifications in this view.
					</p>
				)}
			</div>
		</section>
	);
}
