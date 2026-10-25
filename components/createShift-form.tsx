"use client"; // Required because we are using useState and client-side submission

import {useState} from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "./ui/card";
import {createClient} from "@/lib/supabase/client";

export function CreateShiftForm() {
	const supabase = createClient();
	const [shiftName, setShiftName] = useState("");
	const [shiftStartTime, setShiftStartTime] = useState("");
	const [shiftEndTime, setShiftEndTime] = useState("");
	const [shiftDate, setShiftDate] = useState("");
	const [shiftNotes, setShiftNotes] = useState("");
	const [shiftRequiredWorkers, setShiftRequiredWorkers] = useState("1");
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		setErrorMessage("");
		setSuccessMessage("");
		setLoading(true);

		try {
			const requiredWorkers = Number(shiftRequiredWorkers);
			if (!Number.isSafeInteger(requiredWorkers) || requiredWorkers < 1) {
				throw new Error("Required workers must be a positive whole number.");
			}

			const {
				data: {user},
				error: userError,
			} = await supabase.auth.getUser();

			if (userError) throw userError;
			if (!user) throw new Error("Please sign in before creating a shift.");

			// Date + time inputs are in the owner's local time (Philippines)
			const startsAt = new Date(`${shiftDate}T${shiftStartTime}`);
			const endsAt = new Date(`${shiftDate}T${shiftEndTime}`);

			// An end time at or before the start time means the shift ends the next day
			if (endsAt <= startsAt) endsAt.setDate(endsAt.getDate() + 1);

			const {error} = await supabase.from("shifts").insert({
				shift_name: shiftName.trim(),
				starts_at: startsAt.toISOString(),
				ends_at: endsAt.toISOString(),
				required_workers: requiredWorkers,
				notes: shiftNotes.trim() || null,
			});

			if (error) throw error;

			setSuccessMessage("Shift created successfully.");
			setShiftName("");
			setShiftStartTime("");
			setShiftEndTime("");
			setShiftDate("");
			setShiftNotes("");
			setShiftRequiredWorkers("1");
		} catch (error) {
			console.error("Error creating shift:", error);
			setErrorMessage(
				error instanceof Error
					? error.message
					: "An unexpected error occurred while creating the shift.",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Create shift</CardTitle>
				<CardDescription>Basta create shift</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex flex-col gap-2">
						<label htmlFor="shiftName" className="text-sm font-medium">
							Shift Name
						</label>
						<input
							id="shiftName"
							type="text"
							required
							className="border p-2 rounded-md w-full dark:bg-zinc-900"
							placeholder="e.g., Morning Shift"
							value={shiftName}
							onChange={(e) => setShiftName(e.target.value)}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="shiftStartTime" className="text-sm font-medium">
							Start time
						</label>
						<input
							id="shiftStartTime"
							type="time"
							required
							className="border p-2 rounded-md w-full dark:bg-zinc-900"
							value={shiftStartTime}
							onChange={(e) => setShiftStartTime(e.target.value)}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="shiftEndTime" className="text-sm font-medium">
							End time
						</label>
						<input
							id="shiftEndTime"
							type="time"
							required
							className="border p-2 rounded-md w-full dark:bg-zinc-900"
							value={shiftEndTime}
							onChange={(e) => setShiftEndTime(e.target.value)}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="shiftDate" className="text-sm font-medium">
							Date
						</label>
						<input
							id="shiftDate"
							type="date"
							required
							className="border p-2 rounded-md w-full dark:bg-zinc-900"
							value={shiftDate}
							onChange={(e) => setShiftDate(e.target.value)}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="shiftNotes" className="text-sm font-medium">
							Notes
						</label>
						<input
							id="shiftNotes"
							type="text"
							className="border p-2 rounded-md w-full dark:bg-zinc-900"
							placeholder="Optional notes"
							value={shiftNotes}
							onChange={(e) => setShiftNotes(e.target.value)}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label
							htmlFor="shiftRequiredWorkers"
							className="text-sm font-medium">
							Required Workers
						</label>
						<input
							id="shiftRequiredWorkers"
							type="number"
							min="1"
							step="1"
							required
							className="border p-2 rounded-md w-full dark:bg-zinc-900"
							value={shiftRequiredWorkers}
							onChange={(e) => setShiftRequiredWorkers(e.target.value)}
						/>
					</div>

					{errorMessage && (
						<p role="alert" className="text-sm text-red-600">
							{errorMessage}
						</p>
					)}
					{successMessage && (
						<output className="text-sm text-green-600">{successMessage}</output>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-gray-400">
						{loading ? "Creating..." : "Create Shift"}
					</button>
				</form>
			</CardContent>
		</Card>
	);
}
