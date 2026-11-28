"use server";

import {createClient} from "@supabase/supabase-js";
import type {Database} from "@/lib/supabase/database.types";

export type StationMode = "in" | "out";

export type StationResult =
	| {
			ok: true;
			mode: "in";
			workerName: string;
			shiftName: string;
			startsAt: string;
			endsAt: string;
			timeIn: string;
			isLate: boolean;
	  }
	| {
			ok: true;
			mode: "out";
			workerName: string;
			shiftName: string;
			timeIn: string;
			timeOut: string;
			workedMinutes: number;
	  }
	| {ok: false; error: string};

const WRONG_LOGIN = "Employee ID or password is wrong.";
const NO_SESSION = {
	auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false,
	},
};

export async function recordAttendance(
	mode: StationMode,
	employeeId: string,
	password: string,
): Promise<StationResult> {
	if (mode !== "in" && mode !== "out") {
		return {ok: false, error: "Choose Time In or Time Out."};
	}
	const employeeNumber = Number(employeeId.trim());
	if (
		!Number.isSafeInteger(employeeNumber) ||
		employeeNumber <= 0 ||
		!password
	) {
		return {ok: false, error: WRONG_LOGIN};
	}

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
	const secretKey = process.env.SUPABASE_SECRET_KEY;
	if (!secretKey) {
		return {ok: false, error: "The time station isn't set up. Tell the owner."};
	}

	// Server-only: finds the worker's sign-in email. Unknown, inactive and
	// non-worker numbers all return null, so the error below never says which.
	const admin = createClient<Database>(url, secretKey, NO_SESSION);
	const {data: email} = await admin.rpc("station_login_email", {
		p_employee_number: employeeNumber,
	});
	if (!email) return {ok: false, error: WRONG_LOGIN};

	// Signs in as the worker without saving a session on the station.
	const worker = createClient<Database>(
		url,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		NO_SESSION,
	);
	const {error: signInError} = await worker.auth.signInWithPassword({
		email,
		password,
	});
	if (signInError) {
		return {
			ok: false,
			error:
				signInError.status === 429
					? "Too many tries. Wait a minute and try again."
					: WRONG_LOGIN,
		};
	}

	try {
		const {data, error} = await worker.rpc(
			mode === "in" ? "record_time_in" : "record_time_out",
		);
		if (error) return {ok: false, error: error.message};
		const r = data as Record<string, string | number | boolean>;
		return mode === "in"
			? {
					ok: true,
					mode,
					workerName: String(r.worker_name),
					shiftName: String(r.shift_name),
					startsAt: String(r.starts_at),
					endsAt: String(r.ends_at),
					timeIn: String(r.time_in),
					isLate: Boolean(r.is_late),
				}
			: {
					ok: true,
					mode,
					workerName: String(r.worker_name),
					shiftName: String(r.shift_name),
					timeIn: String(r.time_in),
					timeOut: String(r.time_out),
					workedMinutes: Number(r.worked_minutes),
				};
	} finally {
		// "local" ends only this station sign-in, not the worker's phone session.
		await worker.auth.signOut({scope: "local"});
	}
}
