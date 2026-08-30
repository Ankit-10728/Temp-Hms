import { useEffect, useMemo, useRef, useState } from "react";
import { City, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User,
  PawPrint,
  FileText,
  Stethoscope,
  Plus,
  CheckCircle2,
  Save,
  Loader2,
  MapPin,
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  X,
  ArrowRight,
  Check,
} from "lucide-react";
import { showToast } from "../../../../shared/components/toast";
import {
  addPet,
  createVisit,
  searchCustomer,
  updateOwner,
  updatePet,
} from "../../api/receptionApi";
import { getDoctors } from "../../api/doctorApi";
import { getDoctorStaff } from "../../api/staffApi";

const today = new Date().toISOString().split("T")[0];

const initialPetForm = {
  petName: "",
  species: "Dog",
  breed: "",
  gender: "Male",
  dob: "",
  age: "",
  color: "",
  rfid: "",
  identificationArea: "",
  petPhoto: null,
  sterilized: "No",
  // History fields
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
  // Visit fields for pet modal
  primaryReason: "",
  complaint: "",
  appointmentDate: "",
  appointmentTime: "",
  assignedDoctor: "",
};

const initialVisitForm = {
  petId: "",
  ownerId: "",
  primaryReason: "",
  complaint: "",
  appointmentDate: "",
  appointmentTime: "",
  assignedDoctor: "",
  visitType: "CONSULTATION",
  priority: "NORMAL",
  notes: "",
};

const reasonOptions = ["Treatment", "Vaccination", "Checkup", "Certificate"];

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

  return age >= 0 ? String(age) : "";
};

const formatDate = (date) => (date ? new Date(date).toISOString().split("T")[0] : "");

const normalizeSpecies = (species) =>
  species ? species.charAt(0).toUpperCase() + species.slice(1).toLowerCase() : "Dog";

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

function ErrorText({ errors, name }) {
  return errors[name] ? <p className="mt-1 text-xs text-red-500 font-medium">{errors[name]}</p> : null;
}

export default function CreateVisitForm() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [owner, setOwner] = useState(null);
  const [pets, setPets] = useState([]);
  const [ownerForm, setOwnerForm] = useState({});
  const [petForm, setPetForm] = useState(initialPetForm);
  const [visitForm, setVisitForm] = useState(initialVisitForm);

  // Modal State for Adding New Pet
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("registration"); // "registration" | "history" | "visit"

  const formScrollRef = useRef(null);

  useEffect(() => {
    if (formScrollRef.current) {
      formScrollRef.current.scrollTop = 0;
    }
  }, [modalTab]);

  const [searching, setSearching] = useState(false);
  const [savingOwner, setSavingOwner] = useState(false);
  const [savingPet, setSavingPet] = useState(false);
  const [savingVisit, setSavingVisit] = useState(false);
  const [errors, setErrors] = useState({});
  const [doctors, setDoctors] = useState([]);

  // Pincode validation states
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeValid, setPincodeValid] = useState(null);
  const [pincodeDetails, setPincodeDetails] = useState("");

  const navigate = useNavigate();

  const states = useMemo(() => State.getStatesOfCountry("IN"), []);

  const cities = useMemo(() => {
    if (!ownerForm.state) return [];
    const list = City.getCitiesOfState("IN", ownerForm.state) || [];
    if (ownerForm.city && !list.some((c) => c.name === ownerForm.city)) {
      return [{ name: ownerForm.city, latitude: "0", longitude: "0" }, ...list];
    }
    return list;
  }, [ownerForm.state, ownerForm.city]);

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

  const selectedPet = pets.find((pet) => pet._id === visitForm.petId);

  const setError = (name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const validatePincode = async (pin) => {
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setPincodeValid(null);
      setPincodeLoading(false);
      setPincodeDetails("");
      return;
    }

    setPincodeLoading(true);
    setPincodeValid(null);
    setPincodeDetails("Verifying PIN Code...");

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();

      if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const poList = data[0].PostOffice;
        const po = poList[0];

        const districtName = po.District || po.Block || po.Circle || po.Division || "";
        const stateName = po.State || "";
        const postOfficeName = po.Name || "";

        const matchedState = matchStateFromList(stateName, states);

        if (matchedState) {
          const stateIso = matchedState.isoCode;
          const stateCities = City.getCitiesOfState("IN", stateIso) || [];

          let selectedCityName = "";
          const candidates = [po.District, po.Block, po.Circle, po.Division, po.Name].filter(Boolean);

          for (const cand of candidates) {
            const candClean = cleanStr(cand);
            const foundCity = stateCities.find((c) => cleanStr(c.name) === candClean);
            if (foundCity) {
              selectedCityName = foundCity.name;
              break;
            }
          }

          if (!selectedCityName) {
            selectedCityName = districtName || (stateCities[0] ? stateCities[0].name : "");
          }

          setOwnerForm((prev) => ({
            ...prev,
            pincode: pin,
            state: stateIso,
            city: selectedCityName,
            district: districtName || selectedCityName,
          }));

          setErrors((prev) => ({ ...prev, pincode: "", state: "", city: "", district: "" }));
          setPincodeValid(true);
          setPincodeLoading(false);
          setPincodeDetails(
            `${postOfficeName ? postOfficeName + ", " : ""}${districtName ? districtName + ", " : ""}${matchedState.name}`
          );
          return;
        }
      }

      setPincodeValid(false);
      setPincodeLoading(false);
      setPincodeDetails("Invalid PIN Code.");
    } catch (err) {
      console.error("Pincode lookup error:", err);
      setPincodeLoading(false);
      setPincodeValid(null);
      setPincodeDetails("");
    }
  };

  const fillOwner = (customer) => {
    setOwner(customer);
    setPets(customer.pets || []);
    setOwnerForm({
      ownerName: customer.ownerName || "",
      visitType: customer.visitType || "Follow-up",
      ownerIdType: customer.ownerIdType || "Aadhaar Card",
      email: customer.email || "",
      address: customer.address || "",
      state: customer.state || "",
      city: customer.city || "",
      district: customer.district || "",
      pincode: customer.pincode || "",
    });

    const firstPet = customer.pets?.[0];
    setVisitForm((prev) => ({
      ...prev,
      ownerId: customer._id,
      petId: firstPet?._id || "",
    }));
  };

  const handleMobileInput = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
    setMobileNumber(digits);

    if (!digits) {
      setError("mobileNumber", "");
    } else if (!/^[6-9]/.test(digits)) {
      setError("mobileNumber", "Mobile number must start with 6, 7, 8, or 9.");
    } else if (digits.length < 10) {
      setError("mobileNumber", `Mobile number must be 10 digits (${digits.length}/10).`);
    } else {
      setError("mobileNumber", "");
    }
  };

  const handleSearch = async () => {
    const cleanMobile = mobileNumber.trim();
    if (!cleanMobile) {
      setError("mobileNumber", "Please enter a mobile number to search.");
      showToast({
        type: "error",
        title: "Mobile Required",
        description: "Enter a mobile number to search registered customer.",
      });
      return;
    }

    if (cleanMobile.length !== 10) {
      setError("mobileNumber", "Mobile number must be exactly 10 digits.");
      showToast({
        type: "error",
        title: "Invalid Length",
        description: "Mobile number must be exactly 10 digits.",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError("mobileNumber", "Invalid Indian mobile number. Must start with 6, 7, 8, or 9.");
      showToast({
        type: "error",
        title: "Invalid Mobile",
        description: "Must be a valid 10-digit Indian mobile number starting with 6-9.",
      });
      return;
    }

    try {
      setSearching(true);
      setErrors({});
      const response = await searchCustomer(cleanMobile);
      const customer = response?.data;

      if (!customer) {
        setOwner(null);
        setPets([]);
        setPetForm(initialPetForm);
        setVisitForm(initialVisitForm);
        setError("mobileNumber", "No registered owner found with this mobile number.");
        showToast({
          type: "error",
          title: "Not Found",
          description: "No customer found with this mobile number.",
        });
        return;
      }

      fillOwner(customer);
      showToast({
        type: "success",
        title: "Customer Found",
        description: `Loaded customer: ${customer.ownerName}`,
      });
    } catch (error) {
      console.error(error);
      setError("mobileNumber", "Error searching customer mobile number.");
      showToast({
        type: "error",
        title: "Search Error",
        description: "Failed to search customer records.",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleOwnerChange = (event) => {
    const { name, value } = event.target;

    if (name === "pincode") {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      setOwnerForm((prev) => ({ ...prev, pincode: digits }));
      setError("pincode", "");

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
      setOwnerForm((prev) => ({ ...prev, state: value, city: "", district: "", pincode: "" }));
      setPincodeValid(false);
      setPincodeLoading(false);
      setPincodeDetails("State changed - pincode reset.");
      setError("state", "");
      setError("pincode", "Invalid PIN code for selected state. Please re-enter PIN code.");
      return;
    }

    if (name === "district") {
      setOwnerForm((prev) => ({ ...prev, district: value, city: prev.city || value, pincode: "" }));
      setPincodeValid(false);
      setPincodeLoading(false);
      setPincodeDetails("District changed - pincode reset.");
      setError("district", "");
      setError("pincode", "Invalid PIN code for selected district. Please re-enter PIN code.");
      return;
    }

    if (name === "city") {
      const formatted = value.replace(/[^a-zA-Z\s.-]/g, "");
      setOwnerForm((prev) => ({ ...prev, city: formatted }));
      if (formatted.trim()) {
        setError("city", "");
      }
      return;
    }

    if (name === "ownerIdType") {
      setOwnerForm((prev) => ({ ...prev, ownerIdType: value, ownerIdNumber: "" }));
      setError("ownerIdNumber", "");
      return;
    }

    if (name === "ownerIdNumber") {
      let formatted = value;
      if ((ownerForm.ownerIdType || "Aadhaar Card") === "Aadhaar Card") {
        formatted = value.replace(/\D/g, "").slice(0, 12);
        setOwnerForm((prev) => ({ ...prev, ownerIdNumber: formatted }));
        if (formatted.length === 12) {
          setError("ownerIdNumber", "");
        } else if (formatted.length > 0) {
          setError("ownerIdNumber", `Aadhaar Card number must be 12 digits (${formatted.length}/12).`);
        } else {
          setError("ownerIdNumber", "");
        }
      } else if (ownerForm.ownerIdType === "PAN Card") {
        formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
        setOwnerForm((prev) => ({ ...prev, ownerIdNumber: formatted }));
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (panRegex.test(formatted)) {
          setError("ownerIdNumber", "");
        } else if (formatted.length > 0) {
          setError("ownerIdNumber", "Enter a valid 10-character PAN number (e.g. ABCDE1234F).");
        } else {
          setError("ownerIdNumber", "");
        }
      } else {
        setOwnerForm((prev) => ({ ...prev, ownerIdNumber: value }));
        setError("ownerIdNumber", "");
      }
      return;
    }

    setOwnerForm((prev) => ({ ...prev, [name]: value }));
    setError(name, "");
  };

  const handlePetChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "dob") {
      if (value && value > today) {
        setPetForm((prev) => ({ ...prev, dob: value, age: "" }));
        setError("dob", "DOB cannot be in the future.");
        return;
      }

      setPetForm((prev) => ({ ...prev, dob: value, age: calculateAge(value) }));
      setError("dob", "");
      return;
    }

    if (name === "color") {
      const textOnly = value.replace(/[^a-zA-Z\s]/g, "");
      setPetForm((prev) => ({ ...prev, color: textOnly }));
      setError("color", "");
      return;
    }

    if (name === "rfid") {
      const stringOnly = value.replace(/[^a-zA-Z0-9-]/g, "");
      setPetForm((prev) => ({ ...prev, rfid: stringOnly }));
      setError("rfid", "");
      return;
    }

    setPetForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    setError(name, "");
  };

  const handleVisitChange = (event) => {
    const { name, value } = event.target;
    setVisitForm((prev) => ({ ...prev, [name]: value }));
    setError(name, "");
  };

  const handleSaveOwner = async () => {
    if (!owner?._id) return;

    const ownerErrors = {};
    if (!ownerForm.ownerName?.trim()) ownerErrors.ownerName = "Owner name is required.";
    if (ownerForm.ownerIdType === "Aadhaar Card" && (!ownerForm.ownerIdNumber || ownerForm.ownerIdNumber.length !== 12)) {
      ownerErrors.ownerIdNumber = "Aadhaar Card number must be 12 digits.";
    }
    if (ownerForm.ownerIdType === "PAN Card" && (!ownerForm.ownerIdNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(ownerForm.ownerIdNumber))) {
      ownerErrors.ownerIdNumber = "Enter a valid 10-character PAN number (e.g. ABCDE1234F).";
    }
    if (!ownerForm.address?.trim()) ownerErrors.address = "Full address is required.";
    if (!ownerForm.state?.trim()) ownerErrors.state = "State is required.";
    if (!ownerForm.district?.trim()) ownerErrors.district = "District is required.";
    if (!ownerForm.city?.trim()) ownerErrors.city = "City is required.";
    if (!/^\d{6}$/.test(ownerForm.pincode)) ownerErrors.pincode = "Enter a valid 6-digit pincode.";

    if (Object.keys(ownerErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...ownerErrors }));
      showToast({
        type: "error",
        title: "Validation Error",
        description: "Please fill all required owner details correctly.",
      });
      return;
    }

    try {
      setSavingOwner(true);
      const response = await updateOwner(owner._id, ownerForm);
      fillOwner(response.data);
      showToast({
        type: "success",
        title: "Owner Updated",
        description: "Owner details updated successfully.",
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Update Failed",
        description: "Failed to update owner details.",
      });
    } finally {
      setSavingOwner(false);
    }
  };

  // Open Modal to Add New Pet
  const handleOpenAddPetModal = () => {
    setPetForm(initialPetForm);
    setModalTab("registration");
    setIsAddPetModalOpen(true);
  };

  // Submit New Pet Modal
  const handleSaveNewPetModal = async () => {
    if (!petForm.petName || !petForm.breed) {
      showToast({
        type: "error",
        title: "Validation Error",
        description: "Pet Name and Breed are required.",
      });
      return;
    }

    const payload = {
      ...petForm,
      sterilized: petForm.sterilized === "Yes",
    };

    try {
      setSavingPet(true);
      const response = await addPet(owner._id, payload);
      const addedPet = response.data?.pets?.[response.data.pets.length - 1];
      fillOwner(response.data);

      setVisitForm((prev) => ({
        ...prev,
        ownerId: owner._id,
        petId: addedPet?._id || prev.petId,
        primaryReason: petForm.primaryReason || prev.primaryReason,
        complaint: petForm.complaint || prev.complaint,
        appointmentDate: petForm.appointmentDate || prev.appointmentDate,
        appointmentTime: petForm.appointmentTime || prev.appointmentTime,
        assignedDoctor: petForm.assignedDoctor || prev.assignedDoctor,
      }));

      setIsAddPetModalOpen(false);
      showToast({
        type: "success",
        title: "New Pet Registered",
        description: `${petForm.petName} has been added and selected.`,
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Pet Registration Failed",
        description: "Unable to add new pet.",
      });
    } finally {
      setSavingPet(false);
    }
  };

  const handleSubmitVisit = async (event) => {
    event.preventDefault();

    if (!owner?._id) {
      showToast({ type: "error", title: "Error", description: "Search customer first." });
      return;
    }

    if (!visitForm.petId) {
      showToast({ type: "error", title: "Error", description: "Select a pet for the visit." });
      return;
    }

    if (!visitForm.chiefComplaint && !visitForm.primaryReason) {
      showToast({ type: "error", title: "Validation Error", description: "Chief complaint is required." });
      return;
    }

    try {
      setSavingVisit(true);
      await updateOwner(owner._id, ownerForm);

      await createVisit({
        ...visitForm,
        chiefComplaint: visitForm.chiefComplaint || visitForm.complaint,
        ownerId: owner._id,
        petId: visitForm.petId,
      });

      showToast({
        type: "success",
        title: "Visit Scheduled",
        description: "Patient visit created successfully.",
      });

      navigate("/clinic/reception");
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Visit Failed",
        description: error?.response?.data?.message || "Failed to create visit.",
      });
    } finally {
      setSavingVisit(false);
    }
  };

  const inputCls =
    "w-full border border-slate-200 rounded-xl p-3 bg-white text-slate-700 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none";

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-200/70 overflow-hidden flex flex-col">
        {/* Sleek Dark Header Hero Section */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Create Patient Visit</h1>
              <Sparkles className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
              Search registered owner, manage pets & history, and assign visit appointment
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Reception Desk Intake</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8 flex-1">
          {/* Step 1: Search Registered Owner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-orange-500" />
              <span>Search Registered Mobile Number *</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={mobileNumber}
                onChange={handleMobileInput}
                maxLength="10"
                placeholder="Enter 10-digit registered mobile number (e.g. 9876543210)"
                className={`flex-1 border rounded-xl p-3.5 focus:ring-2 transition outline-none text-slate-700 font-semibold bg-white shadow-xs ${
                  errors.mobileNumber
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"
                }`}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="bg-slate-900 hover:bg-black text-white px-7 py-3.5 rounded-xl font-bold transition cursor-pointer disabled:opacity-60 shrink-0 flex items-center justify-center gap-2 border-none shadow-md"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Customer</span>
                  </>
                )}
              </button>
            </div>
            <ErrorText errors={errors} name="mobileNumber" />
          </div>

          {/* Customer & Visit Management Form */}
          {owner && (
            <form onSubmit={handleSubmitVisit} className="space-y-8 animate-in fade-in duration-300">
              {/* Owner Details Card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Owner Verification</h3>
                      <p className="text-xs text-slate-400 font-medium">Owner ID: {owner._id}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveOwner}
                    disabled={savingOwner}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition cursor-pointer border-none text-xs flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-sm"
                  >
                    {savingOwner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Owner Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Name *</label>
                    <input name="ownerName" value={ownerForm.ownerName || ""} onChange={handleOwnerChange} className={inputCls} />
                    <ErrorText errors={errors} name="ownerName" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner ID Type *</label>
                    <select name="ownerIdType" value={ownerForm.ownerIdType || "Aadhaar Card"} onChange={handleOwnerChange} className={inputCls}>
                      <option>Aadhaar Card</option>
                      <option>PAN Card</option>
                    </select>

                    <div className="mt-2.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {(ownerForm.ownerIdType || "Aadhaar Card") === "PAN Card" ? "PAN Card Number *" : "Aadhaar Card Number *"}
                      </label>
                      <input
                        name="ownerIdNumber"
                        value={ownerForm.ownerIdNumber || ""}
                        onChange={handleOwnerChange}
                        placeholder={(ownerForm.ownerIdType || "Aadhaar Card") === "PAN Card" ? "e.g. ABCDE1234F" : "e.g. 123456789012"}
                        className={inputCls}
                      />
                      <ErrorText errors={errors} name="ownerIdNumber" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Visit Type *</label>
                    <select name="visitType" value={ownerForm.visitType || "New"} onChange={handleOwnerChange} className={inputCls}>
                      <option value="New">New</option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input name="email" value={ownerForm.email || ""} onChange={handleOwnerChange} type="email" className={inputCls} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Address *</label>
                    <textarea name="address" value={ownerForm.address || ""} onChange={handleOwnerChange} rows="2" className={inputCls} />
                    <ErrorText errors={errors} name="address" />
                  </div>

                  {/* Pincode Field with Verification */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Pincode *</span>
                      {pincodeLoading && <span className="text-[11px] text-orange-500 font-semibold flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Verifying...</span>}
                      {pincodeValid === true && <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>}
                      {pincodeValid === false && <span className="text-[11px] text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Invalid</span>}
                    </label>
                    <div className="relative">
                      <input name="pincode" value={ownerForm.pincode || ""} onChange={handleOwnerChange} maxLength="6" placeholder="6 Digit PIN Code" className={inputCls} />
                    </div>
                    {pincodeDetails && pincodeValid === true && (
                      <p className="mt-1 text-xs text-emerald-700 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" /> {pincodeDetails}
                      </p>
                    )}
                    <ErrorText errors={errors} name="pincode" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">State *</label>
                    <select name="state" value={ownerForm.state || ""} onChange={handleOwnerChange} className={inputCls}>
                      <option value="">Select State</option>
                      {states.map((item) => (
                        <option key={item.isoCode} value={item.isoCode}>{item.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">District *</label>
                    <select name="district" value={ownerForm.district || ""} onChange={handleOwnerChange} disabled={!ownerForm.state} className={inputCls}>
                      <option value="">Select District</option>
                      {cities.map((item) => (
                        <option key={`${item.name}-${item.latitude || "0"}`} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                    <ErrorText errors={errors} name="district" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={ownerForm.city || ""}
                      onChange={handleOwnerChange}
                      placeholder="Enter City Name"
                      className={inputCls}
                    />
                    <ErrorText errors={errors} name="city" />
                  </div>
                </div>
              </div>

              {/* Pet Selection & Add New Pet Modal Trigger Card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      <PawPrint className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Pet Selection</h3>
                      <p className="text-xs text-slate-400 font-medium">Select pet for this visit or register a new pet</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddPetModal}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition cursor-pointer border-none text-xs flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Pet</span>
                  </button>
                </div>

                {/* Select Pet Dropdown */}
                {pets.length > 0 ? (
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Select Patient Pet *</label>
                    <select
                      value={visitForm.petId}
                      onChange={(e) => setVisitForm((prev) => ({ ...prev, petId: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-700 font-bold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none bg-white cursor-pointer"
                    >
                      <option value="">Select Pet</option>
                      {pets.map((pet) => (
                        <option key={pet._id} value={pet._id}>
                          {pet.petName || pet.name || "Unnamed Pet"} ({pet.species || "Pet"}) - Unique Pet ID: {pet.uniquePetId || pet.petId || `PET-${pet._id?.slice(-6)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-4 bg-orange-50/60 border border-orange-200/60 rounded-2xl text-center">
                    <p className="text-sm text-orange-700 font-bold">No pets registered under this owner yet.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddPetModal}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Click here to add a new pet
                    </button>
                  </div>
                )}
              </div>

              {/* Visit Details Card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Visit Appointment Details</h3>
                    <p className="text-xs text-slate-400 font-medium">Assign doctor, date, and visit reason</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Primary Reason *</label>
                    <select name="primaryReason" value={visitForm.primaryReason} onChange={handleVisitChange} className={inputCls}>
                      <option value="">Select Reason</option>
                      {reasonOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assigned Doctor *</label>
                    <select name="assignedDoctor" value={visitForm.assignedDoctor} onChange={handleVisitChange} className={inputCls}>
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={getDoctorOptionValue(doctor)} value={getDoctorName(doctor)}>
                          {getDoctorName(doctor) || "Doctor"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Appointment Date *</label>
                    <input name="appointmentDate" value={visitForm.appointmentDate} onChange={handleVisitChange} type="date" className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Appointment Time *</label>
                    <input name="appointmentTime" value={visitForm.appointmentTime} onChange={handleVisitChange} type="time" className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Visit Category</label>
                    <select name="visitType" value={visitForm.visitType} onChange={handleVisitChange} className={inputCls}>
                      <option value="CONSULTATION">Consultation</option>
                      <option value="VACCINATION">Vaccination</option>
                      <option value="GROOMING">Grooming</option>
                      <option value="SURGERY">Surgery</option>
                      <option value="KENNEL">Kennel</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
                    <select name="priority" value={visitForm.priority} onChange={handleVisitChange} className={inputCls}>
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Chief Complaint / Notes *</label>
                    <textarea name="chiefComplaint" value={visitForm.chiefComplaint} onChange={handleVisitChange} rows="3" placeholder="Enter chief complaint details" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Submit Final Visit Button */}
              <button
                type="submit"
                disabled={savingVisit}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-4 font-bold text-white transition shadow-lg shadow-orange-100 cursor-pointer border-none text-base disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingVisit ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Visit...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Create & Schedule Visit</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ADD NEW PET MODAL OVERLAY */}
      {isAddPetModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto flex items-center justify-center">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
                  <PawPrint className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Register New Pet & History</h2>
                  <p className="text-xs text-slate-300">Adding new pet for {owner?.ownerName || "Owner"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPetModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 flex gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setModalTab("registration")}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer border-t-0 border-x-0 ${
                  modalTab === "registration"
                    ? "border-orange-500 text-orange-600 bg-white shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <PawPrint className="w-4 h-4" />
                <span>1. Pet Registration</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("history")}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer border-t-0 border-x-0 ${
                  modalTab === "history"
                    ? "border-orange-500 text-orange-600 bg-white shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>2. Pet History</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("visit")}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer border-t-0 border-x-0 ${
                  modalTab === "visit"
                    ? "border-orange-500 text-orange-600 bg-white shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>3. Reason For Visit</span>
              </button>
            </div>

            {/* Modal Body */}
            <div ref={formScrollRef} className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">
              {/* TAB 1: PET REGISTRATION */}
              {modalTab === "registration" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pet Name *</label>
                    <input name="petName" value={petForm.petName} onChange={handlePetChange} placeholder="Enter Pet Name" className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Species *</label>
                    <select name="species" value={petForm.species} onChange={handlePetChange} className={inputCls}>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Bird">Bird</option>
                      <option value="Other">Other</option>
                    </select>
                    {petForm.species === "Other" && (
                      <div className="mt-2">
                        <input
                          name="otherSpecies"
                          value={petForm.otherSpecies || ""}
                          onChange={handlePetChange}
                          placeholder="Enter Custom Species"
                          className={inputCls}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Breed *</label>
                    <input name="breed" value={petForm.breed} onChange={handlePetChange} placeholder="Breed" className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender *</label>
                    <select name="gender" value={petForm.gender} onChange={handlePetChange} className={inputCls}>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>

                  {["dob", "age", "color", "rfid"].map((name) => (
                    <div key={name}>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        {name === "dob"
                          ? "Date Of Birth"
                          : name === "rfid"
                          ? "RFID / Microchip Tag No"
                          : name.charAt(0).toUpperCase() + name.slice(1)}
                      </label>
                      <input
                        name={name}
                        value={petForm[name]}
                        onChange={handlePetChange}
                        type={name === "dob" ? "date" : name === "age" ? "number" : "text"}
                        max={name === "dob" ? today : undefined}
                        placeholder={name === "rfid" ? "RFID Number" : undefined}
                        className={inputCls}
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Identification Area</label>
                    <textarea name="identificationArea" value={petForm.identificationArea} onChange={handlePetChange} rows="2" placeholder="Enter Identification Marks" className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pet Photo</label>
                    <input name="petPhoto" onChange={handlePetChange} type="file" accept="image/*" className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Is Sterilized?</label>
                    <select name="sterilized" value={petForm.sterilized} onChange={handlePetChange} className={inputCls}>
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Unique Pet ID</span>
                      <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Auto Generated</span>
                    </label>
                    <input
                      name="uniquePetId"
                      readOnly
                      value={petForm.uniquePetId || "PET-101"}
                      className="w-full border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-100 text-slate-700 font-mono font-bold text-xs outline-none cursor-not-allowed select-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PET HISTORY */}
              {modalTab === "history" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {[
                    ["vaccineName", "Vaccine Name", "text"],
                    ["vaccinationDate", "Vaccination Date", "date"],
                    ["batchNumber", "Batch Number", "text"],
                    ["clinicName", "Clinic Name", "text"],
                    ["dewormingProduct", "Deworming Product", "text"],
                    ["dewormingDate", "Deworming Date", "date"],
                    ["dose", "Dose", "text"],
                    ["surgicalProcedure", "Surgical Procedure", "text"],
                    ["surgeryDate", "Surgery Date", "date"],
                    ["hospital", "Hospital", "text"],
                    ["condition", "Condition", "text"],
                    ["treatment", "Treatment", "text"],
                    ["treatmentDate", "Treatment Date", "date"],
                  ].map(([name, label, type]) => (
                    <div key={name}>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                      <input name={name} value={petForm[name] || ""} onChange={handlePetChange} type={type} placeholder={type === "text" ? label : undefined} className={inputCls} />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Known Allergies</label>
                    <textarea name="allergies" value={petForm.allergies || ""} onChange={handlePetChange} rows="2" placeholder="Known Allergies" className={inputCls} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Medications</label>
                    <textarea name="medications" value={petForm.medications || ""} onChange={handlePetChange} rows="2" placeholder="Current Medications" className={inputCls} />
                  </div>
                </div>
              )}

              {/* TAB 3: REASON FOR VISIT */}
              {modalTab === "visit" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Primary Reason</label>
                    <select name="primaryReason" value={petForm.primaryReason || ""} onChange={handlePetChange} className={inputCls}>
                      <option value="">Select Reason</option>
                      {reasonOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Token / Queue Number</label>
                    <input
                      value="Auto-assigned on check-in"
                      readOnly
                      disabled
                      className="w-full border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-100 text-slate-500 font-mono font-bold text-xs outline-none cursor-not-allowed"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Specific Complaint In Brief</label>
                    <textarea name="complaint" value={petForm.complaint || ""} onChange={handlePetChange} rows="3" placeholder="Enter complaint details" className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Appointment Date</label>
                    <input name="appointmentDate" value={petForm.appointmentDate || ""} onChange={handlePetChange} type="date" className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Appointment Time</label>
                    <input name="appointmentTime" value={petForm.appointmentTime || ""} onChange={handlePetChange} type="time" className={inputCls} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assigned Doctor</label>
                    <select name="assignedDoctor" value={petForm.assignedDoctor || ""} onChange={handlePetChange} className={inputCls}>
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={getDoctorOptionValue(doctor)} value={getDoctorName(doctor)}>
                          {getDoctorName(doctor) || "Doctor"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddPetModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveNewPetModal}
                disabled={savingPet}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer border-none flex items-center gap-2"
              >
                {savingPet ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Add Pet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
