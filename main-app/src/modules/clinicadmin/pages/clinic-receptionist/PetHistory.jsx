import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePet, deletePetVisit, getPetHistory } from "../../api/receptionApi";
import { Eye, Trash2 } from "lucide-react";

export default function PetHistory() {
  console.log("PetHistory Rendered");

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPetHistory = async () => {
    try {
      console.log("API Calling...");

      const response = await getPetHistory();

      console.log("API Response:", response);

      if (response.success) {
        setVisits(response.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetHistory();
  }, []);

  const handleDelete = async (visit) => {
    const message = visit.visitId
      ? "Delete this visit record? This cannot be undone."
      : "This pet has no visits. Delete the pet record instead? This cannot be undone.";
    if (!window.confirm(message)) return;

    try {
      if (visit.visitId) await deletePetVisit(visit.ownerId, visit.petId, visit.visitId);
      else await deletePet(visit.ownerId, visit.petId);
      fetchPetHistory();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredVisits = visits.filter(
    (visit) =>
      visit.petName?.toLowerCase().includes(search.toLowerCase()) ||
      visit.owner?.toLowerCase().includes(search.toLowerCase()),
  );

  const getStatusColor = (status) => {
    if (status === "Completed") return "bg-green-100 text-green-700";

    if (status === "In Progress") return "bg-blue-100 text-blue-700";

    return "bg-orange-100 text-orange-700";
  };

  const stats = [
    {
      label: "Total Visits",
      value: visits.length,
      color: "text-slate-900",
    },
    {
      label: "Completed",
      value: visits.filter((item) => item.status === "Completed").length,
      color: "text-green-600",
    },
    {
      label: "In Progress",
      value: visits.filter((item) => item.status === "In Progress").length,
      color: "text-orange-500",
    },
    {
      label: "Pending",
      value: visits.filter((item) => item.status === "Pending").length,
      color: "text-blue-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <h2 className="text-xl font-semibold text-slate-600">
          Loading Pet History...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
          Pet History
        </h1>

        <p className="text-slate-500 mt-2">
          View complete visit history and medical records
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-md shadow-slate-100/70 border border-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300">
            <p className="text-slate-500">{item.label}</p>

            <h2 className={`text-4xl font-bold mt-2 ${item.color}`}>
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-200/70 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
          <h2 className="text-2xl font-bold text-white">
            Visit History Records
          </h2>

          <p className="text-orange-100 mt-1">
            Search by Pet Name or Owner Name
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by pet name or owner name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3.5 pl-12 bg-white text-slate-700 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto mt-8">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-4 text-left">Date</th>

                  <th className="p-4 text-left">Pet Name</th>

                  <th className="p-4 text-left">Owner</th>

                  <th className="p-4 text-left">Reason</th>

                  <th className="p-4 text-left">Doctor</th>

                  <th className="p-4 text-left">Status</th>

                  <th className="p-4 text-left">Age</th>

                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-10 text-slate-500">
                      No Pet History Found
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((visit) => (
                    <tr
                      key={`${visit.petId}-${visit.tokenNumber}`}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="p-4">{visit.formattedDate}</td>

                      <td className="p-4 font-semibold">{visit.petName}</td>

                      <td className="p-4">{visit.owner}</td>

                      <td className="p-4">{visit.reason}</td>

                      <td className="p-4">{visit.doctor}</td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(visit.status)}`}
                        >
                          {visit.status}
                        </span>
                      </td>

                      <td className="p-4">{visit.age}</td>

                      <td className="p-4"><div className="flex items-center gap-2"><button onClick={() => navigate(`/reception/pet/${visit.ownerId}/${visit.petId}`)} className="grid size-9 place-items-center rounded-lg border border-[#0C3D2E]/15 bg-white text-[#0C3D2E] transition hover:bg-[#D9E8E3]/40" title="View record"><Eye className="size-4" /></button><button onClick={() => handleDelete(visit)} className="grid size-9 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100" title="Delete record"><Trash2 className="size-4" /></button></div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/60 p-6 mt-8">
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>

        <div className="space-y-6">
          {visits.slice(0, 5).map((visit, index) => (
            <div key={index} className="flex gap-4">
              <div className="w-4 h-4 rounded-full bg-orange-500 mt-2" />

              <div>
                <h3 className="font-semibold">{visit.reason}</h3>

                <p className="text-slate-500">
                  {visit.petName} - {visit.formattedDate} - {visit.doctor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
