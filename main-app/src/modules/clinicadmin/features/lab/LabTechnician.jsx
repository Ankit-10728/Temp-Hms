import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  Beaker,
  Clock3,
  Eye,
  FileText,
  Pencil,
  Trash2,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Loader from "../../../../shared/components/Loader";
import { showToast } from "../../../../shared/components/toast";
import { getLabTechnicianStaff } from "../../api/staffApi";
import {
  createLabTechnician,
  deleteLabTechnician,
  getLabTechnicians,
  updateLabTechnician,
  verifyLabTechnician,
} from "../../api/labTechnicianApi";

const TEST_OPTIONS = [
  "Haematology",
  "Biochemistry",
  "Microbiology",
  "Cytology",
  "Histopathology",
  "Radiology",
  "PCR",
];

const SHIFT_OPTIONS = [
  { label: "Morning", value: "Morning" },
  { label: "Afternoon", value: "Afternoon" },
  { label: "Evening", value: "Evening" },
  { label: "24h", value: "24 Hours" },
];

const inputCls =
  "w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#1A1D2E] outline-none focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 transition-all bg-white placeholder-gray-300";
const inputErrCls =
  "w-full border border-red-400 rounded-xl px-4 py-3 text-sm text-[#1A1D2E] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all bg-white";
const labelCls = "block text-xs font-semibold text-[#6B7280] mb-2 tracking-wide";
const cardCls = "bg-white border border-[#F3F4F6] rounded-2xl p-5 sm:p-8 shadow-sm";

const getBackendOrigin = () => {
  try {
    return new URL(import.meta.env.VITE_BACKEND_URL).origin;
  } catch {
    return "http://localhost:5000";
  }
};

const resolveFileUrl = (url = "") => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${getBackendOrigin()}${url.startsWith("/") ? url : `/${url}`}`;
};

const normalizeLabTechnician = (item = {}) => ({
  ...item,
  employeeId: item.employeeId || "",
  qualification: item.qualification || item.diploma || "",
  diploma: item.diploma || "",
  experience: item.experience ?? "",
  specializedTests: item.specializedTests || [],
  shift: item.shift || "",
  status: item.status || "Active",
  certificateUrl: resolveFileUrl(item.certificate?.url || item.certificateUrl || ""),
});

function LabTechnicianForm({ existingData, existingEmployeeIds = [], isEdit, isSubmitting, onClose, onSave }) {
  const [labStaff, setLabStaff] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    employeeId: existingData?.employeeId || "",
    qualification: existingData?.qualification || "",
    diploma: existingData?.diploma || "",
    experience: existingData?.experience || "",
    specializedTests: existingData?.specializedTests || [],
    shift: existingData?.shift || "",
    status: existingData?.status || "Active",
    certificate: null,
  });

  useEffect(() => {
    const fetchLabStaff = async () => {
      try {
        const staff = await getLabTechnicianStaff();
        setLabStaff(staff);
      } catch (error) {
        console.error(error);
        showToast({
          type: "error",
          title: "Staff Load Failed",
          description: "Unable to load lab technician staff.",
        });
      }
    };

    fetchLabStaff();
  }, []);

  const availableLabStaff = useMemo(() => {
    const existingIds = new Set(existingEmployeeIds);

    return labStaff.filter((staff) => {
      const staffId = staff.employmentInfo?.staffId || "";
      return isEdit || !existingIds.has(staffId);
    });
  }, [existingEmployeeIds, isEdit, labStaff]);

  const update = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.employeeId.trim()) {
      nextErrors.employeeId = "Select a lab technician staff member";
    }

    if (!formData.qualification.trim()) {
      nextErrors.qualification = "Qualification / diploma is required";
    }

    if (formData.experience === "" || Number(formData.experience) < 0) {
      nextErrors.experience = "Enter valid years of lab experience";
    }

    if (!formData.shift) {
      nextErrors.shift = "Select lab shift";
    }

    if (!formData.specializedTests.length) {
      nextErrors.specializedTests = "Select at least one specialised test";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCertificateChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast({
        type: "error",
        title: "Invalid File",
        description: "Please upload certificate as PDF only.",
      });
      event.target.value = "";
      return;
    }

    update("certificate", file);
  };

  const toggleTest = (test) => {
    update(
      "specializedTests",
      formData.specializedTests.includes(test)
        ? formData.specializedTests.filter((item) => item !== test)
        : [...formData.specializedTests, test]
    );
  };

  const allTestsSelected = TEST_OPTIONS.every((test) => formData.specializedTests.includes(test));
  const someTestsSelected = TEST_OPTIONS.some((test) => formData.specializedTests.includes(test));

  const toggleAllTests = () => {
    update("specializedTests", allTestsSelected ? [] : [...TEST_OPTIONS]);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#1A1D2E]/80 p-3 sm:p-5 backdrop-blur-sm">
      <div className="flex h-[min(88vh,900px)] w-full max-w-[1200px] flex-col overflow-hidden rounded-3xl border border-[#EAE5DC] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#F3F4F6] px-5 py-5 sm:px-8">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E8630A]/10 px-3 py-1 text-[11px] font-bold text-[#E8630A]">
              <Beaker size={13} />
              Lab Technician Details
            </div>
            <h2 className="text-2xl font-bold text-[#1A1D2E]">
              {isEdit ? "Edit Lab Technician" : "Add Lab Technician"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Capture lab qualifications, certificate, test capability, and shift.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid size-10 place-items-center rounded-xl bg-gray-100 text-gray-500 transition hover:bg-gray-200"
            aria-label="Close form"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#FAFAFA] p-5 sm:p-8">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <section className={cardCls}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-[#E8630A]/10 text-[#E8630A]">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A1D2E]">Lab Qualifications</h3>
                    <p className="text-xs text-gray-500">Required details for lab technician profile</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelCls}>
                      Lab Technician <span className="text-[#E8630A]">*</span>
                    </label>
                    <select
                      value={formData.employeeId}
                      onChange={(event) => update("employeeId", event.target.value)}
                      className={errors.employeeId ? inputErrCls : inputCls}
                      disabled={isEdit}
                    >
                      <option value="">Select Lab Technician</option>
                      {availableLabStaff.map((staff) => {
                        const staffId = staff.employmentInfo?.staffId || "";
                        const name = staff.personalInfo?.fullName || "Lab Technician";
                        const mobile = staff.personalInfo?.mobileNumber || "";
                        return (
                          <option key={staff._id || staffId} value={staffId}>
                            {staffId} | {name}{mobile ? ` | ${mobile}` : ""}
                          </option>
                        );
                      })}
                      {isEdit && formData.employeeId && !availableLabStaff.some((staff) => staff.employmentInfo?.staffId === formData.employeeId) && (
                        <option value={formData.employeeId}>{formData.employeeId}</option>
                      )}
                    </select>
                    {!isEdit && labStaff.length > 0 && availableLabStaff.length === 0 && (
                      <p className="mt-1 text-xs font-medium text-[#E8630A]">
                        All lab technician staff already have details records.
                      </p>
                    )}
                    {errors.employeeId && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.employeeId}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>
                      Qualification / Diploma <span className="text-[#E8630A]">*</span>
                    </label>
                    <input
                      value={formData.qualification}
                      onChange={(event) => update("qualification", event.target.value)}
                      placeholder="e.g. B.Sc. MLT, Diploma in Lab Technology"
                      className={errors.qualification ? inputErrCls : inputCls}
                    />
                    {errors.qualification && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.qualification}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Certificate PDF</label>
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-[#E8630A] bg-white px-4 py-3 text-sm font-semibold text-[#E8630A] transition hover:bg-[#FEF3EB]">
                      <span className="flex items-center gap-2">
                        <Upload size={16} />
                        {formData.certificate?.name || "Upload certificate PDF"}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">PDF only</span>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={handleCertificateChange}
                      />
                    </label>
                    {existingData?.certificateUrl && !formData.certificate && (
                      <a
                        href={existingData.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0C3D2E] hover:text-[#E8630A]"
                      >
                        <FileText size={14} />
                        View existing certificate
                      </a>
                    )}
                  </div>

                  <div>
                    <label className={labelCls}>
                      Years of Lab Experience <span className="text-[#E8630A]">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(event) => update("experience", event.target.value)}
                      placeholder="e.g. 5"
                      className={errors.experience ? inputErrCls : inputCls}
                    />
                    {errors.experience && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.experience}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelCls}>
                      Lab Shift <span className="text-[#E8630A]">*</span>
                    </label>
                    <select
                      value={formData.shift}
                      onChange={(event) => update("shift", event.target.value)}
                      className={errors.shift ? inputErrCls : inputCls}
                    >
                      <option value="">Select Shift</option>
                      {SHIFT_OPTIONS.map((shift) => (
                        <option key={shift.value} value={shift.value}>
                          {shift.label}
                        </option>
                      ))}
                    </select>
                    {errors.shift && <p className="mt-1 text-xs font-medium text-red-500">{errors.shift}</p>}
                  </div>
                </div>
              </section>

              <section className={cardCls}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-[#0C3D2E]/10 text-[#0C3D2E]">
                      <BadgeCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1D2E]">Specialised Tests Handled</h3>
                      <p className="text-xs text-gray-500">Select all test areas the technician can handle</p>
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#E8630A] select-none">
                    <input
                      type="checkbox"
                      checked={allTestsSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someTestsSelected && !allTestsSelected;
                      }}
                      onChange={toggleAllTests}
                      className="size-4 accent-[#E8630A]"
                    />
                    Select All
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {TEST_OPTIONS.map((test) => {
                    const checked = formData.specializedTests.includes(test);
                    return (
                      <label
                        key={test}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          checked
                            ? "border-[#E8630A] bg-[#E8630A]/10 text-[#E8630A]"
                            : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#E8630A]/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTest(test)}
                          className="size-4 accent-[#E8630A]"
                        />
                        {test}
                      </label>
                    );
                  })}
                </div>
                {errors.specializedTests && (
                  <p className="mt-2 text-xs font-medium text-red-500">{errors.specializedTests}</p>
                )}
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-[#F3F4F6] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#E8630A]/10 p-3">
                <Award size={20} className="text-[#E8630A]" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">Primary Qualification</p>
                  <p className="mt-1 font-bold text-[#1A1D2E]">
                    {formData.qualification || "Not entered"}
                  </p>
                </div>
              </div>
              <h3 className="text-sm font-bold text-[#1A1D2E] mt-5 mb-3">Profile Summary</h3>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <span className="block font-semibold text-gray-400">Experience</span>
                    <span className="mt-1 block font-bold text-[#1A1D2E]">
                      {formData.experience || "0"} yrs
                    </span>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <span className="block font-semibold text-gray-400">Shift</span>
                    <span className="mt-1 block font-bold text-[#E8630A]">
                      {formData.shift || "Pending"}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="block font-semibold text-gray-400">Tests</span>
                  <span className="mt-1 block font-bold text-[#1A1D2E]">
                    {formData.specializedTests.length} selected
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#F3F4F6] bg-white px-5 py-4 sm:flex-row sm:px-8">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-semibold text-[#1A1D2E] transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-[#E8630A] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#d05a09] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update Lab Details" : "Save Lab Details"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LabTechnicianDetails({ technician, onClose, onEdit, onChanged }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApprove = async () => {
    if (!window.confirm("Approve this lab technician?")) return;
    try {
      setIsUpdating(true);
      await verifyLabTechnician(technician._id);
      showToast({
        type: "success",
        title: "Lab Technician Approved",
        description: "The technician is now verified and active.",
      });
      await onChanged?.();
    } catch (error) {
      showToast({
        type: "error",
        title: "Approval Failed",
        description: error?.response?.data?.message || "Unable to approve this technician.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = technician.status === "Active" ? "Inactive" : "Active";
    try {
      setIsUpdating(true);
      await updateLabTechnician(technician._id, { ...technician, status: nextStatus });
      showToast({
        type: "success",
        title: "Status Updated",
        description: `Lab technician is now ${nextStatus}.`,
      });
      await onChanged?.();
    } catch (error) {
      showToast({
        type: "error",
        title: "Update Failed",
        description: error?.response?.data?.message || "Unable to update status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#1A1D2E]/80 p-3 sm:p-5 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[#EAE5DC] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#F3F4F6] px-6 py-5">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#0C3D2E]/10 px-3 py-1 text-[11px] font-bold text-[#0C3D2E]">
              <Beaker size={13} />
              Lab Profile
            </div>
            <h2 className="text-2xl font-bold text-[#1A1D2E]">{technician.name || "Unnamed Technician"}</h2>
            <p className="mt-1 text-xs text-gray-500">{technician.qualification}{technician.employeeId ? ` · ${technician.employeeId}` : ""}</p>
          </div>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-xl bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {!technician.isVerified && (
            <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-yellow-600" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Pending Verification</p>
                <p className="text-xs text-yellow-800 mt-1">Admin approval required to activate this technician</p>
              </div>
            </div>
          )}
          {technician.isVerified && (
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <CheckCircle size={20} className="mt-0.5 flex-shrink-0 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-900">Verified & Activated</p>
                <p className="text-xs text-green-800 mt-1">This technician is approved and active</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InfoCard label="Experience" value={`${technician.experience || 0} years`} />
            <InfoCard label="Shift" value={technician.shift || "N/A"} />
            <InfoCard label="Status" value={technician.status || "Active"} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-400">SPECIALISED TESTS</p>
            <div className="flex flex-wrap gap-2">
              {technician.specializedTests?.map((test) => (
                <span key={test} className="rounded-lg bg-[#E8630A]/10 px-3 py-1.5 text-xs font-bold text-[#E8630A]">
                  {test}
                </span>
              ))}
            </div>
          </div>
          {technician.certificateUrl && (
            <a
              href={technician.certificateUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-bold text-[#0C3D2E] hover:text-[#E8630A]"
            >
              <FileText size={16} />
              View Certificate
            </a>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[#F3F4F6] px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold">
            Close
          </button>
          {!technician.isVerified && (
            <>
              <button
                onClick={() => onEdit(technician)}
                className="rounded-xl bg-orange-50 border border-[#E8630A] px-5 py-2.5 text-sm font-semibold text-[#E8630A] hover:bg-orange-100 transition"
              >
                Edit Details
              </button>
              <button
                onClick={handleApprove}
                disabled={isUpdating}
                className="rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition"
              >
                {isUpdating ? "Approving..." : "Approve"}
              </button>
            </>
          )}
          {technician.isVerified && (
            <>
              <button
                onClick={() => onEdit(technician)}
                className="rounded-xl bg-[#E8630A] hover:bg-[#d05a09] px-5 py-2.5 text-sm font-semibold text-white transition"
              >
                Edit Details
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={isUpdating}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed ${
                  technician.status === "Active"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isUpdating
                  ? "Updating..."
                  : technician.status === "Active"
                  ? "Set Inactive"
                  : "Set Active"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#1A1D2E]">{value}</p>
    </div>
  );
}

export default function LabTechnician() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planAccessDenied, setPlanAccessDenied] = useState(false);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setPlanAccessDenied(false);
      const response = await getLabTechnicians();
      setTechnicians((response.data || []).map(normalizeLabTechnician));
    } catch (error) {
      console.error(error);

      if (error?.response?.data?.code === "MODULE_NOT_ENABLED") {
        setPlanAccessDenied(true);
        setTechnicians([]);
        return;
      }

      showToast({
        type: "error",
        title: "Load Failed",
        description: "Unable to load lab technician details.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const filteredTechnicians = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return technicians.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.name,
          item.employeeId,
          item.qualification,
          item.shift,
          item.status,
          ...(item.specializedTests || []),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, technicians]);

  const closeModal = () => setModal(null);

  const handleSave = async (formData) => {
    try {
      setIsSubmitting(true);

      if (modal?.type === "edit") {
        await updateLabTechnician(modal.technician._id, formData);
        showToast({
          type: "success",
          title: "Lab Details Updated",
          description: "Lab technician details have been updated successfully.",
        });
      } else {
        await createLabTechnician(formData);
        showToast({
          type: "success",
          title: "Lab Details Created",
          description: "Lab technician details have been saved successfully.",
        });
      }

      await fetchTechnicians();
      closeModal();
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Save Failed",
        description: error?.response?.data?.message || "Unable to save lab technician details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (technician) => {
    if (!window.confirm("Delete this lab technician detail record?")) return;

    try {
      await deleteLabTechnician(technician._id);
      showToast({
        type: "success",
        title: "Lab Details Deleted",
        description: "Lab technician details have been deleted.",
      });
      await fetchTechnicians();
      closeModal();
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Delete Failed",
        description: error?.response?.data?.message || "Unable to delete lab technician details.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-0 sm:p-4 lg:p-6">
      {(modal?.type === "add" || modal?.type === "edit") && (
        <LabTechnicianForm
          existingData={modal.technician}
          existingEmployeeIds={technicians.map((technician) => technician.employeeId).filter(Boolean)}
          isEdit={modal.type === "edit"}
          isSubmitting={isSubmitting}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {modal?.type === "view" && (
        <LabTechnicianDetails
          technician={modal.technician}
          onClose={closeModal}
          onEdit={(technician) => setModal({ type: "edit", technician })}
          onChanged={async () => {
            await fetchTechnicians();
            closeModal();
          }}
        />
      )}

      <div
        className="rounded-2xl p-5 sm:p-6 mb-6 border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
        style={{ backgroundColor: "#EAF7F0", borderColor: "#CFEEDB" }}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#16261E" }}>
            <Beaker size={20} color="#fff" />
          </div>
          <div>
            <h2 className="font-['Syne'] text-2xl font-bold text-[#1A1D2E]">Lab Technician Details</h2>
            <p className="text-gray-500 text-sm mt-1">Manage lab qualifications, certificates & lab shifts</p>
          </div>
        </div>
        <button
          onClick={() => setModal({ type: "add" })}
          disabled={planAccessDenied}
          className="bg-[#E8630A] hover:bg-[#D05A09] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-3 rounded-xl cursor-pointer border-none transition-colors shrink-0"
        >
          + Add Lab Details
        </button>
      </div>

      {planAccessDenied ? (
        <div className="bg-white border border-[#EAE5DC] rounded-2xl overflow-hidden shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-5">
              <Beaker className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1D2E]">
              Lab Module Not Included In Your Plan
            </h3>
            <p className="mt-3 text-sm text-gray-500 max-w-md text-center leading-7">
              Your clinic's current subscription plan doesn't include the Lab module.
              Contact the super admin to upgrade your plan to manage lab technicians.
            </p>
          </div>
        </div>
      ) : (
      <>
      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl shadow-sm p-5 sm:p-6 mb-10">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#6B7280] mb-2 tracking-wide">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by staff ID, qualification, shift or test..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full h-12 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#1A1D2E] placeholder:text-gray-400 outline-none transition-all focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20"
              />
            </div>

            <div className="w-full md:w-56">
              <label className="block text-xs font-semibold text-[#6B7280] mb-2 tracking-wide">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full h-12 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#1A1D2E] outline-none transition-all focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Probation">Probation</option>
              </select>
            </div>
          </div>

          <div className="flex items-center self-end">
            <div className="border rounded-xl px-3 py-2 w-[150px] h-[60px] flex flex-col justify-center" style={{ backgroundColor: "#EAF7F0", borderColor: "#CFEEDB" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Total Lab Techs
              </p>

              <h3 className="mt-0.5 text-xl font-bold text-[#E8630A] leading-none">
                {filteredTechnicians.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#EAE5DC] rounded-2xl overflow-hidden shadow-sm">
        {technicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-[#E8630A]/10 flex items-center justify-center mb-5">
              <Beaker className="w-10 h-10 text-[#E8630A]" />
            </div>

            <h3 className="text-2xl font-bold text-[#1A1D2E]">
              No Lab Technicians Added Yet
            </h3>

            <p className="mt-3 text-sm text-gray-500 max-w-md text-center leading-7">
              Your clinic doesn't have any lab technician details yet.
              Start by adding the first technician's professional profile.
            </p>
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#E8630A]/10 flex items-center justify-center mb-4">
              <Beaker className="w-8 h-8 text-[#E8630A]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1D2E]">No matching records</h3>
            <p className="mt-2 text-sm text-gray-500">Try changing the search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#FAFAFA] border-b border-[#EAE5DC]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500">
                    Lab Technician
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500">
                    Experience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500">
                    Shift
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500">
                    Specialised Tests
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500">
                    Verification
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTechnicians.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-[#F3F4F6] hover:bg-[#FCFCFC] transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-bold"
                          style={{
                            background: "#E8630A20",
                            border: "2px solid #E8630A40",
                            color: "#E8630A",
                          }}
                        >
                          <Beaker size={20} />
                        </div>

                        <div>
                          <div className="font-semibold text-[#1A1D2E]">
                            {item.name || item.employeeId || "Unnamed"}
                          </div>

                          <div className="text-xs text-gray-400">
                            {item.qualification}{item.employeeId ? ` · ${item.employeeId}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-gray-700">
                      {item.experience} yrs
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#E8630A]">
                        <Clock3 size={14} />
                        {item.shift}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex max-w-md flex-wrap gap-1.5">
                        {item.specializedTests?.slice(0, 3).map((test) => (
                          <span
                            key={test}
                            className="rounded-lg bg-[#E8630A]/10 px-2.5 py-1 text-[11px] font-semibold text-[#E8630A]"
                          >
                            {test}
                          </span>
                        ))}
                        {item.specializedTests?.length > 3 && (
                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                            +{item.specializedTests.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#E6F6EC", color: "#1E9E5A" }}>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      {item.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle size={14} />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                          <AlertCircle size={14} />
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => setModal({ type: "view", technician: item })}
                          className="w-9 h-9 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center cursor-pointer"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => setModal({ type: "edit", technician: item })}
                          className="w-9 h-9 rounded-lg border border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100 transition flex items-center justify-center cursor-pointer"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="w-9 h-9 rounded-lg border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
