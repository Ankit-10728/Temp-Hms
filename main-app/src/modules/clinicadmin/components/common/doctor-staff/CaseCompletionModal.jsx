import React from "react";
import { Download, CheckCircle, X, FileText, Calendar, User, PawPrint, Edit3, Stethoscope, ClipboardList, Activity, Pill, ShieldCheck } from "lucide-react";
import { generateCaseReportPDF } from "./generateCaseReportPDF";

export default function CaseCompletionModal({ open, onClose, onEdit, caseData }) {
  if (!open || !caseData) return null;

  const petName =
    caseData.pet?.petName ||
    caseData.petId?.name ||
    caseData.petId?.petName ||
    caseData.petName ||
    "Patient";

  const ownerName =
    caseData.owner?.ownerName ||
    caseData.ownerId?.ownerName ||
    caseData.ownerName ||
    "Owner";

  const mobile =
    caseData.owner?.mobileNumber ||
    caseData.ownerId?.mobileNumber ||
    caseData.phoneNumber ||
    "N/A";

  const species =
    caseData.pet?.species || caseData.petId?.species || caseData.species || "Pet";

  const breed =
    caseData.pet?.breed || caseData.petId?.breed || caseData.breed || "N/A";

  const tokenNumber =
    caseData.tokenNumber ||
    caseData.token ||
    `TK-${(caseData._id || "").slice(-4) || "00"}`;

  const vitals = caseData.vitals || caseData.preConsultationId || {};
  const history = caseData.history || {};
  const obs = caseData.clinicalObservation || {};
  const diag = caseData.diagnosis || {};
  const lab = caseData.labRequisition || {};
  const treatment = caseData.treatment || {};
  const suggestion = caseData.suggestion || {};

  const handleDownload = () => {
    generateCaseReportPDF(caseData);
  };

  const formatVal = (val, suffix = "") => {
    if (val === undefined || val === null || String(val).trim() === "") return "-";
    return `${String(val).trim()}${suffix}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs p-3 md:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  {tokenNumber}
                </span>
                <span className="text-xs text-slate-300 font-medium">Completed Case Record</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-0.5">
                Case Closed: {petName} ({species} - {breed})
              </h3>
              <p className="text-xs text-slate-300">
                Owner: <span className="text-white font-semibold">{ownerName}</span> ({mobile})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center font-bold text-lg transition-all"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Summary Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Physical Vitals */}
          <div>
            <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-3 text-[11px] flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" /> 1. Recorded Physical Vitals
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-red-50/80 border border-red-100 rounded-2xl">
                <p className="text-[10px] font-bold text-red-700 uppercase">Body Temp</p>
                <p className="text-sm font-extrabold text-red-900 mt-0.5">
                  {formatVal(vitals.bodyTemperature || vitals.temperature, " °F")}
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/80 border border-rose-100 rounded-2xl">
                <p className="text-[10px] font-bold text-rose-700 uppercase">Heart Rate</p>
                <p className="text-sm font-extrabold text-rose-900 mt-0.5">
                  {formatVal(vitals.heartRate || vitals.pulseRate, " bpm")}
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl">
                <p className="text-[10px] font-bold text-blue-700 uppercase">Respiration Rate</p>
                <p className="text-sm font-extrabold text-blue-900 mt-0.5">
                  {formatVal(vitals.respiratoryRate, " bpm")}
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/80 border border-purple-100 rounded-2xl">
                <p className="text-[10px] font-bold text-purple-700 uppercase">Blood Pressure</p>
                <p className="text-sm font-extrabold text-purple-900 mt-0.5">
                  {formatVal(vitals.bloodPressure)}
                </p>
              </div>

              <div className="p-3.5 bg-sky-50/80 border border-sky-100 rounded-2xl">
                <p className="text-[10px] font-bold text-sky-700 uppercase">SpO₂ Oxygen</p>
                <p className="text-sm font-extrabold text-sky-900 mt-0.5">
                  {formatVal(vitals.spo2, "%")}
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/80 border border-amber-100 rounded-2xl">
                <p className="text-[10px] font-bold text-amber-700 uppercase">Body Weight</p>
                <p className="text-sm font-extrabold text-amber-900 mt-0.5">
                  {formatVal(vitals.bodyWeight || vitals.weight, " kg")}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-2xl">
                <p className="text-[10px] font-bold text-emerald-700 uppercase">BCS Score</p>
                <p className="text-sm font-extrabold text-emerald-900 mt-0.5">
                  {formatVal(vitals.bcs, "/5")}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Recorded By</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {formatVal(vitals.recordedBy || "Triage Staff")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Medical History (Doctor Review) */}
          <div>
            <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-3 text-[11px] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-orange-600" /> 2. Medical & Lifestyle History
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Diet Type</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(history.dietType)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Diet Frequency</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(history.dietFrequency, " meals/day")}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Water Intake</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(history.waterIntake)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Behavioral Habits</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(history.behaviour)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Exercise Level</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(history.exercise)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Vaccination Status</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(history.vaccinationStatus)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Known Allergies</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(history.allergies)}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Observations */}
          <div>
            <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-3 text-[11px] flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" /> 3. Systemic Clinical Examination
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Cardiovascular</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(obs.cardiovascular)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Respiratory</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(obs.respiratory)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Digestive</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(obs.digestive)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Musculoskeletal</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(obs.musculoskeletal)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Neurological</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(obs.neurological)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Urogenital</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(obs.urogenital)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Skin & Coat</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(obs.skin)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Eyes</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(obs.eyes)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Ears</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(obs.ears)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Lymph Nodes</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(obs.lymphNodes)}</p>
              </div>
            </div>
            {obs.doctorNotes && (
              <div className="mt-2 p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-slate-800">
                <p className="font-bold text-blue-900 text-xs uppercase mb-0.5">Doctor Examination Notes:</p>
                <p className="italic font-medium">{obs.doctorNotes}</p>
              </div>
            )}
          </div>

          {/* Section 4: Diagnosis & Lab Requisition */}
          <div>
            <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-3 text-[11px] flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" /> 4. Diagnosis & Lab Requisition
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1.5">
                <p className="font-bold text-purple-900 text-xs uppercase">Confirmed Diagnosis</p>
                <p className="text-slate-800 font-extrabold text-sm">{formatVal(diag.confirmedDiagnosis)}</p>
                <p className="text-slate-600">Provisional: {formatVal(diag.provisionalDiagnosis)}</p>
                <p className="text-slate-600">Differential: {formatVal(diag.differentialDiagnosis)}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <p className="font-bold text-slate-700 text-xs uppercase">Lab Tests & Samples Raised</p>
                <p className="text-slate-800 font-semibold">
                  Tests: {Array.isArray(lab.tests) ? lab.tests.join(", ") : formatVal(lab.tests)}
                </p>
                <p className="text-slate-600">
                  Sample Type: {Array.isArray(lab.sampleType) ? lab.sampleType.join(", ") : formatVal(lab.sampleType)}
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Prescriptions & Treatments Administered */}
          <div>
            <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-3 text-[11px] flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" /> 5. Administered Treatment & Prescriptions
            </h4>
            {Array.isArray(treatment.medicationsList) && treatment.medicationsList.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Drug Name</th>
                      <th className="p-2.5">Dose</th>
                      <th className="p-2.5">Route</th>
                      <th className="p-2.5">Frequency</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Instruction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {treatment.medicationsList.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{formatVal(m.drugName)}</td>
                        <td className="p-2.5">{formatVal(m.dose)}</td>
                        <td className="p-2.5">{formatVal(m.route)}</td>
                        <td className="p-2.5">{formatVal(m.frequency)}</td>
                        <td className="p-2.5">{formatVal(m.duration)}</td>
                        <td className="p-2.5 text-slate-600 italic">{formatVal(m.instruction)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
                Medicines Prescribed: {formatVal(treatment.medicines)}
              </div>
            )}

            {treatment.treatmentNotes && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 italic">
                <span className="font-bold text-slate-700 not-italic block mb-0.5">Treatment Notes:</span>
                {treatment.treatmentNotes}
              </div>
            )}
          </div>

          {/* Section 6: Discharge Advice & Suggestions */}
          <div>
            <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-3 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 6. Discharge Advice & Suggestions
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Prognosis</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(suggestion.prognosis)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Dietary Advice</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(suggestion.dietAdvice)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Activity Restriction</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(suggestion.activityRestriction)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Home Care</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(suggestion.homeCare)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Preventive Care</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(suggestion.preventiveCare)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Follow-Up Required / Date</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatVal(suggestion.followUpDate || treatment.followUp)}</p>
              </div>
            </div>
            {suggestion.finalNotes && (
              <div className="mt-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-slate-800">
                <p className="font-bold text-emerald-900 text-xs uppercase mb-0.5">Final Doctor Discharge Notes:</p>
                <p className="italic font-medium">{suggestion.finalNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Case</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer border-none"
            >
              Done
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
