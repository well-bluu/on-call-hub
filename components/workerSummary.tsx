"use client";

import { CalendarCheck, CircleCheck, Clock, Cross } from "lucide-react";

export default function WorkerSummary() {
  return (
    <section className="w-full rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-center text-sm font-bold tracking-wide text-[#0B2A4A]">
        WORKER SUMMARY
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Shifts */}
        <div className="flex h-[88px] flex-col items-center justify-center rounded-xl border border-blue-500 bg-blue-50">
          <CalendarCheck className="mb-1 h-7 w-7 text-blue-600" />

          <span className="text-xl font-bold leading-none text-[#0B2A4A]">
            2
          </span>

          <span className="mt-1 text-[10px] font-bold text-[#0B2A4A]">
            TOTAL SHIFTS
          </span>
        </div>

        {/* Sick Leave */}
        <div className="flex h-[88px] flex-col items-center justify-center rounded-xl border border-red-500 bg-red-50">
          <Cross className="mb-1 h-7 w-7 text-red-500" />

          <span className="text-xl font-bold leading-none text-[#0B2A4A]">
            2<span className="text-sm">/5</span>
          </span>

          <span className="mt-1 text-[10px] font-bold text-[#0B2A4A]">
            SICK LEAVE USED
          </span>
        </div>

        {/* Attendance */}
        <div className="flex h-[88px] flex-col items-center justify-center rounded-xl border border-green-500 bg-green-50">
          <CircleCheck className="mb-1 h-7 w-7 text-green-600" />

          <span className="text-xl font-bold leading-none text-[#0B2A4A]">
            2
          </span>

          <span className="mt-1 text-[10px] font-bold text-[#0B2A4A]">
            ATTENDANCE
          </span>
        </div>

        {/* Text */}
        <div className="flex h-[88px] flex-col items-center justify-center rounded-xl border border-orange-400 bg-orange-50">
          <Clock className="mb-1 h-7 w-7 text-orange-500" />

          <span className="text-xl font-bold leading-none text-[#0B2A4A]">
            2
          </span>

          <span className="mt-1 text-[10px] font-bold text-[#0B2A4A]">
            TEXT
          </span>
        </div>
      </div>
    </section>
  );
}
