import { Suspense } from "react";
import Image from "next/image";
import { AuthButton } from "@/components/auth-button";
import { OwnerSidebarLinks } from "./owner-sidebar-links";

export default function OwnerSidebar() {
  return (
    <nav
      aria-label="Owner navigation"
      className="
        sticky top-0 flex h-dvh w-[201px] shrink-0
        flex-col gap-[26px] overflow-y-auto
        border-r border-neutral-800
        bg-[hsl(var(--dark-blue))]
        px-[21px] py-[21px]
      "
    >
      <div className="flex shrink-0 flex-col items-center">
        <Image
          src="/pictures2/oncallHubLogo.png"
          alt=""
          width={120}
          height={120}
          className="h-auto w-[80px]"
          priority
        />

        <Image
          src="/pictures2/logo_name.png"
          alt="OnCallHub — Right People. Right Time."
          width={250}
          height={250}
          className="h-auto w-[168px] max-w-full"
          priority
        />
      </div>

      <OwnerSidebarLinks />

      <div
        className="
          mt-auto w-full shrink-0
          border-t border-neutral-800 pt-[10px]

          [&_button]:flex
          [&_button]:h-[26px]
          [&_button]:min-h-0
          [&_button]:w-full
          [&_button]:items-center
          [&_button]:justify-center
          [&_button]:gap-2
          [&_button]:rounded-[5px]
          [&_button]:border
          [&_button]:border-white
          [&_button]:bg-[hsl(var(--dark-blue))]
          [&_button]:px-2
          [&_button]:py-0
          [&_button]:text-[10px]
          [&_button]:leading-3
          [&_button]:text-white
          [&_button]:transition-colors
          [&_button]:hover:bg-white
          [&_button]:hover:text-[hsl(var(--dark-blue))]

          [&_a]:flex
          [&_a]:h-[26px]
          [&_a]:min-h-0
          [&_a]:w-full
          [&_a]:items-center
          [&_a]:justify-center
          [&_a]:gap-2
          [&_a]:rounded-[5px]
          [&_a]:border
          [&_a]:border-white
          [&_a]:px-2
          [&_a]:py-0
          [&_a]:text-[10px]
          [&_a]:leading-3
          [&_a]:text-white
          [&_a]:transition-colors
          [&_a]:hover:bg-white
          [&_a]:hover:text-[hsl(var(--dark-blue))]

          [&_svg]:h-[14px]
          [&_svg]:w-[14px]
          [&_svg]:shrink-0
        "
      >
        <Suspense
          fallback={
            <div className="text-center text-[10px] text-white/60">
              Loading...
            </div>
          }
        >
          <AuthButton />
        </Suspense>
      </div>
    </nav>
  );
}