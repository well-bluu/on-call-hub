type Props = {
  NBI: string;
  medCert: string;
  philHealth: string;
};

export default async function DocumentsCard({
  NBI,
  medCert,
  philHealth,
}: Props) {
  return (
    <div className="rounded-2xl border-[1px] border-[#D9D9D9] p-6">
      <h2 className="text-lg font-extrabold tracking-tight text-[hsl(var(--dark-blue))] mb-6">
        DOCUMENTS
      </h2>
      <table className="w-full table-fixed border-separate border-spacing-y-4 rounded-xl">
        <thead>
          <tr>
            <th className="w-1/3 text-center">Document Name</th>
            <th className="w-1/3 text-center">Description</th>
            <th className="w-1/3 text-center">Uploaded On</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="p-2.5 bg-[var(--document-color)] rounded-l-xl">
              {NBI}
            </td>
            <td className="p-2.5 bg-[var(--document-color)] text-center">
              Document Type
            </td>
            <td className="p-2.5 bg-[var(--document-color)] rounded-r-xl text-center">
              Date
            </td>
          </tr>

          <tr>
            <td className="p-2.5 bg-[var(--document-color)] rounded-l-xl">
              {medCert}
            </td>
            <td className="p-2.5 bg-[var(--document-color)] text-center">
              Document Type
            </td>
            <td className="p-2.5 bg-[var(--document-color)] rounded-r-xl text-center">
              Date
            </td>
          </tr>

          <tr>
            <td className="p-2.5 bg-[var(--document-color)] rounded-l-xl">
              {philHealth}
            </td>
            <td className="p-2.5 bg-[var(--document-color)] text-center">
              Document Type
            </td>
            <td className="p-2.5 bg-[var(--document-color)] rounded-r-xl text-center">
              Date
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
