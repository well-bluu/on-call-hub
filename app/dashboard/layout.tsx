import Navbar from "@/components/navbar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/header";

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
        <Header />

        <div className="flex-1 w-full max-w-6xl mx-auto px-8 lg:px-12 pb-12">
          {children}
        </div>
      </div>
    </main>
  );
}
