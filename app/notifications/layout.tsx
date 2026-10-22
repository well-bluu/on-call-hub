import Header from "@/components/header";
import Navbar from "@/components/navbar";
import NotificationBanner from "@/app/notifications/notificationBanner";
import bannerImage from "@/components/assets/images/notification-banner.png";

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
        <div className="flex-1 w-full max-w-5xl mx-auto p-8 lg:p-12">
          <NotificationBanner
            image={bannerImage}
            title={"Worker name"}
            description={"Worker Id"}
          />
          {children}
        </div>
      </div>
    </main>
  );
}
