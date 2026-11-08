import {createClient} from "@/lib/supabase/client";
import {fmtClock, toLocalKey} from "./format";

export type OfferStatus = "accepted" | "pending" | "declined" | "expired" | "cancelled";
export type OfferTab = "upcoming" | "requests" | "past" | "cancelled";

export interface MyShift {
	assignmentId: string;
	startsAt: string;
	endsAt: string;
	date: string;
	time: string;
	task: string;
	status: OfferStatus;
}

export async function loadMyShifts(): Promise<MyShift[]> {
	const {data, error} = await createClient()
		.from("shift_assignments")
		.select("id, response_status, shifts!inner(shift_name, starts_at, ends_at, status)");
	if (error) throw error;

	return data
		.map((row): MyShift => {
			const start = new Date(row.shifts.starts_at);
			const end = new Date(row.shifts.ends_at);
			const cancelled =
				row.shifts.status === "cancelled" || row.response_status === "cancelled";

			return {
				assignmentId: row.id,
				startsAt: row.shifts.starts_at,
				endsAt: row.shifts.ends_at,
				date: toLocalKey(start),
				time: `${fmtClock(start)} - ${fmtClock(end)}`,
				task: row.shifts.shift_name.toUpperCase(),
				status: cancelled ? "cancelled" : (row.response_status as OfferStatus),
			};
		})
		.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function groupByTab(
	shifts: MyShift[],
	now: number,
): Record<OfferTab, MyShift[]> {
	const tabs: Record<OfferTab, MyShift[]> = {
		upcoming: [],
		requests: [],
		past: [],
		cancelled: [],
	};

	for (const shift of shifts) {
		if (shift.status === "cancelled") tabs.cancelled.push(shift);
		else if (shift.status === "pending") tabs.requests.push(shift);
		else if (shift.status === "accepted" && new Date(shift.endsAt).getTime() >= now) {
			tabs.upcoming.push(shift);
		} else {
			tabs.past.push(shift);
		}
	}

	tabs.past.reverse();
	return tabs;
}

export async function respondToOffer(
	assignmentId: string,
	action: "accept" | "decline",
): Promise<string> {
	const {error} =
		action === "accept"
			? await createClient().rpc("accept_shift_offer", {
					p_assignment_id: assignmentId,
				})
			: await createClient().rpc("decline_shift_offer", {
					p_assignment_id: assignmentId,
				});

	if (!error) return action === "accept" ? "Shift accepted." : "Offer declined.";
	if (error.message.includes("already filled") || error.message.includes("no longer open")) {
		return "Sorry, this shift has already been filled.";
	}
	if (error.message.includes("not pending")) {
		return "This offer has expired or was already answered.";
	}
	return "Something went wrong. Please try again.";
}
