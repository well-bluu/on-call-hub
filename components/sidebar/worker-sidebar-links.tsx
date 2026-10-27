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
} from "lucide-react";

const links = [
  {
    href: "/dashboard",
    label: "DASHBOARD",
    icon: LayoutDashboard,
  },
  {
    href: "/my_shift",
    label: "MY SHIFT",
    icon: Clock,
  },
  {
    href: "/shared_calendar",
    label: "SHARED CALENDAR",
    icon: CalendarDays,
  },
  {
    href: "/my_profile",
    label: "MY PROFILE",
    icon: Users,
  },
  {
    href: "/notifications",
    label: "NOTIFICATIONS",
    icon: Bell,
  },
  {
    href: "/help_support",
    label: "HELP & SUPPORT",
    icon: HelpCircle,
  },
];

export function NavbarLinks() {
  const pathname = usePathname();

  return (
    <div className="flex shrink-0 flex-col gap-[26px] font-sans">
      {links.map((link) => {
        const LinkIcon = link.icon;
        const active =
          pathname === link.href ||
          pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`
              flex h-[30px] shrink-0 items-center gap-2
              rounded-[5px] border border-white
              px-2 text-[10px] leading-3
              transition-colors
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-white
              ${
                active
                  ? "bg-white text-[hsl(var(--dark-blue))]"
                  : "text-white hover:bg-white hover:text-[hsl(var(--dark-blue))]"
              }
            `}
          >
            <LinkIcon
              aria-hidden="true"
              className="h-[14px] w-[14px] shrink-0"
            />

            <span className="whitespace-nowrap">
              {link.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}