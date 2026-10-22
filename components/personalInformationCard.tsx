type Props = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
};

export default function PersonalInformationCard({
  fullName,
  dateOfBirth,
  gender,
  phoneNumber,
  emailAddress,
  address,
}: Props) {
  return (
    <div className="rounded-2xl border-[1px] border-[#D9D9D9] p-6">
      <h2 className="text-lg font-extrabold tracking-tight text-[hsl(var(--dark-blue))] mb-6">
        PERSONAL INFORMATION
      </h2>

      <div className="grid grid-cols-2 grid-rows-3 gap-x-8 gap-y-4">
        <div>
          <p className="text-xs font-bold text-[hsl(var(--dark-blue))] mb-2">
            FULL NAME
          </p>
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-gray-700">
            {fullName}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-[hsl(var(--dark-blue))] mb-2">
            PHONE NUMBER
          </p>
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-gray-700">
            {phoneNumber}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-[hsl(var(--dark-blue))] mb-2">
            DATE OF BIRTH
          </p>
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-gray-700">
            {dateOfBirth}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-[hsl(var(--dark-blue))] mb-2">
            EMAIL ADDRESS
          </p>
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-gray-700">
            {emailAddress}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-[hsl(var(--dark-blue))] mb-2">
            GENDER
          </p>
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-gray-700">
            {gender}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-[hsl(var(--dark-blue))] mb-2">
            ADDRESS
          </p>
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-gray-700">
            {address}
          </div>
        </div>
      </div>
    </div>
  );
}
