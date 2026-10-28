
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AssignedShift {
  id: string;
  shift_name: string;
  starts_at: string;
  ends_at: string;
  status: string;
  response_status: string;
}

export default function GetShifts() {
  const [shifts, setShifts] = useState<AssignedShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchShifts() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from("shift_assignments")
          .select(`
            response_status,
            shifts!inner (
              id,
              shift_name,
              starts_at,
              ends_at,
              status
            )
          `)
          .eq("worker_id", user.id)
          .order("starts_at", {
            referencedTable: "shifts",
            ascending: true,
          });

        if (error) throw error;

        const formattedShifts: AssignedShift[] = (data ?? []).flatMap(
          (assignment) => {
            const relatedShifts = Array.isArray(assignment.shifts)
              ? assignment.shifts
              : [assignment.shifts];

            return relatedShifts.map((shift) => ({
              id: shift.id,
              shift_name: shift.shift_name,
              starts_at: shift.starts_at,
              ends_at: shift.ends_at,
              status: shift.status,
              response_status: assignment.response_status,
            }));
          }
        );

        if (active) setShifts(formattedShifts);
      } catch (err) {
        console.error(err);
        if (active) setError("Failed to load shifts.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchShifts();

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p>Loading shifts...</p>;
  if (error) return <p>{error}</p>;

  if (shifts.length === 0) {
    return <p>No assigned shifts found.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {shifts.map((shift) => (
        <div
          key={shift.id}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <h3 className="font-bold text-blue-900">
            {shift.shift_name}
          </h3>

          <p>
            Date: {new Date(shift.starts_at).toLocaleDateString()}
          </p>

          <p>
            Start: {new Date(shift.starts_at).toLocaleTimeString()}
          </p>

          <p>
            End: {new Date(shift.ends_at).toLocaleTimeString()}
          </p>

          <p>Shift Status: {shift.status}</p>

          <p>My Response: {shift.response_status}</p>
        </div>
      ))}
    </div>
  );
}
