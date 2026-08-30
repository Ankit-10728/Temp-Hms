import { useState, useEffect } from "react";
import { Header } from "../..";
import PetRegistrationWizard from "../../../pages/pre-consultations/PetRegistrationWizard";
import { getPendingPets } from "../../../api/doctorModuleApi";
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
} from "lucide-react";
import toast from "react-hot-toast";

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

  const getSpeciesIcon = (species) => {
    const s = (species || "").toLowerCase();

    if (s.includes("cat")) {
      return <Cat className="w-5 h-5 text-orange-600" />;
    }

    if (s.includes("bird") || s.includes("parrot")) {
      return <Bird className="w-5 h-5 text-blue-600" />;
    }

    if (s.includes("rabbit")) {
      return <Rabbit className="w-5 h-5 text-purple-600" />;
    }

    return <PawPrint className="w-5 h-5 text-orange-600" />;
  };

  const filteredPets = pets.filter((petItem) => {
    const ownerName = petItem.owner?.ownerName || petItem.ownerName || "";
    const petName = petItem.pet?.petName || petItem.petName || "";
    const token = petItem.tokenNumber || petItem.token || "";
    const phone = petItem.owner?.mobileNumber || petItem.phoneNumber || "";
    const species = petItem.pet?.species || petItem.species || "";

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
        <Header
          title="Pending Pets Queue"
          subtitle="Manage pending triage assessments and record vitals"
          showSearch={false}
        />

        {/* Search & Species Filter Toolbar */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Token, Owner Name, Phone Number or Pet Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-sm"
              />
            </div>

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

        {/* Table / Mobile Cards */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#0C3D2E]/15 overflow-hidden">
          {/* Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-[#0C3D2E]/15 bg-[#D9E8E3]/25">
            <div>
              <h2 className="text-[18px] md:text-[20px] font-[900] text-[#0C3D2E]">Pending Assessments</h2>
              <p className="text-[12px] font-[600] text-[#0C3D2E]/70 mt-0.5">Select a pet to open and submit pre-consultation vitals</p>
            </div>

            <div className="bg-[#F7931E]/10 text-[#F7931E] px-4 py-1.5 rounded-full font-[700] text-xs border border-[#F7931E]/20 self-start sm:self-center">
              {filteredPets.length} Patients Waiting
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#D9E8E3]/20 border-b border-[#0C3D2E]/15 text-[11px] font-[700]  text-[#0C3D2E] tracking-wider">
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
                    const token = petItem.tokenNumber || `TK-${petItem._id?.slice(-4)}`;
                    const ownerName = petItem.owner?.ownerName || petItem.ownerName || "Unknown Owner";
                    const mobile = petItem.owner?.mobileNumber || petItem.phoneNumber || "N/A";
                    const petName = petItem.pet?.petName || petItem.petName || "Pet";
                    const species = petItem.pet?.species || petItem.species || "Dog";
                    const breed = petItem.pet?.breed || petItem.breed || "Standard";
                    const complaint = petItem.primaryReason || petItem.complaint || "General Pre-Checkup";

                    return (
                      <tr key={petItem._id} className="hover:bg-[#D9E8E3]/15 transition-all duration-150">
                        {/* Token */}
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">
                          <span className="bg-[#0C3D2E]/10 text-[#0C3D2E] px-3 py-1.5 rounded-xl text-xs font-mono font-bold">
                            {token}
                          </span>
                        </td>

                        {/* Owner */}
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

                        {/* Pet */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[12px] bg-[#FFF4E5] border border-[#F7931E]/20 flex items-center justify-center text-xl">
                              {getSpeciesIcon(species)}
                            </div>
                            <div>
                              <p className="font-bold text-[#0C3D2E]">{petName}</p>
                              <p className="text-xs text-slate-500">{species} • {breed}</p>
                            </div>
                          </div>
                        </td>

                        {/* Reason */}
                        <td className="px-6 py-4">
                          <p className="text-xs font-medium text-slate-700 max-w-xs truncate">{complaint}</p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 bg-[#FFF4E5] text-[#F7931E] px-3 py-1 rounded-full text-xs font-bold border border-[#F7931E]/20">
                            <span className="w-2 h-2 rounded-full bg-[#F7931E] animate-pulse"></span>
                            Pending Assessment
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setViewDetailsItem(petItem)}
                              className="bg-white hover:bg-slate-50 text-[#0C3D2E] border border-[#0C3D2E]/15 px-3 py-1.5 rounded-[12px] text-[12px] font-[700] transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                              title="View Reception Intake Data"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#F7931E]" />
                              View Details
                            </button>

                            <button
                              onClick={() => {
                                setSelectedPet(petItem);
                                setOpenModal(true);
                              }}
                              className="bg-[#F7931E] hover:bg-[#E08319] text-white px-4 py-1.5 rounded-[12px] text-[12px] font-[700] transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer border-none"
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              Record Vitals
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

          {/* Mobile Cards View */}
          <div className="lg:hidden p-4 space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading pending pets...</div>
            ) : filteredPets.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-medium">No pending pets found.</div>
            ) : (
              filteredPets.map((petItem) => {
                const token = petItem.tokenNumber || `TK-${petItem._id?.slice(-4)}`;
                const ownerName = petItem.owner?.ownerName || petItem.ownerName || "Unknown Owner";
                const mobile = petItem.owner?.mobileNumber || petItem.phoneNumber || "N/A";
                const petName = petItem.pet?.petName || petItem.petName || "Pet";
                const species = petItem.pet?.species || petItem.species || "Dog";

                return (
                  <div
                    key={petItem._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                        {token}
                      </span>
                      <span className="bg-orange-100 text-orange-700 px-3 py-0.5 rounded-full text-xs font-bold">
                        Pending Vitals
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">
                        {getSpeciesIcon(species)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{petName}</h4>
                        <p className="text-xs text-slate-500">Owner: {ownerName} ({mobile})</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setViewDetailsItem(petItem)}
                        className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPet(petItem);
                          setOpenModal(true);
                        }}
                        className="w-full bg-slate-900 hover:bg-orange-600 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        Record Vitals
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pre Consultation Assessment Edit / Create Form Modal */}
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

        {/* Reception Intake Data View Modal */}
        {viewDetailsItem && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-[9999] p-3 md:p-6">
            <div className="bg-white w-[900px] max-w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center text-xl font-bold">
                    <PawPrint className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <span>{viewDetailsItem?.pet?.petName || viewDetailsItem?.petName || "Pet Patient"}</span>
                      <span className="bg-orange-500/30 text-orange-300 text-xs font-mono font-bold px-2 py-0.5 rounded border border-orange-500/40">
                        {viewDetailsItem?.tokenNumber || `TK-${viewDetailsItem?._id?.slice(-4)}`}
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
                {/* Section 1: Pet Profile Details */}
                <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-extrabold text-orange-800  tracking-wider flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-orange-600" />
                    1. Pet Profile Information
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <span className="text-[10px] font-bold text-slate-400  block">Pet Name</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.petName || viewDetailsItem?.petName || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <span className="text-[10px] font-bold text-slate-400  block">Species / Breed</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.species || viewDetailsItem?.species || "Dog"} • {viewDetailsItem?.pet?.breed || viewDetailsItem?.breed || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <span className="text-[10px] font-bold text-slate-400  block">Gender & Age</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.gender || viewDetailsItem?.gender || "N/A"} • {viewDetailsItem?.pet?.age !== undefined ? `${viewDetailsItem.pet.age} yrs` : (viewDetailsItem?.age ? `${viewDetailsItem.age} yrs` : "N/A")}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <span className="text-[10px] font-bold text-slate-400  block">Date of Birth (DOB)</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.dob ? new Date(viewDetailsItem.pet.dob).toLocaleDateString() : "N/A"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <span className="text-[10px] font-bold text-slate-400  block">Color / Coat</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.color || viewDetailsItem?.color || "N/A"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <span className="text-[10px] font-bold text-slate-400  block">Sterilized Status</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.sterilized || viewDetailsItem?.pet?.isSterilised ? "Yes" : "No"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <span className="text-[10px] font-bold text-slate-400  block">Microchip RFID Tag</span>
                      <span className="font-mono font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.rfid || viewDetailsItem?.pet?.rfidTag || viewDetailsItem?.rfid || "Not Provided"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <span className="text-[10px] font-bold text-slate-400  block">Identification Area</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{viewDetailsItem?.pet?.identificationArea || viewDetailsItem?.identificationArea || "Not Provided"}</span>
                    </div>
                  </div>
                  {viewDetailsItem?.pet?.identificationMarks && (
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100 text-xs">
                      <span className="text-[10px] font-bold text-slate-400  block">Identification Marks</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{viewDetailsItem.pet.identificationMarks}</span>
                    </div>
                  )}
                </div>

                {/* Section 2: Owner & Reception Visit Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <h3 className="text-xs font-extrabold text-slate-800  tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-500" />
                      2. Owner & Contact Information
                    </h3>
                    <div className="space-y-1 text-xs">
                      <p><span className="font-bold text-slate-500">Owner Name:</span> <span className="font-extrabold text-slate-800">{viewDetailsItem?.owner?.ownerName || viewDetailsItem?.ownerName || "Unknown Owner"}</span></p>
                      <p><span className="font-bold text-slate-500">Primary Mobile:</span> <span className="font-mono font-bold text-slate-800">{viewDetailsItem?.owner?.mobileNumber || viewDetailsItem?.phoneNumber || "N/A"}</span></p>
                      {viewDetailsItem?.owner?.alternateNumber && <p><span className="font-bold text-slate-500">Alternate Mobile:</span> <span className="font-mono text-slate-700">{viewDetailsItem.owner.alternateNumber}</span></p>}
                      {viewDetailsItem?.owner?.email && <p><span className="font-bold text-slate-500">Email:</span> <span className="text-slate-700">{viewDetailsItem.owner.email}</span></p>}
                      {viewDetailsItem?.owner?.address && <p><span className="font-bold text-slate-500">Address:</span> <span className="text-slate-700">{viewDetailsItem.owner.address}, {viewDetailsItem.owner.city || ""} {viewDetailsItem.owner.state || ""}</span></p>}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <h3 className="text-xs font-extrabold text-slate-800  tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      3. Reception Reason & Complaint
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      <p className="font-bold text-slate-800 text-sm">
                        Reason: <span className="text-orange-600">{viewDetailsItem?.primaryReason || viewDetailsItem?.visitType || "General Checkup"}</span>
                      </p>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700">
                        <span className="font-bold text-slate-500 block text-[10px]  mb-0.5">Chief Complaint / Notes:</span>
                        <p className="italic font-medium">{viewDetailsItem?.chiefComplaint || viewDetailsItem?.complaint || "Routine Pre-Checkup Examination"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Pet Medical History & Past Records */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-800  tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Stethoscope className="w-4 h-4 text-orange-500" />
                    4. Medical History & Registration Background
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Vaccinations */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-orange-500" />
                        <span className="font-extrabold text-slate-800 text-xs text-orange-600">
                          Vaccinations
                        </span>
                      </div>
                      {viewDetailsItem?.pet?.history?.vaccinations?.length > 0 ? (
                        <div className="space-y-2 divide-y divide-slate-100">
                          {viewDetailsItem.pet.history.vaccinations.map((v, i) => (
                            <div key={i} className="pt-1.5 first:pt-0 space-y-0.5">
                              <p className="font-bold text-slate-800">{v.vaccineName || v.name || "Vaccine"}</p>
                              <p className="text-slate-500 text-[11px]">
                                Date: {v.vaccinationDate || v.date ? new Date(v.vaccinationDate || v.date).toLocaleDateString() : "N/A"}
                                {v.batchNumber && ` • Batch: ${v.batchNumber}`}
                              </p>
                              {v.clinicName && <p className="text-slate-400 text-[10px]">Clinic: {v.clinicName}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No past vaccination records.</p>
                      )}
                    </div>

                    {/* Dewormings */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldPlus className="w-4 h-4 text-orange-500" />
                        <span className="font-extrabold text-slate-800 text-xs text-orange-600 ">
                          Dewormings
                        </span>
                      </div>
                      {viewDetailsItem?.pet?.history?.dewormings?.length > 0 ? (
                        <div className="space-y-2 divide-y divide-slate-100">
                          {viewDetailsItem.pet.history.dewormings.map((d, i) => (
                            <div key={i} className="pt-1.5 first:pt-0 space-y-0.5">
                              <p className="font-bold text-slate-800">{d.dewormingProduct || d.product || "Deworming Product"}</p>
                              <p className="text-slate-500 text-[11px]">
                                Date: {d.dewormingDate || d.date ? new Date(d.dewormingDate || d.date).toLocaleDateString() : "N/A"}
                                {d.dose && ` • Dose: ${d.dose}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No past deworming records.</p>
                      )}
                    </div>

                    {/* Surgeries */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-orange-500" />
                        <span className="font-extrabold text-slate-800 text-xs text-orange-600 ">
                          Surgeries
                        </span>
                      </div>
                      {viewDetailsItem?.pet?.history?.surgeries?.length > 0 ? (
                        <div className="space-y-2 divide-y divide-slate-100">
                          {viewDetailsItem.pet.history.surgeries.map((s, i) => (
                            <div key={i} className="pt-1.5 first:pt-0 space-y-0.5">
                              <p className="font-bold text-slate-800">{s.surgicalProcedure || s.procedure || "Surgery"}</p>
                              <p className="text-slate-500 text-[11px]">
                                Date: {s.surgeryDate || s.date ? new Date(s.surgeryDate || s.date).toLocaleDateString() : "N/A"}
                                {s.hospital && ` • Hospital: ${s.hospital}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No past surgical records.</p>
                      )}
                    </div>

                    {/* Treatments & Conditions */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-orange-500" />
                        <span className="font-extrabold text-slate-800 text-xs text-orange-600">
                          Past Treatments & Conditions
                        </span>
                      </div>
                      {viewDetailsItem?.pet?.history?.treatments?.length > 0 ? (
                        <div className="space-y-2 divide-y divide-slate-100">
                          {viewDetailsItem.pet.history.treatments.map((t, i) => (
                            <div key={i} className="pt-1.5 first:pt-0 space-y-0.5">
                              <p className="font-bold text-slate-800">{t.condition || t.treatment || t.details || "Treatment"}</p>
                              <p className="text-slate-500 text-[11px]">
                                Date: {t.treatmentDate || t.date ? new Date(t.treatmentDate || t.date).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No past treatment records.</p>
                      )}
                    </div>
                  </div>

                  {/* Allergies, Current Medications & Clinical Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500  block text-[10px] mb-0.5">Known Allergies</span>
                      <p className="font-semibold text-slate-800">{viewDetailsItem?.pet?.history?.allergies || (Array.isArray(viewDetailsItem?.pet?.allergies) ? viewDetailsItem.pet.allergies.join(", ") : viewDetailsItem?.pet?.allergies) || "None Reported"}</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500  block text-[10px] mb-0.5">Current Ongoing Medications</span>
                      <p className="font-semibold text-slate-800">{viewDetailsItem?.pet?.history?.currentMedications || "None Reported"}</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500  block text-[10px] mb-0.5">General Clinical Notes</span>
                      <p className="font-semibold text-slate-800">{viewDetailsItem?.pet?.history?.notes || "No additional notes"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
                <button
                  onClick={() => setViewDetailsItem(null)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer border-none"
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
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer border-none flex items-center gap-2"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Proceed to Record Vitals</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}