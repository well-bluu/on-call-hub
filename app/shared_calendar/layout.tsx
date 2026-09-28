import Navbar from "@/components/navbar";
import { Search, Bell, CircleUserRound } from "lucide-react";
import bannerImage from "@/components/assets/images/shared-calendar-banner.png";

export default function SharedCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full flex flex-row bg-white text-foreground">
      <Navbar />

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top head */}
        <header className="flex items-center justify-between px-8 lg:px-12 py-6">
          <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--dark-blue))]">
            FRENS ICE CREAM
          </h1>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="text-[hsl(var(--dark-blue))]"
              aria-label="Menu"
            >
              {/* <Menu className="h-5 w-5" /> */}
            </button>


            <button
              type="button"
              className="text-[hsl(var(--dark-blue))]"
              aria-label="Notifications"
            >
              <Bell className="h-8 w-7" strokeWidth={1.8} />
            </button>
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
          <div className="flex flex-col gap-6">
            {/* Hero banner */}
            <div
              className="relative overflow-hidden rounded-2xl border-[1px] border-[#D9D9D9] bg-cover bg-[position:40%_center] p-8"
              style={{ backgroundImage: `url(${bannerImage.src})` }}
            >
              <div className="max-w-lg">
                <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))]">
                  SHARED CALENDAR
                </h1>
                <p className="mt-2 text-sm text-[hsl(var(--dark-blue))]">
                  Keep everyone on the same schedule by viewing <br />
                  assigned shifts and important work dates.
                </p>
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </main>
  );
}