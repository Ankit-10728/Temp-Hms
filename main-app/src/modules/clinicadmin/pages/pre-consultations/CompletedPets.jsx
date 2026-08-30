import { useState, useEffect } from "react";
import formatDate from "../../../../shared/utils/formatDate";
import { deletePreConsultationVisit, getCompletedPets } from "../../api/preConsultationApi";
import { Search, Filter, RefreshCw, Eye, CheckCircle, CheckCircle2, Stethoscope, Activity, X, Trash2, Pencil, PawPrint } from "lucide-react";
import PetRegistrationWizard from "./PetRegistrationWizard";
import toast from "react-hot-toast";

export default function CompletedPets() {
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("ALL");
  const [completedPets, setCompletedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedToday: 0,
    sentToDoctor: 0,
    totalCompleted: 0,
  });

  const [selectedPetView, setSelectedPetView] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCompletedPets();
  }, []);

  const fetchCompletedPets = async () => {
    try {
      setLoading(true);
      const res = await getCompletedPets();
      const petList = res.data?.pets || [];
      const statsObj = res.data?.stats || {};
      setCompletedPets(petList);
      setStats({
        completedToday: statsObj.completedToday || petList.length,
        sentToDoctor: statsObj.sentToDoctor || statsObj.completedToday || petList.length,
        totalCompleted: statsObj.totalCompleted || petList.length,
      });
    } catch (err) {
      console.error("Error fetching completed pets:", err);
      toast.error("Failed to fetch completed assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pet) => {
    if (!window.confirm("Delete this visit and its pre-consultation record? This cannot be undone.")) return;
    try {
      await deletePreConsultationVisit(pet._id);
      toast.success("Visit record deleted");
      fetchCompletedPets();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete visit record");
    }
  };

  const filteredPets = completedPets.filter((item) => {
    const ownerName = String(item.ownerId?.ownerName || item.ownerName || "");
    const petName = String(item.pet?.petName || item.pet?.name || item.petId?.name || item.petId?.petName || item.petName || "");
    const token = String(item.tokenNumber || item.token || "");
    const phone = String(item.ownerId?.mobileNumber || item.phoneNumber || "");
    const species = String(item.pet?.species || item.petId?.species || item.species || "");

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

    return matchesSearch && matchesSpecies;
  });

  return (
    <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
          <div className="bg-[#D9E8E3]/35 rounded-[16px] p-[16px] md:p-[20px] border border-[#0C3D2E]/15 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-between gap-[16px]">
            <div>
              <p className="uppercase text-[12px] font-[700] tracking-wider text-[#0C3D2E]/80">Completed Today</p>
              <h2 className="text-[24px] md:text-[32px] font-[900] text-[#0C3D2E] mt-[4px] tracking-tight">{loading ? "..." : stats.completedToday}</h2>
            </div>
            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#0C3D2E] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-[22px] h-[22px]" />
            </div>
          </div>

          <div className="bg-[#FFF4E5] rounded-[16px] p-[16px] md:p-[20px] border border-[#F7931E]/20 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-between gap-[16px]">
            <div>
              <p className="uppercase text-[12px] font-[700] tracking-wider text-[#F7931E]">Forwarded To Doctor</p>
              <h2 className="text-[24px] md:text-[32px] font-[900] text-[#0C3D2E] mt-[4px] tracking-tight">{loading ? "..." : stats.sentToDoctor}</h2>
            </div>
            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#F7931E] text-white flex items-center justify-center shrink-0">
              <Stethoscope className="w-[22px] h-[22px]" />
            </div>
          </div>

          <div className="bg-[#D9E8E3]/35 rounded-[16px] p-[16px] md:p-[20px] border border-[#0C3D2E]/15 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-between gap-[16px]">
            <div>
              <p className="uppercase text-[12px] font-[700] tracking-wider text-[#0C3D2E]/80">Total Completed Archive</p>
              <h2 className="text-[24px] md:text-[32px] font-[900] text-[#0C3D2E] mt-[4px] tracking-tight">{loading ? "..." : stats.totalCompleted}</h2>
            </div>
            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#0C3D2E] text-white flex items-center justify-center shrink-0">
              <Activity className="w-[22px] h-[22px]" />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-[16px] border border-[#0C3D2E]/15 shadow-sm p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search completed pets by Owner, Pet Name, Token or Mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#F7931E] transition-all text-sm font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 w-full md:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer pr-2"
                >
                  <option value="ALL">All Species</option>
                  <option value="DOG">Dog</option>
                  <option value="CAT">Cat</option>
                  <option value="BIRD">Bird</option>
                  <option value="RABBIT">Rabbit</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <button
                onClick={fetchCompletedPets}
                className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-all cursor-pointer"
                title="Refresh List"
              >
                <RefreshCw className="w-5 h-5 text-[#F7931E]" />
              </button>
            </div>
          </div>
        </div>

        {/* Table / Cards */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#0C3D2E]/15 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-[#0C3D2E]/15 bg-[#D9E8E3]/25">
            <div>
              <h2 className="text-[18px] md:text-[20px] font-[900] text-[#0C3D2E]">Completed Assessments Log</h2>
              <p className="text-[12px] font-[600] text-[#0C3D2E]/70 mt-0.5">Vitals successfully recorded and pushed to Doctor queue</p>
            </div>

            <div className="bg-[#0C3D2E]/10 text-[#0C3D2E] px-4 py-1.5 rounded-full font-[700] text-xs border border-[#0C3D2E]/15 self-start sm:self-center">
              {filteredPets.length} Completed
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#D9E8E3]/20 border-b border-[#0C3D2E]/15 text-[11px] font-[700] uppercase text-[#0C3D2E] tracking-wider">
                  <th className="px-6 py-4">Token</th>
                  <th className="px-6 py-4">Owner Details</th>
                  <th className="px-6 py-4">Pet Info</th>
                  <th className="px-6 py-4">Completed Date</th>
                  <th className="px-6 py-4">Current Stage</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#F7931E]" />
                      Loading completed assessments...
                    </td>
                  </tr>
                ) : filteredPets.length > 0 ? (
                  filteredPets.map((pet) => {
                    const token = pet.tokenNumber || `TK-${pet._id?.slice(-4)}`;
                    const ownerName = pet.ownerId?.ownerName || pet.ownerName || "Owner";
                    const mobile = pet.ownerId?.mobileNumber || pet.phoneNumber || "N/A";
                    const petName = pet.pet?.petName || pet.pet?.name || pet.petId?.name || pet.petId?.petName || pet.petName || "Pet";
                    const species = pet.pet?.species || pet.petId?.species || pet.species || "Dog";
                    const stage = pet.currentStage || "DOCTOR";

                    return (
                      <tr key={pet._id} className="hover:bg-[#D9E8E3]/15 transition-all duration-150">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">
                          <span className="bg-[#0C3D2E]/10 text-[#0C3D2E] px-3 py-1.5 rounded-xl text-xs font-mono font-bold">
                            {token}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[12px] bg-[#0C3D2E] text-white flex items-center justify-center font-black text-sm">
                              {ownerName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#0C3D2E]">{ownerName}</p>
                              <p className="text-xs text-slate-500">{mobile}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[12px] bg-[#FFF4E5] border border-[#F7931E]/20 flex items-center justify-center text-xl">
                              <PawPrint className="size-5 text-[#F7931E]" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{petName}</p>
                              <p className="text-xs text-slate-500">{species}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-medium text-slate-700">
                          {formatDate(pet.updatedAt || pet.createdAt)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {stage === "DOCTOR" ? "Sent to Doctor" : stage}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedPetView(pet)}
                              className="grid size-9 place-items-center rounded-lg border border-[#0C3D2E]/15 bg-white text-[#0C3D2E] transition hover:bg-[#D9E8E3]/40"
                              title="View vitals"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPetView(pet);
                                setShowEditModal(true);
                              }}
                              className="grid size-9 place-items-center rounded-lg bg-[#F7931E] text-white transition hover:bg-[#E08319]"
                              title="Edit vitals"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button onClick={() => handleDelete(pet)} className="grid size-9 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100" title="Delete visit"><Trash2 className="size-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-16">
                      <CheckCircle className="mx-auto mb-3 size-11 text-emerald-500" />
                      <h3 className="text-lg font-bold text-slate-700">No Completed Assessments Found</h3>
                      <p className="text-xs text-slate-500 mt-1">Completed records will appear here once recorded.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden p-4 space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading completed cases...</div>
            ) : filteredPets.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-medium">No completed pets found.</div>
            ) : (
              filteredPets.map((pet) => {
                const token = pet.tokenNumber || `TK-${pet._id?.slice(-4)}`;
                const ownerName = pet.ownerId?.ownerName || pet.ownerName || "Owner";
                const petName = pet.petId?.name || pet.petId?.petName || pet.petName || "Pet";
                const species = pet.petId?.species || pet.species || "Dog";

                return (
                  <div
                    key={pet._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                        {token}
                      </span>
                      <span className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-xs font-bold">
                        Completed
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl">
                        <PawPrint className="size-5 text-[#F7931E]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{petName}</h4>
                        <p className="text-xs text-slate-500">Owner: {ownerName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSelectedPetView(pet)}
                        className="bg-slate-100 text-slate-800 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPetView(pet);
                          setShowEditModal(true);
                        }}
                        className="bg-[#F7931E] text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(pet)} className="rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100" title="Delete visit"><Trash2 className="mx-auto w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* View Vitals Full Modal */}
        {selectedPetView && !showEditModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-xs p-3 md:p-6 flex items-center justify-center">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center shrink-0">
                <div>
                  <span className="bg-green-500/30 text-green-300 border border-green-500/40 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md">
                    Token: {selectedPetView.tokenNumber || `TK-${selectedPetView._id?.slice(-4)}`}
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    {selectedPetView.pet?.petName || selectedPetView.pet?.name || selectedPetView.petId?.name || selectedPetView.petId?.petName || selectedPetView.petName || "Patient"} Pre-Consultation Assessment
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Owner: <span className="text-white font-semibold">{selectedPetView.ownerId?.ownerName || selectedPetView.ownerName || "Owner"}</span> ({selectedPetView.ownerId?.mobileNumber || selectedPetView.phoneNumber || "N/A"})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPetView(null)}
                  className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center font-bold text-lg transition-all"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              {(() => {
                const pc = (typeof selectedPetView.preConsultationId === 'object' && selectedPetView.preConsultationId) || selectedPetView || {};
                const pet = (typeof selectedPetView.petId === 'object' && selectedPetView.petId) || selectedPetView.pet || {};
                const owner = (typeof selectedPetView.ownerId === 'object' && selectedPetView.ownerId) || selectedPetView.owner || {};

                return (
                  <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-xs">
                    {/* 1. Vitals Grid */}
                    <div>
                      <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-3 text-[11px] flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-green-600" /> 1. Recorded Physical Vitals
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 bg-red-50/80 border border-red-100 rounded-2xl">
                          <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Body Temperature</p>
                          <p className="text-base font-extrabold text-red-900 mt-1">
                            {pc.bodyTemperature ? `${pc.bodyTemperature} °F` : (selectedPetView.vitals?.temp ? `${selectedPetView.vitals.temp} °F` : "-")}
                          </p>
                        </div>

                        <div className="p-3.5 bg-rose-50/80 border border-rose-100 rounded-2xl">
                          <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Heart Rate</p>
                          <p className="text-base font-extrabold text-rose-900 mt-1">
                            {pc.heartRate ? `${pc.heartRate} bpm` : (selectedPetView.vitals?.heartRate ? `${selectedPetView.vitals.heartRate} bpm` : "-")}
                          </p>
                        </div>

                        <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl">
                          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Respiratory Rate</p>
                          <p className="text-base font-extrabold text-blue-900 mt-1">
                            {pc.respiratoryRate ? `${pc.respiratoryRate} bpm` : (selectedPetView.vitals?.respRate ? `${selectedPetView.vitals.respRate} bpm` : "-")}
                          </p>
                        </div>

                        <div className="p-3.5 bg-purple-50/80 border border-purple-100 rounded-2xl">
                          <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Blood Pressure</p>
                          <p className="text-base font-extrabold text-purple-900 mt-1">
                            {(() => {
                              const bp = pc.bloodPressure;
                              if (bp && typeof bp === 'object') {
                                return `${bp.systolic || '--'}/${bp.diastolic || '--'} mmHg`;
                              }
                              if (typeof bp === 'string') return bp;
                              return selectedPetView.vitals?.bp || "-";
                            })()}
                          </p>
                        </div>

                        <div className="p-3.5 bg-sky-50/80 border border-sky-100 rounded-2xl">
                          <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">SpO₂ Oxygen</p>
                          <p className="text-base font-extrabold text-sky-900 mt-1">
                            {pc.spo2 ? `${pc.spo2}%` : (selectedPetView.vitals?.spo2 ? `${selectedPetView.vitals.spo2}%` : "-")}
                          </p>
                        </div>

                        <div className="p-3.5 bg-amber-50/80 border border-amber-100 rounded-2xl">
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Body Weight</p>
                          <p className="text-base font-extrabold text-amber-900 mt-1">
                            {pc.bodyWeight ? `${pc.bodyWeight} kg` : (selectedPetView.vitals?.weight ? `${selectedPetView.vitals.weight} kg` : "-")}
                          </p>
                        </div>

                        <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-2xl">
                          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">BCS Score</p>
                          <p className="text-base font-extrabold text-emerald-900 mt-1">
                            {pc.bcs || selectedPetView.vitals?.bcs || "-"}
                          </p>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recorded By</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">
                            {pc.recordedBy || selectedPetView.recordedBy || "Triage Staff"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2. History & Illness Timeline */}
                    <div>
                      <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-3 text-[11px]">
                        2. Illness Timeline & Medical Background
                      </h4>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-slate-400 font-semibold text-[10px] uppercase">Illness Duration</p>
                          <p className="font-bold text-slate-800 mt-0.5">
                            {pc.durationOfIllness?.value ? `${pc.durationOfIllness.value} ${pc.durationOfIllness.unit || ""}` : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold text-[10px] uppercase">Onset Speed</p>
                          <p className="font-bold text-slate-800 mt-0.5">{pc.onset || "-"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold text-[10px] uppercase">Progression Pattern</p>
                          <p className="font-bold text-slate-800 mt-0.5">{pc.progression || "-"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold text-[10px] uppercase">Previous Episodes</p>
                          <p className="font-bold text-slate-800 mt-0.5">{pc.previousEpisodes?.hasPreviousEpisodes ? "Yes" : "No"}</p>
                        </div>
                      </div>
                      {pc.previousEpisodes?.description && (
                        <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 italic">
                          <span className="font-bold text-slate-600 not-italic block mb-0.5">Episode Description:</span>
                          {pc.previousEpisodes.description}
                        </div>
                      )}
                    </div>

                    {/* 3. Primary Complaint & Symptoms */}
                    <div>
                      <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-3 text-[11px]">
                        3. Primary Complaint & Severity
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-1">
                          <p className="font-bold text-orange-900 text-xs uppercase">Primary Complaint / Reason</p>
                          <p className="text-slate-800 font-semibold text-sm">
                            {pc.primaryComplaint || selectedPetView.primaryReason || selectedPetView.complaint || "Routine Pre-Checkup Examination"}
                          </p>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                          <p className="font-bold text-slate-700 text-xs uppercase">Associated Symptoms & Severity</p>
                          <p className="text-slate-800 font-semibold">
                            Severity: <span className="font-bold text-orange-600">{pc.severity || "Moderate"}</span>
                          </p>
                          {pc.associatedSymptoms?.length > 0 && (
                            <p className="text-slate-600">Symptoms: {pc.associatedSymptoms.join(", ")}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 4. Physical Observations & Notes */}
                    <div>
                      <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-3 text-[11px]">
                        4. Physical Observations & Triage Notes
                      </h4>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-slate-400 font-semibold text-[10px] uppercase">General Demeanour</p>
                          <p className="font-bold text-slate-800 mt-0.5">{pc.generalDemeanour || "-"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold text-[10px] uppercase">Gait & Posture</p>
                          <p className="font-bold text-slate-800 mt-0.5">{pc.gaitAndPosture || "-"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold text-[10px] uppercase">Visible Lesions</p>
                          <p className="font-bold text-slate-800 mt-0.5">{pc.visibleLesions || "-"}</p>
                        </div>
                      </div>
                      {pc.staffNotes && (
                        <div className="mt-2 p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-slate-800">
                          <p className="font-extrabold text-amber-900 text-xs uppercase mb-0.5">Staff Triage Notes:</p>
                          <p className="italic font-medium">{pc.staffNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setSelectedPetView(null)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer border-none"
                >
                  Close Window
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer border-none flex items-center gap-2"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Edit Assessment Vitals</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {showEditModal && (
          <PetRegistrationWizard
            petData={selectedPetView}
            onClose={() => {
              setShowEditModal(false);
              setSelectedPetView(null);
            }}
            onCompleted={() => {
              toast.success("Assessment updated successfully!");
              fetchCompletedPets();
            }}
          />
        )}
      </div>
  );
}
