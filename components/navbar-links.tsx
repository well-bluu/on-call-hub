"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Bell,
  HelpCircle,
} from "lucide-react";
export function NavbarLinks() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const linkBaseStyle =
    "flex items-center gap-3 px-4 py-3 text-left transition-colors border rounded-lg text-sm group";
  const activeStyle = "bg-white text-[hsl(var(--dark-blue))] border-white";
  const inactiveStyle =
    "text-white border-white hover:text-[hsl(var(--dark-blue))] hover:bg-white";

  const links = [
    { href: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
    {
      href: "/shift_management",
      label: "SHIFT MANAGEMENT",
      icon: CalendarDays,
    },
    { href: "/workers", label: "WORKERS", icon: Users },
    { href: "/notifications", label: "NOTIFICATIONS", icon: Bell },
    { href: "/help_support", label: "HELP & SUPPORT", icon: HelpCircle },
  ];

  return (
    <div className="text-sm flex flex-col gap-10 font-sans">
      {links.map((link) => {
        // active mapped component block definition
        const LinkIcon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${linkBaseStyle} ${isActive(link.href) ? activeStyle : inactiveStyle}`}
          >
            <LinkIcon
              className={`w-5 h-5 transition-colors 
                ${
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
