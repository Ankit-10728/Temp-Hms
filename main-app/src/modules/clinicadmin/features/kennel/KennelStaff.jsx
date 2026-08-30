import {
  useEffect,
  useState,
  useRef,
} from "react";

import { getStaff } from "../../api/staffApi";

import {
  getKennels,
  createKennel,
  updateKennel,
  deleteKennel,
  toggleKennelStatus,
} from "../../api/kennelApi";

import { showToast } from "../../../../shared/components/toast"

// ─── Mock data (replace with your imports) ───────────────────────────────────
const kennel_species = ["Dog",
  "Cat",
  "Bird",
  "Rabbit",
  "Hamster",
  "Guinea Pig",
  "Reptile",
  "Fish",];
const kennel_shifts = [
  "Day",
  "Night",
  "Rotating"
];

const COLORS = ['#F97316', '#10B981', '#6366F1', '#A855F7', '#06B6D4', '#EF4444', '#F59E0B'];
const mkInitials = (name) => name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

// ─── File Upload Zone ─────────────────────────────────────────────────────────
function FileUploadZone({ uploadedFiles, setUploadedFiles, label = 'Upload File' }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);

  const process = (files) => {
    const valid = Array.from(files).filter(f => f.type === 'application/pdf' || f.type.startsWith('image/'));
    const big = valid.filter(f => f.size > 10 * 1024 * 1024);
    if (big.length) alert(`${big.length} file(s) exceed 10 MB and were skipped.`);
    const ok = valid.filter(f => f.size <= 10 * 1024 * 1024).map(f => ({
      file: f, name: f.name, size: f.size, type: f.type,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setUploadedFiles(prev => [...prev, ...ok]);
  };

  const remove = (i) => setUploadedFiles(prev => {
    const next = [...prev];
    if (next[i].preview) URL.revokeObjectURL(next[i].preview);
    next.splice(i, 1);
    return next;
  });

  const fmt = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); process(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 select-none
          ${dragging ? 'border-orange-400 bg-orange-50 scale-[1.01]' : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50'}`}
      >
        <div className="text-3xl mb-2">📎</div>
        <p className="text-sm font-semibold text-orange-500 mb-1">{dragging ? 'Drop files here' : label}</p>
        <p className="text-xs text-gray-400">PDF or image · up to 10 MB per file</p>
        <input ref={ref} type="file" accept=".pdf,image/*" multiple className="hidden"
          onChange={(e) => { process(e.target.files); e.target.value = ''; }} />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {uploadedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2.5 shadow-sm">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-gray-100">
                {f.preview ? <img src={f.preview} alt={f.name} className="w-full h-full object-cover" /> : <span className="text-xl">📄</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-800 truncate font-semibold">{f.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{fmt(f.size)}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); remove(i); }}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors text-xs font-bold shrink-0 cursor-pointer border-0">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ value, onChange, label, sub }) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 shrink-0 ${value ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      <h3 className="font-bold text-gray-900 mb-5 mt-0" style={{ fontFamily: 'Syne, sans-serif', fontSize: 15 }}>{title}</h3>
      {children}
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ staff, onClose }) {
  return (
    <div className="font-sans">
      <div className="flex justify-between items-start mb-7 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3.5">
          <div className="rounded-full flex items-center justify-center font-bold shrink-0"
            style={{
              background: "#FFF7ED",
              border: "2px solid #FDBA74",
              color: "#EA580C"
            }}            >
            {staff.staffId?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 m-0" style={{ fontFamily: 'Syne, sans-serif' }}>{staff.staffId?.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{staff.staffId?.employeeId} · {staff.experience} years experience</p>
          </div>
        </div>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer">✕</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Employee ID', value: staff.id },
          { label: 'Experience', value: `${staff.experience} Years` },
          { label: 'Shift', value: staff.shift },
          { label: 'Status', value: staff.status },
          { label: 'First Aid', value: staff.firstAidCertified ? '✓ Certified' : '✗ Not Certified' },
          { label: 'Medication', value: staff.canAdministerMedication ? '✓ Can Administer' : '✗ Cannot Administer' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3.5">
            <div className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">{label.toUpperCase()}</div>
            <div className="text-sm font-semibold text-gray-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="text-[10px] font-bold text-gray-400 tracking-widest mb-2">SPECIES COMFORTABLE WITH</div>
        <div className="flex flex-wrap gap-1.5">
          {staff.speciesComfortableWith?.map((s) => (
            <span
              key={s}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                background: "rgba(249,115,22,0.1)",
                color: "#F97316",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-7">
        <button onClick={onClose} className="bg-white text-gray-700 border border-gray-200 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer">Close</button>
      </div>
    </div>
  );
}

// ─── Kennel Form ──────────────────────────────────────────────────────────────
function KennelForm({ onClose, editData, onSave }) {

  console.log("Edit Data:", editData);
  const [name, setName] = useState(editData?.name || '');
  const [experience, setExperience] =
    useState(editData?.experience || '');

  const [shift, setShift] =
    useState(editData?.shift || '');

  const [selectedSpecies, setSelectedSpecies] =
    useState(
      editData?.speciesComfortableWith || []
    );

  const [firstAid, setFirstAid] =
    useState(
      editData?.firstAidCertified ?? false
    );

  const [canMedicate, setCanMedicate] =
    useState(
      editData?.canAdministerMedication ?? false
    );

  const [firstAidFiles, setFirstAidFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [staffId, setStaffId] = useState(
    editData?.staffId?._id || ""
  );
  const [staffOptions, setStaffOptions] = useState([]);


  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await getStaff();

      console.log("Staff API Response:", res);

      setStaffOptions(res.data);
      console.log("***", res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const inputCls = "w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 bg-white outline-none transition-colors focus:border-orange-400 appearance-none";
  const errCls = (k) => errors[k] ? 'border-red-400' : 'border-gray-200';

  const toggle = (list, setList, item) =>
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

  const validate = () => {
    const e = {};
    if (!staffId)
      e.staffId =
        "Please select staff";
    if (!experience || isNaN(experience) || Number(experience) < 0) e.experience = 'Valid experience required';
    if (!shift) e.shift = 'Please select a shift';
    if (selectedSpecies.length === 0) e.species = 'Select at least one species';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      staffId,

      experience: Number(experience),

      shift,

      firstAidCertified: firstAid,

      canAdministerMedication: canMedicate,

      speciesComfortableWith: selectedSpecies,

      firstAidCertificate:
        firstAidFiles?.[0] || null,
    };

    try {
      if (editData) {
        await updateKennel(
          editData._id,
          payload
        );
        showToast({
          type: "success",
          title: "Kennel Updated",
          description: "Kennel details have been updated successfully.",
        });
      } else {
        await createKennel(
          payload
        );
        showToast({
          type: "success",
          title: "Kennel Created",
          description: "Kennel details have been created successfully.",
        });
      }

      onClose();


    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Operation Failed",
        description: "Unable to save kennel details. Please try again.",
      });
    }

  };

  return (
    <div className="flex flex-col h-full font-sans">

      {/* Header */}
      <div className="px-5 sm:px-8 pt-6 sm:pt-7 shrink-0">
        <div className="flex justify-between items-start gap-4 mb-5">
          <div>
            <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-2"
              style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', letterSpacing: '0.03em' }}>
              Show Only when role is Kennel (Requires Kennel module enabled)
            </span>
            <h2 className="text-2xl font-bold text-gray-900 m-0" style={{ fontFamily: 'Syne, sans-serif' }}>
              {editData ? 'Edit Kennel Staff Details' : 'Add Kennel Staff Details'}
            </h2>
            <p className="text-sm text-gray-500 mt-1 mb-0">
              {editData ? `Editing profile for ${editData?.staffId?.name} ` : 'Register kennel staff capabilities & certifications'}
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 text-lg transition-colors cursor-pointer shrink-0 ml-4">✕</button>
        </div>
        <div className="border-b border-gray-100" />
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 sm:py-6 flex flex-col gap-5">

        {/* Section 1 — Identity */}
        <SectionCard title="6.1 Kennel Staff Identity & Experience">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Staff Member
                <span className="text-red-400">*</span>
              </label>

              <select
                className={`${inputCls} ${errCls('staffId')}`}
                value={staffId}
                onChange={(e) => {
                  setStaffId(e.target.value);

                  setErrors((p) => ({
                    ...p,
                    staffId: "",
                  }));
                }}
              >
                <option value="">
                  Select Staff Member
                </option>

                {staffOptions?.map((staff) => (
                  <option
                    key={staff._id}
                    value={staff._id}
                  >
                    {staff.personalInfo?.fullName} ({staff.employmentInfo?.staffId})
                  </option>
                ))}
              </select>

              {errors.staffId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.staffId}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Experience in Years <span className="text-red-400">*</span></label>
              <input className={`${inputCls} ${errCls('experience')}`} type="number" min="0" placeholder="e.g. 3"
                value={experience} onChange={e => { setExperience(e.target.value); setErrors(p => ({ ...p, experience: '' })); }} />
              {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shift <span className="text-red-400">*</span></label>
              <div className="relative">
                <select className={`${inputCls} pr-9 cursor-pointer ${errCls('shift')}`}
                  value={shift} onChange={e => { setShift(e.target.value); setErrors(p => ({ ...p, shift: '' })); }}>
                  <option value="">Select Shift</option>
                  {kennel_shifts.map(s => <option key={s}>{s}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
              {errors.shift && <p className="text-xs text-red-500 mt-1">{errors.shift}</p>}
            </div>
          </div>
        </SectionCard>

        {/* Section 2 — Capabilities */}
        <SectionCard title="Capabilities & Certifications">
          <div className="flex flex-col gap-3">
            <Toggle
              value={firstAid}
              onChange={setFirstAid}
              label="First-Aid Certified?"
              sub="Toggle on to upload the certificate document"
            />
            {firstAid && (
              <div className="pl-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  First-Aid Certificate <span className="font-normal text-gray-400">(PDF or image)</span>
                </label>
                <FileUploadZone
                  uploadedFiles={firstAidFiles}
                  setUploadedFiles={setFirstAidFiles}
                  label="Click to upload or drag & drop"
                />
              </div>
            )}
            <Toggle
              value={canMedicate}
              onChange={setCanMedicate}
              label="Can Administer Medication?"
            />
          </div>
        </SectionCard>

        {/* Section 3 — Species */}
        <SectionCard title="Species Comfortable With">
          <div className="flex flex-wrap gap-2">
            {kennel_species.map(s => {
              const active = selectedSpecies.includes(s);
              return (
                <label key={s} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg cursor-pointer text-sm transition-all border
                  ${active
                    ? 'font-semibold border-orange-400 bg-orange-50 text-orange-500'
                    : 'font-normal border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-200 hover:bg-orange-50'}`}>
                  <input type="checkbox" checked={active} className="w-3.5 h-3.5 accent-orange-500"
                    onChange={() => { toggle(selectedSpecies, setSelectedSpecies, s); setErrors(p => ({ ...p, species: '' })); }} />
                  {s}
                </label>
              );
            })}
          </div>
          {errors.species && <p className="text-xs text-red-500 mt-2">{errors.species}</p>}
        </SectionCard>

      </div>

      {/* Footer */}
      <div className="px-5 sm:px-8 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5 shrink-0 bg-white rounded-b-2xl">
        <button onClick={onClose}
          className="bg-white text-gray-700 border border-gray-200 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
          Cancel
        </button>
        <button onClick={handleSave}
          className="text-white rounded-lg px-5 py-2.5 text-sm font-semibold border-0 hover:opacity-90 transition-opacity cursor-pointer"
          style={{ background: '#F97316' }}>
          Save Kennel Details
        </button>
      </div>
    </div>
  );
}

// ─── Main KennelStaff Page ────────────────────────────────────────────────────
export default function KennelStaff() {
  const [staff, setStaff] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [viewStaff, setViewStaff] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchKennels();
  }, []);


  const fetchKennels = async () => {
    try {
      const res = await getKennels();

      setStaff(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const closeAll = () => { setShowAdd(false); setEditStaff(null); setViewStaff(null); };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = (data, isEdit) => {
    if (isEdit) {
      setStaff(prev => prev.map(s => s.id === data.id ? data : s));
      showToast(`✓ ${data.name}'s details updated successfully`);
    } else {
      setStaff(prev => [...prev, data]);
      showToast(`✓ ${data.name} added as kennel staff`);
    }
  };

  return (
    <div className="p-0 sm:p-4 lg:p-7 bg-white min-h-screen font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-9999 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Form Modal */}
      {(showAdd || !!editStaff) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
          style={{ background: 'rgba(17,24,39,0.45)' }} onClick={closeAll}>
          <div className="bg-white rounded-2xl w-full flex flex-col overflow-hidden"
            style={{ maxWidth: 1500, height: '88vh', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}>
            <KennelForm onClose={closeAll} editData={editStaff} onSave={handleSave} />
          </div>
        </div>
      )}

      {/* View Modal */}
      {!!viewStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(17,24,39,0.45)' }} onClick={closeAll}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-8"
            style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}>
            <ViewModal staff={viewStaff} onClose={closeAll} />
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 m-0" style={{ fontFamily: 'Syne, sans-serif' }}>Kennel Staff</h2>
          <p className="text-sm text-gray-500 mt-1 mb-0">Manage kennel staff capabilities & certifications</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditStaff(null); }}
          className="text-white rounded-lg px-5 py-2.5 text-sm font-semibold border-0 hover:opacity-90 transition-opacity cursor-pointer"
          style={{ background: '#F97316' }}>
          + Add Kennel Details
        </button>
      </div>

      {/* Cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' }}>
        {staff.map(k => (
          <div key={k._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200">

            {/* Card Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="rounded-full flex items-center justify-center font-bold shrink-0 bg-orange-100 text-orange-600"
                style={{
                  width: 44,
                  height: 44,
                  fontSize: 14,
                }}
              >
                {k.staffId?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{k.staffId?.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{k.staffId?.employeeId} · {k.experience} yrs exp</div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${k.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {k.status}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <div className="text-[9px] font-bold text-gray-400 tracking-wider mb-1">SHIFT</div>
                <div className="text-[11px] font-semibold leading-tight" style={{ color: '#F97316' }}>{k.shift.split(' ')[0]}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <div className="text-[9px] font-bold text-gray-400 tracking-wider mb-1">FIRST AID</div>
                <div className={`text-[11px] font-semibold ${k.firstAidCert ? 'text-green-600' : 'text-red-500'}`}>
                  {k.firstAidCertified ? '✓ Yes' : '✗ No'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <div className="text-[9px] font-bold text-gray-400 tracking-wider mb-1">MEDICATE</div>
                <div className={`text-[11px] font-semibold ${k.canMedicate ? 'text-green-600' : 'text-red-500'}`}>
                  {k.canAdministerMedication ? '✓ Yes' : '✗ No'}
                </div>
              </div>
            </div>

            {/* Species */}
            <div className="mb-4">
              <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">SPECIES COMFORTABLE WITH</div>
              <div className="flex flex-wrap gap-1">
                {k.speciesComfortableWith?.map(s => (
                  <span key={s} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-xl"
                    style={{ background: 'rgba(249,115,22,0.08)', color: '#F97316' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3.5 border-t border-gray-100">
              <button onClick={() => setViewStaff(k)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
                👁 View
              </button>
              <button onClick={() => { setEditStaff(k); setShowAdd(false); }}
                className="flex-1 rounded-lg py-2 text-xs font-semibold border transition-colors cursor-pointer"
                style={{ background: 'rgba(249,115,22,0.06)', borderColor: 'rgba(249,115,22,0.25)', color: '#F97316' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(249,115,22,0.06)'}>
                ✏️ Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
