import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AlertCircle, Stethoscope, Clock, CheckCircle2, ShieldAlert, Plus, Trash2, Check, Eye, Pencil } from "lucide-react";
import LabReportModal from "./LabReportModal";
import PreConsultationReportModal from "./PreConsultReportModal";
import CaseCompletionModal from "./CaseCompletionModal";
import {
  getPendingPets,
  updatePatient,
  getPreConsultationByVisit,
  getLabReportByVisit,
  deletePatient,
} from "../../../api/doctorModuleApi";

export default function PendingPets() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("ALL");
  const [selectedPet, setSelectedPet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedCaseData, setCompletedCaseData] = useState(null);

  const handleDelete = async (pet) => {
    if (!window.confirm("Delete this visit and all linked consultation records? This cannot be undone.")) return;
    try {
      await deletePatient(pet._id);
      toast.success("Visit record deleted");
      await fetchPendingPets();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete visit record");
    }
  };

  const steps = [
    "History",
    "Observation",
    "Diagnosis",
    "Lab",
    "Treatment",
    "Plans",
  ];

  const initialFormData = {

    history: {
      dietType: "",
      dietFrequency: "",
      waterIntake: "",
      behaviour: "",
      exercise: "",
      currentMedication: "",
      vaccinationStatus: "",
      allergies: "",
    },

    clinicalObservation: {
      cardiovascular: "",
      respiratory: "",
      digestive: "",
      musculoskeletal: "",
      neurological: "",
      urogenital: "",
      skin: "",
      eyes: "",
      ears: "",
      nose: "",
      throat: "",
      lymphNodes: "",
      doctorNotes: "",
    },

    diagnosis: {
      provisionalDiagnosis: "",
      differentialDiagnosis: "",
      confirmedDiagnosis: "",
      raiseLab: false,
    },

    labRequisition: {
      tests: [],
      sampleType: [],
      instructions: "",
      labOrderId: "",
    },

    treatment: {
      medicines: "",
      procedures: "",
      vaccinations: "",
      deworming: "",
      fluids: "",
      followUp: "",
      treatmentNotes: "",
    },

    suggestion: {
      dietAdvice: "",
      activityRestriction: "",
      homeCare: "",
      preventiveCare: "",
      prognosis: "",
      followUpDate: "",
      finalNotes: "",
    },


  }
  const [formData, setFormData] = useState(initialFormData);
  const [showLabReportModal, setShowLabReportModal] = useState(false);
  const [showPreConsultationModal, setShowPreConsultationModal] = useState(false);

  const [selectedLabReport, setSelectedLabReport] = useState(null);
  const [selectedPreConsultation, setSelectedPreConsultation] = useState(null);

  const [pendingPets, setPendingPets] = useState([]);
  const [loading, setLoading] = useState(true);


  const handleViewLabReports = async (visitId) => {
    try {

      setLoading(true);

      const response = await getLabReportByVisit(visitId);

      console.log(response);

      setSelectedLabReport(response.data);

      setShowLabReportModal(true);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };


  const handleViewPreConsultation = async (visitId) => {

    try {

      setLoading(true);

      const response = await getPreConsultationByVisit(visitId);

      console.log(response);

      setSelectedPreConsultation(response.data);

      setShowPreConsultationModal(true);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };

  const handleChange = (section, field, value) => {

    setFormData((prev) => ({

      ...prev,

      [section]: {

        ...prev[section],

        [field]: value

      }

    }));

  };

  const refreshPendingPets = () => {
    setRefreshKey((prev) => prev + 1);
  };


  useEffect(() => {
    fetchPendingPets();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      setFormData({
        history: {
          dietType: selectedPet.history?.dietType || "",
          dietFrequency: selectedPet.history?.dietFrequency || "",
          waterIntake: selectedPet.history?.waterIntake || "",
          behaviour: selectedPet.history?.behaviour || "",
          exercise: selectedPet.history?.exercise || "",
          currentMedication: selectedPet.history?.currentMedication || "",
          vaccinationStatus: selectedPet.history?.vaccinationStatus || "",
          allergies: selectedPet.history?.allergies || "",
          medicationsConfirmed: Array.isArray(selectedPet.history?.medicationsConfirmed) ? selectedPet.history.medicationsConfirmed : [],
        },

        clinicalObservation: {
          cardiovascular: selectedPet.clinicalObservation?.cardiovascular || "",
          respiratory: selectedPet.clinicalObservation?.respiratory || "",
          digestive: selectedPet.clinicalObservation?.digestive || "",
          musculoskeletal: selectedPet.clinicalObservation?.musculoskeletal || "",
          neurological: selectedPet.clinicalObservation?.neurological || "",
          urogenital: selectedPet.clinicalObservation?.urogenital || "",
          skin: selectedPet.clinicalObservation?.skin || "",
          eyes: selectedPet.clinicalObservation?.eyes || "",
          ears: selectedPet.clinicalObservation?.ears || "",
          nose: selectedPet.clinicalObservation?.nose || "",
          throat: selectedPet.clinicalObservation?.throat || "",
          lymphNodes: selectedPet.clinicalObservation?.lymphNodes || "",
          doctorNotes: selectedPet.clinicalObservation?.doctorNotes || "",
        },

        diagnosis: {
          provisionalDiagnosis: selectedPet.diagnosis?.provisionalDiagnosis || "",
          differentialDiagnosis: selectedPet.diagnosis?.differentialDiagnosis || "",
          confirmedDiagnosis: selectedPet.diagnosis?.confirmedDiagnosis || "",
          raiseLab: selectedPet.diagnosis?.raiseLab || false,
        },

        labRequisition: {
          tests: Array.isArray(selectedPet.labRequisition?.tests) ? selectedPet.labRequisition.tests : [],
          sampleType: Array.isArray(selectedPet.labRequisition?.sampleType) ? selectedPet.labRequisition.sampleType : [],
          instructions: selectedPet.labRequisition?.instructions || "",
          labOrderId: selectedPet.labRequisition?.labOrderId || "",
        },

        treatment: {
          medicationsList: Array.isArray(selectedPet.treatment?.medicationsList) ? selectedPet.treatment.medicationsList : [],
          medicines: selectedPet.treatment?.medicines || "",
          proceduresList: Array.isArray(selectedPet.treatment?.proceduresList) ? selectedPet.treatment.proceduresList : [],
          procedures: selectedPet.treatment?.procedures || "",
          vaccinationsList: Array.isArray(selectedPet.treatment?.vaccinationsList) ? selectedPet.treatment.vaccinationsList : [],
          vaccinations: selectedPet.treatment?.vaccinations || "",
          dewormingList: Array.isArray(selectedPet.treatment?.dewormingList) ? selectedPet.treatment.dewormingList : [],
          deworming: selectedPet.treatment?.deworming || "",
          fluidsList: Array.isArray(selectedPet.treatment?.fluidsList) ? selectedPet.treatment.fluidsList : [],
          fluids: selectedPet.treatment?.fluids || "",
          followUp: selectedPet.treatment?.followUp || "",
          treatmentNotes: selectedPet.treatment?.treatmentNotes || "",
        },

        suggestion: {
          dietAdvice: selectedPet.suggestion?.dietAdvice || "",
          activityRestriction: selectedPet.suggestion?.activityRestriction || "",
          homeCare: selectedPet.suggestion?.homeCare || "",
          preventiveCare: selectedPet.suggestion?.preventiveCare || "",
          prognosis: selectedPet.suggestion?.prognosis || "",
          followUpDate: selectedPet.suggestion?.followUpDate || "",
          finalNotes: selectedPet.suggestion?.finalNotes || "",
        },
      });
    } else {
      setFormData(initialFormData);
    }
  }, [selectedPet]);

  const fetchPendingPets = async () => {
    try {
      const res = await getPendingPets();
      console.log(res);
      console.log("Fetching pending pets...");
      setPendingPets(res.data);
      console.log(pendingPets);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (currentStep) => {
    setValidationError("");

    if (currentStep === 3) {
      if (!formData.diagnosis.provisionalDiagnosis?.trim() && !formData.diagnosis.confirmedDiagnosis?.trim()) {
        const msg = "Please provide a Provisional or Confirmed Diagnosis before proceeding.";
        setValidationError(msg);
        toast.error(msg);
        return false;
      }
    }

    if (currentStep === 4 && formData.diagnosis.raiseLab) {
      if ((!formData.labRequisition.tests || formData.labRequisition.tests.length === 0) && !formData.labRequisition.instructions?.trim()) {
        const msg = "Please select at least one Lab Test or enter test instructions.";
        setValidationError(msg);
        toast.error(msg);
        return false;
      }
    }

    if (currentStep === 5) {
      if (!formData.treatment.medicines?.trim() && !formData.treatment.procedures?.trim() && !formData.treatment.treatmentNotes?.trim()) {
        const msg = "Please enter prescribed medicines, procedures, or treatment notes.";
        setValidationError(msg);
        toast.error(msg);
        return false;
      }
    }

    return true;
  };

  const sendToLab = async () => {
    if (!selectedPet?._id) return;
    if (!validateStep(4)) return;

    try {
      setShowModal(false);
      const response = await updatePatient(selectedPet._id, {
        ...formData,
        status: "LAB_TEST_RAISED",
      });

      if (response.success || response.data) {
        toast.success("Requisition sent to Lab successfully!");
        await fetchPendingPets();
        setSelectedPet(null);
        setStep(1);
        setFormData(initialFormData);
        setValidationError("");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send to Lab");
    }
  };

  const completeCase = async () => {
    if (!selectedPet?._id) return;
    if (!validateStep(5)) return;

    try {
      const caseToSave = { ...selectedPet, ...formData };
      setShowModal(false);
      const response = await updatePatient(selectedPet._id, {
        ...formData,
        status: "COMPLETED",
      });

      if (response.success || response.data) {
        toast.success("Doctor consultation completed successfully!");
        setCompletedCaseData(caseToSave);
        setShowCompletionModal(true);
        await fetchPendingPets();
        setSelectedPet(null);
        setStep(1);
        setFormData(initialFormData);
        setValidationError("");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong while completing case");
    }
  };

  if (loading) {

    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  }

  const getSpeciesIcon = (species) => {
    const s = (species || "").toLowerCase();
    if (s.includes("cat")) return "🐱";
    if (s.includes("bird") || s.includes("parrot")) return "🦜";
    if (s.includes("rabbit")) return "🐇";
    return "🐶";
  };

  const filteredPets = pendingPets.filter((visit) => {
    const query = search.toLowerCase().trim();
    const token = (visit.tokenNumber?.toString() || "").toLowerCase();
    const ownerName = (visit.owner?.ownerName || visit.ownerName || "").toLowerCase();
    const phone = (visit.owner?.mobileNumber || visit.phoneNumber || "").toLowerCase();
    const petName = (visit.pet?.petName || visit.petName || "").toLowerCase();
    const species = (visit.pet?.species || visit.species || "").toLowerCase();

    const matchesSearch =
      !query ||
      token.includes(query) ||
      ownerName.includes(query) ||
      phone.includes(query) ||
      petName.includes(query);

    const matchesSpecies =
      speciesFilter === "ALL" ||
      species.toUpperCase() === speciesFilter.toUpperCase();

    return matchesSearch && matchesSpecies;
  });

  return (
    <div className="space-y-6">
      {/* Search & Species Toolbar */}
      <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by Token, Owner Name, Pet Name, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-4 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:border-orange-500 focus:bg-white cursor-pointer w-full md:w-44"
            >
              <option value="ALL">All Species 🐾</option>
              <option value="DOG">Dog 🐶</option>
              <option value="CAT">Cat 🐱</option>
              <option value="BIRD">Bird 🦜</option>
              <option value="RABBIT">Rabbit 🐇</option>
            </select>

            <span className="px-4 py-3 bg-orange-50 text-orange-700 border border-orange-200/80 rounded-2xl text-xs font-bold whitespace-nowrap">
              {filteredPets.length} Waiting
            </span>
          </div>
        </div>
      </div>

      {/* Main Queue Container */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {/* Table Header Banner */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-50/50 to-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Live Pending Cases Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients with pre-consultation vitals recorded ready for medical examination
            </p>
          </div>
          <span className="bg-orange-500 text-white font-bold px-4 py-1.5 rounded-2xl text-xs shadow-xs self-start sm:self-center">
            {filteredPets.length} Active Patients
          </span>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-4 space-y-4">
          {filteredPets.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="text-4xl mb-2">🩺</div>
              <p className="text-xs font-bold text-slate-700">No Pending Patients</p>
            </div>
          ) : (
            filteredPets.map((pet) => {
              const petName = pet.pet?.petName || pet.petName || "Patient";
              const species = pet.pet?.species || pet.species || "Dog";
              const ownerName = pet.owner?.ownerName || pet.ownerName || "Owner";
              const phone = pet.owner?.mobileNumber || pet.phoneNumber || "N/A";
              const token = pet.tokenNumber || `TK-${pet._id?.slice(-4) || "00"}`;

              return (
                <div key={pet._id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-xl shrink-0">
                        {getSpeciesIcon(species)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{petName}</h3>
                        <span className="bg-slate-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                          {token}
                        </span>
                      </div>
                    </div>

                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                      {pet.status || "Vitals Ready"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                    <p><span className="font-semibold text-slate-500">Owner:</span> {ownerName}</p>
                    <p><span className="font-semibold text-slate-500">Phone:</span> <span className="font-mono">{phone}</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleViewPreConsultation(pet._id)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      title="View vitals"
                    >
                      <Eye className="size-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPet(pet);
                        setFormData({
                          history: { ...initialFormData.history, ...(pet.history || {}) },
                          clinicalObservation: { ...initialFormData.clinicalObservation, ...(pet.clinicalObservation || {}) },
                          diagnosis: { ...initialFormData.diagnosis, ...(pet.diagnosis || {}) },
                          labRequisition: { ...initialFormData.labRequisition, ...(pet.labRequisition || {}) },
                          treatment: { ...initialFormData.treatment, ...(pet.treatment || {}) },
                          suggestion: { ...initialFormData.suggestion, ...(pet.suggestion || {}) },
                        });
                        setShowModal(true);
                      }}
                      className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                      title="Edit consultation"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Token</th>
                <th className="py-4 px-6">Patient Name</th>
                <th className="py-4 px-6">Owner Name</th>
                <th className="py-4 px-6">Mobile</th>
                <th className="py-4 px-6">Triage Status</th>
                <th className="py-4 px-6">Pre-Consult</th>
                <th className="py-4 px-6">Lab Report</th>
                <th className="py-4 px-6 text-center">Clinical Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    <div className="text-4xl mb-2">🩺</div>
                    <p className="font-bold text-slate-700">No Pending Patients in Queue</p>
                    <p className="text-xs text-slate-500 mt-1">All pre-consulted cases have been examined!</p>
                  </td>
                </tr>
              ) : (
                filteredPets.map((pet) => {
                  const petName = pet.pet?.petName || pet.petName || "Patient";
                  const species = pet.pet?.species || pet.species || "Dog";
                  const ownerName = pet.owner?.ownerName || pet.ownerName || "Owner";
                  const phone = pet.owner?.mobileNumber || pet.phoneNumber || "N/A";
                  const token = pet.tokenNumber || `TK-${pet._id?.slice(-4) || "00"}`;

                  return (
                    <tr key={pet._id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs">
                          {token}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-xl shrink-0">
                            {getSpeciesIcon(species)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{petName}</span>
                            <p className="text-xs text-slate-400 font-normal">{species}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-800">{ownerName}</td>

                      <td className="py-4 px-6 font-mono text-slate-600 text-xs">{phone}</td>

                      <td className="py-4 px-6">
                        {pet.hasLabReport || pet.workflow?.labCompleted ? (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                            <span>📄</span> Lab Report Uploaded
                          </span>
                        ) : pet.isSentToLab || pet.status === "LAB_TEST_RAISED" ? (
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                            <span>🔬</span> Sent to Lab (Awaiting)
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                            {pet.status || "Vitals Ready"}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleViewPreConsultation(pet._id)}
                          className="grid size-9 place-items-center rounded-xl border border-[#0C3D2E]/15 bg-white text-[#0C3D2E] transition hover:bg-[#D9E8E3]/40"
                          title="View vitals"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>

                      <td className="py-4 px-6">
                        {pet.hasLabReport || pet.workflow?.labCompleted || pet.labReport ? (
                          <button
                            onClick={() => handleViewLabReports(pet._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold shadow-xs cursor-pointer"
                          >
                            🧪 <span>View Lab Report</span>
                          </button>
                        ) : pet.isSentToLab || pet.status === "LAB_TEST_RAISED" ? (
                          <span className="text-amber-700 font-semibold text-xs flex items-center gap-1">
                            ⏳ In Lab Processing
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No Lab Order</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2"><button
                          onClick={() => {
                            setSelectedPet(pet);
                            setFormData({
                              history: { ...initialFormData.history, ...(pet.history || {}) },
                              clinicalObservation: { ...initialFormData.clinicalObservation, ...(pet.clinicalObservation || {}) },
                              diagnosis: { ...initialFormData.diagnosis, ...(pet.diagnosis || {}) },
                              labRequisition: { ...initialFormData.labRequisition, ...(pet.labRequisition || {}) },
                              treatment: { ...initialFormData.treatment, ...(pet.treatment || {}) },
                              suggestion: { ...initialFormData.suggestion, ...(pet.suggestion || {}) },
                            });
                            setShowModal(true);
                          }}
                          className="rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-orange-500/20 inline-flex items-center gap-1.5"
                          title="Edit consultation"
                        >
                          <Pencil className="size-4" />
                        </button><button onClick={() => handleDelete(pet)} className="grid size-9 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100" title="Delete visit"><Trash2 className="size-4" /></button></div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-xs p-0 md:p-6 overflow-hidden flex items-center justify-center">
          <div className="bg-white rounded-none md:rounded-3xl w-full h-screen md:h-[94vh] md:max-w-6xl mx-auto shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

            {/* Dark Header with Patient Vitals Context */}
            <div className="bg-slate-900 text-white p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                  {getSpeciesIcon(selectedPet?.pet?.species || selectedPet?.species)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                      {selectedPet?.pet?.petName || selectedPet?.petName || "Patient"}
                    </h1>
                    <span className="bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md">
                      {selectedPet?.tokenNumber || `TK-${selectedPet?._id?.slice(-4) || "00"}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Owner: <span className="text-white font-semibold">{selectedPet?.owner?.ownerName || selectedPet?.ownerName || "Owner"}</span> • Mobile: <span className="text-white font-semibold">{selectedPet?.owner?.mobileNumber || selectedPet?.phoneNumber || "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* Vitals Quick Preview & Close */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700/80 text-xs">
                  <span className="text-slate-400">Vitals:</span>
                  <span className="text-emerald-400 font-bold">{selectedPet?.preConsultationId?.bodyTemperature || "101.5 °F"}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-blue-400 font-bold">{selectedPet?.preConsultationId?.bodyWeight || "14 kg"}</span>
                </div>

                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPet(null);
                    setStep(1);
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all border border-white/20"
                >
                  Close Case
                </button>
              </div>
            </div>

            {/* Interactive Progress Bar & Stepper */}
            <div className="bg-slate-50 border-b border-slate-200/80 p-4 shrink-0">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Step {step} of 6: <span className="text-orange-600">{steps[step - 1]}</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {Math.round((step / 6) * 100)}% Completed
                </span>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-orange-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${(step / 6) * 100}%` }}
                ></div>
              </div>

              {/* Stepper Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {steps.map((item, index) => {
                  const stepNum = index + 1;
                  const isDone = step > stepNum;
                  const isCurrent = step === stepNum;
                  const isLabDisabled = stepNum === 4 && !formData.diagnosis.raiseLab;

                  return (
                    <button
                      key={index}
                      disabled={isLabDisabled || (!isDone && !isCurrent)}
                      onClick={() => {
                        if (isLabDisabled) {
                          toast.error("Lab requisition is not enabled for this case (Raise Lab is unchecked).");
                          return;
                        }
                        toast.info("Use Next/Previous buttons to navigate through steps.");
                      }}
                      className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-left transition-all ${
                        isLabDisabled || (!isDone && !isCurrent)
                          ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-80"
                          : isCurrent
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : isDone
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isLabDisabled
                            ? "bg-red-100 text-red-600 border border-red-300"
                            : isCurrent
                            ? "bg-orange-500 text-white"
                            : isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isLabDisabled ? "❌" : isDone ? "✓" : stepNum}
                      </div>
                      <span className={`text-xs font-bold truncate hidden sm:inline ${isLabDisabled ? "line-through text-red-500" : ""}`}>
                        {item}
                      </span>
                      {isLabDisabled && (
                        <span className="text-[10px] text-red-600 font-extrabold hidden md:inline-block ml-auto bg-red-100 px-1 py-0.5 rounded">
                          Skipped
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {validationError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-3 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 sm:text-3xl">
                      <span>🩺 History - Doctor Reviews</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Review & confirm dietary, behavioral, exercise, and medication history for patient
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                    {/* 1. Diet Type (dropdown) */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-2 text-sm">
                        🍖 Diet Type
                      </label>
                      <select
                        value={formData.history.dietType || ""}
                        onChange={(e) => handleChange("history", "dietType", e.target.value)}
                        className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-medium"
                      >
                        <option value="">Select Diet Type</option>
                        <option value="Commercial Dry">Commercial Dry</option>
                        <option value="Commercial Wet">Commercial Wet</option>
                        <option value="Home Cooked">Home Cooked</option>
                        <option value="Raw">Raw</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>

                    {/* 2. Diet Frequency (meals per day) (numbers) */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-2 text-sm">
                        🍽️ Diet Frequency (meals per day)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="1"
                        value={formData.history.dietFrequency || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            handleChange("history", "dietFrequency", "");
                          } else {
                            const num = parseInt(val, 10);
                            if (!isNaN(num) && num >= 1 && num <= 10 && Number.isInteger(num)) {
                              handleChange("history", "dietFrequency", val);
                            }
                          }
                        }}
                        placeholder="Enter meals per day (1-10)"
                        className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-medium"
                      />
                      <p className="text-xs text-slate-500 mt-1">Must be a whole number between 1 and 10</p>
                    </div>

                    {/* 3. Water Intake (dropdown) */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-2 text-sm">
                        💧 Water Intake
                      </label>
                      <select
                        value={formData.history.waterIntake || ""}
                        onChange={(e) => handleChange("history", "waterIntake", e.target.value)}
                        className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-medium"
                      >
                        <option value="">Select Water Intake</option>
                        <option value="Normal">Normal</option>
                        <option value="Reduced">Reduced</option>
                        <option value="Increased">Increased</option>
                      </select>
                    </div>

                    {/* 4. Behavioral Habits (dropdown + multi select) */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-2 text-sm">
                        🐾 Behavioral Habits (multi-select)
                      </label>
                      <div className="flex flex-wrap gap-2 p-2.5 border border-slate-300 rounded-2xl bg-white min-h-[48px] items-center">
                        {["Indoor", "Outdoor", "Free Roaming", "Chained", "Socialized"].map((habit) => {
                          const selectedHabits = Array.isArray(formData.history.behaviour)
                            ? formData.history.behaviour
                            : (formData.history.behaviour || "").split(",").map(s => s.trim()).filter(Boolean);
                          const isSelected = selectedHabits.includes(habit);

                          return (
                            <button
                              key={habit}
                              type="button"
                              onClick={() => {
                                let updated = isSelected
                                  ? selectedHabits.filter(h => h !== habit)
                                  : [...selectedHabits, habit];
                                handleChange("history", "behaviour", updated.join(", "));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? "bg-orange-500 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              <span>{habit}</span>
                              {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 5. Exercise Level (dropdown) */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-2 text-sm">
                        🏃 Exercise Level
                      </label>
                      <select
                        value={formData.history.exercise || ""}
                        onChange={(e) => handleChange("history", "exercise", e.target.value)}
                        className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-medium"
                      >
                        <option value="">Select Exercise Level</option>
                        <option value="Low">Low</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    {/* 7. Vaccinations Status verified */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-semibold text-slate-700 text-sm">
                          💉 Vaccination Status Verified
                        </label>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Auto filled from pet profile
                        </span>
                      </div>
                      <input
                        type="text"
                        value={
                          formData.history.vaccinationStatus ||
                          selectedPet?.pet?.history?.vaccineName ||
                          selectedPet?.preConsultationId?.history?.vaccineName ||
                          "Verified & Up to Date"
                        }
                        onChange={(e) => handleChange("history", "vaccinationStatus", e.target.value)}
                        placeholder="Vaccination Status"
                        className="w-full h-12 rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-medium outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    {/* 8. Known Allergies Verified */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-semibold text-slate-700 text-sm">
                          ⚠️ Known Allergies Verified
                        </label>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Auto filled from pet profile
                        </span>
                      </div>
                      <input
                        type="text"
                        value={
                          formData.history.allergies ||
                          selectedPet?.pet?.history?.allergies ||
                          selectedPet?.preConsultationId?.allergies ||
                          "No Known Allergies Reported"
                        }
                        onChange={(e) => handleChange("history", "allergies", e.target.value)}
                        placeholder="Known Allergies Verified"
                        className="w-full h-12 rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-medium outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    {/* 6. Current Medications Confirmed (multi rows: Drug, Dose, Frequency, Since) */}
                    <div className="md:col-span-2 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <span>💊 Current Medications Confirmed (multi rows)</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = Array.isArray(formData.history.medicationsConfirmed) && formData.history.medicationsConfirmed.length > 0
                              ? formData.history.medicationsConfirmed
                              : [{ drug: "", dose: "", frequency: "", since: "" }];
                            const updated = [...currentList, { drug: "", dose: "", frequency: "", since: "" }];
                            handleChange("history", "medicationsConfirmed", updated);
                          }}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Medication Row</span>
                        </button>
                      </div>

                      {(() => {
                        const medList = (Array.isArray(formData.history.medicationsConfirmed) && formData.history.medicationsConfirmed.length > 0)
                          ? formData.history.medicationsConfirmed
                          : [{
                              drug: (typeof formData.history.currentMedication === "string" ? formData.history.currentMedication : "") || selectedPet?.pet?.history?.medications || "",
                              dose: "",
                              frequency: "",
                              since: ""
                            }];

                        return medList.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-white rounded-xl border border-slate-200">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                1. Drug
                              </label>
                              <input
                                type="text"
                                value={row.drug || ""}
                                onChange={(e) => {
                                  const updated = [...medList];
                                  updated[rIdx] = { ...updated[rIdx], drug: e.target.value };
                                  handleChange("history", "medicationsConfirmed", updated);
                                }}
                                placeholder="Drug name"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                2. Dose
                              </label>
                              <input
                                type="text"
                                value={row.dose || ""}
                                onChange={(e) => {
                                  const updated = [...medList];
                                  updated[rIdx] = { ...updated[rIdx], dose: e.target.value };
                                  handleChange("history", "medicationsConfirmed", updated);
                                }}
                                placeholder="e.g. 5mg / 1 Tab"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                3. Frequency
                              </label>
                              <input
                                type="text"
                                value={row.frequency || ""}
                                onChange={(e) => {
                                  const updated = [...medList];
                                  updated[rIdx] = { ...updated[rIdx], frequency: e.target.value };
                                  handleChange("history", "medicationsConfirmed", updated);
                                }}
                                placeholder="e.g. Once Daily / BD"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500"
                              />
                            </div>

                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                  4. Since
                                </label>
                                <input
                                  type="text"
                                  value={row.since || ""}
                                  onChange={(e) => {
                                    const updated = [...medList];
                                    updated[rIdx] = { ...updated[rIdx], since: e.target.value };
                                    handleChange("history", "medicationsConfirmed", updated);
                                  }}
                                  placeholder="e.g. 2 Weeks / 1 Month"
                                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500"
                                />
                              </div>

                              {medList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = medList.filter((_, i) => i !== rIdx);
                                    handleChange("history", "medicationsConfirmed", updated);
                                  }}
                                  className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer"
                                  title="Remove medication"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>

                  <h2 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">
                    🔬 Clinical Observation
                  </h2>

                  <div className="grid gap-5 md:grid-cols-2 md:gap-6">

                    <div>
                      <label className="block font-semibold mb-2">
                        ❤️ Cardiovascular System
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.cardiovascular || ""}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "cardiovascular",
                            e.target.value
                          )
                        }
                        placeholder="Enter cardiovascular observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        🫁 Respiratory System
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.respiratory}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "respiratory",
                            e.target.value
                          )
                        }
                        placeholder="Enter respiratory observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        🍖 Digestive System
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.digestive}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "digestive",
                            e.target.value
                          )
                        }
                        placeholder="Enter digestive observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        🦴 Musculoskeletal System
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.musculoskeletal}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "musculoskeletal",
                            e.target.value
                          )
                        }
                        placeholder="Enter musculoskeletal observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        🧠 Neurological System
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.neurological}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "neurological",
                            e.target.value
                          )
                        }
                        placeholder="Enter neurological observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        🚻 Urogenital System
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.urogenital}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "urogenital",
                            e.target.value
                          )
                        }
                        placeholder="Enter urogenital observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        🐕 Skin & Coat
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.skin}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "skin",
                            e.target.value
                          )
                        }
                        placeholder="Enter skin observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        👀 Eyes
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.eyes}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "eyes",
                            e.target.value
                          )
                        }
                        placeholder="Enter eye observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        👂 Ears
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.ears}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "ears",
                            e.target.value
                          )
                        }
                        placeholder="Enter ear observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        👃 Nose
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.nose}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "nose",
                            e.target.value
                          )
                        }
                        placeholder="Enter nose observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        🗣️ Throat
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.throat}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "throat",
                            e.target.value
                          )
                        }
                        placeholder="Enter throat observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        🩻 Lymph Nodes
                      </label>

                      <textarea
                        rows="4"
                        value={formData.clinicalObservation.lymphNodes}
                        onChange={(e) =>
                          handleChange(
                            "clinicalObservation",
                            "lymphNodes",
                            e.target.value
                          )
                        }
                        placeholder="Enter lymph node observations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                  </div>

                  <div className="mt-6">
                    <label className="block font-semibold mb-2">
                      📝 Doctor's Detailed Notes
                    </label>

                    <textarea
                      rows="5"
                      value={formData.clinicalObservation.doctorNotes}
                      onChange={(e) =>
                        handleChange(
                          "clinicalObservation",
                          "doctorNotes",
                          e.target.value
                        )
                      }
                      placeholder="Enter doctor's notes..."
                      className="w-full border border-slate-300 p-3 rounded-2xl"
                    />
                  </div>

                </div>
              )}
              {step === 3 && (
                <div>

                  <h2 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">
                    🧾 Diagnosis
                  </h2>

                  <div className="space-y-6">

                    {/* Provisional Diagnosis */}
                    <div>
                      <label className="block font-semibold mb-2">
                        🔍 Provisional Diagnosis
                      </label>

                      <textarea
                        rows="4"
                        value={formData.diagnosis.provisionalDiagnosis}
                        onChange={(e) =>
                          handleChange(
                            "diagnosis",
                            "provisionalDiagnosis",
                            e.target.value
                          )
                        }
                        placeholder="Enter provisional diagnosis (ICD / VeNom Code if available)..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    {/* Differential Diagnosis */}
                    <div>
                      <label className="block font-semibold mb-2">
                        📋 Differential Diagnosis
                      </label>

                      <textarea
                        rows="4"
                        value={formData.diagnosis.differentialDiagnosis}
                        onChange={(e) =>
                          handleChange(
                            "diagnosis",
                            "differentialDiagnosis",
                            e.target.value
                          )
                        }
                        placeholder="Enter differential diagnosis..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    {/* Confirmed Diagnosis */}
                    <div>
                      <label className="block font-semibold mb-2">
                        ✅ Confirmed Diagnosis
                      </label>

                      <textarea
                        rows="4"
                        value={formData.diagnosis.confirmedDiagnosis}
                        onChange={(e) =>
                          handleChange(
                            "diagnosis",
                            "confirmedDiagnosis",
                            e.target.value
                          )
                        }
                        placeholder="Enter confirmed diagnosis after reports..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    {/* Lab Requisition Toggle */}
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">

                      <label className="flex items-center gap-3 font-semibold">

                        <input
                          type="checkbox"
                          checked={formData.diagnosis.raiseLab}
                          onChange={(e) =>
                            handleChange(
                              "diagnosis",
                              "raiseLab",
                              e.target.checked
                            )
                          }
                          className="w-5 h-5"
                        />

                        🧪 Raise Lab Requisition

                      </label>

                    </div>

                    {/* Important Note */}
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5">

                      <h3 className="font-bold text-red-600 mb-2">
                        ⚠️ Important Note
                      </h3>

                      <p className="text-sm text-slate-700">
                        If Lab Requisition is raised, the doctor must select
                        required tests. A Lab Order will be generated and
                        treatment/prescription may be held until reports
                        are uploaded and reviewed.
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {step === 4 && (
                <div>

                  <h2 className="text-2xl font-bold sm:text-3xl">
                    🧪 Lab Requisition
                  </h2>

                  <p className="text-slate-500 mt-2 mb-8">
                    Select required laboratory tests and sample types for the pet.
                  </p>
                  <div className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 p-5">

                    <label className="flex items-center gap-4">

                      <input
                        type="checkbox"
                        checked={formData.diagnosis.raiseLab}
                        onChange={(e) =>
                          handleChange(
                            "diagnosis",
                            "raiseLab",
                            e.target.checked
                          )
                        }
                        className="h-5 w-5 accent-orange-500"
                      />

                      <span className="text-lg font-semibold text-slate-700">
                        Raise Laboratory Test
                      </span>

                    </label>

                  </div>

                  <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">

                    {/* Tests Required */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:rounded-3xl sm:p-6">

                      <label className="block font-bold text-lg mb-5">
                        🔬 Tests Required
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">

                        {[
                          "CBC",
                          "Biochemistry",
                          "Urinalysis",
                          "Culture & Sensitivity",
                          "X-Ray",
                          "USG",
                          "Cytology",
                          "ELISA",
                          "PCR"
                        ].map((test) => (
                          <label
                            key={test}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-orange-500 hover:bg-orange-50 sm:p-4"
                          >
                            <input
                              type="checkbox"
                              checked={formData.labRequisition.tests.includes(test)}
                              onChange={(e) => {

                                if (e.target.checked) {

                                  handleChange(
                                    "labRequisition",
                                    "tests",
                                    [...formData.labRequisition.tests, test]
                                  );

                                } else {

                                  handleChange(
                                    "labRequisition",
                                    "tests",
                                    formData.labRequisition.tests.filter(
                                      (t) => t !== test
                                    )
                                  );

                                }

                              }}
                              className="w-4 h-4 accent-orange-500"
                            />

                            <span className="font-medium">
                              {test}
                            </span>
                          </label>
                        ))}

                      </div>

                    </div>

                    {/* Sample Type */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:rounded-3xl sm:p-6">

                      <label className="block font-bold text-lg mb-5">
                        🧫 Sample Type
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">

                        {[
                          "Blood",
                          "Urine",
                          "Stool",
                          "Swab",
                          "Biopsy",
                        ].map((sample) => (
                          <label
                            key={sample}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-orange-500 hover:bg-orange-50 sm:p-4"
                          >
                            <input
                              type="checkbox"
                              checked={formData.labRequisition.sampleType.includes(sample)}
                              onChange={(e) => {

                                if (e.target.checked) {

                                  handleChange(
                                    "labRequisition",
                                    "sampleType",
                                    [
                                      ...formData.labRequisition.sampleType,
                                      sample
                                    ]
                                  );

                                } else {

                                  handleChange(
                                    "labRequisition",
                                    "sampleType",
                                    formData.labRequisition.sampleType.filter(
                                      (s) => s !== sample
                                    )
                                  );

                                }

                              }}
                              className="w-4 h-4 accent-orange-500"
                            />

                            <span className="font-medium">
                              {sample}
                            </span>
                          </label>
                        ))}

                      </div>

                    </div>

                  </div>

                  {/* Special Instructions */}
                  <div className="mt-8">

                    <label className="block font-bold text-lg mb-3">
                      📝 Special Instructions For Lab
                    </label>

                    <textarea
                      rows="5"
                      value={formData.labRequisition.instructions}
                      onChange={(e) =>
                        handleChange(
                          "labRequisition",
                          "instructions",
                          e.target.value
                        )}
                      placeholder="Enter any special instructions for laboratory..."
                      className="w-full border border-slate-300 rounded-3xl p-4 focus:outline-none focus:border-orange-500"
                    />

                  </div>

                  {/* Lab Order ID */}


                  {/* Info Box */}
                  <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:rounded-3xl sm:p-6">

                    <h3 className="font-bold text-blue-700 text-lg mb-3">
                      ℹ️ Laboratory Workflow
                    </h3>

                    <p className="text-slate-700 leading-7">
                      Selected laboratory tests will automatically generate
                      a Lab Order. Reports uploaded by the laboratory team
                      will be linked directly with this consultation case.
                    </p>

                  </div>

                  {/* Raise Lab Requisition Button */}
                  {formData.diagnosis.raiseLab && (formData.labRequisition.tests.length > 0 || formData.labRequisition.instructions.trim()) && (
                    <div className="mt-8 p-4 rounded-2xl border border-amber-200 bg-amber-50">
                      <p className="text-sm text-amber-800 mb-4 font-medium">
                        ✓ Lab tests selected. Click below to finalize and send the requisition to the laboratory.
                      </p>
                      <button
                        type="button"
                        onClick={sendToLab}
                        className="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                      >
                        <span>🧪</span> Raise & Send Lab Requisition
                      </button>
                    </div>
                  )}

                </div>
              )}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 sm:text-3xl">
                      <span>💉 Treatment & Prescription</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Prescribe medications, record in-clinic procedures, vaccinations, deworming, and IV fluids
                    </p>
                  </div>

                  {(!formData.treatment.medicines?.trim() && !formData.treatment.procedures?.trim() && !formData.treatment.treatmentNotes?.trim()) && (
                    <div className="p-4 rounded-2xl border border-red-200 bg-red-50">
                      <p className="text-sm text-red-700 font-bold flex items-center gap-2">
                        <span>⚠️</span> At least one treatment detail is required
                      </p>
                      <p className="text-xs text-red-600 mt-2">
                        Please fill in Medicines, Procedures, or Treatment Notes before proceeding to the next step.
                      </p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* 1. Medications Prescribed */}
                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <span>💊 Medications Prescribed</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = Array.isArray(formData.treatment.medicationsList) && formData.treatment.medicationsList.length > 0
                              ? formData.treatment.medicationsList
                              : [{ drugName: "", dose: "", route: "", frequency: "", duration: "", instruction: "" }];
                            const updated = [...currentList, { drugName: "", dose: "", route: "", frequency: "", duration: "", instruction: "" }];
                            handleChange("treatment", "medicationsList", updated);
                            const textSummary = updated.map(m => `${m.drugName || ''} ${m.dose || ''} ${m.frequency || ''} for ${m.duration || ''}`).join("\n");
                            handleChange("treatment", "medicines", textSummary);
                          }}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Medication</span>
                        </button>
                      </div>

                      {(() => {
                        const medList = (Array.isArray(formData.treatment.medicationsList) && formData.treatment.medicationsList.length > 0)
                          ? formData.treatment.medicationsList
                          : [{ drugName: typeof formData.treatment.medicines === "string" ? formData.treatment.medicines : "", dose: "", route: "", frequency: "", duration: "", instruction: "" }];

                        return medList.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 p-3 bg-white rounded-xl border border-slate-200 relative">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Drug Name
                              </label>
                              <input
                                type="text"
                                value={row.drugName || ""}
                                onChange={(e) => {
                                  const updated = [...medList];
                                  updated[rIdx] = { ...updated[rIdx], drugName: e.target.value };
                                  handleChange("treatment", "medicationsList", updated);
                                  const textSummary = updated.map(m => `${m.drugName || ''} ${m.dose || ''} ${m.frequency || ''} for ${m.duration || ''}`).join("\n");
                                  handleChange("treatment", "medicines", textSummary);
                                }}
                                placeholder="Drug name"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Dose
                              </label>
                              <input
                                type="text"
                                value={row.dose || ""}
                                onChange={(e) => {
                                  const updated = [...medList];
                                  updated[rIdx] = { ...updated[rIdx], dose: e.target.value };
                                  handleChange("treatment", "medicationsList", updated);
                                }}
                                placeholder="e.g. 500mg / 1 Tab"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Route
                              </label>
                              <input
                                type="text"
                                value={row.route || ""}
                                onChange={(e) => {
                                  const updated = [...medList];
                                  updated[rIdx] = { ...updated[rIdx], route: e.target.value };
                                  handleChange("treatment", "medicationsList", updated);
                                }}
                                placeholder="Route"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Frequency
                              </label>
                              <input
                                type="text"
                                value={row.frequency || ""}
                                onChange={(e) => {
                                  const updated = [...medList];
                                  updated[rIdx] = { ...updated[rIdx], frequency: e.target.value };
                                  handleChange("treatment", "medicationsList", updated);
                                }}
                                placeholder="Frequency"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Duration
                              </label>
                              <input
                                type="text"
                                value={row.duration || ""}
                                onChange={(e) => {
                                  const updated = [...medList];
                                  updated[rIdx] = { ...updated[rIdx], duration: e.target.value };
                                  handleChange("treatment", "medicationsList", updated);
                                }}
                                placeholder="e.g. 5 Days"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Instruction
                                </label>
                                <input
                                  type="text"
                                  value={row.instruction || ""}
                                  onChange={(e) => {
                                    const updated = [...medList];
                                    updated[rIdx] = { ...updated[rIdx], instruction: e.target.value };
                                    handleChange("treatment", "medicationsList", updated);
                                  }}
                                  placeholder="e.g. After meals"
                                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                                />
                              </div>

                              {medList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = medList.filter((_, i) => i !== rIdx);
                                    handleChange("treatment", "medicationsList", updated);
                                  }}
                                  className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer"
                                  title="Remove medication"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* 2. In Clinic Procedure Done */}
                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <span>🩺 In Clinic Procedure Done</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = Array.isArray(formData.treatment.proceduresList) && formData.treatment.proceduresList.length > 0
                              ? formData.treatment.proceduresList
                              : [{ procedure: "", description: "", outcome: "" }];
                            const updated = [...currentList, { procedure: "", description: "", outcome: "" }];
                            handleChange("treatment", "proceduresList", updated);
                            const textSummary = updated.map(p => `${p.procedure || ''}: ${p.description || ''} (${p.outcome || ''})`).join("\n");
                            handleChange("treatment", "procedures", textSummary);
                          }}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Procedure</span>
                        </button>
                      </div>

                      {(() => {
                        const procList = (Array.isArray(formData.treatment.proceduresList) && formData.treatment.proceduresList.length > 0)
                          ? formData.treatment.proceduresList
                          : [{ procedure: typeof formData.treatment.procedures === "string" ? formData.treatment.procedures : "", description: "", outcome: "" }];

                        return procList.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-slate-200">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Procedure
                              </label>
                              <input
                                type="text"
                                value={row.procedure || ""}
                                onChange={(e) => {
                                  const updated = [...procList];
                                  updated[rIdx] = { ...updated[rIdx], procedure: e.target.value };
                                  handleChange("treatment", "proceduresList", updated);
                                }}
                                placeholder="Procedure name"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Description
                              </label>
                              <input
                                type="text"
                                value={row.description || ""}
                                onChange={(e) => {
                                  const updated = [...procList];
                                  updated[rIdx] = { ...updated[rIdx], description: e.target.value };
                                  handleChange("treatment", "proceduresList", updated);
                                }}
                                placeholder="Procedure description"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Outcome
                                </label>
                                <input
                                  type="text"
                                  value={row.outcome || ""}
                                  onChange={(e) => {
                                    const updated = [...procList];
                                    updated[rIdx] = { ...updated[rIdx], outcome: e.target.value };
                                    handleChange("treatment", "proceduresList", updated);
                                  }}
                                  placeholder="e.g. Successful / Normal"
                                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                                />
                              </div>

                              {procList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = procList.filter((_, i) => i !== rIdx);
                                    handleChange("treatment", "proceduresList", updated);
                                  }}
                                  className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer"
                                  title="Remove procedure"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* 3. Vaccination Administered */}
                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <span>💉 Vaccination Administered</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = Array.isArray(formData.treatment.vaccinationsList) && formData.treatment.vaccinationsList.length > 0
                              ? formData.treatment.vaccinationsList
                              : [{ vaccine: "", batchNumber: "", dose: "", route: "", nextDueDate: "" }];
                            const updated = [...currentList, { vaccine: "", batchNumber: "", dose: "", route: "", nextDueDate: "" }];
                            handleChange("treatment", "vaccinationsList", updated);
                          }}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Vaccination</span>
                        </button>
                      </div>

                      {(() => {
                        const vacList = (Array.isArray(formData.treatment.vaccinationsList) && formData.treatment.vaccinationsList.length > 0)
                          ? formData.treatment.vaccinationsList
                          : [{ vaccine: typeof formData.treatment.vaccinations === "string" ? formData.treatment.vaccinations : "", batchNumber: "", dose: "", route: "", nextDueDate: "" }];

                        return vacList.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-white rounded-xl border border-slate-200">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Vaccine
                              </label>
                              <input
                                type="text"
                                value={row.vaccine || ""}
                                onChange={(e) => {
                                  const updated = [...vacList];
                                  updated[rIdx] = { ...updated[rIdx], vaccine: e.target.value };
                                  handleChange("treatment", "vaccinationsList", updated);
                                }}
                                placeholder="Vaccine name"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Batch No.
                              </label>
                              <input
                                type="text"
                                value={row.batchNumber || ""}
                                onChange={(e) => {
                                  const updated = [...vacList];
                                  updated[rIdx] = { ...updated[rIdx], batchNumber: e.target.value };
                                  handleChange("treatment", "vaccinationsList", updated);
                                }}
                                placeholder="Batch number"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Dose
                              </label>
                              <input
                                type="text"
                                value={row.dose || ""}
                                onChange={(e) => {
                                  const updated = [...vacList];
                                  updated[rIdx] = { ...updated[rIdx], dose: e.target.value };
                                  handleChange("treatment", "vaccinationsList", updated);
                                }}
                                placeholder="Dose (e.g. 1 ml)"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Route
                              </label>
                              <input
                                type="text"
                                value={row.route || ""}
                                onChange={(e) => {
                                  const updated = [...vacList];
                                  updated[rIdx] = { ...updated[rIdx], route: e.target.value };
                                  handleChange("treatment", "vaccinationsList", updated);
                                }}
                                placeholder="e.g. SC / IM"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Next Due Date
                                </label>
                                <input
                                  type="date"
                                  value={row.nextDueDate || ""}
                                  onChange={(e) => {
                                    const updated = [...vacList];
                                    updated[rIdx] = { ...updated[rIdx], nextDueDate: e.target.value };
                                    handleChange("treatment", "vaccinationsList", updated);
                                  }}
                                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                                />
                              </div>

                              {vacList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = vacList.filter((_, i) => i !== rIdx);
                                    handleChange("treatment", "vaccinationsList", updated);
                                  }}
                                  className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer"
                                  title="Remove vaccination"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* 4. Deworming Administered */}
                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                            <span>🪱 Deworming Administered</span>
                          </h3>

                          {/* Toggle Switch */}
                          <div className="flex items-center bg-slate-200 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => handleChange("treatment", "hasDeworming", false)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                !formData.treatment.hasDeworming
                                  ? "bg-white text-slate-800 shadow-xs"
                                  : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              No
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange("treatment", "hasDeworming", true)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.treatment.hasDeworming
                                  ? "bg-orange-500 text-white shadow-xs"
                                  : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              Yes
                            </button>
                          </div>
                        </div>

                        {formData.treatment.hasDeworming && (
                          <button
                            type="button"
                            onClick={() => {
                              const currentList = Array.isArray(formData.treatment.dewormingList) && formData.treatment.dewormingList.length > 0
                                ? formData.treatment.dewormingList
                                : [{ product: "", dose: "", date: new Date().toISOString().split("T")[0] }];
                              const updated = [...currentList, { product: "", dose: "", date: new Date().toISOString().split("T")[0] }];
                              handleChange("treatment", "dewormingList", updated);
                            }}
                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Deworming</span>
                          </button>
                        )}
                      </div>

                      {formData.treatment.hasDeworming && (() => {
                        const dewList = (Array.isArray(formData.treatment.dewormingList) && formData.treatment.dewormingList.length > 0)
                          ? formData.treatment.dewormingList
                          : [{ product: typeof formData.treatment.deworming === "string" ? formData.treatment.deworming : "", dose: "", date: new Date().toISOString().split("T")[0] }];

                        return dewList.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-slate-200">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Product
                              </label>
                              <input
                                type="text"
                                value={row.product || ""}
                                onChange={(e) => {
                                  const updated = [...dewList];
                                  updated[rIdx] = { ...updated[rIdx], product: e.target.value };
                                  handleChange("treatment", "dewormingList", updated);
                                }}
                                placeholder="Product name"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Dose
                              </label>
                              <input
                                type="text"
                                value={row.dose || ""}
                                onChange={(e) => {
                                  const updated = [...dewList];
                                  updated[rIdx] = { ...updated[rIdx], dose: e.target.value };
                                  handleChange("treatment", "dewormingList", updated);
                                }}
                                placeholder="e.g. 1 Tab"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={row.date || ""}
                                  onChange={(e) => {
                                    const updated = [...dewList];
                                    updated[rIdx] = { ...updated[rIdx], date: e.target.value };
                                    handleChange("treatment", "dewormingList", updated);
                                  }}
                                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                                />
                              </div>

                              {dewList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = dewList.filter((_, i) => i !== rIdx);
                                    handleChange("treatment", "dewormingList", updated);
                                  }}
                                  className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer"
                                  title="Remove deworming"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* 5. Fluids/ IV Given */}
                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                            <span>💧 Fluids / IV Given</span>
                          </h3>

                          {/* Toggle Switch */}
                          <div className="flex items-center bg-slate-200 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => handleChange("treatment", "hasFluids", false)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                !formData.treatment.hasFluids
                                  ? "bg-white text-slate-800 shadow-xs"
                                  : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              No
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange("treatment", "hasFluids", true)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.treatment.hasFluids
                                  ? "bg-orange-500 text-white shadow-xs"
                                  : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              Yes
                            </button>
                          </div>
                        </div>

                        {formData.treatment.hasFluids && (
                          <button
                            type="button"
                            onClick={() => {
                              const currentList = Array.isArray(formData.treatment.fluidsList) && formData.treatment.fluidsList.length > 0
                                ? formData.treatment.fluidsList
                                : [{ type: "", volume: "", rate: "" }];
                              const updated = [...currentList, { type: "", volume: "", rate: "" }];
                              handleChange("treatment", "fluidsList", updated);
                            }}
                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Fluid/IV</span>
                          </button>
                        )}
                      </div>

                      {formData.treatment.hasFluids && (() => {
                        const fluidList = (Array.isArray(formData.treatment.fluidsList) && formData.treatment.fluidsList.length > 0)
                          ? formData.treatment.fluidsList
                          : [{ type: typeof formData.treatment.fluids === "string" ? formData.treatment.fluids : "", volume: "", rate: "" }];

                        return fluidList.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-slate-200">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Type
                              </label>
                              <input
                                type="text"
                                value={row.type || ""}
                                onChange={(e) => {
                                  const updated = [...fluidList];
                                  updated[rIdx] = { ...updated[rIdx], type: e.target.value };
                                  handleChange("treatment", "fluidsList", updated);
                                }}
                                placeholder="e.g. NS 0.9% / RL"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Volume
                              </label>
                              <input
                                type="text"
                                value={row.volume || ""}
                                onChange={(e) => {
                                  const updated = [...fluidList];
                                  updated[rIdx] = { ...updated[rIdx], volume: e.target.value };
                                  handleChange("treatment", "fluidsList", updated);
                                }}
                                placeholder="e.g. 500 ml"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                              />
                            </div>

                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Rate
                                </label>
                                <input
                                  type="text"
                                  value={row.rate || ""}
                                  onChange={(e) => {
                                    const updated = [...fluidList];
                                    updated[rIdx] = { ...updated[rIdx], rate: e.target.value };
                                    handleChange("treatment", "fluidsList", updated);
                                  }}
                                  placeholder="e.g. 20 drops/min"
                                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                                />
                              </div>

                              {fluidList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = fluidList.filter((_, i) => i !== rIdx);
                                    handleChange("treatment", "fluidsList", updated);
                                  }}
                                  className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer"
                                  title="Remove fluid"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Follow-Up & Doctor Treatment Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2 text-slate-700 text-sm">
                          📅 Follow-Up Required
                        </label>
                        <select
                          value={formData.treatment.followUp || ""}
                          onChange={(e) => handleChange("treatment", "followUp", e.target.value)}
                          className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-orange-500 font-medium"
                        >
                          <option value="">Select Option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold mb-2 text-slate-700 text-sm">
                          📝 Treatment Notes
                        </label>
                        <textarea
                          rows="3"
                          value={formData.treatment.treatmentNotes || ""}
                          onChange={(e) => handleChange("treatment", "treatmentNotes", e.target.value)}
                          placeholder="Enter additional treatment notes..."
                          className="w-full border border-slate-300 rounded-2xl p-3 text-sm outline-none focus:border-orange-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {step === 6 && (
                <div>

                  <h2 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">
                    📋 Suggestions & Plans
                  </h2>

                  <div className="grid gap-5 md:grid-cols-2 md:gap-6">

                    {/* Dietary Advice */}
                    <div>
                      <label className="block font-semibold mb-2">
                        🍖 Dietary Advice
                      </label>

                      <textarea
                        rows="4"
                        value={formData.suggestion.dietAdvice}
                        onChange={(e) =>
                          handleChange(
                            "suggestion",
                            "dietAdvice",
                            e.target.value
                          )
                        }
                        placeholder="Enter dietary recommendations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    {/* Activity Restriction */}
                    <div>
                      <label className="block font-semibold mb-2">
                        🏃 Activity Restriction
                      </label>

                      <textarea
                        rows="4"
                        value={formData.suggestion.activityRestriction}
                        onChange={(e) =>
                          handleChange(
                            "suggestion",
                            "activityRestriction",
                            e.target.value
                          )
                        }
                        placeholder="Activity restrictions..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    {/* Home Care */}
                    <div>
                      <label className="block font-semibold mb-2">
                        🏠 Home Care Instructions
                      </label>

                      <textarea
                        rows="4"
                        value={formData.suggestion.homeCare}
                        onChange={(e) =>
                          handleChange(
                            "suggestion",
                            "homeCare",
                            e.target.value
                          )
                        }
                        placeholder="Enter home care instructions..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    {/* Preventive Care */}
                    <div>
                      <label className="block font-semibold mb-2">
                        🛡️ Preventive Care Recommendations
                      </label>

                      <textarea
                        rows="4"
                        value={formData.suggestion.preventiveCare}
                        onChange={(e) =>
                          handleChange(
                            "suggestion",
                            "preventiveCare",
                            e.target.value
                          )
                        }
                        placeholder="Preventive care recommendations..."
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                    {/* Prognosis */}
                    <div>
                      <label className="block font-semibold mb-2">
                        📈 Prognosis
                      </label>
                      <select
                        value={formData.suggestion.prognosis}
                        onChange={(e) =>
                          handleChange(
                            "suggestion",
                            "prognosis",
                            e.target.value
                          )
                        }
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      >
                        <option value="">Select Prognosis</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Guarded">Guarded</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>

                    {/* Follow-up Date */}
                    <div>
                      <label className="block font-semibold mb-2">
                        📅 Follow-Up Date
                      </label>

                      <input
                        type="date"
                        value={formData.suggestion.followUpDate}
                        onChange={(e) =>
                          handleChange(
                            "suggestion",
                            "followUpDate",
                            e.target.value
                          )
                        }
                        className="w-full border border-slate-300 p-3 rounded-2xl"
                      />
                    </div>

                  </div>

                  <div className="mt-6">

                    <label className="block font-semibold mb-2">
                      📌 Final Doctor Notes
                    </label>

                    <textarea
                      rows="6"
                      value={formData.suggestion.finalNotes}
                      onChange={(e) =>
                        handleChange(
                          "suggestion",
                          "finalNotes",
                          e.target.value
                        )
                      }
                      placeholder="Final recommendations and notes..."
                      className="w-full border border-slate-300 p-3 rounded-2xl"
                    />

                  </div>

                  <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5">

                    <h3 className="font-bold text-green-700 mb-2">
                      ✅ Case Ready For Completion
                    </h3>

                    <p className="text-sm text-slate-700">
                      All consultation steps are completed. Review information before clicking
                      "Complete Case".
                    </p>

                  </div>

                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200/80 p-4 md:p-5 bg-slate-50 shrink-0">
              <button
                disabled={step === 1}
                onClick={() => {
                  if (step === 5 && !formData.diagnosis.raiseLab) {
                    setStep(3);
                  } else {
                    setStep((prev) => Math.max(prev - 1, 1));
                  }
                }}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  step === 1
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300 shadow-xs"
                }`}
              >
                ← Previous Step
              </button>

              {step < 6 ? (
                <button
                  disabled={step === 4 && formData.diagnosis.raiseLab && selectedPet?.status === "LAB_TEST_RAISED"}
                  onClick={() => {
                    if (step === 4 && formData.diagnosis.raiseLab && selectedPet?.status === "LAB_TEST_RAISED") {
                      toast.error("Awaiting lab report. Lab tests have been raised and are being processed.");
                      return;
                    }
                    if (!validateStep(step)) return;
                    if (step === 3 && !formData.diagnosis.raiseLab) {
                      setStep(5);
                    } else {
                      setStep((prev) => Math.min(prev + 1, 6));
                    }
                  }}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    step === 4 && formData.diagnosis.raiseLab && selectedPet?.status === "LAB_TEST_RAISED"
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
                  }`}
                >
                  Next Step →
                </button>
              ) : formData.diagnosis.raiseLab ? (
                <button
                  onClick={sendToLab}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                >
                  <span>🧪</span> Send To Lab Requisition
                </button>
              ) : (
                <button
                  onClick={completeCase}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <span>✅</span> Complete Case & Finalize
                </button>
              )}
            </div>

          </div>

        </div>
      )}


      <LabReportModal
        open={showLabReportModal}
        onClose={() => setShowLabReportModal(false)}
        report={selectedLabReport}
        onCompleteCase={async () => {
          const visitId = selectedLabReport?.visitId?._id || selectedLabReport?.visitId;
          if (!visitId) return;
          try {
            setShowLabReportModal(false);
            const response = await updatePatient(visitId, {
              status: "COMPLETED",
              workflow: { doctorCompleted: true }
            });
            if (response.success || response.data) {
              toast.success("Case completed successfully and moved to Doctor Completed Pets!");
              await fetchPendingPets();
            }
          } catch (err) {
            console.error("Complete case from lab modal failed:", err);
            toast.error(err.response?.data?.message || "Failed to complete case.");
          }
        }}
      />

      <PreConsultationReportModal
        open={showPreConsultationModal}
        onClose={() => setShowPreConsultationModal(false)}
        data={selectedPreConsultation}
      />

      <CaseCompletionModal
        open={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onEdit={() => {
          setShowCompletionModal(false);
          if (completedCaseData) {
            setSelectedPet(completedCaseData);
            setShowModal(true);
          }
        }}
        caseData={completedCaseData}
      />

    </div>

  );
}
