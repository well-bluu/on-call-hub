type Props = {
  image: string;
  title: string;
  description: string;
};

export default function Banner({ image, title, description }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border-[1px] border-[#D9D9D9] bg-cover bg-[position:40%_center] p-8"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="max-w-lg">
        <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))]">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[hsl(var(--dark-blue))]">
          {description}
        </p>
      </div>
    </div>
  );
}
