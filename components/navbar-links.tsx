"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Users,
  Bell,
  HelpCircle,
  CalendarCog,
} from "lucide-react";

type Role = "owner" | "worker";

const ownerLinks = [
  { href: "/owner/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  {
    href: "/owner/shift-management",
    label: "SHIFT MANAGEMENT",
    icon: CalendarCog,
  },
  { href: "/owner/workers", label: "WORKERS", icon: Users },
  { href: "/owner/notifications", label: "NOTIFICATIONS", icon: Bell },
  { href: "/owner/help-support", label: "HELP & SUPPORT", icon: HelpCircle },
];

const workerLinks = [
  { href: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/my_shift", label: "MY SHIFTS", icon: Clock },
  { href: "/shared_calendar", label: "SHARED CALENDAR", icon: CalendarDays },
  { href: "/my_profile", label: "MY PROFILE", icon: Users },
  { href: "/notifications", label: "NOTIFICATIONS", icon: Bell },
  { href: "/help_support", label: "HELP & SUPPORT", icon: HelpCircle },
];

export function NavbarLinks({ role }: { role: Role | null }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const linkBaseStyle =
    "flex items-center gap-3 px-4 py-3 text-left transition-colors border rounded-lg text-sm group";
  const activeStyle = "bg-white text-[hsl(var(--dark-blue))] border-white";
  const inactiveStyle =
    "text-white border-white hover:text-[hsl(var(--dark-blue))] hover:bg-white";

  // Anyone who isn't an owner gets the worker links
  const links = role === "owner" ? ownerLinks : workerLinks;

  return (
    <div className="text-sm flex flex-col gap-10 font-sans">
      {links.map((link) => {
        const LinkIcon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${linkBaseStyle} ${isActive(link.href) ? activeStyle : inactiveStyle}`}
          >
            <LinkIcon
              className={`w-5 h-5 transition-colors ${
                isActive(link.href)
                  ? "text-[hsl(var(--dark-blue))]"
                  : "text-white group-hover:text-[hsl(var(--dark-blue))]"
              }`}
            />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
