import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { showToast } from "../../../../../shared/components/toast";
import { calculateEndDate, getTodayDate } from "../../../../../shared/utils/calculateEndDate ";
import { getNextClinicCode } from "../../../api/clinicApi";

import ClinicForm from "./ClinicForm";
import Stepper from "../Stepper";

const tabs = [
    ["identity", "Clinic Identity"],
    ["address", "Address & Location"],
    ["licenses", "Registrations & Licenses"],
    ["tax", "Tax & Banking"],
    ["admin", "Admin Info"],
    ["plan", "Plan & Features"],
];

const STATUS_OPTIONS = ["Submitted", "Pending", "Approved", "Rejected"];

/**
 * Custom Status Dropdown Component (Pill Style)
 * Bypasses native browser select element to eliminate OS grey highlight boxes.
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

            {/* Pure CSS Dropdown Popup - Single Light-Green Tone */}
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

/**
 * Reusable Single-Color Custom Dropdown Component for Forms
 */
export function CustomSelect({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = "Select option...",
    required = false,
}) {
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
        onChange({ target: { name, value: option } });
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative w-full">
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-white cursor-pointer shadow-xs ${
                    isOpen
                        ? "border-[#0C3D2E] ring-1 ring-[#0C3D2E]"
                        : "border-gray-200 hover:border-[#0C3D2E]/50 text-gray-800"
                }`}
            >
                <span className={value ? "text-[#0C3D2E] font-bold" : "text-gray-400"}>
                    {value || placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#0C3D2E]" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-1.5 animate-in fade-in-50 zoom-in-95 duration-100">
                    {options.map((option) => {
                        const isSelected = option === value;
                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                    isSelected
                                        ? "bg-[#0C3D2E] text-white"
                                        : "text-gray-700 hover:bg-[#0C3D2E]/10 hover:text-[#0C3D2E]"
                                }`}
                            >
                                <span>{option}</span>
                                {isSelected && <Check size={14} className="text-white" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function ClinicModal({ onClose }) {
    const [activeTab, setActiveTab] = useState("identity");
    const [status, setStatus] = useState("Pending");

    const today = getTodayDate();

    const [form, setForm] = useState({
        clinicCode: "",
        clinicName: "",
        facilityType: "",
        year: "",
        email: "",
        phone: "",
        altPhone: "",
        website: "",
        address1: "",
        address2: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        latitude: "",
        longitude: "",
        gst: "",
        pan: "",
        bankName: "",
        accountNumber: "",
        ifsc: "",
        adminName: "",
        adminPhone: "",
        adminPhoneVerifiedNumber: "",
        adminEmail: "",
        plan: "Basic",

        billing: "Monthly",
        startDate: today,
        endDate: calculateEndDate(today, "Monthly"),

        trialDays: 0,
        discountCode: "",
        notes: "",
        customPlanPrice: "",

        maxStaff: "",
        maxDoctors: "",
        maxPets: "",
        storageLimit: "",

        labModule: false,
        groomingModule: false,
        kennelModule: false,
        pharmacyModule: false,
        inventoryModule: false,
        telemedicineModule: false,
        apiAccess: false,
        whiteLabel: false,

        serviceAreas: [""],

        vetReg: "",
        stateCouncil: "",
        expiry: "",
        tradeLicense: "",
        drugLicense: "",

        designation: "",
        govtIdType: "",
        govtIdNumber: "",

        logo: null,
        vetCert: null,
        tradeDoc: null,
        drugDoc: null,
        cheque: null,
        idDoc: null,
        profile: null,
    });

    useEffect(() => {
        let cancelled = false;

        getNextClinicCode()
            .then((res) => {
                const clinicCode = res?.data?.clinicCode;
                if (!cancelled && clinicCode) {
                    setForm((prev) => ({ ...prev, clinicCode }));
                }
            })
            .catch(() => {
                // Non-critical - the real code is still assigned on save
                // even if this preview fetch fails.
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => {
            const updated = {
                ...prev,
                [name]: type === "checkbox"
                    ? checked
                    : value,
            };

            if (name === "billing" || name === "startDate") {
                updated.endDate = calculateEndDate(
                    name === "startDate"
                        ? value
                        : updated.startDate,

                    name === "billing"
                        ? value
                        : updated.billing
                );
            }

            return updated;
        });
    };

    const validateTab = () => {
        switch (activeTab) {
            case "identity":
                return (
                    form.clinicName &&
                    form.facilityType &&
                    form.email &&
                    form.phone &&
                    form.logo
                );

            case "address":
                return (
                    form.address1 &&
                    form.city &&
                    form.district &&
                    form.state &&
                    form.pincode &&
                    /^\d{6}$/.test(form.pincode) &&
                    (
                        !form.serviceAreas ||
                        form.serviceAreas.filter(a => a.trim() !== "").length >= 0
                    )
                );

            case "licenses":
                return Boolean(
                    (form.vetReg && form.vetCert) ||
                    (form.tradeLicense && form.tradeDoc) ||
                    (form.drugLicense && form.drugDoc)
                );

            case "tax":
                return (
                    form.gst &&
                    form.pan &&
                    form.bankName &&
                    form.accountNumber &&
                    form.ifsc &&
                    form.cheque
                );

            case "admin":
                return (
                    form.adminName &&
                    form.designation &&
                    form.adminPhone &&
                    form.adminPhoneVerifiedNumber === form.adminPhone &&
                    form.adminEmail &&
                    form.govtIdNumber &&
                    form.idDoc &&
                    form.profile
                );

            case "plan":
                if (form.plan === "Custom") {
                    return (
                        form.plan &&
                        form.billing &&
                        form.startDate &&
                        form.maxStaff &&
                        form.maxDoctors &&
                        form.maxPets &&
                        form.storageLimit
                    );
                }

                return (
                    form.plan &&
                    form.billing &&
                    form.startDate
                );

            default:
                return true;
        }
    };

    const isFormComplete = () => {
        const requiredTabs = [
            "identity",
            "address",
            "licenses",
            "tax",
            "admin",
            "plan",
        ];

        for (const tab of requiredTabs) {
            switch (tab) {
                case "identity":
                    if (
                        !form.clinicName ||
                        !form.facilityType ||
                        !form.email ||
                        !form.phone ||
                        !form.logo
                    ) {
                        return false;
                    }
                    break;

                case "address":
                    if (
                        !form.address1 ||
                        !form.city ||
                        !form.district ||
                        !form.state ||
                        !form.pincode
                    ) {
                        return false;
                    }
                    break;

                case "licenses":
                    if (
                        !((form.vetReg && form.vetCert) ||
                            (form.tradeLicense && form.tradeDoc) ||
                            (form.drugLicense && form.drugDoc))
                    ) {
                        return false;
                    }
                    break;

                case "tax":
                    if (
                        !form.gst ||
                        !form.pan ||
                        !form.bankName ||
                        !form.accountNumber ||
                        !form.ifsc ||
                        !form.cheque
                    ) {
                        return false;
                    }
                    break;

                case "admin":
                    if (
                        !form.adminName ||
                        !form.designation ||
                        !form.adminPhone ||
                        form.adminPhoneVerifiedNumber !== form.adminPhone ||
                        !form.adminEmail ||
                        !form.govtIdNumber ||
                        !form.idDoc ||
                        !form.profile
                    ) {
                        return false;
                    }
                    break;

                case "plan":
                    if (form.plan === "Custom") {
                        if (
                            !form.maxStaff ||
                            !form.maxDoctors ||
                            !form.maxPets ||
                            !form.storageLimit
                        ) {
                            return false;
                        }
                    }
                    break;
            }
        }

        return true;
    };

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        showToast({
            type: "info",
            title: "Status Updated",
            description: `Clinic status set to ${newStatus}.`,
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center px-2 py-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-4">
            <div className="bg-white w-full sm:w-[95%] h-[calc(100svh-1rem)] max-h-[calc(100svh-1rem)] sm:h-[95vh] sm:max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">

                {/* HEADER WITH MATCHING MINT GREEN BG */}
                <div className="flex items-start justify-between gap-3 px-4 sm:px-8 py-4 sm:py-5 bg-[#EEF6F3] border-b border-[#0C3D2E]/15">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <h2 className="text-xl sm:text-3xl font-bold text-[#0C3D2E] tracking-tight">
                                Add Clinic
                            </h2>
                            <span className="px-3 py-0.5 rounded-full text-xs font-bold border border-[#0C3D2E]/20 bg-[#D9E8E3] text-[#0C3D2E]">
                                {status}
                            </span>
                        </div>
                        <p className="text-[#0C3D2E]/70 text-xs sm:text-sm mt-0.5 font-semibold">
                            Register a new clinic/hospital in the system.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full hover:bg-[#0C3D2E]/10 text-gray-400 hover:text-[#0C3D2E] flex items-center justify-center transition-colors font-bold cursor-pointer"
                        aria-label="Close modal"
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
                    <ClinicForm
                        activeTab={activeTab}
                        form={{ ...form, status }}
                        setForm={setForm}
                        handleChange={handleChange}
                        canSave={
                            activeTab === "plan" &&
                            isFormComplete()
                        }
                        validateTab={validateTab}
                        setActiveTab={setActiveTab}
                        tabs={tabs}
                        onClose={onClose}
                    />
                </div>
            </div>
        </div>
    );
}
