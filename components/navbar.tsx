import { AuthButton } from "@/components/auth-button";
import { Suspense } from "react";
import { NavbarLinks } from "./navbar-links";
import { getRole } from "@/lib/auth/require-permission";
import Image from "next/image";

export default async function Navbar() {
  const role = await getRole();
  return (
    <nav className="w-full h-full flex flex-col gap-6 justify-start p-8 bg-[hsl(var(--dark-blue))]">
      <div className="flex flex-col items-center mb-5">
        <Image
          src="/pictures2/oncallHubLogo.png"
          alt="oncallHubLogo"
          width={120}
          height={120}
        />
        <Image
          src="/pictures2/logo_name.png"
          alt="oncallHubLogo"
          width={250}
          height={250}
        />
      </div>
      <NavbarLinks role={role as "owner" | "worker" | null} />

      <div
        className="mt-auto pt-4 border-t border-neutral-800 w-full
        [&_button]:w-full [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:px-4 [&_button]:py-3 [&_button]:transition-colors [&_button]:border [&_button]:rounded-lg [&_button]:text-sm [&_button]:text-white [&_button]:border-white [&_button]:hover:text-[hsl(var(--dark-blue))] [&_button]:bg-[hsl(var(--dark-blue))] [&_button]:hover:bg-white
        [&_a]:w-full [&_a]:flex [&_a]:items-center [&_a]:justify-center [&_a]:px-4 [&_a]:py-3 [&_a]:transition-colors [&_a]:border [&_a]:rounded-lg [&_a]:text-sm [&_a]:text-white [&_a]:border-white [&_a]:hover:text-[hsl(var(--dark-blue))] [&_a]:hover:bg-white"
      >
        <Suspense
          fallback={
            <div className="text-sm text-neutral-500 text-center">
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
