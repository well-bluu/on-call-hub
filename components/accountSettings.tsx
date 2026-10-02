"use client";

import { LockKeyhole } from "lucide-react";

export default function AccountSettings() {
  return (
    <section className="w-full rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold tracking-wide text-[#0B2A4A]">
        ACCOUNT SETTINGS
      </h2>

      <p className="mt-2 text-[11px] leading-4 text-gray-600">
        Manage your account preferences and
        <br />
        security.
      </p>

      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-100 py-3 text-[10px] font-bold text-[#0B2A4A] transition-colors hover:bg-blue-200"
      >
        <LockKeyhole className="h-4 w-4" />
        CHANGE PASSWORD
      </button>
    </section>
  );
}
