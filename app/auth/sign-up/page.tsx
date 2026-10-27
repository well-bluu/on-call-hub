import { SignUpForm } from "@/components/sign-up-form";
import Image from "next/image";
import logo from "@/components/assets/images/Logo.png";
import circle from "@/components/assets/images/Circle_Design.png";
import * as motion from "motion/react-client";

export default function Page() {
  return (
    // Mobile: stacked column (logo on top, card below)
    // md+: side-by-side row, same as before
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center gap-6 overflow-hidden px-4 py-8 sm:gap-8 md:flex-row md:justify-evenly md:gap-0 md:p-10">
      {/* Decorative circles — positioned absolutely, behind everything else.
          On mobile three are shown (partially off-screen) to match the design:
          top-right, middle-left and bottom-right. The fourth appears from md up. */}
      <motion.div
        className="pointer-events-none absolute -right-20 top-6 h-52 w-52 md:-top-10 md:left-12 md:right-auto md:h-40 md:w-40"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
      >
        <Image src={circle} alt="" fill className="object-contain" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute left-1/2 top-24 hidden h-24 w-24 md:block md:h-28 md:w-28"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
      >
        <Image src={circle} alt="" fill className="object-contain" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -left-24 top-1/2 h-48 w-48 md:bottom-10 md:left-4 md:top-auto md:h-52 md:w-52"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      >
        <Image src={circle} alt="" fill className="object-contain" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 md:right-10 md:h-44 md:w-44"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
      >
        <Image src={circle} alt="" fill className="object-contain" />
      </motion.div>

      {/* Foreground content, layered above the circles */}
      <motion.div
        className="relative z-10 flex w-full justify-center md:w-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Image
          src={logo}
          height={355}
          width={442}
          alt="On-Call-Hub Logo"
          priority
          sizes="(max-width: 640px) 176px, (max-width: 768px) 256px, (max-width: 1024px) 320px, 442px"
          className="h-auto w-44 sm:w-64 md:w-80 lg:w-[442px]"
        />
      </motion.div>

      <motion.div
        className="relative z-10 w-full max-w-sm shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <SignUpForm />
      </motion.div>
    </div>
  );
}
