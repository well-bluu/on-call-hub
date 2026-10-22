import Navbar from "@/components/navbar";
import { Bell, CircleUserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: isOwner } = await supabase.rpc("has_permission", {
    requested_permission: "dashboard.view.owner",
  });
  if (isOwner === true) redirect("/owner/dashboard");

  return (
    <main className="min-h-screen w-full flex flex-row bg-white text-foreground">
      <Navbar />

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top header */}
        <header className="flex items-center justify-between px-8 lg:px-12 py-6">
          <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--dark-blue))]">
            FRENS ICE CREAM
          </h1>

          {/* Notifications */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-[hsl(var(--dark-blue))]"
              aria-label="Notifications"
            >
              <Bell className="h-8 w-7" strokeWidth={1.8} />
            </button>

            {/* Profile */}
            <button
              type="button"
              className="text-[hsl(var(--dark-blue))]"
              aria-label="Profile"
            >
              <CircleUserRound className="h-8 w-8" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div className="flex-1 w-full max-w-6xl mx-auto px-8 lg:px-12 pb-12">
          {children}
        </div>
      </div>
    </main>
  );
}
