import Header from "@/components/header";
import OwnerSidebar from "@/components/owner-sidebar";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full flex flex-row bg-white text-foreground">
      {/* Owner Sidebar */}
      <OwnerSidebar />

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
