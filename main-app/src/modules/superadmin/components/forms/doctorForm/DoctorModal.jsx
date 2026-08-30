import { useEffect, useMemo, useState, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

import DoctorForm from "./DoctorForm";
import Stepper from "../Stepper";
import { getPlans } from "../../../api/planApi";
import { showToast } from "../../../../../shared/components/toast";

const SOLO_DOCTOR_PLAN_NAMES = new Set(["Solo Basic", "Solo Pro"]);
const DEFAULT_SOLO_DOCTOR_PLAN_OPTIONS = ["Solo Basic", "Solo Pro"];

const resolvePlanType = (plan) => {
    if (plan?.planType === "Solo Doctor") return "Solo Doctor";
    if (SOLO_DOCTOR_PLAN_NAMES.has(plan?.subscriptionPlan)) return "Solo Doctor";
    return "Clinic";
};

const tabs = [
    ["personal", "Personal Information"],
    ["qualification", "Qualifications"],
    ["vet", "Vet Council"],
    ["practice", "Practice Details"],
    ["bank", "Banking & Plan"],
];

const STATUS_OPTIONS = ["Submitted", "Pending", "Approved", "Rejected"];

/**
 * Custom Status Dropdown Component (Pill Style)
 * Bypasses native browser select elements to eliminate OS grey highlight boxes.
 */
export function StatusDropdown({ value = "Pending", onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange?.(option);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative inline-block text-left min-w-[130px]">
            {/* Main Pill Button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 bg-[#D9E8E3] hover:bg-[#c8ded8] text-[#0C3D2E] font-bold text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer border border-[#0C3D2E]/10 shadow-2xs"
            >
                <span>{value}</span>
                <ChevronDown
                    size={14}
                    className={`text-[#0C3D2E] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* Dropdown Popup */}
            {isOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 bg-[#D9E8E3] border border-[#0C3D2E]/15 rounded-2xl shadow-xl p-1 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
                    <div className="flex flex-col gap-0.5">
                        {STATUS_OPTIONS.map((option) => {
                            const isSelected = option === value;
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isSelected
                                            ? "bg-[#0C3D2E] text-white"
                                            : "text-[#0C3D2E] hover:bg-[#0C3D2E]/10"
                                    }`}
                                >
                                    <span>{option}</span>
                                    {isSelected && <Check size={13} className="text-white" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

const toDateInputValue = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().slice(0, 10);
};

const buildQualifications = (doctor) => {
    const qualifications = Array.isArray(doctor?.qualifications) ? doctor.qualifications : [];
    const degreeCertificates = Array.isArray(doctor?.degreeCertificates) ? doctor.degreeCertificates : [];

    if (!qualifications.length) {
        return [{ degree: "", institution: "", year: "" }];
    }

    // degreeCertificates is stored as a flat array parallel to qualifications
    // (index-matched), not nested per-row - without this, the previously
    // uploaded certificate never made it back into the Upload field on
    // edit, so it looked like it had vanished.
    return qualifications.map((qualification, index) => ({
        degree: qualification?.degree || "",
        institution: qualification?.institution || "",
        year: String(qualification?.year || ""),
        certificate: degreeCertificates[index] || null,
    }));
};

const buildFormState = (doctor) => ({
    fullName: doctor?.fullName || doctor?.name || "",
    gender: doctor?.gender || "",
    dob: toDateInputValue(doctor?.dob || doctor?.dateOfBirth),
    mobile: doctor?.mobile || "",
    email: doctor?.email || "",
    languages: Array.isArray(doctor?.languages) ? doctor.languages : [],
    address: doctor?.address || "",
    city: doctor?.city || "",
    state: doctor?.state || "",
    pincode: doctor?.pincode || "",
    govtIdType: doctor?.govtIdType || "",
    govtIdNumber: doctor?.govtIdNumber || "",
    govtIdDocument: doctor?.govtIdDocument || null,
    degreeCertificates: Array.isArray(doctor?.degreeCertificates) ? doctor.degreeCertificates[0] || null : doctor?.degreeCertificates || null,
    registrationCertificate: doctor?.registrationCertificate || null,
    profilePhoto: doctor?.profilePhoto || null,
    experience: doctor?.experienceValue || doctor?.experience || "",
    specializations: Array.isArray(doctor?.specializations)
        ? doctor.specializations
        : doctor?.specialization
            ? [doctor.specialization]
            : [],
    vetCouncilRegistrationNumber: doctor?.vetCouncilRegistrationNumber || "",
    stateVetCouncil: doctor?.stateVetCouncil || "",
    certificateValidityDate: toDateInputValue(doctor?.certificateValidityDate || doctor?.certificateValidityRaw),
    isRenewable: Boolean(doctor?.isRenewable),
    practiceType: doctor?.practiceType || "",
    consultationFee: doctor?.consultationFee || "",
    emergencyAvailable: Boolean(doctor?.emergencyAvailable),
    serviceAreas: Array.isArray(doctor?.serviceAreas) ? doctor.serviceAreas.join(", ") : doctor?.serviceAreasText || "",
    gstPan: doctor?.gstPan || "",
    accountName: doctor?.accountName || doctor?.bankDetails?.accountName || "",
    accountNumber: doctor?.accountNumber || doctor?.bankDetails?.accountNumber || "",
    ifsc: doctor?.ifsc || doctor?.bankDetails?.ifsc || "",
    bankName: doctor?.bankName || doctor?.bankDetails?.bankName || "",
    branch: doctor?.branch || doctor?.bankDetails?.branch || "",
    plan: doctor?.plan || "",
});

export default function DoctorModal({ onClose, onCreated, onSaved, mode = "create", doctor = null }) {
    const [activeTab, setActiveTab] = useState("personal");
    const [status, setStatus] = useState(doctor?.status || "Pending");
    const [planOptions, setPlanOptions] = useState([]);
    const [plansLoaded, setPlansLoaded] = useState(false);

    const [form, setForm] = useState(() => buildFormState(doctor));

    const [qualifications, setQualifications] = useState([
        { degree: "", institution: "", year: "" },
    ]);

    const availablePlanOptions = planOptions.length
        ? planOptions
        : DEFAULT_SOLO_DOCTOR_PLAN_OPTIONS;
    const planChoices = useMemo(() => {
        if (doctor?.plan && !availablePlanOptions.includes(doctor.plan)) {
            return [doctor.plan, ...availablePlanOptions];
        }

        return availablePlanOptions;
    }, [availablePlanOptions, doctor?.plan]);

    useEffect(() => {
        let active = true;

        const loadPlans = async () => {
            try {
                const response = await getPlans();
                const soloDoctorPlans = (Array.isArray(response.data) ? response.data : [])
                    .filter((plan) => resolvePlanType(plan) === "Solo Doctor" && (!plan.status || plan.status === "Active"))
                    .map((plan) => plan.subscriptionPlan)
                    .filter(Boolean);

                if (active) {
                    setPlanOptions([...new Set(soloDoctorPlans)]);
                }
            } catch (error) {
                if (active) {
                    setPlanOptions([]);
                }
            } finally {
                if (active) {
                    setPlansLoaded(true);
                }
            }
        };

        loadPlans();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!plansLoaded) return;

        const nextPlan = planChoices.includes(form.plan)
            ? form.plan
            : planChoices[0];

        if (nextPlan && nextPlan !== form.plan) {
            setForm((previous) => ({
                ...previous,
                plan: nextPlan,
            }));
        }
    }, [form.plan, planChoices, plansLoaded]);

    useEffect(() => {
        setActiveTab("personal");
        setForm(buildFormState(doctor));
        setQualifications(buildQualifications(doctor));
        setStatus(doctor?.status || "Pending");
    }, [doctor, mode]);

    const title = mode === "edit" ? "Edit Veterinarian" : "Add Veterinarian";
    const description = mode === "edit"
        ? "Update the veterinarian profile and save the changes."
        : "Complete the details to register a new veterinarian.";

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        showToast({
            type: "info",
            title: "Status Updated",
            description: `Veterinarian status set to ${newStatus}.`,
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center px-2 py-[max(2rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-4">
            <div className="bg-white w-full sm:w-[95%] h-[calc(100svh-3.25rem)] max-h-[calc(100svh-3.25rem)] sm:h-[95vh] sm:max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">

                {/* HEADER WITH MATCHING MINT GREEN BG */}
                <div className="flex items-start justify-between gap-3 px-4 sm:px-8 py-4 sm:py-5 bg-[#EEF6F3] border-b border-[#0C3D2E]/15">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <h2 className="text-xl sm:text-3xl font-bold text-[#0C3D2E] tracking-tight">
                                {title}
                            </h2>
                            <span className="px-3 py-0.5 rounded-full text-xs font-bold border border-[#0C3D2E]/20 bg-[#D9E8E3] text-[#0C3D2E]">
                                {status}
                            </span>
                        </div>
                        <p className="text-[#0C3D2E]/70 text-xs sm:text-sm mt-0.5 font-semibold">
                            {description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full hover:bg-[#0C3D2E]/10 text-gray-400 hover:text-[#0C3D2E] flex items-center justify-center transition-colors font-bold cursor-pointer"
                        aria-label="Close veterinarian onboarding"
                    >
                        ✕
                    </button>
                </div>

                {/* WORKFLOW STATUS BAR WITH MATCHING MINT GREEN BG */}
                <div className="bg-[#EEF6F3] px-4 sm:px-8 py-3 border-b border-[#0C3D2E]/15 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0C3D2E]">
                        Workflow Status:
                    </span>

                    <div className="flex items-center gap-2">
                        <StatusDropdown
                            value={status}
                            onChange={handleStatusChange}
                        />
                    </div>
                </div>

                {/* STEPPER CONTAINER WITH MATCHING MINT GREEN BG */}
                <div className="bg-[#EEF6F3] border-b border-[#0C3D2E]/15">
                    <Stepper
                        tabs={tabs}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </div>

                {/* FORM */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 pt-2 pb-4 bg-slate-50/50">
                    <DoctorForm
                        activeTab={activeTab}
                        tabs={tabs}
                        setActiveTab={setActiveTab}
                        form={{ ...form, status }}
                        setForm={setForm}
                        qualifications={qualifications}
                        setQualifications={setQualifications}
                        planOptions={planChoices}
                        onClose={onClose}
                        onCreated={onCreated}
                        onSaved={onSaved}
                        mode={mode}
                        doctorId={doctor?.id}
                    />
                </div>
            </div>
        </div>
    );
}
