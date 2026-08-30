import { useCallback, useEffect, useState, useRef } from "react";
import {
    ClipboardCheck,
    Eye,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    Pencil,
    Trash2,
    X,
    ChevronDown,
    Check,
} from "lucide-react";
import { showToast } from "../../../shared/components/toast";
import { calculateEndDate, getTodayDate } from "../../../shared/utils/calculateEndDate ";
import { deleteClinic, getClinics, updateClinic, updateClinicActivity, updateClinicVerification, uploadClinicDocuments } from "../api/clinicApi";
import ClinicForm from "./forms/clinicForm/ClinicForm";
import Stepper from "./forms/Stepper";

const tabs = [
    ["identity", "Clinic Identity"],
    ["address", "Address & Location"],
    ["licenses", "Registrations & Licenses"],
    ["tax", "Tax & Banking"],
    ["admin", "Admin Info"],
    ["plan", "Plan & Features"],
];

const tableGrid =
    "md:grid-cols-[minmax(0,1.2fr)_minmax(72px,.65fr)_minmax(0,1.35fr)_minmax(0,1.25fr)_minmax(74px,.65fr)_minmax(120px,.8fr)_minmax(140px,.85fr)]";

// Status configuration for 4 distinct visual states
const STATUS_CONFIG = {
    SUBMITTED: {
        label: "Submitted",
        pill: "bg-[#FFF4E5] text-[#F7931E] border-[#F7931E]/30 hover:bg-[#ffe3cc]",
        icon: "text-[#F7931E]",
        activeItem: "bg-[#F7931E] text-white",
        hoverItem: "text-[#F7931E] hover:bg-[#FFF4E5]",
    },
    APPROVED: {
        label: "Approved",
        pill: "bg-[#D9E8E3] text-[#0C3D2E] border-[#0C3D2E]/20 hover:bg-[#c8ded8]",
        icon: "text-[#0C3D2E]",
        activeItem: "bg-[#0C3D2E] text-white",
        hoverItem: "text-[#0C3D2E] hover:bg-[#D9E8E3]/50",
    },
    REJECTED: {
        label: "Rejected",
        pill: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200",
        icon: "text-rose-700",
        activeItem: "bg-rose-600 text-white",
        hoverItem: "text-rose-700 hover:bg-rose-50",
    },
    UNDER_REVIEW: {
        label: "Pending",
        pill: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
        icon: "text-slate-600",
        activeItem: "bg-slate-700 text-white",
        hoverItem: "text-slate-700 hover:bg-slate-100",
    },
};

const clinicStatusOptions = [
    ["SUBMITTED", "Submitted"],
    ["APPROVED", "Approved"],
    ["UNDER_REVIEW", "Pending"],
    ["REJECTED", "Rejected"],
];

/**
 * 4-Color Status Dropdown Component with Smart Upward/Downward Positioning
 */
function TableStatusDropdown({ value, onChange, disabled, isOpenRow, setOpenRow,}) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const dropdownRef = useRef(null);
    

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setOpenRow(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => {
        if (disabled) return;
        
        if (!isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // If space below is less than 170px, open upwards
            setOpenUpward(spaceBelow < 170);
        }
        setIsOpen((prev) => {
            const next = !prev;
            setOpenRow(next);
            return next;
        });
    };

    const currentKey = STATUS_CONFIG[value] ? value : "SUBMITTED";
    const currentTheme = STATUS_CONFIG[currentKey];

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
            <div
                ref={dropdownRef}
                className="relative z-[9999] w-full min-w-[115px]"
            >
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={toggleOpen}
                className={`w-full flex items-center justify-between gap-1.5 font-bold text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer border shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed ${currentTheme.pill}`}
            >
                <span className="truncate">{currentTheme.label}</span>
                <ChevronDown
                    size={14}
                    className={`shrink-0 transition-transform duration-200 ${currentTheme.icon} ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* Smart Dropdown Options Popup */}
            {isOpen && (
                <div
                    className={`absolute left-0 right-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl p-1 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100 ${
                        openUpward ? "bottom-full mb-1" : "top-full mt-1"
                    }`}
                >
                    <div className="flex flex-col gap-0.5">
                        {clinicStatusOptions.map(([optVal, optLabel]) => {
                            const isSelected = optVal === value;
                            const optTheme = STATUS_CONFIG[optVal] || STATUS_CONFIG.SUBMITTED;

                            return (
                                <button
                                    key={optVal}
                                    type="button"
                                    onClick={() => handleSelect(optVal)}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isSelected
                                            ? optTheme.activeItem
                                            : optTheme.hoverItem
                                    }`}
                                >
                                    <span className="truncate">{optLabel}</span>
                                    {isSelected && <Check size={13} className="shrink-0 ml-1 text-white" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

const getClinicType = (clinic) =>
    clinic.facilityType ||
    clinic.type ||
    clinic.clinicType ||
    clinic.facility_type ||
    clinic.clinicDetails?.facilityType ||
    "";

const getContactEmail = (clinic) =>
    clinic.contactEmail || clinic.email || clinic.adminEmail || clinic.adminDetails?.emailAddress || "N/A";

const getDisplayStatus = (clinic) => {
    const status = clinic.verificationStatus || clinic.subscriptionStatus || "Unknown";
    return status === "UNDER_REVIEW" ? "Pending" : status;
};

const getClinicDisplayId = (clinic) =>
    clinic?.clinicCode || (clinic?._id ? `CLINIC-${clinic._id.slice(-6).toUpperCase()}` : "N/A");

// Safely format files and URLs for display
const filePlaceholder = (file, fileName) => {
    if (!file) return null;
    if (typeof file === "string") {
        const nameFromUrl = file.split('/').pop()?.split('?')[0];
        return { name: fileName || nameFromUrl || "Uploaded document", type: "application/pdf", url: file };
    }
    return file;
};

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const toDateInputValue = (value) => {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const valueOrDash = (value) => {
    if (Array.isArray(value)) {
        return value.length ? value.join(", ") : "-";
    }
    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }
    if (value && typeof value === "object" && value.name) {
        return value.name;
    }
    if (value === undefined || value === null || String(value).trim() === "") {
        return "-";
    }
    return value;
};

const DetailSection = ({ title, children }) => (
    <section className="rounded-2xl border border-gray-100 bg-slate-50/50 p-4 sm:p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C3D2E]">
            {title}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {children}
        </div>
    </section>
);

const DetailField = ({ label, value, wide = false }) => {
    const isFile = value && typeof value === 'object' && value.name;
    const displayValue = isFile ? value.name : valueOrDash(value);
    const url = isFile ? value.url : null;

    return (
        <div className={wide ? "sm:col-span-2" : ""}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {label}
            </p>
            {url && (url.startsWith('http') || url.startsWith('/')) ? (
                <a href={url} target="_blank" rel="noreferrer" className="mt-1 text-sm font-semibold text-[#F7931E] hover:text-[#e08319] hover:underline break-words block">
                    {displayValue}
                </a>
            ) : (
                <p className="mt-1 text-sm font-semibold text-gray-800 break-words">
                    {displayValue}
                </p>
            )}
        </div>
    );
};

const ClinicDocuments = ({ form }) => {
    const documents = [
        ["Clinic logo", form.logo],
        ["Veterinary council certificate", form.vetCert],
        ["Trade license", form.tradeDoc],
        ["Drug license", form.drugDoc],
        ["Cancelled cheque", form.cheque],
        ["Government ID", form.idDoc],
        ["Admin profile", form.profile],
    ].filter(([, document]) => document?.url);

    return (
        <section className="rounded-2xl border border-gray-100 bg-slate-50/50 p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C3D2E]">
                Uploaded Documents
            </h3>
            {documents.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {documents.map(([label, document]) => (
                        <div key={label} className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-xs">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                            <p className="mt-1 truncate text-sm font-semibold text-gray-800" title={document.name}>
                                {document.name}
                            </p>
                            <a
                                href={document.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#F7931E]/20 bg-[#FFF4E5] px-3 py-1.5 text-xs font-bold text-[#F7931E] transition hover:bg-[#F7931E] hover:text-white"
                            >
                                <FileText size={15} />
                                View document
                                <ExternalLink size={13} />
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-3 text-sm text-gray-400">No onboarding documents were uploaded.</p>
            )}
        </section>
    );
};

const getPlanValue = (clinic) =>
    clinic.plan || clinic.subscriptionPlan || clinic.subscriptionType || clinic.subscriptionDetails?.planType || "Basic";

const getBillingValue = (clinic) =>
    clinic.billing || clinic.billingCycle || clinic.subscriptionDetails?.billingCycle || (getPlanValue(clinic) === "12_MONTHS" ? "Annual" : "Monthly");

const getClinicForm = (clinic = {}) => {
    const today = getTodayDate();
    const billing = getBillingValue(clinic);

    const address = clinic.addressDetails || clinic.address || {};
    const reg = clinic.registrationDetails || clinic.registrations || clinic.licenses || {};
    const tax = clinic.taxDetails || clinic.tax || clinic.financials || {};
    const admin = clinic.adminDetails || clinic.adminInfo || clinic.admin || {};
    const plan = clinic.subscriptionDetails || clinic.planDetails || clinic.plan || {};
    const limits = clinic.licenseLimits || clinic.limits || clinic.subscriptionDetails?.licenseLimits || {};
    const features = clinic.features || clinic.modules || clinic.subscriptionDetails?.features || {};
    const docs = clinic.documentDetails || clinic.documents || clinic.legalDocuments || {};
    const details = clinic.clinicDetails || clinic.details || {};
    const coordinates = clinic.location?.coordinates || [];

    return {
        clinicCode: clinic.clinicCode || "",
        createdAt: clinic.createdAt || "",
        clinicName: clinic.name || clinic.clinicName || details.clinicName || details.name || "",
        facilityType: getClinicType(clinic) || details.facilityType || "",
        year: clinic.year || clinic.establishedYear || clinic.yearOfEstablishment || details.establishedYear || details.yearOfEstablishment || "",
        email: clinic.email || clinic.contactEmail || details.contactEmail || details.email || "",
        phone: clinic.phone || clinic.contactPhone || clinic.primaryContact || details.phone || details.contactPhone || "",
        altPhone: clinic.altPhone || clinic.alternateContact || clinic.alternatePhone || details.alternateContact || details.altPhone || "",
        website: clinic.website || details.website || "",

        address1: address.addressLine1 || address.line1 || clinic.address1 || clinic.address || "",
        address2: address.addressLine2 || address.line2 || clinic.address2 || "",
        city: address.city || clinic.city || "",
        district: address.district || clinic.district || "",
        state: address.state || clinic.state || "",
        pincode: address.pincode || address.zipcode || clinic.pincode || "",
        latitude: clinic.latitude || address.latitude || coordinates[1] || "",
        longitude: clinic.longitude || address.longitude || coordinates[0] || "",
        serviceAreas: address.serviceAreas || clinic.serviceAreas || [address.serviceArea || ""],

        vetReg: clinic.vetReg || clinic.vetRegistrationNumber || reg.vetRegistrationNumber || reg.vetCouncilRegistration || reg.registrationNumber || "",
        stateCouncil: clinic.stateCouncil || clinic.vetCouncil || reg.stateVeterinaryCouncil || reg.stateCouncil || reg.vetCouncil || "",
        expiry: clinic.expiry || reg.registrationExpiryDate || reg.expiryDate || "",
        vetExpiry: toDateInputValue(clinic.vetExpiry || reg.vetExpiry || reg.registrationExpiryDate),

        tradeLicense: clinic.tradeLicense || clinic.tradeLicenseNumber || reg.tradeLicenseNumber || reg.tradeLicense || "",
        tradeExpiry: toDateInputValue(clinic.tradeExpiry || reg.tradeLicenseExpiryDate || reg.tradeExpiry),
        drugLicense: clinic.drugLicense || clinic.drugLicenseNumber || reg.drugLicenseNumber || reg.drugLicense || "",
        drugExpiry: toDateInputValue(clinic.drugExpiry || reg.drugLicenseExpiryDate || reg.drugExpiry),

        gst: clinic.gst || clinic.gstNumber || tax.gstNumber || tax.gst || "",
        pan: clinic.pan || clinic.panNumber || tax.panNumber || tax.pan || "",
        bankName: clinic.bankName || tax.bankName || "",
        accountNumber: clinic.accountNumber || tax.accountNumber || "",
        ifsc: clinic.ifsc || clinic.ifscCode || tax.ifscCode || tax.ifsc || "",

        adminName: clinic.adminName || admin.fullName || admin.name || admin.adminName || "",
        designation: clinic.designation || clinic.adminDesignation || admin.designation || admin.role || "",
        adminPhone: clinic.adminPhone || admin.mobileNumber || admin.phone || admin.adminPhone || "",
        // Treat the phone number already on file as pre-verified so
        // editing an existing clinic doesn't force OTP re-verification
        // unless the admin actually changes the number.
        adminPhoneVerifiedNumber: clinic.adminPhone || admin.mobileNumber || admin.phone || admin.adminPhone || "",
        adminEmail: clinic.adminEmail || admin.emailAddress || admin.email || admin.adminEmail || clinic.contactEmail || "",
        govtIdType: clinic.govtIdType || admin.governmentIdType || admin.govtIdType || "Aadhar",
        govtIdNumber: clinic.govtIdNumber || admin.governmentIdNumber || admin.govtIdNumber || "",

        plan: getPlanValue(clinic) || plan.planType || "Basic",
        billing,
        startDate: toDateInputValue(clinic.startDate || clinic.planStartDate || plan.startDate) || today,
        endDate: toDateInputValue(clinic.endDate || clinic.planEndDate || clinic.expiryDate || plan.endDate) || calculateEndDate(today, billing),
        trialDays: clinic.trialDays || clinic.trialPeriodDays || plan.trialDays || 0,
        customPlanPrice: clinic.customPlanPrice ?? plan.customPlanPrice ?? "",
        discountCode: clinic.discountCode || plan.discountCode || "",
        notes: clinic.notes || plan.notes || "",
        
        maxStaff: clinic.maxStaff || limits.maxStaff || limits.maxStaffAccounts || "",
        maxDoctors: clinic.maxDoctors || limits.maxDoctors || "",
        maxPets: clinic.maxPets || limits.maxPets || limits.maxPetRecords || (limits.maxPetsUnlimited || limits.maxPetRecordsUnlimited ? "Unlimited" : ""),
        storageLimit: clinic.storageLimit || limits.storageLimit || limits.storageLimitGb || limits.storageLimitGB || "",

        labModule: Boolean(clinic.labModule ?? features.labModule ?? false),
        groomingModule: Boolean(clinic.groomingModule ?? features.groomingModule ?? false),
        kennelModule: Boolean(clinic.kennelModule ?? features.kennelModule ?? false),
        pharmacyModule: Boolean(clinic.pharmacyModule ?? features.pharmacyModule ?? false),
        inventoryModule: Boolean(clinic.inventoryModule ?? features.inventoryModule ?? false),
        telemedicineModule: Boolean(clinic.telemedicineModule ?? features.telemedicineModule ?? false),
        apiAccess: Boolean(clinic.apiAccess ?? features.apiAccess ?? false),
        whiteLabel: Boolean(clinic.whiteLabel ?? features.whiteLabel ?? false),

        logo: filePlaceholder(docs.clinicLogo || docs.clinicLogoUrl || clinic.logoName, docs.clinicLogoName),
        vetCert: filePlaceholder(docs.vetCouncilCertificate || docs.vetCouncilCertificateUrl || clinic.vetCertName, docs.vetCouncilCertificateName),
        tradeDoc: filePlaceholder(docs.tradeLicense || docs.tradeLicenseUrl || clinic.tradeDocName, docs.tradeLicenseName),
        drugDoc: filePlaceholder(docs.drugLicense || docs.drugLicenseUrl || clinic.drugDocName, docs.drugLicenseName),
        cheque: filePlaceholder(docs.cancelledCheque || docs.cancelledChequeUrl || clinic.chequeName, docs.cancelledChequeName),
        idDoc: filePlaceholder(docs.idDocument || docs.idDocumentUrl || clinic.idDocName || docs.governmentId || docs.governmentIdUrl, docs.idDocumentName),
        profile: filePlaceholder(docs.adminProfile || docs.adminProfileUrl || clinic.profileName, docs.adminProfileName),
    };
};

const getUpdatePayload = (form) => {
    let mappedSubscriptionType = "FREE_TIER";
    const planStr = String(form.plan).toUpperCase();
    const billingStr = String(form.billing).toUpperCase();

    if (planStr.includes("STANDARD") || billingStr === "MONTHLY" || planStr === "6_MONTHS") {
        mappedSubscriptionType = "6_MONTHS";
    }
    if (planStr.includes("PROFESSIONAL") || planStr.includes("ENTERPRISE") || billingStr === "ANNUAL" || planStr === "12_MONTHS") {
        mappedSubscriptionType = "12_MONTHS";
    }

    return {
        name: form.clinicName,
        facilityType: form.facilityType,
        yearOfEstablishment: form.year,
        address: [form.address1, form.city, form.state].filter(Boolean).join(", "),
        email: form.email,
        contactEmail: form.email,
        phone: form.phone,
        altPhone: form.altPhone,
        website: form.website,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        adminPhone: form.adminPhone,
        adminDesignation: form.designation,
        latitude: form.latitude,
        longitude: form.longitude,
        location: form.latitude !== "" && form.longitude !== ""
            ? { type: "Point", coordinates: [Number(form.longitude), Number(form.latitude)] }
            : undefined,

        subscriptionType: mappedSubscriptionType,
        plan: form.plan,
        billingCycle: form.billing,
        planStartDate: form.startDate,
        planEndDate: form.endDate,
        trialDays: form.trialDays,
        customPlanPrice: form.customPlanPrice,
        discountCode: form.discountCode,
        notes: form.notes,
        
        licenseLimits: {
            maxDoctors: form.maxDoctors,
            maxStaff: form.maxStaff,
            maxPets: form.maxPets,
            maxPetsUnlimited: String(form.maxPets || "").trim().toLowerCase() === "unlimited",
            storageLimit: form.storageLimit,
        },
        taxDetails: {
            gstNumber: form.gst,
            panNumber: form.pan,
            bankName: form.bankName,
            accountNumber: form.accountNumber,
            ifscCode: form.ifsc,
        },
        registrationDetails: {
            vetRegistrationNumber: form.vetReg,
            stateCouncil: form.stateCouncil,
            vetExpiry: form.vetExpiry,
            tradeLicenseNumber: form.tradeLicense,
            tradeExpiry: form.tradeExpiry,
            drugLicenseNumber: form.drugLicense,
            drugExpiry: form.drugExpiry,
        },
        adminDetails: {
            adminName: form.adminName,
            adminEmail: form.adminEmail,
            adminPhone: form.adminPhone,
            designation: form.designation,
            govtIdType: form.govtIdType,
            govtIdNumber: form.govtIdNumber,
        },
        addressDetails: {
            addressLine1: form.address1,
            addressLine2: form.address2,
            city: form.city,
            district: form.district,
            state: form.state,
            pincode: form.pincode,
            serviceAreas: form.serviceAreas,
        },
        features: {
            labModule: form.labModule,
            groomingModule: form.groomingModule,
            kennelModule: form.kennelModule,
            pharmacyModule: form.pharmacyModule,
            inventoryModule: form.inventoryModule,
            telemedicineModule: form.telemedicineModule,
            apiAccess: form.apiAccess,
            whiteLabel: form.whiteLabel,
        }
    };
};

export default function LatestClinicApprovals({ searchTerm = "" }) {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [modalMode, setModalMode] = useState("");
    const [activeTab, setActiveTab] = useState("identity");
    const [form, setForm] = useState(getClinicForm());
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [updatingStatusId, setUpdatingStatusId] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const fetchClinics = useCallback(async () => {
        setLoading(true);
        try {
            const query = searchTerm.trim();
            const response = await getClinics(query ? { search: query } : {});
            if (response.success) {
                setClinics(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch clinics", error);
            showToast({
                type: "error",
                title: "Clinics Unavailable",
                description: error.response?.data?.message || "Unable to load clinics.",
            });
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchClinics();
    }, [fetchClinics]);

    const openClinicModal = (mode, clinic) => {
        setSelectedClinic(clinic);
        setForm(getClinicForm(clinic));
        setActiveTab("identity");
        setModalMode(mode);
    };

    const closeModal = () => {
        setSelectedClinic(null);
        setModalMode("");
        setActiveTab("identity");
        setForm(getClinicForm());
        setSaving(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => {
            const updated = {
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            };

            if (name === "billing" || name === "startDate") {
                updated.endDate = calculateEndDate(
                    name === "startDate" ? value : updated.startDate,
                    name === "billing" ? value : updated.billing
                );
            }
            return updated;
        });
    };

    const handleUpdateClinic = async (updatedForm) => {
        if (!selectedClinic?._id) return;

        setSaving(true);
        try {
            const response = await updateClinic(selectedClinic._id, getUpdatePayload(updatedForm));
            await uploadClinicDocuments(selectedClinic._id, updatedForm);
            showToast({
                type: response.emailWarning?.length ? "error" : "success",
                title: response.emailWarning?.length ? "Clinic Updated, Email Not Sent" : "Clinic Updated",
                description: response.emailWarning?.join(" ") || response.message || "Clinic details updated successfully.",
            });
            closeModal();
            await fetchClinics();
        } catch (error) {
            console.error("Failed to update clinic", error);
            showToast({
                type: "error",
                title: "Update Failed",
                description: error.response?.data?.message || "Unable to update clinic.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClinic = async (clinic) => {
        if (!clinic?._id) return;

        const confirmed = window.confirm(
            `Delete ${clinic.name || "this clinic"}? This action cannot be undone.`
        );
        if (!confirmed) return;

        setDeletingId(clinic._id);
        try {
            const response = await deleteClinic(clinic._id);
            showToast({
                type: "success",
                title: "Clinic Deleted",
                description: response.message || "Clinic record removed successfully.",
            });
            await fetchClinics();
        } catch (error) {
            console.error("Failed to delete clinic", error);
            showToast({
                type: "error",
                title: "Delete Failed",
                description: error.response?.data?.message || "Unable to delete clinic.",
            });
        } finally {
            setDeletingId("");
        }
    };

    const handleStatusChange = async (clinic, status) => {
        if (!clinic?._id || status === clinic.verificationStatus) return;

        setUpdatingStatusId(clinic._id);
        try {
            const response = await updateClinicVerification(clinic._id, status);
            setClinics((current) => current.map((item) =>
                item._id === clinic._id ? { ...item, verificationStatus: response.data?.verificationStatus || status } : item
            ));
            showToast({
                type: "success",
                title: "Clinic Status Updated",
                description: `${clinic.name || "Clinic"} is now ${status === "UNDER_REVIEW" ? "Pending" : status}.`,
            });
        } catch (error) {
            showToast({
                type: "error",
                title: "Status Update Failed",
                description: error.response?.data?.message || "Unable to update clinic status.",
            });
        } finally {
            setUpdatingStatusId("");
        }
    };

    const handleActivityChange = async (clinic) => {
        if (!clinic?._id) return;
        const nextIsActive = clinic.isActive === false;
        const action = nextIsActive ? "activate" : "deactivate";
        if (!window.confirm(`${action[0].toUpperCase()}${action.slice(1)} ${clinic.name || "this clinic"}?${nextIsActive ? "" : " All clinic users will be logged out and blocked from logging in."}`)) return;

        setUpdatingStatusId(clinic._id);
        try {
            const response = await updateClinicActivity(clinic._id, nextIsActive);
            setClinics((current) => current.map((item) =>
                item._id === clinic._id ? { ...item, isActive: response.data?.isActive ?? nextIsActive } : item
            ));
            showToast({ type: "success", title: `Clinic ${nextIsActive ? "Activated" : "Deactivated"}`, description: response.message || `${clinic.name || "Clinic"} is now ${nextIsActive ? "active" : "inactive"}.` });
        } catch (error) {
            showToast({ type: "error", title: "Status Update Failed", description: error.response?.data?.message || "Unable to update clinic activity." });
        } finally {
            setUpdatingStatusId("");
        }
    };

    return (
        <>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-xs">
                <div className="flex flex-col gap-4 border-b border-gray-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between md:p-6 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-[#FFF4E5] p-2.5 text-[#F7931E]">
                            <ClipboardCheck size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#0C3D2E] md:text-lg tracking-tight">
                                Latest Clinic Approvals
                            </h2>
                            <p className="text-xs text-gray-400 md:text-sm font-medium">
                                Review the most recent clinic registration requests.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <div className={`hidden ${tableGrid} gap-3 border-b border-gray-100 bg-slate-50/50 px-4 py-3 text-xs font-bold text-[#0C3D2E] md:grid lg:px-6`}>
                        <span>CLINIC</span>
                        <span>TYPE</span>
                        <span>LOCATION</span>
                        <span>CONTACT</span>
                        <span>PLAN</span>
                        <span>STATUS</span>
                        <span className="text-right">ACTIONS</span>
                    </div>

                    {loading ? (
                        <div className="px-6 py-8 text-center text-sm font-medium text-gray-400">
                            Loading clinics...
                        </div>
                    ) : clinics.length === 0 ? (
                        <div className="px-6 py-8 text-center text-sm font-medium text-gray-400">
                            No clinics found.
                        </div>
                    ) : (
                        clinics.map((clinic, index) => {
                            const clinicType = getClinicType(clinic);

                            return (
                                <div
                                    key={clinic._id}
                                    style={{
                                        zIndex:
                                            openDropdownId === clinic._id
                                                ? 9999
                                                : clinics.length - index,
                                    }}
                                    className={`relative grid grid-cols-1 gap-3 border-b border-gray-100 px-4 py-4 transition hover:bg-slate-50/80 ${tableGrid} md:items-center md:gap-3 lg:px-6`}
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-bold text-gray-800 text-sm" title={clinic.name}>
                                            {clinic.name || "Unnamed clinic"}
                                        </p>
                                        <p className="truncate text-xs text-gray-400 font-medium" title={getClinicDisplayId(clinic)}>
                                            {getClinicDisplayId(clinic)}
                                        </p>
                                    </div>

                                    <span className="truncate text-xs font-semibold text-[#0C3D2E]" title={clinicType}>
                                        <span className="mr-2 text-xs font-semibold text-gray-400 md:hidden">Type:</span>
                                        {clinicType || "N/A"}
                                    </span>

                                    <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-gray-600" title={clinic.address}>
                                        <MapPin size={14} className="shrink-0 text-[#F7931E]" />
                                        <span className="truncate">{clinic.address || "N/A"}</span>
                                    </div>

                                    <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-gray-600" title={getContactEmail(clinic)}>
                                        <Mail size={14} className="shrink-0 text-[#F7931E]" />
                                        <span className="truncate">{getContactEmail(clinic)}</span>
                                    </div>

                                    <span className="truncate text-xs font-semibold text-[#0C3D2E]">
                                        <span className="mr-2 font-semibold text-gray-400 md:hidden">Plan:</span>
                                        {getPlanValue(clinic).replace("_", " ")}
                                    </span>

                                    <div className="flex items-center">
                                        {clinic.verificationStatus === "APPROVED" ? (
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={clinic.isActive !== false}
                                                onClick={() => handleActivityChange(clinic)}
                                                disabled={updatingStatusId === clinic._id}
                                                className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${clinic.isActive !== false ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}
                                                title="Toggle clinic active status"
                                            >
                                                <span className={`h-5 w-9 rounded-full p-0.5 transition ${clinic.isActive !== false ? "bg-emerald-600" : "bg-slate-500"}`}>
                                                    <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${clinic.isActive !== false ? "translate-x-4" : "translate-x-0"}`} />
                                                </span>
                                                {clinic.isActive !== false ? "Active" : "Inactive"}
                                            </button>
                                        ) : (
                                            <TableStatusDropdown
                                                value={clinic.verificationStatus || "SUBMITTED"}
                                                onChange={(newStatus) => handleStatusChange(clinic, newStatus)}
                                                disabled={updatingStatusId === clinic._id}
                                                isOpenRow={openDropdownId === clinic._id}
                                                setOpenRow={(open) =>
                                                    setOpenDropdownId(open ? clinic._id : null)
                                                }
                                            />
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 md:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => openClinicModal("view", clinic)}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#0C3D2E] transition hover:bg-[#D9E8E3]/40 cursor-pointer"
                                            title="View clinic"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openClinicModal("edit", clinic)}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#F7931E]/30 bg-[#FFF4E5] text-[#F7931E] transition hover:bg-[#F7931E] hover:text-white cursor-pointer"
                                            title="Edit clinic"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClinic(clinic)}
                                            disabled={deletingId === clinic._id}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                                            title="Delete clinic"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {modalMode === "view" && selectedClinic && (
                <ClinicDetailsModal
                    clinic={selectedClinic}
                    onClose={closeModal}
                    onEdit={(clinic) => openClinicModal("edit", clinic)}
                    onDelete={handleDeleteClinic}
                />
            )}

            {modalMode === "edit" && selectedClinic && (
                <FullClinicModal
                    mode={modalMode}
                    clinic={selectedClinic}
                    activeTab={activeTab}
                    form={form}
                    saving={saving}
                    setForm={setForm}
                    handleChange={handleChange}
                    setActiveTab={setActiveTab}
                    onClose={closeModal}
                    onSubmitClinic={handleUpdateClinic}
                />
            )}
        </>
    );
}

function ClinicDetailsModal({ clinic, onClose, onEdit, onDelete }) {
    if (!clinic) return null;

    const form = getClinicForm(clinic);
    const status = getDisplayStatus(clinic);
    const detailsScrollRef = useRef(null);
    const detailsContentRef = useRef(null);
    const [detailsMaxScroll, setDetailsMaxScroll] = useState(0);
    const [detailsScrollLeft, setDetailsScrollLeft] = useState(0);
    const [detailsViewportWidth, setDetailsViewportWidth] = useState(0);

    useEffect(() => {
        const updateScrollMetrics = () => {
            const container = detailsScrollRef.current;
            if (!container) return;

            setDetailsMaxScroll(Math.max(container.scrollWidth - container.clientWidth, 0));
            setDetailsScrollLeft(container.scrollLeft);
            setDetailsViewportWidth(container.clientWidth);
        };

        updateScrollMetrics();

        const observer = new ResizeObserver(updateScrollMetrics);
        if (detailsContentRef.current) observer.observe(detailsContentRef.current);
        if (detailsScrollRef.current) observer.observe(detailsScrollRef.current);

        return () => observer.disconnect();
    }, [clinic]);

    const syncDetailsScroll = (event) => {
        setDetailsScrollLeft(event.currentTarget.scrollLeft);
    };

    const handleVisibleScroll = (nextScrollLeft) => {
        setDetailsScrollLeft(nextScrollLeft);

        if (detailsScrollRef.current) {
            detailsScrollRef.current.scrollLeft = nextScrollLeft;
        }
    };

    const thumbWidthPercent = detailsMaxScroll
        ? Math.max(24, Math.min(70, (detailsViewportWidth / (detailsViewportWidth + detailsMaxScroll)) * 100))
        : 100;
    const thumbLeftPercent = detailsMaxScroll
        ? (detailsScrollLeft / detailsMaxScroll) * (100 - thumbWidthPercent)
        : 0;

    const handleScrollTrackClick = (event) => {
        if (!detailsMaxScroll) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const clickRatio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        handleVisibleScroll(clickRatio * detailsMaxScroll);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs px-4 py-6 sm:px-6 sm:py-10 flex items-center justify-center">
            <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col border border-gray-100">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#F7931E]">
                            Clinic Profile
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-[#0C3D2E] tracking-tight">
                            {form.clinicName || "Unnamed Clinic"}
                        </h2>
                        <p className="mt-0.5 text-xs font-semibold text-gray-400">
                            {getClinicDisplayId(clinic)}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-orange-50 text-gray-400 hover:text-[#F7931E] flex items-center justify-center transition-colors font-bold cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div
                    ref={detailsScrollRef}
                    onScroll={syncDetailsScroll}
                    className="min-h-0 flex-1 overflow-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6 bg-slate-50/50"
                >
                    <div ref={detailsContentRef} className="grid min-w-[42rem] gap-4 sm:min-w-0">
                        <DetailSection title="Overview">
                            <DetailField label="Status" value={status} />
                            <DetailField label="Facility Type" value={form.facilityType} />
                            <DetailField label="Contact Email" value={form.email} />
                            <DetailField label="Phone" value={form.phone} />
                            <DetailField label="Subscription Plan" value={form.plan} />
                            <DetailField label="Expiry / Renewal Date" value={formatDate(form.endDate)} />
                        </DetailSection>

                        <DetailSection title="Clinic Identity">
                            <DetailField label="Clinic Name" value={form.clinicName} />
                            <DetailField label="Year of Establishment" value={form.year} />
                            <DetailField label="Alternate Contact" value={form.altPhone} />
                            <DetailField label="Website" value={form.website} />
                        </DetailSection>

                        <DetailSection title="Address & Location">
                            <DetailField label="Address Line 1" value={form.address1} wide />
                            <DetailField label="Address Line 2" value={form.address2} wide />
                            <DetailField label="City" value={form.city} />
                            <DetailField label="District" value={form.district} />
                            <DetailField label="State" value={form.state} />
                            <DetailField label="PIN Code" value={form.pincode} />
                            <DetailField label="Service Areas" value={form.serviceAreas} wide />
                        </DetailSection>

                        <DetailSection title="Registrations & Licenses">
                            <DetailField label="State Vet Council" value={form.stateCouncil} />
                            <DetailField label="Registration Number" value={form.vetReg} />
                            <DetailField label="Registration Expiry" value={formatDate(form.vetExpiry)} />
                            <DetailField label="Drug License Number" value={form.drugLicense} />
                            <DetailField label="Drug License Expiry" value={formatDate(form.drugExpiry)} />
                            <DetailField label="Trade License Number" value={form.tradeLicense} />
                            <DetailField label="Trade License Expiry" value={formatDate(form.tradeExpiry)} />
                        </DetailSection>

                        <DetailSection title="Tax & Banking">
                            <DetailField label="GST Number" value={form.gst} />
                            <DetailField label="PAN Number" value={form.pan} />
                            <DetailField label="Bank Name" value={form.bankName} />
                            <DetailField label="Account Number" value={form.accountNumber} />
                            <DetailField label="IFSC Code" value={form.ifsc} />
                        </DetailSection>

                        <DetailSection title="Admin Info">
                            <DetailField label="Admin Name" value={form.adminName} />
                            <DetailField label="Designation" value={form.designation} />
                            <DetailField label="Admin Mobile" value={form.adminPhone} />
                            <DetailField label="Admin Email" value={form.adminEmail} />
                            <DetailField label="Government ID Type" value={form.govtIdType} />
                            <DetailField label="Government ID Number" value={form.govtIdNumber} />
                        </DetailSection>

                        <ClinicDocuments form={form} />

                        <DetailSection title="Plan & Features">
                            <DetailField label="Plan" value={form.plan} />
                            <DetailField label="Billing Cycle" value={form.billing} />
                            <DetailField label="Start Date" value={formatDate(form.startDate)} />
                            <DetailField label="Trial Days" value={form.trialDays} />
                            <DetailField label="Discount Code" value={form.discountCode} />
                            <DetailField label="Storage Limit (GB)" value={form.storageLimit} />
                            <DetailField label="Max Doctors" value={form.maxDoctors} />
                            <DetailField label="Max Staff" value={form.maxStaff} />
                            <DetailField label="Max Pets" value={form.maxPets} />
                            <DetailField label="Lab Module" value={form.labModule} />
                            <DetailField label="Grooming Module" value={form.groomingModule} />
                            <DetailField label="Kennel Module" value={form.kennelModule} />
                            <DetailField label="Pharmacy Module" value={form.pharmacyModule} />
                            <DetailField label="Inventory Module" value={form.inventoryModule} />
                            <DetailField label="Telemedicine Module" value={form.telemedicineModule} />
                            <DetailField label="API Access" value={form.apiAccess} />
                            <DetailField label="White Label" value={form.whiteLabel} />
                            <DetailField label="Notes" value={form.notes} wide />
                        </DetailSection>
                    </div>
                </div>

                <div className="border-t border-gray-100 bg-white px-6 py-3 sm:hidden">
                    <button
                        type="button"
                        onClick={handleScrollTrackClick}
                        disabled={!detailsMaxScroll}
                        className="relative block h-5 w-full cursor-pointer rounded-full disabled:cursor-default"
                        aria-label="Scroll clinic details horizontally"
                    >
                        <span className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
                        <span
                            className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-[#F7931E] shadow-[0_1px_4px_rgba(247,147,30,0.35)] transition-[left,width]"
                            style={{
                                left: `${thumbLeftPercent}%`,
                                width: `${thumbWidthPercent}%`,
                            }}
                        />
                    </button>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-end bg-white">
                    {onDelete && (
                        <button onClick={() => onDelete(clinic)} className="w-full rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white sm:w-auto cursor-pointer">
                            Delete
                        </button>
                    )}
                    {onEdit && (
                        <button onClick={() => onEdit(clinic)} className="w-full rounded-xl bg-[#F7931E] hover:bg-[#e08319] px-5 py-2.5 text-xs font-bold text-white transition sm:w-auto shadow-xs cursor-pointer">
                            Edit
                        </button>
                    )}
                    <button onClick={onClose} className="w-full rounded-xl bg-[#0C3D2E] hover:bg-[#08281E] px-5 py-2.5 text-xs font-bold text-white transition sm:w-auto cursor-pointer">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function FullClinicModal({
    mode,
    activeTab,
    form,
    saving,
    setForm,
    handleChange,
    setActiveTab,
    onClose,
    onSubmitClinic,
}) {
    const isView = mode === "view";

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center px-2 py-[max(2rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-4">
            <div className="bg-white w-full sm:w-[95%] h-[calc(100svh-3.25rem)] max-h-[calc(100svh-3.25rem)] sm:h-[95vh] sm:max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
                <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 bg-white border-b border-gray-100">
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-3xl font-bold text-[#0C3D2E] tracking-tight">
                            {isView ? "View Clinic" : "Edit Clinic"}
                        </h2>
                        <p className="text-gray-400 text-xs sm:text-sm mt-0.5 font-medium">
                            {isView ? "Complete clinic details in read-only mode." : "Update complete clinic details."}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full hover:bg-orange-50 text-gray-400 hover:text-[#F7931E] flex items-center justify-center transition-colors font-bold cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <Stepper
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 pt-2 pb-4 bg-slate-50/50">
                    <ClinicForm
                        activeTab={activeTab}
                        form={form}
                        setForm={setForm}
                        handleChange={handleChange}
                        validateTab={() => true}
                        setActiveTab={setActiveTab}
                        tabs={tabs}
                        onClose={onClose}
                        readOnly={isView}
                        submitLabel={saving ? "Saving..." : "Save Changes"}
                        onSubmitClinic={onSubmitClinic}
                    />
                </div>
            </div>
        </div>
    );
}
