"use client";

import {useCallback, useEffect, useState} from "react";
import {
	approveCancellation,
	loadPendingCancellations,
	rejectCancellation,
	type PendingCancellation,
} from "@/lib/cancellations/queries";
import {fmtClock, fmtLongDate, timeAgo} from "@/lib/shifts/format";

export function CancellationRequests({
	onChanged,
}: {
	onChanged: () => Promise<void>;
}) {
	const [requests, setRequests] = useState<PendingCancellation[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [busyId, setBusyId] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setRequests(await loadPendingCancellations());
		} catch {
			setMessage(
				"Could not load cancellation requests. Please refresh the page.",
			);
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const review = async (id: string, action: "approve" | "reject") => {
		const note = window.prompt(
			action === "approve"
				? "Approve this cancellation? Add an optional note for the worker:"
				: "Reject this cancellation? Add an optional reason for the worker:",
		);
		if (note === null) return;

		setBusyId(id);
		setMessage("");
		setMessage(
			action === "approve"
				? await approveCancellation(id, note)
				: await rejectCancellation(id, note),
		);
		await load();
		await onChanged();
		setBusyId(null);
	};

	if (loading || (requests.length === 0 && !message)) return null;

	return (
		<section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
			<div className="flex items-center justify-between gap-2">
				<h2 className="text-base font-bold uppercase text-[hsl(var(--dark-blue))] sm:text-lg">
					Cancellation Requests
				</h2>
				<span className="text-xs font-semibold text-slate-500">
					{requests.length} pending
				</span>
			</div>

			{message && (
				<p className="mt-3 text-sm font-semibold text-[hsl(var(--dark-blue))]">
					{message}
				</p>
			)}

			{requests.length > 0 && (
				<ul className="mt-4 divide-y divide-slate-200">
					{requests.map((request) => {
						const start = new Date(request.startsAt);
						const end = new Date(request.endsAt);
						const busy = busyId === request.id;

						return (
							<li
								key={request.id}
								className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0">
									<p className="text-sm font-bold text-[hsl(var(--dark-blue))]">
										{request.workerName} · {request.shiftName}
									</p>
									<p className="text-xs font-semibold text-slate-500">
										{fmtLongDate(start)} · {fmtClock(start)} - {fmtClock(end)}
									</p>
									<p className="mt-1 break-words text-sm text-slate-800">
										Reason: {request.reason}
									</p>
									<p className="mt-1 text-xs text-slate-400">
										Requested {timeAgo(request.requestedAt)}
									</p>
								</div>

								<div className="flex shrink-0 gap-2">
									<button
										type="button"
										disabled={busy}
										onClick={() => review(request.id, "approve")}
										className="rounded-full bg-[#1FAA59] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
										APPROVE
									</button>
									<button
										type="button"
										disabled={busy}
										onClick={() => review(request.id, "reject")}
										className="rounded-full bg-[#FBDEDE] px-4 py-2 text-xs font-bold text-[#FF0000] disabled:opacity-50">
										REJECT
									</button>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
