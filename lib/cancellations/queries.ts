import {createClient} from "@/lib/supabase/client";

export interface PendingCancellation {
	id: string;
	reason: string;
	requestedAt: string;
	workerName: string;
	shiftName: string;
	startsAt: string;
	endsAt: string;
}

function friendlyError(message: string): string {
	if (message.includes("already pending"))
		return "You already asked to cancel this shift.";
	if (message.includes("already started"))
		return "This shift has already started and can't be cancelled.";
	if (message.includes("Only accepted"))
		return "Only accepted shifts can be cancelled.";
	if (message.includes("reason is required"))
		return "Please give a reason for cancelling.";
	if (message.includes("This request was already"))
		return "This request was already reviewed.";
	if (message.includes("not found")) return "This request no longer exists.";
	if (message.includes("not yours"))
		return "This shift is not available to cancel.";
	if (message.includes("not allowed")) return "You are not allowed to do this.";
	return "Something went wrong. Please try again.";
}

export async function requestCancellation(
	assignmentId: string,
	reason: string,
): Promise<string> {
	const {error} = await createClient().rpc("request_shift_cancellation", {
		p_assignment_id: assignmentId,
		p_reason: reason,
	});

	return error
		? friendlyError(error.message)
		: "Cancellation request sent. The owner will review it.";
}

export async function loadMyPendingCancellationIds(): Promise<Set<string>> {
	const {data, error} = await createClient()
		.from("emergency_cancellation_requests")
		.select("assignment_id")
		.eq("status", "pending");

	if (error) throw error;
	return new Set(data.map((row) => row.assignment_id));
}

export async function loadPendingCancellations(): Promise<
	PendingCancellation[]
> {
	const {data, error} = await createClient()
		.from("emergency_cancellation_requests")
		.select(
			"id, reason, created_at, shift:shifts(shift_name, starts_at, ends_at), worker:profiles!emergency_cancellation_requests_worker_id_fkey(first_name, last_name)",
		)
		.eq("status", "pending")
		.order("created_at");

	if (error) throw error;

	return data.map((row) => ({
		id: row.id,
		reason: row.reason,
		requestedAt: row.created_at,
		workerName:
			`${row.worker?.first_name ?? ""} ${row.worker?.last_name ?? ""}`.trim() ||
			"A worker",
		shiftName: row.shift?.shift_name ?? "Shift",
		startsAt: row.shift?.starts_at ?? row.created_at,
		endsAt: row.shift?.ends_at ?? row.created_at,
	}));
}

export async function approveCancellation(
	id: string,
	note?: string,
): Promise<string> {
	const {error} = await createClient().rpc("approve_cancellation_request", {
		p_request_id: id,
		p_note: note?.trim() || undefined,
	});

	return error
		? friendlyError(error.message)
		: "Cancellation approved. The shift has been offered to the next worker.";
}

export async function rejectCancellation(
	id: string,
	note?: string,
): Promise<string> {
	const {error} = await createClient().rpc("reject_cancellation_request", {
		p_request_id: id,
		p_note: note?.trim() || undefined,
	});

	return error
		? friendlyError(error.message)
		: "Cancellation rejected. The worker keeps the shift.";
}
