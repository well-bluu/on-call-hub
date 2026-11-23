"use client";

import {useEffect, useMemo, useState} from "react";
import {PAGE_SIZE} from "./constants";
import {
	loadNotifications,
	markAllNotificationsRead,
	markNotificationRead,
	subscribeToNotifications,
} from "./queries";
import type {Notification, NotificationFilter} from "./types";

export function useNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let alive = true;

		loadNotifications()
			.then((rows) => {
				if (alive) setNotifications(rows);
			})
			.catch(() => {
				if (alive) setError("Could not load notifications. Please refresh.");
			})
			.finally(() => {
				if (alive) setIsLoading(false);
			});

		const unsubscribe = subscribeToNotifications((incoming) => {
			setNotifications((prev) =>
				prev.some((n) => n.id === incoming.id) ? prev : [incoming, ...prev],
			);
		});

		return () => {
			alive = false;
			unsubscribe();
		};
	}, []);

	const [filter, setFilter] = useState<NotificationFilter>("all");
	const [page, setPage] = useState(1);
	const [showAll, setShowAll] = useState(false);

	const filtered = useMemo(
		() =>
			notifications.filter((n) => {
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
			}),
		[notifications, filter],
	);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);

	const visible = showAll
		? filtered
		: filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

	const changeFilter = (next: NotificationFilter) => {
		setFilter(next);
		setPage(1);
	};

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

	const toggleShowAll = () => setShowAll((v) => !v);

	return {
		visible,
		isLoading,
		error,
		filter,
		changeFilter,
		currentPage,
		totalPages,
		setPage,
		showAll,
		toggleShowAll,
		markAsRead,
		markAllAsRead,
	};
}
