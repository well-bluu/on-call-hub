import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import logo from "@/components/assets/images/Logo.png";
import circle from "@/components/assets/images/Circle_Design.png";
import * as motion from "motion/react-client";

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-evenly overflow-hidden p-6 md:p-10">
      {/* Decorative circles — positioned absolutely, behind everything else */}
      <motion.div
        className="absolute -top-10 left-12 h-32 w-32 md:h-40 md:w-40"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
      >
        <Image src={circle} alt="" fill className="object-contain" />
      </motion.div>

      <motion.div
        className="absolute top-24 left-1/2 h-24 w-24 md:h-28 md:w-28"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
      >
        <Image src={circle} alt="" fill className="object-contain" />
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-4 h-40 w-40 md:h-52 md:w-52"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      >
        <Image src={circle} alt="" fill className="object-contain" />
      </motion.div>

      <motion.div
        className="absolute -bottom-16 right-10 h-36 w-36 md:h-44 md:w-44"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
      >
        <Image src={circle} alt="" fill className="object-contain" />
      </motion.div>

      {/* Foreground content, layered above the circles */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Image src={logo} height={355} width={442} alt="On-Call-Hub Logo" />
      </motion.div>

      <motion.div
        className="relative z-10 shrink-0 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <LoginForm />
      </motion.div>
    </div>
  );
}
