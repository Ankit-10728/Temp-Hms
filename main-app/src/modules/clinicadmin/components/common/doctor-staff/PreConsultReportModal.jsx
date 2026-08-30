import { Activity, Heart, Thermometer, Weight, Wind, ShieldAlert, CheckCircle2, User, Clock, FileText } from "lucide-react";

export default function PreConsultationReportModal({
  open,
  onClose,
  data,
}) {
  if (!open) return null;

  const tokenNumber = data?.visitId?.tokenNumber || data?.tokenNumber || "--";
  const petName = data?.petId?.name || data?.petId?.petName || data?.petName || "Patient";
  const ownerName = data?.ownerId?.ownerName || data?.ownerName || "Owner";
  const recordedBy = data?.recordedBy || "Staff";
  const severity = data?.severity || "NORMAL";
  const associatedSymptoms = Array.isArray(data?.associatedSymptoms)
    ? data.associatedSymptoms.filter(Boolean).join(", ")
    : typeof data?.associatedSymptoms === "string"
      ? data.associatedSymptoms
      : "-";
  let bpDisplay = "-"; // Default if no data
  if (data?.bloodPressure && typeof data.bloodPressure === 'object') {
    const s = data.bloodPressure.systolic || '--';
    const d = data.bloodPressure.diastolic || '--';
    bpDisplay = `${s}/${d} mmHg`;
  }
  const getSeverityBadge = (sev) => {
    const s = (sev || "").toUpperCase();
    if (s.includes("SEVERE") || s.includes("HIGH") || s.includes("CRITICAL")) {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-200 inline-flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          Severe / Urgent
        </span>
      );
    }
    if (s.includes("MODERATE")) {
      return (
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
          Moderate Observation
        </span>
      );
    }
    return (
      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Normal Observation
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-[9999] p-2 md:p-6">
      <div className="bg-white w-[1100px] max-w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Dark Header Banner */}
        <div className="bg-slate-900 text-white px-6 md:px-8 py-5 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Pre-Consultation Clinical Report
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-3">
              <span>{petName} Vitals & Assessment</span>
              <span className="bg-orange-500/30 text-orange-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border border-orange-500/40">
                Token #{tokenNumber}
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center font-bold text-lg transition-all"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Patient Overview Card */}
          <div className="bg-gradient-to-r from-orange-50/80 via-white to-slate-50 border border-orange-100 rounded-3xl p-5 md:p-6 shadow-2xs space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Token ID</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5 font-mono">{tokenNumber}</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Patient Name</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{petName}</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Species & Breed</p>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{data?.petId?.species || data?.species || "Dog"} • {data?.petId?.breed || data?.breed || "N/A"}</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Gender & Age</p>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{data?.petId?.gender || data?.gender || "N/A"} • {data?.petId?.age ? `${data.petId.age} yrs` : (data?.age ? `${data.age} yrs` : "N/A")}</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Owner Name & Phone</p>
                <p className="font-semibold text-slate-800 text-xs mt-0.5">{ownerName}</p>
                <p className="font-mono text-slate-500 text-[11px]">{data?.ownerId?.mobileNumber || data?.mobileNumber || "N/A"}</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Severity Level</p>
                <div className="mt-1">{getSeverityBadge(severity)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs border-t border-orange-100/80 pt-3">
              <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Microchip RFID Tag / Color</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{data?.petId?.rfid || data?.petId?.rfidTag || data?.rfid || "Not Provided"} • {data?.petId?.color || data?.color || "N/A"}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Identification Area & Marks</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{data?.petId?.identificationArea || data?.petId?.identificationMarks || data?.identificationMarks || "Not Provided"}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                <span className="text-[10px] font-bold text-orange-600 uppercase block">Reception Primary Reason & Complaint</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{data?.visitId?.primaryReason || data?.primaryReason || "General Checkup"} - <span className="italic font-normal">{data?.visitId?.chiefComplaint || data?.primaryComplaint || "Triage Assessment"}</span></span>
              </div>
            </div>
          </div>

          {/* Vitals Grid */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              Recorded Patient Vitals
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <VitalCard
                label="Body Temperature"
                value={data?.bodyTemperature ? `${data.bodyTemperature} °F` : "-"}
                icon="🌡️"
                color="bg-red-50 text-red-700 border-red-100"
              />

              <VitalCard
                label="Heart Rate"
                value={data?.heartRate ? `${data.heartRate} bpm` : "-"}
                icon="💓"
                color="bg-rose-50 text-rose-700 border-rose-100"
              />

              <VitalCard
                label="Respiratory Rate"
                value={data?.respiratoryRate ? `${data.respiratoryRate} bpm` : "-"}
                icon="🫁"
                color="bg-blue-50 text-blue-700 border-blue-100"
              />

              <VitalCard
                label="Blood Pressure"
                value={bpDisplay} // <--- Use the variable we created in Step 1
                icon="🩺"
                color="bg-purple-50 text-purple-700 border-purple-100"
              />

              <VitalCard
                label="SpO₂ Oxygen"
                value={data?.spo2 ? `${data.spo2}%` : "-"}
                icon="💨"
                color="bg-sky-50 text-sky-700 border-sky-100"
              />

              <VitalCard
                label="Body Weight"
                value={data?.bodyWeight ? `${data.bodyWeight} kg` : "-"}
                icon="⚖️"
                color="bg-amber-50 text-amber-700 border-amber-100"
              />

              <VitalCard
                label="BCS Score"
                value={data?.bcs || "-"}
                icon="📊"
                color="bg-emerald-50 text-emerald-700 border-emerald-100"
              />

              <VitalCard
                label="Recorded At"
                value={data?.vitalsRecordedAt ? new Date(data.vitalsRecordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                icon="🕒"
                color="bg-slate-50 text-slate-700 border-slate-100"
              />
            </div>
          </div>

          {/* History Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Illness Timeline & Background History
            </h3>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <DetailBox label="Illness Duration" value={`${data?.durationOfIllness?.value || "-"} ${data?.durationOfIllness?.unit || ""}`} />
              <DetailBox label="Onset Speed" value={data?.onset} />
              <DetailBox label="Progression Pattern" value={data?.progression} />
              <DetailBox label="Previous Episodes" value={data?.previousEpisodes?.hasPreviousEpisodes ? "Yes" : "No"} />
              <DetailBox label="Contact with Other Animals" value={data?.animalContact ? "Yes" : "No"} />
              <DetailBox label="Recent Travel History" value={data?.recentTravel ? "Yes" : "No"} />
            </div>

            {data?.previousEpisodes?.description && (
              <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs">
                <p className="font-bold text-slate-700 mb-1">Previous Episode Description:</p>
                <p className="text-slate-600 italic">{data.previousEpisodes.description}</p>
              </div>
            )}
          </div>

          {/* Clinical Symptoms & Staff Notes */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              Triage Assessment & Observations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <SectionBox title="Primary Complaint" value={data?.primaryComplaint} highlight />
              <SectionBox title="General Demeanour" value={data?.generalDemeanour} />
              <SectionBox title="Associated Symptoms" value={associatedSymptoms} />
              <SectionBox title="Gait & Posture" value={data?.gaitAndPosture} />
              <SectionBox title="Visible Lesions" value={data?.visibleLesions} />
              <SectionBox title="Staff Triage Notes" value={data?.staffNotes} highlight />
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-4 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            Close Vitals Report
          </button>
        </div>
      </div>
    </div>
  );
}

function VitalCard({ label, value, icon, color }) {
  return (
    <div className={`p-4 rounded-2xl border ${color} flex items-center justify-between`}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">{label}</p>
        <p className="text-lg font-extrabold mt-1 tracking-tight">{value}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className="font-bold text-slate-800 mt-0.5">{value || "-"}</p>
    </div>
  );
}

function SectionBox({ title, value, highlight }) {
  return (
    <div className={`p-4 rounded-2xl border ${highlight ? "bg-orange-50/50 border-orange-200/80" : "bg-slate-50 border-slate-200/70"}`}>
      <p className="font-bold text-slate-800 mb-1">{title}</p>
      <p className="text-slate-600">{value || "-"}</p>
    </div>
  );
}
