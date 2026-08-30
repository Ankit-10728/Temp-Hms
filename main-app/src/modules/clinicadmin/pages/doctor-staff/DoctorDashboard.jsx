import { useState } from "react";
import {
  PendingPets,
  CompletedPets,
  History,
  Dashboard,
} from "../../components";
import { Stethoscope, Clock3, CheckCircle2, History as HistoryIcon, LayoutDashboard } from "lucide-react";

export default function DoctorDashboard() {
  const [activeStep, setActiveStep] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "pendingPets", label: "Pending Patients", icon: Clock3 },
    { id: "completedPets", label: "Completed Cases", icon: CheckCircle2 },
    { id: "history", label: "Medical History", icon: HistoryIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="bg-gradient-to-r from-white via-orange-50/50 to-amber-50/60 rounded-3xl p-5 md:p-6 border border-orange-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Clinical Operations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-orange-500" />
            Doctor Station
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
            Examine waiting patients, review vitals, prescribe medications, and manage clinical diagnostics
          </p>
        </div>

        {/* Tab Selector Pill Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStep === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStep(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-orange-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Page View */}
      <div>
        {activeStep === "dashboard" && <Dashboard setActiveStep={setActiveStep} />}
        {activeStep === "pendingPets" && <PendingPets setActiveStep={setActiveStep} />}
        {activeStep === "completedPets" && <CompletedPets setActiveStep={setActiveStep} />}
        {activeStep === "history" && <History />}
      </div>
    </div>
  );
}

