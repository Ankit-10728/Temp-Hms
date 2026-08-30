import { useState, useEffect, useMemo } from "react";
import PetRegistrationWizard from "./PetRegistrationWizard";
import { deletePreConsultationVisit, getPendingPets } from "../../api/preConsultationApi";
import {
  Search,
  Filter,
  Stethoscope,
  RefreshCw,
  Eye,
  X,
  User,
  PawPrint,
  FileText,
  Cat,
  Bird,
  Rabbit,
  Syringe,
  ShieldPlus,
  Scissors,
  HeartPulse,
  Trash2,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";

const formatToken = (val) => {
  if (val === null || val === undefined || val === "" || val === "—") return "—";
  const str = String(val).trim();
  if (str.toUpperCase().startsWith("TK-")) return str.toUpperCase();
  return `TK-${str}`;
};

export default function PendingPets() {
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("ALL");
  const [openModal, setOpenModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [viewDetailsItem, setViewDetailsItem] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPets();
  }, []);

  const fetchPendingPets = async () => {
    try {
      setLoading(true);
      const res = await getPendingPets();
      setPets(res.data || []);
    } catch (err) {
      console.error("Error fetching pending pets:", err);
      toast.error("Failed to load pending queue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (petItem) => {
    if (!window.confirm("Delete this visit and its pre-consultation record? This cannot be undone.")) return;
    try {
      await deletePreConsultationVisit(petItem._id);
      toast.success("Visit record deleted");
      fetchPendingPets();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete visit record");
    }
  };

  const getSpeciesIcon = (species) => {
    const s = (species || "").toLowerCase();
    if (s.includes("cat")) return <Cat className="w-5 h-5 text-orange-600" />;
    if (s.includes("bird") || s.includes("parrot")) return <Bird className="w-5 h-5 text-blue-600" />;
    if (s.includes("rabbit")) return <Rabbit className="w-5 h-5 text-purple-600" />;
    return <PawPrint className="w-5 h-5 text-orange-600" />;
  };

  // Bug 4 Fix: useMemo — filters pets locally, no API call, no page reload
  const filteredPets = useMemo(() => {
    const query = search.toLowerCase().trim();
    return pets.filter((petItem) => {
      const ownerName = String(petItem.owner?.ownerName || petItem.ownerName || "");
      const petName   = String(petItem.pet?.petName || petItem.petName || "");
      // Bug 5 Fix: only use stored tokenNumber, never regenerate
      const token     = String(petItem.tokenNumber || "");
      const phone     = String(petItem.owner?.mobileNumber || petItem.phoneNumber || "");
      const species   = String(petItem.pet?.species || petItem.species || "");

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
  }, [search, speciesFilter, pets]);

  return (
    <div className="space-y-6">

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <form onSubmit={(e) => e.preventDefault()} role="search" className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Token, Owner Name, Phone Number or Pet Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
              className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 w-full md:w-auto">
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
              onClick={fetchPendingPets}
              className="p-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-slate-700 transition-all"
              title="Refresh List"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[16px] shadow-sm border border-[#0C3D2E]/15 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-[#0C3D2E]/15 bg-[#D9E8E3]/25">
          <div>
            <h2 className="text-[18px] md:text-[20px] font-[900] text-[#0C3D2E]">Pending Assessments</h2>
            <p className="text-[12px] font-[600] text-[#0C3D2E]/70 mt-0.5">
              Select a pet to open and submit pre-consultation vitals
            </p>
          </div>
          <div className="bg-[#F7931E]/10 text-[#F7931E] px-4 py-1.5 rounded-full font-[700] text-xs border border-[#F7931E]/20 self-start sm:self-center">
            {filteredPets.length} Patients Waiting
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#D9E8E3]/20 border-b border-[#0C3D2E]/15 text-[11px] font-[700] text-[#0C3D2E] tracking-wider">
                <th className="px-6 py-4">Token</th>
                <th className="px-6 py-4">Owner Details</th>
                <th className="px-6 py-4">Pet Info</th>
                <th className="px-6 py-4">Complaint / Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#F7931E]" />
                    Loading pending pets queue...
                  </td>
                </tr>
              ) : filteredPets.length > 0 ? (
                filteredPets.map((petItem) => {
                  const token     = formatToken(petItem.tokenNumber);
                  const ownerName = petItem.owner?.ownerName || petItem.ownerName || "Unknown Owner";
                  const mobile    = petItem.owner?.mobileNumber || petItem.phoneNumber || "N/A";
                  const petName   = petItem.pet?.petName || petItem.petName || "Pet";
                  const species   = petItem.pet?.species || petItem.species || "Dog";
                  const breed     = petItem.pet?.breed || petItem.breed || "Standard";
                  const complaint = petItem.primaryReason || petItem.complaint || "General Pre-Checkup";

                  return (
                    <tr key={petItem._id} className="hover:bg-[#D9E8E3]/15 transition-all duration-150">
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
                          <div className="w-10 h-10 rounded-[12px] bg-[#FFF4E5] border border-[#F7931E]/20 flex items-center justify-center">
                            {getSpeciesIcon(species)}
                          </div>
                          <div>
                            <p className="font-bold text-[#0C3D2E]">{petName}</p>
                            <p className="text-xs text-slate-500">{species} • {breed}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-slate-700 max-w-xs truncate">{complaint}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-[#FFF4E5] text-[#F7931E] px-3 py-1 rounded-full text-xs font-bold border border-[#F7931E]/20">
                          <span className="w-2 h-2 rounded-full bg-[#F7931E] animate-pulse"></span>
                          Pending Assessment
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewDetailsItem(petItem)}
                            className="grid size-9 place-items-center rounded-lg border border-[#0C3D2E]/15 bg-white text-[#0C3D2E] transition hover:bg-[#D9E8E3]/40"
                            title="View Reception Intake Data"
                          >
                            <Eye className="size-4 text-[#F7931E]" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPet(petItem);
                              setOpenModal(true);
                            }}
                            className="grid size-9 place-items-center rounded-lg bg-[#F7931E] text-white transition hover:bg-[#E08319]"
                            title="Record vitals"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(petItem)}
                            className="grid size-9 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                            title="Delete visit"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <div className="flex justify-center mb-3">
                      <PawPrint className="w-12 h-12 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No Matching Pending Pets</h3>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting search query or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden p-4 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading pending pets...</div>
          ) : filteredPets.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-medium">No pending pets found.</div>
          ) : (
            filteredPets.map((petItem) => {
              const token     = formatToken(petItem.tokenNumber);
              const ownerName = petItem.owner?.ownerName || petItem.ownerName || "Unknown Owner";
              const mobile    = petItem.owner?.mobileNumber || petItem.phoneNumber || "N/A";
              const petName   = petItem.pet?.petName || petItem.petName || "Pet";
              const species   = petItem.pet?.species || petItem.species || "Dog";

              return (
                <div key={petItem._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                      {token}
                    </span>
                    <span className="bg-orange-100 text-orange-700 px-3 py-0.5 rounded-full text-xs font-bold">
                      Pending Vitals
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      {getSpeciesIcon(species)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{petName}</h4>
                      <p className="text-xs text-slate-500">Owner: {ownerName} ({mobile})</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setViewDetailsItem(petItem)}
                      className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPet(petItem);
                        setOpenModal(true);
                      }}
                      className="w-full bg-slate-900 hover:bg-orange-600 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(petItem)}
                      className="bg-rose-50 text-rose-600 border border-rose-200 py-2 rounded-xl transition-all flex items-center justify-center"
                      title="Delete visit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Assessment Modal */}
      {openModal && (
        <PetRegistrationWizard
          petData={selectedPet}
          onClose={() => {
            setOpenModal(false);
            setSelectedPet(null);
          }}
          onCompleted={() => {
            fetchPendingPets();
          }}
        />
      )}

      {/* View Details Modal */}
      {viewDetailsItem && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-[9999] p-3 md:p-6">
          <div className="bg-white w-[900px] max-w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                  <PawPrint className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span>{viewDetailsItem?.pet?.petName || viewDetailsItem?.petName || "Pet Patient"}</span>
                    <span className="bg-orange-500/30 text-orange-300 text-xs font-mono font-bold px-2 py-0.5 rounded border border-orange-500/40">
                      {formatToken(viewDetailsItem?.tokenNumber)}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300">Reception Intake Data & Patient Profile</p>
                </div>
              </div>
              <button
                onClick={() => setViewDetailsItem(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center font-bold text-sm transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">

              {/* Section 1: Reception Intake & Visit Details */}
              <div className="bg-[#FFF4E5] border border-[#F7931E]/30 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-extrabold text-[#0C3D2E] tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F7931E]" />
                  1. Reception Intake Details & Visit Info
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Token Number</span>
                    <span className="font-mono font-black text-[#F7931E] block mt-0.5 text-sm">
                      {formatToken(viewDetailsItem?.tokenNumber)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Primary Reason</span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {viewDetailsItem?.primaryReason || viewDetailsItem?.visitType || "N/A"}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Visit Type</span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {viewDetailsItem?.visitType || "N/A"}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Visit Priority</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-extrabold mt-0.5 ${
                      viewDetailsItem?.priority === "EMERGENCY" || viewDetailsItem?.priority === "URGENT"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {viewDetailsItem?.priority || "N/A"}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Assigned Doctor</span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {viewDetailsItem?.assignedDoctor || "N/A"}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Appointment Date</span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {viewDetailsItem?.appointmentDate ? new Date(viewDetailsItem.appointmentDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Appointment Time</span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {viewDetailsItem?.appointmentTime || "N/A"}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Reception Intake Time</span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {viewDetailsItem?.createdAt ? new Date(viewDetailsItem.createdAt).toLocaleString() : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-white p-3 rounded-xl border border-orange-100 space-y-1">
                    <span className="font-bold text-slate-500 block text-[10px]">Chief Complaint / Symptoms (Reception):</span>
                    <p className="italic font-medium text-slate-800">
                      {viewDetailsItem?.chiefComplaint || viewDetailsItem?.complaint || "N/A"}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-orange-100 space-y-1">
                    <span className="font-bold text-slate-500 block text-[10px]">Reception Notes:</span>
                    <p className="italic font-medium text-slate-800">
                      {viewDetailsItem?.notes || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Pet Profile & Owner Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pet Info */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-extrabold text-[#0C3D2E] tracking-wider flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-[#F7931E]" />
                    2. Pet Patient Profile
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Pet Name</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.petName || viewDetailsItem?.petName || viewDetailsItem?.pet?.name || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Unique Pet ID</span>
                      <span className="font-mono font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.uniquePetId || viewDetailsItem?.uniquePetId || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Species</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.species || viewDetailsItem?.species || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Breed</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.breed || viewDetailsItem?.breed || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Gender</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.gender || viewDetailsItem?.gender || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Age</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.age !== undefined && viewDetailsItem?.pet?.age !== null ? `${viewDetailsItem.pet.age} yrs` : (viewDetailsItem?.age !== undefined && viewDetailsItem?.age !== null ? `${viewDetailsItem.age} yrs` : "N/A")}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Date of Birth</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.dob ? new Date(viewDetailsItem.pet.dob).toLocaleDateString() : "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Color / Coat</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.color || viewDetailsItem?.color || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Sterilized</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.sterilized !== undefined ? (viewDetailsItem.pet.sterilized ? "Yes" : "No") : (viewDetailsItem?.pet?.isSterilised !== undefined ? (viewDetailsItem.pet.isSterilised ? "Yes" : "No") : "N/A")}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Microchip RFID</span>
                      <span className="font-mono font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.rfid || viewDetailsItem?.pet?.rfidTag || viewDetailsItem?.rfid || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">ID Area</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.identificationArea || viewDetailsItem?.identificationArea || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">ID Marks</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.identificationMarks || viewDetailsItem?.identificationMarks || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-extrabold text-[#0C3D2E] tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-[#F7931E]" />
                    3. Owner Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Owner Name</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.owner?.ownerName || viewDetailsItem?.ownerName || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Primary Mobile</span>
                      <span className="font-mono font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.owner?.mobileNumber || viewDetailsItem?.phoneNumber || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Alternate Mobile</span>
                      <span className="font-mono font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.owner?.alternateNumber || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Email Address</span>
                      <span className="font-bold text-slate-900 block mt-0.5 truncate">{viewDetailsItem?.owner?.email || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Owner ID Type</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.owner?.ownerIdType || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Owner ID Number</span>
                      <span className="font-mono font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.owner?.ownerIdNumber || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 block">Full Address</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {viewDetailsItem?.owner?.address || "N/A"}
                        {viewDetailsItem?.owner?.city ? `, ${viewDetailsItem.owner.city}` : ""}
                        {viewDetailsItem?.owner?.district ? `, ${viewDetailsItem.owner.district}` : ""}
                        {viewDetailsItem?.owner?.state ? `, ${viewDetailsItem.owner.state}` : ""}
                        {viewDetailsItem?.owner?.pincode ? ` - ${viewDetailsItem.owner.pincode}` : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Background Medical History */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-extrabold text-[#0C3D2E] tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#F7931E]" />
                  4. Background Medical History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block text-[10px] mb-0.5">Known Allergies</span>
                    <p className="font-semibold text-slate-800">{viewDetailsItem?.pet?.history?.allergies || (Array.isArray(viewDetailsItem?.pet?.allergies) && viewDetailsItem.pet.allergies.length > 0 ? viewDetailsItem.pet.allergies.join(", ") : viewDetailsItem?.pet?.allergies) || "N/A"}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block text-[10px] mb-0.5">Current Ongoing Medications</span>
                    <p className="font-semibold text-slate-800">{viewDetailsItem?.pet?.history?.currentMedications || "N/A"}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block text-[10px] mb-0.5">Clinical History Notes</span>
                    <p className="font-semibold text-slate-800">{viewDetailsItem?.pet?.history?.notes || "N/A"}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
              <button
                onClick={() => setViewDetailsItem(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer border-none"
              >
                Close Window
              </button>
              <button
                onClick={() => {
                  const item = viewDetailsItem;
                  setViewDetailsItem(null);
                  setSelectedPet(item);
                  setOpenModal(true);
                }}
                className="px-5 py-2.5 bg-[#F7931E] hover:bg-[#E08319] text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer border-none flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Take Vitals Assessment</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
