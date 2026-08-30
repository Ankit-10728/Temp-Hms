import { useEffect, useMemo, useRef, useState } from "react";
import { City, State } from "country-state-city";
import { useLocation, useNavigate } from "react-router-dom";
import {
  UserCheck,
  PawPrint,
  FileText,
  Stethoscope,
  Check,
  AlertCircle,
  Loader2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  BadgeCheck,
  Copy,
} from "lucide-react";
import { showToast } from "../../../../shared/components/toast";
import {
  registerOwnerAndPet,
  searchCustomer,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  addPet,
  addVisit,
  updateOwner,
  updatePet,
  updatePetVisit,
} from "../../api/receptionApi";
import { getDoctors } from "../../api/doctorApi";
import { getDoctorStaff } from "../../api/staffApi";

const initialFormData = {
  mobileNumber: "",
  otp: "",
  visitType: "New",
  ownerName: "",
  ownerIdType: "Aadhaar Card",
  ownerOtherIdType: "",
  ownerIdNumber: "",
  email: "",
  address: "",
  state: "",
  city: "",
  district: "",
  pincode: "",
};

const defaultHistory = {
  vaccineName: "",
  vaccinationDate: "",
  batchNumber: "",
  clinicName: "",
  dewormingProduct: "",
  dewormingDate: "",
  dose: "",
  surgicalProcedure: "",
  surgeryDate: "",
  hospital: "",
  condition: "",
  treatment: "",
  treatmentDate: "",
  allergies: "",
  medications: "",
};

const getTodayDateStr = () => new Date().toISOString().split("T")[0];
const getCurrentTimeStr = () => new Date().toTimeString().split(" ")[0].substring(0, 5);
const isValidCalendarDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const defaultVisitReason = {
  primaryReason: "",
  complaint: "",
  appointmentDate: getTodayDateStr(),
  appointmentTime: getCurrentTimeStr(),
  assignedDoctor: "",
};

const steps = [
  {
    id: 1,
    title: "Owner Verification",
    shortTitle: "Owner Verification",
    subtitle: "Mobile & Address",
    icon: UserCheck,
    key: "owner",
  },
  {
    id: 2,
    title: "Pet Registration",
    shortTitle: "Pet Registration",
    subtitle: "Select / Add Pets",
    icon: PawPrint,
    key: "pet",
  },
  {
    id: 3,
    title: "Pet History",
    shortTitle: "Pet History",
    subtitle: "Medical & Vaccines",
    icon: FileText,
    key: "history",
  },
  {
    id: 4,
    title: "Reason For Visit",
    shortTitle: "Reason For Visit",
    subtitle: "Doctor & Visit",
    icon: Stethoscope,
    key: "visit",
  },
];

const reasonOptions = ["Treatment", "Vaccination", "Checkup", "Certificate", "Other"];
const BREED_OPTIONS = {
  Dog: ["Labrador Retriever", "German Shepherd", "Golden Retriever", "Indian Pariah Dog", "Beagle", "Pug"],
  Cat: ["Indian Domestic Shorthair", "Persian", "Siamese", "Bengal", "Maine Coon", "British Shorthair"],
  Rabbit: ["Dutch", "Angora", "Himalayan", "Rex", "New Zealand White", "Lop"],
  Bird: ["Budgerigar", "Cockatiel", "Indian Ringneck Parakeet", "Lovebird", "Cockatoo", "Java Sparrow"],
};
const getBreedOptions = (species) => BREED_OPTIONS[species] || [];

function SterilizedToggle({ checked, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer ${checked ? "bg-[#0C3D2E]" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-7" : "left-1"}`}
        />
      </button>
      <span className={`text-xs font-bold ${checked ? "text-[#0C3D2E]" : "text-slate-500"}`}>
        {checked ? "Yes" : "No"}
      </span>
    </div>
  );
}

const inputClass =
  "w-full border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium text-xs sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none";
const today = getTodayDateStr();
const minPetDob = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 20);
  return d.toISOString().split("T")[0];
})();

// The date input's min/max attributes only affect the calendar picker and
// native validity state - Chrome (and others) still accept an out-of-range
// year typed directly into the year segment, so it has to be re-checked and
// clamped here on every change too.
const clampDob = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { value, error: "" };
  if (value < minPetDob) return { value: minPetDob, error: "Date of birth cannot be more than 20 years ago." };
  if (value > today) return { value: today, error: "Date of birth cannot be in the future." };
  return { value, error: "" };
};

const calculateAge = (dob) => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const currentDate = new Date();
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDifference = currentDate.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : "";
};

// Total age in whole months - used only to render a friendlier "X months"
// display for pets under a year old, so a puppy/kitten doesn't just show
// a bare "0". The stored/submitted age (calculateAge, in years) is unchanged.
const calculateAgeInMonths = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const currentDate = new Date();
  let months =
    (currentDate.getFullYear() - birthDate.getFullYear()) * 12 +
    (currentDate.getMonth() - birthDate.getMonth());
  if (currentDate.getDate() < birthDate.getDate()) months -= 1;
  return months >= 0 ? months : null;
};

const formatAgeDisplay = (dob) => {
  const totalMonths = calculateAgeInMonths(dob);
  if (totalMonths === null) return "";
  if (totalMonths < 12) {
    return `${totalMonths} ${totalMonths === 1 ? "month" : "months"}`;
  }
  const years = Math.floor(totalMonths / 12);
  const remainderMonths = totalMonths % 12;
  const yearsLabel = `${years} ${years === 1 ? "yr" : "yrs"}`;
  if (remainderMonths === 0) return yearsLabel;
  return `${yearsLabel} ${remainderMonths} ${remainderMonths === 1 ? "mo" : "mos"}`;
};

const normalizeDoctorList = (response) => {
  const doctors =
    response?.doctors || response?.data?.doctors || response?.data || response || [];
  return Array.isArray(doctors) ? doctors : [];
};

const getDoctorName = (doctor) =>
  doctor.name ||
  doctor.fullName ||
  doctor.personalInfo?.fullName ||
  doctor.staff?.personalInfo?.fullName ||
  doctor.email ||
  "";

const getDoctorOptionValue = (doctor) =>
  doctor._id || doctor.id || doctor.doctorId || getDoctorName(doctor);

function ErrorText({ errors, name }) {
  return errors[name] ? (
    <p className="mt-1 text-sm text-red-500 font-medium">{errors[name]}</p>
  ) : null;
}

const cleanStr = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

const matchStateFromList = (postalStateName, statesList) => {
  if (!postalStateName) return null;
  const target = cleanStr(postalStateName);
  let found = statesList.find((s) => cleanStr(s.name) === target);
  if (found) return found;
  found = statesList.find(
    (s) => cleanStr(s.name).includes(target) || target.includes(cleanStr(s.name))
  );
  if (found) return found;
  const aliases = {
    orissa: "odisha",
    pondicherry: "puducherry",
    uttaranchal: "uttarakhand",
    "nct of delhi": "delhi",
    "delhi nct": "delhi",
  };
  const aliasTarget = aliases[target] || target;
  return statesList.find((s) => cleanStr(s.name) === aliasTarget);
};

export default function NewRegistrationPet() {
  const location = useLocation();
  const [showModal] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Existing customer tracking
  const [mobileExists, setMobileExists] = useState(false);
  const [existingOwnerId, setExistingOwnerId] = useState(null);
  const [existingPets, setExistingPets] = useState([]);
  const [selectedExistingPetIds, setSelectedExistingPetIds] = useState([]);
  const [addNewPetForExisting, setAddNewPetForExisting] = useState(false);
  const [newPetsForExisting, setNewPetsForExisting] = useState([]);

  // New Owner Pets List (Multiple pets support)
  const [newOwnerPets, setNewOwnerPets] = useState([
    {
      petName: "",
      species: "Dog",
      breed: "",
      gender: "Male",
      dob: "",
      age: "",
      color: "",
      rfid: "",
      identificationArea: "",
      sterilized: "No",
    },
  ]);

  // Per-Pet History & Visit Reason maps (keyed by pet.id)
  const [petHistoriesMap, setPetHistoriesMap] = useState({});
  const [petVisitsMap, setPetVisitsMap] = useState({});

  // Active pet tab indices for Step 3 & Step 4
  const [activeHistoryPetIndex, setActiveHistoryPetIndex] = useState(0);
  const [activeVisitPetIndex, setActiveVisitPetIndex] = useState(0);

  const formScrollRef = useRef(null);

  // Scroll form container to top on every step or sub-tab change
  useEffect(() => {
    if (formScrollRef.current) {
      formScrollRef.current.scrollTop = 0;
    }
  }, [step, activeHistoryPetIndex, activeVisitPetIndex]);

  const [doctors, setDoctors] = useState([]);
  const [searchingMobile, setSearchingMobile] = useState(false);

  // Pincode validation states
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeValid, setPincodeValid] = useState(null);
  const [pincodeDetails, setPincodeDetails] = useState("");
  // Only the newest postal lookup may update the form. This prevents a slow,
  // earlier request from restoring an old pincode or city after the user edits it.
  const pincodeRequestRef = useRef(0);

  const navigate = useNavigate();
  const states = useMemo(() => State.getStatesOfCountry("IN"), []);
  const editCustomer = location.state?.editCustomer || null;
  const isEditMode = Boolean(editCustomer?.owner?._id && editCustomer?.pet?._id);

  useEffect(() => {
    if (!isEditMode) return;

    const owner = editCustomer.owner || {};
    const pet = editCustomer.pet || {};
    const history = pet.history || {};
    const visit = pet.visits?.[pet.visits.length - 1] || {};
    const stateMatch = matchStateFromList(owner.state, states);
    const key = "new_owner_0";

    setFormData({
      ...initialFormData,
      mobileNumber: owner.mobileNumber || "",
      ownerName: owner.ownerName || "",
      ownerIdType: owner.ownerIdType || "Aadhaar Card",
      ownerOtherIdType: owner.ownerOtherIdType || "",
      ownerIdNumber: owner.ownerIdNumber || "",
      email: owner.email || "",
      address: owner.address || "",
      state: stateMatch?.isoCode || owner.state || "",
      city: owner.city || "",
      district: owner.district || "",
      pincode: owner.pincode || "",
    });
    setNewOwnerPets([{ ...pet, petName: pet.petName || pet.name || "", name: pet.name || pet.petName || "", sterilized: pet.sterilized || pet.isSterilised ? "Yes" : "No", photo: pet.photo || pet.photoUrl || "" }]);
    setPetHistoriesMap({
      [key]: {
        ...defaultHistory,
        vaccineName: history.vaccineName || history.vaccinations?.[0]?.vaccineName || history.vaccinations?.[0]?.name || "",
        vaccinationDate: history.vaccinationDate || history.vaccinations?.[0]?.vaccinationDate || history.vaccinations?.[0]?.date || "",
        batchNumber: history.batchNumber || history.vaccinations?.[0]?.batchNumber || "",
        clinicName: history.clinicName || history.vaccinations?.[0]?.clinicName || "",
        dewormingProduct: history.dewormingProduct || history.dewormings?.[0]?.dewormingProduct || history.dewormings?.[0]?.product || "",
        dewormingDate: history.dewormingDate || history.dewormings?.[0]?.dewormingDate || history.dewormings?.[0]?.date || "",
        dose: history.dose || history.dewormings?.[0]?.dose || "",
        surgicalProcedure: history.surgicalProcedure || history.surgeries?.[0]?.surgicalProcedure || history.surgeries?.[0]?.procedure || "",
        surgeryDate: history.surgeryDate || history.surgeries?.[0]?.surgeryDate || history.surgeries?.[0]?.date || "",
        hospital: history.hospital || history.surgeries?.[0]?.hospital || "",
        condition: history.condition || history.treatments?.[0]?.condition || "",
        treatment: history.treatment || history.treatments?.[0]?.treatment || history.treatments?.[0]?.details || "",
        treatmentDate: history.treatmentDate || history.treatments?.[0]?.treatmentDate || history.treatments?.[0]?.date || "",
        allergies: history.allergies || "",
        medications: history.medications || history.currentMedications || "",
      },
    });
    setPetVisitsMap({
      [key]: {
        ...defaultVisitReason,
        ...visit,
        appointmentDate: visit.appointmentDate && !Number.isNaN(new Date(visit.appointmentDate).getTime())
          ? new Date(visit.appointmentDate).toISOString().split("T")[0]
          : getTodayDateStr(),
      },
    });
  }, [editCustomer, isEditMode, states]);

  const cities = useMemo(() => {
    if (!formData.state) return [];
    const list = City.getCitiesOfState("IN", formData.state) || [];
    if (formData.city && !list.some((c) => c.name === formData.city)) {
      return [{ name: formData.city, latitude: "0", longitude: "0" }, ...list];
    }
    return list;
  }, [formData.state, formData.city]);

  const selectedState = states.find((item) => item.isoCode === formData.state);

  // Compute normalized active pets participating in the visit
  const activePets = useMemo(() => {
    if (mobileExists) {
      const selectedExisting = existingPets
        .filter((p) => selectedExistingPetIds.includes(p._id))
        .map((p) => ({
          id: p._id,
          petName: p.petName || p.name || "Pet",
          species: p.species || "Dog",
          breed: p.breed || "N/A",
          gender: p.gender || "N/A",
          uniquePetId: p.uniquePetId || p.petId || `PET-${p._id?.slice(-6)}`,
          isExisting: true,
          raw: p,
        }));

      const newlyAdded = (addNewPetForExisting ? newPetsForExisting : []).map((p, idx) => ({
        id: `new_ext_${idx}`,
        petName: p.petName || `New Pet ${idx + 1}`,
        species: p.species === "Other" ? (p.otherSpecies?.trim() || "Other") : (p.species || "Dog"),
        breed: p.breed || "N/A",
        gender: p.gender || "Male",
        uniquePetId: p.uniquePetId || "Pending",
        isExisting: false,
        raw: p,
      }));

      return [...selectedExisting, ...newlyAdded];
    } else {
      return newOwnerPets.map((p, idx) => ({
        id: `new_owner_${idx}`,
        petName: p.petName || `Pet ${idx + 1}`,
        species: p.species === "Other" ? (p.otherSpecies?.trim() || "Other") : (p.species || "Dog"),
        breed: p.breed || "N/A",
        gender: p.gender || "Male",
        uniquePetId: p.uniquePetId || "Pending",
        isExisting: false,
        raw: p,
      }));
    }
  }, [mobileExists, existingPets, selectedExistingPetIds, addNewPetForExisting, newPetsForExisting, newOwnerPets]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const [doctorDetailsResponse, doctorStaffResponse] = await Promise.allSettled([
          getDoctors(),
          getDoctorStaff(),
        ]);
        const doctorDetails =
          doctorDetailsResponse.status === "fulfilled"
            ? normalizeDoctorList(doctorDetailsResponse.value)
            : [];
        const doctorStaff =
          doctorStaffResponse.status === "fulfilled"
            ? normalizeDoctorList(doctorStaffResponse.value)
            : [];
        const doctorMap = new Map();
        [...doctorDetails, ...doctorStaff].forEach((doctor) => {
          const optionValue = getDoctorOptionValue(doctor);
          if (optionValue) doctorMap.set(optionValue, doctor);
        });
        setDoctors(Array.from(doctorMap.values()));
      } catch (error) {
        console.error("Doctors fetch failed:", error);
      }
    };
    fetchDoctors();
  }, []);

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const checkMobileNumber = async (digits) => {
    if (!digits || digits.length !== 10 || !/^[6-9]\d{9}$/.test(digits)) {
      setMobileExists(false);
      setExistingOwnerId(null);
      setExistingPets([]);
      setSelectedExistingPetIds([]);
      return;
    }

    setSearchingMobile(true);
    try {
      const res = await searchCustomer(digits);
      const owner = res?.data;

      if (owner && owner._id) {
        setMobileExists(true);
        setExistingOwnerId(owner._id);
        const petsList = owner.pets || [];
        setExistingPets(petsList);
        setSelectedExistingPetIds(petsList.map((p) => p._id));

        setFormData((prev) => ({
          ...prev,
          ownerName: owner.ownerName || "",
          ownerIdType: owner.ownerIdType || "Aadhaar Card",
          ownerOtherIdType: owner.ownerOtherIdType || "",
          email: owner.email || "",
          address: owner.address || "",
          state: owner.state || "",
          city: owner.city || "",
          district: owner.district || "",
          pincode: owner.pincode || "",
          visitType: "Follow-up",
        }));

        if (owner.pincode && owner.pincode.length === 6) {
          validatePincode(owner.pincode);
        }

        // OTP is no longer auto-sent for existing customers - it's only
        // required if the receptionist explicitly clicks "Send OTP".
        showToast({
          type: "success",
          title: "Existing Owner Found",
          description: "Owner details loaded.",
        });
      } else {
        setMobileExists(false);
        setExistingOwnerId(null);
        setExistingPets([]);
        setSelectedExistingPetIds([]);
        showToast({
          type: "success",
          title: "New Customer",
          description: "Mobile number not found. Proceeding with new registration.",
        });
      }
    } catch (err) {
      console.error("Mobile search failed:", err);
    } finally {
      setSearchingMobile(false);
    }
  };

  // Mirrors the Super Admin Add Clinic form's PIN code lookup: the pincode
  // resolves and fills State/City/District from the postal API, rather than
  // requiring a city to already be picked and cross-checking it against the
  // pincode (which used to reject valid pincodes with "does not match city").
  const validatePincode = async (pin) => {
    const requestId = ++pincodeRequestRef.current;

    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setPincodeValid(null);
      setPincodeLoading(false);
      setPincodeDetails("");
      return;
    }

    setPincodeLoading(true);
    setPincodeValid(null);
    setPincodeDetails("Verifying PIN code...");

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();

      if (pincodeRequestRef.current !== requestId) return;

      if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const poList = data[0].PostOffice;
        const po = poList.find((postOffice) => postOffice.BranchType === "Head Post Office") || poList[0];

        const districtName = po.District || po.Block || po.Circle || po.Division || "";
        const stateName = po.State || "";
        const postOfficeName = po.Name || "";
        const matchedState = matchStateFromList(stateName, states);

        if (matchedState) {
          const stateIso = matchedState.isoCode;
          const stateCities = City.getCitiesOfState("IN", stateIso) || [];
          const nameCandidates = [po.Block, po.Name, po.District, po.Circle, po.Division].filter(Boolean);
          let cityName = "";
          for (const candidate of nameCandidates) {
            const candidateKey = cleanStr(candidate);
            const found = stateCities.find((c) => cleanStr(c.name) === candidateKey);
            if (found) {
              cityName = found.name;
              break;
            }
          }
          if (!cityName) cityName = po.Block || po.Name || districtName || "";

          setFormData((prev) => ({
            ...prev,
            pincode: pin,
            state: stateIso,
            city: cityName,
            district: districtName || prev.district,
          }));

          setErrors((prev) => ({
            ...prev,
            pincode: "",
            state: "",
            city: "",
            district: "",
          }));

          setPincodeValid(true);
          setPincodeLoading(false);
          setPincodeDetails(`${postOfficeName ? postOfficeName + ", " : ""}${districtName ? districtName + ", " : ""}${matchedState.name}`);
          return;
        }
      }

      setPincodeValid(false);
      setPincodeLoading(false);
      setPincodeDetails("Invalid Indian PIN code.");
      setErrors((prev) => ({
        ...prev,
        pincode: "Invalid PIN code. Please enter a valid 6-digit Indian PIN code.",
      }));
    } catch (err) {
      if (pincodeRequestRef.current !== requestId) return;
      console.error("PIN code lookup failed:", err);
      setPincodeLoading(false);
      setPincodeValid(null);
      setPincodeDetails("");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "mobileNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, mobileNumber: digits }));
      setOtpSent(false);
      setOtpVerified(false);

      if (!digits) {
        setErrors((prev) => ({ ...prev, mobileNumber: "" }));
        setMobileExists(false);
        setExistingOwnerId(null);
        setExistingPets([]);
      } else if (!/^[6-9]/.test(digits)) {
        setErrors((prev) => ({
          ...prev,
          mobileNumber: "Mobile number must start with 6, 7, 8, or 9.",
        }));
      } else if (digits.length < 10) {
        setErrors((prev) => ({
          ...prev,
          mobileNumber: `Mobile number must be 10 digits (${digits.length}/10).`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, mobileNumber: "" }));
        checkMobileNumber(digits);
      }
      return;
    }

    if (name === "pincode") {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      pincodeRequestRef.current += 1;
      setFormData((prev) => ({ ...prev, pincode: digits }));
      setErrors((prev) => ({ ...prev, pincode: "" }));

      if (digits.length === 6) {
        validatePincode(digits);
      } else {
        setPincodeValid(null);
        setPincodeLoading(false);
        setPincodeDetails("");
      }
      return;
    }

    if (name === "state") {
      pincodeRequestRef.current += 1;
      setFormData((prev) => ({
        ...prev,
        state: value,
        city: "",
        district: "",
        pincode: "",
      }));
      setPincodeValid(null);
      setPincodeLoading(false);
      setPincodeDetails("State changed — PIN code reset.");
      setErrors((prev) => ({
        ...prev,
        state: value ? "" : "State is required.",
        city: "",
        district: "",
        pincode: "",
      }));
      return;
    }

    if (name === "district") {
      const formatted = value.replace(/[^a-zA-Z\s.'-]/g, "");
      pincodeRequestRef.current += 1;
      setFormData((prev) => ({
        ...prev,
        district: formatted,
        pincode: "",
      }));
      setPincodeValid(null);
      setPincodeLoading(false);
      setPincodeDetails(formatted.trim() ? "District changed — PIN code reset." : "");
      setErrors((prev) => ({
        ...prev,
        district: formatted.trim() ? "" : "District is required.",
        pincode: "",
      }));
      return;
    }

    if (name === "city") {
      setFormData((prev) => ({ ...prev, city: value }));
      setErrors((prev) => ({
        ...prev,
        city: value ? "" : "City is required.",
      }));
      return;
    }

    if (name === "ownerName") {
      setField(name, value.replace(/[^a-zA-Z\s.'-]/g, ""));
      return;
    }

    if (name === "ownerIdType") {
      setFormData((prev) => ({
        ...prev,
        ownerIdType: value,
        ownerOtherIdType: value === "Other Government ID" ? prev.ownerOtherIdType : "",
        ownerIdNumber: "",
      }));
      setErrors((prev) => ({ ...prev, ownerOtherIdType: "", ownerIdNumber: "" }));
      return;
    }

    if (name === "ownerOtherIdType") {
      setFormData((prev) => ({ ...prev, ownerOtherIdType: value, ownerIdNumber: "" }));
      setErrors((prev) => ({ ...prev, ownerOtherIdType: "", ownerIdNumber: "" }));
      return;
    }

    if (name === "ownerIdNumber") {
      let formatted = value;
      if (formData.ownerIdType === "Aadhaar Card") {
        formatted = value.replace(/\D/g, "").slice(0, 12);
        setFormData((prev) => ({ ...prev, ownerIdNumber: formatted }));
        if (formatted.length === 12) {
          setErrors((prev) => ({ ...prev, ownerIdNumber: "" }));
        } else if (formatted.length > 0) {
          setErrors((prev) => ({
            ...prev,
            ownerIdNumber: `Aadhaar Card number must be 12 digits (${formatted.length}/12).`,
          }));
        } else {
          setErrors((prev) => ({ ...prev, ownerIdNumber: "" }));
        }
      } else if (formData.ownerIdType === "PAN Card") {
        formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
        setFormData((prev) => ({ ...prev, ownerIdNumber: formatted }));
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (panRegex.test(formatted)) {
          setErrors((prev) => ({ ...prev, ownerIdNumber: "" }));
        } else if (formatted.length > 0) {
          setErrors((prev) => ({
            ...prev,
            ownerIdNumber: "Enter a valid 10-character PAN number (e.g. ABCDE1234F).",
          }));
        } else {
          setErrors((prev) => ({ ...prev, ownerIdNumber: "" }));
        }
      } else if (formData.ownerIdType === "Other Government ID") {
        const maxLenByIdType = {
          "Voter ID": 10,
          "Passport": 8,
          "Driving Licence": 16,
          "NREGA Job Card": 18,
          "Government Employee ID": 20,
          "Armed Forces ID": 20,
        };
        const maxLen = maxLenByIdType[formData.ownerOtherIdType] || 20;
        formatted = value.toUpperCase().replace(/[^A-Z0-9/-]/g, "").slice(0, maxLen);
        setFormData((prev) => ({ ...prev, ownerIdNumber: formatted }));
        setErrors((prev) => ({
          ...prev,
          ownerIdNumber: formatted.length && formatted.length < 5 ? "Please enter a valid ID number." : "",
        }));
      } else {
        setFormData((prev) => ({ ...prev, ownerIdNumber: value }));
        setErrors((prev) => ({ ...prev, ownerIdNumber: "" }));
      }
      return;
    }

    setField(name, value);
  };

  const handleSendOtp = async () => {
    const cleanMobile = (formData.mobileNumber || "").trim();

    if (!cleanMobile || cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrors((prev) => ({
        ...prev,
        mobileNumber: "Valid 10-digit mobile number starting with 6-9 is required.",
      }));
      showToast({
        type: "error",
        title: "Invalid Mobile",
        description: "Please enter a valid 10-digit Indian mobile number.",
      });
      return;
    }

    try {
      await sendRegistrationOtp(formData.mobileNumber);
      setOtpSent(true);
      setOtpVerified(false);
      setField("otp", "");
      showToast({
        type: "success",
        title: "OTP Sent",
        description: "OTP is sent to the registered number.",
      });
    } catch (error) {
      console.error("Send OTP failed:", error);
      showToast({
        type: "error",
        title: "OTP Failed",
        description: error?.response?.data?.message || "Unable to send OTP.",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(formData.otp || "")) {
      setErrors((prev) => ({ ...prev, otp: "Enter the 6-digit OTP first." }));
      return;
    }
    try {
      await verifyRegistrationOtp(formData.mobileNumber, formData.otp);
      setOtpVerified(true);
      setErrors((prev) => ({ ...prev, otp: "" }));
      showToast({ type: "success", title: "OTP Verified", description: "Mobile number verified successfully." });
    } catch (error) {
      setOtpVerified(false);
      setErrors((prev) => ({ ...prev, otp: error?.response?.data?.message || "OTP verification failed." }));
    }
  };

  // Helper methods for multi-pet management
  const toggleExistingPetSelection = (petId) => {
    setSelectedExistingPetIds((prev) =>
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
    );
  };

  const handleAddNewPetForExisting = () => {
    setAddNewPetForExisting(true);
    setNewPetsForExisting((prev) => [
      ...prev,
      {
        petName: "",
        species: "Dog",
        breed: "",
        gender: "Male",
        dob: "",
        age: "",
        color: "",
        rfid: "",
        sterilized: "No",
      },
    ]);
  };

  const handleRemoveNewPetForExisting = (index) => {
    setNewPetsForExisting((prev) => prev.filter((_, i) => i !== index));
    if (newPetsForExisting.length <= 1) {
      setAddNewPetForExisting(false);
    }
  };

  const handleNewPetForExistingChange = (index, field, value) => {
    let cleanValue = value;
    let dobError = "";
    if (field === "petName" || field === "breed") {
      cleanValue = value.replace(/[^a-zA-Z\s.'-]/g, "");
    } else if (field === "color") {
      cleanValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (field === "rfid") {
      cleanValue = value.replace(/[^a-zA-Z0-9-]/g, "");
    } else if (field === "age") {
      const digits = String(value).replace(/\D/g, "");
      cleanValue = digits !== "" ? Number(digits) : "";
    } else if (field === "dob") {
      const clamped = clampDob(value);
      cleanValue = clamped.value;
      dobError = clamped.error;
    }

    setNewPetsForExisting((prev) => {
      const list = [...prev];
      if (field === "dob") {
        list[index].dob = cleanValue;
        list[index].age = calculateAge(cleanValue);
      } else {
        list[index][field] = cleanValue;
      }
      return list;
    });

    setErrors((prev) => {
      const next = { ...prev };
      const errorKey = `${field}_ext_${index}`;
      if (field === "dob") {
        if (dobError) next[`dob_${index}`] = dobError;
        else delete next[`dob_${index}`];
        delete next.petSelection;
        return next;
      }
      if (!prev[errorKey] && !prev.petSelection) return prev;
      if (cleanValue && String(cleanValue).trim()) {
        delete next[errorKey];
      }
      delete next.petSelection;
      return next;
    });
  };

  const handleNewOwnerPetChange = (index, field, value) => {
    let cleanValue = value;
    let dobError = "";
    if (field === "petName" || field === "breed") {
      cleanValue = value.replace(/[^a-zA-Z\s.'-]/g, "");
    } else if (field === "color") {
      cleanValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (field === "rfid") {
      cleanValue = value.replace(/[^a-zA-Z0-9-]/g, "");
    } else if (field === "age") {
      const digits = String(value).replace(/\D/g, "");
      cleanValue = digits !== "" ? Number(digits) : "";
    } else if (field === "dob") {
      const clamped = clampDob(value);
      cleanValue = clamped.value;
      dobError = clamped.error;
    }

    setNewOwnerPets((prev) => {
      const list = [...prev];
      if (field === "dob") {
        list[index].dob = cleanValue;
        list[index].age = calculateAge(cleanValue);
      } else {
        list[index][field] = cleanValue;
      }
      return list;
    });

    setErrors((prev) => {
      const next = { ...prev };
      if (field === "dob") {
        if (dobError) next[`dob_${index}`] = dobError;
        else delete next[`dob_${index}`];
        delete next.petSelection;
        return next;
      }
      if (!prev[`${field}_${index}`] && !prev.petSelection) return prev;
      if (cleanValue && String(cleanValue).trim()) {
        delete next[`${field}_${index}`];
      }
      delete next.petSelection;
      return next;
    });
  };

  // Per-pet History & Visit handlers
  const handlePetHistoryChange = (petId, field, value) => {
    let cleanVal = value;
    const textOnlyFields = [
      "vaccineName",
      "dewormingProduct",
      "surgicalProcedure",
      "condition",
      "treatment",
      "allergies",
      "medications",
    ];

    if (textOnlyFields.includes(field) && typeof value === "string") {
      cleanVal = value.replace(/[0-9]/g, "");
    }

    setPetHistoriesMap((prev) => ({
      ...prev,
      [petId]: {
        ...(prev[petId] || defaultHistory),
        [field]: cleanVal,
      },
    }));
  };

  const handlePetVisitChange = (petId, field, value) => {
    let cleanVal = value;

    if ((field === "complaint" || field === "notes") && typeof value === "string") {
      cleanVal = value.replace(/[0-9]/g, "");
    }

    if (field === "appointmentDate") {
      const isAllowedDate = isValidCalendarDate(value) && value >= today;
      const existingTime = (petVisitsMap[petId] || defaultVisitReason).appointmentTime;
      const isAllowedTime = value !== today || !existingTime || existingTime >= getCurrentTimeStr();
      setErrors((prev) => ({
        ...prev,
        [`appointmentDate_${petId}`]: isAllowedDate
          ? ""
          : "Enter a valid appointment date from today onward.",
        [`appointmentTime_${petId}`]: isAllowedTime
          ? ""
          : "Appointment time cannot be in the past for today's date.",
      }));
    }

    if (field === "appointmentTime") {
      const currentDate = (petVisitsMap[petId] || defaultVisitReason).appointmentDate || today;
      const isAllowedTime = currentDate !== today || !value || value >= getCurrentTimeStr();
      setErrors((prev) => ({
        ...prev,
        [`appointmentTime_${petId}`]: isAllowedTime
          ? ""
          : "Appointment time cannot be in the past for today's date.",
      }));
    }

    setPetVisitsMap((prev) => ({
      ...prev,
      [petId]: {
        ...(prev[petId] || defaultVisitReason),
        [field]: cleanVal,
      },
    }));
  };

  const copyHistoryToAllPets = (sourcePetId) => {
    const sourceData = petHistoriesMap[sourcePetId] || defaultHistory;
    const updatedMap = {};
    activePets.forEach((p) => {
      updatedMap[p.id] = { ...sourceData };
    });
    setPetHistoriesMap(updatedMap);
    showToast({
      type: "success",
      title: "History Copied",
      description: "Medical history details copied to all selected pets.",
    });
  };

  const applyVisitReasonToAllPets = (sourcePetId) => {
    const sourceData = petVisitsMap[sourcePetId] || defaultVisitReason;
    const updatedMap = {};
    activePets.forEach((p) => {
      updatedMap[p.id] = { ...sourceData };
    });
    setPetVisitsMap(updatedMap);
    showToast({
      type: "success",
      title: "Reason & Doctor Applied",
      description: "Visit reason and doctor assignment applied to all selected pets.",
    });
  };

  // Shared by the pet-list onBlur handlers below and validateFields()'s
  // "pet" step check, so both agree on what "valid" means per field -
  // same pattern as the Bank Account Details live-validation fix.
  const validatePetListField = (list, idx, field) => {
    const p = list[idx];
    if (!p) return "";

    if (field === "petName") {
      return p.petName.trim() ? "" : "Pet name is required.";
    }
    if (field === "breed") {
      return p.breed.trim() ? "" : "Pet breed is required.";
    }
    if (field === "otherSpecies") {
      if (p.species === "Other" && (!p.otherSpecies || !p.otherSpecies.trim())) {
        return "Custom species is required when 'Other' is selected.";
      }
      return "";
    }
    return "";
  };

  const handlePetFieldBlur = (list, idx, field, errorKeySuffix) => {
    const message = validatePetListField(list, idx, field);
    setErrors((prev) => ({ ...prev, [`${field}${errorKeySuffix}`]: message }));
  };

  const validateFields = (fields) => {
    const nextErrors = {};
    const required = (name, message) => {
      if (!String(formData[name] || "").trim()) nextErrors[name] = message;
    };

    if (fields.includes("owner")) {
      if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
        nextErrors.mobileNumber = "Enter a valid 10 digit mobile number.";
      }
      if (!isEditMode && !otpVerified) {
        nextErrors.otp = "Verify the mobile OTP before continuing.";
      }
      required("ownerName", "Owner name is required.");
      if (formData.ownerName && !/^[a-zA-Z\s.'-]+$/.test(formData.ownerName.trim())) {
        nextErrors.ownerName = "Owner name can contain alphabets only.";
      }
      if (formData.ownerIdType === "Aadhaar Card") {
        if (!formData.ownerIdNumber || formData.ownerIdNumber.length !== 12) {
          nextErrors.ownerIdNumber = "Aadhaar Card number must be 12 digits.";
        }
      } else if (formData.ownerIdType === "PAN Card") {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!formData.ownerIdNumber || !panRegex.test(formData.ownerIdNumber)) {
          nextErrors.ownerIdNumber = "Enter a valid 10-character PAN number (e.g. ABCDE1234F).";
        }
      } else if (formData.ownerIdType === "Other Government ID") {
        if (!formData.ownerOtherIdType) {
          nextErrors.ownerOtherIdType = "Please select Government ID type.";
        }
        if (!formData.ownerIdNumber || formData.ownerIdNumber.length < 5) {
          nextErrors.ownerIdNumber = "Please enter a valid Government ID number.";
        }
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        nextErrors.email = "Enter a valid email address.";
      }
      required("address", "Full address is required.");
      required("state", "State is required.");
      required("city", "City is required.");
      required("district", "District is required.");
      if (!/^\d{6}$/.test(formData.pincode)) {
        nextErrors.pincode = "Enter a valid 6 digit pincode.";
      } else if (pincodeValid === false) {
        // pincodeValid is null (not yet re-verified) for a pincode that was
        // already saved and loaded - e.g. opening Edit - and briefly while a
        // fresh lookup is still in flight. Only block on a *confirmed*
        // invalid pincode, not on "hasn't been re-checked yet".
        nextErrors.pincode = "Invalid PIN code. Please enter a valid 6-digit Indian PIN code.";
      }
    }

    if (fields.includes("pet")) {
      if (activePets.length === 0) {
        nextErrors.petSelection = "Please select at least one pet or add a pet to continue.";
      }
      if (!mobileExists) {
        newOwnerPets.forEach((p, i) => {
          if (!p.petName.trim()) nextErrors[`petName_${i}`] = "Pet name is required.";
          if (!p.breed.trim()) nextErrors[`breed_${i}`] = "Pet breed is required.";
          if (p.species === "Other" && (!p.otherSpecies || !p.otherSpecies.trim())) {
            nextErrors[`otherSpecies_${i}`] = "Custom species is required when 'Other' is selected.";
          }
        });
      } else if (addNewPetForExisting) {
        newPetsForExisting.forEach((p, i) => {
          if (!p.petName.trim()) nextErrors[`petName_ext_${i}`] = "Pet name is required.";
          if (!p.breed.trim()) nextErrors[`breed_ext_${i}`] = "Pet breed is required.";
          if (p.species === "Other" && (!p.otherSpecies || !p.otherSpecies.trim())) {
            nextErrors[`otherSpecies_ext_${i}`] = "Custom species is required when 'Other' is selected.";
          }
        });
      }
    }

    if (fields.includes("visit")) {
      let missingPetName = null;
      let missingPetIndex = -1;
      activePets.forEach((p, idx) => {
        const v = petVisitsMap[p.id] || defaultVisitReason;
        const invalidAppointmentDate =
          !isValidCalendarDate(v.appointmentDate) || v.appointmentDate < today;
        const invalidAppointmentTime =
          !invalidAppointmentDate &&
          v.appointmentDate === today &&
          v.appointmentTime &&
          v.appointmentTime < getCurrentTimeStr();
        if (!v.primaryReason || !v.complaint || !v.assignedDoctor || invalidAppointmentDate || invalidAppointmentTime) {
          if (!missingPetName) {
            missingPetName = p.petName;
            missingPetIndex = idx;
          }
          if (invalidAppointmentDate) {
            nextErrors[`appointmentDate_${p.id}`] =
              "Enter a valid appointment date from today onward.";
          }
          if (invalidAppointmentTime) {
            nextErrors[`appointmentTime_${p.id}`] =
              "Appointment time cannot be in the past for today's date.";
          }
        }
      });
      if (missingPetName) {
        if (missingPetIndex !== -1) {
          setActiveVisitPetIndex(missingPetIndex);
        }
        nextErrors.visitDetails = `Please complete all required visit details for ${missingPetName}.`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    const isValid =
      step === 1 ? validateFields(["owner"]) : step === 2 ? validateFields(["pet"]) : true;
    if (isValid) setStep((prev) => prev + 1);
  };

  const hasVisiblePetErrors =
    step === 2 &&
    Object.entries(errors).some(
      ([key, value]) =>
        value &&
        (key.startsWith("petName_") ||
          key.startsWith("breed_") ||
          key.startsWith("otherSpecies_") ||
          key === "petSelection")
    );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isEditMode) {
      if (!validateFields(["owner", "pet", "visit"])) return;

      try {
        const ownerId = editCustomer.owner._id;
        const petId = editCustomer.pet._id;
        const pet = newOwnerPets[0] || {};
        const history = petHistoriesMap.new_owner_0 || defaultHistory;
        const visit = petVisitsMap.new_owner_0 || {};

        await updateOwner(ownerId, {
          ownerName: formData.ownerName,
          mobileNumber: formData.mobileNumber,
          ownerIdType: formData.ownerIdType,
          ownerOtherIdType: formData.ownerOtherIdType,
          ownerIdNumber: formData.ownerIdNumber,
          email: formData.email,
          address: formData.address,
          state: selectedState?.name || formData.state,
          city: formData.city,
          district: formData.district,
          pincode: formData.pincode,
        });

        await updatePet(ownerId, petId, {
          ...pet,
          name: pet.petName || pet.name,
          petName: pet.petName || pet.name,
          otherSpecies: pet.otherSpecies || "",
          sterilized: pet.sterilized === "Yes" || pet.sterilized === true,
          photoUrl: pet.photo || pet.photoUrl || "",
          photoName: pet.photoName || "",
          history: {
            vaccineName: history.vaccineName,
            vaccinationDate: history.vaccinationDate,
            batchNumber: history.batchNumber,
            clinicName: history.clinicName,
            dewormingProduct: history.dewormingProduct,
            dewormingDate: history.dewormingDate,
            dose: history.dose,
            surgicalProcedure: history.surgicalProcedure,
            surgeryDate: history.surgeryDate,
            hospital: history.hospital,
            condition: history.condition,
            treatment: history.treatment,
            treatmentDate: history.treatmentDate,
            allergies: history.allergies,
            medications: history.medications,
            currentMedications: history.medications,
          },
        });

        if (visit._id) {
          await updatePetVisit(ownerId, petId, visit._id, {
            primaryReason: visit.primaryReason,
            complaint: visit.complaint,
            appointmentDate: visit.appointmentDate,
            appointmentTime: visit.appointmentTime,
            assignedDoctor: visit.assignedDoctor,
            tokenNumber: visit.tokenNumber,
            status: visit.status,
          });
        }

        showToast({ type: "success", title: "Registration Updated", description: "Owner, pet, and visit details were updated successfully." });
        navigate("/clinic/reception/existing-customer");
      } catch (error) {
        showToast({ type: "error", title: "Update Failed", description: error?.response?.data?.message || "Unable to update this registration." });
      }
      return;
    }

    if (!validateFields(["owner", "pet", "visit"])) return;

    try {
      if (mobileExists && existingOwnerId) {
        // Update owner details if edited
        await updateOwner(existingOwnerId, {
          ownerName: formData.ownerName,
          ownerIdType: formData.ownerIdType,
          ownerOtherIdType: formData.ownerOtherIdType,
          email: formData.email,
          address: formData.address,
          state: selectedState?.name || formData.state,
          city: formData.city,
          district: formData.district,
          pincode: formData.pincode,
        });

        // Process each active pet
        for (const pet of activePets) {
          const visitData = petVisitsMap[pet.id] || defaultVisitReason;
          const historyData = petHistoriesMap[pet.id] || defaultHistory;

          if (pet.isExisting) {
            // Existing pet visit
            await addVisit(existingOwnerId, pet.id, visitData);
          } else {
            // Newly added pet for existing owner
            const res = await addPet(existingOwnerId, {
              ...pet.raw,
              uniquePetId: pet.uniquePetId || pet.raw?.uniquePetId,
              name: pet.raw?.petName || pet.raw?.name || "Pet",
              petName: pet.raw?.petName || pet.raw?.name || "Pet",
              species: pet.raw?.species || "Dog",
              otherSpecies: pet.raw?.otherSpecies || "",
              breed: pet.raw?.breed || "",
              gender: pet.raw?.gender || "Male",
              dob: pet.raw?.dob || "",
              age: pet.raw?.age !== undefined && pet.raw?.age !== null && pet.raw?.age !== "" ? Number(pet.raw.age) : (pet.raw?.dob ? calculateAge(pet.raw.dob) : ""),
              color: pet.raw?.color || "",
              rfid: pet.raw?.rfid || pet.raw?.rfidTag || "",
              rfidTag: pet.raw?.rfid || pet.raw?.rfidTag || "",
              identificationArea: pet.raw?.identificationArea || "",
              identificationMarks: pet.raw?.identificationMarks || pet.raw?.identificationArea || "",
              sterilized: pet.raw?.sterilized || "No",
              isSterilised: pet.raw?.sterilized === "Yes" || pet.raw?.sterilized === true,
              photoUrl: pet.raw?.photo || "",
              photoName: pet.raw?.photoName || "",
              history: historyData,
            });
            const updatedOwner = res?.data;
            const addedPet = updatedOwner?.pets?.[updatedOwner.pets.length - 1];
            if (addedPet?._id) {
              await addVisit(existingOwnerId, addedPet._id, visitData);
            }
          }
        }

        showToast({
          type: "success",
          title: "Visit Intake Created",
          description: `Visits created successfully for ${activePets.length} pet(s).`,
        });
        navigate("/clinic/reception");
      } else {
        // New Owner Registration with Multi-Pet & Per-Pet History / Visit support
        const petsToRegister = activePets.map((p) => {
          const hist = petHistoriesMap[p.id] || defaultHistory;
          const vis = petVisitsMap[p.id] || defaultVisitReason;
          const petNameVal = p.petName || p.raw?.petName || p.raw?.name || "Pet";

          return {
            uniquePetId: p.uniquePetId || p.raw?.uniquePetId,
            tokenNumber: vis.tokenNumber,
            name: petNameVal,
            petName: petNameVal,
            species: p.raw?.species || p.species || "Dog",
            otherSpecies: p.raw?.otherSpecies || "",
            breed: p.raw?.breed || p.breed || "N/A",
            gender: p.raw?.gender || p.gender || "Male",
            dob: p.raw?.dob || "",
            age: p.raw?.age !== undefined && p.raw?.age !== null && p.raw?.age !== "" ? Number(p.raw.age) : (p.raw?.dob ? calculateAge(p.raw.dob) : ""),
            color: p.raw?.color || "",
            rfid: p.raw?.rfid || p.raw?.rfidTag || "",
            rfidTag: p.raw?.rfid || p.raw?.rfidTag || "",
            identificationArea: p.raw?.identificationArea || "",
            identificationMarks: p.raw?.identificationMarks || p.raw?.identificationArea || "",
            sterilized: p.raw?.sterilized || "No",
            isSterilised: p.raw?.sterilized === "Yes" || p.raw?.sterilized === true,
            photoUrl: p.raw?.photo || "",
            photoName: p.raw?.photoName || "",
            history: {
              vaccinations: hist.vaccineName
                ? [{ name: hist.vaccineName, vaccineName: hist.vaccineName, date: hist.vaccinationDate, vaccinationDate: hist.vaccinationDate, batchNumber: hist.batchNumber || "", clinicName: hist.clinicName || "" }]
                : [],
              dewormings: hist.dewormingProduct
                ? [{ product: hist.dewormingProduct, dewormingProduct: hist.dewormingProduct, date: hist.dewormingDate, dewormingDate: hist.dewormingDate, dose: hist.dose || "" }]
                : [],
              surgeries: hist.surgicalProcedure
                ? [{ procedure: hist.surgicalProcedure, surgicalProcedure: hist.surgicalProcedure, date: hist.surgeryDate, surgeryDate: hist.surgeryDate, hospital: hist.hospital || "" }]
                : [],
              treatments: hist.treatment || hist.condition
                ? [{ details: hist.treatment, treatment: hist.treatment, condition: hist.condition || "", date: hist.treatmentDate, treatmentDate: hist.treatmentDate }]
                : [],
              allergies: hist.allergies || "",
              currentMedications: hist.medications || "",
            },
            visit: {
              primaryReason: vis.primaryReason,
              complaint: vis.complaint,
              appointmentDate: vis.appointmentDate,
              appointmentTime: vis.appointmentTime,
              assignedDoctor: vis.assignedDoctor,
              tokenNumber: vis.tokenNumber,
              status: "Pending",
            },
          };
        });

        await registerOwnerAndPet({
          ...formData,
          state: selectedState?.name || formData.state,
          pets: petsToRegister,
        });

        showToast({
          type: "success",
          title: "Registration Success",
          description: `Registered owner & ${petsToRegister.length} pet(s) with visits successfully.`,
        });

        navigate("/clinic/reception");
      }
    } catch (error) {
      console.error("Registration Failed:", error);
      showToast({
        type: "error",
        title: "Operation Failed",
        description: error?.response?.data?.message || "Unable to complete registration.",
      });
    }
  };

  const progressPercentage = Math.round((step / steps.length) * 100);

  // Active pet objects for Step 3 & Step 4 views
  const currentHistoryPet = activePets[activeHistoryPetIndex] || activePets[0] || null;
  const currentVisitPet = activePets[activeVisitPetIndex] || activePets[0] || null;

  return (
    <>
      {showModal && (
        <div className="w-full flex items-center justify-center">
          <div className="bg-white w-full max-w-6xl h-[calc(100vh-6rem)] md:h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-5.5rem)] rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-200/70 flex flex-col overflow-hidden">
            {/* Top Modal Header */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-[#D9ECE7] bg-[#EAF4F2] rounded-t-2xl">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-[#063D31] tracking-tight flex items-center gap-1.5">
                  <span>{isEditMode ? "Edit Patient Registration" : "Patient Intake & Registration"}</span>
                  <Sparkles className="w-4 h-4 text-[#F97316]" />
                </h1>
                <p className="text-slate-600 text-xs mt-0.5 font-semibold">
                  {isEditMode ? "Review and update the saved owner, pet, and medical history details." : mobileExists ? "Existing Owner Intake & Multi-Pet Visit Setup" : "Veterinary Patient Intake & Case Creation"}
                </p>
              </div>

              <div className="bg-[#F97316] text-white rounded-full px-3 py-1 flex items-center gap-1.5 shrink-0 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span className="text-xs font-black tracking-wide">
                  Step {step} of {steps.length} ({progressPercentage}%)
                </span>
              </div>
            </div>

            {/* Stepper Header */}
            <div className="bg-[#F4F9F7] border-b border-[#D9ECE7] px-4 sm:px-6 py-2.5">
              <div className="max-w-2xl mx-auto">
                <div className="relative pt-0.5 pb-0.5">
                  <div className="absolute top-[16px] left-5 right-5 h-1 bg-slate-200 rounded-full z-0" />
                  <div
                    className="absolute top-[16px] left-5 h-1 bg-[#F97316] rounded-full z-0 transition-all duration-500 ease-out"
                    style={{
                      width: `calc(${((step - 1) / (steps.length - 1)) * 100}% - ${
                        step === 1 ? 0 : 10
                      }px)`,
                    }}
                  />

                  <div className="relative z-10 flex justify-between items-start">
                    {steps.map((item, index) => {
                      const isCompleted = step > index + 1;
                      const isActive = step === index + 1;
                      const IconComponent = item.icon;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (index + 1 < step) setStep(index + 1);
                          }}
                          className={`flex flex-col items-center group select-none transition-all duration-200 ${
                            index + 1 <= step ? "cursor-pointer" : "cursor-not-allowed opacity-75"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                              isCompleted
                                ? "bg-[#063D31] text-white shadow-md ring-2 ring-emerald-50 scale-105"
                                : isActive
                                ? "bg-[#F97316] text-white shadow-md ring-2 ring-orange-100 scale-105"
                                : "bg-white text-slate-400 border border-slate-200 shadow-xs"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <IconComponent className="w-4 h-4" />
                            )}
                          </div>

                          <div className="mt-1 text-center">
                            <p
                              className={`text-[11px] font-bold transition-colors ${
                                isCompleted
                                  ? "text-emerald-700"
                                  : isActive
                                  ? "text-orange-600 font-extrabold"
                                  : "text-slate-400"
                              }`}
                            >
                              {item.title}
                            </p>
                            <p className="hidden sm:block text-[10px] text-slate-400 font-medium mt-0.25">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Form Content */}
            <div
              ref={formScrollRef}
              className="flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-4 sm:p-5"
            >
              {/* STEP 1: OWNER VERIFICATION */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-orange-500" />
                      <span>Owner Verification</span>
                    </h2>

                    {mobileExists && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                        Existing Owner Found
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Mobile Number <span className="text-red-500 font-bold ml-1">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            maxLength="10"
                            placeholder="Enter 10 Digit Mobile Number"
                            className="w-full border border-slate-200 rounded-xl p-3 bg-white text-slate-700 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none pr-10"
                          />
                          {searchingMobile && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold transition cursor-pointer border-none shrink-0 flex items-center justify-center gap-2"
                        >
                          <span>{otpSent ? "Resend OTP" : "Send OTP"}</span>
                        </button>
                      </div>
                      <ErrorText errors={errors} name="mobileNumber" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        OTP Verification{otpSent && (
                          <span className="text-red-500 font-bold ml-1">*</span>
                        )}
                      </label>
                      <div className="flex gap-2"><input type="text" name="otp" value={formData.otp} onChange={handleChange} maxLength="6" placeholder={otpSent ? "Enter 6 Digit OTP" : "Click Send OTP first"} disabled={!otpSent || otpVerified} className={`${inputClass} ${!otpSent ? "bg-slate-100 cursor-not-allowed text-slate-400" : ""}`} /><button type="button" onClick={handleVerifyOtp} disabled={!otpSent || otpVerified} className="shrink-0 rounded-lg bg-[#0C3D2E] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{otpVerified ? "Verified" : "Verify OTP"}</button></div>
                      <ErrorText errors={errors} name="otp" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Visit Type <span className="text-red-500 font-bold ml-1">*</span>
                      </label>
                      <select
                        name="visitType"
                        value={formData.visitType}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="New">New</option>
                        <option value="Follow-up">Follow-up</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Owner Name <span className="text-red-500 font-bold ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        placeholder="Owner Name"
                        className={inputClass}
                      />
                      <ErrorText errors={errors} name="ownerName" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Owner ID <span className="text-red-500 font-bold ml-1">*</span>
                      </label>
                      <select
                        name="ownerIdType"
                        value={formData.ownerIdType}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Other Government ID">Other Government ID</option>
                      </select>

                      {formData.ownerIdType === "Other Government ID" && (
                        <div className="mt-2.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Government ID Type
                          </label>
                          <select
                            name="ownerOtherIdType"
                            value={formData.ownerOtherIdType}
                            onChange={handleChange}
                            className={inputClass}
                          >
                            <option value="">Select Government ID</option>
                            <option value="Driving Licence">Driving Licence</option>
                            <option value="Voter ID">Voter ID</option>
                            <option value="Passport">Passport</option>
                            <option value="NREGA Job Card">NREGA Job Card</option>
                            <option value="Government Employee ID">Government Employee ID</option>
                            <option value="Armed Forces ID">Armed Forces ID</option>
                          </select>
                          <ErrorText errors={errors} name="ownerOtherIdType" />
                        </div>
                      )}

                      {formData.ownerIdType && (
                        <div className="mt-2.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {formData.ownerIdType === "PAN Card"
                              ? "PAN Card Number *"
                              : formData.ownerIdType === "Other Government ID"
                              ? `${formData.ownerOtherIdType || "Government ID"} Number *`
                              : "Aadhaar Card Number *"}
                          </label>
                          <input
                            type="text"
                            name="ownerIdNumber"
                            value={formData.ownerIdNumber || ""}
                            onChange={handleChange}
                            placeholder={
                              formData.ownerIdType === "PAN Card"
                                ? "e.g. ABCDE1234F"
                                : formData.ownerIdType === "Other Government ID"
                                ? `Enter ${formData.ownerOtherIdType || "Government ID"} Number`
                                : "e.g. 123456789012"
                            }
                            className={inputClass}
                          />
                          <ErrorText errors={errors} name="ownerIdNumber" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="Email Address"
                        className={inputClass}
                      />
                      <ErrorText errors={errors} name="email" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Full Address <span className="text-red-500 font-bold ml-1">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Enter Full Address"
                        className={inputClass}
                      />
                      <ErrorText errors={errors} name="address" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Pincode <span className="text-red-500 font-bold ml-1">*</span></span>
                        {pincodeLoading && (
                          <span className="text-[11px] text-orange-500 font-semibold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                          </span>
                        )}
                        {pincodeValid === true && (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" /> Valid Pincode
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          type="text"
                          maxLength="6"
                          placeholder="6 Digit PIN Code"
                          className={inputClass}
                        />
                      </div>
                      {pincodeDetails && pincodeValid === true && (
                        <p className="mt-1.5 text-xs text-emerald-700 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-500 shrink-0" /> {pincodeDetails}
                        </p>
                      )}
                      <ErrorText errors={errors} name="pincode" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        State <span className="text-red-500 font-bold ml-1">*</span>
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="">Select State</option>
                        {states.map((item) => (
                          <option key={item.isoCode} value={item.isoCode}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      <ErrorText errors={errors} name="state" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        City <span className="text-red-500 font-bold ml-1">*</span>
                      </label>
                      <select
                        name="city"
                        value={formData.city || ""}
                        onChange={handleChange}
                        disabled={!formData.state}
                        className={inputClass}
                      >
                        <option value="">Select City</option>
                        {cities.map((item) => (
                          <option
                            key={`${item.name}-${item.latitude || "0"}`}
                            value={item.name}
                          >
                            {item.name}
                          </option>
                        ))}
                      </select>
                      <ErrorText errors={errors} name="city" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        District <span className="text-red-500 font-bold ml-1">*</span>
                      </label>
                      <input
                        name="district"
                        value={formData.district || ""}
                        onChange={handleChange}
                        type="text"
                        placeholder="Enter District Name"
                        className={inputClass}
                      />
                      <ErrorText errors={errors} name="district" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PET REGISTRATION & SELECTION */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                      <PawPrint className="w-5 h-5 text-orange-500" />
                      <span>Pet Registration & Selection</span>
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">
                      Select or Add Multiple Pets for Visit
                    </span>
                  </div>

                  {errors.petSelection && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errors.petSelection}
                    </div>
                  )}

                  {/* EXISTING OWNER: PET SELECTION GRID */}
                  {mobileExists ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Select Existing Registered Pet(s) for Visit:
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {existingPets.map((p) => {
                            const isSelected = selectedExistingPetIds.includes(p._id);
                            return (
                              <div
                                key={p._id}
                                onClick={() => toggleExistingPetSelection(p._id)}
                                className={`px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? "bg-orange-50/60 border-orange-500 shadow-2xs"
                                    : "bg-white border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-800 text-xs truncate">
                                      {p.petName || p.name}
                                    </span>
                                    <span className="px-1 py-0.25 bg-slate-100 text-slate-600 text-[9px] font-bold rounded uppercase">
                                      {p.species}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      • {p.breed || "N/A"} ({p.gender || "N/A"})
                                    </span>
                                  </div>
                                  <p className="text-[10px] font-mono text-orange-600 font-extrabold leading-tight mt-1">
                                     Unique Pet ID: {p.uniquePetId || p.petId || `PET-${p._id?.slice(-6)}`}
                                   </p>
                                </div>
                                <div className="text-orange-500 shrink-0">
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 fill-orange-500 text-white" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-300" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ADD NEW PET FOR EXISTING OWNER TOGGLE */}
                      <div className="border-t border-slate-100 pt-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">
                              Register a New Pet for this Owner?
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Add an additional pet to this owner's account
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddNewPetForExisting}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            Add New Pet
                          </button>
                        </div>

                        {addNewPetForExisting && newPetsForExisting.length > 0 && (
                          <div className="mt-4 space-y-4">
                            {newPetsForExisting.map((pet, idx) => (
                              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                                  <span className="text-xs font-extrabold text-orange-600 uppercase">
                                    New Pet #{idx + 1} Details
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveNewPetForExisting(idx)}
                                    className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                      Pet Name *
                                    </label>
                                    <input
                                      type="text"
                                      value={pet.petName}
                                      onChange={(e) => handleNewPetForExistingChange(idx, "petName", e.target.value)}
                                      onBlur={() => handlePetFieldBlur(newPetsForExisting, idx, "petName", `_ext_${idx}`)}
                                      placeholder="Pet Name"
                                      className={inputClass}
                                    />
                                    <ErrorText errors={errors} name={`petName_ext_${idx}`} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                      Species *
                                    </label>
                                    <select
                                      value={pet.species}
                                      onChange={(e) => handleNewPetForExistingChange(idx, "species", e.target.value)}
                                      className={inputClass}
                                    >
                                      <option value="Dog">Dog</option>
                                      <option value="Cat">Cat</option>
                                      <option value="Rabbit">Rabbit</option>
                                      <option value="Bird">Bird</option>
                                      <option value="Other">Other</option>
                                    </select>
                                    {pet.species === "Other" && (
                                      <div className="mt-2">
                                        <input
                                          type="text"
                                          value={pet.otherSpecies || ""}
                                          onChange={(e) => handleNewPetForExistingChange(idx, "otherSpecies", e.target.value)}
                                          onBlur={() => handlePetFieldBlur(newPetsForExisting, idx, "otherSpecies", `_ext_${idx}`)}
                                          placeholder="Enter Custom Species"
                                          className={inputClass}
                                        />
                                        <ErrorText errors={errors} name={`otherSpecies_ext_${idx}`} />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                      Breed *
                                    </label>
                                    <select
                                      value={pet.breedCustom ? "Other" : (getBreedOptions(pet.species).includes(pet.breed) ? pet.breed : "")}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        if (v === "Other") {
                                          handleNewPetForExistingChange(idx, "breedCustom", true);
                                        } else {
                                          handleNewPetForExistingChange(idx, "breedCustom", false);
                                          handleNewPetForExistingChange(idx, "breed", v);
                                        }
                                      }}
                                      onBlur={() => handlePetFieldBlur(newPetsForExisting, idx, "breed", `_ext_${idx}`)}
                                      className={inputClass}
                                    >
                                      <option value="">Select Breed</option>
                                      {getBreedOptions(pet.species).map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                      ))}
                                      <option value="Other">Other (specify)</option>
                                    </select>
                                    {(pet.breedCustom || (pet.breed && !getBreedOptions(pet.species).includes(pet.breed))) && (
                                      <input
                                        type="text"
                                        value={pet.breed}
                                        onChange={(e) => handleNewPetForExistingChange(idx, "breed", e.target.value)}
                                        onBlur={() => handlePetFieldBlur(newPetsForExisting, idx, "breed", `_ext_${idx}`)}
                                        placeholder="Enter Breed"
                                        className={`${inputClass} mt-2`}
                                      />
                                    )}
                                    <ErrorText errors={errors} name={`breed_ext_${idx}`} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                      Gender *
                                    </label>
                                    <select
                                      value={pet.gender}
                                      onChange={(e) => handleNewPetForExistingChange(idx, "gender", e.target.value)}
                                      className={inputClass}
                                    >
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                      Date of Birth (DOB)
                                    </label>
                                    <input
                                      type="date"
                                      value={pet.dob || ""}
                                      max={today}
                                      min={minPetDob}
                                      onChange={(e) => handleNewPetForExistingChange(idx, "dob", e.target.value)}
                                      className={inputClass}
                                    />
                                    <ErrorText errors={errors} name={`dob_${idx}`} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                                      <span>Age</span>
                                      <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Auto Calculated</span>
                                    </label>
                                    <input
                                      type="text"
                                      readOnly
                                      value={pet.dob ? formatAgeDisplay(pet.dob) : "—"}
                                      placeholder="Set DOB to calculate"
                                      className="w-full border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-100 text-slate-700 font-mono font-bold text-xs shadow-2xs outline-none cursor-not-allowed select-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                      Color / Coat Pattern
                                    </label>
                                    <input
                                      type="text"
                                      value={pet.color || ""}
                                      onChange={(e) => handleNewPetForExistingChange(idx, "color", e.target.value)}
                                      placeholder="Color / Coat"
                                      className={inputClass}
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                      Identification Area & Marks
                                    </label>
                                    <textarea
                                      rows="2"
                                      value={pet.identificationArea || ""}
                                      onChange={(e) => handleNewPetForExistingChange(idx, "identificationArea", e.target.value)}
                                      placeholder="Physical identification marks, scars, ear notches..."
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                      RFID / Microchip Tag No.
                                    </label>
                                    <input
                                      type="text"
                                      value={pet.rfid || ""}
                                      onChange={(e) => handleNewPetForExistingChange(idx, "rfid", e.target.value)}
                                      placeholder="RFID Tag Number"
                                      className={inputClass}
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                      Pet Photo Upload
                                    </label>
                                    <div className="flex items-center gap-4 p-4 border border-dashed border-slate-300 rounded-2xl bg-white">
                                      <input
                                        id={`pet-photo-ext-${idx}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              handleNewPetForExistingChange(idx, "photo", reader.result);
                                              handleNewPetForExistingChange(idx, "photoName", file.name);
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                        className="hidden"
                                      />
                                      <label
                                        htmlFor={`pet-photo-ext-${idx}`}
                                        className="shrink-0 py-2 px-4 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 cursor-pointer"
                                      >
                                        {pet.photo ? "Change Photo" : "Choose File"}
                                      </label>
                                      {pet.photo && (
                                        <div className="flex items-center gap-2 min-w-0">
                                          <img
                                            src={pet.photo}
                                            alt="Pet Preview"
                                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                                          />
                                          <span className="text-xs text-slate-500 truncate max-w-[140px]">{pet.photoName}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                      Sterilized / Neutered
                                    </label>
                                    <SterilizedToggle
                                      checked={pet.sterilized === "Yes"}
                                      onChange={(val) => handleNewPetForExistingChange(idx, "sterilized", val ? "Yes" : "No")}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                                      <span>Unique Pet ID</span>
                                      <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Auto Generated</span>
                                    </label>
                                    <input
                                      type="text"
                                      readOnly
                                      value={pet.uniquePetId || "Assigned automatically on save"}
                                      className="w-full border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-100 text-slate-700 font-mono font-bold text-xs shadow-2xs outline-none cursor-not-allowed select-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* NEW OWNER: PET REGISTRATION FORM */
                    <div className="space-y-6">
                      {newOwnerPets.map((petItem, idx) => (
                        <div key={idx} className="p-5 bg-slate-50/70 rounded-3xl border border-slate-200/80 space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                              Pet Details
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Pet Name <span className="text-red-500 font-bold ml-1">*</span>
                              </label>
                              <input
                                type="text"
                                value={petItem.petName}
                                onChange={(e) => handleNewOwnerPetChange(idx, "petName", e.target.value)}
                                onBlur={() => handlePetFieldBlur(newOwnerPets, idx, "petName", `_${idx}`)}
                                placeholder="Enter Pet Name"
                                className={inputClass}
                              />
                              <ErrorText errors={errors} name={`petName_${idx}`} />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Species <span className="text-red-500 font-bold ml-1">*</span>
                              </label>
                              <select
                                value={petItem.species}
                                onChange={(e) => handleNewOwnerPetChange(idx, "species", e.target.value)}
                                className={inputClass}
                              >
                                <option value="Dog">Dog</option>
                                <option value="Cat">Cat</option>
                                <option value="Rabbit">Rabbit</option>
                                <option value="Bird">Bird</option>
                                <option value="Other">Other</option>
                              </select>
                              {petItem.species === "Other" && (
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    value={petItem.otherSpecies || ""}
                                    onChange={(e) => handleNewOwnerPetChange(idx, "otherSpecies", e.target.value)}
                                    onBlur={() => handlePetFieldBlur(newOwnerPets, idx, "otherSpecies", `_${idx}`)}
                                    placeholder="Enter Custom Species"
                                    className={inputClass}
                                  />
                                  <ErrorText errors={errors} name={`otherSpecies_${idx}`} />
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Breed <span className="text-red-500 font-bold ml-1">*</span>
                              </label>
                              <select
                                value={petItem.breedCustom ? "Other" : (getBreedOptions(petItem.species).includes(petItem.breed) ? petItem.breed : "")}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (v === "Other") {
                                    handleNewOwnerPetChange(idx, "breedCustom", true);
                                  } else {
                                    handleNewOwnerPetChange(idx, "breedCustom", false);
                                    handleNewOwnerPetChange(idx, "breed", v);
                                  }
                                }}
                                onBlur={() => handlePetFieldBlur(newOwnerPets, idx, "breed", `_${idx}`)}
                                className={inputClass}
                              >
                                <option value="">Select Breed</option>
                                {getBreedOptions(petItem.species).map((b) => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                                <option value="Other">Other (specify)</option>
                              </select>
                              {(petItem.breedCustom || (petItem.breed && !getBreedOptions(petItem.species).includes(petItem.breed))) && (
                                <input
                                  type="text"
                                  value={petItem.breed}
                                  onChange={(e) => handleNewOwnerPetChange(idx, "breed", e.target.value)}
                                  onBlur={() => handlePetFieldBlur(newOwnerPets, idx, "breed", `_${idx}`)}
                                  placeholder="Enter Breed"
                                  className={`${inputClass} mt-2`}
                                />
                              )}
                              <ErrorText errors={errors} name={`breed_${idx}`} />
                            </div>

                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                 Gender <span className="text-red-500 font-bold ml-1">*</span>
                               </label>
                               <select
                                 value={petItem.gender}
                                 onChange={(e) => handleNewOwnerPetChange(idx, "gender", e.target.value)}
                                 className={inputClass}
                               >
                                 <option value="Male">Male</option>
                                 <option value="Female">Female</option>
                               </select>
                             </div>

                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                 Date of Birth (DOB)
                               </label>
                               <input
                                 type="date"
                                 value={petItem.dob}
                                 max={today}
                                 min={minPetDob}
                                 onChange={(e) => handleNewOwnerPetChange(idx, "dob", e.target.value)}
                                 className={inputClass}
                               />
                               <ErrorText errors={errors} name={`dob_${idx}`} />
                             </div>

                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                 <span>Age</span>
                                 <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Auto Calculated</span>
                               </label>
                               <input
                                 type="text"
                                 readOnly
                                 value={petItem.dob ? formatAgeDisplay(petItem.dob) : "—"}
                                 placeholder="Set DOB to calculate"
                                 className="w-full border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-100 text-slate-700 font-mono font-bold text-xs shadow-2xs outline-none cursor-not-allowed select-none"
                               />
                             </div>

                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                 Color / Coat Pattern
                               </label>
                               <input
                                 type="text"
                                 value={petItem.color}
                                 onChange={(e) => handleNewOwnerPetChange(idx, "color", e.target.value)}
                                 placeholder="Color / Coat pattern"
                                 className={inputClass}
                               />
                             </div>

                             <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                 Identification Area & Marks
                               </label>
                               <textarea
                                 rows="2"
                                 value={petItem.identificationArea || ""}
                                 onChange={(e) => handleNewOwnerPetChange(idx, "identificationArea", e.target.value)}
                                 placeholder="Physical identification marks, scars, ear notches..."
                                 className={inputClass}
                               />
                             </div>

                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                 RFID / Microchip Tag No
                               </label>
                               <input
                                 type="text"
                                 value={petItem.rfid}
                                 onChange={(e) => handleNewOwnerPetChange(idx, "rfid", e.target.value)}
                                 placeholder="RFID Tag Number"
                                 className={inputClass}
                               />
                             </div>

                             <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                 Pet photo (img upload)
                               </label>
                               <div className="flex items-center gap-4 p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
                                 <input
                                   id={`pet-photo-new-${idx}`}
                                   type="file"
                                   accept="image/*"
                                   onChange={(e) => {
                                     const file = e.target.files[0];
                                     if (file) {
                                       const reader = new FileReader();
                                       reader.onloadend = () => {
                                         handleNewOwnerPetChange(idx, "photo", reader.result);
                                         handleNewOwnerPetChange(idx, "photoName", file.name);
                                       };
                                       reader.readAsDataURL(file);
                                     }
                                   }}
                                   className="hidden"
                                 />
                                 <label
                                   htmlFor={`pet-photo-new-${idx}`}
                                   className="shrink-0 py-2 px-4 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 cursor-pointer"
                                 >
                                   {petItem.photo ? "Change Photo" : "Choose File"}
                                 </label>
                                 {petItem.photo && (
                                   <div className="flex items-center gap-2 min-w-0">
                                     <img
                                       src={petItem.photo}
                                       alt="Pet Preview"
                                       className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                                     />
                                     <span className="text-xs text-slate-500 truncate max-w-[140px]">{petItem.photoName}</span>
                                   </div>
                                 )}
                               </div>
                             </div>

                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                 Sterilized
                               </label>
                               <SterilizedToggle
                                 checked={petItem.sterilized === "Yes"}
                                 onChange={(val) => handleNewOwnerPetChange(idx, "sterilized", val ? "Yes" : "No")}
                               />
                             </div>

                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                 <span>Unique Pet ID</span>
                                 <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Auto Generated</span>
                               </label>
                               <input
                                 type="text"
                                 readOnly
                                 value={petItem.uniquePetId || "Assigned automatically on save"}
                                 className="w-full border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-100 text-slate-700 font-mono font-bold text-xs shadow-2xs outline-none cursor-not-allowed select-none"
                               />
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: PET HISTORY (MULTI-PET TABBED VIEW) */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      <span>Pet Medical History</span>
                    </h2>
                  </div>

                  {/* Multi-Pet Sub Tabs */}
                  {activePets.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
                      {activePets.map((pet, idx) => {
                        const isActive = idx === activeHistoryPetIndex;
                        return (
                          <button
                            key={pet.id}
                            type="button"
                            onClick={() => setActiveHistoryPetIndex(idx)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 border ${
                              isActive
                                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <PawPrint className="w-3.5 h-3.5" />
                            <span>{pet.petName}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                              {pet.species}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {currentHistoryPet && (
                    <div className="space-y-5">
                      <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-2xl flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-800 flex items-center gap-1.5">
                          <PawPrint className="w-4 h-4 text-orange-500" />
                          Entering Medical History for: <strong className="text-orange-950 font-extrabold">{currentHistoryPet.petName}</strong> ({currentHistoryPet.breed})
                        </span>
                        <span className="text-[11px] font-mono font-bold text-orange-600">
                          {currentHistoryPet.uniquePetId}
                        </span>
                      </div>

                      <div className="space-y-6">
                        {/* SECTION 1: Previous Vaccination */}
                        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                              <span>💉 Previous Vaccination</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                const currentHistory = petHistoriesMap[currentHistoryPet.id] || defaultHistory;
                                const currentList = currentHistory.vaccinations && currentHistory.vaccinations.length > 0
                                  ? currentHistory.vaccinations
                                  : [{ vaccineName: currentHistory.vaccineName || "", vaccinationDate: currentHistory.vaccinationDate || "", batchNumber: currentHistory.batchNumber || "", clinicName: currentHistory.clinicName || "" }];
                                const newList = [...currentList, { vaccineName: "", vaccinationDate: "", batchNumber: "", clinicName: "" }];
                                handlePetHistoryChange(currentHistoryPet.id, "vaccinations", newList);
                                handlePetHistoryChange(currentHistoryPet.id, "vaccineName", newList[0].vaccineName);
                              }}
                              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Vaccination Record</span>
                            </button>
                          </div>

                          {(() => {
                            const currentHistory = petHistoriesMap[currentHistoryPet.id] || defaultHistory;
                            const vacList = (currentHistory.vaccinations && currentHistory.vaccinations.length > 0)
                              ? currentHistory.vaccinations
                              : [{ vaccineName: currentHistory.vaccineName || "", vaccinationDate: currentHistory.vaccinationDate || "", batchNumber: currentHistory.batchNumber || "", clinicName: currentHistory.clinicName || "" }];

                            return vacList.map((row, rIdx) => (
                              <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-white rounded-xl border border-slate-100 relative">
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    1. vaccine {vacList.length > 1 ? `#${rIdx + 1}` : ""}
                                  </label>
                                  <input
                                    type="text"
                                    value={row.vaccineName || ""}
                                    onChange={(e) => {
                                      const newList = [...vacList];
                                      newList[rIdx] = { ...newList[rIdx], vaccineName: e.target.value };
                                      handlePetHistoryChange(currentHistoryPet.id, "vaccinations", newList);
                                      if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "vaccineName", e.target.value);
                                    }}
                                    placeholder="Vaccine Name"
                                    className={inputClass}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    2. date
                                  </label>
                                  <input
                                    type="date"
                                    value={row.vaccinationDate || ""}
                                    max={today}
                                    onChange={(e) => {
                                      const newList = [...vacList];
                                      newList[rIdx] = { ...newList[rIdx], vaccinationDate: e.target.value };
                                      handlePetHistoryChange(currentHistoryPet.id, "vaccinations", newList);
                                      if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "vaccinationDate", e.target.value);
                                    }}
                                    className={inputClass}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    3. Batch.no
                                  </label>
                                  <input
                                    type="text"
                                    value={row.batchNumber || ""}
                                    onChange={(e) => {
                                      const newList = [...vacList];
                                      newList[rIdx] = { ...newList[rIdx], batchNumber: e.target.value };
                                      handlePetHistoryChange(currentHistoryPet.id, "vaccinations", newList);
                                      if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "batchNumber", e.target.value);
                                    }}
                                    placeholder="Batch Number"
                                    className={inputClass}
                                  />
                                </div>

                                <div className="flex items-end gap-2">
                                  <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                      4. Clinic
                                    </label>
                                    <input
                                      type="text"
                                      value={row.clinicName || ""}
                                      onChange={(e) => {
                                        const newList = [...vacList];
                                        newList[rIdx] = { ...newList[rIdx], clinicName: e.target.value };
                                        handlePetHistoryChange(currentHistoryPet.id, "vaccinations", newList);
                                        if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "clinicName", e.target.value);
                                      }}
                                      placeholder="Clinic Name"
                                      className={inputClass}
                                    />
                                  </div>

                                  {vacList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newList = vacList.filter((_, i) => i !== rIdx);
                                        handlePetHistoryChange(currentHistoryPet.id, "vaccinations", newList);
                                      }}
                                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-rose-200"
                                      title="Remove record"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>

                        {/* SECTION 2: Deworming History */}
                        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                              <span>🪱 Deworming History</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                const currentHistory = petHistoriesMap[currentHistoryPet.id] || defaultHistory;
                                const currentList = currentHistory.dewormings && currentHistory.dewormings.length > 0
                                  ? currentHistory.dewormings
                                  : [{ dewormingProduct: currentHistory.dewormingProduct || "", dewormingDate: currentHistory.dewormingDate || "", dose: currentHistory.dose || "" }];
                                const newList = [...currentList, { dewormingProduct: "", dewormingDate: "", dose: "" }];
                                handlePetHistoryChange(currentHistoryPet.id, "dewormings", newList);
                              }}
                              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Deworming Record</span>
                            </button>
                          </div>

                          {(() => {
                            const currentHistory = petHistoriesMap[currentHistoryPet.id] || defaultHistory;
                            const dewList = (currentHistory.dewormings && currentHistory.dewormings.length > 0)
                              ? currentHistory.dewormings
                              : [{ dewormingProduct: currentHistory.dewormingProduct || "", dewormingDate: currentHistory.dewormingDate || "", dose: currentHistory.dose || "" }];

                            return dewList.map((row, rIdx) => (
                              <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-white rounded-xl border border-slate-100">
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    1. product {dewList.length > 1 ? `#${rIdx + 1}` : ""}
                                  </label>
                                  <input
                                    type="text"
                                    value={row.dewormingProduct || ""}
                                    onChange={(e) => {
                                      const newList = [...dewList];
                                      newList[rIdx] = { ...newList[rIdx], dewormingProduct: e.target.value };
                                      handlePetHistoryChange(currentHistoryPet.id, "dewormings", newList);
                                      if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "dewormingProduct", e.target.value);
                                    }}
                                    placeholder="Product Name"
                                    className={inputClass}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    2. date
                                  </label>
                                  <input
                                    type="date"
                                    value={row.dewormingDate || ""}
                                    max="9999-12-31"
                                    onChange={(e) => {
                                      const newList = [...dewList];
                                      newList[rIdx] = { ...newList[rIdx], dewormingDate: e.target.value };
                                      handlePetHistoryChange(currentHistoryPet.id, "dewormings", newList);
                                      if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "dewormingDate", e.target.value);
                                    }}
                                    className={inputClass}
                                  />
                                </div>

                                <div className="flex items-end gap-2">
                                  <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                      3. dose
                                    </label>
                                    <input
                                      type="text"
                                      value={row.dose || ""}
                                      onChange={(e) => {
                                        const newList = [...dewList];
                                        newList[rIdx] = { ...newList[rIdx], dose: e.target.value };
                                        handlePetHistoryChange(currentHistoryPet.id, "dewormings", newList);
                                        if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "dose", e.target.value);
                                      }}
                                      placeholder="Dose (e.g. 1 Tab / 2 ml)"
                                      className={inputClass}
                                    />
                                  </div>

                                  {dewList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newList = dewList.filter((_, i) => i !== rIdx);
                                        handlePetHistoryChange(currentHistoryPet.id, "dewormings", newList);
                                      }}
                                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-rose-200"
                                      title="Remove record"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>

                        {/* SECTION 3: Surgical Procedure */}
                        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                              <span>🏥 Surgical Procedure</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                const currentHistory = petHistoriesMap[currentHistoryPet.id] || defaultHistory;
                                const currentList = currentHistory.surgeries && currentHistory.surgeries.length > 0
                                  ? currentHistory.surgeries
                                  : [{ surgicalProcedure: currentHistory.surgicalProcedure || "", surgeryDate: currentHistory.surgeryDate || "", hospital: currentHistory.hospital || "" }];
                                const newList = [...currentList, { surgicalProcedure: "", surgeryDate: "", hospital: "" }];
                                handlePetHistoryChange(currentHistoryPet.id, "surgeries", newList);
                              }}
                              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Surgery Record</span>
                            </button>
                          </div>

                          {(() => {
                            const currentHistory = petHistoriesMap[currentHistoryPet.id] || defaultHistory;
                            const surgList = (currentHistory.surgeries && currentHistory.surgeries.length > 0)
                              ? currentHistory.surgeries
                              : [{ surgicalProcedure: currentHistory.surgicalProcedure || "", surgeryDate: currentHistory.surgeryDate || "", hospital: currentHistory.hospital || "" }];

                            return surgList.map((row, rIdx) => (
                              <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-white rounded-xl border border-slate-100">
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    1. procedure {surgList.length > 1 ? `#${rIdx + 1}` : ""}
                                  </label>
                                  <input
                                    type="text"
                                    value={row.surgicalProcedure || ""}
                                    onChange={(e) => {
                                      const newList = [...surgList];
                                      newList[rIdx] = { ...newList[rIdx], surgicalProcedure: e.target.value };
                                      handlePetHistoryChange(currentHistoryPet.id, "surgeries", newList);
                                      if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "surgicalProcedure", e.target.value);
                                    }}
                                    placeholder="Surgical Procedure Name"
                                    className={inputClass}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    2. date
                                  </label>
                                  <input
                                    type="date"
                                    value={row.surgeryDate || ""}
                                    max="9999-12-31"
                                    onChange={(e) => {
                                      const newList = [...surgList];
                                      newList[rIdx] = { ...newList[rIdx], surgeryDate: e.target.value };
                                      handlePetHistoryChange(currentHistoryPet.id, "surgeries", newList);
                                      if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "surgeryDate", e.target.value);
                                    }}
                                    className={inputClass}
                                  />
                                </div>

                                <div className="flex items-end gap-2">
                                  <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                      3. hospital
                                    </label>
                                    <input
                                      type="text"
                                      value={row.hospital || ""}
                                      onChange={(e) => {
                                        const newList = [...surgList];
                                        newList[rIdx] = { ...newList[rIdx], hospital: e.target.value };
                                        handlePetHistoryChange(currentHistoryPet.id, "surgeries", newList);
                                        if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "hospital", e.target.value);
                                      }}
                                      placeholder="Hospital / Clinic Name"
                                      className={inputClass}
                                    />
                                  </div>

                                  {surgList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newList = surgList.filter((_, i) => i !== rIdx);
                                        handlePetHistoryChange(currentHistoryPet.id, "surgeries", newList);
                                      }}
                                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-rose-200"
                                      title="Remove record"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>

                        {/* SECTION 4: Past Treatments */}
                        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                              <span>💊 Past Treatments</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                const currentHistory = petHistoriesMap[currentHistoryPet.id] || defaultHistory;
                                const currentList = currentHistory.pastTreatments && currentHistory.pastTreatments.length > 0
                                  ? currentHistory.pastTreatments
                                  : [{ condition: currentHistory.condition || "", treatment: currentHistory.treatment || "", treatmentDate: currentHistory.treatmentDate || "" }];
                                const newList = [...currentList, { condition: "", treatment: "", treatmentDate: "" }];
                                handlePetHistoryChange(currentHistoryPet.id, "pastTreatments", newList);
                              }}
                              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Treatment Record</span>
                            </button>
                          </div>

                          {(() => {
                            const currentHistory = petHistoriesMap[currentHistoryPet.id] || defaultHistory;
                            const treatList = (currentHistory.pastTreatments && currentHistory.pastTreatments.length > 0)
                              ? currentHistory.pastTreatments
                              : [{ condition: currentHistory.condition || "", treatment: currentHistory.treatment || "", treatmentDate: currentHistory.treatmentDate || "" }];

                            return treatList.map((row, rIdx) => (
                              <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-white rounded-xl border border-slate-100">
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    1. Condition {treatList.length > 1 ? `#${rIdx + 1}` : ""}
                                  </label>
                                  <input
                                    type="text"
                                    value={row.condition || ""}
                                    onChange={(e) => {
                                      const newList = [...treatList];
                                      newList[rIdx] = { ...newList[rIdx], condition: e.target.value };
                                      handlePetHistoryChange(currentHistoryPet.id, "pastTreatments", newList);
                                      if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "condition", e.target.value);
                                    }}
                                    placeholder="Condition Name"
                                    className={inputClass}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    2. Treatment
                                  </label>
                                  <input
                                    type="text"
                                    value={row.treatment || ""}
                                    onChange={(e) => {
                                      const newList = [...treatList];
                                      newList[rIdx] = { ...newList[rIdx], treatment: e.target.value };
                                      handlePetHistoryChange(currentHistoryPet.id, "pastTreatments", newList);
                                      if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "treatment", e.target.value);
                                    }}
                                    placeholder="Treatment details"
                                    className={inputClass}
                                  />
                                </div>

                                <div className="flex items-end gap-2">
                                  <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                      3. Date
                                    </label>
                                    <input
                                      type="date"
                                      value={row.treatmentDate || ""}
                                      max="9999-12-31"
                                      onChange={(e) => {
                                        const newList = [...treatList];
                                        newList[rIdx] = { ...newList[rIdx], treatmentDate: e.target.value };
                                        handlePetHistoryChange(currentHistoryPet.id, "pastTreatments", newList);
                                        if (rIdx === 0) handlePetHistoryChange(currentHistoryPet.id, "treatmentDate", e.target.value);
                                      }}
                                      className={inputClass}
                                    />
                                  </div>

                                  {treatList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newList = treatList.filter((_, i) => i !== rIdx);
                                        handlePetHistoryChange(currentHistoryPet.id, "pastTreatments", newList);
                                      }}
                                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-rose-200"
                                      title="Remove record"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>

                        {/* SECTION 5 & 6: Known Allergies & Current Medications */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                              Known Allergies
                            </label>
                            <textarea
                              name="allergies"
                              value={(petHistoriesMap[currentHistoryPet.id] || defaultHistory).allergies || ""}
                              onChange={(e) => handlePetHistoryChange(currentHistoryPet.id, "allergies", e.target.value)}
                              rows="3"
                              placeholder="Describe known allergies..."
                              className={inputClass}
                            />
                          </div>

                          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                              Current Medications
                            </label>
                            <textarea
                              name="medications"
                              value={(petHistoriesMap[currentHistoryPet.id] || defaultHistory).medications || ""}
                              onChange={(e) => handlePetHistoryChange(currentHistoryPet.id, "medications", e.target.value)}
                              rows="3"
                              placeholder="Describe current medications..."
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: REASON FOR VISIT (MULTI-PET TABBED VIEW) */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-orange-500" />
                      <span>Reason For Visit & Doctor Assignment</span>
                    </h2>
                  </div>

                  {errors.visitDetails && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errors.visitDetails}
                    </div>
                  )}

                  {/* Multi-Pet Sub Tabs */}
                  {activePets.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
                      {activePets.map((pet, idx) => {
                        const isActive = idx === activeVisitPetIndex;
                        const v = petVisitsMap[pet.id] || defaultVisitReason;
                        const isComplete = Boolean(v.primaryReason && v.complaint && v.assignedDoctor);
                        return (
                          <button
                            key={pet.id}
                            type="button"
                            onClick={() => setActiveVisitPetIndex(idx)}
                            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 border ${
                              isActive
                                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100"
                                : isComplete
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                            }`}
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>{pet.petName}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                              isActive
                                ? "bg-white/20 text-white"
                                : isComplete
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-900"
                            }`}>
                              {isComplete ? "✓ Ready" : "⚠️ Incomplete"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {currentVisitPet && (() => {
                    const currentVisit = petVisitsMap[currentVisitPet.id] || defaultVisitReason;
                    const isPrimaryReasonMissing = !currentVisit.primaryReason;
                    const isComplaintMissing = !currentVisit.complaint;
                    const isAssignedDoctorMissing = !currentVisit.assignedDoctor;

                    return (
                      <div className="space-y-5">
                        <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <Stethoscope className="w-4 h-4 text-emerald-600" />
                            Visit Setup for: <strong className="text-emerald-950 font-extrabold">{currentVisitPet.petName}</strong> ({currentVisitPet.breed})
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-700">
                            {currentVisitPet.uniquePetId}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                              Primary Reason *
                            </label>
                            <select
                              name="primaryReason"
                              value={currentVisit.primaryReason || ""}
                              onChange={(e) => {
                                handlePetVisitChange(currentVisitPet.id, "primaryReason", e.target.value);
                                if (errors.visitDetails) setErrors((prev) => ({ ...prev, visitDetails: "" }));
                              }}
                              className={`${inputClass} ${errors.visitDetails && isPrimaryReasonMissing ? "border-red-500 ring-2 ring-red-100 bg-red-50/20" : ""}`}
                            >
                              <option value="">Select Reason</option>
                              {reasonOptions.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                            {errors.visitDetails && isPrimaryReasonMissing && (
                              <p className="text-xs text-red-500 font-semibold mt-1">Please select a primary reason.</p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                              Specific Complaint In Brief *
                            </label>
                            <textarea
                              name="complaint"
                              value={currentVisit.complaint || ""}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[0-9]/g, "");
                                handlePetVisitChange(currentVisitPet.id, "complaint", val);
                                if (errors.visitDetails) setErrors((prev) => ({ ...prev, visitDetails: "" }));
                              }}
                              rows="3"
                              placeholder={`Enter complaint details for ${currentVisitPet.petName}`}
                              className={`${inputClass} ${errors.visitDetails && isComplaintMissing ? "border-red-500 ring-2 ring-red-100 bg-red-50/20" : ""}`}
                            />
                            {errors.visitDetails && isComplaintMissing && (
                              <p className="text-xs text-red-500 font-semibold mt-1">Please enter specific complaint details.</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                              <span>Token / Queue Number</span>
                              <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Auto Generated</span>
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={currentVisit.tokenNumber || "Assigned automatically on save"}
                              className="w-full border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-100 text-slate-700 font-mono font-bold text-xs shadow-2xs outline-none cursor-not-allowed select-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                              Appointment Date *
                            </label>
                            <input
                              name="appointmentDate"
                              value={currentVisit.appointmentDate || today}
                              onChange={(e) => handlePetVisitChange(currentVisitPet.id, "appointmentDate", e.target.value)}
                              type="date"
                              min={today}
                              max="9999-12-31"
                              className={`${inputClass} ${errors[`appointmentDate_${currentVisitPet.id}`] ? "border-red-500 ring-2 ring-red-100 bg-red-50/20" : ""}`}
                            />
                            {errors[`appointmentDate_${currentVisitPet.id}`] && (
                              <p className="text-xs text-red-500 font-semibold mt-1">
                                {errors[`appointmentDate_${currentVisitPet.id}`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                              Appointment Time *
                            </label>
                            <input
                              name="appointmentTime"
                              value={currentVisit.appointmentTime || ""}
                              onChange={(e) => handlePetVisitChange(currentVisitPet.id, "appointmentTime", e.target.value)}
                              type="time"
                              min={(currentVisit.appointmentDate || today) === today ? getCurrentTimeStr() : undefined}
                              className={`${inputClass} ${errors[`appointmentTime_${currentVisitPet.id}`] ? "border-red-500 ring-2 ring-red-100 bg-red-50/20" : ""}`}
                            />
                            {errors[`appointmentTime_${currentVisitPet.id}`] && (
                              <p className="text-xs text-red-500 font-semibold mt-1">
                                {errors[`appointmentTime_${currentVisitPet.id}`]}
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                              Assigned Doctor *
                            </label>
                            <select
                              name="assignedDoctor"
                              value={currentVisit.assignedDoctor || ""}
                              onChange={(e) => {
                                handlePetVisitChange(currentVisitPet.id, "assignedDoctor", e.target.value);
                                if (errors.visitDetails) setErrors((prev) => ({ ...prev, visitDetails: "" }));
                              }}
                              className={`${inputClass} ${errors.visitDetails && isAssignedDoctorMissing ? "border-red-500 ring-2 ring-red-100 bg-red-50/20" : ""}`}
                            >
                              <option value="">Select Doctor</option>
                              {doctors.map((doctor) => (
                                <option key={getDoctorOptionValue(doctor)} value={getDoctorName(doctor)}>
                                  {getDoctorName(doctor) || "Doctor"}
                                </option>
                              ))}
                            </select>
                            {errors.visitDetails && isAssignedDoctorMissing && (
                              <p className="text-xs text-red-500 font-semibold mt-1">Please select an assigned doctor.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Bottom Footer Navigation */}
            <div className="border-t border-slate-100 px-4 py-2.5 sm:px-6 sm:py-3 flex justify-between items-center gap-3 bg-white">
              <button
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              {step < steps.length ? (
                <button
                  onClick={handleNext}
                  disabled={hasVisiblePetErrors}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-orange-100 transition cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-orange-500 disabled:hover:to-amber-500"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-emerald-100 transition cursor-pointer border-none"
                >
                  Complete Registration & Visit
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
