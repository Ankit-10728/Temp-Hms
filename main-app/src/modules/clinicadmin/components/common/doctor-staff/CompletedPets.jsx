import { useEffect, useState } from "react";
import { Search, Filter, RefreshCw, Eye, Download, PawPrint, CheckCircle2, CalendarDays, Stethoscope, Trash2 } from "lucide-react";
import { deletePatient, getCompletedPets } from "../../../api/doctorModuleApi";
import { generateCaseReportPDF } from "./generateCaseReportPDF";
import toast from "react-hot-toast";

export default function CompletedPets() {
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("ALL");
  const [completedCases, setCompletedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    total: 0,
  });

  useEffect(() => {
    fetchCompletedPets();
  }, []);

  const fetchCompletedPets = async () => {
    try {
      setLoading(true);
      const response = await getCompletedPets();
      const cases = response?.pets || response?.data?.pets || (Array.isArray(response) ? response : []);
      setCompletedCases(cases);
      setStats({
        today: response?.stats?.completedToday || cases.length,
        thisWeek: response?.stats?.completedThisWeek || cases.length,
        total: response?.stats?.totalCompleted || cases.length,
      });
    } catch (error) {
      console.error("Error fetching completed pets:", error);
      toast.error("Failed to load completed doctor cases");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this completed visit and its linked records? This cannot be undone.")) return;
    try {
      await deletePatient(item._id);
      toast.success("Visit record deleted");
      fetchCompletedPets();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete visit record");
    }
  };

  const getSpeciesIcon = () => <PawPrint className="size-5 text-[#F7931E]" />;

  const normalizeCaseData = (item) => {
    if (!item) return null;

    const petName = item.petId?.name || item.petId?.petName || item.pet?.petName || item.petName || "Patient";
    const species = item.petId?.species || item.pet?.species || item.species || "N/A";
    const breed = item.petId?.breed || item.pet?.breed || item.breed || "N/A";
    const gender = item.petId?.gender || item.pet?.gender || item.gender || "N/A";
    const age = item.petId?.age || item.pet?.age || item.age || "N/A";

    const ownerName = item.ownerId?.ownerName || item.owner?.ownerName || item.ownerName || "N/A";
    const mobileNumber = item.ownerId?.mobileNumber || item.owner?.mobileNumber || item.phoneNumber || "N/A";

    const vitals = item.vitals || item.preConsultationId || item.preConsultation || {};
    const history = item.history || item.preConsultationId?.history || {};
    const clinicalObservation = item.clinicalObservation || item.consultationDetails?.clinicalObservation || {};
    const diagnosis = item.diagnosis || item.consultationDetails?.diagnosis || {};
    const labRequisition = item.labRequisition || item.consultationDetails?.labRequisition || {};
    const treatment = item.treatment || item.consultationDetails?.treatment || {};
    const suggestion = item.suggestion || item.consultationDetails?.suggestion || {};

    return {
      ...item,
      petName,
      species,
      breed,
      gender,
      age,
      ownerName,
      mobileNumber,
      vitals,
      history,
      clinicalObservation,
      diagnosis,
      labRequisition,
      treatment,
      suggestion,
    };
  };

  const filteredCases = completedCases.filter((item) => {
    const norm = normalizeCaseData(item);
    const query = search.toLowerCase().trim();

    const matchesSearch =
      !query ||
      norm.ownerName.toLowerCase().includes(query) ||
      norm.petName.toLowerCase().includes(query) ||
      norm.mobileNumber.includes(query) ||
      (item.tokenNumber || item.token || "").toLowerCase().includes(query);

    const matchesSpecies =
      speciesFilter === "ALL" ||
      norm.species.toUpperCase() === speciesFilter.toUpperCase();

    return matchesSearch && matchesSpecies;
  });

  const activeCase = normalizeCaseData(selectedCase);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Completed Today</p>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-1">{loading ? "..." : stats.today}</h2>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center text-2xl font-bold">
            <CheckCircle2 className="size-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">This Week</p>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-1">{loading ? "..." : stats.thisWeek}</h2>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-2xl font-bold">
            <CalendarDays className="size-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Completed Cases</p>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-1">{loading ? "..." : stats.total}</h2>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center text-2xl font-bold">
            <Stethoscope className="size-6" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 md:p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              Completed Doctor Consultations
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              View and download complete clinical records & medical history reports for finished cases
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCompletedPets}
              className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh List"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pet, owner, token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Species</option>
              <option value="DOG">Dog</option>
              <option value="CAT">Cat</option>
              <option value="BIRD">Bird</option>
              <option value="RABBIT">Rabbit</option>
            </select>
          </div>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-400 font-medium">
              Loading completed consultations...
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 font-medium">
              No completed consultations found.
            </div>
          ) : (
            filteredCases.map((item) => {
              const norm = normalizeCaseData(item);
              const icon = getSpeciesIcon(norm.species);

              return (
                <div
                  key={item._id || item.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{icon}</span>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                        Doctor Completed
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800 text-base">
                        {norm.petName} <span className="text-xs font-normal text-slate-500">({norm.species} - {norm.breed})</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Owner: {norm.ownerName} ({norm.mobileNumber})</p>
                    </div>

                    {norm.diagnosis?.confirmedDiagnosis && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                        <span className="font-bold text-slate-500 block text-[10px] uppercase">Diagnosis</span>
                        <span className="font-semibold text-emerald-800">{norm.diagnosis.confirmedDiagnosis}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => setSelectedCase(item)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => generateCaseReportPDF(norm)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button onClick={() => handleDelete(item)} className="grid place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100" title="Delete visit"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Case Details Drawer Modal */}
      {activeCase && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs p-3 md:p-6 flex items-center justify-center overflow-hidden">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto animate-in fade-in duration-200 border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Doctor Completed Consultation Summary
                </span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-2">
                  {activeCase.petName} Clinical Record
                </h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Patient & Owner Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Patient Info</p>
                <p className="text-sm font-bold text-slate-800">
                  {activeCase.petName} ({activeCase.species} - {activeCase.breed})
                </p>
                <p className="text-slate-600">Gender: {activeCase.gender} | Age: {activeCase.age}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Owner Info</p>
                <p className="text-sm font-bold text-slate-800">{activeCase.ownerName}</p>
                <p className="text-slate-600">Mobile: {activeCase.mobileNumber}</p>
              </div>
            </div>

            {/* 1. Clinical Vitals */}
            <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2">
                <span>📊 1. Clinical Vitals</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 font-medium">
                <div>Temp: <span className="font-bold">{activeCase.vitals.bodyTemperature || activeCase.vitals.temperature ? `${activeCase.vitals.bodyTemperature || activeCase.vitals.temperature} °F` : "N/A"}</span></div>
                <div>Weight: <span className="font-bold">{activeCase.vitals.bodyWeight || activeCase.vitals.weight ? `${activeCase.vitals.bodyWeight || activeCase.vitals.weight} kg` : "N/A"}</span></div>
                <div>Heart Rate: <span className="font-bold">{activeCase.vitals.heartRate || activeCase.vitals.pulseRate ? `${activeCase.vitals.heartRate || activeCase.vitals.pulseRate} bpm` : "N/A"}</span></div>
                <div>Resp Rate: <span className="font-bold">{activeCase.vitals.respiratoryRate || "N/A"}</span></div>
                <div>BP: <span className="font-bold">{activeCase.vitals.bloodPressure || "N/A"}</span></div>
                <div>SpO2: <span className="font-bold">{activeCase.vitals.spo2 !== undefined && activeCase.vitals.spo2 !== null && activeCase.vitals.spo2 !== "" ? `${activeCase.vitals.spo2}%` : "N/A"}</span></div>
                <div>BCS: <span className="font-bold">{activeCase.vitals.bcs ? `${activeCase.vitals.bcs}/5` : "N/A"}</span></div>
                <div>Recorded By: <span className="font-bold">{activeCase.vitals.recordedBy || "N/A"}</span></div>
              </div>
            </div>

            {/* 2. History - Doctor Reviews */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                🩺 2. History - Doctor Reviews
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-slate-700">
                <div>Diet Type: <span className="font-bold">{activeCase.history.dietType || "N/A"}</span></div>
                <div>Diet Frequency: <span className="font-bold">{activeCase.history.dietFrequency ? `${activeCase.history.dietFrequency} meals/day` : "N/A"}</span></div>
                <div>Water Intake: <span className="font-bold">{activeCase.history.waterIntake || "N/A"}</span></div>
                <div>Behavioral Habits: <span className="font-bold">{activeCase.history.behaviour || "N/A"}</span></div>
                <div>Exercise Level: <span className="font-bold">{activeCase.history.exercise || "N/A"}</span></div>
                <div>Vaccinations Status: <span className="font-bold">{activeCase.history.vaccinationStatus || "N/A"}</span></div>
                <div className="sm:col-span-2">Allergies: <span className="font-bold">{activeCase.history.allergies || "N/A"}</span></div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                <p className="font-bold text-slate-700">Confirmed Medications History:</p>
                {Array.isArray(activeCase.history.medicationsConfirmed) && activeCase.history.medicationsConfirmed.length > 0 ? (
                  activeCase.history.medicationsConfirmed.map((m, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200 text-slate-600">
                      • <span className="font-bold text-slate-800">{m.drug || 'N/A'}</span> | Dose: {m.dose || 'N/A'} | Freq: {m.frequency || 'N/A'} | Since: {m.since || 'N/A'}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">N/A</p>
                )}
              </div>
            </div>

            {/* 3. Clinical Observations */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                🔬 3. Clinical Observations
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div>Cardiovascular: <span className="font-bold">{activeCase.clinicalObservation.cardiovascular || "N/A"}</span></div>
                <div>Respiratory: <span className="font-bold">{activeCase.clinicalObservation.respiratory || "N/A"}</span></div>
                <div>Digestive: <span className="font-bold">{activeCase.clinicalObservation.digestive || "N/A"}</span></div>
                <div>Musculoskeletal: <span className="font-bold">{activeCase.clinicalObservation.musculoskeletal || "N/A"}</span></div>
                <div>Neurological: <span className="font-bold">{activeCase.clinicalObservation.neurological || "N/A"}</span></div>
                <div>Urogenital: <span className="font-bold">{activeCase.clinicalObservation.urogenital || "N/A"}</span></div>
                <div>Skin & Coat: <span className="font-bold">{activeCase.clinicalObservation.skin || "N/A"}</span></div>
                <div>Eyes: <span className="font-bold">{activeCase.clinicalObservation.eyes || "N/A"}</span></div>
                <div>Ears: <span className="font-bold">{activeCase.clinicalObservation.ears || "N/A"}</span></div>
                <div>Lymph Nodes: <span className="font-bold">{activeCase.clinicalObservation.lymphNodes || "N/A"}</span></div>
              </div>
              <p className="pt-1"><span className="font-bold text-slate-800">Doctor Notes:</span> {activeCase.clinicalObservation.doctorNotes || "N/A"}</p>
            </div>

            {/* 4. Diagnosis & Lab Requisition */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3 text-xs">
              <h4 className="font-bold text-emerald-900 uppercase tracking-wider text-xs">
                🔍 4. Diagnosis & Lab Diagnostics
              </h4>
              <div className="space-y-1">
                <p><span className="font-bold text-slate-800">Confirmed Diagnosis:</span> <span className="font-bold text-emerald-800">{activeCase.diagnosis.confirmedDiagnosis || "N/A"}</span></p>
                <p><span className="font-bold text-slate-700">Provisional Diagnosis:</span> {activeCase.diagnosis.provisionalDiagnosis || "N/A"}</p>
                <p><span className="font-bold text-slate-700">Differential Diagnosis:</span> {activeCase.diagnosis.differentialDiagnosis || "N/A"}</p>
                <p>
                  <span className="font-bold text-slate-700">Lab Requisition Tests:</span>{" "}
                  {Array.isArray(activeCase.labRequisition.tests) && activeCase.labRequisition.tests.length > 0
                    ? activeCase.labRequisition.tests.map(t => typeof t === "string" ? t : (t.testName || t.name || "")).filter(Boolean).join(", ")
                    : (activeCase.labRequisition.tests || "N/A")}
                </p>
                <p>
                  <span className="font-bold text-slate-700">Lab Requisition Sample Type:</span>{" "}
                  {Array.isArray(activeCase.labRequisition.sampleType) && activeCase.labRequisition.sampleType.length > 0
                    ? activeCase.labRequisition.sampleType.map(s => typeof s === "string" ? s : (s.name || s.label || "")).filter(Boolean).join(", ")
                    : (activeCase.labRequisition.sampleType || "N/A")}
                </p>
              </div>

              {/* Uploaded Lab Reports Sub-card */}
              {(activeCase.labReport?.reports || activeCase.consultationDetails?.labReport?.reports) && (
                <div className="pt-2 border-t border-emerald-200 space-y-2">
                  <p className="font-extrabold text-slate-800 uppercase text-[10px]">Uploaded Diagnostic Report PDFs:</p>
                  <div className="space-y-2">
                    {(activeCase.labReport?.reports || activeCase.consultationDetails?.labReport?.reports).map((r, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-700">
                        <div>
                          <p className="font-bold text-orange-600">{r.testName || `Lab Report #${idx + 1}`}</p>
                          <p className="text-[11px] text-slate-400">File: {r.fileName || "Uploaded PDF Document"}</p>
                        </div>
                        {r.fileUrl && (
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={`${r.fileName || r.testName || "Lab_Report"}.pdf`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition cursor-pointer shrink-0 border-none"
                          >
                            <span>📄</span> View / Download PDF
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Treatment & Prescription */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                💊 5. Treatment & Prescription Administered
              </h4>

              {/* Medications Prescribed Multi-row */}
              <div className="space-y-1.5">
                <p className="font-bold text-slate-700">Medications Prescribed:</p>
                {Array.isArray(activeCase.treatment.medicationsList) && activeCase.treatment.medicationsList.length > 0 ? (
                  <div className="grid gap-2">
                    {activeCase.treatment.medicationsList.map((m, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-6 gap-2 text-slate-700 font-medium">
                        <div><span className="text-[10px] text-slate-400 block font-bold">DRUG</span>{m.drugName || 'N/A'}</div>
                        <div><span className="text-[10px] text-slate-400 block font-bold">DOSE</span>{m.dose || 'N/A'}</div>
                        <div><span className="text-[10px] text-slate-400 block font-bold">ROUTE</span>{m.route || 'N/A'}</div>
                        <div><span className="text-[10px] text-slate-400 block font-bold">FREQ</span>{m.frequency || 'N/A'}</div>
                        <div><span className="text-[10px] text-slate-400 block font-bold">DURATION</span>{m.duration || 'N/A'}</div>
                        <div><span className="text-[10px] text-slate-400 block font-bold">INSTRUCTION</span>{m.instruction || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                ) : activeCase.treatment.medicines ? (
                  <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 whitespace-pre-wrap">{activeCase.treatment.medicines}</p>
                ) : (
                  <p className="text-slate-500 italic">N/A</p>
                )}
              </div>

              {/* In Clinic Procedures Multi-row */}
              <div className="space-y-1.5 pt-2">
                <p className="font-bold text-slate-700">In Clinic Procedures Done:</p>
                {Array.isArray(activeCase.treatment.proceduresList) && activeCase.treatment.proceduresList.length > 0 ? (
                  <div className="grid gap-2">
                    {activeCase.treatment.proceduresList.map((p, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-slate-700 font-medium">
                        <div><span className="text-[10px] text-slate-400 block font-bold">PROCEDURE</span>{p.procedure || 'N/A'}</div>
                        <div><span className="text-[10px] text-slate-400 block font-bold">DESCRIPTION</span>{p.description || 'N/A'}</div>
                        <div><span className="text-[10px] text-slate-400 block font-bold">OUTCOME</span>{p.outcome || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                ) : activeCase.treatment.procedures ? (
                  <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">{activeCase.treatment.procedures}</p>
                ) : (
                  <p className="text-slate-500 italic">N/A</p>
                )}
              </div>

              {/* Vaccination Administered */}
              <div className="space-y-1.5 pt-2">
                <p className="font-bold text-slate-700">Vaccination Administered:</p>
                {Array.isArray(activeCase.treatment.vaccinationsList) && activeCase.treatment.vaccinationsList.length > 0 ? (
                  <div className="grid gap-2">
                    {activeCase.treatment.vaccinationsList.map((v, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 grid grid-cols-5 gap-2 text-slate-700 font-medium">
                        <div><span className="text-[10px] text-slate-400 block font-bold">VACCINE</span>{v.vaccine || 'N/A'}</div>
                        <div><span className="text-[10px] text-slate-400 block font-bold">BATCH NO</span>{v.batchNumber || 'N/A'}</div>
                        <div><span className="text-[10px] text-slate-400 block font-bold">DOSE</span>{v.dose || 'N/A'}</div>
                        <div><span className="text-[10px] text-slate-400 block font-bold">ROUTE</span>{v.route || 'N/A'}</div>
                        <div><span className="text-[10px] text-slate-400 block font-bold">NEXT DUE</span>{v.nextDueDate || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                ) : activeCase.treatment.vaccinations ? (
                  <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">{activeCase.treatment.vaccinations}</p>
                ) : (
                  <p className="text-slate-500 italic">N/A</p>
                )}
              </div>

              {/* Deworming & Fluids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-700">🪱 Deworming Administered:</p>
                  {Array.isArray(activeCase.treatment.dewormingList) && activeCase.treatment.dewormingList.length > 0 ? (
                    activeCase.treatment.dewormingList.map((d, idx) => (
                      <p key={idx} className="text-slate-600">• {d.product || 'N/A'} (Dose: {d.dose || 'N/A'}, Date: {d.date || 'N/A'})</p>
                    ))
                  ) : activeCase.treatment.deworming ? (
                    <p className="text-slate-600">• {activeCase.treatment.deworming}</p>
                  ) : (
                    <p className="text-slate-500 italic">N/A</p>
                  )}
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-700">💧 Fluids / IV Given:</p>
                  {Array.isArray(activeCase.treatment.fluidsList) && activeCase.treatment.fluidsList.length > 0 ? (
                    activeCase.treatment.fluidsList.map((f, idx) => (
                      <p key={idx} className="text-slate-600">• {f.type || 'N/A'} (Vol: {f.volume || 'N/A'}, Rate: {f.rate || 'N/A'})</p>
                    ))
                  ) : activeCase.treatment.fluids ? (
                    <p className="text-slate-600">• {activeCase.treatment.fluids}</p>
                  ) : (
                    <p className="text-slate-500 italic">N/A</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <p className="font-bold text-slate-700">Treatment Notes:</p>
                <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">{activeCase.treatment.treatmentNotes || "N/A"}</p>
              </div>
            </div>

            {/* 6. Suggestions & Discharge Advice */}
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2 text-xs">
              <h4 className="font-bold text-blue-900 uppercase tracking-wider text-xs">
                📋 6. Discharge Advice & Follow-Up
              </h4>
              <div className="space-y-1 text-slate-700">
                <p><span className="font-bold text-slate-800">Prognosis:</span> {activeCase.suggestion.prognosis || "N/A"}</p>
                <p><span className="font-bold text-slate-800">Dietary Advice:</span> {activeCase.suggestion.dietAdvice || "N/A"}</p>
                <p><span className="font-bold text-slate-800">Activity Restriction:</span> {activeCase.suggestion.activityRestriction || "N/A"}</p>
                <p><span className="font-bold text-slate-800">Home Care:</span> {activeCase.suggestion.homeCare || "N/A"}</p>
                <p><span className="font-bold text-slate-800">Preventive Care:</span> {activeCase.suggestion.preventiveCare || "N/A"}</p>
                <p><span className="font-bold text-slate-800">Follow-Up Required / Date:</span> {activeCase.suggestion.followUpDate || activeCase.treatment?.followUp || "N/A"}</p>
                <p><span className="font-bold text-slate-800">Final Notes:</span> {activeCase.suggestion.finalNotes || "N/A"}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => generateCaseReportPDF(activeCase)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF Report
              </button>
              <button
                onClick={() => setSelectedCase(null)}
                className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition-all cursor-pointer"
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
