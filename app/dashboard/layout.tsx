import Navbar from "@/components/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full flex flex-row bg-background text-foreground">
      <Navbar/>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 w-full max-w-5xl mx-auto p-8 lg:p-12">
          {children}
        </div>
      </div>
    </main>
  );
}
