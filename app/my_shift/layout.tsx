import Header from "@/components/header";
import Navbar from "@/components/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full flex flex-row bg-background text-foreground">
      <Navbar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 w-full max-w-10xl mx-auto p-8 lg:p-12">
          {children}
        </div>
      </div>
    </main>
  );
}
