"use client";

import {Fragment, useCallback, useEffect, useState} from "react";
import bannerImage from "@/components/assets/images/my-shifts.png";
import WorkerSummary from "@/components/workerSummary";
import Banner from "./ShiftBanner";
import RecentActivity from "@/components/worker-activity";
import {
	groupByTab,
	loadMyShifts,
	respondToOffer,
	type MyShift,
	type OfferStatus,
	type OfferTab,
} from "@/lib/shifts/my-offers";

type TabKey = OfferTab;
type ShiftStatus = OfferStatus;
type Shift = MyShift;

const TABS: {key: TabKey; label: string}[] = [
	{key: "upcoming", label: "UPCOMING SHIFTS"},
	{key: "requests", label: "SHIFT REQUESTS"},
	{key: "past", label: "PAST SHIFTS"},
	{key: "cancelled", label: "CANCELLED SHIFTS"},
];

const STATUS_STYLES: Record<ShiftStatus, {label: string; pill: string}> = {
	accepted: {
		label: "ACCEPTED",
		pill: "bg-[#E5F8EC] text-[#1FAA59]",
	},
	pending: {
		label: "PENDING",
		pill: "bg-[#FEF3E6] text-[#FD950F]",
	},
	declined: {
		label: "DECLINED",
		pill: "bg-[#EEEEEE] text-[#6B7280]",
	},
	expired: {
		label: "EXPIRED",
		pill: "bg-[#EEEEEE] text-[#6B7280]",
	},
	cancelled: {
		label: "CANCELLED",
		pill: "bg-[#FBDEDE] text-[#FF0000]",
	},
};

function parseDate(iso: string) {
	const [year, month, day] = iso.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function formatDate(iso: string) {
	return parseDate(iso)
		.toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		})
		.toUpperCase();
}

function formatWeekday(iso: string) {
	return parseDate(iso)
		.toLocaleDateString("en-US", {weekday: "long"})
		.toUpperCase();
}

function StatusPill({status}: {status: ShiftStatus}) {
	const s = STATUS_STYLES[status];
	return (
		<span
			className={`inline-block max-w-full whitespace-normal break-words rounded-full px-1.5 py-1 text-[10px] font-bold ${s.pill}`}>
			{s.label}
		</span>
	);
}

function OfferActions({
	shift,
	busy,
	onRespond,
}: {
	shift: Shift;
	busy: boolean;
	onRespond: (assignmentId: string, action: "accept" | "decline") => void;
}) {
	return (
		<div className="flex flex-wrap justify-center gap-1">
			<button
				type="button"
				disabled={busy}
				onClick={() => onRespond(shift.assignmentId, "accept")}
				className="rounded-full bg-[#1FAA59] px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50">
				ACCEPT
			</button>
			<button
				type="button"
				disabled={busy}
				onClick={() => onRespond(shift.assignmentId, "decline")}
				className="rounded-full bg-[#FBDEDE] px-2 py-1 text-[10px] font-bold text-[#FF0000] disabled:opacity-50">
				DECLINE
			</button>
		</div>
	);
}

// Breakpoint notes: the sidebar takes ~320px on desktop, so the page content
// is much narrower than the viewport. That's why the side column starts at
// `xl` and the table (instead of cards) starts at `lg`.

export default function MyShiftPage() {
	const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
	const [shifts, setShifts] = useState<Record<TabKey, Shift[]>>({
		upcoming: [],
		requests: [],
		past: [],
		cancelled: [],
	});
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [busyId, setBusyId] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setShifts(groupByTab(await loadMyShifts(), Date.now()));
		} catch {
			setMessage("Could not load your shifts. Please refresh the page.");
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const respond = async (assignmentId: string, action: "accept" | "decline") => {
		setBusyId(assignmentId);
		setMessage("");
		setMessage(await respondToOffer(assignmentId, action));
		await load();
		setBusyId(null);
	};

	const rows = shifts[activeTab];

	return (
		<div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
			<div className="flex min-w-0 flex-col gap-4 sm:gap-6">
				{/* Banner */}
				<Banner
					image={bannerImage}
					title={"MY SHIFTS"}
					description={"View and manage your shifts"}
				/>

				{message && (
					<p className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-[hsl(var(--dark-blue))]">
						{message}
					</p>
				)}

				{/* Shifts card */}
				<div className="min-w-0 rounded-xl border border-border bg-white shadow-sm">
					<div className="grid w-full min-w-0 grid-cols-4 border-b border-border">
						{TABS.map((tab) => {
							const active = activeTab === tab.key;

							return (
								<button
									key={tab.key}
									type="button"
									onClick={() => setActiveTab(tab.key)}
									aria-pressed={active}
									className={`
                    min-w-0 whitespace-normal break-words
                    border-b-2 px-1 py-4
                    text-center text-[10px] font-bold leading-4
                    transition-colors sm:text-xs xl:text-sm
                    ${
											active
												? "border-[#0050D3] text-[hsl(var(--dark-blue))]"
												: "border-transparent text-[hsl(var(--dark-blue))] hover:text-[#0050D3]"
										}
                  `}>
									{tab.label}
								</button>
							);
						})}
					</div>

					<div className="min-w-0 px-3 pb-4 pt-4 sm:px-5 lg:pt-1">
						{/* Mobile: one card per shift */}
						<div className="flex flex-col gap-3 lg:hidden">
							{rows.length === 0 ? (
								<p className="py-8 text-center text-sm text-neutral-400">
									{loading ? "Loading..." : "No shifts to show here yet."}
								</p>
							) : (
								rows.map((shift) => (
									<div
										key={shift.assignmentId}
										className="rounded-lg border border-neutral-300 p-3 text-xs text-[hsl(var(--dark-blue))]">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<p className="font-bold">{formatDate(shift.date)}</p>
												<p className="mt-0.5 font-semibold text-neutral-500">
													{formatWeekday(shift.date)}
												</p>
											</div>
											{shift.status === "pending" ? (
												<OfferActions
													shift={shift}
													busy={busyId === shift.assignmentId}
													onRespond={respond}
												/>
											) : (
												<StatusPill status={shift.status} />
											)}
										</div>

										<div className="mt-2 flex items-center justify-between gap-2 border-t border-neutral-200 pt-2 font-semibold">
											<span>{shift.time}</span>
											<span className="font-bold">{shift.task}</span>
										</div>
									</div>
								))
							)}
						</div>

						{/* Desktop: table layout */}
						<table className="hidden w-full table-fixed border-separate border-spacing-0 text-center text-xs text-[hsl(var(--dark-blue))] lg:table">
							<caption className="sr-only">
								{TABS.find((tab) => tab.key === activeTab)?.label}
							</caption>

							<colgroup>
								<col className="w-[24%]" />
								<col className="w-[19%]" />
								<col className="w-[23%]" />
								<col className="w-[16%]" />
								<col className="w-[18%]" />
							</colgroup>

							<thead>
								<tr>
									{["DATE", "DAY", "TIME", "TASK", "STATUS"].map((heading) => (
										<th
											key={heading}
											scope="col"
											className="break-words px-1 py-2 font-bold">
											{heading}
										</th>
									))}
								</tr>
							</thead>

							<tbody>
								{rows.length === 0 ? (
									<tr>
										<td colSpan={5} className="py-10 text-sm text-neutral-400">
											{loading ? "Loading..." : "No shifts to show here yet."}
										</td>
									</tr>
								) : (
									rows.map((shift, index) => {
										const cellStyle =
											"whitespace-normal break-words border-y border-neutral-300 px-1 py-3 align-middle font-semibold";

										return (
											<Fragment key={shift.assignmentId}>
												{/* Gap only between shift rows */}
												{index > 0 && (
													<tr aria-hidden="true">
														<td colSpan={5} className="h-3 border-0 p-0" />
													</tr>
												)}

												<tr className="transition-colors hover:bg-neutral-50">
													<td className={`${cellStyle} rounded-l-lg border-l`}>
														{formatDate(shift.date)}
													</td>

													<td className={cellStyle}>
														{formatWeekday(shift.date)}
													</td>

													<td className={cellStyle}>{shift.time}</td>

													<td className={cellStyle}>{shift.task}</td>

													<td className={`${cellStyle} rounded-r-lg border-r`}>
														{shift.status === "pending" ? (
															<OfferActions
																shift={shift}
																busy={busyId === shift.assignmentId}
																onRespond={respond}
															/>
														) : (
															<StatusPill status={shift.status} />
														)}
													</td>
												</tr>
											</Fragment>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Worker Summary & Recent Activity: side by side on tablets, stacked on xl */}
			<div className="grid min-w-0 grid-cols-1 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
				<WorkerSummary />
				<RecentActivity />
			</div>
		</div>
	);
}
