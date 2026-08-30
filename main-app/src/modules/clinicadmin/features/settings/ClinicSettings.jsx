import React, { useState } from 'react';

const languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali'];
const bookingModes = ['Walk-in only', 'Online booking only', 'Both booking is available'];
const notifChannels = ['Email', 'SMS', 'WhatsApp', 'Push Notification'];

const Input = ({ className = '', ...props }) => (
  <input {...props} className={`w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`} />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea {...props} className={`w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-vertical ${className}`} />
);

const Select = ({ children, className = '', ...props }) => (
  <div className="relative">
    <select {...props} className={`w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition appearance-none cursor-pointer ${className}`}>
      {children}
    </select>
    <svg className="pointer-events-none absolute right-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{children}</label>
);

const FileUpload = ({ label, hint, accept }) => (
  <div>
    <Label>{label}</Label>
    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl bg-white hover:bg-orange-50 hover:border-orange-300 cursor-pointer transition group">
      <svg className="w-5 h-5 text-gray-300 group-hover:text-orange-400 mb-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <span className="text-xs text-gray-400 group-hover:text-orange-500 transition">{hint || 'Click to upload'}</span>
      <input type="file" className="hidden" accept={accept} />
    </label>
  </div>
);

function ClinicProfile({ form, u }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>5.1 — Clinic Profile</h3>
        <p className="text-xs text-gray-400 mt-0.5">Editable by clinic admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Clinic Display Name <span className="text-orange-500">*</span></Label>
          <Input value={form.clinicName} onChange={e => u('clinicName', e.target.value)} />
        </div>
        <div>
          <Label>Timezone</Label>
          <Input value={form.timezone} onChange={e => u('timezone', e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Tagline & Description</Label>
        <Textarea rows={2} value={form.tagline} onChange={e => u('tagline', e.target.value)} />
      </div>

      <FileUpload label="Clinic Logo" hint="Upload PNG, JPG or PDF — max 2 MB" accept=".pdf,image/*" />

      <div>
        <Label>Working Hours</Label>
        <div className="flex items-center gap-3">
          <Input type="time" value={form.workingHoursStart} onChange={e => u('workingHoursStart', e.target.value)} />
          <span className="text-sm text-gray-400 shrink-0">to</span>
          <Input type="time" value={form.workingHoursEnd} onChange={e => u('workingHoursEnd', e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Holidays & Closures</Label>
        <Input type="date" />
        <p className="text-xs text-gray-400 mt-1">Add multiple dates by clicking repeatedly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>OPD Capacity (slots / day)</Label>
          <Input type="number" value={form.opdCapacity} onChange={e => u('opdCapacity', e.target.value)} min={1} />
        </div>
        <div>
          <Label>Consultation Duration (min)</Label>
          <Input type="number" value={form.defaultDuration} onChange={e => u('defaultDuration', e.target.value)} min={5} />
        </div>
      </div>

      <div>
        <Label>Appointment Booking Mode</Label>
        <Select value={form.bookingMode} onChange={e => u('bookingMode', e.target.value)}>
          {bookingModes.map(m => <option key={m}>{m}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Primary Language</Label>
          <Select value={form.primaryLanguage} onChange={e => u('primaryLanguage', e.target.value)}>
            {languages.map(l => <option key={l}>{l}</option>)}
          </Select>
        </div>
        <div>
          <Label>Currency</Label>
          <Input value={form.currency} readOnly disabled />
        </div>
      </div>
    </div>
  );
}

function PrescriptionSetup({ form, u }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>5.2 — Prescription & Letterhead</h3>
        <p className="text-xs text-gray-400 mt-0.5">Controls how prescriptions and reports are printed</p>
      </div>

      <div>
        <Label>Clinic Letterhead Template</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3.5 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition text-sm text-gray-500 hover:text-orange-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload PDF Template
            <input type="file" className="hidden" accept=".pdf" />
          </label>
          <button className="flex items-center justify-center gap-2 border-2 border-orange-200 bg-orange-50 text-orange-600 rounded-xl py-3.5 text-sm font-medium hover:bg-orange-100 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Build with Editor
          </button>
        </div>
      </div>

      <FileUpload label="Clinic Stamp" hint="PNG with transparent background" accept="image/*" />

      <div>
        <Label>Prescription Footer Text</Label>
        <Textarea rows={2} value={form.prescriptionFooter} onChange={e => u('prescriptionFooter', e.target.value)} />
      </div>

      <div>
        <Label>Registration / License Number</Label>
        <Input value={form.regNumber} readOnly disabled />
      </div>

      <div>
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Preview</p>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-orange-500 px-4 py-3">
            <p className="text-white font-bold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>{form.clinicName}</p>
            <p className="text-orange-100 text-xs mt-0.5">{form.tagline}</p>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-xs text-gray-400">Reg. No.: <span className="text-gray-600 font-medium">{form.regNumber}</span></p>
            <div className="mt-6 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 italic">{form.prescriptionFooter}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsAlerts({ selectedNotifChannels, setSelectedNotifChannels, selectedOwnerLang, setSelectedOwnerLang }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>5.3 — Notifications & Alerts</h3>
        <p className="text-xs text-gray-400 mt-0.5">Set reminder timings and delivery channels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Follow-up (days before)</Label>
          <Input type="number" defaultValue={1} min={1} />
        </div>
        <div>
          <Label>Vaccination (days before)</Label>
          <Input type="number" defaultValue={7} min={1} />
        </div>
        <div>
          <Label>License Expiry (days before)</Label>
          <Input type="number" defaultValue={30} min={1} />
        </div>
      </div>

      <div>
        <Label>Notification Channels</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {notifChannels.map(c => {
            const active = selectedNotifChannels.includes(c);
            return (
              <button key={c} type="button"
                onClick={() => setSelectedNotifChannels(active ? selectedNotifChannels.filter(x => x !== c) : [...selectedNotifChannels, c])}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition ${active ? 'bg-orange-50 border-orange-400 text-orange-600' : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300'}`}
              >
                <span className={`w-4 h-4 rounded flex items-center justify-center border transition ${active ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                  {active && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </span>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Owner Notification Language</Label>
        <Select value={selectedOwnerLang} onChange={e => setSelectedOwnerLang(e.target.value)}>
          {languages.map(l => <option key={l}>{l}</option>)}
        </Select>
      </div>
    </div>
  );
}

export default function ClinicSettings() {
  const [activeTab, setActiveTab] = useState('5.1');
  const [selectedNotifChannels, setSelectedNotifChannels] = useState(['Email', 'SMS']);
  const [selectedOwnerLang, setSelectedOwnerLang] = useState('English');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    clinicName: 'Paws & Care Veterinary Clinic',
    tagline: 'Premium care for your beloved pets',
    workingHoursStart: '09:00', workingHoursEnd: '18:00',
    opdCapacity: 50, defaultDuration: 15,
    bookingMode: 'Both booking is available',
    primaryLanguage: 'English', currency: 'INR', timezone: 'Asia/Kolkata',
    prescriptionFooter: "Thank you for trusting us with your pet's health.",
    regNumber: 'VCI/MH/2020/5678',
  });
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const tabs = [
    { id: '5.1', label: 'Clinic Profile' },
    { id: '5.2', label: 'Prescription & Letterhead' },
    { id: '5.3', label: 'Notifications & Alerts' },
  ];

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="p-0 sm:p-4 bg-white min-h-screen">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>Clinic Settings & Configuration</h2>
        <p className="text-xs text-gray-400 mt-0.5">Configure your clinic profile, prescriptions, and notification preferences</p>
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-full sm:w-fit overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none whitespace-nowrap ${activeTab === t.id ? 'bg-white text-orange-500 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
        {activeTab === '5.1' && <ClinicProfile form={form} u={u} />}
        {activeTab === '5.2' && <PrescriptionSetup form={form} u={u} />}
        {activeTab === '5.3' && <NotificationsAlerts selectedNotifChannels={selectedNotifChannels} setSelectedNotifChannels={setSelectedNotifChannels} selectedOwnerLang={selectedOwnerLang} setSelectedOwnerLang={setSelectedOwnerLang} />}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Settings saved
            </span>
          )}
          <button type="button" onClick={handleSave}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
