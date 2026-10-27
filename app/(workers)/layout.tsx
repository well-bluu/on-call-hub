import Header from "@/components/header";
import Navbar from "@/components/navbar";
import { SidebarShell } from "@/components/sidebar-shell";
import { Suspense } from "react";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full flex flex-row bg-white text-foreground">
      {/*NavBar Sidebar */}
      <SidebarShell>
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>
      </SidebarShell>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <Header />

        {/* Page Content */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-8 lg:px-12 pb-12">
          {children}
        </div>
      </div>
    </main>
  );
}

function NavbarSkeleton() {
  return (
    <div className="flex flex-col gap-10 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-12 w-48 animate-pulse rounded-lg bg-white/20"
        />
      ))}
    </div>
  );
}
