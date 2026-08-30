import { useState, useRef, useEffect } from "react";
import { completePreConsultation } from "../../api/preConsultationApi";
import {
  VitalsForm,
  BriefHistoryForm,
  ProblemDescriptionForm,
  ObservationForm,
} from "../../components";
import { Check, AlertCircle, ArrowLeft, ArrowRight, Save, X, Stethoscope, PawPrint } from "lucide-react";
import toast from "react-hot-toast";

const formatToken = (val) => {
  if (val === null || val === undefined || val === "" || val === "—") return "—";
  const str = String(val).trim();
  if (str.toUpperCase().startsWith("TK-")) return str.toUpperCase();
  return `TK-${str}`;
};

const getLoggedInStaffName = () => {
  try {
    const directName =
      localStorage.getItem("userName") ||
      localStorage.getItem("staffName") ||
      localStorage.getItem("name") ||
      localStorage.getItem("fullName") ||
      sessionStorage.getItem("userName") ||
      sessionStorage.getItem("staffName") ||
      sessionStorage.getItem("name");
    if (directName && directName.trim()) return directName.trim();

    const userKeys = ["user", "userData", "userInfo", "staff", "staffData", "profile", "auth", "currentUser"];
    for (const key of userKeys) {
      const stored = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const name =
            parsed.name ||
            parsed.fullName ||
            parsed.personalInfo?.fullName ||
            parsed.staffName ||
            parsed.username ||
            parsed.nameEn ||
            parsed.user?.name ||
            parsed.user?.fullName;
          if (name && name.trim()) return name.trim();
        } catch (_) {}
      }
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token && token.includes(".")) {
      const base64Url = token.split(".")[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        const tokenName =
          decoded.name ||
          decoded.fullName ||
          decoded.staffName ||
          decoded.userName ||
          decoded.username ||
          decoded.user_name ||
          decoded.sub;
        if (tokenName && !tokenName.includes("@") && tokenName.length < 50) return tokenName.trim();
        if (decoded.email) {
          const nameFromEmail = decoded.email.split("@")[0].replace(/[._-]/g, " ");
          return nameFromEmail.replace(/\b\w/g, (l) => l.toUpperCase()).trim();
        }
      }
    }

    const email = localStorage.getItem("userEmail") || localStorage.getItem("email") || sessionStorage.getItem("userEmail");
    if (email) {
      const nameFromEmail = email.split("@")[0].replace(/[._-]/g, " ");
      return nameFromEmail.replace(/\b\w/g, (l) => l.toUpperCase()).trim();
    }

    const role = localStorage.getItem("role") || sessionStorage.getItem("role");
    if (role) {
      return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()).trim();
    }
  } catch (e) {
    console.warn("Failed to extract staff name:", e);
  }
  return "Duty Staff";
};

export default function PetRegistrationWizard({ onClose, petData, onCompleted }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const scrollRef = useRef(null);

  const steps = [
    { title: "Vitals", desc: "Physical measurements" },
    { title: "History", desc: "Medical background" },
    { title: "Problem", desc: "Chief complaint & severity" },
    { title: "Observation", desc: "Physical demeanour & notes" },
  ];

  const pc = petData?.preConsultationId || petData || {};

  const [formData, setFormData] = useState({
    // Vitals
    bodyTemperature: pc.bodyTemperature || petData?.vitals?.temp || "",
    bodyTemperatureUnit: pc.bodyTemperatureUnit || "F",
    heartRate: pc.heartRate || petData?.vitals?.heartRate || "",
    respiratoryRate: pc.respiratoryRate || petData?.vitals?.respRate || "",
    bloodPressure: {
      systolic:
        pc.bloodPressure?.systolic ||
        petData?.vitals?.bp?.systolic ||
        "",

      diastolic:
        pc.bloodPressure?.diastolic ||
        petData?.vitals?.bp?.diastolic ||
        "",
    },
    spo2: pc.spo2 || petData?.vitals?.spo2 || "",
    bodyWeight: pc.bodyWeight || petData?.vitals?.weight || "",
    bcs: pc.bcs || petData?.vitals?.bcs || "",
    recordedBy: pc.recordedBy || petData?.recordedBy || getLoggedInStaffName(),

    // History
    durationOfIllness: {
      value: pc.durationOfIllness?.value || "",
      unit: pc.durationOfIllness?.unit || "",
    },
    onset: pc.onset || "",
    progression: pc.progression || "",
    previousEpisodes: {
      hasPreviousEpisodes: pc.previousEpisodes?.hasPreviousEpisodes ?? false,
      description: pc.previousEpisodes?.description || "",
    },
    recentTravel: {
      hasTravel: pc.recentTravel?.hasTravel ?? false,
      description: pc.recentTravel?.description || "",
    },

    animalContact: {
      hasContact: pc.animalContact?.hasContact ?? false,
      description: pc.animalContact?.description || "",
    },

    // Problem
    primaryComplaint: "",
    associatedSymptoms: pc.associatedSymptoms || [],
    severity: "",

    // Observation
    generalDemeanour: pc.generalDemeanour || "",
    gaitAndPosture: pc.gaitAndPosture || "",
    visibleLesions: pc.visibleLesions || "",
    eyesAbnormality: pc.eyesAbnormality || "",
    noseAbnormality: pc.noseAbnormality || "",
    earAbnormality: pc.earAbnormality || "",
    skinCondition: pc.skinCondition || "",
    staffNotes: pc.staffNotes || "",
  });

  // Calculate overall percentage
  const progressPercent = Math.round((step / steps.length) * 100);

  // A field is "meaningful" if it's empty (optional fields are allowed to be
  // blank) or contains at least one letter - blocks entries that are only
  // digits/punctuation (e.g. "1234" or "----").
  const isMeaningfulText = (value) => {
    const trimmed = (value || "").trim();
    return !trimmed || /[a-zA-Z]/.test(trimmed);
  };

  const OBSERVATION_FIELDS = [
    ["gaitAndPosture", "Gait And Posture"],
    ["visibleLesions", "Visible Lesions / Abnormality"],
    ["eyesAbnormality", "Eyes Abnormality"],
    ["noseAbnormality", "Nose Abnormality"],
    ["earAbnormality", "Ear Abnormality"],
    ["skinCondition", "Skin Condition / Coat"],
    ["staffNotes", "Staff Notes"],
  ];

  // Validate step before advancing
  const validateCurrentStep = (targetStep) => {
    setValidationError("");

    // Step 1: Vitals Validation
    if (step === 1) {
      if (!formData.bodyTemperature && !formData.bodyWeight && !formData.heartRate) {
        const errorMsg = "Please record at least Body Temperature or Weight to continue.";
        setValidationError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    }

    // Step 3: Problem Description Validation
    if (step === 3 && targetStep > 3) {
      const primaryComplaint = (formData.primaryComplaint || "").trim();
      if (!primaryComplaint) {
        const errorMsg = "Please describe the Primary Complaint before proceeding.";
        setValidationError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
      if (!isMeaningfulText(primaryComplaint)) {
        const errorMsg = "Primary Complaint must contain meaningful text, not just numbers or symbols.";
        setValidationError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    }

    // Step 4: Observation Validation (checked when finishing the assessment)
    if (step === 4 && targetStep > 4) {
      for (const [field, label] of OBSERVATION_FIELDS) {
        if (!isMeaningfulText(formData[field])) {
          const errorMsg = `${label} must contain meaningful text, not just numbers or symbols.`;
          setValidationError(errorMsg);
          toast.error(errorMsg);
          return false;
        }
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep(step + 1)) {
      setStep((prev) => Math.min(prev + 1, steps.length));
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setValidationError("");
    setStep((prev) => Math.max(prev - 1, 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = async () => {
    if (!validateCurrentStep(5)) return;

    try {
      setIsSubmitting(true);
      await completePreConsultation({
        visitId: petData._id,
        preConsultationData: formData,
      });

      toast.success("Pre-consultation assessment saved successfully!");
      if (onCompleted) onCompleted();
      onClose();
    } catch (err) {
      console.error("Failed to complete pre-consultation:", err);
      toast.error(err.response?.data?.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const petName = petData?.pet?.petName || petData?.petName || "Patient";
  const species = petData?.pet?.species || petData?.species || "Pet";
  const ownerName = petData?.owner?.ownerName || petData?.ownerName || "Owner";
  const tokenNumber = formatToken(petData?.tokenNumber);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-xs p-0 md:p-6 overflow-hidden flex items-center justify-center">
      <div className="bg-white rounded-none md:rounded-3xl w-full h-screen md:h-[94vh] md:max-w-5xl mx-auto shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Patient Context */}
        <div className="bg-[#0C3D2E] text-white p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#F7931E] text-white flex items-center justify-center shrink-0">
              <Stethoscope className="w-[22px] h-[22px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] md:text-[22px] font-[900] tracking-tight text-white">Pre-Consultation Assessment</h2>
                <span className="bg-[#F7931E] text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {tokenNumber}
                </span>
              </div>
              <p className="text-emerald-100/80 text-xs md:text-sm mt-0.5 font-medium">
                Patient: <span className="text-white font-bold">{petName}</span> ({species}) • Owner: <span className="text-white font-bold">{ownerName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="self-end md:self-center w-9 h-9 rounded-[12px] bg-[#042B22] hover:bg-[#084D3E] text-white flex items-center justify-center font-bold transition-all border border-[#0A5243] cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Stepper Bar */}
        <div className="bg-[#D9E8E3]/20 border-b border-[#0C3D2E]/15 p-4 md:px-8 shrink-0">
          {/* Progress Percent Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-xs font-bold text-[#0C3D2E] mb-1.5">
              <span>Overall Progress</span>
              <span className="text-[#F7931E] font-mono">{progressPercent}% Completed</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F7931E] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {steps.map((item, index) => {
              const stepNumber = index + 1;
              const isDone = stepNumber < step;
              const isCurrent = stepNumber === step;

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (isDone || isCurrent || validateCurrentStep(stepNumber)) {
                      setStep(stepNumber);
                    }
                  }}
                  className={`flex flex-col items-center p-2 rounded-[14px] border transition-all text-center cursor-pointer ${
                    isCurrent
                      ? "bg-white border-[#F7931E] shadow-sm ring-2 ring-[#F7931E]/20"
                      : isDone
                      ? "bg-[#D9E8E3]/30 border-[#0C3D2E]/20 text-[#0C3D2E]"
                      : "bg-slate-100 border-slate-200 text-slate-400"
                  }`}
                >
                  <div
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-[10px] flex items-center justify-center font-bold text-xs md:text-sm mb-1 ${
                      isDone
                        ? "bg-[#0C3D2E] text-white"
                        : isCurrent
                        ? "bg-[#F7931E] text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : stepNumber}
                  </div>
                  <span className="text-[11px] md:text-xs font-bold truncate max-w-full text-[#0C3D2E]">
                    {item.title}
                  </span>
                  <span className="hidden md:block text-[10px] text-slate-500 truncate max-w-full font-normal">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3 text-red-700 text-xs md:text-sm font-semibold shrink-0 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
          <div className="bg-white rounded-[16px] p-5 md:p-8 border border-[#0C3D2E]/15 shadow-sm max-w-4xl mx-auto">
            {step === 1 && <VitalsForm formData={formData} setFormData={setFormData} />}
            {step === 2 && <BriefHistoryForm formData={formData} setFormData={setFormData} />}
            {step === 3 && <ProblemDescriptionForm formData={formData} setFormData={setFormData} />}
            {step === 4 && <ObservationForm formData={formData} setFormData={setFormData} />}
          </div>
        </div>

        {/* Navigation Footer Controls */}
        <div className="bg-white border-t border-[#0C3D2E]/15 p-4 md:px-8 flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[12px] font-bold text-xs md:text-sm transition-all cursor-pointer ${
              step === 1
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-white hover:bg-slate-50 text-[#0C3D2E] border border-[#0C3D2E]/15 shadow-xs"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-[12px] font-bold text-xs md:text-sm text-slate-600 hover:bg-slate-100 border border-slate-300 transition-all cursor-pointer"
            >
              Cancel
            </button>

            {step < steps.length ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 bg-[#F7931E] hover:bg-[#E08319] text-white px-6 py-2.5 rounded-[12px] font-[700] text-xs md:text-sm shadow-sm transition-all duration-200 hover:-translate-y-[2px] cursor-pointer border-none"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[#0C3D2E] hover:bg-[#042B22] text-white px-7 py-2.5 rounded-[12px] font-[700] text-xs md:text-sm shadow-sm transition-all duration-200 hover:-translate-y-[2px] cursor-pointer border-none"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? "Saving..." : "Finish & Submit Assessment"}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
