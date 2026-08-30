import { useState, useRef } from 'react';
import { showToast } from '../../../../shared/components/toast';
import { useEffect } from 'react';
import {
  getGroomerById,
  getGroomers,
  createGroomer,
  updateGroomer,
  deleteGroomer
} from '../../api/groomerApi';
// ─── Mock data (replace with your imports) ───────────────────────────────────
const species = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Guinea Pig', 'Reptile'];
const groomingServices = ['Bath & Dry', 'Haircut', 'Nail Trim', 'Ear Cleaning', 'Teeth Brushing', 'De-shedding', 'Flea Treatment', 'Full Groom'];
const certTypes = [
  "Certificate",
  "Diploma",
  "Training Course",
  "Workshop",
  "Other",
];
const shifts = ["Full Day", "Half Day", "Weekends"];

const groomers = [
  { id: 'GRM-001', name: 'Sarah Mitchell', initials: 'SM', color: '#A855F7', experience: 6, shift: 'Morning', certified: true, status: 'Active', species: ['Dog', 'Cat', 'Rabbit'], services: ['Bath & Dry', 'Haircut', 'Nail Trim'] },
  { id: 'GRM-002', name: 'James Rivera', initials: 'JR', color: '#E8630A', experience: 3, shift: 'Afternoon', certified: false, status: 'Active', species: ['Dog', 'Bird'], services: ['Full Groom', 'De-shedding'] },
  { id: 'GRM-003', name: 'Priya Nair', initials: 'PN', color: '#06B6D4', experience: 8, shift: 'Full Day', certified: true, status: 'Inactive', species: ['Cat', 'Hamster', 'Guinea Pig'], services: ['Bath & Dry', 'Ear Cleaning', 'Teeth Brushing'] },
];

// ─── File Upload Zone ─────────────────────────────────────────────────────────
function FileUploadZone({ uploadedFiles, setUploadedFiles }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    const all = Array.from(files).filter(
      f => f.type === 'application/pdf' || f.type.startsWith('image/')
    );
    const oversized = all.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length) alert(`${oversized.length} file(s) exceed 10 MB and were skipped.`);
    const allowed = all.filter(f => f.size <= 10 * 1024 * 1024);
    const withMeta = allowed.map(f => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setUploadedFiles(prev => [...prev, ...withMeta]);
  };

  const removeFile = (idx) => {
    setUploadedFiles(prev => {
      const updated = [...prev];
      if (updated[idx].preview) URL.revokeObjectURL(updated[idx].preview);
      updated.splice(idx, 1);
      return updated;
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 select-none
          ${isDragging
            ? 'border-orange-400 bg-orange-50 scale-[1.01]'
            : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50'
          }`}
      >
        <div className="text-3xl mb-2">📎</div>
        <p className="text-sm font-semibold text-orange-500 mb-1">
          {isDragging ? 'Drop files here' : 'Click to upload or drag & drop'}
        </p>
        <p className="text-xs text-gray-400">PDF or image · up to 10 MB per file · multiple files allowed</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {uploadedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2.5 shadow-sm">
              {/* Thumbnail or PDF icon */}
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-100">
                {f.preview
                  ? <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                  : <span className="text-xl">📄</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-800 truncate font-semibold">{f.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatSize(f.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors text-xs font-bold flex-shrink-0 cursor-pointer border-0"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ groomer, onClose }) {
  return (
    <div className="font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-7 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3.5">
          <div
            className="rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{ width: 52, height: 52, background: `${groomer.color}22`, border: `2px solid ${groomer.color}55`, color: groomer.color, fontSize: 16 }}
          >{groomer.initials}</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 m-0" style={{ fontFamily: 'Syne, sans-serif' }}>{groomer.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{groomer.id} · {groomer.experience} years experience</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors text-base cursor-pointer"
        >✕</button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Employee ID', value: groomer.id },
          { label: 'Experience', value: `${groomer.experience} Years` },
          { label: 'Shift', value: groomer.shift },
          { label: 'Status', value: groomer.status },
          { label: 'Certified', value: groomer.certified ? '✓ Yes – Certified' : '✗ Not Certified' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3.5">
            <div className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">{label.toUpperCase()}</div>
            <div className="text-sm font-semibold text-gray-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Species */}
      <div className="mt-5">
        <div className="text-[10px] font-bold text-gray-400 tracking-widest mb-2">SPECIES HANDLED</div>
        <div className="flex flex-wrap gap-1.5">
          {groomer.species.map(s => (
            <span key={s} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7' }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="mt-4">
        <div className="text-[10px] font-bold text-gray-400 tracking-widest mb-2">SERVICES OFFERED</div>
        <div className="flex flex-wrap gap-1.5">
          {groomer.services.map(s => (
            <span key={s} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(232,99,10,0.1)', color: '#E8630A' }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-7">
        <button
          onClick={onClose}
          className="bg-white text-gray-700 border border-gray-200 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
        >Close</button>
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

// ─── Groomer Form ─────────────────────────────────────────────────────────────
function GroomerForm({ onClose, editData, onSave }) {
  const [selectedSpecies, setSelectedSpecies] = useState(editData?.species || []);
  const [selectedServices, setSelectedServices] = useState(editData?.services || []);
  const [certs, setCerts] = useState(
    editData?.certificates?.length
      ? editData.certificates
      : [{ type: "" }]
  );
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const toggleItem = (list, setList, item) =>
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

  const [formData, setFormData] = useState({
    experience: editData?.experience || "",
    shift: editData?.shift || "",
  });

  const handleSubmit = () => {
    const payload = {
      experience: Number(formData.experience),
      shift: formData.shift,
      species: selectedSpecies,
      services: selectedServices,
      certificates: certs,
      documents: uploadedFiles.map(file => file.file),
    };

    console.log(payload);
    onSave(payload);
  };
  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white outline-none transition-colors focus:border-orange-400 appearance-none";

  return (
    <div className="flex flex-col h-full font-sans">

      {/* ── Modal Header ── */}
      <div className="px-5 sm:px-8 pt-6 sm:pt-7 flex-shrink-0">
        <div className="flex justify-between items-start gap-4 mb-5">
          <div>
            <span
              className="inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-2"
              style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7', letterSpacing: '0.03em' }}
            >
              Show Only when role is Groomer (Requires Grooming module enabled)
            </span>
            <h2 className="text-2xl font-bold text-gray-900 m-0" style={{ fontFamily: 'Syne, sans-serif' }}>
              {editData ? 'Edit Groomer Details' : 'Add Groomer Details'}
            </h2>
            <p className="text-sm text-gray-500 mt-1 mb-0">
              {editData ? `Editing profile for ${editData.name}` : 'Register grooming staff skills & service capabilities'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 text-lg transition-colors cursor-pointer flex-shrink-0 ml-4"
          >✕</button>
        </div>
        <div className="border-b border-gray-100" />
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 sm:py-6 flex flex-col gap-5">

        {/* Section 1 — Basic Info */}
        <SectionCard title="4.1 Grooming Skills & Experience">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Experience in Years</label>
              <input
                className={inputCls}
                type="number"
                placeholder="e.g. 4"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experience: e.target.value
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Availability / Shift</label>
              <div className="relative">
                <select
                  className={inputCls + " pr-9 cursor-pointer"}
                  value={formData.shift}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shift: e.target.value
                    })
                  }
                >                  <option value="">Select Shift</option>
                  {shifts.map(s => <option key={s}>{s}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Section 2 — Certificates */}
        <SectionCard title="Certificates & Training">
          <div className="flex flex-col gap-2.5 mb-3">
            {certs.map((c, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
                <div className="relative flex-1">
                  <select
                    className={inputCls + " pr-9 cursor-pointer"}
                    value={c.type}
                    onChange={(e) => {
                      const updated = [...certs];
                      updated[i].type = e.target.value;
                      setCerts(updated);
                    }}
                  >                    <option value="">Select Certificate Type</option>
                    {certTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                </div>
                {i > 0 && (
                  <button
                    onClick={() => setCerts(certs.filter((_, j) => j !== i))}
                    className="px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
                  >✕ Remove</button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setCerts([...certs, { type: '' }])}
            className="mb-5 px-4 py-2 rounded-lg text-xs font-semibold border bg-white hover:bg-orange-50 transition-colors cursor-pointer"
            style={{ color: '#E8630A', borderColor: '#E8630A' }}
          >+ Add Certificate Row</button>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Certificate Document <span className="font-normal text-gray-400">(PDF or image)</span>
            </label>
            <FileUploadZone uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
          </div>
        </SectionCard>

        {/* Section 3 — Species */}
        <SectionCard title="Species Handled">
          <div className="flex flex-wrap gap-2">
            {species.map(s => {
              const active = selectedSpecies.includes(s);
              return (
                <label
                  key={s}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg cursor-pointer text-sm transition-all border
                    ${active
                      ? 'font-semibold border-purple-400 bg-purple-50 text-purple-600'
                      : 'font-normal border-gray-200 bg-gray-50 text-gray-600 hover:border-purple-200 hover:bg-purple-50'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleItem(selectedSpecies, setSelectedSpecies, s)}
                    className="w-3.5 h-3.5 accent-purple-500"
                  />
                  {s}
                </label>
              );
            })}
          </div>
        </SectionCard>

        {/* Section 4 — Services */}
        <SectionCard title="Grooming Services Offered">
          <div className="flex flex-wrap gap-2">
            {groomingServices.map(s => {
              const active = selectedServices.includes(s);
              return (
                <label
                  key={s}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg cursor-pointer text-sm transition-all border
                    ${active
                      ? 'font-semibold border-orange-400 bg-orange-50 text-orange-500'
                      : 'font-normal border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-200 hover:bg-orange-50'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleItem(selectedServices, setSelectedServices, s)}
                    className="w-3.5 h-3.5 accent-orange-500"
                  />
                  {s}
                </label>
              );
            })}
          </div>
        </SectionCard>

      </div>

      {/* ── Sticky Footer ── */}
      <div className="px-5 sm:px-8 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5 flex-shrink-0 bg-white rounded-b-2xl">
        <button
          onClick={onClose}
          className="bg-white text-gray-700 border border-gray-200 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
        >Cancel</button>
        <button
          onClick={handleSubmit}
          className="text-white rounded-lg px-5 py-2.5 text-sm font-semibold border-0 hover:opacity-90 transition-opacity cursor-pointer"
          style={{ background: '#E8630A' }}
        >Save Groomer Details</button>
      </div>
    </div>
  );
}

// ─── Main Groomer Page ────────────────────────────────────────────────────────
export default function Groomer() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGroomer, setEditGroomer] = useState(null);
  const [viewGroomer, setViewGroomer] = useState(null);

  const [groomers, setGroomers] = useState([]);


  useEffect(() => {
    fetchGroomers();
  }, []);

  const fetchGroomers = async () => {
    try {
      const response = await getGroomers();
      setGroomers(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }; const handleOpenCreate = () => {
    setShowAddModal(true);
    setEditGroomer(null);
    setViewGroomer(null);
  };

  const handleOpenEdit = (groomer) => {
    setEditGroomer(groomer);
    setShowAddModal(false);
    setViewGroomer(null);
  };

  const handleOpenView = (groomer) => {
    setViewGroomer(groomer);
    setShowAddModal(false);
    setEditGroomer(null);
  };
  const handleSave = async (form) => {
    try {
      if (editGroomer) {
        await updateGroomer(editGroomer._id, form);
        showToast({
          type: "success",
          title: "Groomer Updated",
          description: "Groomer details have been updated successfully.",
        });
      } else {
        await createGroomer(form);
        showToast({
          type: "success",
          title: "Groomer Created",
          description: "Groomer details have been created successfully.",
        });
      }

      await fetchGroomers();
      closeAll();
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Operation Failed",
        description: "Unable to save Groomer details. Please try again.",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGroomer(id);
      await fetchGroomers();
    } catch (error) {
      console.error(error);
    }
  };



  const closeAll = () => { setShowAddModal(false); setEditGroomer(null); setViewGroomer(null); };

  const isFormOpen = showAddModal || !!editGroomer;
  const isViewOpen = !!viewGroomer;

  return (
    <div className="p-0 sm:p-4 lg:p-7 bg-white min-h-screen font-sans">

      {/* ── Form Modal (Add / Edit) ── */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
          style={{ background: 'rgba(17,24,39,0.45)' }}
          onClick={closeAll}
        >
          <div
            className="bg-white rounded-2xl w-full flex flex-col overflow-hidden"
            style={{ maxWidth: 1500, height: '88vh', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}
          >
            <GroomerForm onClose={closeAll} editData={editGroomer} onSave={handleSave} />
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {isViewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(17,24,39,0.45)' }}
          onClick={closeAll}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg p-8"
            style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}
          >
            <ViewModal groomer={viewGroomer} onClose={closeAll} />
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 m-0" style={{ fontFamily: 'Syne, sans-serif' }}>Groomer</h2>
          <p className="text-sm text-gray-500 mt-1 mb-0">Manage grooming staff skills & service capabilities</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="text-white rounded-lg px-5 py-2.5 text-sm font-semibold border-0 hover:opacity-90 transition-opacity cursor-pointer"
          style={{ background: '#E8630A' }}
        >
          + Add Groomer Details
        </button>
      </div>

      {/* ── Groomer Cards ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' }}>
        {groomers.map(g => (
          <div
            key={g._id}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200"
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ width: 44, height: 44, background: `${g.color}18`, border: `2px solid ${g.color}44`, color: g.color }}
              >{g.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{g.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{g.id} · {g.experience} yrs exp</div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0
                ${g.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {g.status}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3.5">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-1">SHIFT</div>
                <div className="text-xs font-semibold" style={{ color: '#A855F7' }}>{g.shift}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-1">CERTIFIED</div>
                <div className={`text-xs font-semibold ${g.certified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {g.certified ? '✓ Yes' : '✗ No'}
                </div>
              </div>
            </div>

            {/* Species */}
            <div className="mb-2.5">
              <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">SPECIES HANDLED</div>
              <div className="flex flex-wrap gap-1">
                {g.species.map((s, i) => (
                  <span key={`${s}-${i}`} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-xl"
                    style={{ background: 'rgba(168,85,247,0.08)', color: '#A855F7' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="mb-4">
              <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">SERVICES OFFERED</div>
              <div className="flex flex-wrap gap-1">
                {g.services.map((s, i) => (
                  <span key={`${s}-${i}`} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-xl"
                    style={{ background: 'rgba(232,99,10,0.08)', color: '#E8630A' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3.5 border-t border-gray-100">
              <button
                onClick={() => handleOpenView(g)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
              >
                👁 View
              </button>

              <button
                onClick={() => handleOpenEdit(g)}
                className="flex-1 rounded-lg py-2 text-xs font-semibold border transition-colors cursor-pointer"
                style={{
                  background: 'rgba(232,99,10,0.06)',
                  borderColor: 'rgba(232,99,10,0.25)',
                  color: '#E8630A'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,99,10,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(232,99,10,0.06)'}
              >
                ✏️ Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
