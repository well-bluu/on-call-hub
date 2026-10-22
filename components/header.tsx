import { Bell, CircleUserRound } from "lucide-react";

export default function Header() {
  return (
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
  );
}
