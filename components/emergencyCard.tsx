type Props = { name: string; number: string };

export default function EmergencyCard({ name, number }: Props) {
  return (
    <div className="rounded-2xl border-[1px] border-[#D9D9D9] p-6">
      <h2 className="text-lg font-extrabold tracking-tight text-[hsl(var(--dark-blue))] mb-6">
        EMERGENCY CONTACT
      </h2>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold text-[hsl(var(--dark-blue))] mb-2">
            CONTACT NAME
          </p>
          <div className="bg-[var(--emergency-color)] rounded-lg px-4 py-3 text-sm text-gray-700">
            {name}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-[hsl(var(--dark-blue))] mb-2">
            PHONE NUMBER
          </p>
          <div className="bg-[var(--emergency-color)] rounded-lg px-4 py-3 text-sm text-gray-700">
            {number}
          </div>
        </div>
      </div>
    </div>
  );
}
