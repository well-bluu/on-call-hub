import { Calendar, ChevronDown } from "lucide-react";
import { StaticImageData } from "next/image";

type Props = {
  image: StaticImageData;
  title: string;
  description: string;
  /** Month shown in the selector, e.g. "JULY 2026". The selector is hidden if omitted. */
  month?: string;
  /** Called when the month selector is clicked. */
  onMonthClick?: () => void;
};

export default function Banner({
  image,
  title,
  description,
  month,
  onMonthClick,
}: Props) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#D9D9D9] bg-cover bg-[position:40%_center] p-8"
      style={{ backgroundImage: `url(${image.src})` }}
    >
      <div className="flex flex-row items-center justify-between gap-5">
        {/* Title and description */}
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tight text-[hsl(var(--dark-blue))]">
            {title}
          </h1>
          <p className="mt-2 max-w-[12rem] text-sm font-medium text-[hsl(var(--dark-blue))]">
            {description}
          </p>
        </div>

        {/* Month selector */}
        {month && (
          <button
            type="button"
            onClick={onMonthClick}
            className="flex shrink-0 flex-row items-center"
          >
            <span className="z-10 -mr-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--signup-button)] text-white shadow-md">
              <Calendar size={24} />
            </span>
            <span className="flex flex-row items-center gap-3 rounded-xl bg-[var(--signup-button)] py-3 pl-6 pr-4 text-sm font-bold text-white shadow-md">
              {month}
              <ChevronDown size={18} />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
