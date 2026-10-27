import Header from "@/components/header";
import Navbar from "@/components/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full flex flex-row bg-white text-foreground">
      <Navbar />

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <Header />

        <div className="flex-1 w-full max-w-6xl mx-auto px-8 lg:px-12 pb-12">
          {children}
        </div>
      </div>
    </main>
  );
}
