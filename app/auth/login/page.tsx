import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import logo from "@/components/assets/images/Logo.png";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-evenly p-6 md:p-10">
      <Image src={logo} height={"355"} width={"442"} alt={"On-Call-Hub Logo"} />
      <div className="shrink-0 w-full max-w-sm shadow-xl/30">
        <LoginForm />
      </div>
    </div>
  );
}
