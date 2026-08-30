import React, { useState, useEffect } from 'react';
import { showToast } from '../../../../shared/components/toast';
import ViewStaffModal from "./ViewStaffModal";
import { roles, departments, employmentTypes, staffData, MODULE_OPTIONS } from '../../data/staff';
import Loader from '../../../../shared/components/Loader';
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Plus, Users } from "lucide-react";
import {
  createStaff,
  updateStaff,
  deleteStaff,
  getManagers,
  getStaff,
  getStaffById,
  checkStaffContactAvailability,
} from '../../api/staffApi';
import {
  BANK_OPTIONS,
  getBankRule,
  formatAccountLength,
  getMaxAccountLength,
} from '../../../../shared/constants/bankAccountRules';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const upiRegex = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/;
const digitsOnly = (value, max = 10) => value.replace(/\D/g, "").slice(0, max);
const isFutureDate = (value) => value && new Date(value) > new Date();
const isImageFile = (file) => file?.type?.startsWith("image/");

// --- Multi-step Enrollment Form (Full-Screen Fixed Panel) ---
function EnrollForm({ onClose, onSave, editData, mode, staff, isSubmitting, }) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const isFutureDate = (value) => value && new Date(value) > new Date();
  
  const isLessThan15Years = (value) => {
    if (!value || value.length !== 10) return false;

    const dob = new Date(value);

    if (Number.isNaN(dob.getTime())) return false;

    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const monthDiff = today.getMonth() - dob.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    return age < 15;
  };
  
  const isPastOrToday = (value) => {
    if (!value) return false;

    const selected = new Date(value);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selected <= today;
  };

  const [step, setStep] = useState(1);
  const [managerOptions, setManagerOptions] = useState([]);
  const [contactErrors, setContactErrors] = useState({ email: '', mobileNumber: '' });
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    profilePhoto: null,
    email: '',
    mobileNumber: '',
    dateOfBirth: '',
    gender: '',

    emergencyContacts: [
      {
        contactPersonName: '',
        contactNumber: ''
      }
    ],

    role: '',
    roles: [],
    dateOfJoining: '',
    staffId: '',
    reportingTo: '',
    department: '',
    employmentType: '',
    accessLevel: '',

    modules: [],
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    upiId: "",
    username: '',

    accountExpiryDate: '',
    accountActive: true,
    forcePasswordReset: true
  });

  const [bankFieldErrors, setBankFieldErrors] = useState({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    upiId: "",
  });

  // Shared by the onBlur handlers below and the Next-button validateStep()
  // check, so both surfaces agree on exactly what "valid" means per field.
  const validateBankField = (field, formSnapshot = form) => {
    const bankRule = getBankRule(formSnapshot.bankName);

    if (field === "bankName") {
      return formSnapshot.bankName.trim() ? "" : "Please select a bank.";
    }

    if (field === "accountHolderName") {
      const name = formSnapshot.accountHolderName.trim();
      if (!name) return "Account holder name is required.";
      if (!/^[A-Za-z\s]+$/.test(name)) return "Account holder name must contain only letters and spaces.";
      if (name.length < 3) return "Account holder name must be at least 3 characters.";
      return "";
    }

    if (field === "accountNumber") {
      const accountNumber = formSnapshot.accountNumber.trim();
      if (!accountNumber) return "Account number is required.";
      if (bankRule?.accountLengths) {
        if (!bankRule.accountLengths.includes(accountNumber.length)) {
          return `Account number for ${formSnapshot.bankName} must be ${formatAccountLength(bankRule)}.`;
        }
      } else if (
        accountNumber.length < (bankRule?.minAccountLength || 9) ||
        accountNumber.length > (bankRule?.maxAccountLength || 18)
      ) {
        return `Account number must be ${formatAccountLength(bankRule)}.`;
      }
      return "";
    }

    if (field === "ifscCode") {
      const ifscCode = formSnapshot.ifscCode.trim().toUpperCase();
      if (!ifscCode) return "IFSC code is required.";
      if (!ifscRegex.test(ifscCode)) return "Please enter a valid IFSC code";
      if (bankRule?.ifscPrefix && !ifscCode.startsWith(bankRule.ifscPrefix)) {
        return `IFSC for ${formSnapshot.bankName} should start with ${bankRule.ifscPrefix}.`;
      }
      return "";
    }

    if (field === "branchName") {
      const branchName = formSnapshot.branchName.trim();
      if (branchName && branchName.length < 3) return "Branch name must be at least 3 characters.";
      return "";
    }

    if (field === "upiId") {
      const upiId = formSnapshot.upiId.trim();
      if (upiId && !upiRegex.test(upiId)) return "Please enter a valid UPI ID (e.g. name@bank)";
      return "";
    }

    return "";
  };

  const handleBankFieldBlur = (field) => {
    setBankFieldErrors(prev => ({ ...prev, [field]: validateBankField(field) }));
  };

  const hasVisibleBankErrors = step === 3 && Object.values(bankFieldErrors).some(Boolean);


  const validateStep = async () => {
    if (step === 1) {
      const emergencyNumber = form.emergencyContacts[0]?.contactNumber?.trim();

      if (
        !form.fullName.trim() ||
        !form.gender ||
        !form.dateOfBirth ||
        !form.mobileNumber.trim() ||
        !form.email.trim()
      ) {
        alert("Please fill all required fields in Personal Information");
        return false;
      }

      if (form.fullName.trim().length < 3) {
        alert("Full name must be at least 3 characters");
        return false;
      }

      if (!/^[A-Za-z\s]+$/.test(form.fullName.trim())) {
        alert("Full name must contain only alphabets and spaces");
        return false;
      }

      if (isFutureDate(form.dateOfBirth)) {
        alert("Date of birth cannot be a future date");
        return false;
      }

      if (isLessThan15Years(form.dateOfBirth)) {
        alert("Staff member must be at least 15 years old.");
        return false;
      }

      if (!phoneRegex.test(form.mobileNumber.trim())) {
        alert("Mobile number must be exactly 10 digits");
        return false;
      }

      if (!emailRegex.test(form.email.trim())) {
        alert("Please enter a valid email address");
        return false;
      }

      // Re-check availability right now rather than trusting the onBlur
      // result in state - clicking Next can fire before that async check
      // resolves, which previously let a duplicate slip through to the
      // final save instead of being caught here.
      setCheckingAvailability(true);
      const [emailError, mobileError] = await Promise.all([
        checkContact('email'),
        checkContact('mobileNumber'),
      ]);
      setCheckingAvailability(false);

      if (emailError || mobileError) {
        alert(emailError || mobileError);
        return false;
      }

      const emergencyName = form.emergencyContacts[0]?.contactPersonName?.trim();
      if (emergencyName && emergencyName.length < 3) {
        alert("Emergency contact person name must be at least 3 characters");
        return false;
      }

      if (emergencyNumber && !phoneRegex.test(emergencyNumber)) {
        alert("Emergency contact number must be exactly 10 digits");
        return false;
      }

      if (emergencyNumber && phoneRegex.test(emergencyNumber)) {
        // Same rule as the staff's own mobile number: must not already
        // belong to another clinic/staff/user record.
        if (
          emergencyNumber === form.mobileNumber.trim() &&
          !(isEdit && editData?.personalInfo?.mobileNumber?.trim() === emergencyNumber)
        ) {
          // Matches the staff member's own number being entered - already
          // covered by the mobileNumber check above, no separate lookup needed.
        } else if (
          isEdit &&
          editData?.personalInfo?.emergencyContacts?.[0]?.contactNumber?.trim() === emergencyNumber
        ) {
          // Unchanged from the saved record - no need to re-check.
        } else {
          setCheckingAvailability(true);
          const result = await checkStaffContactAvailability({ mobileNumber: emergencyNumber });
          setCheckingAvailability(false);
          if (!result.available) {
            alert(result.message || "This phone number is already being used.");
            return false;
          }
        }
      }
    }

    if (step === 2) {
      if (
        !form.role ||
        !form.staffId ||
        !form.dateOfJoining
      ) {
        alert("Please fill all required fields in Work & Access");
        return false;
      }
    }

    if (step === 3) {
      const nextErrors = Object.fromEntries(
        bankFieldKeys.map((field) => [field, validateBankField(field)])
      );
      setBankFieldErrors(nextErrors);
      if (Object.values(nextErrors).some(Boolean)) {
        return false;
      }
    }

    if (step === 4) {
      if (form.employmentType === 'Contract') {
        if (!form.accountExpiryDate) {
          alert("Please select account expiry date for contract staff");
          return false;
        }

        if (isPastOrToday(form.accountExpiryDate)) {
          alert("Account expiry date must be a future date.");
          return false;
        }
      }
    }

    return true;
  };


  useEffect(() => {
    if (editData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        fullName:
          editData.personalInfo?.fullName || "",

        profilePhoto:
          editData.personalInfo?.profilePhoto || null,

        email:
          editData.personalInfo?.email || "",

        mobileNumber:
          editData.personalInfo?.mobileNumber || "",

        dateOfBirth:
          editData.personalInfo?.dateOfBirth
            ? new Date(editData.personalInfo.dateOfBirth)
              .toISOString()
              .split("T")[0]
            : "",

        gender:
          editData.personalInfo?.gender || "",

        emergencyContacts:
          editData.personalInfo?.emergencyContacts?.length
            ? editData.personalInfo.emergencyContacts
            : [
              {
                contactPersonName: "",
                contactNumber: "",
              },
            ],

        role:
          editData.employmentInfo?.role || "",

        roles:
          editData.employmentInfo?.roles?.length
            ? editData.employmentInfo.roles
            : [editData.employmentInfo?.role].filter(Boolean),

        dateOfJoining:
          editData.employmentInfo?.dateOfJoining
            ? new Date(editData.employmentInfo.dateOfJoining)
              .toISOString()
              .split("T")[0]
            : "",

        staffId:
          editData.employmentInfo?.staffId || "",

        reportingTo:
          editData.employmentInfo?.reportingTo?._id ||
          editData.employmentInfo?.reportingTo ||
          "",

        department:
          editData.employmentInfo?.department || "",

        employmentType:
          editData.employmentInfo?.employmentType || "",

        accessLevel:
          editData.employmentInfo?.accessLevel || "",

        modules: Object.entries(
          editData.moduleAccess || {}
        )
          .filter(([_, value]) => value)
          .map(([key]) => key),
        bankName:
          editData.bankDetails?.bankName || "",

        accountHolderName:
          editData.bankDetails?.accountHolderName || "",

        accountNumber:
          editData.bankDetails?.accountNumber || "",

        ifscCode:
          editData.bankDetails?.ifscCode || "",

        branchName:
          editData.bankDetails?.branchName || "",

        upiId:
          editData.bankDetails?.upiId || "",
        username:
          editData.accountInfo?.username || "",

        accountExpiryDate:
          editData.accountInfo?.accountExpiryDate
            ? new Date(editData.accountInfo.accountExpiryDate)
              .toISOString()
              .split("T")[0]
            : "",

        accountActive:
          editData.accountInfo?.accountActive ?? true,

        forcePasswordReset:
          editData.accountInfo?.forcePasswordReset ?? true,
      });
    } else {
      setForm(prev => ({
        ...prev,
        staffId:
          "STF" +
          Math.floor(Math.random() * 900 + 100),
      }));
    }
  }, [editData]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await getManagers();
        setManagerOptions(response.data || []);
      } catch (error) {
        console.error("Failed to load reporting managers", error);
      }
    };

    fetchManagers();
  }, []);



  const bankFieldKeys = ["bankName", "accountHolderName", "accountNumber", "ifscCode", "branchName", "upiId"];

  const update = (k, v) => {
    if (isView) return;
    setForm(prev => ({ ...prev, [k]: v }));
    if (bankFieldKeys.includes(k)) {
      setBankFieldErrors(prev => ({
        ...prev,
        [k]: "",
        // A bank change can invalidate the account number's length rule and
        // the IFSC prefix rule - clear those too rather than leave a stale
        // error referencing the old bank.
        ...(k === "bankName" ? { accountNumber: "", ifscCode: "" } : {}),
      }));
    }
  };

  const toggleModule = (m) => {
    if (isView) return;
    const current = [...form.modules];
    if (current.includes(m)) update('modules', current.filter(x => x !== m));
    else update('modules', [...current, m]);
  };

  const allModulesSelected = MODULE_OPTIONS.every(m => form.modules.includes(m));
  const someModulesSelected = MODULE_OPTIONS.some(m => form.modules.includes(m));

  const toggleAllModules = () => {
    if (isView) return;
    update('modules', allModulesSelected ? [] : [...MODULE_OPTIONS]);
  };

  const checkContact = async (field) => {
    if (isView) return '';

    const value = field === 'email' ? form.email.trim() : form.mobileNumber.trim();
    const isValidFormat = field === 'email' ? emailRegex.test(value) : phoneRegex.test(value);
    if (!isValidFormat) return '';

    if (isEdit) {
      const originalValue = field === 'email'
        ? editData?.personalInfo?.email
        : editData?.personalInfo?.mobileNumber;
      if (originalValue && originalValue.trim() === value) {
        setContactErrors(prev => ({ ...prev, [field]: '' }));
        return '';
      }
    }

    try {
      const result = await checkStaffContactAvailability(
        field === 'email' ? { email: value } : { mobileNumber: value }
      );
      const message = result.available
        ? ''
        : result.message || `This ${field === 'email' ? 'email' : 'phone number'} is already being used.`;
      setContactErrors(prev => ({ ...prev, [field]: message }));
      return message;
    } catch (err) {
      console.error(err);
      return '';
    }
  };

  const steps = [
    { label: 'Personal Information', short: 'Personal Info' },
    { label: 'Work & Access Assignment', short: 'Work & Access' },
    { label: "Bank Account Details", short: "Bank Details" },
    { label: 'Security & Credentials', short: 'Security' },
  ];

  const lettersOnly = (value) => value.replace(/[^A-Za-z\s]/g, "");

  const inputBase = "w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#1A1D2E] outline-none focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 transition-all bg-white placeholder-gray-300";
  const inputDisabled = "w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#6B7280] bg-[#F9FAFB] cursor-not-allowed outline-none";
  const inputReadonly = "w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#9CA3AF] bg-[#F3F4F6] font-mono outline-none";
  const labelClass = "block text-xs font-semibold text-[#6B7280] mb-2 tracking-wide";

  return (
    <>
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(17, 24, 39, 0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        {/* Modal Container */}
        <div
          className="bg-white rounded-3xl shadow-2xl flex flex-col relative overflow-hidden w-[calc(100vw-24px)] max-w-[1500px]"
          style={{ height: 'min(88vh, 900px)' }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── TOP HEADER STRIP ── */}
          <div className="px-5 sm:px-8 lg:px-10 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-[#F3F4F6] flex-shrink-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="font-['Syne'] text-2xl font-bold text-[#1A1D2E] leading-tight">
                  {isView ? 'Staff Profile' : isEdit ? 'Edit Staff Member' : 'Add Staff Member'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {isView
                    ? `Viewing record for ${form.fullName || '—'}`
                    : isEdit
                      ? `Update details for ${form.fullName || '—'}`
                      : 'Enroll a new staff member into the clinic system.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
                style={{ fontSize: '18px', border: 'none', background: 'transparent' }}
              >
                ✕
              </button>
            </div>

            {/* ── STEPPER WITH NUMBERED CIRCLES ── */}
            <div className="hidden md:flex items-center gap-0">
              {steps.map((s, i) => {
                const num = i + 1;
                const isActive = step === num;
                const isDone = step > num;
                return (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-2.5">
                      {/* Circle */}
                      <div
                        className="flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0 transition-all"
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: isDone ? '#E8630A' : isActive ? '#E8630A' : '#FEF3EB',
                          color: isDone || isActive ? '#FFFFFF' : '#E8630A',
                          border: isActive ? '2px solid #E8630A' : isDone ? '2px solid #E8630A' : '2px solid #FDDAB5',
                        }}
                      >
                        {isDone ? '✓' : num}
                      </div>
                      {/* Label */}
                      <span
                        className="text-sm font-semibold whitespace-nowrap"
                        style={{ color: isActive ? '#1A1D2E' : isDone ? '#E8630A' : '#9CA3AF' }}
                      >
                        {s.label}
                      </span>
                    </div>
                    {/* Connector line */}
                    {i < steps.length - 1 && (
                      <div
                        className="flex-1 mx-4 rounded-full"
                        style={{
                          height: '2px',
                          backgroundColor: step > i + 1 ? '#E8630A' : '#E5E7EB',
                          minWidth: '60px',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* ── PILL TABS ── */}
            <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
              {steps.map((s, i) => {
                const num = i + 1;
                const isActive = step === num;
                const isDone = step > num;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      // Only allow jumping to the current step or one already
                      // passed - jumping ahead must go through "Next" so each
                      // intervening step's validation (including the async
                      // duplicate email/phone check) actually runs, instead of
                      // skipping straight to Security and only finding out at
                      // final save.
                      if (!isView && num <= step) setStep(num);
                    }}
                    className="px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer"
                    style={{
                      backgroundColor: isActive ? '#E8630A' : isDone ? '#FEF3EB' : '#F3F4F6',
                      color: isActive ? '#FFFFFF' : isDone ? '#E8630A' : '#6B7280',
                      border: 'none',
                    }}
                  >
                    {s.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── SCROLLABLE FORM BODY ── */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-10 py-6 sm:py-8">

            {/* ─── STEP 1: Personal Information ─── */}
            {step === 1 && (
              <div className="bg-white border border-[#F3F4F6] rounded-2xl p-5 sm:p-8 shadow-sm">
                <h3 className="text-base font-bold text-[#1A1D2E] mb-6">Personal Identity</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Full Name <span className="text-[#E8630A]">*</span></label>
                      <input
                        className={isView ? inputDisabled : inputBase}
                        disabled={isView}
                        value={form.fullName}
                        onChange={e => update('fullName', lettersOnly(e.target.value))}
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Gender <span className="text-[#E8630A]">*</span></label>
                      <select
                        className={isView ? inputDisabled : inputBase}
                        disabled={isView}
                        value={form.gender}
                        onChange={e => update('gender', e.target.value)}
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Date of Birth <span className="text-[#E8630A]">*</span></label>
                    <input
                      className={isView ? inputDisabled : inputBase}
                      disabled={isView}
                      type="date"
                      value={form.dateOfBirth}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        update("dateOfBirth", e.target.value);
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;

                        if (!value || value.length !== 10) return;

                        if (isFutureDate(value)) {
                          alert("Date of birth cannot be a future date.");
                          update("dateOfBirth", "");
                          return;
                        }

                        if (isLessThan15Years(value)) {
                          alert("Staff member must be at least 15 years old.");
                          update("dateOfBirth", "");
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Mobile Number <span className="text-[#E8630A]">*</span></label>
                    <input
                      className={isView ? inputDisabled : inputBase}
                      disabled={isView}
                      type="tel"
                      value={form.mobileNumber}
                      maxLength={10}
                      onChange={e => {
                        update('mobileNumber', digitsOnly(e.target.value));
                        setContactErrors(prev => ({ ...prev, mobileNumber: '' }));
                      }}
                      onBlur={() => checkContact('mobileNumber')}
                      placeholder="e.g. 9876543210"
                    />
                    {contactErrors.mobileNumber && (
                      <p className="mt-1 text-xs text-red-500">{contactErrors.mobileNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Email Address <span className="text-[#E8630A]">*</span></label>
                    <input
                      className={isView ? inputDisabled : inputBase}
                      disabled={isView}
                      type="email"
                      value={form.email}
                      onChange={e => {
                        update('email', e.target.value);
                        setContactErrors(prev => ({ ...prev, email: '' }));
                      }}
                      onBlur={() => checkContact('email')}
                      placeholder="e.g. john@clinic.com"
                    />
                    {contactErrors.email && (
                      <p className="mt-1 text-xs text-red-500">{contactErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Profile Photo</label>
                    {isView ? (
                      form.profilePhoto ? (
                        <img
                          src={form.profilePhoto}
                          alt="Profile"
                          className="h-24 w-24 rounded-xl object-cover"
                        />
                      ) : (
                        <div className={inputDisabled}>
                          No photo uploaded
                        </div>
                      )
                    ) : (
                      <div
                        className="w-full border border-dashed border-[#E8630A] rounded-xl py-3 px-4 text-sm text-[#E8630A] font-semibold cursor-pointer hover:bg-[#FEF3EB] transition-colors"
                        onClick={() => document.getElementById("photoUpload").click()}
                      >
                        {form.profilePhoto ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                form.profilePhoto instanceof File
                                  ? URL.createObjectURL(form.profilePhoto)
                                  : form.profilePhoto
                              }
                              alt="Preview"
                              className="h-10 w-10 rounded-lg object-cover border border-[#E8630A]"
                            />

                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {form.profilePhoto instanceof File
                                  ? form.profilePhoto.name
                                  : "Profile Photo"}
                              </span>

                              <span className="text-xs text-gray-500">
                                {form.profilePhoto instanceof File
                                  ? form.profilePhoto.type
                                  : "Uploaded"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">Upload File</div>
                        )}

                        <input
                          id="photoUpload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            if (!isImageFile(file)) {
                              alert("Profile photo must be an image file");
                              e.target.value = "";
                              return;
                            }

                            update("profilePhoto", file);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="mt-8 pt-6 border-t border-[#F3F4F6]">
                  <h3 className="text-base font-bold text-[#1A1D2E] mb-5">Emergency Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Contact Person Name</label>
                      <input
                        className={isView ? inputDisabled : inputBase}
                        disabled={isView}
                        value={form.emergencyContacts[0]?.contactPersonName || ""}
                        onChange={e =>
                          update("emergencyContacts", [
                            {
                              ...form.emergencyContacts[0],
                              contactPersonName: lettersOnly(e.target.value)
                            }
                          ])
                        }
                        placeholder="e.g. Jane Doe"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Contact Number</label>
                      <input
                        className={isView ? inputDisabled : inputBase}
                        disabled={isView}
                        value={form.emergencyContacts[0]?.contactNumber || ""}
                        onChange={e =>
                          update("emergencyContacts", [
                            {
                              ...form.emergencyContacts[0],
                              contactNumber: digitsOnly(e.target.value)
                            }
                          ])
                        }
                        maxLength={10}
                        placeholder="e.g. 9876500000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 2: Work & Access ─── */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Professional Placement Card */}
                <div className="bg-white border border-[#F3F4F6] rounded-2xl p-5 sm:p-8 shadow-sm">
                  <h3 className="text-base font-bold text-[#1A1D2E] mb-6">Professional Placement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Roles <span className="text-[#E8630A]">*</span></label>
                      <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3">
                        {roles.map((role) => (
                          <label key={role} className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              disabled={isView}
                              checked={form.roles.includes(role)}
                              onChange={(event) => {
                                const nextRoles = event.target.checked
                                  ? [...form.roles, role]
                                  : form.roles.filter((value) => value !== role);
                                update('roles', nextRoles);
                                update('role', nextRoles[0] || '');
                              }}
                            />
                            {role}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Department</label>
                      <select
                        className={isView ? inputDisabled : inputBase}
                        disabled={isView}
                        value={form.department}
                        onChange={e => update('department', e.target.value)}
                      >
                        <option value="">Select</option>
                        {departments.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Reporting Manager</label>
                      <select
                        className={isView ? inputDisabled : inputBase}
                        disabled={isView}
                        value={form.reportingTo}
                        onChange={e => update('reportingTo', e.target.value)}
                      >
                        <option value="">Select Manager</option>
                        {managerOptions
                          .filter(s => s._id !== editData?._id)
                          .map((s, index) => (
                            <option
                              key={s._id || s.employmentInfo?.staffId || index}
                              value={s._id || ""}
                            >
                              {s.personalInfo?.fullName || "No Name"}
                              {s.employmentInfo?.staffId ? ` (${s.employmentInfo.staffId})` : ""}
                            </option>
                          ))}                   </select>
                    </div>
                    <div>
                      <label className={labelClass}>Staff ID <span className="text-[#9CA3AF] font-normal">(System Generated)</span></label>
                      <input className={inputReadonly} readOnly value={form.staffId} />
                    </div>
                    <div>
                      <label className={labelClass}>Date of Joining <span className="text-[#E8630A]">*</span></label>
                      <input
                        className={isView ? inputDisabled : inputBase}
                        disabled={isView}
                        type="date"
                        max="9999-12-31"
                        value={form.dateOfJoining}
                        onChange={e => update('dateOfJoining', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Employment Type</label>
                      <select
                        className={isView ? inputDisabled : inputBase}
                        disabled={isView}
                        value={form.employmentType}
                        onChange={e => update('employmentType', e.target.value)}
                      >
                        <option value="">Select</option>
                        {employmentTypes.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Module Access Card */}
                <div className="bg-white border border-[#F3F4F6] rounded-2xl p-5 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-[#1A1D2E]">Module Access Permissions</h3>
                    <label
                      className="flex items-center gap-2 text-sm font-semibold text-[#E8630A] select-none"
                      style={{ cursor: isView ? 'default' : 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={allModulesSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someModulesSelected && !allModulesSelected;
                        }}
                        onChange={toggleAllModules}
                        disabled={isView}
                        className="accent-[#E8630A]"
                      />
                      Select All
                    </label>
                  </div>
                  <p className="text-sm text-gray-400 mb-6">Select the modules this staff member should have access to.</p>
                  <div className="flex flex-wrap gap-3">
                    {MODULE_OPTIONS.map(m => (
                      <div
                        key={m}
                        onClick={() => toggleModule(m)}
                        className="flex items-center gap-2.5 px-5 py-3 rounded-xl border transition-all"
                        style={{
                          cursor: isView ? 'default' : 'pointer',
                          borderColor: form.modules.includes(m) ? '#E8630A' : '#E5E7EB',
                          backgroundColor: form.modules.includes(m) ? '#FEF3EB' : '#FFFFFF',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.modules.includes(m)}
                          readOnly
                          className="accent-[#E8630A]"
                        />
                        <span
                          className="text-sm font-semibold"
                          style={{ color: form.modules.includes(m) ? '#E8630A' : '#6B7280' }}
                        >
                          {m}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* ─── STEP 3: Bank Account Details ─── */}
            {step === 3 && (
              <div className="bg-white border border-[#F3F4F6] rounded-2xl p-5 sm:p-8 shadow-sm">
                <h3 className="text-base font-bold text-[#1A1D2E] mb-6">
                  Bank Account Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <label className={labelClass}>
                      Bank Name <span className="text-[#E8630A]">*</span>
                    </label>
                    <select
                      className={isView ? inputDisabled : inputBase}
                      disabled={isView}
                      value={form.bankName}
                      onChange={(e) => {
                        const rule = getBankRule(e.target.value);
                        update("bankName", e.target.value);
                        update("accountNumber", form.accountNumber.slice(0, getMaxAccountLength(rule)));
                      }}
                      onBlur={() => handleBankFieldBlur("bankName")}
                    >
                      <option value="">Select</option>
                      {BANK_OPTIONS.map((bank) => (
                        <option key={bank}>{bank}</option>
                      ))}
                    </select>
                    {bankFieldErrors.bankName && (
                      <p className="mt-1 text-sm text-red-500 font-medium">{bankFieldErrors.bankName}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Account Holder Name <span className="text-[#E8630A]">*</span>
                    </label>
                    <input
                      className={isView ? inputDisabled : inputBase}
                      disabled={isView}
                      value={form.accountHolderName}
                      onChange={(e) =>
                        update(
                          "accountHolderName",
                          lettersOnly(e.target.value)
                        )
                      }
                      onBlur={() => handleBankFieldBlur("accountHolderName")}
                      placeholder="Enter Account Holder Name"
                    />
                    {bankFieldErrors.accountHolderName && (
                      <p className="mt-1 text-sm text-red-500 font-medium">{bankFieldErrors.accountHolderName}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Account Number <span className="text-[#E8630A]">*</span>
                    </label>
                    <input
                      className={isView ? inputDisabled : inputBase}
                      disabled={isView}
                      value={form.accountNumber}
                      onChange={(e) =>
                        update("accountNumber", digitsOnly(e.target.value, getMaxAccountLength(getBankRule(form.bankName))))
                      }
                      onBlur={() => handleBankFieldBlur("accountNumber")}
                      maxLength={getMaxAccountLength(getBankRule(form.bankName))}
                      placeholder="Enter Account Number"
                    />
                    {bankFieldErrors.accountNumber ? (
                      <p className="mt-1 text-sm text-red-500 font-medium">{bankFieldErrors.accountNumber}</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400">
                        Expected Length: {formatAccountLength(getBankRule(form.bankName))}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      IFSC Code <span className="text-[#E8630A]">*</span>
                    </label>
                    <input
                      className={isView ? inputDisabled : inputBase}
                      disabled={isView}
                      value={form.ifscCode}
                      onChange={(e) =>
                        update("ifscCode", e.target.value.toUpperCase())
                      }
                      onBlur={() => handleBankFieldBlur("ifscCode")}
                      placeholder="Enter IFSC Code"
                    />
                    {bankFieldErrors.ifscCode && (
                      <p className="mt-1 text-sm text-red-500 font-medium">{bankFieldErrors.ifscCode}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Branch Name
                    </label>
                    <input
                      className={isView ? inputDisabled : inputBase}
                      disabled={isView}
                      value={form.branchName}
                      onChange={(e) =>
                        update("branchName", e.target.value)
                      }
                      onBlur={() => handleBankFieldBlur("branchName")}
                      placeholder="Enter Branch Name"
                    />
                    {bankFieldErrors.branchName && (
                      <p className="mt-1 text-sm text-red-500 font-medium">{bankFieldErrors.branchName}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      UPI ID
                    </label>
                    <input
                      className={isView ? inputDisabled : inputBase}
                      disabled={isView}
                      value={form.upiId}
                      onChange={(e) =>
                        update("upiId", e.target.value)
                      }
                      onBlur={() => handleBankFieldBlur("upiId")}
                      placeholder="example@upi"
                    />
                    {bankFieldErrors.upiId && (
                      <p className="mt-1 text-sm text-red-500 font-medium">{bankFieldErrors.upiId}</p>
                    )}
                  </div>

                </div>
              </div>
            )}
            {/* ─── STEP 4: Security & Credentials ─── */}
            {step === 4 && (
              <div className="bg-white border border-[#F3F4F6] rounded-2xl p-5 sm:p-8 shadow-sm">
                <h3 className="text-base font-bold text-[#1A1D2E] mb-6">System Credentials</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Username</label>
                    <input
                      className={inputDisabled}
                      value={form.fullName ? form.fullName.toLowerCase().replace(/\s+/g, '.') : ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Temporary Password</label>
                    <input className={inputReadonly} value="••••••••••••" readOnly />
                  </div>
                  {form.employmentType === 'Contract' && (
                    <div>
                      <label className={labelClass}>Account Expiry<span className="text-[#E8630A]">*</span></label>
                      <input
                        className={isView ? inputDisabled : inputBase}
                        disabled={isView}
                        type="date"
                        value={form.accountExpiryDate}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (isPastOrToday(value)) {
                            alert("Account expiry date must be a future date.");
                            return;
                          }

                          update("accountExpiryDate", value);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-4 max-w-xl">
                  {/* Force Password Reset */}
                  <div
                    className="flex items-center justify-between p-5 border border-[#F3F4F6] rounded-2xl"
                    style={{ backgroundColor: '#FAFAFA' }}
                  >
                    <div>
                      <div className="font-semibold text-[#1A1D2E] text-sm">Force Password Reset</div>
                      <div className="text-xs text-gray-400 mt-0.5">User must change password on first login</div>
                    </div>
                    <div
                      onClick={() => !isView && update(
                        'forcePasswordReset',
                        !form.forcePasswordReset
                      )}
                      className="relative rounded-full transition-colors flex-shrink-0"
                      style={{
                        width: '46px', height: '24px',
                        backgroundColor: form.forcePasswordReset
                          ? '#22C55E'
                          : '#D1D5DB',
                        cursor: isView ? 'default' : 'pointer',
                      }}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                        style={{
                          left: form.forcePasswordReset
                            ? '23px'
                            : '3px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Account Status */}
                  <div
                    className="flex items-center justify-between p-5 border border-[#F3F4F6] rounded-2xl"
                    style={{ backgroundColor: '#FAFAFA' }}
                  >
                    <div>
                      <div className="font-semibold text-[#1A1D2E] text-sm">Account Status</div>
                      <div className="text-xs text-gray-400 mt-0.5">Enable or disable system access for this member</div>
                    </div>
                    <div
                      onClick={() => !isView && update('accountActive', !form.accountActive)}
                      className="relative rounded-full transition-colors flex-shrink-0"
                      style={{
                        width: '46px', height: '24px',
                        backgroundColor: form.accountActive ? '#22C55E' : '#D1D5DB',
                        cursor: isView ? 'default' : 'pointer',
                      }}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                        style={{ left: form.accountActive ? '23px' : '3px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div
            className="px-5 sm:px-10 py-5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0"
            style={{ borderTop: '1px solid #F3F4F6', backgroundColor: '#FFFFFF' }}
          >
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="px-7 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E5E7EB',
                color: '#374151',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              {step > 1 ? '← Previous' : 'Cancel'}
            </button>

            <button
              disabled={isSubmitting || checkingAvailability || hasVisibleBankErrors}
              onClick={async () => {
                if (isSubmitting || checkingAvailability || hasVisibleBankErrors) return;

                if (isView) {
                  onClose();
                  return;
                }

                if (step < 4) {
                  const isValid = await validateStep();
                  if (isValid) {
                    setStep(step + 1);
                  }
                } else {
                  const isValid = await validateStep();
                  if (isValid) {
                    onSave(form);
                  }
                }
              }}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors
    ${isSubmitting || checkingAvailability || hasVisibleBankErrors ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                backgroundColor: isSubmitting || checkingAvailability || hasVisibleBankErrors ? "#C77B45" : "#E8630A",
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && !checkingAvailability && !hasVisibleBankErrors)
                  e.currentTarget.style.backgroundColor = "#D05A09";
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && !checkingAvailability && !hasVisibleBankErrors)
                  e.currentTarget.style.backgroundColor = "#E8630A";
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : checkingAvailability ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Checking...
                </span>
              ) : isView ? (
                "Close"
              ) : step < 4 ? (
                "Next →"
              ) : isEdit ? (
                "✓ Update Staff"
              ) : (
                "✓ Save Staff Member"
              )}
            </button>
          </div>
        </div>
      </div>
      {
        isSubmitting && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl px-8 py-6 shadow-xl flex items-center gap-3">
              <svg
                className="animate-spin h-6 w-6 text-[#E8630A]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>

              <span className="font-medium">
                {isEdit ? "Updating staff..." : "Creating staff..."}
              </span>
            </div>
          </div>
        )
      }
    </>


  );
}

// --- Main Page ---
export default function StaffEnrollment() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState('create');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState([]);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const filtered = staff.filter(s =>
    (!filterRole ||
      s.employmentInfo?.role === filterRole) &&
    (!filterStatus ||
      (s.accountInfo?.accountActive
        ? "Active"
        : "Inactive") === filterStatus)
  );
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      const response = await getStaff();

      console.log("API Response:", response);

      setStaff(response.data || []);

      setLoading(false);
    };

    fetchStaff();
  }, []);

  const handleOpenCreate = () => {
    setSelectedStaff(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteStaff(id);

      showToast({
        type: "success",
        title: "Staff Deleted",
        description: "Staff has been deleted successfully.",
      });

      const response = await getStaff();
      setStaff(response.data || []);

      setShowModal(false);

    } catch (err) {
      console.error(err);

      showToast({
        type: "error",
        title: "Delete Failed",
        description: "Unable to delete staff.",
      });
    }
  };

  const handleOpenEdit = (item) => {
    setSelectedStaff(item);


    setModalMode('edit');
    setShowModal(true);
  };

  const handleOpenView = (item) => {
    setSelectedStaff(item);
    setModalMode('view');
    setShowModal(true);
  };
  const handleSave = async (form) => {
    try {
      setIsSubmitting(true);
      if (modalMode === "edit") {

        await updateStaff(
          selectedStaff._id,
          form
        );
        showToast({
          type: "success",
          title: "Staff Updated",
          description: "Staff details have been updated successfully.",
        });
      } else {
        await createStaff(form);
        showToast({
          type: "success",
          title: "Staff Created",
          description: "Staff details have been created successfully.",
        });
      }

      const response = await getStaff();
      setStaff(response.data || []);

      setShowModal(false);

    } catch (err) {
      console.error(err);
      console.log(err);

      showToast({
        type: "error",
        title: err.response.data.message,
        description: "Unable to save Staff details. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterSelectClass = "w-full border border-[#EAE5DC] rounded-xl px-4 py-3 text-sm text-[#1A1D2E] bg-white outline-none focus:border-[#E8630A] focus:ring-1 focus:ring-[#E8630A] transition-colors";

  if (loading) {
    <div className="min-h-screen flex items-center justify-center p-6">

      <Loader />



    </div>
  }


  return (
    <div className="px-0 sm:px-4 lg:px-10 xl:px-16 py-4 sm:py-8 lg:py-10 bg-white min-h-screen">
      {showModal &&
        modalMode === "view" && (
          <ViewStaffModal
            staff={selectedStaff}
            onClose={() =>
              setShowModal(false)
            }
            onDelete={handleDelete}
          />
        )}

      {showModal &&
        modalMode !== "view" && (
          <EnrollForm
            onClose={() =>
              setShowModal(false)
            }
            onSave={handleSave}
            editData={selectedStaff}
            mode={modalMode}
            staff={staff}
            isSubmitting={isSubmitting}
          />
        )}

    {/* Staff Header */}
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-[#D9E8E3]/25 p-5 md:p-6 rounded-2xl shadow-sm border border-[#0C3D2E]/15 transition-all mb-8 lg:mb-10">

  {/* LEFT SECTION */}
  <div className="flex items-center gap-3.5">
    <div className="w-12 h-12 rounded-xl bg-[#0C3D2E] text-white flex items-center justify-center shrink-0 shadow-sm">
      <Users size={22} />
    </div>

    <div>
      <h1 className="text-xl md:text-2xl font-black text-[#0C3D2E] tracking-tight">
        Staff Management
      </h1>

      <p className="text-xs md:text-sm font-semibold text-[#0C3D2E]/70 mt-0.5">
        Manage clinic personnel, access levels, and account credentials
      </p>
    </div>
  </div>


  {/* RIGHT BUTTON */}
  <button
    type="button"
    onClick={handleOpenCreate}
    className="
      w-full md:w-auto 
      flex items-center justify-center gap-2
      bg-[#F7931E]
      hover:bg-[#e08319]
      text-white
      px-5 py-2.5
      rounded-xl
      font-bold
      text-xs
      shadow-sm
      transition-all duration-200
      transform hover:-translate-y-0.5
      cursor-pointer
    "
  >
    <Plus size={16} />
    Enroll New Staff
  </button>

</div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 sm:p-6 bg-gray-50 rounded-2xl border border-[#EAE5DC]">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-gray-400 tracking-wide mb-2">
            Filter by Role
          </label>
          <select
            className={filterSelectClass}
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            <option value="">All Staff Roles</option>
            {roles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-gray-400 tracking-wide mb-2">
            Filter by Status
          </label>
          <select
            className={filterSelectClass}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Account Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-[#EAE5DC] rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-[#EAE5DC]">
              {['Staff Member', 'Staff ID', 'Role / Dept', 'Employment', 'Status', 'Joined Date', 'Actions'].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-5 text-xs font-semibold text-gray-500 tracking-wide ${i === 6 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-sm"
                      style={{
                        backgroundColor: "#FEF3EB",
                        color: "#E8630A"
                      }}
                    >
                      {s.personalInfo?.fullName
                        ?.split(" ")
                        .map(n => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="font-bold text-[#1A1D2E] text-[15px]">
                      {s.personalInfo?.fullName}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5 font-mono text-gray-500 text-sm"> {s.employmentInfo?.staffId}</td>
                <td className="px-5 py-5">
                  <div className="text-[#1A1D2E] font-semibold text-sm">
                    {s.employmentInfo?.role}
                  </div>

                  <div className="text-gray-400 text-xs mt-0.5">
                    {s.employmentInfo?.department}
                  </div>
                </td>
                <td className="px-5 py-5 text-gray-600 text-sm">  {s.employmentInfo?.employmentType}</td>
                <td className="px-5 py-5">
                  <span
                    className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{
                      backgroundColor: s.accountInfo?.accountActive
                        ? '#DCFCE7'
                        : '#F3F4F6',
                      color: s.accountInfo?.accountActive
                        ? '#16A34A'
                        : '#6B7280',
                    }}
                  >
                    {s.accountInfo?.accountActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-5 text-gray-500 text-sm">{s.employmentInfo?.dateOfJoining?.split("T")[0]}</td>
                <td className="px-5 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenView(s)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all duration-200"
                      title="View"
                    >
                      <Eye size={18} strokeWidth={2.2} />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 transition-all duration-200"
                      title="Edit"
                    >
                      <Pencil size={18} strokeWidth={2.2} />
                    </button>

                    <button
                      onClick={() => handleDelete(s._id)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 size={18} strokeWidth={2.2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}