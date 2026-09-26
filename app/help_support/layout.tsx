import Navbar from "@/components/navbar";
import { Menu, Search, Bell, CircleUserRound } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full flex flex-row bg-white text-foreground">
      <Navbar />

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top header */}
        <header className="flex items-center justify-between px-8 lg:px-12 py-6">
          <h1 className="text-xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))]">
            FRENS ICE CREAM
          </h1>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-[hsl(var(--dark-blue))]"
              aria-label="Menu"
            >
              {/* <Menu className="h-5 w-5" /> */}
            </button>

            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-56 rounded-full border border-border bg-white pl-4 pr-10 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>

            <button
              type="button"
              className="text-[hsl(var(--dark-blue))]"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="text-[hsl(var(--dark-blue))]"
              aria-label="Profile"
            >
              <CircleUserRound className="h-7 w-7" />
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