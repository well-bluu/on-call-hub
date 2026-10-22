import { StaticImageData } from "next/image";
type Props = {
  image: StaticImageData;
  title: string;
  description: string;
};

export default function Banner({ image }: Props) {
  return (
    <div
      className="overflow-hidden rounded-2xl border-[1px] border-[#D9D9D9] bg-cover bg-[position:40%_center] p-8"
      style={{ backgroundImage: `url(${image.src})` }}
    >
      <div className="flex flex-row gap-5 max-w-lg">
        {/* Worker Name and Details */}
        <div className="">
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))]">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--dark-blue))]">
            View and manage all system updates, <br />
            shift offers, and schedule changes.
          </p>
        </div>
      </div>
    </div>
  );
}
