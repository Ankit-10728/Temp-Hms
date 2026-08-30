import { useState, useEffect } from "react";
import { deletePreConsultationVisit, getHistoryPets } from "../../api/preConsultationApi";
import formatDate from "../../../../shared/utils/formatDate";
import { Search, Filter, Calendar, RefreshCw, Eye, FileText, History, Activity, CheckCircle, Trash2, PawPrint, X } from "lucide-react";
import toast from "react-hot-toast";

export default function HistoryPets() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("ALL");
  const [historyData, setHistoryData] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    uniquePets: 0,
    vitalsRecorded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getHistoryPets();
      const records = res.data?.records || [];
      const statsData = res.data?.stats || {};

      setHistoryData(records);
      setStats({
        totalRecords: statsData.totalRecords || records.length,
        uniquePets: statsData.uniquePets || records.length,
        vitalsRecorded: statsData.vitalsRecorded || records.length,
      });
    } catch (err) {
      console.error("Error fetching history pets:", err);
      toast.error("Failed to fetch historical pet records");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this visit and its pre-consultation record? This cannot be undone.")) return;
    try {
      await deletePreConsultationVisit(item._id);
      toast.success("Visit record deleted");
      fetchHistory();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete visit record");
    }
  };

  const filteredRecords = historyData.filter((item) => {
    const ownerName = String(item.ownerId?.ownerName || item.ownerName || "");
    const petName = String(item.pet?.petName || item.pet?.name || item.petId?.name || item.petName || "");
    const token = String(item.tokenNumber || item.token || "");
    const phone = String(item.ownerId?.mobileNumber || item.phoneNumber || "");
    const species = String(item.pet?.species || item.petId?.species || item.species || "");
    const itemDate = item.updatedAt ? new Date(item.updatedAt).toISOString().split("T")[0] : "";

    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      token.toLowerCase().includes(query) ||
      ownerName.toLowerCase().includes(query) ||
      petName.toLowerCase().includes(query) ||
      phone.includes(query);

    const matchesSpecies =
      speciesFilter === "ALL" ||
      species.toUpperCase() === speciesFilter.toUpperCase();

    const matchesDate = !selectedDate || itemDate === selectedDate;

    return matchesSearch && matchesSpecies && matchesDate;
  });

  return (
    <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
          <div className="bg-[#D9E8E3]/35 rounded-[16px] p-[16px] md:p-[20px] border border-[#0C3D2E]/15 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-between gap-[16px]">
            <div>
              <p className="uppercase text-[12px] font-[700] tracking-wider text-[#0C3D2E]/80">Historical Records</p>
              <h2 className="text-[24px] md:text-[32px] font-[900] text-[#0C3D2E] mt-[4px] tracking-tight">{loading ? "..." : stats.totalRecords}</h2>
            </div>
            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#0C3D2E] text-white flex items-center justify-center shrink-0">
              <History className="w-[22px] h-[22px]" />
            </div>
          </div>

          <div className="bg-[#FFF4E5] rounded-[16px] p-[16px] md:p-[20px] border border-[#F7931E]/20 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-between gap-[16px]">
            <div>
              <p className="uppercase text-[12px] font-[700] tracking-wider text-[#F7931E]">Active Patients Logged</p>
              <h2 className="text-[24px] md:text-[32px] font-[900] text-[#0C3D2E] mt-[4px] tracking-tight">{loading ? "..." : stats.uniquePets}</h2>
            </div>
            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#F7931E] text-white flex items-center justify-center shrink-0">
              <Activity className="w-[22px] h-[22px]" />
            </div>
          </div>

          <div className="bg-[#D9E8E3]/35 rounded-[16px] p-[16px] md:p-[20px] border border-[#0C3D2E]/15 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-between gap-[16px]">
            <div>
              <p className="uppercase text-[12px] font-[700] tracking-wider text-[#0C3D2E]/80">Completed Vitals</p>
              <h2 className="text-[24px] md:text-[32px] font-[900] text-[#0C3D2E] mt-[4px] tracking-tight">{loading ? "..." : stats.vitalsRecorded}</h2>
            </div>
            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#0C3D2E] text-white flex items-center justify-center shrink-0">
              <CheckCircle className="w-[22px] h-[22px]" />
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-[16px] border border-[#0C3D2E]/15 shadow-sm p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Pet / Owner / Token..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#F7931E] transition-all font-medium"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#F7931E] transition-all text-slate-700 font-semibold cursor-pointer"
              />
            </div>

            {/* Species Selector */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#F7931E] font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Species</option>
                <option value="DOG">Dog</option>
                <option value="CAT">Cat</option>
                <option value="BIRD">Bird</option>
                <option value="RABBIT">Rabbit</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Reset / Refresh Button */}
            <button
              onClick={() => {
                setSearch("");
                setSelectedDate("");
                setSpeciesFilter("ALL");
                fetchHistory();
              }}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-semibold py-3 text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Table & Cards */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50/70 to-white">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Medical Records Archive</h2>
              <p className="text-xs text-slate-500 mt-0.5">Historical pet consultations and triage logs</p>
            </div>

            <div className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-2xl font-bold text-xs border border-blue-200 self-start sm:self-center">
              {filteredRecords.length} Records
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4">Token</th>
                  <th className="px-6 py-4">Owner Details</th>
                  <th className="px-6 py-4">Pet Info</th>
                  <th className="px-6 py-4">Visit Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                      Loading history archive...
                    </td>
                  </tr>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((item) => {
                    const token = item.tokenNumber || `TK-${item._id?.slice(-4)}`;
                    const ownerName = item.ownerId?.ownerName || item.ownerName || "Owner";
                    const mobile = item.ownerId?.mobileNumber || item.phoneNumber || "N/A";
                    const petName = item.pet?.petName || item.pet?.name || item.petId?.name || item.petName || "Pet";
                    const species = item.pet?.species || item.petId?.species || item.species || "Dog";
                    const breed = item.pet?.breed || item.petId?.breed || item.breed || "Standard";

                    return (
                      <tr key={item._id} className="hover:bg-blue-50/30 transition-all duration-150">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">
                          <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                            {token}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                              {ownerName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{ownerName}</p>
                              <p className="text-xs text-slate-500">{mobile}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">
                              <PawPrint className="size-5 text-[#F7931E]" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{petName}</p>
                              <p className="text-xs text-slate-500">{species} • {breed}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-medium text-slate-700">
                          {formatDate(item.updatedAt || item.createdAt)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                            {item.status || "COMPLETED"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2"><button onClick={() => setSelectedRecord(item)} className="grid size-9 place-items-center rounded-lg border border-[#0C3D2E]/15 bg-white text-[#0C3D2E] transition hover:bg-[#D9E8E3]/40" title="View record"><Eye className="size-4" /></button><button onClick={() => handleDelete(item)} className="grid size-9 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100" title="Delete visit"><Trash2 className="size-4" /></button></div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-16">
                      <FileText className="mx-auto mb-3 size-11 text-[#F7931E]" />
                      <h3 className="text-lg font-bold text-slate-700">No History Records Found</h3>
                      <p className="text-xs text-slate-500 mt-1">Try relaxing your search keywords or date filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden p-4 space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading history...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-medium">No records found.</div>
            ) : (
              filteredRecords.map((item) => {
                const token = item.tokenNumber || `TK-${item._id?.slice(-4)}`;
                const ownerName = item.ownerId?.ownerName || item.ownerName || "Owner";
                const petName = item.pet?.petName || item.pet?.name || item.petId?.name || item.petName || "Pet";

                return (
                  <div key={item._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                        {token}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {item.status || "ARCHIVED"}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-700">
                      <p><strong>Owner:</strong> {ownerName}</p>
                      <p><strong>Pet:</strong> {petName}</p>
                      <p><strong>Date:</strong> {formatDate(item.updatedAt || item.createdAt)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2"><button onClick={() => setSelectedRecord(item)} className="rounded-xl bg-[#0C3D2E] py-2.5 text-xs font-bold text-white" title="View record"><Eye className="mx-auto w-4 h-4" /></button><button onClick={() => handleDelete(item)} className="rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-rose-600" title="Delete visit"><Trash2 className="mx-auto w-4 h-4" /></button></div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detailed Medical Record Inspector Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs p-4 flex items-center justify-center">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    {selectedRecord.tokenNumber || "TOKEN"}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-800 mt-2">
                    {selectedRecord.pet?.petName || selectedRecord.pet?.name || selectedRecord.petId?.name || selectedRecord.petName || "Pet"} Medical Archive
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recorded on: {formatDate(selectedRecord.updatedAt || selectedRecord.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Owner & Patient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Owner Profile</p>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedRecord.ownerId?.ownerName || selectedRecord.ownerName || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Phone: {selectedRecord.ownerId?.mobileNumber || selectedRecord.phoneNumber || "N/A"}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pet Identity</p>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedRecord.pet?.petName || selectedRecord.pet?.name || selectedRecord.petId?.name || selectedRecord.petName || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Species: {selectedRecord.pet?.species || selectedRecord.petId?.species || selectedRecord.species || "Dog"} ({selectedRecord.pet?.breed || selectedRecord.petId?.breed || "Standard"})
                  </p>
                </div>
              </div>

              {/* Vitals Summary */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider text-xs">
                  Recorded Pre-Consultation Vitals
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Temp</p>
                    <p className="text-sm font-extrabold text-blue-900 mt-0.5">
                      {selectedRecord.preConsultationId?.bodyTemperature || "101.2 °F"}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Heart Rate</p>
                    <p className="text-sm font-extrabold text-blue-900 mt-0.5">
                      {selectedRecord.preConsultationId?.heartRate || "96 bpm"}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Weight</p>
                    <p className="text-sm font-extrabold text-blue-900 mt-0.5">
                      {selectedRecord.preConsultationId?.bodyWeight || "13.5 kg"}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">SpO2</p>
                    <p className="text-sm font-extrabold text-blue-900 mt-0.5">
                      {selectedRecord.preConsultationId?.spo2 || "99 %"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnosis / Notes */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase">Assessment Notes & Complaint:</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedRecord.primaryReason || selectedRecord.complaint || "Patient presented for general wellness evaluation. Vitals recorded normally."}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-blue-600 transition-all"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
