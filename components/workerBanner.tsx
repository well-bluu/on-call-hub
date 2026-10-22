import { Pen } from "lucide-react";
import Image from "next/image";
import { StaticImageData } from "next/image";
import DefaultProfile from "@/components/assets/images/default-avatar.avif";
type Props = {
  image: StaticImageData;
  title: string;
  description: string;
};

export default function Banner({ image, title, description }: Props) {
  return (
    <div
      className="overflow-hidden rounded-2xl border-[1px] border-[#D9D9D9] bg-cover bg-[position:40%_center] p-8"
      style={{ backgroundImage: `url(${image.src})` }}
    >
      <div className="flex flex-row justify-between items-center">
        <h2>Profile Overview</h2>
        <button className="flex flex-row items-center bg-[var(--signup-button)] text-white p-1.5 rounded-lg">
          <Pen size="20" className="mr-2.5" />
          Edit Profile
        </button>
      </div>
      <div className="flex flex-row gap-5 max-w-lg">
        {/* Profile Image */}
        <Image
          src={DefaultProfile}
          alt={""}
          width={150}
          height={150}
          className="rounded-full"
        />
        {/* Worker Name and Details */}
        <div className="pt-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--dark-blue))]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
