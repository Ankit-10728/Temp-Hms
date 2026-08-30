import { FaDownload } from "react-icons/fa";

const PetOwnerHistoryTable = ({ history }) => {
  const prescriptions = history?.prescription || [];

  return (
    <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-lg">
      <div className="border-b p-5">
        <h2 className="text-xl font-bold text-slate-800">
          Medical History
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                Date
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                Doctor
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                Diagnosis
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                Prescription
              </th>
            </tr>
          </thead>

          <tbody>
            {prescriptions.length > 0 ? (
              prescriptions.map((item, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    {item.issuedDate
                      ? new Date(item.issuedDate).toLocaleDateString()
                      : "--"}
                  </td>

                  <td className="px-5 py-4">
                    {history?.petProfile?.doctorName || "--"}
                  </td>

                  <td className="px-5 py-4">
                    {history?.diagnosis || "--"}
                  </td>

                  <td className="px-5 py-4">
                    {item.pdfUrl ? (
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                      >
                        <FaDownload />
                        Download PDF
                      </a>
                    ) : (
                      <span className="text-slate-400">
                        No PDF
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-slate-500"
                >
                  No Medical History Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PetOwnerHistoryTable;