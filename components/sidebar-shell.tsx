"use client";

import { useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleToggle() {
    // md breakpoint = 768px: toggle the rail on desktop, close the drawer on mobile
    if (window.matchMedia("(min-width: 768px)").matches) {
      setDesktopOpen((o) => !o);
    } else {
      setMobileOpen(false);
    }
  }

  return (
    <>
      {/* Mobile: opens the drawer */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        className="fixed left-3 top-3 z-30 rounded-lg border bg-white p-2 shadow md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile: backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        onClick={(e) => {
          // Close the mobile drawer after tapping a link
          if ((e.target as HTMLElement).closest("a")) setMobileOpen(false);
        }}
        className={`fixed inset-y-0 left-0 z-40 w-80 shrink-0 overflow-hidden bg-[hsl(var(--dark-blue))] transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:sticky md:top-0 md:h-screen md:translate-x-0 md:transition-[width]
          ${desktopOpen ? "md:w-80" : "md:w-16"}`}
      >
        {/* Toggle: part of the sidebar, not floating */}
        <button
          onClick={handleToggle}
          aria-label={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
          className={`absolute top-4 z-10 rounded-md p-1.5 text-white transition-all duration-300 hover:bg-white/10
            right-3
            ${desktopOpen ? "md:right-3" : "md:right-3 md:left-auto"}`}
        >
          <PanelLeftClose className="h-5 w-5 md:hidden" />
          {desktopOpen ? (
            <PanelLeftClose className="hidden h-5 w-5 md:block" />
          ) : (
            <PanelLeftOpen className="hidden h-5 w-5 md:block" />
          )}
        </button>

        {/* Fixed inner width so nothing squishes; fades out when collapsed */}
        <div
          className={`h-full w-80 transition-opacity duration-200 ${
            desktopOpen ? "opacity-100" : "md:pointer-events-none md:opacity-0"
          }`}
        >
          {children}
        </div>
      </aside>
    </>
  );
}
