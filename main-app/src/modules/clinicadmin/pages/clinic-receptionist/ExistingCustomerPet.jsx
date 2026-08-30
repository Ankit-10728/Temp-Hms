import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePet, getExistingCustomers, updateOwner, updatePet } from "../../api/receptionApi";
import {
  Search,
  UserCheck,
  Eye,
  Edit2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  X,
  PlusCircle,
  FileText,
  User,
  PawPrint,
  Clock,
  Shield,
  Tag,
  Hash,
  CheckCircle2,
  Filter,
  RefreshCw,
  Printer,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";

export default function ExistingCustomerPet() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("ALL");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [viewCustomer, setViewCustomer] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("pet"); // "pet" | "owner" | "visits"
  
  const [editCustomer, setEditCustomer] = useState(null);
  const [editForm, setEditForm] = useState({
    ownerName: "",
    mobileNumber: "",
    email: "",
    petName: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
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
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCustomers = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await getExistingCustomers();
      const data = response?.data?.data ?? response?.data ?? response ?? [];
      setCustomers(Array.isArray(data) ? data : []);
      if (isManualRefresh) toast.success("Customer records updated");
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
      toast.error("Failed to load customer records");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeletePet = async (item) => {
    const ownerId = item?.owner?._id;
    const petId = item?.pet?._id;
    if (!ownerId || !petId) return toast.error("Pet record could not be identified");
    if (!window.confirm("Delete this pet record? This cannot be undone.")) return;
    try {
      await deletePet(ownerId, petId);
      toast.success("Pet record deleted");
      fetchCustomers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete pet record");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getSpeciesEmoji = (speciesStr) => {
    const s = (speciesStr || "").toLowerCase();
    if (s.includes("cat") || s.includes("feline")) return "🐱";
    if (s.includes("bird") || s.includes("parrot") || s.includes("avian")) return "🦜";
    if (s.includes("rabbit") || s.includes("bunny")) return "🐇";
    if (s.includes("fish")) return "🐠";
    return "🐶";
  };

  const getPetHistoryDetails = (pet) => {
    if (!pet)
      return {
        vaccinations: [],
        dewormings: [],
        surgeries: [],
        treatments: [],
        allergies: "",
        currentMedications: "",
        notes: "",
        weightTracker: [],
      };

    const history = pet.history || {};

    // Extract Vaccinations
    let vaccinations = Array.isArray(history.vaccinations)
      ? [...history.vaccinations]
      : [];
    if (
      vaccinations.length === 0 &&
      (history.vaccineName || pet.vaccineName)
    ) {
      vaccinations.push({
        vaccineName: history.vaccineName || pet.vaccineName,
        vaccinationDate: history.vaccinationDate || pet.vaccinationDate,
        batchNumber: history.batchNumber || pet.batchNumber,
        clinicName: history.clinicName || pet.clinicName,
      });
    }

    // Extract Dewormings
    let dewormings = Array.isArray(history.dewormings)
      ? [...history.dewormings]
      : [];
    if (
      dewormings.length === 0 &&
      (history.dewormingProduct || pet.dewormingProduct || history.product)
    ) {
      dewormings.push({
        product:
          history.dewormingProduct || pet.dewormingProduct || history.product,
        dewormingDate:
          history.dewormingDate || pet.dewormingDate || history.date,
        dose: history.dose || pet.dose,
      });
    }

    // Extract Surgeries
    let surgeries = Array.isArray(history.surgeries)
      ? [...history.surgeries]
      : [];
    if (
      surgeries.length === 0 &&
      (history.surgicalProcedure ||
        pet.surgicalProcedure ||
        history.procedure)
    ) {
      surgeries.push({
        procedure:
          history.surgicalProcedure ||
          pet.surgicalProcedure ||
          history.procedure,
        surgeryDate: history.surgeryDate || pet.surgeryDate || history.date,
        hospital: history.hospital || pet.hospital,
      });
    }

    // Extract Treatments
    let treatments = Array.isArray(history.treatments)
      ? [...history.treatments]
      : [];
    if (
      treatments.length === 0 &&
      (history.condition || pet.condition || history.treatment)
    ) {
      treatments.push({
        condition: history.condition || pet.condition,
        treatment: history.treatment || pet.treatment || history.details,
        treatmentDate:
          history.treatmentDate || pet.treatmentDate || history.date,
      });
    }

    // Extract Allergies
    const allergies =
      history.allergies ||
      pet.allergies ||
      (Array.isArray(pet.allergies) ? pet.allergies.join(", ") : "");

    // Extract Current Medications
    const currentMedications =
      history.currentMedications ||
      pet.currentMedications ||
      history.medications ||
      pet.medications ||
      "";

    // Extract General Notes
    const notes =
      typeof history === "string"
        ? history
        : history.notes || pet.notes || "";

    // Weight tracker
    const weightTracker = Array.isArray(pet.weightTracker)
      ? pet.weightTracker
      : [];

    return {
      vaccinations,
      dewormings,
      surgeries,
      treatments,
      allergies,
      currentMedications,
      notes,
      weightTracker,
    };
  };

  const filteredCustomers = customers.filter((item) => {
    const query = search.toLowerCase().trim();
    const ownerName = item.owner?.ownerName?.toLowerCase() || "";
    const petName = (item.pet?.petName || item.pet?.name || "").toLowerCase();
    const petId = item.pet?.uniquePetId?.toLowerCase() || "";
    const mobile = item.owner?.mobileNumber?.toLowerCase() || "";
    const species = (item.pet?.species || "").toUpperCase();

    const matchesSearch =
      !query ||
      ownerName.includes(query) ||
      petName.includes(query) ||
      petId.includes(query) ||
      mobile.includes(query);

    const matchesSpecies =
      selectedSpecies === "ALL" || species.includes(selectedSpecies);

    return matchesSearch && matchesSpecies;
  });

  const getDisplayAge = (pet) => {
    if (!pet) return null;

    // 1. Direct pet.age check (handle 0, numbers, strings)
    if (pet.age !== undefined && pet.age !== null && String(pet.age).trim() !== "") {
      const ageStr = String(pet.age).trim();
      if (
        ageStr.toLowerCase().includes("yr") ||
        ageStr.toLowerCase().includes("month") ||
        ageStr.toLowerCase().includes("year") ||
        ageStr.toLowerCase().includes("mo")
      ) {
        return ageStr;
      }
      return `${ageStr} yrs`;
    }

    // 2. Compute from DOB if age is not explicitly set
    if (pet.dob) {
      const birthDate = new Date(pet.dob);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        if (today.getDate() < birthDate.getDate()) {
          months -= 1;
        }
        if (months < 0) {
          years -= 1;
          months += 12;
        }

        if (years > 0) {
          return `${years} yr${years > 1 ? "s" : ""}${months > 0 ? ` ${months} mo` : ""}`;
        } else if (months > 0) {
          return `${months} month${months > 1 ? "s" : ""}`;
        } else {
          return "Newborn (< 1 mo)";
        }
      }
    }

    return null;
  };

  const handleOpenEdit = (item) => {
    navigate("/clinic/reception/new-registration", { state: { editCustomer: item } });
    return;

    setEditCustomer(item);
    const pet = item.pet || {};
    const owner = item.owner || {};
    const history = pet.history || {};

    setEditForm({
      ownerName: owner.ownerName || "",
      mobileNumber: owner.mobileNumber || "",
      alternateNumber: owner.alternateNumber || owner.phoneNumber || "",
      email: owner.email || "",
      ownerIdType: owner.ownerIdType || "Aadhaar Card",
      ownerIdNumber: owner.ownerIdNumber || "",
      address: owner.address || "",
      state: owner.state || "",
      city: owner.city || "",
      district: owner.district || "",
      pincode: owner.pincode || "",
      petName: pet.petName || pet.name || "",
      species: getDisplaySpecies(pet) || "Dog",
      breed: pet.breed || "",
      gender: pet.gender || "Male",
      age: pet.age !== undefined && pet.age !== null && String(pet.age).trim() !== "" ? String(pet.age) : (getDisplayAge(pet) || ""),
      dob: pet.dob ? new Date(pet.dob).toISOString().split("T")[0] : "",
      color: pet.color || "",
      sterilized: pet.sterilized || pet.isSterilised || pet.spayed ? "Yes" : "No",
      rfid: pet.rfid || pet.rfidTag || pet.microchipNumber || "",
      identificationArea: pet.identificationArea || "",
      identificationMarks: pet.identificationMarks || "",
      allergies:
      history.allergies ||
      (Array.isArray(pet.allergies)
        ? pet.allergies.join(", ")
        : pet.allergies || ""),
      currentMedications: history.currentMedications || history.medications || pet.currentMedications || "",
      notes: history.notes || pet.notes || "",
      vaccineName: history.vaccineName || pet.vaccineName || "",
      vaccinationDate: history.vaccinationDate || pet.vaccinationDate ? new Date(history.vaccinationDate || pet.vaccinationDate).toISOString().slice(0, 10) : "",
      batchNumber: history.batchNumber || pet.batchNumber || "",
      clinicName: history.clinicName || pet.clinicName || "",
      dewormingProduct: history.dewormingProduct || pet.dewormingProduct || "",
      dewormingDate: history.dewormingDate || pet.dewormingDate ? new Date(history.dewormingDate || pet.dewormingDate).toISOString().slice(0, 10) : "",
      dose: history.dose || pet.dose || "",
      surgicalProcedure: history.surgicalProcedure || pet.surgicalProcedure || "",
      surgeryDate: history.surgeryDate || pet.surgeryDate ? new Date(history.surgeryDate || pet.surgeryDate).toISOString().slice(0, 10) : "",
      hospital: history.hospital || pet.hospital || "",
      condition: history.condition || pet.condition || "",
      treatment: history.treatment || pet.treatment || "",
      treatmentDate: history.treatmentDate || pet.treatmentDate ? new Date(history.treatmentDate || pet.treatmentDate).toISOString().slice(0, 10) : "",
    });
  };

  // Mirrors the pincode auto-fill in New Registration: typing a PIN code
  // resolves and fills City/District/State from the postal API, instead of
  // leaving them as plain unvalidated free text.
  const handlePincodeChange = async (rawValue) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 6);
    setEditForm((prev) => ({ ...prev, pincode: digits }));
    if (digits.length !== 6) return;

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${digits}`);
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const poList = data[0].PostOffice;
        const po = poList.find((office) => office.BranchType === "Head Post Office") || poList[0];
        const district = po.District || po.Block || po.Circle || po.Division || "";
        const city = po.Block || po.Name || district || "";
        const state = po.State || "";
        setEditForm((prev) => ({ ...prev, city, district, state }));
      }
    } catch (err) {
      console.error("PIN code lookup failed:", err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editCustomer) return;
    if (!editForm.ownerName.trim()) {
        toast.error("Owner name is required");
        return;
    }

    if (/\d/.test(editForm.ownerName)) {
        toast.error("Owner name cannot contain numbers");
        return;
    }

    if (!/^[6-9]\d{9}$/.test(editForm.mobileNumber)) {
        toast.error("Enter a valid mobile number");
        return;
    }

    if (
        editForm.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)
    ) {
        toast.error("Invalid email address");
        return;
    }

    if (
        editForm.pincode &&
        !/^\d{6}$/.test(editForm.pincode)
    ) {
        toast.error("Invalid pincode");
        return;
    }

    if (!editForm.petName.trim()) {
        toast.error("Pet name is required");
        return;
    }

    if (/\d/.test(editForm.petName)) {
        toast.error("Pet name cannot contain numbers");
        return;
    }

    if (!editForm.species) {
        toast.error("Species is required");
        return;
    }

    if (!editForm.breed.trim()) {
        toast.error("Breed is required");
        return;
    }

    if (!editForm.gender) {
        toast.error("Gender is required");
        return;
    }

    if (editForm.dob && new Date(editForm.dob) > new Date()) {
        toast.error("DOB cannot be in the future");
        return;
    }

    if (editForm.age !== "" && isNaN(Number(editForm.age))) {
      toast.error("Age must be a valid number");
      return;
    }

    try {
      setSavingEdit(true);
      const ownerId = editCustomer.owner?._id;
      const petId = editCustomer.pet?._id;

      if (ownerId) {
        await updateOwner(ownerId, {
          ownerName: editForm.ownerName,
          mobileNumber: editForm.mobileNumber,
          alternateNumber: editForm.alternateNumber,
          email: editForm.email,
          ownerIdType: editForm.ownerIdType,
          ownerIdNumber: editForm.ownerIdNumber,
          address: editForm.address,
          state: editForm.state,
          city: editForm.city,
          district: editForm.district,
          pincode: editForm.pincode,
        });
      }

      if (ownerId && petId) {
        await updatePet(ownerId, petId, {
          petName: editForm.petName,
          name: editForm.petName,
          species: editForm.species,
          breed: editForm.breed,
          gender: editForm.gender,
          age:
          editForm.age === ""
          ? null
          : Number(editForm.age),
          dob: editForm.dob,
          color: editForm.color,
          sterilized: editForm.sterilized === "Yes" || editForm.sterilized === true,
          rfid: editForm.rfid,
          rfidTag: editForm.rfid,
          identificationArea: editForm.identificationArea,
          identificationMarks: editForm.identificationMarks,
          history: {
            allergies: editForm.allergies,
            currentMedications: editForm.currentMedications,
            medications: editForm.currentMedications,
            notes: editForm.notes,
            vaccineName: editForm.vaccineName,
            vaccinationDate: editForm.vaccinationDate,
            batchNumber: editForm.batchNumber,
            clinicName: editForm.clinicName,
            dewormingProduct: editForm.dewormingProduct,
            dewormingDate: editForm.dewormingDate,
            dose: editForm.dose,
            surgicalProcedure: editForm.surgicalProcedure,
            surgeryDate: editForm.surgeryDate,
            hospital: editForm.hospital,
            condition: editForm.condition,
            treatment: editForm.treatment,
            treatmentDate: editForm.treatmentDate,
          },
        });
      }

      toast.success("Record updated successfully!");
      setEditCustomer(null);
      await fetchCustomers();
    } catch (err) {
      console.error("Error saving customer edit:", err);
      toast.error("Failed to update record");
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePrintCustomer = (item) => {
    try {
      const pet = item?.pet || {};
      const owner = item?.owner || {};
      const history = getPetHistoryDetails(pet);
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      const clinicName = localStorage.getItem("clinicName") || "PetVitals Veterinary Clinic";
      const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN") : "Not provided";
      const safe = (value) => value === undefined || value === null || String(value).trim() === "" ? "Not provided" : String(value);
      let y = 18;

      const drawHeader = () => {
        doc.setFillColor(6, 61, 49);
        doc.rect(0, 0, pageWidth, 30, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(17);
        doc.text(clinicName, margin, 13);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Patient Record & Reception Report", margin, 20);
        doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, margin, 25);
        y = 40;
      };

      const drawFooter = () => {
        doc.setDrawColor(220, 231, 227);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Confidential veterinary patient record", margin, pageHeight - 7);
        doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - margin, pageHeight - 7, { align: "right" });
      };

      const nextPage = () => {
        drawFooter();
        doc.addPage();
        drawHeader();
      };

      const ensure = (height) => {
        if (y + height > pageHeight - 18) nextPage();
      };

      const section = (title) => {
        ensure(12);
        doc.setFillColor(234, 245, 242);
        doc.roundedRect(margin, y, contentWidth, 8, 2, 2, "F");
        doc.setTextColor(6, 61, 49);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(title.toUpperCase(), margin + 4, y + 5.3);
        y += 13;
      };

      const field = (label, value) => {
        const lines = doc.splitTextToSize(safe(value), contentWidth - 48);
        const height = Math.max(8, lines.length * 4.5 + 3);
        ensure(height);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text(label, margin, y + 4);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(lines, margin + 45, y + 4);
        y += height;
      };

      const list = (title, rows, mapRow) => {
        section(`${title} (${rows.length})`);
        if (!rows.length) {
          field("Record", "No records available");
          return;
        }
        rows.forEach((row, index) => field(`${index + 1}.`, mapRow(row)));
      };

      drawHeader();
      section("Patient Summary");
      field("Pet name", pet.petName || pet.name);
      field("Patient ID", pet.uniquePetId || pet._id);
      field("Species / Breed", `${safe(pet.species)} / ${safe(pet.breed)}`);
      field("Gender / Age", `${safe(pet.gender)} / ${safe(getDisplayAge(pet))}`);
      field("Date of birth", formatDate(pet.dob));
      field("Registration", formatDate(pet.createdAt));

      section("Owner & Contact");
      field("Owner name", owner.ownerName);
      field("Primary phone", owner.mobileNumber);
      field("Alternate phone", owner.alternateNumber || owner.phoneNumber);
      field("Email", owner.email);
      field("Address", [owner.address, owner.city, owner.district, owner.state, owner.pincode].filter(Boolean).join(", "));

      section("Clinical Notes");
      field("Known allergies", history.allergies || "None reported");
      field("Current medications", history.currentMedications || "None currently prescribed");
      field("General notes", history.notes || "No notes recorded");

      list("Vaccination History", history.vaccinations, (row) =>
        `${safe(row.vaccineName || row.name)} | ${formatDate(row.vaccinationDate || row.date)} | Batch: ${safe(row.batchNumber)} | Clinic: ${safe(row.clinicName)}`
      );
      list("Deworming History", history.dewormings, (row) =>
        `${safe(row.product || row.dewormingProduct)} | ${formatDate(row.dewormingDate || row.date)} | Dose: ${safe(row.dose)}`
      );
      list("Surgical History", history.surgeries, (row) =>
        `${safe(row.procedure || row.surgicalProcedure)} | ${formatDate(row.surgeryDate || row.date)} | ${safe(row.hospital)}`
      );
      list("Past Treatments", history.treatments, (row) =>
        `${safe(row.condition)} | ${safe(row.treatment || row.details)} | ${formatDate(row.treatmentDate || row.date)}`
      );

      section(`Visit History (${pet.visits?.length || 0})`);
      if (!pet.visits?.length) {
        field("Visit record", "No past visits recorded");
      } else {
        pet.visits.forEach((visit, index) => field(`${index + 1}. ${safe(visit.tokenNumber)}`, `${formatDate(visit.appointmentDate)} | ${safe(visit.status)} | ${safe(visit.primaryReason || visit.visitType || "General Checkup")} | Doctor: ${safe(visit.doctorName || "Duty Doctor")}`));
      }

      drawFooter();
      const petName = (pet.petName || pet.name || "Pet").replace(/[^a-z0-9_-]/gi, "_");
      doc.save(`Patient_Record_${petName}_${pet.uniquePetId || "report"}.pdf`);
      toast.success("Patient PDF report downloaded");
    } catch (error) {
      console.error("Unable to generate patient PDF:", error);
      toast.error("Could not generate the PDF report");
    }
  };

  const renderVal = (val, defaultVal = null) => {
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val);
    }
    return defaultVal || <span className="text-slate-400 font-medium italic text-xs">Not Provided</span>;
  };

  const getDisplaySpecies = (pet = {}) => {
    const species = String(pet.species || "");
    return species.toUpperCase() === "OTHER" ? pet.otherSpecies || species : species;
  };

  const getDisplayOwnerIdType = (owner = {}) =>
    owner.ownerIdType === "Other Government ID" && owner.ownerOtherIdType
      ? owner.ownerOtherIdType : owner.ownerIdType;

  return (
    <div className="space-y-6">
      {/* HERO HEADER SECTION (EXACT STYLE GUIDE) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] bg-[#D9E8E3]/25 p-[20px] md:p-[24px] rounded-[16px] border border-[#0C3D2E]/15 shadow-sm transition-all duration-200">
        <div className="flex items-center gap-[16px]">
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#0C3D2E] text-white flex items-center justify-center shrink-0">
            <UserCheck className="w-[22px] h-[22px]" />
          </div>
          <div>
            <h1 className="text-[20px] md:text-[24px] font-[900] tracking-tight text-[#0C3D2E]">
              Existing Customer Records
            </h1>
            <p className="text-[12px] md:text-[14px] font-[600] text-[#0C3D2E]/70 mt-[2px]">
              Search registered pet owners, inspect complete medical & profile fields, and initiate new clinical visits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[12px] w-full md:w-auto">
          <button
            onClick={() => fetchCustomers(true)}
            disabled={refreshing}
            className="w-full md:w-auto flex items-center justify-center gap-[8px] bg-white hover:bg-slate-50 text-[#0C3D2E] border border-[#0C3D2E]/15 px-[20px] py-[10px] rounded-[12px] text-[12px] font-[700] shadow-sm transition-all duration-200 hover:-translate-y-[2px] cursor-pointer"
          >
            <RefreshCw className={`w-[16px] h-[16px] text-[#F7931E] ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh Records</span>
          </button>

          <button
            onClick={() => navigate("/clinic/reception/new-registration")}
            className="w-full md:w-auto flex items-center justify-center gap-[8px] bg-[#F7931E] hover:bg-[#E08319] text-white px-[20px] py-[10px] rounded-[12px] text-[12px] font-[700] shadow-sm transition-all duration-200 hover:-translate-y-[2px] cursor-pointer border-none"
          >
            <PlusCircle className="w-[16px] h-[16px]" />
            <span>New Patient Intake</span>
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="rounded-3xl border border-[#D9ECE7] bg-white shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-5 md:p-6 border-b border-[#D9ECE7] bg-[#F4F9F7] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#063D31]/60" />
            <input
              type="text"
              placeholder="Search by Owner Name, Pet Name, Pet ID, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border border-[#C5E4DC] rounded-2xl text-xs md:text-sm outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all font-semibold text-slate-800 shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Species Pills & Count Badge */}
          <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#C5E4DC]">
              {["ALL", "DOG", "CAT", "BIRD"].map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSelectedSpecies(sp)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSpecies === sp
                      ? "bg-[#063D31] text-white shadow-xs"
                      : "text-slate-600 hover:bg-[#EAF4F2]"
                  }`}
                >
                  {sp === "ALL" ? "All Species" : sp === "DOG" ? "Dogs 🐶" : sp === "CAT" ? "Cats 🐱" : "Birds 🦜"}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-[#063D31] bg-[#EAF5F2] border border-[#C5E4DC] px-3.5 py-2 rounded-xl">
              Showing <span className="text-[#F97316] font-black">{filteredCustomers.length}</span> of {customers.length}
            </span>
          </div>
        </div>

        {/* Content View */}
        <div className="p-5 md:p-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-[#F97316] mb-3" />
              <p className="text-sm font-semibold">Loading customer registry records...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-20 text-center bg-[#F4F9F7] rounded-2xl border border-dashed border-[#C5E4DC]">
              <div className="text-4xl mb-3">🐾</div>
              <h3 className="font-bold text-[#063D31] text-base">No Customer Records Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No matching owners or pets were found for your search filters. Try adjusting your query or register a new patient.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredCustomers.map((item, idx) => {
                  const pet = item.pet || {};
                  const owner = item.owner || {};
                  const petName = pet.petName || pet.name || "Unnamed Pet";
                  const ownerName = owner.ownerName || "Unknown Owner";
                  const species = getDisplaySpecies(pet) || "Dog";
                  const petId = pet.uniquePetId || `PET-${(pet._id || "").slice(-4)}`;

                  return (
                    <div
                      key={pet._id || idx}
                      className="rounded-2xl border border-[#D9ECE7] bg-white p-5 shadow-xs space-y-4 hover:border-[#F97316] transition-all"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-[#EAF4F2] pb-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-black text-[#063D31] text-base flex items-center gap-2">
                              {petName}
                            </h3>
                            <span className="text-[11px] font-mono font-bold text-[#F97316] bg-[#FFF4E5] border border-[#FDE3C3] px-2 py-0.5 rounded-md inline-block mt-0.5">
                              {petId}
                            </span>
                          </div>
                        </div>

                        <span className="bg-[#EAF5F2] text-[#063D31] text-xs px-3 py-1 rounded-full font-bold">
                          {species}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#F4F9F7] border border-[#D9ECE7]">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Owner Name</span>
                          <span className="font-bold text-[#063D31] truncate block mt-0.5">{ownerName}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#F4F9F7] border border-[#D9ECE7]">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mobile</span>
                          <span className="font-bold text-[#063D31] truncate block mt-0.5">{owner.mobileNumber || "N/A"}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#F4F9F7] border border-[#D9ECE7]">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Breed</span>
                          <span className="font-bold text-[#063D31] truncate block mt-0.5">{pet.breed || "N/A"}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#F4F9F7] border border-[#D9ECE7]">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gender / Age</span>
                          <span className="font-bold text-[#063D31] truncate block mt-0.5">{pet.gender || "N/A"} • {getDisplayAge(pet) || "N/A"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAF4F2]">
                        <button
                          onClick={() => {
                            setViewCustomer(item);
                            setActiveModalTab("pet");
                          }}
                          className="rounded-xl bg-[#0C3D2E] py-2.5 text-white transition hover:bg-[#073126]"
                          title="View details"
                        >
                          <Eye className="mx-auto w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenEdit(item)} className="rounded-xl bg-[#F7931E] py-2.5 text-white transition hover:bg-[#E08319]" title="Edit record"><Edit2 className="mx-auto w-4 h-4" /></button>
                        <button onClick={() => handleDeletePet(item)} className="rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-rose-600 transition hover:bg-rose-100" title="Delete pet"><Trash2 className="mx-auto w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9ECE7] text-[#063D31] text-xs font-black uppercase tracking-wider bg-[#F4F9F7]">
                      <th className="text-left py-4 px-4">Pet ID</th>
                      <th className="text-left py-4 px-4">Patient (Pet)</th>
                      <th className="text-left py-4 px-4">Owner Name</th>
                      <th className="text-left py-4 px-4">Species / Breed</th>
                      <th className="text-left py-4 px-4">Contact Phone</th>
                      <th className="text-left py-4 px-4">Gender & Age</th>
                      <th className="text-right py-4 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF4F2] text-slate-700 text-xs md:text-sm font-medium">
                    {filteredCustomers.map((item, idx) => {
                      const pet = item.pet || {};
                      const owner = item.owner || {};
                      const petName = pet.petName || pet.name || "Unnamed Pet";
                      const ownerName = owner.ownerName || "Unknown Owner";
                      const species = getDisplaySpecies(pet) || "Dog";
                      const petId = pet.uniquePetId || `PET-${(pet._id || "").slice(-4)}`;

                      return (
                        <tr
                          key={pet._id || idx}
                          className="hover:bg-[#EAF4F2]/50 transition-colors group"
                        >
                          <td className="py-4 px-4">
                            <span className="font-mono font-bold text-[#F97316] bg-[#FFF4E5] border border-[#FDE3C3] px-2.5 py-1 rounded-lg">
                              {petId}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div>
                              <p className="font-bold text-[#063D31]">{petName}</p>
                              <p className="text-xs text-slate-400">Reg: {pet.createdAt ? pet.createdAt.split("T")[0] : "Active"}</p>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-bold text-[#063D31]">
                            {ownerName}
                          </td>

                          <td className="py-4 px-4">
                            <span className="inline-block font-bold text-[#063D31]">{species}</span>
                            {pet.breed && <span className="block text-xs text-slate-400">{pet.breed}</span>}
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-mono text-slate-700 font-bold">{owner.mobileNumber || "N/A"}</span>
                          </td>

                          <td className="py-4 px-4 text-slate-600">
                            <span className="font-semibold text-slate-800">{pet.gender || "N/A"}</span>
                            {getDisplayAge(pet) && <span className="text-xs text-slate-400 block">{getDisplayAge(pet)}</span>}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setViewCustomer(item);
                                  setActiveModalTab("pet");
                                }}
                                className="grid size-9 place-items-center rounded-lg border border-[#0C3D2E]/15 bg-white text-[#0C3D2E] transition hover:bg-[#D9E8E3]/40"
                                title="View details"
                              >
                                <Eye className="size-4" />
                              </button>
                              <button onClick={() => handleOpenEdit(item)} className="grid size-9 place-items-center rounded-lg bg-[#F7931E] text-white transition hover:bg-[#E08319]" title="Edit record"><Edit2 className="size-4" /></button>
                              <button onClick={() => handleDeletePet(item)} className="grid size-9 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100" title="Delete pet"><Trash2 className="size-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* 1. COMPREHENSIVE VIEW CUSTOMER MODAL (ALL FIELDS) */}
      {/* ========================================= */}
      {viewCustomer && (() => {
        const historyData = getPetHistoryDetails(viewCustomer.pet);
        const pet = viewCustomer.pet || {};
        const owner = viewCustomer.owner || {};

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-[1100] p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 md:p-6 text-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-3xl shrink-0">
                    {getSpeciesEmoji(pet.species)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-extrabold text-white">
                        {pet.petName || pet.name || "Pet Details"}
                      </h2>
                      <span className="bg-orange-500 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md">
                        {pet.uniquePetId || "N/A"}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs md:text-sm mt-1 font-medium flex items-center gap-2">
                      <span>Owner: <strong className="text-white">{owner.ownerName || "Unknown"}</strong></span>
                      <span>• Phone: <strong className="text-white">{owner.mobileNumber || "N/A"}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintCustomer(viewCustomer)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl text-xs transition cursor-pointer border border-slate-700 flex items-center gap-1.5 font-bold"
                    title="Download Patient PDF"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </button>
                  <button
                    onClick={() => setViewCustomer(null)}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Nav Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveModalTab("pet")}
                  className={`px-5 py-3 font-bold text-xs md:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeModalTab === "pet"
                      ? "bg-white text-orange-600 border-orange-500 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 border-transparent"
                  }`}
                >
                  <PawPrint className="w-4 h-4" />
                  <span>Pet Profile</span>
                </button>

                <button
                  onClick={() => setActiveModalTab("history")}
                  className={`px-5 py-3 font-bold text-xs md:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeModalTab === "history"
                      ? "bg-white text-orange-600 border-orange-500 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 border-transparent"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Medical & Pet History</span>
                </button>

                <button
                  onClick={() => setActiveModalTab("owner")}
                  className={`px-5 py-3 font-bold text-xs md:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeModalTab === "owner"
                      ? "bg-white text-orange-600 border-orange-500 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 border-transparent"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Owner & Address Info</span>
                </button>

                <button
                  onClick={() => setActiveModalTab("visits")}
                  className={`px-5 py-3 font-bold text-xs md:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeModalTab === "visits"
                      ? "bg-white text-orange-600 border-orange-500 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 border-transparent"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Visits History ({pet.visits?.length || 0})</span>
                </button>
              </div>

              {/* Tab Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* TAB 1: PET ALL PROFILE FIELDS */}
                {activeModalTab === "pet" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Unique Pet ID</span>
                        <span className="font-mono font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(pet.uniquePetId || pet._id)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Pet Name</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(pet.petName || pet.name)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Species</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(getDisplaySpecies(pet))}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Breed</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(pet.breed)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Gender</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(pet.gender)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Age</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(getDisplayAge(pet))}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Date of Birth (DOB)</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {pet.dob ? new Date(pet.dob).toLocaleDateString() : renderVal(null)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Color / Coat</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(pet.color)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Sterilized / Neutered</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {pet.sterilized !== undefined || pet.isSterilised !== undefined || pet.spayed !== undefined
                            ? (pet.sterilized || pet.isSterilised || pet.spayed ? "Yes" : "No")
                            : renderVal(null)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Microchip / RFID Tag</span>
                        <span className="font-mono font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(pet.rfid || pet.rfidTag || pet.microchipNumber)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Identification Area</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(pet.identificationArea)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Identification Marks</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(pet.identificationMarks)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Registration Date</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString() : renderVal(null)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Medical & History Summary Box */}
                    <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase text-orange-800 tracking-wider flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-orange-600" />
                          Pet Medical History Highlights
                        </h4>
                        <button
                          onClick={() => setActiveModalTab("history")}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer bg-transparent border-none"
                        >
                          View Full History →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Known Allergies</span>
                          <span className="font-bold text-slate-800 block mt-0.5">
                            {renderVal(historyData.allergies)}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Current Medications</span>
                          <span className="font-bold text-slate-800 block mt-0.5">
                            {renderVal(historyData.currentMedications)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs pt-1">
                        <span className="px-2.5 py-1 bg-white border border-orange-200 rounded-lg text-slate-700 font-bold">
                          💉 Vaccinations: <strong className="text-orange-600">{historyData.vaccinations.length}</strong>
                        </span>
                        <span className="px-2.5 py-1 bg-white border border-orange-200 rounded-lg text-slate-700 font-bold">
                          💊 Dewormings: <strong className="text-orange-600">{historyData.dewormings.length}</strong>
                        </span>
                        <span className="px-2.5 py-1 bg-white border border-orange-200 rounded-lg text-slate-700 font-bold">
                          ✂️ Surgeries: <strong className="text-orange-600">{historyData.surgeries.length}</strong>
                        </span>
                        <span className="px-2.5 py-1 bg-white border border-orange-200 rounded-lg text-slate-700 font-bold">
                          🏥 Treatments: <strong className="text-orange-600">{historyData.treatments.length}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: DETAILED PET MEDICAL HISTORY */}
                {activeModalTab === "history" && (
                  <div className="space-y-6 text-xs">
                    {/* 1. Vaccinations */}
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                        <span>💉</span> Vaccination History ({historyData.vaccinations.length})
                      </h3>
                      {historyData.vaccinations.length === 0 ? (
                        <p className="text-slate-400 italic bg-slate-50 p-3 rounded-xl">No vaccination records registered for this pet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border border-slate-200 rounded-xl overflow-hidden text-left">
                            <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-2.5">Vaccine Name</th>
                                <th className="p-2.5">Vaccination Date</th>
                                <th className="p-2.5">Batch Number</th>
                                <th className="p-2.5">Clinic Name</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                              {historyData.vaccinations.map((vac, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-bold">{renderVal(vac.vaccineName || vac.name)}</td>
                                  <td className="p-2.5">{vac.vaccinationDate || vac.date ? new Date(vac.vaccinationDate || vac.date).toLocaleDateString() : renderVal(null)}</td>
                                  <td className="p-2.5 font-mono">{renderVal(vac.batchNumber)}</td>
                                  <td className="p-2.5">{renderVal(vac.clinicName)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* 2. Dewormings */}
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                        <span>💊</span> Deworming History ({historyData.dewormings.length})
                      </h3>
                      {historyData.dewormings.length === 0 ? (
                        <p className="text-slate-400 italic bg-slate-50 p-3 rounded-xl">No deworming records registered for this pet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border border-slate-200 rounded-xl overflow-hidden text-left">
                            <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-2.5">Product Name</th>
                                <th className="p-2.5">Deworming Date</th>
                                <th className="p-2.5">Dose</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                              {historyData.dewormings.map((dew, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-bold">{renderVal(dew.product || dew.dewormingProduct)}</td>
                                  <td className="p-2.5">{dew.dewormingDate || dew.date ? new Date(dew.dewormingDate || dew.date).toLocaleDateString() : renderVal(null)}</td>
                                  <td className="p-2.5">{renderVal(dew.dose)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* 3. Surgeries */}
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                        <span>✂️</span> Surgical History ({historyData.surgeries.length})
                      </h3>
                      {historyData.surgeries.length === 0 ? (
                        <p className="text-slate-400 italic bg-slate-50 p-3 rounded-xl">No surgical history registered for this pet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border border-slate-200 rounded-xl overflow-hidden text-left">
                            <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-2.5">Surgical Procedure</th>
                                <th className="p-2.5">Surgery Date</th>
                                <th className="p-2.5">Hospital / Clinic</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                              {historyData.surgeries.map((surg, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-bold">{renderVal(surg.procedure || surg.surgicalProcedure)}</td>
                                  <td className="p-2.5">{surg.surgeryDate || surg.date ? new Date(surg.surgeryDate || surg.date).toLocaleDateString() : renderVal(null)}</td>
                                  <td className="p-2.5">{renderVal(surg.hospital)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* 4. Past Treatments */}
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                        <span>🏥</span> Past Medical Treatments & Conditions ({historyData.treatments.length})
                      </h3>
                      {historyData.treatments.length === 0 ? (
                        <p className="text-slate-400 italic bg-slate-50 p-3 rounded-xl">No past treatment history registered for this pet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border border-slate-200 rounded-xl overflow-hidden text-left">
                            <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-2.5">Medical Condition</th>
                                <th className="p-2.5">Treatment Provided</th>
                                <th className="p-2.5">Treatment Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                              {historyData.treatments.map((tr, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-bold text-red-600">{renderVal(tr.condition)}</td>
                                  <td className="p-2.5">{renderVal(tr.treatment || tr.details)}</td>
                                  <td className="p-2.5">{tr.treatmentDate || tr.date ? new Date(tr.treatmentDate || tr.date).toLocaleDateString() : renderVal(null)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* 5. Allergies & Ongoing Medications */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-1">
                        <span className="text-[10px] font-bold uppercase text-red-700 tracking-wider flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-red-600" />
                          Known Allergies
                        </span>
                        <p className="font-bold text-slate-800">
                          {renderVal(historyData.allergies, "None reported")}
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
                        <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          Current Medications
                        </span>
                        <p className="font-bold text-slate-800">
                          {renderVal(historyData.currentMedications, "None currently prescribed")}
                        </p>
                      </div>
                    </div>

                    {/* 6. Weight Tracker History */}
                    {historyData.weightTracker.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                          <span>⚖️</span> Weight Tracker History ({historyData.weightTracker.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {historyData.weightTracker.map((w, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                              <span className="font-bold text-slate-900">{w.weight} kg</span>
                              <span className="text-[10px] text-slate-400 block">{w.date ? new Date(w.date).toLocaleDateString() : ""}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 7. Clinical Notes */}
                    {historyData.notes && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                          General Clinical History Notes
                        </span>
                        <p className="text-slate-800 leading-relaxed font-medium">
                          {historyData.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: OWNER ALL FIELDS */}
                {activeModalTab === "owner" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Full Owner Name</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(owner.ownerName)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Primary Mobile Phone</span>
                        <span className="font-mono font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(owner.mobileNumber)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Alternate Number</span>
                        <span className="font-mono font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(owner.alternateNumber || owner.phoneNumber)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Email Address</span>
                        <span className="font-semibold text-slate-900 text-sm mt-1 block">
                          {renderVal(owner.email)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Owner ID Proof</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {renderVal(getDisplayOwnerIdType(owner), "Aadhaar / Govt ID")}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-600 mt-1 block">{renderVal(owner.ownerIdNumber, "Number not provided")}</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Registration Date</span>
                        <span className="font-bold text-slate-900 text-sm mt-1 block">
                          {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : renderVal(null)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        Complete Residential Address
                      </span>
                      <p className="text-sm font-semibold text-slate-800">
                        {renderVal(owner.address)}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                        <span>City: <strong>{renderVal(owner.city)}</strong></span>
                        <span>District: <strong>{renderVal(owner.district)}</strong></span>
                        <span>State: <strong>{renderVal(owner.state)}</strong></span>
                        <span>Pincode: <strong>{renderVal(owner.pincode)}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: VISITS & APPOINTMENT HISTORY */}
                {activeModalTab === "visits" && (
                  <div className="space-y-4">
                    {(!pet.visits || pet.visits.length === 0) ? (
                      <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-700">No Past Visits Recorded</p>
                        <p className="text-xs text-slate-400 mt-0.5">This patient has no recorded clinical visits yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pet.visits.map((v, i) => (
                          <div
                            key={v._id || i}
                            className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                                  {v.tokenNumber || `TK-${i + 1}`}
                                </span>
                                <span className="text-xs font-bold text-slate-800">
                                  {v.appointmentDate ? new Date(v.appointmentDate).toLocaleDateString() : "Date N/A"}
                                </span>
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                  {v.status || "Pending"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium mt-1">
                                Reason: <span className="italic text-slate-800">{v.primaryReason || v.visitType || "General Checkup"}</span>
                              </p>
                              {v.complaint && (
                                <p className="text-xs text-slate-500 italic">
                                  Complaint: {v.complaint}
                                </p>
                              )}
                            </div>

                            <div className="text-xs text-right self-end sm:self-center">
                              <span className="text-slate-400 block text-[11px]">Assigned Doctor</span>
                              <span className="font-bold text-slate-800">{v.assignedDoctor || v.doctorName || "Not assigned"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleOpenEdit(viewCustomer);
                      setViewCustomer(null);
                    }}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition cursor-pointer border-none flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Record</span>
                  </button>
                </div>

                <button
                  onClick={() => setViewCustomer(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer border-none"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================= */}
      {/* 2. EXPANDED EDIT CUSTOMER MODAL (ALL FIELDS) */}
      {/* ========================================= */}
      {editCustomer && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-[1100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-[#0C3D2E]/15 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="bg-[#D9E8E3]/35 border-b border-[#0C3D2E]/15 px-6 py-5">
              <div className="flex justify-between items-center gap-4">
              <div><h2 className="text-xl font-black text-[#0C3D2E] flex items-center gap-2"><Edit2 className="w-5 h-5 text-[#F7931E]" />Edit Patient Intake & Registration</h2><p className="mt-1 text-xs font-medium text-[#0C3D2E]/70">All saved owner, patient, and medical-history details are prefilled below.</p></div>
              <button
                onClick={() => setEditCustomer(null)}
                className="w-8 h-8 rounded-full hover:bg-white/70 flex items-center justify-center text-[#0C3D2E]/60 hover:text-[#0C3D2E] transition cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
              </div>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">{[["1", "Owner Details", User], ["2", "Pet Profile", PawPrint], ["3", "Medical History", FileText], ["4", "Review & Save", CheckCircle2]].map(([number, label, Icon]) => <div key={number} className="flex items-center gap-2 rounded-xl border border-[#0C3D2E]/10 bg-white/70 px-3 py-2 text-left"><span className="grid size-7 place-items-center rounded-lg bg-[#F7931E] text-xs font-black text-white">{number}</span><span><Icon className="size-3.5 text-[#0C3D2E]" /><span className="mt-0.5 block text-[10px] font-bold text-[#0C3D2E]">{label}</span></span></div>)}</div>
            </div>

            <div className="space-y-6 p-6 text-xs font-medium text-slate-700 overflow-y-auto pr-2 flex-1">
              {/* Owner Info Section */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-orange-600 border-b border-orange-100 pb-1">
                  1. Owner & Contact Information
                </h3>
                
                <div>
                  <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Owner Name</label>
                  <input
                    type="text"
                    value={editForm.ownerName}
                    onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Mobile Phone</label>
                    <input
                      type="text"
                      value={editForm.mobileNumber}
                      onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Alternate Phone</label>
                    <input
                      type="text"
                      value={editForm.alternateNumber}
                      onChange={(e) => setEditForm({ ...editForm, alternateNumber: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">ID Proof Type</label>
                    <input
                      type="text"
                      value={editForm.ownerIdType}
                      onChange={(e) => setEditForm({ ...editForm, ownerIdType: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Pincode</label>
                    <input
                      type="text"
                      value={editForm.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      maxLength="6"
                      placeholder="6 Digit PIN Code"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">ID Proof Number</label>
                    <input type="text" value={editForm.ownerIdNumber || ""} onChange={(e) => setEditForm({ ...editForm, ownerIdNumber: e.target.value })} className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">District</label>
                    <input
                      type="text"
                      value={editForm.district}
                      onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">State</label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pet Info Section */}
              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-orange-600 border-b border-orange-100 pb-1">
                  2. Pet Profile Information
                </h3>

                <div>
                  <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Pet Name</label>
                  <input
                    type="text"
                    value={editForm.petName}
                    onChange={(e) => setEditForm({ ...editForm, petName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Species</label>
                    <input
                      type="text"
                      value={editForm.species}
                      onChange={(e) => setEditForm({ ...editForm, species: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Breed</label>
                    <input
                      type="text"
                      value={editForm.breed}
                      onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Age (Years)</label>
                    <input
                      type="text"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Date of Birth (DOB)</label>
                    <input
                      type="date"
                      value={editForm.dob}
                      onChange={(e) => {
                      const dob = e.target.value;

                      let age = "";

                      if (dob) {
                          const birthDate = new Date(dob);
                          const today = new Date();

                          age = today.getFullYear() - birthDate.getFullYear();

                          const monthDiff = today.getMonth() - birthDate.getMonth();

                          if (
                              monthDiff < 0 ||
                              (monthDiff === 0 && today.getDate() < birthDate.getDate())
                          ) {
                              age--;
                          }

                          if (age < 0) age = "";
                      }

                      setEditForm((prev) => ({
                          ...prev,
                          dob,
                          age: age === "" ? "" : String(age),
                      }));
                  }}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Color / Coat</label>
                    <input
                      type="text"
                      value={editForm.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Sterilized / Neutered</label>
                    <select
                      value={editForm.sterilized}
                      onChange={(e) => setEditForm({ ...editForm, sterilized: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none bg-white"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">RFID / Microchip Tag</label>
                    <input
                      type="text"
                      value={editForm.rfid}
                      onChange={(e) => setEditForm({ ...editForm, rfid: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Identification Area</label>
                    <input
                      type="text"
                      value={editForm.identificationArea}
                      onChange={(e) => setEditForm({ ...editForm, identificationArea: e.target.value })}
                      placeholder="e.g. Left Ear / Collar"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Identification Marks</label>
                    <input
                      type="text"
                      value={editForm.identificationMarks}
                      onChange={(e) => setEditForm({ ...editForm, identificationMarks: e.target.value })}
                      placeholder="Physical marks, scars, notches..."
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Medical History & Notes Section */}
              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-orange-600 border-b border-orange-100 pb-1">
                  3. Medical History & Notes
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Known Allergies</label>
                    <input
                      type="text"
                      value={editForm.allergies}
                      onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                      placeholder="e.g. Dust, Penicillin"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Current Medications</label>
                    <input
                      type="text"
                      value={editForm.currentMedications}
                      onChange={(e) => setEditForm({ ...editForm, currentMedications: e.target.value })}
                      placeholder="Ongoing prescription / supplements"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-500 uppercase tracking-wider text-[10px]">General Clinical Notes</label>
                  <textarea
                    rows="2"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="General medical or behavioral notes..."
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none"
                  />
                </div>

                <div className="rounded-xl border border-[#D9ECE7] bg-[#F4F9F7] p-4 space-y-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#0C3D2E]">Registration medical history</p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <EditField label="Vaccine name" value={editForm.vaccineName} onChange={(value) => setEditForm({ ...editForm, vaccineName: value })} />
                    <EditField label="Vaccination date" type="date" value={editForm.vaccinationDate} onChange={(value) => setEditForm({ ...editForm, vaccinationDate: value })} />
                    <EditField label="Batch number" value={editForm.batchNumber} onChange={(value) => setEditForm({ ...editForm, batchNumber: value })} />
                    <EditField label="Clinic name" value={editForm.clinicName} onChange={(value) => setEditForm({ ...editForm, clinicName: value })} />
                    <EditField label="Deworming product" value={editForm.dewormingProduct} onChange={(value) => setEditForm({ ...editForm, dewormingProduct: value })} />
                    <EditField label="Deworming date" type="date" value={editForm.dewormingDate} onChange={(value) => setEditForm({ ...editForm, dewormingDate: value })} />
                    <EditField label="Dose" value={editForm.dose} onChange={(value) => setEditForm({ ...editForm, dose: value })} />
                    <EditField label="Surgical procedure" value={editForm.surgicalProcedure} onChange={(value) => setEditForm({ ...editForm, surgicalProcedure: value })} />
                    <EditField label="Surgery date" type="date" value={editForm.surgeryDate} onChange={(value) => setEditForm({ ...editForm, surgeryDate: value })} />
                    <EditField label="Hospital" value={editForm.hospital} onChange={(value) => setEditForm({ ...editForm, hospital: value })} />
                    <EditField label="Condition" value={editForm.condition} onChange={(value) => setEditForm({ ...editForm, condition: value })} />
                    <EditField label="Treatment" value={editForm.treatment} onChange={(value) => setEditForm({ ...editForm, treatment: value })} />
                    <EditField label="Treatment date" type="date" value={editForm.treatmentDate} onChange={(value) => setEditForm({ ...editForm, treatmentDate: value })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setEditCustomer(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer border-none flex items-center gap-2"
              >
                {savingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save All Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditField({ label, value, onChange, type = "text" }) {
  return <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span><input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-[#F7931E] focus:ring-2 focus:ring-orange-100" /></label>;
}
