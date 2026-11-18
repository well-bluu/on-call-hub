import type { StaticImageData } from "next/image";

// ==========================================
// BANNER
// ==========================================
// Static header. No backend data needed.

export function NotificationBanner({ image }: { image: StaticImageData }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#D9D9D9] bg-cover bg-[position:40%_center] p-5 shadow-sm sm:p-6 lg:p-8"
      style={{
        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.96) 0%,
            rgba(255, 255, 255, 0.94) 15%,
            rgba(255, 255, 255, 0.88) 30%,
            rgba(255, 255, 255, 0.74) 45%,
            rgba(255, 255, 255, 0.54) 60%,
            rgba(255, 255, 255, 0.32) 75%,
            rgba(255, 255, 255, 0.14) 88%,
            rgba(255, 255, 255, 0.04) 96%,
            rgba(255, 255, 255, 0) 100%
          ),
          url(${image.src})
        `,
        backgroundSize: "100% 100%, cover",
        backgroundPosition: "center, 35% center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-lg">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[hsl(var(--dark-blue))] sm:text-3xl">
          Notifications
        </h1>

        <p className="mt-2 text-xs text-[hsl(var(--dark-blue))] sm:text-sm">
          View and manage all system updates,
          <br />
          shift offers, and schedule changes.
        </p>
      </div>
    </div>
  );
}
