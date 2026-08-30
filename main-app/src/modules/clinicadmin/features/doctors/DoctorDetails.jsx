import React from 'react';
import { showToast } from '../../../../shared/components/toast';
import Loader from '../../../../shared/components/Loader';
// import { useEffect } from 'react';
import {
  Eye,
  Pencil,
  Trash2,
  Stethoscope,
  BadgeCheck,
  IndianRupee,
  Clock3,
  ShieldAlert,
  Upload,
  FileText,
} from "lucide-react";
import { createDoctor, getDoctors, updateDoctor, deleteDoctor } from '../../api/doctorApi';
import { useEffect, useState } from "react";
import { getDoctorStaff } from "../../api/staffApi";
import { getCurrentSubscription } from "../../api/subscriptionApi";
// ── Mock Data ────────────────────────────────────────────────────────────────
const degreeTypes = ['BVSc', 'BVSc & AH', 'MVSc', 'PhD (Vet)', 'BAMS', 'Other'];
const specializations = ['Small Animal', 'Large Animal', 'Exotic & Wildlife', 'Poultry', 'Aquatic', 'Surgery', 'Dermatology', 'Dentistry', 'Oncology', 'Cardiology'];
const languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati'];
const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",

  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];
const digitsOnly = (value, max = 10) => value.replace(/\D/g, "").slice(0, max);
const isPdfFile = (file) => file?.type === "application/pdf";
const isImageFile = (file) => file?.type?.startsWith("image/");
const isPastDate = (value) => {
  if (!value) return false;
  const selected = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today;
};
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const isValidMobile = (mobile) => {
  return mobile.length === 10 && /^\d{10}$/.test(mobile);
};


function getInitials(name = " ") {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

// ── Shared style constants ───────────────────────────────────────────────────
const inputCls = "w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#1A1D2E] outline-none focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 transition-all bg-white placeholder-gray-300";
const inputErrCls = "w-full border border-red-400 rounded-xl px-4 py-3 text-sm text-[#1A1D2E] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all bg-white";
const labelCls = "block text-xs font-semibold text-[#6B7280] mb-2 tracking-wide";
const cardCls = "bg-white border border-[#F3F4F6] rounded-2xl p-5 sm:p-8 shadow-sm";

function UploadBox({ id, accept, label }) {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      <div
        className="w-full border border-dashed border-[#E8630A] rounded-xl py-3.5 px-4 text-sm text-[#E8630A] font-semibold text-center cursor-pointer hover:bg-[#FEF3EB] transition-colors"
        onClick={() => document.getElementById(id).click()}
      >
        Upload File
        <input id={id} type="file" accept={accept} className="hidden" />
      </div>
    </div>
  );
}

// ── DoctorForm ───────────────────────────────────────────────────────────────
function DoctorForm({ onClose, onSave, existingData, isEdit, isSubmitting, doctorLimitReached, maxDoctors }) {
  const blockedByLimit = !isEdit && doctorLimitReached;
  const [doctorStaff, setDoctorStaff] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const todayDateStr = new Date().toISOString().split('T')[0];

  console.log(existingData);

  const [degrees, setDegrees] = useState(
    existingData?.degrees?.map((d) => ({
      degree: d.degreeName,
      certificate: null,
      existingCertificate: d.degreeCertificate,
    })) || [
      {
        degree: "",
        certificate: null,
        existingCertificate: null,
      },
    ]
  );
  const [doctorLetterhead,
    setDoctorLetterhead] =
    useState(null);
  const [registrationCertificate,
    setRegistrationCertificate] =
    useState(null);
  const [digitalSignature,
    setDigitalSignature] =
    useState(null);

  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState(existingData?.selectedSpecs || []);
  const [selectedLangs, setSelectedLangs] = useState(existingData?.selectedLangs || []);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    staff: existingData?.staff?._id || existingData?.staff || existingData?.staffId || "",
    staffId: existingData?.staff?._id || existingData?.staff || existingData?.staffId || "",
    staffCode: existingData?.staffCode || "",

    name: existingData?.name || "",
    mobile: existingData?.mobile || "",
    email: existingData?.email || "",

    regNumber: existingData?.regNumber || "",
    state: existingData?.state || "",
    certValidity: existingData?.certValidity || "",
    reminderDays: existingData?.reminderDays || 30,
    fees: existingData?.fees || "",
    avgDuration: existingData?.avgDuration || 15,
    emergency: existingData?.emergency ?? false,
    experience: existingData?.experience || "",
  });

  const u = (k, v) => {
    setFormData(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const requirePdf = (file, onValid) => {
    if (!file) return;
    if (!isPdfFile(file)) {
      showToast({
        type: "error",
        title: "Invalid File",
        description: "Please upload PDF file only.",
      });
      return false;
    }
    onValid(file);
    return true;
  };

  const requireImage = (file, onValid) => {
    if (!file) return;
    if (!isImageFile(file)) {
      showToast({
        type: "error",
        title: "Invalid File",
        description: "Please upload image file only.",
      });
      return false;
    }
    onValid(file);
    return true;
  };

  const getAvailableDegrees = (currentIndex) => {
    const selectedDegrees = degrees
      .map((d, i) => i !== currentIndex ? (d.degree || d.degreeName) : null)
      .filter(Boolean);
    return degreeTypes.filter(dt => !selectedDegrees.includes(dt));
  };

  // A degree row with a type picked but no certificate (new upload or an
  // already-saved one) shouldn't be allowed past this step - previously
  // Next had no gating at all on any step, only the final Save.
  const hasMissingDegreeCertificate = () =>
    degrees.some(
      (d) => (d.degree || d.degreeName) && !d.certificate && !d.existingCertificate && !d.degreeCertificate
    );

  const hasInvalidCertValidity = () =>
    Boolean(formData.certValidity) && isPastDate(formData.certValidity);

  const steps = [
    { label: 'Qualifications' },
    { label: 'Vet Council Registration' },
    { label: 'Practice Settings' },
  ];

  const validateStep0 = (e) => {
    // Doctor selection validation
    if (!formData.staff) e.staff = 'Please select a doctor';

    // Name validation
    if (!formData.name.trim()) e.name = 'Doctor name is required';

    // Mobile validation
    if (!formData.mobile.trim()) {
      e.mobile = 'Mobile number is required';
    } else if (!isValidMobile(formData.mobile)) {
      e.mobile = 'Mobile must be a valid 10-digit number';
    }

    // Email validation
    if (!formData.email.trim()) {
      e.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      e.email = 'Please enter a valid email address';
    }

    // Experience validation
    if (!formData.experience || Number(formData.experience) <= 0 || Number(formData.experience) > 70) {
      e.experience = 'Experience must be between 1 and 70 years';
    }

    // Degrees validation
    if (!degrees.some(d => d.degree || d.degreeName)) {
      e.degrees = 'Select at least one degree type';
    }

    // Specialization validation
    if (!selectedSpecs.length) {
      e.selectedSpecs = 'Select at least one specialization';
    }
  };

  const validateStep1 = (e) => {
    // Registration number validation
    if (!formData.regNumber.trim()) {
      e.regNumber = 'Registration number is required';
    } else if (!/^[A-Za-z0-9/-]{5,30}$/.test(formData.regNumber.trim())) {
      e.regNumber = 'Use 5-30 letters, numbers, / or - only';
    }

    // State validation
    if (!formData.state) {
      e.state = 'Please select a state';
    }

    // Certificate validity validation
    if (formData.certValidity && isPastDate(formData.certValidity)) {
      e.certValidity = 'Certificate validity date cannot be in the past';
    }

    // Reminder days validation
    if (formData.reminderDays === "" || Number(formData.reminderDays) < 0 || Number(formData.reminderDays) > 365) {
      e.reminderDays = 'Reminder days must be between 0 and 365';
    }
  };

  const validateStep2 = (e) => {
    // Consultation fees validation
    if (!formData.fees || Number(formData.fees) <= 0 || Number(formData.fees) > 100000) {
      e.fees = 'Consultation fees must be between 1 and 100000';
    }

    // Average duration validation
    if (!formData.avgDuration || Number(formData.avgDuration) < 5 || Number(formData.avgDuration) > 240) {
      e.avgDuration = 'Duration must be between 5 and 240 minutes';
    }
  };

  const STEP_VALIDATORS = [validateStep0, validateStep1, validateStep2];

  // Validates only the current tab's fields, shows its errors inline right
  // away, and blocks advancing - previously every field across all 3 tabs
  // was only checked at the very end, on the final Save/Update click.
  const validateCurrentStep = () => {
    const e = {};
    STEP_VALIDATORS[activeStep](e);
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validate = () => {
    const e = {};
    validateStep0(e);
    validateStep1(e);
    validateStep2(e);
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submitForm = () => {

    if (!validate()) return;

    onSave({
      ...formData,
      degrees,
      selectedSpecs,
      selectedLangs,
      registrationCertificate,
      digitalSignature,
      doctorLetterhead,
    });

  };


  const toggleSpec = (s) => {
    setSelectedSpecs(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
    if (errors.selectedSpecs) setErrors(p => ({ ...p, selectedSpecs: '' }));
  };
  const toggleLang = (l) => setSelectedLangs(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const stepErrors = [
    [errors.name, errors.mobile, errors.email, errors.experience, errors.degrees, errors.selectedSpecs].filter(Boolean).length,
    [errors.regNumber, errors.state, errors.certValidity, errors.reminderDays].filter(Boolean).length,
    [errors.fees, errors.avgDuration].filter(Boolean).length,
  ];

  const chipCls = (active) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-xs font-semibold ${active ? 'border-[#E8630A] bg-[#FEF3EB] text-[#E8630A]' : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-gray-300'
    }`;
  useEffect(() => {
    fetchDoctorStaff();
  }, []);

  const fetchDoctorStaff = async () => {
    try {
      const data = await getDoctorStaff(existingData?._id);
      setDoctorStaff(data);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <div
        className="fixed inset-0 z-1000 flex items-center justify-center p-3 sm:p-5"
        style={{ backgroundColor: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden w-full max-w-375"
          style={{ height: 'min(88vh, 900px)' }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── HEADER ── */}
          <div className="px-5 sm:px-8 lg:px-10 pt-6 sm:pt-8 pb-0 shrink-0 border-b border-[#F3F4F6]">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="font-['Syne'] text-2xl font-bold text-[#1A1D2E] leading-tight">
                  {isEdit ? 'Edit Doctor Details' : 'Add Doctor Details'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {isEdit
                    ? `Update qualifications & practice settings for ${formData.name || '—'}`
                    : 'Register a new doctor — qualifications, registration & practice details.'}
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer text-lg mt-0.5 bg-transparent border-none">
                ✕
              </button>
            </div>

            {/* Stepper */}
            <div className="hidden md:flex items-center">
              {steps.map((s, i) => {
                const isActive = activeStep === i;
                const isDone = activeStep > i;
                return (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0sition-all"
                        style={{
                          backgroundColor: isDone || isActive ? '#E8630A' : '#FEF3EB',
                          color: isDone || isActive ? '#fff' : '#E8630A',
                          border: `2px solid ${isDone || isActive ? '#E8630A' : '#FDDAB5'}`,
                        }}
                      >
                        {isDone ? '✓' : i + 1}
                      </div>
                      <span
                        className="text-sm whitespace-nowrap"
                        style={{ color: isActive ? '#1A1D2E' : isDone ? '#E8630A' : '#9CA3AF', fontWeight: isActive ? 700 : 600 }}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className="flex-1 mx-5 rounded-full"
                        style={{ height: '2px', backgroundColor: activeStep > i ? '#E8630A' : '#E5E7EB', minWidth: '80px' }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pill tabs */}
            <div className="flex gap-2 mt-5 pb-5 overflow-x-auto">
              {steps.map((s, i) => {
                const isActive = activeStep === i;
                const isDone = activeStep > i;
                return (
                  <div key={i} className="relative">
                    <button
                      onClick={() => setActiveStep(i)}
                      className="px-5 py-2 rounded-full text-sm font-semibold cursor-pointer border-none transition-all"
                      style={{
                        backgroundColor: isActive ? '#E8630A' : isDone ? '#FEF3EB' : '#F3F4F6',
                        color: isActive ? '#fff' : isDone ? '#E8630A' : '#6B7280',
                      }}
                    >
                      {s.label}
                    </button>
                    {stepErrors[i] > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {stepErrors[i]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-10 py-6 sm:py-8">

            {/* Step 0: Qualifications */}
            {activeStep === 0 && (
              <div className="space-y-6">
                <div className={cardCls}>
                  <h3 className="text-base font-bold text-[#1A1D2E] mb-6">Doctor Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelCls}>Doctor Full Name <span className="text-[#E8630A]">*</span></label>
                      <select
                        disabled={blockedByLimit}
                        className={(errors.staff || blockedByLimit) ? inputErrCls : inputCls}
                        value={formData.staffId || ""}
                        onChange={(e) => {

                          const doctor = doctorStaff.find(
                            d => d._id === e.target.value
                          );

                          if (!doctor) return;

                          setFormData(prev => ({
                            ...prev,

                            staffId: doctor._id,
                            staff: doctor._id,
                            staffCode:
                              doctor.employmentInfo?.staffId || "",

                            name:
                              doctor.personalInfo.fullName,

                            mobile:
                              doctor.personalInfo.mobileNumber,

                            email:
                              doctor.personalInfo.email,
                          }));
                          if (errors.staff) setErrors(p => ({ ...p, staff: '' }));
                        }}
                      >
                        <option value="">
                          Select Doctor
                        </option>

                        {doctorStaff.map(doc => (
                          <option
                            key={doc._id}
                            value={doc._id}
                          >
                            {doc.employmentInfo.staffId}
                            {" | "}
                            {doc.personalInfo.fullName}
                            {" | "}
                            {doc.personalInfo.mobileNumber}
                          </option>
                        ))}
                      </select>
                      {blockedByLimit ? (
                        <p className="text-red-500 text-xs mt-1.5">
                          Maximum of {maxDoctors} doctor{maxDoctors === 1 ? '' : 's'} reached for your current plan. Upgrade your plan to add more.
                        </p>
                      ) : (
                        errors.staff && <p className="text-red-500 text-xs mt-1.5">{errors.staff}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Years of Experience <span className="text-[#E8630A]">*</span></label>
                      <input type="number" min="0" placeholder="e.g. 8" value={formData.experience} onChange={e => u('experience', digitsOnly(e.target.value, 2))} className={errors.experience ? inputErrCls : inputCls} />
                      {errors.experience && <p className="text-red-500 text-xs mt-1.5">{errors.experience}</p>}
                    </div>
                  </div>
                </div>

                <div className={cardCls}>
                  <h3 className="text-base font-bold text-[#1A1D2E] mb-6">Academic Degrees</h3>
                  <div className="space-y-4">
                    {degrees.map((d, i) => (
                      <div key={i} className="bg-[#FAFAFA] border border-[#F3F4F6] rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Degree {i + 1}</span>
                          {i > 0 && (
                            <button onClick={() => setDegrees(degrees.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer bg-transparent border-none">
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className={labelCls}>Degree Type</label>
                            <select 
                              className={inputCls} 
                              value={d.degree || d.degreeName || ""} 
                              onChange={e => setDegrees(degrees.map((deg, j) => j === i ? { ...deg, degree: e.target.value, degreeName: e.target.value } : deg))}
                            >
                              <option value="">Select</option>
                              {getAvailableDegrees(i).map(t => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>
                              Certificate (PDF)
                            </label>

                            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-[#E8630A] bg-white px-4 py-3 text-sm font-semibold text-[#E8630A] transition hover:bg-[#FEF3EB]">
                              <span className="flex items-center gap-2">
                                <Upload size={16} />
                                {d.certificate?.name || "Upload certificate PDF"}
                              </span>
                              <span className="text-[11px] text-[#6B7280]">PDF only</span>
                              <input
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files[0];

                                  const valid = requirePdf(file, (pdf) =>
                                    setDegrees(
                                      degrees.map((deg, j) =>
                                        j === i
                                          ? {
                                            ...deg,
                                            certificate: pdf,
                                          }
                                          : deg
                                      )
                                    )
                                  );

                                  if (valid === false) e.target.value = "";
                                }}
                                className="hidden"
                              />
                            </label>

                            {d.certificate && (
                              <a
                                href={URL.createObjectURL(d.certificate)}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0C3D2E] hover:text-[#E8630A]"
                              >
                                <FileText size={14} />
                                View uploaded certificate
                              </a>
                            )}

                            {(d.degreeCertificate || d.existingCertificate) && !d.certificate && (
                              <a
                                href={d.degreeCertificate || d.existingCertificate}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0C3D2E] hover:text-[#E8630A]"
                              >
                                <FileText size={14} />
                                View existing certificate
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setDegrees([...degrees, { degree: '' }])}
                      className="text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer border border-[#E8630A]/40 text-[#E8630A] bg-[#E8630A]/5 hover:bg-[#E8630A]/10 transition-colors"
                    >
                      + Add Degree
                    </button>
                    {errors.degrees && <p className="text-red-500 text-xs mt-1.5">{errors.degrees}</p>}
                  </div>
                </div>

                <div className={cardCls}>
                  <h3 className="text-base font-bold text-[#1A1D2E] mb-1">Specialization <span className="text-[#E8630A]">*</span></h3>
                  <p className="text-sm text-gray-400 mb-5">Select all areas that apply.</p>
                  <div className="flex flex-wrap gap-2.5">
                    {specializations.map(s => (
                      <div key={s} onClick={() => toggleSpec(s)} className={chipCls(selectedSpecs.includes(s))}>
                        <input type="checkbox" checked={selectedSpecs.includes(s)} readOnly className="accent-[#E8630A]" />
                        {s}
                      </div>
                    ))}
                  </div>
                  {errors.selectedSpecs && <p className="text-red-500 text-xs mt-3">{errors.selectedSpecs}</p>}
                </div>
              </div>
            )}

            {/* Step 1: Vet Council */}
            {activeStep === 1 && (
              <div className={cardCls}>
                <h3 className="text-base font-bold text-[#1A1D2E] mb-6">Vet Council Registration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Registration Number <span className="text-[#E8630A]">*</span></label>
                    <input placeholder="e.g. VCI/MH/2020/1234" value={formData.regNumber} onChange={e => u('regNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9/-]/g, ""))} className={errors.regNumber ? inputErrCls : inputCls} />
                    {errors.regNumber && <p className="text-red-500 text-xs mt-1.5">{errors.regNumber}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>State Vet Council <span className="text-[#E8630A]">*</span></label>
                    <select value={formData.state} onChange={e => u('state', e.target.value)} className={errors.state ? inputErrCls : inputCls}>
                      <option value="">Select State</option>
                      {states.map(s => <option key={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1.5">{errors.state}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Certificate Validity Date</label>
                    <input
                      type="date"
                      min={todayDateStr}
                      value={formData.certValidity}
                      onChange={e => {
                        const value = e.target.value;
                        setFormData(p => ({ ...p, certValidity: value }));
                        setErrors(p => ({
                          ...p,
                          certValidity: isPastDate(value) ? 'Certificate validity date cannot be in the past' : '',
                        }));
                      }}
                      className={errors.certValidity ? inputErrCls : inputCls}
                    />
                    {errors.certValidity && <p className="text-red-500 text-xs mt-1.5">{errors.certValidity}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Renewal Reminder <span className="text-gray-400 font-normal">(days before expiry)</span></label>
                    <input type="number" min="0" max="365" value={formData.reminderDays} onChange={e => u('reminderDays', digitsOnly(e.target.value, 3))} className={errors.reminderDays ? inputErrCls : inputCls} />
                    {errors.reminderDays && <p className="text-red-500 text-xs mt-1.5">{errors.reminderDays}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>
                      Registration Certificate
                    </label>

                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className={inputCls}
                      onChange={(e) => {
                        const valid = requirePdf(
                          e.target.files[0],
                          setRegistrationCertificate
                        );
                        if (valid === false) e.target.value = "";
                      }}
                    />

                    {/* Show existing file only in edit mode */}
                    {!registrationCertificate &&
                      existingData?.registrationCertificate && (
                        <div className="mt-2">
                          <a
                            href={existingData.registrationCertificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#E8630A] hover:underline"
                          >
                            📄 View current registration certificate
                          </a>
                        </div>
                      )}

                    {/* Show newly selected file */}
                    {registrationCertificate instanceof File && (
                      <p className="mt-2 text-sm text-green-600">
                        Selected: {registrationCertificate.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Practice Settings */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className={cardCls}>
                  <h3 className="text-base font-bold text-[#1A1D2E] mb-6">Practice Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelCls}>Consultation Fees (₹) <span className="text-[#E8630A]">*</span></label>
                      <input type="number" min="0" placeholder="e.g. 500" value={formData.fees} onChange={e => u('fees', digitsOnly(e.target.value, 6))} className={errors.fees ? inputErrCls : inputCls} />
                      {errors.fees && <p className="text-red-500 text-xs mt-1.5">{errors.fees}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Avg Consultation Duration (min)</label>
                      <input type="number" min="5" max="240" value={formData.avgDuration} onChange={e => u('avgDuration', digitsOnly(e.target.value, 3))} className={errors.avgDuration ? inputErrCls : inputCls} />
                      {errors.avgDuration && <p className="text-red-500 text-xs mt-1.5">{errors.avgDuration}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 p-5 bg-[#FAFAFA] border border-[#F3F4F6] rounded-2xl">
                    <div>
                      <div className="font-semibold text-[#1A1D2E] text-sm">Available for Emergency?</div>
                      <div className="text-xs text-gray-400 mt-0.5">{formData.emergency ? 'Available for emergencies' : 'Not available for emergencies'}</div>
                    </div>
                    <div
                      onClick={() => u('emergency', !formData.emergency)}
                      className="relative rounded-full cursor-pointer shrink-0 transition-colors"
                      style={{ width: '46px', height: '24px', backgroundColor: formData.emergency ? '#E8630A' : '#D1D5DB' }}
                    >
                      <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all" style={{ left: formData.emergency ? '23px' : '3px' }} />
                    </div>
                  </div>
                </div>

                <div className={cardCls}>
                  <h3 className="text-base font-bold text-[#1A1D2E] mb-6">Documents & Assets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelCls}>
                        Digital Signature
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        className={inputCls}
                        onChange={(e) => {
                          const file = e.target.files[0];

                          const valid = requireImage(
                            file,
                            setDigitalSignature
                          );

                          if (valid === false) e.target.value = "";
                        }}
                      />

                      {/* Existing uploaded signature */}
                      {!digitalSignature && existingData?.digitalSignature && (
                        <div className="mt-2">
                          <a
                            href={existingData.digitalSignature}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#E8630A] hover:underline"
                          >
                            🖊 View current signature
                          </a>
                        </div>
                      )}

                      {/* Newly selected image */}
                      {digitalSignature instanceof File && (
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            src={URL.createObjectURL(digitalSignature)}
                            alt="Signature Preview"
                            className="h-12 rounded border border-[#EAE5DC]"
                          />
                          <span className="text-sm text-green-600">
                            ✓ {digitalSignature.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>
                        Doctor Letterhead / Stamp PDF
                      </label>

                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className={inputCls}
                        onChange={(e) => {
                          const file = e.target.files[0];

                          const valid = requirePdf(file, setDoctorLetterhead);

                          if (valid === false) e.target.value = "";
                        }}
                      />

                      {/* Existing uploaded file */}
                      {!doctorLetterhead && existingData?.doctorLetterhead && (
                        <div className="mt-2">
                          <a
                            href={existingData.doctorLetterhead}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#E8630A] hover:underline"
                          >
                            📄 View current letterhead
                          </a>
                        </div>
                      )}

                      {/* Newly selected file */}
                      {doctorLetterhead instanceof File && (
                        <p className="mt-2 text-sm text-green-600">
                          ✓ {doctorLetterhead.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={cardCls}>
                  <h3 className="text-base font-bold text-[#1A1D2E] mb-1">Prescription Language(s)</h3>
                  <p className="text-sm text-gray-400 mb-5">Select languages for prescription writing.</p>
                  <div className="flex flex-wrap gap-2.5">
                    {languages.map(l => (
                      <div key={l} onClick={() => toggleLang(l)} className={chipCls(selectedLangs.includes(l))}>
                        <input type="checkbox" checked={selectedLangs.includes(l)} readOnly className="accent-[#E8630A]" />
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div className="px-10 py-5 flex items-center justify-between shrink-0 border-t border-[#F3F4F6]">
            <button
              onClick={() => activeStep > 0 ? setActiveStep(activeStep - 1) : onClose()}
              className="px-7 py-2.5 rounded-xl text-sm font-semibold border border-[#E5E7EB] text-[#374151] bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {activeStep > 0 ? '← Previous' : 'Cancel'}
            </button>
            <button
              disabled={isSubmitting || blockedByLimit || (activeStep === 0 && hasMissingDegreeCertificate()) || (activeStep === 1 && hasInvalidCertValidity())}
              onClick={() => {
                if (isSubmitting || blockedByLimit) return;
                if (activeStep === 0 && hasMissingDegreeCertificate()) return;
                if (activeStep === 1 && hasInvalidCertValidity()) return;
                if (!validateCurrentStep()) return;

                if (activeStep < steps.length - 1) {
                  setActiveStep(activeStep + 1);
                } else {
                  submitForm();
                }
              }}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors border-none
    ${(isSubmitting || blockedByLimit || (activeStep === 0 && hasMissingDegreeCertificate()) || (activeStep === 1 && hasInvalidCertValidity())) ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                backgroundColor: (isSubmitting || blockedByLimit || (activeStep === 0 && hasMissingDegreeCertificate()) || (activeStep === 1 && hasInvalidCertValidity())) ? "#C77B45" : "#E8630A",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && !blockedByLimit && !(activeStep === 0 && hasMissingDegreeCertificate()) && !(activeStep === 1 && hasInvalidCertValidity()))
                  e.currentTarget.style.backgroundColor = "#D05A09";
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && !blockedByLimit && !(activeStep === 0 && hasMissingDegreeCertificate()) && !(activeStep === 1 && hasInvalidCertValidity()))
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
              ) : activeStep < steps.length - 1 ? (
                "Next →"
              ) : isEdit ? (
                "✓ Update Doctor"
              ) : (
                "✓ Save Doctor Details"
              )}
            </button>
          </div>
        </div>
      </div>
      {isSubmitting && (
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
              {isEdit ? "Updating doctor..." : "Creating doctor..."}
            </span>
          </div>
        </div>
      )}
    </>
  );
}


// ── ViewProfile Modal ────────────────────────────────────────────────────────
function ViewProfileModal({ doctor, onClose, onEdit, onDelete }) {
  if (!doctor) return null;

  // console.log(doctor);


  const statItems = [

    { label: 'Experience', value: doctor.experience ? `${doctor.experience} years` : '—' },
    { label: 'Consultation Fees', value: doctor.fees ? `₹${doctor.fees}` : '—', cls: 'text-[#E8630A]' },
    { label: 'Avg Duration', value: doctor.avgDuration ? `${doctor.avgDuration} min` : '—' },
    { label: 'Emergency', value: doctor.emergency ? 'Available' : 'Not Available', cls: doctor.emergency ? 'text-green-500' : 'text-red-400' },
    { label: 'State', value: doctor.state || '—' },
  ];

  return (
    <div className="flex flex-col gap-5 overflow-y-auto">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
            style={{ background: `${doctor.color}20`, border: `2px solid ${doctor.color}50`, color: doctor.color }}>
            {doctor.initials}
          </div>
          <div>
            <h2 className="font-['Syne'] text-2xl font-bold text-[#1A1D2E]">{doctor.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{doctor.id}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E6F6EC] text-[#1E9E5A] border border-[#BFEBCF]">{doctor.status}</span>
              {doctor.degrees?.[0]?.degree && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E8630A]/10 text-[#E8630A]">{doctor.degrees[0].degree}</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer bg-transparent border-none">✕</button>
      </div>

      {/* Green highlight box — mirrors the mint "overview" panel style */}
      <div className="rounded-2xl p-5 sm:p-6 border" style={{ backgroundColor: '#EAF7F0', borderColor: '#CFEEDB' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#16261E' }}>
            <Stethoscope size={18} color="#fff" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1D2E]">Doctor Overview</h3>
            <p className="text-xs text-gray-500 mt-0.5">Key practice details at a glance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {statItems.map(item => (
            <div key={item.label} className="bg-white rounded-xl p-3.5 border border-[#CFEEDB]">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5">{item.label}</div>
              <div className={`text-sm font-bold ${item.cls || 'text-[#1A1D2E]'}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-[#EAE5DC]">
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Vet Council Registration</div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1A1D2E]">{doctor.regNumber || '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{doctor.state || '—'} Vet Council</p>
          </div>
          {doctor.certValidity && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Valid until</p>
              <p className="text-sm font-semibold text-[#1A1D2E] mt-0.5">{doctor.certValidity}</p>
            </div>
          )}
        </div>
      </div>

      {doctor.selectedSpecs?.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Specializations</div>
          <div className="flex flex-wrap gap-2">
            {doctor.selectedSpecs.map(s => (
              <span key={s} className="text-xs bg-[#E8630A]/10 text-[#E8630A] border border-[#E8630A]/20 px-3 py-1.5 rounded-lg font-semibold">{s}</span>
            ))}
          </div>
        </div>
      )}

      {doctor.selectedLangs?.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Prescription Languages</div>
          <div className="flex flex-wrap gap-2">
            {doctor.selectedLangs.map(l => (
              <span key={l} className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg font-semibold">{l}</span>
            ))}
          </div>
        </div>
      )}

      {(doctor.registrationCertificate || doctor.digitalSignature || doctor.doctorLetterhead || doctor.degrees?.some(d => d.degreeCertificate || d.existingCertificate)) && (
        <div>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Uploaded Documents</div>
          <div className="flex flex-col gap-2">
            {doctor.degrees?.map((d, i) => (
              (d.degreeCertificate || d.existingCertificate) && (
                <a
                  key={i}
                  href={d.degreeCertificate || d.existingCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#E8630A] hover:underline"
                >
                  📄 {d.degree || d.degreeName || `Degree ${i + 1}`} Certificate
                </a>
              )
            ))}
            {doctor.registrationCertificate && (
              <a href={doctor.registrationCertificate} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#E8630A] hover:underline">
                📄 Registration Certificate
              </a>
            )}
            {doctor.digitalSignature && (
              <a href={doctor.digitalSignature} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#E8630A] hover:underline">
                🖊 Digital Signature
              </a>
            )}
            {doctor.doctorLetterhead && (
              <a href={doctor.doctorLetterhead} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#E8630A] hover:underline">
                📄 Doctor Letterhead / Stamp
              </a>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-3 border-t border-[#EAE5DC]">
        <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1A1D2E] text-sm font-semibold rounded-xl cursor-pointer border-none transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function DoctorDetails() {
  // const [doctors, setDoctors] = useState(initialDoctors);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [maxDoctors, setMaxDoctors] = useState(null);
  useEffect(() => {
    fetchDoctors();
    fetchMaxDoctors();


  }, []);

  const fetchMaxDoctors = async () => {
    try {
      const res = await getCurrentSubscription();
      const limit = res?.data?.plan?.featureLimits?.maxDoctors;
      setMaxDoctors(Number.isFinite(limit) ? limit : null);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const response = await getDoctors();

      const doctorsData =
        response.doctors || response;

      const formattedDoctors =
        doctorsData.map((doc) => ({
          ...doc,

          // UI
          initials: getInitials(doc.name),
          color: "#E8630A",

          // Match form names
          regNumber:
            doc.registrationNumber,

          state:
            doc.stateVetCouncil,

          certValidity:
            doc.certificateValidityDate
              ?.split("T")[0] || "",

          reminderDays:
            doc.renewalReminderDays,

          fees:
            doc.consultationFees,

          avgDuration:
            doc.avgConsultationDuration,

          emergency:
            doc.emergencyAvailability,

          // Arrays
          selectedSpecs:
            doc.specializations || [],

          selectedLangs:
            doc.prescriptionLanguages || [],

          registrationCertificate:
            doc.registrationCertificate,

          digitalSignature:
            doc.digitalSignature,

          doctorLetterhead:
            doc.doctorLetterhead,

          status:
            doc.status || "Active",

          staffId:
            doc.staff?._id || doc.staff || "",
        }));



      setDoctors(formattedDoctors);
    } catch (error) {
      console.error(error);
      showToast("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };
  console.log(doctors);

  const closeModal = () => setModal(null);

  const handleDelete = async (doctorId) => {
    try {
      await deleteDoctor(doctorId);

      showToast({
        type: "success",
        title: "Doctor Deleted",
        description: "Doctor has been deleted successfully.",
      });

      await fetchDoctors();

      closeModal();
    } catch (err) {
      console.error(err);

      showToast({
        type: "error",
        title: "Delete Failed",
        description:
          err?.response?.data?.message || "Unable to delete doctor.",
      });
    }
  };

  const handleSave = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modal.type === "edit") {

        await updateDoctor(
          modal.doctor._id,
          formData
        );

        showToast({
          type: "success",
          title: "Doctor Updated",
          description: "Kennel Doctor have been updated successfully.",
        });


      } else {

        await createDoctor(formData);

        showToast({
          type: "success",
          title: "Doctor Created",
          description: "Doctor details have been created successfully.",
        });
      }

      await fetchDoctors();

      closeModal();

    } catch (error) {

      console.error(error);
      showToast({
        type: "error",
        title: "Operation Failed",
        description:
          error?.response?.data?.message || "Unable to save Doctor details. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const doctorLimitReached = Number.isFinite(maxDoctors) && doctors.length >= maxDoctors;

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.regNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.staffCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      doctor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  if (loading) {
    <div className="min-h-screen flex items-center justify-center p-6">
      <Loader />
    </div>
  }

  return (
    <div className="p-0 sm:p-4 lg:p-6 bg-white min-h-screen">
      {toast && (
        <div className="fixed top-5 right-5 z-2000 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-semibold text-white bg-[#E8630A] flex items-center gap-2">
          ✓ {toast}
        </div>
      )}

      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <DoctorForm
          onClose={closeModal}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          existingData={modal.doctor}
          isEdit={modal.type === 'edit'}
          doctorLimitReached={doctorLimitReached}
          maxDoctors={maxDoctors}
        />
      )}

      {modal?.type === 'view' && (
        <div className="fixed inset-0 bg-[#1A1D2E]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl overflow-y-auto p-5 sm:p-8 lg:p-10"
            style={{ width: 'min(700px, 95vw)', maxHeight: '92vh' }}
          >
            <ViewProfileModal
              doctor={modal.doctor}
              onClose={closeModal}
              onDelete={handleDelete}
              onEdit={() => { closeModal(); setTimeout(() => setModal({ type: 'edit', doctor: modal.doctor }), 50); }}
            />
          </div>
        </div>
      )}

      {/* Page Header — mint/green panel, mirrors the "Clinic Management" overview card */}
      <div
        className="rounded-2xl p-5 sm:p-6 mb-6 border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
        style={{ backgroundColor: '#EAF7F0', borderColor: '#CFEEDB' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#16261E' }}>
            <Stethoscope size={20} color="#fff" />
          </div>
          <div>
            <h2 className="font-['Syne'] text-2xl font-bold text-[#1A1D2E]">Doctor Details</h2>
            <p className="text-gray-500 text-sm mt-1">Manage doctor profiles, qualifications & practice settings</p>
            {doctorLimitReached && (
              <p className="text-red-600 text-xs font-semibold mt-1.5">
                Maximum of {maxDoctors} doctor{maxDoctors === 1 ? '' : 's'} reached for your current plan. Upgrade your plan to add more.
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setModal({ type: 'add' })}
          disabled={doctorLimitReached}
          title={doctorLimitReached ? `Maximum of ${maxDoctors} doctor(s) reached for your current plan.` : undefined}
          className={`text-white text-sm font-semibold px-6 py-3 rounded-xl border-none transition-colors shrink-0 ${doctorLimitReached ? "bg-gray-300 cursor-not-allowed" : "bg-[#E8630A] hover:bg-[#D05A09] cursor-pointer"}`}
        >
          + Add Doctor Details
        </button>
      </div>

      {/* ==================== Filter Bar ==================== */}
      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl shadow-sm p-5 sm:p-6 mb-10">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

          {/* Left Side */}
          <div className="flex flex-col md:flex-row gap-4 flex-1">

            {/* Search */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#6B7280] mb-2 tracking-wide">
                Search
              </label>

              <input
                type="text"
                placeholder="Search by doctor name, staff ID or registration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full
                  h-12
                  rounded-xl
                  border border-[#E5E7EB]
                  bg-white
                  px-4
                  text-sm
                  text-[#1A1D2E]
                  placeholder:text-gray-400
                  outline-none
                  transition-all
                  focus:border-[#E8630A]
                  focus:ring-2
                  focus:ring-[#E8630A]/20
                "
              />
            </div>

            {/* Status */}
            <div className="w-full md:w-56">
              <label className="block text-xs font-semibold text-[#6B7280] mb-2 tracking-wide">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="
                  w-full
                  h-12
                  rounded-xl
                  border border-[#E5E7EB]
                  bg-white
                  px-4
                  text-sm
                  text-[#1A1D2E]
                  outline-none
                  transition-all
                  focus:border-[#E8630A]
                  focus:ring-2
                  focus:ring-[#E8630A]/20
                "
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

          </div>

          {/* Right Side */}
          <div className="flex items-center self-end">
            <div className="border rounded-xl px-3 py-2 w-[118px] h-[60px] flex flex-col justify-center" style={{ backgroundColor: '#EAF7F0', borderColor: '#CFEEDB' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Total Doctors
              </p>

              <h3 className="mt-0.5 text-xl font-bold text-[#E8630A] leading-none">
                {filteredDoctors.length}
              </h3>
            </div>
          </div>

        </div>
      </div>
      {/* Doctors Table */}
      <div className="bg-white border border-[#EAE5DC] rounded-2xl overflow-hidden shadow-sm">
        {doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-[#E8630A]/10 flex items-center justify-center mb-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-[#E8630A]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5V4H2v16h5m10 0v-4a3 3 0 00-3-3H10a3 3 0 00-3 3v4m10 0H7m8-12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-[#1A1D2E]">
              No Doctors Added Yet
            </h3>

            <p className="mt-3 text-sm text-gray-500 max-w-md text-center leading-7">
              Your clinic doesn't have any registered doctors yet.
              Start by adding your first doctor's professional profile.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#FAFAFA] border-b border-[#EAE5DC]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500">
                    <div className="flex items-center gap-2">
                      Doctor
                    </div>
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500">
                    <div className="flex items-center gap-2">
                      Experience
                    </div>
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500">
                    <div className="flex items-center gap-2">
                      Fees
                    </div>
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500">
                    <div className="flex items-center gap-2">
                      Emergency
                    </div>
                  </th>

                
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold  tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDoctors.map((d) => (
                  <tr
                    key={d._id}
                    className="border-b border-[#F3F4F6] hover:bg-[#FCFCFC] transition-colors"
                  >
                    {/* Doctor */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-bold"
                          style={{
                            background: `${d.color}20`,
                            border: `2px solid ${d.color}40`,
                            color: d.color,
                          }}
                        >
                          <Stethoscope size={20} />
                        </div>

                        <div>
                          <div className="font-semibold text-[#1A1D2E]">
                            {d.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="px-6 py-5 text-sm font-medium text-gray-700">
                      {d.experience} yrs
                    </td>

                    {/* Fees */}
                    <td className="px-6 py-5">
                      <span className="font-semibold text-[#E8630A]">
                        ₹{d.fees}
                      </span>
                    </td>

                    {/* Emergency */}
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          d.emergency
                            ? "bg-[#E6F6EC] text-[#1E9E5A]"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {d.emergency ? "Available" : "Unavailable"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#E6F6EC', color: '#1E9E5A' }}>
                        {d.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => setModal({ type: "view", doctor: d })}
                          className="w-9 h-9 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center cursor-pointer"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => setModal({ type: "edit", doctor: d })}
                          className="w-9 h-9 rounded-lg border border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100 transition flex items-center justify-center cursor-pointer"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(d._id)}
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
    </div>
  );
}