import { useEffect, useRef, useState } from "react";

import { showToast } from "../../../../../shared/components/toast";
import { INDIAN_STATE_OPTIONS } from "../../../../../shared/constants/indiaStates";
import Card from "../Card";
import Input from "../Input";
import Select from "../Select";
import { Grid, Full } from "../Grid";
import Upload from "../Upload";
import { createDoctor, updateDoctor } from "../../../api/doctorApi";
import { checkClinicContactAvailability } from "../../../api/clinicApi";
import { BANK_OPTIONS, getBankRule, formatAccountLength, getMaxAccountLength } from "../../../../../shared/constants/bankAccountRules";

const BILLING_CYCLE_OPTIONS = ["Monthly", "Quarterly", "Half-Yearly", "Annual"];

const DEGREE_OPTIONS = [
    "BVSc",
    "BVSc & AH",
    "MVSc",
    "PhD (Vet)",
    "BAMS",
    "Other",
];

const SPECIALIZATION_OPTIONS = [
    "Small Animal",
    "Large Animal",
    "Exotic & Wildlife",
    "Poultry",
    "Aquatic",
    "Surgery",
    "Dermatology",
    "Dentistry",
    "Oncology",
    "Cardiology",
];

const PRACTICE_TYPES = [
    "Home visits",
    "Telemedicine",
    "Mobile clinic",
    "Freelance",
    "Government",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^\d{6}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_REGEX = /^\d{12}$/;
const PASSPORT_REGEX = /^[A-Z][0-9]{7}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const YEAR_REGEX = /^\d{4}$/;

const digitsOnly = (value, max = 10) =>
    String(value || "")
        .replace(/\D/g, "")
        .slice(0, max);

const uppercaseValue = (value, max = 20) =>
    String(value || "")
        .toUpperCase()
        .replace(/\s+/g, "")
        .slice(0, max);

const isFutureDate = (value) => {
    if (!value) return false;
    const selected = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected > today;
};

const isPastDate = (value) => {
    if (!value) return false;
    const selected = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
};

const parseDelimitedList = (value) =>
    String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

const isQualificationRowFilled = (row) =>
    Boolean(row?.degree?.trim() || row?.institution?.trim() || row?.year?.trim());

const isValidGstPan = (value) => {
    const normalized = String(value || "").trim().toUpperCase();
    return PAN_REGEX.test(normalized) || GST_REGEX.test(normalized);
};

const getGovtIdRule = (type) => {
    switch (type) {
        case "PAN":
            return {
                label: "PAN Number",
                docLabel: "Upload PAN Card",
                placeholder: "Enter PAN number",
                inputMode: "text",
                maxLength: 10,
                sanitize: (value) => uppercaseValue(value, 10),
                validate: (value) => PAN_REGEX.test(String(value || "").trim().toUpperCase()),
                message: "PAN number must follow the format AAAAA9999A.",
            };
        case "Passport":
            return {
                label: "Passport Number",
                docLabel: "Upload Passport",
                placeholder: "Enter passport number",
                inputMode: "text",
                maxLength: 8,
                sanitize: (value) => uppercaseValue(value, 8),
                validate: (value) => PASSPORT_REGEX.test(String(value || "").trim().toUpperCase()),
                message: "Passport number must follow the format A9999999.",
            };
        default:
            return {
                label: "Aadhaar Number",
                docLabel: "Upload Aadhaar Card",
                placeholder: "Enter 12-digit Aadhaar number",
                inputMode: "numeric",
                maxLength: 12,
                sanitize: (value) => digitsOnly(value, 12),
                validate: (value) => AADHAAR_REGEX.test(String(value || "").trim()),
                message: "Aadhaar number must contain 12 digits.",
            };
    }
};

const getStepErrorMessage = (errors) => Object.values(errors).find(Boolean) || "";

const getTodayDateStr = () => new Date().toISOString().split("T")[0];
const today = getTodayDateStr();

export default function DoctorForm({
    activeTab,
    tabs,
    setActiveTab,
    form,
    setForm,
    qualifications,
    setQualifications,
    planOptions = ["Solo Basic", "Solo Pro"],
    onClose,
    onCreated,
    onSaved,
    mode = "create",
    doctorId = "",
}) {
    const stateOptions = INDIAN_STATE_OPTIONS;
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const isEditMode = mode === "edit";

    // Captures the email/mobile this veterinarian already had when the form
    // opened (only set once, on mount) so editing without touching either
    // field never flags them as "already used" against the record's own
    // existing values.
    const initialContact = useRef({ email: form.email, mobile: form.mobile }).current;

    useEffect(() => {
        const checkField = async (field, value, isEmail) => {
            const trimmed = String(value || "").trim();
            if (!trimmed) return;
            if (isEmail ? !EMAIL_REGEX.test(trimmed) : !PHONE_REGEX.test(trimmed)) return;
            if (isEditMode && trimmed.toLowerCase() === String(initialContact[field] || "").trim().toLowerCase()) {
                return;
            }

            try {
                const result = await checkClinicContactAvailability(
                    isEmail ? { email: trimmed } : { phone: trimmed }
                );
                setErrors((prev) => {
                    const next = { ...prev };
                    if (result.available) {
                        delete next[field];
                    } else {
                        next[field] = result.message || `This ${isEmail ? "email" : "mobile number"} is already being used.`;
                    }
                    return next;
                });
            } catch (err) {
                console.error("Contact availability check failed", err);
            }
        };

        const timer = window.setTimeout(() => {
            checkField("email", form.email, true);
            checkField("mobile", form.mobile, false);
        }, 400);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.email, form.mobile]);

    // Each service-area entry must be a real India Post PIN code, not just
    // 6 digits - verifiedPincodes[pincode] is true/false once checked, so
    // validatePracticeStep can require every current entry to be verified
    // before Next enables (matches the format-only pincode gate already
    // used for the clinic address form).
    const [verifiedPincodes, setVerifiedPincodes] = useState({});

    useEffect(() => {
        const list = parseDelimitedList(form.serviceAreas).filter((p) => PINCODE_REGEX.test(p));
        const unchecked = list.filter((p) => !(p in verifiedPincodes));
        if (!unchecked.length) return undefined;

        const timer = window.setTimeout(() => {
            unchecked.forEach(async (pincode) => {
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                    const data = await response.json();
                    const valid = Boolean(data?.[0]?.Status === "Success" && data[0].PostOffice?.length);
                    setVerifiedPincodes((prev) => ({ ...prev, [pincode]: valid }));
                } catch (err) {
                    console.error("PIN code verification failed", err);
                    setVerifiedPincodes((prev) => ({ ...prev, [pincode]: false }));
                }
            });
        }, 500);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.serviceAreas]);

    useEffect(() => {
        const list = parseDelimitedList(form.serviceAreas);
        if (!list.length) {
            clearErrorKeys("serviceAreas");
            return;
        }
        if (list.some((p) => !PINCODE_REGEX.test(p))) {
            setErrors((prev) => ({ ...prev, serviceAreas: "Each service area must be a valid 6-digit Indian PIN code." }));
            return;
        }
        if (list.every((p) => verifiedPincodes[p] === true)) {
            clearErrorKeys("serviceAreas");
        } else if (list.some((p) => verifiedPincodes[p] === false)) {
            setErrors((prev) => ({ ...prev, serviceAreas: "One or more PIN codes could not be verified against India Post records." }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.serviceAreas, verifiedPincodes]);

    // The 15-char registration number rule and the certificate-validity-date
    // rule were previously only checked inside validateVetStep(), which only
    // runs from handleNext() - but a disabled Next button can't be clicked,
    // so the error text explaining WHY it's disabled never rendered. This
    // mirrors the live-validation pattern above so the reason is visible
    // as soon as the value is invalid, not just silently blocked.
    useEffect(() => {
        const regNumber = form.vetCouncilRegistrationNumber.trim();

        setErrors((prev) => {
            const next = { ...prev };

            if (!regNumber || /^\S{1,18}$/.test(regNumber)) {
                delete next.vetCouncilRegistrationNumber;
            } else {
                next.vetCouncilRegistrationNumber =
                    `Registration number must be at most 18 characters (letters, numbers and symbols allowed) - currently ${regNumber.length}.`;
            }

            if (!form.certificateValidityDate || !isPastDate(form.certificateValidityDate)) {
                delete next.certificateValidityDate;
            } else {
                next.certificateValidityDate = "Certificate validity date cannot be in the past.";
            }

            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.vetCouncilRegistrationNumber, form.certificateValidityDate]);

    const currentStepIndex = Math.max(
        tabs.findIndex(([key]) => key === activeTab),
        0
    );
    const isLastStep = currentStepIndex >= tabs.length - 1;
    const isQualificationStep = activeTab === "qualification";
    const govtIdRule = getGovtIdRule(form.govtIdType);

    const clearErrorKeys = (...keys) => {
        const flatKeys = keys.flat().filter(Boolean);

        if (!flatKeys.length) return;

        setErrors((prev) => {
            const next = { ...prev };

            flatKeys.forEach((key) => {
                delete next[key];
            });

            return next;
        });
    };

    const setFieldValue = (name, value, extra = {}) => {
        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...extra,
            ...(name === "state" ? { city: "" } : {}),
            ...(name === "govtIdType"
                ? {
                    govtIdNumber: "",
                    govtIdDocument: null,
                }
                : {}),
        }));

        clearErrorKeys(
            name,
            ...(name === "state" ? ["city", "pincode"] : []),
            ...(name === "govtIdType" ? ["govtIdNumber", "govtIdDocument"] : [])
        );
    };

    const setQualificationValue = (index, field, value) => {
        setQualifications((prev) =>
            prev.map((item, itemIndex) =>
                itemIndex === index
                    ? { ...item, [field]: value }
                    : item
            )
        );

        clearErrorKeys(`qualification-${index}-${field}`, "qualifications");
    };

    const handleSimpleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            setFieldValue(name, checked);
            return;
        }

        if (name === "state") {
            setFieldValue(name, value, { city: "" });
            return;
        }

        if (name === "govtIdType") {
            setFieldValue(name, value, {
                govtIdNumber: "",
                govtIdDocument: null,
            });
            return;
        }

        setFieldValue(name, value);
    };

    const handleMobileChange = (e) => {
        setFieldValue("mobile", digitsOnly(e.target.value, 10));
    };

    const handlePincodeChange = async (e) => {
        const nextValue = digitsOnly(e.target.value, 6);
        setFieldValue("pincode", nextValue);

        if (nextValue.length === 6) {
            const validation = await validatePincode(nextValue, form.state, form.city, true);

            if (!validation.valid) {
                setErrors((prev) => ({ ...prev, pincode: validation.message }));
            }
        }
    };

    const handleGovtIdNumberChange = (e) => {
        const sanitized = govtIdRule.sanitize(e.target.value);
        setFieldValue("govtIdNumber", sanitized);
    };

    const handleExperienceChange = (e) => {
        setFieldValue("experience", digitsOnly(e.target.value, 2));
    };

    const handleConsultationFeeChange = (e) => {
        setFieldValue("consultationFee", digitsOnly(e.target.value, 6));
    };

    const handleAccountNumberChange = (e) => {
        const rule = getBankRule(form.bankName);
        setFieldValue("accountNumber", digitsOnly(e.target.value, getMaxAccountLength(rule)));
    };

    const handleIfscChange = (e) => {
        setFieldValue("ifsc", uppercaseValue(e.target.value, 11));
    };

    const handleYearChange = (index) => (e) => {
        const sanitized = digitsOnly(e.target.value, 4);
        setQualificationValue(index, "year", sanitized);
    };

    const toggleArray = (field, value) => {
        const currentValues = Array.isArray(form[field]) ? form[field] : [];
        const nextValues = currentValues.includes(value)
            ? currentValues.filter((item) => item !== value)
            : [...currentValues, value];

        setFieldValue(field, nextValues);
    };

    const validatePincode = async (
        pincodeValue,
        stateValue = form.state,
        cityValue = form.city,
        showFeedback = false
    ) => {
        const pincode = digitsOnly(pincodeValue, 6);

        if (!PINCODE_REGEX.test(pincode)) {
            return {
                valid: false,
                message: "PIN Code must be 6 digits.",
            };
        }

        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (!data || data[0].Status !== "Success" || !data[0].PostOffice) {
                if (showFeedback) {
                    showToast({
                        type: "error",
                        title: "Invalid PIN Code",
                        description: "PIN Code not found.",
                    });
                }

                return {
                    valid: false,
                    message: "PIN Code not found.",
                };
            }

            const office = data[0].PostOffice[0];

            const stateMatched =
                office.State?.trim().toLowerCase() ===
                String(stateValue || "").trim().toLowerCase();

            const cityMatched =
                office.District?.trim().toLowerCase() ===
                String(cityValue || "").trim().toLowerCase() ||
                office.Block?.trim().toLowerCase() ===
                String(cityValue || "").trim().toLowerCase();

            if (!stateMatched || !cityMatched) {
                if (showFeedback) {
                    showToast({
                        type: "error",
                        title: "Location Mismatch",
                        description: "Selected State / City does not match this PIN Code.",
                    });
                }

                return {
                    valid: false,
                    message: "Selected State / City does not match this PIN Code.",
                };
            }

            if (showFeedback) {
                showToast({
                    type: "success",
                    title: "Verified",
                    description: "PIN Code verified successfully.",
                });
            }

            return { valid: true };
        } catch (error) {
            if (showFeedback) {
                showToast({
                    type: "error",
                    title: "Network Error",
                    description: "Unable to verify PIN Code.",
                });
            }

            return {
                valid: false,
                message: "Unable to verify PIN Code.",
            };
        }
    };

    const handleFileUpload = (field) => (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf";

        const fileRules = {
            profilePhoto: {
                valid: isImage,
                message: "Profile photo must be an image file.",
            },
            govtIdDocument: {
                valid: isPdf,
                message: "Government ID document must be a PDF file.",
            },
            degreeCertificates: {
                valid: isPdf,
                message: "Degree certificates must be PDF files.",
            },
            registrationCertificate: {
                valid: isPdf,
                message: "Registration certificate must be a PDF file.",
            },
        };

        const rule = fileRules[field];

        if (rule && !rule.valid) {
            showToast({
                type: "error",
                title: "Invalid File",
                description: rule.message,
            });

            e.target.value = "";
            setFieldValue(field, null);
            return;
        }

        setFieldValue(field, file);
    };

    const validatePersonalStep = async () => {
        const nextErrors = {};

        if (!form.fullName.trim()) {
            nextErrors.fullName = "Full name is required.";
        } else if (form.fullName.trim().length < 3) {
            nextErrors.fullName = "Full name must be at least 3 characters.";
        }

        if (!form.gender) {
            nextErrors.gender = "Gender is required.";
        }

        if (!form.dob) {
            nextErrors.dob = "Date of birth is required.";
        } else if (isFutureDate(form.dob)) {
            nextErrors.dob = "Date of birth cannot be in the future.";
        }

        if (!PHONE_REGEX.test(String(form.mobile || "").trim())) {
            nextErrors.mobile = "Enter a valid 10-digit mobile number.";
        }

        if (!EMAIL_REGEX.test(String(form.email || "").trim())) {
            nextErrors.email = "Enter a valid email address.";
        }

        if (!form.profilePhoto) {
            nextErrors.profilePhoto = "Profile photo is required.";
        }

        if (!Array.isArray(form.languages) || !form.languages.length) {
            nextErrors.languages = "Select at least one language.";
        }

        if (!form.address.trim()) {
            nextErrors.address = "Address is required.";
        }

        if (!form.state) {
            nextErrors.state = "State is required.";
        }

        if (!form.city.trim()) {
            nextErrors.city = "City is required.";
        }

        if (!PINCODE_REGEX.test(String(form.pincode || "").trim())) {
            nextErrors.pincode = "PIN Code must be 6 digits.";
        } else {
            const pincodeCheck = await validatePincode(
                form.pincode,
                form.state,
                form.city,
                false
            );

            if (!pincodeCheck.valid) {
                nextErrors.pincode = pincodeCheck.message;
            }
        }

        if (!form.govtIdType) {
            nextErrors.govtIdType = "Government ID type is required.";
        } else {
            const idValue = String(form.govtIdNumber || "").trim();

            if (!idValue) {
                nextErrors.govtIdNumber = `${govtIdRule.label} is required.`;
            } else if (!govtIdRule.validate(idValue)) {
                nextErrors.govtIdNumber = govtIdRule.message;
            }

            if (!form.govtIdDocument) {
                nextErrors.govtIdDocument = `${govtIdRule.docLabel} is required.`;
            }
        }

        return nextErrors;
    };

    const validateQualificationStep = () => {
        const nextErrors = {};
        const enteredRows = qualifications
            .map((row, index) => ({ row, index }))
            .filter(({ row }) => isQualificationRowFilled(row));

        if (!enteredRows.length) {
            return nextErrors;
        }

        enteredRows.forEach(({ row, index }) => {
            if (!row.degree?.trim()) {
                nextErrors[`qualification-${index}-degree`] = "Degree name is required.";
            }

            if (row.degree === "Other" && !row.customDegree?.trim()) {
                nextErrors[`qualification-${index}-customDegree`] = "Please specify the degree.";
            }

            if (!row.institution?.trim()) {
                nextErrors[`qualification-${index}-institution`] = "Institute name is required.";
            }

            if (!row.certificate) {
                nextErrors[`qualification-${index}-certificate`] = "Degree certificate is required.";
            }

            if (!YEAR_REGEX.test(String(row.year || "").trim())) {
                nextErrors[`qualification-${index}-year`] = "Enter a 4-digit year.";
                return;
            }

            const yearValue = Number(row.year);

            if (yearValue < 1900 || yearValue > new Date().getFullYear()) {
                nextErrors[`qualification-${index}-year`] = "Enter a valid passing year.";
            }
        });

        return nextErrors;
    };

    const validateVetStep = () => {
        const nextErrors = {};

        if (!form.vetCouncilRegistrationNumber.trim()) {
            nextErrors.vetCouncilRegistrationNumber = "Registration number is required.";
        } else if (!/^\S{1,18}$/.test(form.vetCouncilRegistrationNumber.trim())) {
            nextErrors.vetCouncilRegistrationNumber =
                `Registration number must be at most 18 characters (letters, numbers and symbols allowed) - currently ${form.vetCouncilRegistrationNumber.trim().length}.`;
        }

        if (!form.stateVetCouncil) {
            nextErrors.stateVetCouncil = "State veterinary council is required.";
        }

        if (!form.certificateValidityDate) {
            nextErrors.certificateValidityDate = "Certificate validity date is required.";
        } else if (isPastDate(form.certificateValidityDate)) {
            nextErrors.certificateValidityDate = "Certificate validity date cannot be in the past.";
        }

        if (!form.registrationCertificate) {
            nextErrors.registrationCertificate = "Registration certificate is required.";
        }

        return nextErrors;
    };

    const validatePracticeStep = () => {
        const nextErrors = {};
        const serviceAreaList = parseDelimitedList(form.serviceAreas);

        if (!String(form.experience || "").trim()) {
            nextErrors.experience = "Years of experience is required.";
        } else {
            const experienceValue = Number(form.experience);
            if (!Number.isFinite(experienceValue) || experienceValue < 1 || experienceValue > 70) {
                nextErrors.experience = "Experience must be between 1 and 70 years.";
            }
        }

        if (!form.practiceType) {
            nextErrors.practiceType = "Practice type is required.";
        }

        if (!String(form.consultationFee || "").trim()) {
            nextErrors.consultationFee = "Consultation fee is required.";
        } else {
            const feeValue = Number(form.consultationFee);
            if (!Number.isFinite(feeValue) || feeValue <= 0 || feeValue > 100000) {
                nextErrors.consultationFee = "Consultation fee must be between 1 and 100000.";
            }
        }

        if (!serviceAreaList.length) {
            nextErrors.serviceAreas = "Service areas or pincodes are required.";
        } else if (serviceAreaList.some((pincode) => !PINCODE_REGEX.test(pincode))) {
            nextErrors.serviceAreas = "Each service area must be a valid 6-digit Indian PIN code.";
        } else if (serviceAreaList.some((pincode) => verifiedPincodes[pincode] !== true)) {
            nextErrors.serviceAreas = "One or more PIN codes could not be verified against India Post records.";
        }

        if (!form.gstPan.trim()) {
            nextErrors.gstPan = "GST or PAN is required.";
        } else if (!isValidGstPan(form.gstPan)) {
            nextErrors.gstPan = "Enter a valid GSTIN or PAN.";
        }

        return nextErrors;
    };

    const validateBankStep = () => {
        const nextErrors = {};

        if (!form.accountName.trim()) {
            nextErrors.accountName = "Account holder name is required.";
        } else if (form.accountName.trim().length < 3) {
            nextErrors.accountName = "Account holder name must be at least 3 characters.";
        }

        if (!form.bankName.trim()) {
            nextErrors.bankName = "Bank name is required.";
        }

        const bankRule = getBankRule(form.bankName);
        const accountNumber = String(form.accountNumber || "").trim();

        if (!accountNumber) {
            nextErrors.accountNumber = "Account number is required.";
        } else if (bankRule?.accountLengths) {
            if (!bankRule.accountLengths.includes(accountNumber.length)) {
                nextErrors.accountNumber = `Account number for ${form.bankName} must be ${formatAccountLength(bankRule)}.`;
            }
        } else if (
            accountNumber.length < (bankRule?.minAccountLength || 9) ||
            accountNumber.length > (bankRule?.maxAccountLength || 18)
        ) {
            nextErrors.accountNumber = `Account number must be ${formatAccountLength(bankRule)}.`;
        }

        const ifsc = String(form.ifsc || "").trim().toUpperCase();
        if (!ifsc) {
            nextErrors.ifsc = "IFSC code is required.";
        } else if (!IFSC_REGEX.test(ifsc)) {
            nextErrors.ifsc = "Enter a valid IFSC code.";
        } else if (bankRule?.ifscPrefix && !ifsc.startsWith(bankRule.ifscPrefix)) {
            nextErrors.ifsc = `IFSC for ${form.bankName} should start with ${bankRule.ifscPrefix}.`;
        }

        if (!form.branch.trim()) {
            nextErrors.branch = "Branch is required.";
        }

        if (!form.billing) {
            nextErrors.billing = "Billing cycle is required.";
        }

        if (!form.plan) {
            nextErrors.plan = "Plan assignment is required.";
        }

        return nextErrors;
    };

    const validateCurrentStep = async (stepKey = activeTab) => {
        let nextErrors = {};

        switch (stepKey) {
            case "personal":
                nextErrors = await validatePersonalStep();
                break;
            case "qualification":
                nextErrors = validateQualificationStep();
                break;
            case "vet":
                nextErrors = validateVetStep();
                break;
            case "practice":
                nextErrors = validatePracticeStep();
                break;
            case "bank":
                nextErrors = validateBankStep();
                break;
            default:
                nextErrors = {};
        }

        setErrors(nextErrors);

        return nextErrors;
    };

    const validateAllSteps = async () => {
        const personalErrors = await validatePersonalStep();
        const qualificationErrors = validateQualificationStep();
        const vetErrors = validateVetStep();
        const practiceErrors = validatePracticeStep();
        const bankErrors = validateBankStep();

        const nextErrors = {
            ...personalErrors,
            ...qualificationErrors,
            ...vetErrors,
            ...practiceErrors,
            ...bankErrors,
        };

        setErrors(nextErrors);

        return nextErrors;
    };

    const goToNextStep = () => {
        if (currentStepIndex < tabs.length - 1) {
            setActiveTab(tabs[currentStepIndex + 1][0]);
        }
    };

    const goToPreviousStep = () => {
        if (currentStepIndex > 0) {
            setActiveTab(tabs[currentStepIndex - 1][0]);
        }
    };

    const hasCurrentStepErrors = () => {
        switch (activeTab) {
            case "qualification":
                return Object.keys(validateQualificationStep()).length > 0;
            case "vet":
                return Object.keys(validateVetStep()).length > 0;
            case "practice":
                return Object.keys(validatePracticeStep()).length > 0;
            case "bank":
                return Object.keys(validateBankStep()).length > 0;
            default:
                return Object.keys(errors).length > 0;
        }
    };

    const handleNext = async () => {
        if (submitting) return;

        const nextErrors = await validateCurrentStep(activeTab);

        if (Object.keys(nextErrors).length) {
            const message = getStepErrorMessage(nextErrors);
            if (message) {
                showToast({
                    type: "error",
                    title: "Validation Error",
                    description: message,
                });
            }
            return;
        }

        goToNextStep();
    };

    const handleSkip = () => {
        if (!isQualificationStep) return;

        setQualifications([{ degree: "", institution: "", year: "" }]);
        clearErrorKeys(
            "qualifications",
            ...qualifications
                .map((_, index) => [
                    `qualification-${index}-degree`,
                    `qualification-${index}-institution`,
                    `qualification-${index}-year`,
                    `qualification-${index}-certificate`,
                ])
                .flat()
        );

        goToNextStep();
    };

    const buildSubmissionPayload = () => {
        const filledRows = qualifications.filter(isQualificationRowFilled);

        const normalizedQualifications = filledRows.map((row) => ({
            degree: String(row.degree === "Other" ? row.customDegree : row.degree || "").trim(),
            institution: String(row.institution || "").trim(),
            year: String(row.year || "").trim(),
        }));

        // Only newly-picked files need to travel back to the server - an
        // untouched row's certificate is still just the existing string URL
        // (see buildQualifications), and re-sending that under a multipart
        // file field would confuse multer. The backend already keeps the
        // existing degreeCertificates on update when none are uploaded.
        const degreeCertificates = filledRows
            .map((row) => row.certificate)
            .filter((certificate) => certificate instanceof File);

        return {
            ...form,
            qualifications: normalizedQualifications,
            degreeCertificates,
            languages: Array.isArray(form.languages) ? form.languages : [],
            specializations: Array.isArray(form.specializations) ? form.specializations : [],
            serviceAreas: parseDelimitedList(form.serviceAreas),
            bankDetails: {
                accountName: form.accountName,
                accountNumber: form.accountNumber,
                ifsc: form.ifsc,
                bankName: form.bankName,
                branch: form.branch,
            },
        };
    };

    const handleSubmit = async () => {
        if (submitting) return;

        const nextErrors = await validateAllSteps();

        if (Object.keys(nextErrors).length) {
            const message = getStepErrorMessage(nextErrors);
            showToast({
                type: "error",
                title: "Validation Error",
                description: message || "Please complete the required fields.",
            });
            return;
        }

        setSubmitting(true);

        try {
            if (isEditMode && !doctorId) {
                throw new Error("Missing veterinarian id for update.");
            }

            const payload = buildSubmissionPayload();
            const response = isEditMode
                ? await updateDoctor(doctorId, payload)
                : await createDoctor(payload);

            showToast({
                type: "success",
                title: isEditMode ? "Veterinarian Updated" : "Veterinarian Created",
                description:
                    response.message ||
                    (isEditMode
                        ? "Veterinarian profile updated successfully."
                        : "Veterinarian profile created and login credentials were emailed to the registered address."),
            });

            onSaved?.(response);

            if (!isEditMode) {
                onCreated?.(response);
            }
            onClose?.();
        } catch (error) {
            showToast({
                type: "error",
                title: isEditMode ? "Update Failed" : "Save Failed",
                description:
                    error.response?.data?.message ||
                    (isEditMode
                        ? "Unable to update veterinarian details. Please try again."
                        : "Unable to save veterinarian details. Please try again."),
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (isLastStep) {
            await handleSubmit();
            return;
        }

        await handleNext();
    };

    const textareaClass = (error) => `
        w-full
        border
        rounded-xl
        p-3.5
        resize-none
        outline-hidden
        transition-all
        text-sm
        ${error
            ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            : "border-gray-200 focus:border-[#0C3D2E] focus:ring-1 focus:ring-[#0C3D2E]"
        }
    `;

    const chipClass = (active) =>
        `inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
            active
                ? "border-[#F7931E]/30 bg-[#FFF4E5] text-[#F7931E] shadow-xs"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#F7931E]/40"
        }`;

    return (
        <form onSubmit={handleFormSubmit}>
            <div className="p-3 sm:p-4 md:p-6 bg-slate-50/50 min-h-full">
                <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
                    {/* PERSONAL */}
                    {activeTab === "personal" && (
                        <Card title="Personal Information">
                            <Grid>
                                <Input
                                    value={form.fullName}
                                    requiredField={true}
                                    name="fullName"
                                    label="Full Name"
                                    error={errors.fullName}
                                    onChange={handleSimpleChange}
                                />

                                <Select
                                    value={form.gender || ""}
                                    requiredField={true}
                                    name="gender"
                                    label="Gender"
                                    options={["Male", "Female", "Other"]}
                                    error={errors.gender}
                                    onChange={handleSimpleChange}
                                />

                                <Input
                                    value={form.dob}
                                    requiredField={true}
                                    type="date"
                                    name="dob"
                                    label="Date of Birth"
                                    error={errors.dob}
                                    max={today}
                                    onChange={handleSimpleChange}
                                />

                                <Input
                                    value={form.mobile}
                                    requiredField={true}
                                    name="mobile"
                                    label="Mobile Number"
                                    error={errors.mobile}
                                    onChange={handleMobileChange}
                                    maxLength={10}
                                    inputMode="numeric"
                                />

                                <Input
                                    value={form.email}
                                    requiredField={true}
                                    name="email"
                                    label="Email Address"
                                    error={errors.email}
                                    onChange={handleSimpleChange}
                                />

                                <Upload
                                    requiredField={true}
                                    label="Profile Photo"
                                    value={form.profilePhoto}
                                    error={errors.profilePhoto}
                                    accept="image/*"
                                    onChange={handleFileUpload("profilePhoto")}
                                    onRemove={() => setFieldValue("profilePhoto", null)}
                                />

                                <Full>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${errors.languages ? "text-rose-600" : "text-gray-500"}`}>
                                        Languages Spoken <span className="text-rose-500">*</span>
                                    </label>

                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
                                        {["English", "Hindi", "Bengali"].map((language) => (
                                            <label key={language} className={chipClass(form.languages?.includes(language))}>
                                                <input
                                                    type="checkbox"
                                                    checked={form.languages?.includes(language) || false}
                                                    onChange={() => toggleArray("languages", language)}
                                                    className="accent-[#F7931E]"
                                                />
                                                {language}
                                            </label>
                                        ))}
                                    </div>

                                    {errors.languages && (
                                        <p className="mt-1 text-xs text-rose-600 font-medium">
                                            {errors.languages}
                                        </p>
                                    )}
                                </Full>

                                <Full>
                                    <label
                                        htmlFor="address"
                                        className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${errors.address ? "text-rose-600" : "text-gray-500"}`}
                                    >
                                        Full Address <span className="text-rose-500">*</span>
                                    </label>

                                    <textarea
                                        value={form.address}
                                        id="address"
                                        name="address"
                                        className={textareaClass(errors.address)}
                                        placeholder="Enter full address"
                                        onChange={handleSimpleChange}
                                    />

                                    {errors.address && (
                                        <p className="mt-1 text-xs text-rose-600 font-medium">
                                            {errors.address}
                                        </p>
                                    )}
                                </Full>

                                <Select
                                    value={form.state || ""}
                                    requiredField={true}
                                    name="state"
                                    label="State"
                                    options={stateOptions}
                                    error={errors.state}
                                    onChange={handleSimpleChange}
                                />

                                <Input
                                    value={form.city || ""}
                                    requiredField={true}
                                    name="city"
                                    label="City"
                                    error={errors.city}
                                    onChange={handleSimpleChange}
                                />

                                <Input
                                    value={form.pincode}
                                    requiredField={true}
                                    name="pincode"
                                    label="PIN Code"
                                    error={errors.pincode}
                                    maxLength={6}
                                    inputMode="numeric"
                                    onChange={handlePincodeChange}
                                />

                                <Select
                                    value={form.govtIdType || ""}
                                    requiredField={true}
                                    name="govtIdType"
                                    label="Government ID Type"
                                    options={["Aadhaar", "PAN", "Passport"]}
                                    error={errors.govtIdType}
                                    onChange={handleSimpleChange}
                                />

                                {form.govtIdType && (
                                    <Input
                                        value={form.govtIdNumber}
                                        requiredField={true}
                                        name="govtIdNumber"
                                        label={govtIdRule.label}
                                        error={errors.govtIdNumber}
                                        placeholder={govtIdRule.placeholder}
                                        maxLength={govtIdRule.maxLength}
                                        inputMode={govtIdRule.inputMode}
                                        onChange={handleGovtIdNumberChange}
                                    />
                                )}

                                {form.govtIdType && (
                                    <Full>
                                        <Upload
                                            requiredField={true}
                                            label={govtIdRule.docLabel}
                                            value={form.govtIdDocument}
                                            error={errors.govtIdDocument}
                                            accept=".pdf,application/pdf"
                                            onChange={handleFileUpload("govtIdDocument")}
                                            onRemove={() => setFieldValue("govtIdDocument", null)}
                                        />
                                    </Full>
                                )}
                            </Grid>
                        </Card>
                    )}

                    {/* QUALIFICATION */}
                    {activeTab === "qualification" && (
                        <Card title="Veterinary Qualifications">
                            <p className="mb-4 text-xs font-medium text-gray-400">
                                This step is optional. Use Skip if you want to add qualification details later.
                            </p>

                            {qualifications.map((qualification, index) => (
                                <div
                                    key={index}
                                    className="mb-4 rounded-2xl border border-gray-100 bg-slate-50/50 p-4 sm:p-5"
                                >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#0C3D2E]">
                                            Degree {index + 1}
                                        </span>

                                        {index > 0 && (
                                            <button
                                                type="button"
                                                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                                                onClick={() =>
                                                    setQualifications((prev) =>
                                                        prev.filter((_, itemIndex) => itemIndex !== index)
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <Grid>
                                        <Select
                                            label="Degree Name"
                                            requiredField={false}
                                            value={qualification.degree || ""}
                                            options={DEGREE_OPTIONS.filter(
                                                (option) =>
                                                    option === "Other" ||
                                                    option === qualification.degree ||
                                                    !qualifications.some(
                                                        (other, otherIndex) =>
                                                            otherIndex !== index && other.degree === option
                                                    )
                                            )}
                                            error={errors[`qualification-${index}-degree`]}
                                            onChange={(e) =>
                                                setQualificationValue(index, "degree", e.target.value)
                                            }
                                        />

                                        {qualification.degree === "Other" && (
                                            <Input
                                                label="Specify Degree"
                                                requiredField={false}
                                                placeholder="Enter degree name"
                                                value={qualification.customDegree || ""}
                                                error={errors[`qualification-${index}-customDegree`]}
                                                onChange={(e) =>
                                                    setQualificationValue(index, "customDegree", e.target.value)
                                                }
                                            />
                                        )}

                                        <Input
                                            label="Institute Name"
                                            requiredField={false}
                                            placeholder="Institution"
                                            value={qualification.institution}
                                            error={errors[`qualification-${index}-institution`]}
                                            onChange={(e) =>
                                                setQualificationValue(index, "institution", e.target.value)
                                            }
                                        />

                                        <Input
                                            label="Year of Passing"
                                            requiredField={false}
                                            placeholder="Year"
                                            value={qualification.year}
                                            error={errors[`qualification-${index}-year`]}
                                            maxLength={4}
                                            inputMode="numeric"
                                            onChange={handleYearChange(index)}
                                        />
                                    </Grid>

                                    <div className="mt-4">
                                        <Upload
                                            requiredField={false}
                                            label="Degree Certificate"
                                            value={qualification.certificate}
                                            error={errors[`qualification-${index}-certificate`]}
                                            accept=".pdf,application/pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                if (file.type !== "application/pdf") {
                                                    showToast({
                                                        type: "error",
                                                        title: "Invalid File",
                                                        description: "Degree certificate must be a PDF file.",
                                                    });
                                                    return;
                                                }
                                                setQualificationValue(index, "certificate", file);
                                            }}
                                            onRemove={() => setQualificationValue(index, "certificate", null)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                className="mt-2 w-full sm:w-auto rounded-xl bg-[#F7931E] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#e08319] shadow-xs"
                                onClick={() =>
                                    setQualifications([
                                        ...qualifications,
                                        { degree: "", institution: "", year: "" },
                                    ])
                                }
                            >
                                + Add Degree
                            </button>

                            {errors.qualifications && (
                                <p className="mt-2 text-xs text-rose-600 font-medium">
                                    {errors.qualifications}
                                </p>
                            )}
                        </Card>
                    )}

                    {/* VET */}
                    {activeTab === "vet" && (
                        <Card title="Vet Council Registration">
                            <Grid>
                                <div>
                                    <Input
                                        requiredField={true}
                                        value={form.vetCouncilRegistrationNumber}
                                        name="vetCouncilRegistrationNumber"
                                        label="Complete Vet Council Registration Number"
                                        error={errors.vetCouncilRegistrationNumber}
                                        onChange={handleSimpleChange}
                                    />
                                    {!errors.vetCouncilRegistrationNumber && (
                                        <p className="mt-1 text-xs text-gray-400">
                                            Up to 18 characters - letters, numbers and symbols allowed (e.g. VCI/MH/2020/123456).
                                        </p>
                                    )}
                                </div>

                                <Select
                                    value={form.stateVetCouncil || ""}
                                    requiredField={true}
                                    name="stateVetCouncil"
                                    label="State Veterinary Council"
                                    options={stateOptions}
                                    error={errors.stateVetCouncil}
                                    onChange={handleSimpleChange}
                                />

                                <Full>
                                    <Upload
                                        requiredField={true}
                                        label="Registration Certificate"
                                        value={form.registrationCertificate}
                                        error={errors.registrationCertificate}
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileUpload("registrationCertificate")}
                                        onRemove={() => setFieldValue("registrationCertificate", null)}
                                    />
                                </Full>

                                <Input
                                    requiredField={true}
                                    type="date"
                                    value={form.certificateValidityDate}
                                    name="certificateValidityDate"
                                    label="Certificate Validity Date"
                                    error={errors.certificateValidityDate}
                                    min={today}
                                    max="9999-12-31"
                                    onChange={handleSimpleChange}
                                />

                                <Full>
                                    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#0C3D2E]/10 bg-white px-4 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-[#0C3D2E]">
                                                Is registration renewable?
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Toggle on if this vet council registration can be renewed after expiry.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFieldValue("isRenewable", !form.isRenewable)}
                                            aria-pressed={Boolean(form.isRenewable)}
                                            aria-label="Is registration renewable?"
                                            className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors duration-300 cursor-pointer ${
                                                form.isRenewable ? "bg-[#F7931E]" : "bg-gray-300"
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                                                    form.isRenewable ? "translate-x-8" : "translate-x-1"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </Full>
                            </Grid>
                        </Card>
                    )}

                    {/* PRACTICE */}
                    {activeTab === "practice" && (
                        <Card title="Practice Details">
                            <Grid>
                                <Input
                                    requiredField={true}
                                    value={form.experience}
                                    name="experience"
                                    label="Years of Experience"
                                    error={errors.experience}
                                    onChange={handleExperienceChange}
                                    inputMode="numeric"
                                    maxLength={2}
                                />

                                <Select
                                    value={form.practiceType || ""}
                                    requiredField={true}
                                    name="practiceType"
                                    label="Practice Type"
                                    options={PRACTICE_TYPES}
                                    error={errors.practiceType}
                                    onChange={handleSimpleChange}
                                />

                                <Input
                                    requiredField={true}
                                    value={form.consultationFee}
                                    name="consultationFee"
                                    label="Consultation Fee (Rs.)"
                                    error={errors.consultationFee}
                                    onChange={handleConsultationFeeChange}
                                    inputMode="numeric"
                                    maxLength={6}
                                />

                                <Full>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                        Specializations
                                    </label>

                                    <div className="flex flex-wrap gap-2">
                                        {SPECIALIZATION_OPTIONS.map((specialization) => {
                                            const active = form.specializations?.includes(specialization) || false;

                                            return (
                                                <button
                                                    key={specialization}
                                                    type="button"
                                                    onClick={() => toggleArray("specializations", specialization)}
                                                    className={chipClass(active)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={active}
                                                        readOnly
                                                        className="accent-[#F7931E]"
                                                    />
                                                    {specialization}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Full>

                                <label className="flex items-center gap-3 text-sm font-semibold text-[#0C3D2E]">
                                    <input
                                        type="checkbox"
                                        name="emergencyAvailable"
                                        checked={Boolean(form.emergencyAvailable)}
                                        onChange={handleSimpleChange}
                                        className="accent-[#0C3D2E] h-4 w-4 rounded-xs"
                                    />
                                    Available for emergency calls
                                </label>

                                <Input
                                    requiredField={true}
                                    name="serviceAreas"
                                    value={form.serviceAreas}
                                    label="Service Areas / Pincodes"
                                    placeholder="Comma-separated list"
                                    error={errors.serviceAreas}
                                    onChange={handleSimpleChange}
                                />

                                <Input
                                    requiredField={true}
                                    name="gstPan"
                                    value={form.gstPan}
                                    label="GST / PAN"
                                    placeholder="GSTIN or PAN"
                                    error={errors.gstPan}
                                    onChange={handleSimpleChange}
                                    maxLength={20}
                                />
                            </Grid>
                        </Card>
                    )}

                    {/* BANK */}
                    {activeTab === "bank" && (
                        <Card title="Banking & Plan">
                            <Grid>
                                <Input
                                    value={form.accountName}
                                    requiredField={true}
                                    name="accountName"
                                    label="Account Holder Name"
                                    error={errors.accountName}
                                    onChange={handleSimpleChange}
                                />

                                <Select
                                    requiredField={true}
                                    name="bankName"
                                    label="Bank Name"
                                    value={form.bankName}
                                    options={BANK_OPTIONS}
                                    error={errors.bankName}
                                    onChange={handleSimpleChange}
                                />

                                <Input
                                    value={form.accountNumber}
                                    requiredField={true}
                                    name="accountNumber"
                                    label="Account Number"
                                    error={errors.accountNumber}
                                    onChange={handleAccountNumberChange}
                                    inputMode="numeric"
                                    maxLength={getMaxAccountLength(getBankRule(form.bankName))}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Expected Length: {formatAccountLength(getBankRule(form.bankName))}
                                </p>

                                <Input
                                    requiredField={true}
                                    name="ifsc"
                                    value={form.ifsc}
                                    label="IFSC Code"
                                    error={errors.ifsc}
                                    onChange={handleIfscChange}
                                    maxLength={11}
                                />

                                <Input
                                    requiredField={true}
                                    name="branch"
                                    label="Branch"
                                    value={form.branch}
                                    error={errors.branch}
                                    onChange={handleSimpleChange}
                                />

                                <Select
                                    value={form.plan || ""}
                                    requiredField={true}
                                    name="plan"
                                    label="Plan Assigned"
                                    options={planOptions}
                                    error={errors.plan}
                                    onChange={handleSimpleChange}
                                />

                                <Select
                                    value={form.billing || ""}
                                    requiredField={true}
                                    name="billing"
                                    label="Billing Cycle"
                                    options={BILLING_CYCLE_OPTIONS}
                                    error={errors.billing}
                                    onChange={handleSimpleChange}
                                />
                            </Grid>
                        </Card>
                    )}

                    {/* FOOTER */}
                    <div className="sticky bottom-0 z-10 -mx-3 sm:-mx-4 md:-mx-6 flex flex-col-reverse gap-3 border-t border-gray-100 bg-slate-50/95 px-3 py-3 shadow-[0_-10px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-4 md:px-6">
                        <button
                            type="button"
                            onClick={currentStepIndex > 0 ? goToPreviousStep : onClose}
                            className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-xs text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                            disabled={submitting}
                        >
                            {currentStepIndex > 0 ? "Previous" : "Cancel"}
                        </button>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            {isQualificationStep && (
                                <button
                                    type="button"
                                    onClick={handleSkip}
                                    className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-xs text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                                    disabled={submitting}
                                >
                                    Skip
                                </button>
                            )}

                            {!isLastStep ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full sm:w-auto rounded-xl bg-[#F7931E] hover:bg-[#e08319] px-6 py-3 font-semibold text-xs text-white transition-all duration-200 transform hover:-translate-y-0.5 shadow-xs disabled:opacity-60"
                                    disabled={submitting || hasCurrentStepErrors()}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="w-full sm:w-auto rounded-xl bg-[#F7931E] hover:bg-[#e08319] px-6 py-3 font-semibold text-xs text-white transition-all duration-200 transform hover:-translate-y-0.5 shadow-xs disabled:opacity-60"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? (isEditMode ? "Updating..." : "Saving...")
                                        : (isEditMode ? "Update Veterinarian" : "Save Veterinarian")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
