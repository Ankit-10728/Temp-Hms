import { useEffect, useMemo, useRef, useState } from "react";
import { State, City } from "country-state-city";
import { showToast } from "../../../../../shared/components/toast";
import { INDIAN_STATE_OPTIONS } from "../../../../../shared/constants/indiaStates";
import {
    BANK_OPTIONS,
    getBankRule,
    formatAccountLength,
    getMaxAccountLength,
    isValidIfsc,
} from "../../../../../shared/constants/bankAccountRules";
import {
    ClipboardDocumentListIcon,
    BeakerIcon,
    BuildingStorefrontIcon
} from "@heroicons/react/24/outline";
import { checkClinicContactAvailability, createClinic, sendClinicAdminOtp, verifyClinicAdminOtp } from "../../../api/clinicApi";
import { getPlans } from "../../../api/planApi";
import { Upload, Card, Select, Grid, Full, Input } from "../../../components";
import { useNavigate } from "react-router-dom";

/* ---------------- MAIN FORM ---------------- */

const DEFAULT_MAP_CENTER = {
    lat: 20.5937,
    lng: 78.9629,
};

const DEFAULT_MAP_ZOOM = 12;
const TILE_SIZE = 256;
const BILLING_MONTHS = {
    Monthly: 1,
    Quarterly: 3,
    "Half-Yearly": 6,
    Annual: 12,
};
const CLINIC_BILLING_CYCLES = ["Monthly", "Quarterly", "Half-Yearly", "Annual"];

const CUSTOM_PLAN = "Custom";
// Matches the Clinic plan-type names in the Plans admin (PlanForm.jsx's
// PLAN_TYPE_CONFIG.Clinic.planNames) - previously only "Basic" and "Custom"
// were assignable here, so any Standard/Professional/Enterprise plan
// created in Plans never appeared in this dropdown.
const CLINIC_ASSIGNABLE_PLAN_NAMES = new Set(["Basic", "Standard", "Professional", "Enterprise", CUSTOM_PLAN]);
const CUSTOM_PLAN_MAX_TRIAL_DAYS = 90;
const LICENSE_NUMBER_MAX_LENGTH = 30;

const GOVT_ID_TYPES = ["Aadhar", "PAN", "Passport"];

const getDateValue = (date) => date.toISOString().slice(0, 10);
const getTodayDate = () => {
    return getDateValue(new Date());
};
const getTomorrowDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return getDateValue(date);
};

const getPlanEndDate = (startDate, billingCycle) => {
    const date = new Date(startDate);
    if (Number.isNaN(date.getTime())) return "";

    date.setMonth(date.getMonth() + (BILLING_MONTHS[billingCycle] || 1));
    const minimumEndDate = new Date(startDate);
    minimumEndDate.setDate(minimumEndDate.getDate() + 30);

    return getDateValue(date < minimumEndDate ? minimumEndDate : date);
};

const getNonNegativeNumber = (value) => {
    const number = Number(value || 0);
    return Number.isFinite(number) ? Math.max(number, 0) : 0;
};

const validateNumberField = (value, fieldName, options = {}) => {
    const {
        required = false,
        min = 0,
        max = 9999,
        isYear = false,
        isPositive = true,
    } = options;

    const normalized = String(value || "").trim();

    if (required && !normalized) {
        return `${fieldName} is required.`;
    }

    if (!normalized) return "";

    if (!/^\d+$/.test(normalized)) {
        return `${fieldName} must contain only numbers.`;
    }

    const numValue = Number(normalized);

    if (isYear) {
        if (!/^\d{4}$/.test(normalized)) {
            return `${fieldName} must be a 4-digit year.`;
        }
        const currentYear = new Date().getFullYear();
        const earliestYear = 1800;
        if (numValue < earliestYear || numValue > currentYear) {
            return `${fieldName} must be between ${earliestYear} and ${currentYear}.`;
        }
    }

    if (isPositive && numValue < 0) {
        return `${fieldName} must be a positive number.`;
    }

    if (numValue < min || numValue > max) {
        return `${fieldName} must be between ${min} and ${max}.`;
    }

    return "";
};

const validateYear = (yearValue) => {
    return validateNumberField(yearValue, "Year of Establishment", {
        required: true,
        isYear: true,
    });
};

const validateMaxStaff = (value) => {
    return validateNumberField(value, "Max staff accounts", {
        required: true,
        min: 1,
        max: 9999,
    });
};

const validateMaxDoctors = (value) => {
    return validateNumberField(value, "Max doctors", {
        required: true,
        min: 1,
        max: 9999,
    });
};

const validateMaxPets = (value) => {
    if (String(value || "").trim().toLowerCase() === "unlimited") {
        return "";
    }
    return validateNumberField(value, "Max pet records", {
        required: true,
        min: 1,
        max: 999999,
    });
};

const validateStorageLimit = (value) => {
    return validateNumberField(value, "Storage limit", {
        required: true,
        min: 1,
        max: 9999,
    });
};

const getTrialDaysForPlanCycle = (plans, subscriptionPlan, billingCycle) => {
    const matchingPlan = plans.find(
        (plan) =>
            plan.subscriptionPlan === subscriptionPlan &&
            plan.billingCycle === billingCycle
    );

    return getNonNegativeNumber(matchingPlan?.trialPeriodDays);
};

const getPlanForCycle = (plans, subscriptionPlan, billingCycle) =>
    plans.find(
        (plan) =>
            plan.subscriptionPlan === subscriptionPlan &&
            plan.billingCycle === billingCycle
    );

const getBillingOptionsForPlan = (plans, subscriptionPlan) => {
    if (subscriptionPlan === CUSTOM_PLAN) {
        return CLINIC_BILLING_CYCLES;
    }

    return [
        ...new Set(
            plans
                .filter((plan) => plan.subscriptionPlan === subscriptionPlan)
                .map((plan) => plan.billingCycle)
                .filter(Boolean)
        ),
    ];
};

const getPlanDerivedFields = (plan) => {
    if (!plan) return {};

    return {
        maxStaff: String(plan.featureLimits?.maxStaffAccounts ?? ""),
        maxDoctors: String(plan.featureLimits?.maxDoctors ?? ""),
        maxPets: plan.featureLimits?.maxPetRecordsUnlimited
            ? "Unlimited"
            : String(plan.featureLimits?.maxPetRecords ?? ""),
        maxPetsUnlimited: Boolean(plan.featureLimits?.maxPetRecordsUnlimited),
        storageLimit: String(plan.featureLimits?.storageLimitGb ?? ""),
        labModule: Boolean(plan.modules?.lab),
        groomingModule: Boolean(plan.modules?.grooming),
        kennelModule: Boolean(plan.modules?.kennel),
        pharmacyModule: Boolean(plan.modules?.onlinePharmacy),
        apiAccess: Boolean(plan.modules?.apiAccess),
        whiteLabel: Boolean(plan.modules?.whiteLabelBranding),
    };
};

const SOLO_DOCTOR_PLAN_NAMES = new Set(["Solo Basic", "Solo Pro"]);

const resolvePlanType = (plan) => {
    if (plan?.planType === "Solo Doctor") return "Solo Doctor";
    if (SOLO_DOCTOR_PLAN_NAMES.has(plan?.subscriptionPlan)) return "Solo Doctor";
    return "Clinic";
};

const lonToTileX = (lon, zoom) =>
    ((lon + 180) / 360) * Math.pow(2, zoom);

const latToTileY = (lat, zoom) => {
    const rad = (lat * Math.PI) / 180;
    return (
        (1 -
            Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) /
        2
    ) * Math.pow(2, zoom);
};

const tileXToLon = (x, zoom) =>
    (x / Math.pow(2, zoom)) * 360 - 180;

const tileYToLat = (y, zoom) => {
    const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

const getDisplayAddress = (address = {}) =>
    [
        address.house_number,
        address.road,
        address.neighbourhood,
        address.suburb,
        address.village,
        address.town,
    ]
        .filter(Boolean)
        .join(", ");

const getCityName = (address = {}) =>
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    "";

const cleanStr = (s) =>
    String(s || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]/g, "");

const STATE_NAME_ALIASES = {
    orissa: "odisha",
    pondicherry: "puducherry",
    uttaranchal: "uttarakhand",
    "nct of delhi": "delhi",
    "delhi nct": "delhi",
};

// Matches a state name (as returned by the postal PIN code API, which doesn't
// always use the exact same casing/punctuation as country-state-city) against
// the canonical country-state-city list, so city lookups by ISO code work.
const matchStateFromList = (postalStateName, statesList) => {
    if (!postalStateName) return null;
    const target = cleanStr(postalStateName);
    let found = statesList.find((s) => cleanStr(s.name) === target);
    if (found) return found;
    found = statesList.find(
        (s) => cleanStr(s.name).includes(target) || target.includes(cleanStr(s.name))
    );
    if (found) return found;
    const aliasTarget = STATE_NAME_ALIASES[target] || target;
    return statesList.find((s) => cleanStr(s.name) === aliasTarget);
};

export default function ClinicForm({
    activeTab,
    form,
    setForm,
    handleChange,
    setActiveTab,
    tabs,
    onClose,
    readOnly = false,
    submitLabel = "Save",
    onSubmitClinic,
    skipSubmitValidation = false,
    skipTabValidation = false,
}) {

    const [mapLocating, setMapLocating] = useState(false);
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const [plansError, setPlansError] = useState("");
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkingContact, setCheckingContact] = useState(false);
    const [adminPhoneOtp, setAdminPhoneOtp] = useState("");
    const [adminPhoneOtpSent, setAdminPhoneOtpSent] = useState(false);
    const [adminPhoneOtpBusy, setAdminPhoneOtpBusy] = useState(false);
    const [adminPhoneOtpError, setAdminPhoneOtpError] = useState("");
    // Stored on `form` (not local state) so ClinicModal's separate
    // tab-completeness check can also see whether the *current* phone
    // value has actually been OTP-verified.
    const adminPhoneOtpVerified = Boolean(form.adminPhone) && form.adminPhoneVerifiedNumber === form.adminPhone;
    const shownDuplicateChecks = useRef(new Set());
    const initialContactValues = useRef({
        email: String(form.email || "").trim().toLowerCase(),
        phone: String(form.phone || "").replace(/\D/g, ""),
        adminEmail: String(form.adminEmail || "").trim().toLowerCase(),
        adminPhone: String(form.adminPhone || "").replace(/\D/g, ""),
        // An existing clinic's saved PIN code is trusted without a fresh
        // lookup; only a *changed* value needs to re-verify against the API.
        pincode: String(form.pincode || "").trim(),
    });
    const navigate = useNavigate();
    const stateOptions = INDIAN_STATE_OPTIONS;
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= 1950; year -= 1) {
            years.push(String(year));
        }
        return years;
    }, []);

    // Address state/city use country-state-city (already used elsewhere in the
    // app) instead of the hand-maintained INDIAN_STATE_OPTIONS list, so the
    // city dropdown can be looked up reliably by the selected state's ISO code.
    const csStates = useMemo(() => State.getStatesOfCountry("IN"), []);
    const addressStateOptions = useMemo(
        () => csStates.map((s) => s.name),
        [csStates]
    );
    const cityOptions = useMemo(() => {
        const matchedState = csStates.find((s) => s.name === form.state);
        if (!matchedState) return [];
        const list = City.getCitiesOfState("IN", matchedState.isoCode) || [];
        const names = list.map((c) => c.name);
        if (form.city && !names.includes(form.city)) {
            return [form.city, ...names];
        }
        return names;
    }, [csStates, form.state, form.city]);
    const idType = form.govtIdType || "";
    const isOnboarding = !onSubmitClinic;
    const idNumberLabel =
        idType === "PAN"
            ? "PAN Number"
            : idType === "Passport"
                ? "Passport Number"
                : "Aadhar Number";

    const idNumberPlaceholder =
        idType === "PAN"
            ? "Enter PAN number"
            : idType === "Passport"
                ? "Enter passport number"
                : "Enter Aadhar number";

    const idDocumentLabel =
        idType === "PAN"
            ? "Upload PAN Card"
            : idType === "Passport"
                ? "Upload Passport"
                : "Upload Aadhar Card";

    useEffect(() => {
        if (activeTab !== "plan" || plans.length) return;

        let active = true;

        const loadPlans = async () => {
            setPlansLoading(true);
            setPlansError("");

            try {
                const res = await getPlans();
                const planList = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                        ? res
                        : [];

                if (active) {
                    setPlans(planList);
                }
            } catch (err) {
                console.error(err);

                if (active) {
                    const message = err.response?.status === 401
                        ? "Please login again as Super Admin to load subscription plans."
                        : err.response?.data?.message || "Unable to load subscription plans.";

                    setPlansError(message);
                    showToast({
                        type: "error",
                        title: "Plans Unavailable",
                        description: message,
                    });
                }
            } finally {
                if (active) {
                    setPlansLoading(false);
                }
            }
        };

        loadPlans();

        return () => {
            active = false;
        };
    }, [activeTab, plans.length]);

    const activePlans = useMemo(
        () =>
            plans.filter(
                (plan) =>
                    CLINIC_ASSIGNABLE_PLAN_NAMES.has(plan.subscriptionPlan) &&
                    (resolvePlanType(plan) === "Clinic" || plan.subscriptionPlan === CUSTOM_PLAN) &&
                    (!plan.status || plan.status === "Active")
            ),
        [plans]
    );

    const billingOptions = useMemo(
        () => getBillingOptionsForPlan(activePlans, form.plan),
        [activePlans, form.plan]
    );

   
    const planOptions = useMemo(
        () =>
            [...new Set([
                "Basic",
                CUSTOM_PLAN,
                ...activePlans.map((plan) => plan.subscriptionPlan).filter(Boolean),
            ])]
                .sort((first, second) => {
                    const order = ["Basic", "Standard", "Professional", "Enterprise", CUSTOM_PLAN];
                    const firstIndex = order.indexOf(first);
                    const secondIndex = order.indexOf(second);
                    if (firstIndex !== -1 && secondIndex !== -1) return firstIndex - secondIndex;
                    if (firstIndex !== -1) return -1;
                    if (secondIndex !== -1) return 1;
                    return first.localeCompare(second);
                }),
        [activePlans]
    );


    const maxTrialDays = useMemo(
        () => getTrialDaysForPlanCycle(activePlans, form.plan, form.billing),
        [activePlans, form.billing, form.plan]
    );

    useEffect(() => {
        if (!planOptions.length) return;

        setForm((prev) => {
            const nextPlan = planOptions.includes(prev.plan) ? prev.plan : planOptions[0];
            const nextBillingOptions = getBillingOptionsForPlan(activePlans, nextPlan);
            const nextBilling = nextBillingOptions.includes(prev.billing)
                ? prev.billing
                : nextBillingOptions[0] || "";
            const nextTrialDays = getTrialDaysForPlanCycle(
                activePlans,
                nextPlan,
                nextBilling
            );
            const nextPlanDetails = getPlanForCycle(activePlans, nextPlan, nextBilling);
            const nextStartDate = isOnboarding && prev.startDate < getTomorrowDate()
                ? getTomorrowDate()
                : prev.startDate;
            const nextEndDate = nextStartDate && nextBilling
                ? getPlanEndDate(nextStartDate, nextBilling)
                : "";

            if (
                prev.plan === nextPlan &&
                prev.billing === nextBilling &&
                prev.startDate === nextStartDate &&
                Number(prev.trialDays || 0) === nextTrialDays &&
                prev.endDate === nextEndDate
            ) {
                return prev;
            }

           // Only reset the Custom Plan limits when actually switching TO
           // Custom from a different plan - once already on Custom, this
           // effect can re-run (e.g. startDate normalization) without
           // wiping out limits the admin already entered/saved.
           const derivedFields =
    nextPlan === CUSTOM_PLAN
        ? prev.plan === CUSTOM_PLAN
            ? {}
            : {
              maxStaff: "",
              maxDoctors: "",
              maxPets: "",
              maxPetsUnlimited: false,
              storageLimit: "",
              labModule: false,
              groomingModule: false,
              kennelModule: false,
              pharmacyModule: false,
              apiAccess: false,
              whiteLabel: false,
          }
        : getPlanDerivedFields(nextPlanDetails);

            return {
                ...prev,
                plan: nextPlan,
                billing: nextBilling,
                startDate: nextStartDate,
                trialDays: nextTrialDays,
                endDate: nextEndDate,
                ...derivedFields,
            };
        });
    }, [activePlans, isOnboarding, planOptions, setForm]);

    const updateMapCoordinates = (latitude, longitude) => {
        setForm((prev) => ({
            ...prev,
            latitude: Number(latitude).toFixed(6),
            longitude: Number(longitude).toFixed(6),
        }));
    };

    const applyKnownLocationCoordinates = (locationForm = form) => {
        const latitude = Number(locationForm.latitude);
        const longitude = Number(locationForm.longitude);

        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            updateMapCoordinates(latitude, longitude);
            return true;
        }

        return false;
    };

    const geocodeManualLocation = async (locationForm = form, signal) => {
        const addressParts = [
            locationForm.address1,
            locationForm.address2,
            locationForm.city,
            locationForm.district,
            locationForm.state,
            locationForm.pincode,
            "India",
        ].filter(Boolean);

        const hasLocationInput =
            locationForm.state ||
            locationForm.city ||
            locationForm.address1 ||
            /^\d{6}$/.test(String(locationForm.pincode || ""));

        if (!hasLocationInput) return false;

        const hasDetailedInput =
            locationForm.address1 ||
            locationForm.address2 ||
            /^\d{6}$/.test(String(locationForm.pincode || ""));

        if (!hasDetailedInput && applyKnownLocationCoordinates(locationForm)) {
            return true;
        }

        setMapLocating(true);
        const locatingTimeout = setTimeout(() => {
            setMapLocating(false);
        }, 5000);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(addressParts.join(", "))}`,
                {
                    signal,
                    headers: {
                        "Accept-Language": "en",
                    },
                }
            );

            const data = await response.json();
            const location = data?.[0];

            if (!location?.lat || !location?.lon) return false;

            updateMapCoordinates(location.lat, location.lon);

            return true;
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error(err);
            }

            return false;
        } finally {
            clearTimeout(locatingTimeout);

            if (!signal?.aborted) {
                setMapLocating(false);
            }
        }
    };

    useEffect(() => {
        if (activeTab !== "address") return;

        const controller = new AbortController();
        const timer = setTimeout(() => {
            geocodeManualLocation(form, controller.signal);
        }, 600);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [
        activeTab,
        form.address1,
        form.address2,
        form.city,
        form.district,
        form.state,
        form.pincode,
        setForm,
    ]);

    const handleAddressChange = (e) => {
        handleChange(e);
    };

    // A stale PIN code from the previous state/district no longer applies
    // once state changes, so it's cleared here rather than left showing an
    // incorrect value until the user notices and fixes it themselves.
    const handleAddressSelectChange = (e) => {
        const { name, value } = e.target;
        const clearedFields = name === "state" ? { city: "", pincode: "" } : {};
        const nextForm = { ...form, [name]: value, ...clearedFields };

        setForm((prev) => ({ ...prev, [name]: value, ...clearedFields }));

        if (!applyKnownLocationCoordinates(nextForm)) {
            geocodeManualLocation(nextForm);
        }
    };

    // Clears the (now stale) PIN code as soon as District is edited, so it
    // never shows a value that belongs to what was typed before. The blur
    // handler below re-resolves it once the user finishes typing.
    const handleDistrictChange = (e) => {
        const { value } = e.target;
        setForm((prev) => ({ ...prev, district: value, pincode: "" }));
    };

    // Resolves a list of api.postalpincode.in PostOffice records into a
    // consistent {state, district, city, pincode} shape, used by all three
    // entry points below (PIN code, City, District) so they always agree on
    // the same state/city names. A locality can have many post offices
    // (Pune alone has 31), so there's no single "correct" one - prefer an
    // exact name match to what the user typed, else the Head Post Office,
    // else just the first result.
    const resolvePostOfficeList = (postOffices, { preferredName, preferredStateName } = {}) => {
        if (!postOffices?.length) return null;

        let pool = postOffices;
        if (preferredStateName) {
            const filtered = postOffices.filter(
                (o) => cleanStr(o.State) === cleanStr(preferredStateName)
            );
            if (filtered.length) pool = filtered;
        }

        // Pick one office and derive state/district/city/pincode all from
        // that SAME record - mixing fields from different post offices in
        // the list (e.g. district from one, pincode from another) produces
        // mismatched, wrong-looking results.
        const preferredClean = cleanStr(preferredName);
        const bestOffice =
            (preferredClean && pool.find((o) => cleanStr(o.Name) === preferredClean)) ||
            pool.find((o) => o.BranchType === "Head Post Office") ||
            pool[0];

        const districtName = bestOffice.District || bestOffice.Block || bestOffice.Circle || bestOffice.Division || "";
        const matchedState = matchStateFromList(bestOffice.State, csStates);

        if (!matchedState) {
            return {
                state: bestOffice.State || "",
                district: districtName,
                city: bestOffice.Block || bestOffice.Name || districtName || "",
                pincode: bestOffice.Pincode || "",
            };
        }

        const stateCities = City.getCitiesOfState("IN", matchedState.isoCode) || [];
        const nameCandidates = [preferredName, bestOffice.Block, bestOffice.Name, bestOffice.District, bestOffice.Circle, bestOffice.Division].filter(Boolean);
        let cityName = "";

        for (const candidate of nameCandidates) {
            const candidateClean = cleanStr(candidate);
            const foundCity = stateCities.find((c) => cleanStr(c.name) === candidateClean);
            if (foundCity) {
                cityName = foundCity.name;
                break;
            }
        }

        if (!cityName) {
            cityName = bestOffice.Block || bestOffice.Name || districtName || "";
        }

        return {
            state: matchedState.name,
            district: districtName,
            city: cityName,
            pincode: bestOffice.Pincode || "",
        };
    };

    const resolveAddressByPincode = async (pincode) => {
        if (pincode.length !== 6) return null;

        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (!data || data[0].Status !== "Success" || !data[0].PostOffice?.length) {
                showToast({
                    type: "error",
                    title: "Invalid PIN Code",
                    description: "PIN Code not found.",
                });
                return null;
            }

            const resolved = resolvePostOfficeList(data[0].PostOffice);
            return resolved ? { ...resolved, pincode } : null;
        } catch (err) {
            console.error(err);
            showToast({
                type: "error",
                title: "Network Error",
                description: "Unable to verify PIN Code.",
            });
            return null;
        }
    };

    // Used by both City and District lookups (name -> {state, district,
    // city, pincode}), optionally scoped to an already-known state so a
    // same-named locality in another state can't be picked by mistake.
    const resolveAddressByName = async (name, preferredStateName) => {
        if (!name) return null;

        try {
            const response = await fetch(
                `https://api.postalpincode.in/postoffice/${encodeURIComponent(name)}`
            );
            const data = await response.json();

            if (data?.[0]?.Status !== "Success" || !data[0]?.PostOffice?.length) {
                return null;
            }

            return resolvePostOfficeList(data[0].PostOffice, { preferredName: name, preferredStateName });
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const handleCityChange = async (e) => {
        const { value } = e.target;
        const nextForm = { ...form, city: value };
        setForm((prev) => ({ ...prev, city: value }));

        const match = await resolveAddressByName(value, form.state);
        if (match) {
            nextForm.pincode = match.pincode;
            nextForm.pincodeVerifiedValue = match.pincode;
            if (match.district) nextForm.district = match.district;
            setForm((prev) => ({
                ...prev,
                pincode: match.pincode,
                // Keep pincodeVerifiedValue in lockstep with pincode whenever
                // it's set programmatically from a resolved address lookup -
                // validateAddressFields() only accepts the pincode as valid
                // when these two match, otherwise Next silently disables
                // with no visible error (same fix as handlePincodeChange).
                pincodeVerifiedValue: match.pincode,
                district: match.district || prev.district,
            }));
        }

        if (!applyKnownLocationCoordinates(nextForm)) {
            geocodeManualLocation(nextForm);
        }
    };

    // District is free text (not a dropdown), so the lookup fires on blur
    // once the user finishes typing rather than on every keystroke. Unlike
    // City, District drives State too - typing a district alone should be
    // enough to resolve the full address, same as typing a PIN code.
    const handleDistrictBlur = async (e) => {
        const value = e.target.value;
        if (!value) return;

        const match = await resolveAddressByName(value);
        if (!match) return;

        const nextForm = {
            ...form,
            state: match.state || form.state,
            city: match.city || form.city,
            district: match.district || value,
            pincode: match.pincode || form.pincode,
            pincodeVerifiedValue: match.pincode || form.pincodeVerifiedValue,
        };
        setForm((prev) => ({
            ...prev,
            state: match.state || prev.state,
            city: match.city || prev.city,
            district: match.district || prev.district,
            pincode: match.pincode || prev.pincode,
            // See handleCityChange - keeps pincodeVerifiedValue in sync with
            // whatever pincode this resolves to, otherwise Next silently
            // disables with no visible error when only City/District (not
            // PIN code directly) was used to fill in the address.
            pincodeVerifiedValue: match.pincode || prev.pincodeVerifiedValue,
        }));

        if (!applyKnownLocationCoordinates(nextForm)) {
            geocodeManualLocation(nextForm);
        }
    };

    const handleMapLocationSelect = (location) => {
        setForm((prev) => ({
            ...prev,
            address1: location.address1 || prev.address1,
            address2: location.address2 || prev.address2,
            city: location.city || prev.city,
            district: location.district || location.city || prev.district,
            state: location.state || prev.state,
            pincode: location.pincode || prev.pincode,
            // See handleCityChange - keeps pincodeVerifiedValue in sync so
            // a pincode filled in via map-pin selection doesn't silently
            // fail validateAddressFields() and disable Next with no
            // visible error.
            pincodeVerifiedValue: location.pincode || prev.pincodeVerifiedValue,
            latitude: location.latitude,
            longitude: location.longitude,
            serviceAreas: prev.serviceAreas?.length
                ? [...prev.serviceAreas]
                : [location.city || ""],
        }));
    };

    const validatePincode = (pincode) => resolveAddressByPincode(pincode);

    const addServiceArea = () => {
        setForm((prev) => ({
            ...prev,
            serviceAreas: [...(prev.serviceAreas || []), ""],
        }));
    };

    const updateServiceArea = (index, value) => {
        const updated = [...(form.serviceAreas || [])];
        updated[index] = getPhoneDigits(value).slice(0, 6);

        setForm((prev) => ({
            ...prev,
            serviceAreas: updated,
        }));
    };

    const removeServiceArea = (index) => {
        const updated = [...form.serviceAreas];
        updated.splice(index, 1);

        setForm((prev) => ({
            ...prev,
            serviceAreas: updated,
        }));
    };

    const handleFileUpload = (field) => (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (field === "logo") {
            const allowedLogoFiles = [
                "image/png",
                "image/jpeg",
                "image/jpg",
                "application/pdf",
            ];

            if (!allowedLogoFiles.includes(file.type)) {
                showToast({
                    type: "error",
                    title: "Invalid File",
                    description: "Only JPG, JPEG, PNG or PDF files are allowed.",
                });

                e.target.value = "";
                return;
            }
        } else if (["profile", "cheque", "idDoc"].includes(field)) {
            const allowedImageOrPdfFiles = [
                "image/png",
                "image/jpeg",
                "image/jpg",
                "application/pdf",
            ];

            if (!allowedImageOrPdfFiles.includes(file.type)) {
                showToast({
                    type: "error",
                    title: "Invalid File",
                    description: "Only JPG, JPEG, PNG or PDF files are allowed.",
                });

                e.target.value = "";
                return;
            }
        } else {
            if (file.type !== "application/pdf") {
                showToast({
                    type: "error",
                    title: "Invalid File",
                    description: "Only PDF files are allowed.",
                });

                e.target.value = "";
                return;
            }
        }

        setForm((prev) => ({
            ...prev,
            [field]: file,
        }));
    };

    const getPhoneDigits = (value) => String(value || "").replace(/\D/g, "");

    const isValidMobileNumber = (value) => /^[6-9]\d{9}$/.test(getPhoneDigits(value));

    const isValidEmail = (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());

    const isValidPan = (value) =>
        /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(value || "").trim().toUpperCase());

    const isValidGst = (value) =>
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
            String(value || "").trim().toUpperCase()
        );

    const isAlphabeticText = (value) =>
        /^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(String(value || "").trim());

    const isValidWebsiteUrl = (value) => {
        const website = String(value || "").trim();

        if (!website) return true;
        if (/\s/.test(website)) return false;

        try {
            const url = new URL(
                /^https?:\/\//i.test(website) ? website : `https://${website}`
            );

            return (
                ["http:", "https:"].includes(url.protocol) &&
                url.hostname.includes(".") &&
                !/^\d+$/.test(url.hostname.replace(/\./g, ""))
            );
        } catch {
            return false;
        }
    };

    const handlePhoneChange = (e) => {
        const { name, value } = e.target;
        const digitsOnly = getPhoneDigits(value).slice(0, 10);

        handleChange({
            target: {
                name,
                value: digitsOnly,
                type: "text",
            },
        });
    };

    const handleDigitsChange = (maxLength) => (e) => {
        const { name, value } = e.target;
        const digitsOnly = getPhoneDigits(value).slice(0, maxLength);

        handleChange({
            target: {
                name,
                value: digitsOnly,
                type: "text",
            },
        });
    };

    const handleUppercaseChange = (maxLength) => (e) => {
        const { name, value } = e.target;

        handleChange({
            target: {
                name,
                value: value.toUpperCase().slice(0, maxLength),
                type: "text",
            },
        });
    };

    const handleAlphaSpaceChange = (e) => {
        const { value } = e.target;

        if (/^[A-Za-z\s]*$/.test(value)) {
            handleChange(e);
        }
    };

    const handlePlanChange = (e) => {
        const plan = e.target.value;

        setForm((prev) => {
            const nextBillingOptions = getBillingOptionsForPlan(activePlans, plan);
            const billing = nextBillingOptions.includes(prev.billing)
                ? prev.billing
                : nextBillingOptions[0] || "";
            const nextPlanDetails = getPlanForCycle(activePlans, plan, billing);
            const startDate = isOnboarding && prev.startDate < getTomorrowDate()
                ? getTomorrowDate()
                : prev.startDate;

            const derivedFields =
    plan === CUSTOM_PLAN
        ? {
              maxStaff: "",
              maxDoctors: "",
              maxPets: "",
              maxPetsUnlimited: false,
              storageLimit: "",
              labModule: false,
              groomingModule: false,
              kennelModule: false,
              pharmacyModule: false,
              apiAccess: false,
              whiteLabel: false,
          }
        : getPlanDerivedFields(nextPlanDetails);

            return {
                ...prev,
                plan,
                billing,
                startDate,
                trialDays: getTrialDaysForPlanCycle(activePlans, plan, billing),
                endDate: billing ? getPlanEndDate(startDate, billing) : "",
                ...derivedFields,
            };
        });
    };

    const handleBillingChange = (e) => {
        const billing = e.target.value;

        setForm((prev) => ({
            ...prev,
            billing,
            trialDays: getTrialDaysForPlanCycle(activePlans, prev.plan, billing),
            endDate: prev.startDate && billing ? getPlanEndDate(prev.startDate, billing) : "",
            ...getPlanDerivedFields(getPlanForCycle(activePlans, prev.plan, billing)),
        }));
    };

    const handleStartDateChange = (e) => {
        const startDate = e.target.value;
        const isCustomPlan = form.plan === CUSTOM_PLAN;

        setForm((prev) => ({
            ...prev,
            startDate,
            // Custom plan's end date is manually edited, not derived from a
            // billing cycle (which is blank for Custom) - don't overwrite it.
            endDate: isCustomPlan
                ? prev.endDate
                : startDate && prev.billing
                    ? getPlanEndDate(startDate, prev.billing)
                    : "",
        }));

        setErrors((prev) => ({
            ...prev,
            startDate: !isCustomPlan && startDate && startDate < getTomorrowDate() ? "Plan start date must be a future date." : undefined,
        }));
    };

    const handlePincodeChange = (e) => {
        const pincode = getPhoneDigits(e.target.value).slice(0, 6);

        handleChange({
            target: {
                name: "pincode",
                value: pincode,
                type: "text",
            },
        });

        if (pincode.length === 6) {
            validatePincode(pincode).then((location) => {
                if (!location) return;
                const nextForm = { ...form, ...location, pincodeVerifiedValue: pincode };
                setForm((prev) => ({ ...prev, ...location, pincodeVerifiedValue: pincode }));
                geocodeManualLocation(nextForm);
                showToast({ type: "success", title: "Address Updated", description: "Address and map were updated from the latest PIN code data." });
            });
        }
    };

    const clearError = (field) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const checkContact = async (field) => {
        const value = String(form[field] || "").trim();
        const isEmail = field.toLowerCase().includes("email");

        // Live format feedback even before the value is otherwise valid
        // enough to run the duplicate-availability check below - Next
        // being disabled via hasCurrentTabErrors() gave no visible reason
        // for a malformed email/phone, since that disable-only path never
        // called setErrors.
        if (!value) {
            clearError(field);
            return "";
        }
        if (isEmail ? !isValidEmail(value) : !isValidMobileNumber(value)) {
            setErrors((prev) => ({
                ...prev,
                [field]: isEmail ? "Please enter a valid email address." : "Enter a valid 10-digit mobile number.",
            }));
            return "";
        }

        const normalizedValue = isEmail ? value.toLowerCase() : getPhoneDigits(value);
        // Editing a clinic: do not re-check its own unchanged contact details.
        if (onSubmitClinic && normalizedValue === initialContactValues.current[field]) {
            clearError(field);
            return "";
        }
        try {
            const result = await checkClinicContactAvailability(isEmail ? { email: value } : { phone: value });
            if (!result.available) {
                const message = result.message || `This ${isEmail ? "email" : "phone number"} is already being used.`;
                setErrors((prev) => ({ ...prev, [field]: message }));
                const duplicateKey = `${field}:${value.toLowerCase()}`;
                if (!shownDuplicateChecks.current.has(duplicateKey)) {
                    shownDuplicateChecks.current.add(duplicateKey);
                    window.alert(message);
                }
                // Clear the rejected value so the admin types a fresh one
                // instead of having to manually delete the duplicate first.
                setForm((prev) => ({ ...prev, [field]: "" }));
                return message;
            }
            clearError(field);
            return "";
        } catch (error) {
            console.error("Contact availability check failed", error);
            return "";
        }
    };

    const handleSendAdminOtp = async () => {
        if (!isValidMobileNumber(form.adminPhone)) {
            setAdminPhoneOtpError("Enter a valid 10-digit mobile number first.");
            return;
        }
        setAdminPhoneOtpBusy(true);
        setAdminPhoneOtpError("");
        try {
            await sendClinicAdminOtp(form.adminPhone);
            setAdminPhoneOtpSent(true);
            setAdminPhoneOtp("");
            showToast({ type: "success", title: "OTP Sent", description: "Check the backend logs for the OTP (SMS delivery isn't wired up yet)." });
        } catch (error) {
            setAdminPhoneOtpError(error.response?.data?.message || "Failed to send OTP.");
        } finally {
            setAdminPhoneOtpBusy(false);
        }
    };

    const handleVerifyAdminOtp = async () => {
        if (!/^\d{6}$/.test(adminPhoneOtp)) {
            setAdminPhoneOtpError("Enter the 6 digit OTP.");
            return;
        }
        setAdminPhoneOtpBusy(true);
        setAdminPhoneOtpError("");
        try {
            await verifyClinicAdminOtp(form.adminPhone, adminPhoneOtp);
            setForm((prev) => ({ ...prev, adminPhoneVerifiedNumber: form.adminPhone }));
            setErrors((prev) => ({ ...prev, adminPhone: undefined }));
        } catch (error) {
            setAdminPhoneOtpError(error.response?.data?.message || "Invalid or expired OTP.");
        } finally {
            setAdminPhoneOtpBusy(false);
        }
    };

    // Check as soon as the user finishes a valid email or 10-digit phone number;
    // the short delay prevents a request for every individual keystroke.
    useEffect(() => {
        const fields = ["email", "phone", "adminEmail", "adminPhone"];
        const timer = window.setTimeout(() => {
            fields.forEach((field) => checkContact(field));
        }, 400);
        return () => window.clearTimeout(timer);
    }, [form.email, form.phone, form.adminEmail, form.adminPhone]);

    // Live length feedback for Full Name - matches the same "disabled Next
    // with no visible reason" gap the contact fields had above.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            const trimmed = normalizeText(form.adminName);
            if (!trimmed) {
                clearError("adminName");
            } else if (trimmed.length < 3) {
                setErrors((prev) => ({ ...prev, adminName: "Full name must be at least 3 characters." }));
            } else if (!isAlphabeticText(form.adminName)) {
                setErrors((prev) => ({ ...prev, adminName: "Full name should contain only letters and spaces." }));
            } else {
                clearError("adminName");
            }
        }, 400);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.adminName]);

    const normalizeText = (value) => String(value ?? "").trim();

    const isFileLike = (value) =>
        Boolean(value) && typeof value === "object" && Boolean(value.name || value.type);

    const hasAnyValue = (values) =>
        values.some((value) => isFileLike(value) || normalizeText(value).length > 0);

    const clearErrorsForFields = (fields = []) => {
        setErrors((prev) => {
            const next = { ...prev };

            fields.forEach((field) => {
                delete next[field];
            });

            return next;
        });
    };

    const firstErrorMessage = (nextErrors) => Object.values(nextErrors)[0] || "";

    const applyValidationErrors = (nextErrors) => {
        setErrors(nextErrors);

        const message = firstErrorMessage(nextErrors);

        if (message) {
            showToast({
                type: "error",
                title: "Validation Error",
                description: message,
            });
        }
    };

    const isValidPassport = (value) =>
        /^[A-Z][0-9]{7}$/.test(normalizeText(value).toUpperCase());

    const validateIdentityFields = () => {
        const nextErrors = {};
        const primaryContact = getPhoneDigits(form.phone);
        const alternateContact = getPhoneDigits(form.altPhone);
        const website = normalizeText(form.website);

        if (!normalizeText(form.clinicName)) {
            nextErrors.clinicName = "Clinic name is required.";
        } else if (normalizeText(form.clinicName).length < 3) {
            nextErrors.clinicName = "Clinic name must be at least 3 characters.";
        }

        if (!normalizeText(form.facilityType)) {
            nextErrors.facilityType = "Type of facility is required.";
        }

        const yearError = validateYear(form.year);
        if (yearError) nextErrors.year = yearError;

        if (!primaryContact) {
            nextErrors.phone = "Primary contact is required.";
        } else if (!isValidMobileNumber(primaryContact)) {
            nextErrors.phone = "Primary contact must be a valid 10-digit mobile number.";
        }

        if (alternateContact && !isValidMobileNumber(alternateContact)) {
            nextErrors.altPhone = "Alternate contact must be a valid 10-digit mobile number.";
        }

        if (primaryContact && alternateContact && primaryContact === alternateContact) {
            nextErrors.altPhone = "Alternate contact must be different from primary contact.";
        }

        if (!normalizeText(form.email)) {
            nextErrors.email = "Official email is required.";
        } else if (!isValidEmail(form.email)) {
            nextErrors.email = "Please enter a valid email address.";
        }

        if (website && !isValidWebsiteUrl(website)) {
            nextErrors.website = "Please enter a valid website URL.";
        }

        if (!isFileLike(form.logo)) {
            nextErrors.logo = "Clinic logo image or PDF is required.";
        }

        return nextErrors;
    };

    const validateAddressFields = () => {
        const nextErrors = {};
        const pincode = normalizeText(form.pincode);

        if (!normalizeText(form.address1)) {
            nextErrors.address1 = "Address line 1 is required.";
        }

        if (!normalizeText(form.state)) {
            nextErrors.state = "State is required.";
        }

        if (!normalizeText(form.city)) {
            nextErrors.city = "City is required.";
        }

        if (!normalizeText(form.district)) {
            nextErrors.district = "District is required.";
        }

        if (!pincode) {
            nextErrors.pincode = "PIN code is required.";
        } else if (!/^\d{6}$/.test(pincode)) {
            nextErrors.pincode = "PIN code must be exactly 6 digits.";
        } else if (
            form.pincodeVerifiedValue !== pincode &&
            initialContactValues.current.pincode !== pincode
        ) {
            nextErrors.pincode = "Enter a valid PIN code that exists in India.";
        }

        return nextErrors;
    };

    const validateLicensesFields = () => {
        const nextErrors = {};
        const licensePairs = [
            { numberField: "vetReg", documentField: "vetCert", expiryField: "vetExpiry", label: "Registration" },
            { numberField: "tradeLicense", documentField: "tradeDoc", expiryField: "tradeExpiry", label: "Trade license" },
            { numberField: "drugLicense", documentField: "drugDoc", expiryField: "drugExpiry", label: "Drug license" },
        ];
        const today = getDateValue(new Date());

        if (!normalizeText(form.stateCouncil)) {
            nextErrors.stateCouncil = "State Vet Council is required.";
        }

        const hasCompletePair = licensePairs.some(({ numberField, documentField, expiryField }) =>
            normalizeText(form[numberField]) && isFileLike(form[documentField]) && normalizeText(form[expiryField])
        );

        licensePairs.forEach(({ numberField, documentField, expiryField, label }) => {
            const hasNumber = Boolean(normalizeText(form[numberField]));
            const hasDocument = isFileLike(form[documentField]);
            const hasExpiry = Boolean(normalizeText(form[expiryField]));
            const hasAnyLicenseDetail = hasNumber || hasDocument || hasExpiry;

            if (hasNumber && normalizeText(form[numberField]).length > LICENSE_NUMBER_MAX_LENGTH) {
                nextErrors[numberField] = `${label} number must be ${LICENSE_NUMBER_MAX_LENGTH} characters or less.`;
            }

            if (hasAnyLicenseDetail && !hasNumber) {
                nextErrors[numberField] = `${label} number is required.`;
            }

            if (hasAnyLicenseDetail && !hasDocument) {
                nextErrors[documentField] = `${label} document is required.`;
            }

            if (hasAnyLicenseDetail && !hasExpiry) {
                nextErrors[expiryField] = `${label} expiry date is required.`;
            } else if (hasExpiry && form[expiryField] < today) {
                nextErrors[expiryField] = `${label} expiry date cannot be in the past.`;
            }
        });

        if (!hasCompletePair) {
            nextErrors.vetReg = "Provide any one license number, supporting document, and expiry date.";
        }

        return nextErrors;
    };

    const validateTaxFields = (allowEmptySection = false) => {
        const nextErrors = {};
        const sectionHasData = hasAnyValue([
            form.gst,
            form.pan,
            form.bankName,
            form.accountNumber,
            form.ifsc,
            form.cheque,
        ]);

        if (allowEmptySection && !sectionHasData) {
            return nextErrors;
        }

        if (!normalizeText(form.gst)) {
            nextErrors.gst = "GST number is required.";
        } else if (!isValidGst(form.gst)) {
            nextErrors.gst = "GST number must follow the standard 15-character format.";
        }

        if (!normalizeText(form.pan)) {
            nextErrors.pan = "PAN number is required.";
        } else if (!isValidPan(form.pan)) {
            nextErrors.pan = "PAN number must follow the format AAAAA9999A.";
        }

        if (!normalizeText(form.bankName)) {
            nextErrors.bankName = "Bank name is required.";
        } else if (!isAlphabeticText(form.bankName)) {
            nextErrors.bankName = "Bank name should contain only letters and spaces.";
        }

        if (!normalizeText(form.accountNumber)) {
            nextErrors.accountNumber = "Account number is required.";
        } else {
    const rule = getBankRule(form.bankName);
    const account = normalizeText(form.accountNumber);

    if (rule?.accountLengths) {
        if (!rule.accountLengths.includes(account.length)) {
            nextErrors.accountNumber =
                `Account number for ${form.bankName} must be ${formatAccountLength(rule)}.`;
        }
    } else {
        if (
            account.length < (rule?.minAccountLength || 9) ||
            account.length > (rule?.maxAccountLength || 18)
        ) {
            nextErrors.accountNumber =
                `Account number must be ${formatAccountLength(rule)}.`;
        }
    }
}

        if (!normalizeText(form.ifsc)) {
            nextErrors.ifsc = "IFSC code is required.";
        } else {
    const rule = getBankRule(form.bankName);
    const ifsc = normalizeText(form.ifsc).toUpperCase();

    if (!isValidIfsc(ifsc)) {
        nextErrors.ifsc =
            "IFSC code must follow the format ABCD0XXXXXX.";
    } else if (
        rule?.ifscPrefix &&
        !ifsc.startsWith(rule.ifscPrefix)
    ) {
        nextErrors.ifsc =
            `IFSC for ${form.bankName} should start with ${rule.ifscPrefix}.`;
    }
}

        if (!isFileLike(form.cheque)) {
            nextErrors.cheque = "Cancelled cheque is required.";
        }

        return nextErrors;
    };

    // Same "Next silently disabled" gap on the Licenses & Registrations tab
    // - validateLicensesFields() only ever ran on Next-click/submit, never
    // populating errors live.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            const licenseErrors = validateLicensesFields();
            setErrors((prev) => ({
                ...prev,
                stateCouncil: licenseErrors.stateCouncil,
                vetReg: licenseErrors.vetReg,
                vetCert: licenseErrors.vetCert,
                vetExpiry: licenseErrors.vetExpiry,
                tradeLicense: licenseErrors.tradeLicense,
                tradeDoc: licenseErrors.tradeDoc,
                tradeExpiry: licenseErrors.tradeExpiry,
                drugLicense: licenseErrors.drugLicense,
                drugDoc: licenseErrors.drugDoc,
                drugExpiry: licenseErrors.drugExpiry,
            }));
        }, 400);
        return () => window.clearTimeout(timer);
    }, [
        form.stateCouncil,
        form.vetReg, form.vetCert, form.vetExpiry,
        form.tradeLicense, form.tradeDoc, form.tradeExpiry,
        form.drugLicense, form.drugDoc, form.drugExpiry,
    ]);

    // Same "Next silently disabled" gap on Clinic Identity - email/phone
    // already get live feedback via checkContact above, but clinicName,
    // facilityType, year, website, and logo never did.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            const identityErrors = validateIdentityFields();
            setErrors((prev) => ({
                ...prev,
                clinicName: identityErrors.clinicName,
                facilityType: identityErrors.facilityType,
                year: identityErrors.year,
                website: identityErrors.website,
                logo: identityErrors.logo,
            }));
        }, 400);
        return () => window.clearTimeout(timer);
    }, [form.clinicName, form.facilityType, form.year, form.website, form.logo]);

    // Address1/State/City/District/PIN are only otherwise checked inside
    // validateAddressFields, which runs on Next-click or (silently, to
    // compute the disabled state) via hasCurrentTabErrors - neither of
    // those paths calls setErrors, so Next would grey out with no visible
    // reason (e.g. a manually-typed PIN code whose lookup never resolves).
    useEffect(() => {
        const timer = window.setTimeout(() => {
            const addressErrors = validateAddressFields();
            setErrors((prev) => ({
                ...prev,
                address1: addressErrors.address1,
                state: addressErrors.state,
                city: addressErrors.city,
                district: addressErrors.district,
                pincode: addressErrors.pincode,
            }));
        }, 400);
        return () => window.clearTimeout(timer);
    }, [form.address1, form.state, form.city, form.district, form.pincode, form.pincodeVerifiedValue]);

    // GST/PAN/bank/IFSC/cheque are only otherwise checked inside
    // validateTaxFields, which runs on Next-click or (silently, to compute
    // the disabled state) via hasCurrentTabErrors - neither of those paths
    // calls setErrors, so the Next button would grey out with no visible
    // reason. Mirrors the debounced email/phone live-check above.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            const taxErrors = validateTaxFields(true);
            setErrors((prev) => ({
                ...prev,
                gst: taxErrors.gst,
                pan: taxErrors.pan,
                bankName: taxErrors.bankName,
                accountNumber: taxErrors.accountNumber,
                ifsc: taxErrors.ifsc,
                cheque: taxErrors.cheque,
            }));
        }, 400);
        return () => window.clearTimeout(timer);
    }, [form.gst, form.pan, form.bankName, form.accountNumber, form.ifsc, form.cheque]);

    const validateGovtIdFields = () => {
        const nextErrors = {};
        const selectedType = normalizeText(form.govtIdType);
        const idValue = normalizeText(form.govtIdNumber).toUpperCase();

        if (!selectedType) {
            nextErrors.govtIdType = "Government ID type is required.";
            return nextErrors;
        }

        if (!idValue) {
            nextErrors.govtIdNumber = `${idNumberLabel} is required.`;
            return nextErrors;
        }

        if (selectedType === "PAN" && !isValidPan(idValue)) {
            nextErrors.govtIdNumber = "PAN number must follow the format AAAAA9999A.";
        } else if (selectedType === "Passport" && !isValidPassport(idValue)) {
            nextErrors.govtIdNumber = "Passport number must follow the format A1234567.";
        } else if (selectedType !== "PAN" && selectedType !== "Passport" && !/^\d{12}$/.test(idValue)) {
            nextErrors.govtIdNumber = "Aadhar number must be exactly 12 digits.";
        }

        return nextErrors;
    };

    const validateAdminFields = () => {
        const nextErrors = {};

        if (!normalizeText(form.adminName)) {
            nextErrors.adminName = "Full name is required.";
        } else if (normalizeText(form.adminName).length < 3) {
            nextErrors.adminName = "Full name must be at least 3 characters.";
        } else if (!isAlphabeticText(form.adminName)) {
            nextErrors.adminName = "Full name should contain only letters and spaces.";
        }

        if (!normalizeText(form.designation)) {
            nextErrors.designation = "Designation is required.";
        } else if (!isAlphabeticText(form.designation)) {
            nextErrors.designation = "Designation should contain only letters and spaces.";
        }

        if (!normalizeText(form.adminPhone)) {
            nextErrors.adminPhone = "Mobile number is required.";
        } else if (!isValidMobileNumber(form.adminPhone)) {
            nextErrors.adminPhone = "Mobile number must be a valid 10-digit number.";
        }

        if (!normalizeText(form.adminEmail)) {
            nextErrors.adminEmail = "Email is required.";
        } else if (!isValidEmail(form.adminEmail)) {
            nextErrors.adminEmail = "Please enter a valid email address.";
        }

        const govtIdErrors = validateGovtIdFields();
        Object.assign(nextErrors, govtIdErrors);

        if (!isFileLike(form.idDoc)) {
            nextErrors.idDoc = `${idDocumentLabel} is required.`;
        }

        if (!isFileLike(form.profile)) {
            nextErrors.profile = "Profile photo or PDF is required.";
        }

        return nextErrors;
    };

    // Same "Next silently disabled" gap on Admin Info - adminName/adminEmail/
    // adminPhone already get live feedback above, but designation and the
    // Govt ID type/number/document pair never did.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            const adminErrors = validateAdminFields();
            setErrors((prev) => ({
                ...prev,
                designation: adminErrors.designation,
                govtIdType: adminErrors.govtIdType,
                govtIdNumber: adminErrors.govtIdNumber,
                idDoc: adminErrors.idDoc,
                profile: adminErrors.profile,
            }));
        }, 400);
        return () => window.clearTimeout(timer);
    }, [form.designation, form.govtIdType, form.govtIdNumber, form.idDoc, form.profile]);

    const validatePlanFields = ({ syncEndDate = true } = {}) => {
        const nextErrors = {};
        const isCustomPlan = form.plan === CUSTOM_PLAN;

        if (!normalizeText(form.plan)) {
            nextErrors.plan = "Subscription plan is required.";
        } else if (!planOptions.includes(form.plan)) {
            nextErrors.plan = "Please select a configured subscription plan.";
        }

        if (!isCustomPlan) {
            if (!normalizeText(form.billing)) {
                nextErrors.billing = "Billing cycle is required.";
            } else if (!billingOptions.includes(form.billing)) {
                nextErrors.billing = "Please select Monthly, Quarterly, Half-Yearly, or Annual.";
            }
        }

        const tomorrow = getTomorrowDate();

        if (!normalizeText(form.startDate)) {
            nextErrors.startDate = "Plan start date is required.";
        } else if (!isCustomPlan && form.startDate < tomorrow) {
            nextErrors.startDate = "Plan start date must be a future date.";
        }

        if (isCustomPlan) {
            if (!normalizeText(form.endDate)) {
                nextErrors.endDate = "Plan end / renewal date is required.";
            } else if (form.startDate && form.endDate < form.startDate) {
                nextErrors.endDate = "Plan end / renewal date must be on or after the start date.";
            }
        } else {
            const expectedEndDate =
                form.startDate && form.billing
                    ? getPlanEndDate(form.startDate, form.billing)
                    : "";

            if (expectedEndDate && form.endDate !== expectedEndDate) {
                nextErrors.endDate = "Plan end / renewal date does not match the selected billing cycle.";
                if (syncEndDate) {
                    setForm((prev) => ({
                        ...prev,
                        endDate: expectedEndDate,
                    }));
                }
            }
        }

        const trialDaysMax = isCustomPlan ? CUSTOM_PLAN_MAX_TRIAL_DAYS : maxTrialDays;
        const trialDays = Number(form.trialDays ?? 0);

        if (Number.isNaN(trialDays) || trialDays < 0 || trialDays > trialDaysMax) {
            nextErrors.trialDays = `Trial period must be between 0 and ${trialDaysMax} days.`;
        }

        // Required for all plans
        const maxStaffError = validateMaxStaff(form.maxStaff);
        if (maxStaffError) nextErrors.maxStaff = maxStaffError;

        const maxDoctorsError = validateMaxDoctors(form.maxDoctors);
        if (maxDoctorsError) nextErrors.maxDoctors = maxDoctorsError;

        const maxPetsError = validateMaxPets(form.maxPets);
        if (maxPetsError) nextErrors.maxPets = maxPetsError;

        const storageLimitError = validateStorageLimit(form.storageLimit);
        if (storageLimitError) nextErrors.storageLimit = storageLimitError;

        if (isCustomPlan) {
            const customPrice = Number(form.customPlanPrice);
            if (!normalizeText(form.customPlanPrice) || Number.isNaN(customPrice) || customPrice <= 0) {
                nextErrors.customPlanPrice = "Custom plan price must be a positive number.";
            }
        }

        return nextErrors;
    };

    const validateCurrentTab = (tabKey = activeTab, allowEmptyOptional = false) => {
        switch (tabKey) {
            case "identity":
                return validateIdentityFields();
            case "address":
                return validateAddressFields();
            case "licenses":
                return validateLicensesFields(allowEmptyOptional);
            case "tax":
                return validateTaxFields(allowEmptyOptional);
            case "admin":
                return validateAdminFields();
            case "plan":
                return validatePlanFields();
            default:
                return {};
        }
    };

    const validateEntireForm = (options) => ({
        ...validateIdentityFields(),
        ...validateAddressFields(),
        ...validateLicensesFields(true),
        ...validateTaxFields(true),
        ...validateAdminFields(),
        ...validatePlanFields(options),
    });

    useEffect(() => {
        const errorFields = Object.keys(errors);
        if (!errorFields.length) return;

        const latestErrors = validateEntireForm({ syncEndDate: false });
        const resolvedFields = errorFields.filter((field) => !latestErrors[field]);

        if (!resolvedFields.length) return;

        clearErrorsForFields(resolvedFields);
    }, [
        errors,
        form.clinicName,
        form.facilityType,
        form.year,
        form.phone,
        form.altPhone,
        form.email,
        form.website,
        form.logo,
        form.address1,
        form.state,
        form.city,
        form.district,
        form.pincode,
        form.serviceAreas,
        form.stateCouncil,
        form.vetReg,
        form.vetCert,
        form.vetExpiry,
        form.tradeLicense,
        form.tradeDoc,
        form.tradeExpiry,
        form.drugLicense,
        form.drugDoc,
        form.drugExpiry,
        form.gst,
        form.pan,
        form.bankName,
        form.accountNumber,
        form.ifsc,
        form.cheque,
        form.adminName,
        form.designation,
        form.adminPhone,
        form.adminEmail,
        form.govtIdType,
        form.govtIdNumber,
        form.idDoc,
        form.profile,
        form.plan,
        form.billing,
        form.startDate,
        form.endDate,
        form.trialDays,
        form.maxStaff,
        form.maxDoctors,
        form.maxPets,
        form.storageLimit,
        planOptions,
        billingOptions,
        maxTrialDays,
    ]);

    const goToAdjacentTab = (direction) => {
        const currentIndex = tabs.findIndex(([key]) => key === activeTab);
        const nextIndex = currentIndex + direction;

        if (nextIndex >= 0 && nextIndex < tabs.length) {
            setActiveTab(tabs[nextIndex][0]);
        }
    };

    const handleNext = async () => {
        if (readOnly || skipTabValidation) {
            goToAdjacentTab(1);
            return;
        }

        const nextErrors = validateCurrentTab(activeTab, true);

        // Re-check duplicate email/phone right now instead of trusting the
        // debounced onBlur result in state - clicking Next quickly (or right
        // after dismissing the popup) could previously beat that check,
        // letting a duplicate contact through to a later tab.
        if (activeTab === "identity") {
            setCheckingContact(true);
            const [emailError, phoneError] = await Promise.all([checkContact("email"), checkContact("phone")]);
            setCheckingContact(false);
            if (emailError) nextErrors.email = emailError;
            if (phoneError) nextErrors.phone = phoneError;
        } else if (activeTab === "admin") {
            setCheckingContact(true);
            const [adminEmailError, adminPhoneError] = await Promise.all([checkContact("adminEmail"), checkContact("adminPhone")]);
            setCheckingContact(false);
            if (adminEmailError) nextErrors.adminEmail = adminEmailError;
            if (adminPhoneError) nextErrors.adminPhone = adminPhoneError;
        }

        if (Object.keys(nextErrors).length) {
            applyValidationErrors(nextErrors);
            return;
        }

        setErrors({});
        goToAdjacentTab(1);
    };

    const handlePrevious = () => {
        goToAdjacentTab(-1);
    };

    const hasCurrentTabErrors = () => {
        const currentTabErrors = validateCurrentTab(activeTab, false);
        return Object.keys(currentTabErrors).length > 0;
    };

    const getFirstTabWithErrors = (errorsObj) => {
        const tabFieldMap = {
            identity: ["clinicName", "facilityType", "year", "phone", "altPhone", "email", "website", "logo"],
            address: ["address1", "state", "city", "district", "pincode", "serviceAreas"],
            licenses: ["stateCouncil", "vetReg", "vetCert", "vetExpiry", "tradeLicense", "tradeDoc", "tradeExpiry", "drugLicense", "drugDoc", "drugExpiry"],
            tax: ["gst", "pan", "bankName", "accountNumber", "ifsc", "cheque"],
            admin: ["adminName", "designation", "adminPhone", "adminEmail", "govtIdType", "govtIdNumber", "idDoc", "profile"],
            plan: ["plan", "billing", "startDate", "endDate", "trialDays", "maxStaff", "maxDoctors", "maxPets", "storageLimit"],
        };

        for (const [tabKey, fields] of Object.entries(tabFieldMap)) {
            if (fields.some((field) => errorsObj[field])) {
                return tabKey;
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (readOnly) return;

        if (!skipSubmitValidation) {
            const nextErrors = validateEntireForm();

            if (Object.keys(nextErrors).length) {
                applyValidationErrors(nextErrors);
                const firstErrorTab = getFirstTabWithErrors(nextErrors);
                if (firstErrorTab) {
                    setActiveTab(firstErrorTab);
                }
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // Custom plan's trial days are admin-entered, not derived from a
            // plan config (maxTrialDays is 0/unset for Custom) - don't
            // clobber whatever the admin typed in that case.
            const submitTrialDays = form.plan === CUSTOM_PLAN ? form.trialDays : maxTrialDays;

            if (onSubmitClinic) {
                await onSubmitClinic({
                    ...form,
                    trialDays: submitTrialDays,
                });
                return;
            }

            const data = await createClinic({
                ...form,
                trialDays: submitTrialDays,
            });

            if (data.emailWarning?.length) {
                window.alert(
                    [
                        "Clinic created, but the credential email was not sent.",
                        "",
                        `Admin login email: ${data.clinicAdminEmail || form.adminEmail}`,
                        data.temporaryPassword ? `Temporary password: ${data.temporaryPassword}` : "",
                        "",
                        data.emailWarning.join(" "),
                    ]
                        .filter(Boolean)
                        .join("\n")
                );
                showToast({
                    type: "error",
                    title: "Clinic Created, Email Not Sent",
                    description: data.emailWarning.join(" "),
                });
            } else {
                showToast({
                    type: "success",
                    title: "Clinic Created",
                    description: `${data.message} Sent to ${data.clinicAdminEmail || form.adminEmail}.`,
                });
            }

            onClose();
            // AddClinicModal/ClinicModal and the clinics list (LatestClinicRequests)
            // are sibling components with no shared state, so a plain navigate()
            // to the already-active route doesn't refresh the list. Force a full
            // reload so the newly created clinic (and its uploaded documents)
            // actually show up without a manual refresh.
            window.location.assign("/superadmin/clinics");
        } catch (error) {
            const message = error.response?.data?.message || "Something went wrong";
            const field = error.response?.data?.field;
            if (field) setErrors((prev) => ({ ...prev, [field]: message }));
            if (error.response?.status === 409) {
                window.alert(message);
                return;
            }
            showToast({
                type: "error",
                title: "Error",
                description: message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form>
            <div className="p-3 sm:p-4 md:p-6 bg-slate-50/50 min-h-full">
                <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
                    <fieldset disabled={readOnly} className={readOnly ? "opacity-75" : ""}>

                        {/* 1 IDENTITY */}
                        {activeTab === "identity" && (
                            <Card title="Clinic Identity">
                                <Grid>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">
                                            Clinic Unique ID
                                        </label>
                                        <div className="mt-1 w-full px-3 py-2.5 text-sm md:text-base border border-slate-200 bg-slate-100 rounded-xl text-slate-600 font-mono">
                                            {form.clinicCode || "Generating..."}
                                        </div>
                                        {isOnboarding && (
                                            <p className="mt-1 text-xs text-gray-400">
                                                Auto-assigned - confirmed once the clinic is saved.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700">
                                            Onboarding Date
                                        </label>
                                        <div className="mt-1 w-full px-3 py-2.5 text-sm md:text-base border border-slate-200 bg-slate-100 rounded-xl text-slate-600 font-mono">
                                            {form.createdAt
                                                ? new Date(form.createdAt).toLocaleString("en-IN", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })
                                                : "Will be set automatically once the clinic is saved."}
                                        </div>
                                    </div>

                                    <Input
                                        name="clinicName"
                                        requiredField={true}
                                        label="Clinic Name"
                                        value={form.clinicName}
                                        error={errors.clinicName}
                                        onChange={handleChange}
                                    />

                                    <Select
                                        requiredField={true}
                                        name="facilityType"
                                        label="Type of Facility"
                                        value={form.facilityType}
                                        error={errors.facilityType}
                                        options={[
                                            "Govt Vet Hospital",
                                            "Private Clinic",
                                            "NGO",
                                            "Mobile Vet",
                                            "Solo Practitioner"
                                        ]}
                                        onChange={handleChange}
                                    />

                                    <Select
                                        requiredField={false}
                                        name="year"
                                        label="Year of Establishment"
                                        value={form.year}
                                        error={errors.year}
                                        options={yearOptions}
                                        onChange={handleChange}
                                    />
                                    <Input requiredField={true} name="email" label="Official Email" value={form.email} error={errors.email} onChange={handleChange} onBlur={() => checkContact("email")} />
                                    <Input requiredField={true} name="phone" label="Primary Contact" value={form.phone} error={errors.phone} maxLength={10} inputMode="numeric" onChange={handlePhoneChange} onBlur={() => checkContact("phone")} />
                                    <Input name="altPhone" label="Alternate Contact" value={form.altPhone} error={errors.altPhone} maxLength={10} inputMode="numeric" onChange={handlePhoneChange} />
                                    <Input name="website" label="Website URL" value={form.website} error={errors.website} onChange={handleChange} />

                                    <Upload
                                        requiredField={true}
                                        label="Clinic Logo image / PDF"
                                        value={form.logo}
                                        error={errors.logo}
                                        onChange={handleFileUpload("logo")}
                                        onRemove={() => setForm((p) => ({ ...p, logo: null }))}
                                        accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg"
                                    />
                                </Grid>
                            </Card>
                        )}

                        {/* 2 ADDRESS */}
                        {activeTab === "address" && (
                            <Card title="Address & Location">
                                <Grid>
                                    <Full>
                                        <ClinicLocationMap
                                            latitude={form.latitude}
                                            longitude={form.longitude}
                                            locating={mapLocating}
                                            onSelect={handleMapLocationSelect}
                                        />
                                    </Full>

                                    <Input requiredField={true} name="address1" label="Address Line 1" value={form.address1} error={errors.address1} onChange={handleAddressChange} />
                                    <Input name="address2" label="Address Line 2" value={form.address2} onChange={handleAddressChange} />

                                    <Select
                                        requiredField
                                        name="state"
                                        label="State"
                                        value={form.state}
                                        error={errors.state}
                                        options={addressStateOptions}
                                        onChange={handleAddressSelectChange}
                                    />
                                    <Select
                                        requiredField
                                        name="city"
                                        label="City"
                                        value={form.city}
                                        error={errors.city}
                                        options={cityOptions}
                                        onChange={handleCityChange}
                                        disabled={!form.state}
                                    />
                                    <Input requiredField name="district" label="District" value={form.district} error={errors.district} onChange={handleDistrictChange} onBlur={handleDistrictBlur} />
                                    <Input
                                        requiredField
                                        name="pincode"
                                        label="PIN Code"
                                        value={form.pincode}
                                        error={errors.pincode}
                                        maxLength={6}
                                        inputMode="numeric"
                                        onChange={handlePincodeChange}
                                    />
                                    <Full>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-semibold text-[#0C3D2E]">
                                                Service Areas / Zones Covered
                                            </label>

                                            {(form.serviceAreas || [""]).map((area, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <Input
                                                        label={`Service Area ${index + 1}`}
                                                        placeholder="e.g. Andheri West, or a PIN code"
                                                        value={area}
                                                        onChange={(e) =>
                                                            updateServiceArea(index, e.target.value)
                                                        }
                                                    />

                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeServiceArea(index)}
                                                            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {errors.serviceAreas && <p className="text-sm text-red-600">{errors.serviceAreas}</p>}

                                            <button
                                                type="button"
                                                onClick={addServiceArea}
                                                className="px-4 py-2.5 rounded-xl bg-[#FFF4E5] text-[#F7931E] border border-[#F7931E]/20 font-semibold text-xs hover:bg-[#F7931E] hover:text-white transition-all duration-200 cursor-pointer"
                                            >
                                                + Add Service Area
                                            </button>
                                        </div>
                                    </Full>
                                </Grid>
                            </Card>
                        )}

                        {/* 3 LICENSES */}
                        {activeTab === "licenses" && (
                            <Card>
                                <div className="py-1 sm:px-2 md:px-4 md:py-3">
                                    <div className="mb-6 sm:mb-8">
                                        <h2 className="text-lg md:text-2xl font-bold text-[#0C3D2E] tracking-tight">
                                            Registrations & Licenses
                                        </h2>

                                        <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">
                                            Provide one license number with its document. All other license details and expiry dates are optional.
                                        </p>
                                    </div>

                                    <div className="mb-6 sm:mb-8">
                                        <Select
                                            requiredField
                                            name="stateCouncil"
                                            label="State Vet Council"
                                            value={form.stateCouncil}
                                            error={errors.stateCouncil}
                                            options={stateOptions}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Registration */}
                                    <div className="border-t border-gray-100 py-5 sm:py-6">
                                        <div className="grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-start">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFF4E5] border border-[#F7931E]/20 flex items-center justify-center shrink-0 sm:mt-6">
                                                <ClipboardDocumentListIcon className="w-8 h-8 text-[#F7931E]" />
                                            </div>

                                            <div className="grid min-w-0 gap-4 lg:grid-cols-3">
                                                <Input
                                                    name="vetReg"
                                                    label="Registration Number"
                                                    value={form.vetReg}
                                                    error={errors.vetReg}
                                                    maxLength={LICENSE_NUMBER_MAX_LENGTH}
                                                    onChange={handleChange}
                                                    className="rounded-xl h-12"
                                                />

                                                <Upload
                                                    label="Registration Certificate"
                                                    value={form.vetCert}
                                                    error={errors.vetCert}
                                                    onChange={handleFileUpload("vetCert")}
                                                    onRemove={() =>
                                                        setForm((p) => ({
                                                            ...p,
                                                            vetCert: null,
                                                        }))
                                                    }
                                                />

                                                <Input
                                                    type="date"
                                                    name="vetExpiry"
                                                    label="Expiry Date"
                                                    value={form.vetExpiry}
                                                    error={errors.vetExpiry}
                                                    min={getTodayDate()}
                                                    max="9999-12-31"
                                                    onChange={handleChange}
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Drug */}
                                    <div className="border-t border-gray-100 py-5 sm:py-6">
                                        <div className="grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-start">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#D9E8E3] border border-[#0C3D2E]/10 flex items-center justify-center shrink-0 sm:mt-6">
                                                <BeakerIcon className="w-8 h-8 text-[#0C3D2E]" />
                                            </div>

                                            <div className="grid min-w-0 gap-4 lg:grid-cols-3">
                                                <Input
                                                    name="drugLicense"
                                                    label="Drug License Number"
                                                    value={form.drugLicense}
                                                    error={errors.drugLicense}
                                                    maxLength={LICENSE_NUMBER_MAX_LENGTH}
                                                    onChange={handleChange}
                                                    className="rounded-xl h-12"
                                                />

                                                <Upload
                                                    label="Drug License Document"
                                                    value={form.drugDoc}
                                                    error={errors.drugDoc}
                                                    onChange={handleFileUpload("drugDoc")}
                                                    onRemove={() =>
                                                        setForm((p) => ({
                                                            ...p,
                                                            drugDoc: null,
                                                        }))
                                                    }
                                                />

                                                <Input
                                                    type="date"
                                                    name="drugExpiry"
                                                    label="Expiry Date"
                                                    value={form.drugExpiry}
                                                    error={errors.drugExpiry}
                                                    min={getTodayDate()}
                                                    max="9999-12-31"
                                                    onChange={handleChange}
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trade */}
                                    <div className="border-t border-gray-100 py-5 sm:py-6">
                                        <div className="grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-start">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFF4E5] border border-[#F7931E]/20 flex items-center justify-center shrink-0 sm:mt-6">
                                                <BuildingStorefrontIcon className="w-8 h-8 text-[#F7931E]" />
                                            </div>

                                            <div className="grid min-w-0 gap-4 lg:grid-cols-3">
                                                <Input
                                                    name="tradeLicense"
                                                    label="Trade License Number"
                                                    value={form.tradeLicense}
                                                    error={errors.tradeLicense}
                                                    maxLength={LICENSE_NUMBER_MAX_LENGTH}
                                                    onChange={handleChange}
                                                    className="rounded-xl h-12"
                                                />

                                                <Upload
                                                    label="Trade License Document"
                                                    value={form.tradeDoc}
                                                    error={errors.tradeDoc}
                                                    onChange={handleFileUpload("tradeDoc")}
                                                    onRemove={() =>
                                                        setForm((p) => ({
                                                            ...p,
                                                            tradeDoc: null,
                                                        }))
                                                    }
                                                />

                                                <Input
                                                    type="date"
                                                    name="tradeExpiry"
                                                    label="Expiry Date"
                                                    value={form.tradeExpiry}
                                                    error={errors.tradeExpiry}
                                                    min={getTodayDate()}
                                                    max="9999-12-31"
                                                    onChange={handleChange}
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* 4 TAX */}
                        {activeTab === "tax" && (
                            <Card title="Tax & Banking">
                                <Grid>
                                    <Input requiredField={true} name="gst" label="GST Number" value={form.gst} error={errors.gst} maxLength={15} onChange={handleUppercaseChange(15)} />
                                    <Input requiredField={true} name="pan" label="PAN Number" value={form.pan} error={errors.pan} maxLength={10} onChange={handleUppercaseChange(10)} />
                                    <Select
                                        requiredField
                                        name="bankName"
                                        label="Bank Name"
                                        value={form.bankName}
                                        error={errors.bankName}
                                        options={BANK_OPTIONS}
                                        onChange={handleChange}
                                    />
                                    <Input requiredField={true} name="accountNumber" label="Account Number" value={form.accountNumber} error={errors.accountNumber} maxLength={18} inputMode="numeric" onChange={(e) => {
                                        const rule = getBankRule(form.bankName);

                                        handleChange({
                                            target: {
                                                name: "accountNumber",
                                                value: getPhoneDigits(e.target.value).slice(
                                                    0,
                                                    getMaxAccountLength(rule)
                                                ),
                                                type: "text",
                                            },
                                        });
                                    }} />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Expected Length: {formatAccountLength(getBankRule(form.bankName))}
                                    </p>
                                    <Input requiredField={true} name="ifsc" label="IFSC Code" value={form.ifsc} error={errors.ifsc} maxLength={11} onChange={handleUppercaseChange(11)} />

                                    <Upload
                                        requiredField={true}
                                        label="Cancelled Cheque"
                                        value={form.cheque}
                                        error={errors.cheque}
                                        onChange={handleFileUpload("cheque")}
                                        onRemove={() => setForm((p) => ({ ...p, cheque: null }))}
                                        accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg"
                                    />
                                </Grid>
                            </Card>
                        )}

                        {/* 5 ADMIN */}
                        {activeTab === "admin" && (
                            <Card title="Admin Info">
                                <Grid>
                                    <Input requiredField={true} name="adminName" label="Full Name" value={form.adminName} error={errors.adminName} onChange={handleAlphaSpaceChange} />
                                    <Input requiredField={true} name="designation" label="Designation" value={form.designation} error={errors.designation} onChange={handleAlphaSpaceChange} />
                                    <div>
                                        <div className="flex items-end gap-2">
                                            <div className="flex-1">
                                                <Input requiredField={true} name="adminPhone" label="Mobile" value={form.adminPhone} error={errors.adminPhone} maxLength={10} inputMode="numeric" onChange={handlePhoneChange} onBlur={() => checkContact("adminPhone")} />
                                            </div>
                                            {adminPhoneOtpVerified ? (
                                                <span className="mb-0.5 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold whitespace-nowrap">
                                                    Verified
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={!isValidMobileNumber(form.adminPhone) || adminPhoneOtpBusy}
                                                    onClick={handleSendAdminOtp}
                                                    className="mb-0.5 px-4 py-2.5 rounded-xl bg-[#FFF4E5] text-[#F7931E] border border-[#F7931E]/20 font-semibold text-xs hover:bg-[#F7931E] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                                                >
                                                    {adminPhoneOtpSent ? "Resend OTP" : "Send OTP"}
                                                </button>
                                            )}
                                        </div>

                                        {adminPhoneOtpSent && !adminPhoneOtpVerified && (
                                            <div className="flex items-end gap-2 mt-2">
                                                <div className="flex-1">
                                                    <Input
                                                        label="Enter OTP"
                                                        value={adminPhoneOtp}
                                                        maxLength={6}
                                                        inputMode="numeric"
                                                        onChange={(e) => setAdminPhoneOtp(e.target.value.replace(/\D/g, ""))}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={adminPhoneOtpBusy}
                                                    onClick={handleVerifyAdminOtp}
                                                    className="mb-0.5 px-4 py-2.5 rounded-xl bg-[#0C3D2E] text-white font-semibold text-xs hover:bg-[#0C3D2E]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                                                >
                                                    Verify
                                                </button>
                                            </div>
                                        )}

                                        {adminPhoneOtpError && <p className="mt-1 text-sm text-red-600">{adminPhoneOtpError}</p>}
                                    </div>
                                    <Input requiredField={true} name="adminEmail" label="Email" value={form.adminEmail} error={errors.adminEmail} onChange={handleChange} onBlur={() => checkContact("adminEmail")} />

                                    <Select
                                        requiredField={true}
                                        name="govtIdType"
                                        label="Govt ID Type"
                                        value={form.govtIdType}
                                        error={errors.govtIdType}
                                        options={GOVT_ID_TYPES}
                                        onChange={(e) => {
                                            const { value } = e.target;

                                            handleChange(e);
                                            setForm((prev) => ({
                                                ...prev,
                                                govtIdType: value,
                                                govtIdNumber: "",
                                                idDoc: null,
                                            }));
                                            clearErrorsForFields(["govtIdType", "govtIdNumber", "idDoc"]);
                                        }}
                                    />

                                    {idType ? (
                                        <Input
                                            requiredField
                                            name="govtIdNumber"
                                            label={idNumberLabel}
                                            value={form.govtIdNumber}
                                            error={errors.govtIdNumber}
                                            placeholder={idNumberPlaceholder}
                                            maxLength={idType === "Aadhar" ? 12 : idType === "PAN" ? 10 : 8}
                                            onChange={(e) => {
                                                const { value } = e.target;

                                                if (idType === "Aadhar") {
                                                    const nextValue = getPhoneDigits(value).slice(0, 12);
                                                    handleChange({
                                                        target: {
                                                            name: "govtIdNumber",
                                                            value: nextValue,
                                                            type: "text",
                                                        },
                                                    });
                                                    return;
                                                }

                                                const nextValue = value
                                                    .toUpperCase()
                                                    .replace(/[^A-Z0-9]/g, "")
                                                    .slice(0, idType === "PAN" ? 10 : 8);

                                                handleChange({
                                                    target: {
                                                        name: "govtIdNumber",
                                                        value: nextValue,
                                                        type: "text",
                                                    },
                                                });
                                            }}
                                        />
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50/80 px-4 py-3 text-sm text-gray-400">
                                            Select a Government ID type to reveal the ID number field.
                                        </div>
                                    )}

                                    <Upload
                                        requiredField
                                        label={idDocumentLabel}
                                        value={form.idDoc}
                                        error={errors.idDoc}
                                        onChange={handleFileUpload("idDoc")}
                                        onRemove={() =>
                                            setForm((p) => ({
                                                ...p,
                                                idDoc: null,
                                            }))
                                        }
                                        accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg"
                                    />

                                    <Upload
                                        requiredField={true}
                                        label="Profile Photo / PDF"
                                        value={form.profile}
                                        error={errors.profile}
                                        onChange={handleFileUpload("profile")}
                                        onRemove={() => setForm((p) => ({ ...p, profile: null }))}
                                        accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg"
                                    />
                                </Grid>
                            </Card>
                        )}

                        {/* PLAN */}
                        {activeTab === "plan" && (
                            <Card title="Plan & Features">
                                {plansError && (
                                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                        {plansError}
                                    </div>
                                )}

                                <Grid>
                                    <Select
                                        requiredField={true}
                                        name="plan"
                                        label="Subscription Plan"
                                        value={form.plan}
                                        error={errors.plan}
                                        options={planOptions}
                                        onChange={handlePlanChange}
                                        disabled={plansLoading || !planOptions.length}
                                    />

                                    {form.plan === CUSTOM_PLAN ? (
                                        <Input
                                            requiredField
                                            type="number"
                                            name="customPlanPrice"
                                            label="Custom Plan Price"
                                            value={form.customPlanPrice}
                                            error={errors.customPlanPrice}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <Select
                                            requiredField
                                            name="billing"
                                            label="Billing Cycle"
                                            value={form.billing}
                                            error={errors.billing}
                                            options={billingOptions}
                                            onChange={handleBillingChange}
                                            disabled={!billingOptions.length}
                                        />
                                    )}

                                    {!plansLoading && form.plan && form.plan !== CUSTOM_PLAN && !billingOptions.length && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                                            No billing cycles have been created for {form.plan}. Create one in Plans to assign this plan.
                                        </div>
                                    )}

                                    <Input
                                        requiredField
                                        type="date"
                                        name="startDate"
                                        label="Plan Start Date"
                                        value={form.startDate}
                                        error={errors.startDate}
                                        min={form.plan === CUSTOM_PLAN ? undefined : getTomorrowDate()}
                                        max="9999-12-31"
                                        onChange={handleStartDateChange}
                                    />

                                    <Input
                                        requiredField
                                        type="date"
                                        name="endDate"
                                        label="Plan End / Renewal Date"
                                        value={form.endDate}
                                        error={errors.endDate}
                                        onChange={handleChange}
                                        disabled={form.plan !== CUSTOM_PLAN}
                                    />
                                    <Input
                                        requiredField={false}
                                        type="number"
                                        name="trialDays"
                                        label="Trial Period (Days)"
                                        value={form.plan === CUSTOM_PLAN ? form.trialDays : maxTrialDays}
                                        error={errors.trialDays}
                                        max={form.plan === CUSTOM_PLAN ? CUSTOM_PLAN_MAX_TRIAL_DAYS : undefined}
                                        onChange={handleChange}
                                        disabled={form.plan !== CUSTOM_PLAN}
                                    />

                                    <Input requiredField={false} name="discountCode" label="Discount / Promo Code" value={form.discountCode} onChange={handleChange} />
                                </Grid>

                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full mt-4 p-3.5 border border-gray-200 rounded-xl resize-none text-sm md:text-base focus:border-[#0C3D2E] focus:outline-hidden"
                                    placeholder="Enter notes..."
                                />

                                {form.plan === CUSTOM_PLAN && (
                                    <div className="mt-6 bg-slate-50/80 p-6 rounded-2xl border border-gray-100">
                                        {form.plan === CUSTOM_PLAN && (
                                            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#F7931E]/25 bg-[#FFF4E5] px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-bold text-[#0C3D2E]">Custom Plan Editor</p>
                                                    <p className="text-xs text-slate-600">Configure the plan limits and module access below.</p>
                                                </div>
                                                <span className="rounded-lg bg-[#F7931E] px-3 py-1.5 text-xs font-bold text-white">Editable</span>
                                            </div>
                                        )}
                                        <h3 className="text-xs font-bold tracking-wider text-[#0C3D2E] uppercase mb-4">
                                            FEATURE LIMITS PER PLAN
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <Input
                                                requiredField
                                                name="maxStaff"
                                                label="Max Staff Accounts"
                                                value={form.maxStaff}
                                                error={errors.maxStaff}
                                                onChange={handleChange}
                                            />

                                            <Input
                                                requiredField
                                                name="maxDoctors"
                                                label="Max Doctors"
                                                value={form.maxDoctors}
                                                error={errors.maxDoctors}
                                                onChange={handleChange}
                                            />

                                            <Input
                                                requiredField
                                                name="maxPets"
                                                label="Max Pet Records / Unlimited"
                                                value={form.maxPets}
                                                error={errors.maxPets}
                                                onChange={handleChange}
                                            />

                                            <Input
                                                requiredField
                                                name="storageLimit"
                                                label="Storage Limit (GB)"
                                                value={form.storageLimit}
                                                error={errors.storageLimit}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <h3 className="text-xs font-bold tracking-wider text-[#0C3D2E] uppercase mb-4">
                                            MODULE ACCESS
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                ["labModule", "Lab Module"],
                                                ["groomingModule", "Grooming Module"],
                                                ["kennelModule", "Kennel Module"],
                                                ["pharmacyModule", "Online Pharmacy"],
                                                ["apiAccess", "API Access"],
                                                ["whiteLabel", "White Label / Custom Branding"],
                                            ].map(([key, label]) => {
                                                const isLabModule = key === "labModule";
                                                // Only the Lab Module is available in this release - the rest
                                                // are always greyed out, not just once Lab Module is checked.
                                                const isDisabled = !isLabModule;
                                                return (
                                                    <label
                                                        key={key}
                                                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                                                            isDisabled
                                                                ? "bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed"
                                                                : "bg-white border-gray-100 text-gray-700 cursor-pointer hover:border-[#0C3D2E]/50"
                                                        }`}
                                                    >
                                                        <span>{label}</span>

                                                        <input
                                                            type="checkbox"
                                                            name={key}
                                                            checked={form[key]}
                                                            onChange={handleChange}
                                                            disabled={isDisabled}
                                                            className="accent-[#0C3D2E] h-4 w-4 rounded-xs cursor-pointer disabled:cursor-not-allowed"
                                                        />
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}
                    </fieldset>

                    {/* SAVE */}
                    <div className="sticky bottom-0 z-10 -mx-3 sm:-mx-4 md:-mx-6 flex flex-col gap-3 border-t border-gray-100 bg-slate-50/95 px-3 py-3 shadow-[0_-10px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-4 md:px-6">
                        {activeTab !== "identity" ? (
                            <button
                                type="button"
                                onClick={handlePrevious}
                                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Previous
                            </button>
                        ) : (
                            <div />
                        )}

                        {activeTab !== "plan" ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={checkingContact || hasCurrentTabErrors()}
                                className="inline-flex items-center justify-center gap-2 bg-[#F7931E] hover:bg-[#e08319] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-xs transition-all duration-200 transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                            >
                                {checkingContact ? "Checking..." : "Next"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center gap-2 bg-[#F7931E] hover:bg-[#e08319] px-6 py-3 text-white font-semibold text-sm rounded-xl shadow-xs transition-all duration-200 transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                            >
                                {isSubmitting && (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                )}
                                {isSubmitting ? "Saving..." : submitLabel}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}

function ClinicLocationMap({ latitude, longitude, locating = false, onSelect }) {
    const [loading, setLoading] = useState(false);
    const [mapError, setMapError] = useState("");
    const [zoom, setZoom] = useState(DEFAULT_MAP_ZOOM);
    const center = {
        lat: Number(latitude) || DEFAULT_MAP_CENTER.lat,
        lng: Number(longitude) || DEFAULT_MAP_CENTER.lng,
    };

    const centerTileX = lonToTileX(center.lng, zoom);
    const centerTileY = latToTileY(center.lat, zoom);
    const baseTileX = Math.floor(centerTileX);
    const baseTileY = Math.floor(centerTileY);
    const offsetX = (centerTileX - baseTileX) * TILE_SIZE;
    const offsetY = (centerTileY - baseTileY) * TILE_SIZE;

    const tiles = [];
    for (let x = -1; x <= 1; x += 1) {
        for (let y = -1; y <= 1; y += 1) {
            tiles.push({
                key: `${zoom}-${baseTileX + x}-${baseTileY + y}`,
                x: baseTileX + x,
                y: baseTileY + y,
                left: x * TILE_SIZE - offsetX,
                top: y * TILE_SIZE - offsetY,
            });
        }
    }

    const reverseGeocode = async (lat, lng, errorMessage) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
                {
                    headers: {
                        "Accept-Language": "en",
                    },
                }
            );
            const data = await response.json();
            const address = data.address || {};

            onSelect({
                address1: getDisplayAddress(address) || data.display_name || "",
                address2: address.suburb || address.neighbourhood || "",
                city: getCityName(address),
                district: address.state_district || address.county || getCityName(address),
                state: address.state || "",
                pincode: address.postcode || "",
                latitude: Number(lat).toFixed(6),
                longitude: Number(lng).toFixed(6),
            });
        } catch (err) {
            console.error(err);
            setMapError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleMapClick = async (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pixelX = e.clientX - rect.left - rect.width / 2;
        const pixelY = e.clientY - rect.top - rect.height / 2;
        const clickedTileX = centerTileX + pixelX / TILE_SIZE;
        const clickedTileY = centerTileY + pixelY / TILE_SIZE;
        const lng = tileXToLon(clickedTileX, zoom);
        const lat = tileYToLat(clickedTileY, zoom);

        setLoading(true);
        setMapError("");
        reverseGeocode(lat, lng, "Unable to fetch address for this location.");
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            setMapError("Current location is not supported in this browser.");
            return;
        }

        setLoading(true);
        setMapError("");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                reverseGeocode(lat, lng, "Unable to fetch address for current location.");
            },
            () => {
                setLoading(false);
                setMapError("Unable to access current location.");
            }
        );
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b border-gray-100">
                <div>
                    <h3 className="text-sm font-semibold text-[#0C3D2E]">
                        Select Clinic Location
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Click the map to auto-fill address, city and PIN code.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={useCurrentLocation}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#0C3D2E] hover:bg-[#D9E8E3]/30 transition-colors cursor-pointer"
                    >
                        Use Current Location
                    </button>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setZoom((z) => Math.min(z + 1, 19))}
                            className="h-9 w-9 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            +
                        </button>

                        <button
                            type="button"
                            onClick={() => setZoom((z) => Math.max(z - 1, 3))}
                            className="h-9 w-9 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            −
                        </button>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={handleMapClick}
                className="relative block w-full h-72 overflow-hidden bg-slate-100 cursor-crosshair"
                aria-label="Select clinic location on map"
            >
                {tiles.map((tile) => (
                    <img
                        key={tile.key}
                        src={`https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`}
                        alt=""
                        className="absolute max-w-none"
                        style={{
                            width: TILE_SIZE,
                            height: TILE_SIZE,
                            left: `calc(50% + ${tile.left}px)`,
                            top: `calc(50% + ${tile.top}px)`,
                        }}
                        draggable="false"
                    />
                ))}

                <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-full rounded-full bg-[#F7931E] shadow-lg ring-4 ring-white" />
                <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />

                {(loading || locating) && (
                    <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-medium text-slate-700">
                        {loading ? "Fetching address..." : "Locating..."}
                    </span>
                )}
            </button>

            <div className="px-4 py-3 text-xs text-gray-400">
                Selected: {latitude && longitude ? `${latitude}, ${longitude}` : "No location selected"}
                {mapError && <span className="ml-2 text-rose-600">{mapError}</span>}
            </div>
        </div>
    );
}
