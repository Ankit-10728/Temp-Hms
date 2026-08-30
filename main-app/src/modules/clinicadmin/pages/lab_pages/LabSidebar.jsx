import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  FlaskConical,
  LogOut,
  Menu,
  X,
  UserCheck,
  Building2,
  Mail,
} from "lucide-react";
import { getSessionProfile } from "../../../../shared/utils/sessionProfile";

export default function LabSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const profile = getSessionProfile("LAB_TECHNICIAN", "Lab Specialist");

  const menus = [
    {
      id: "/clinic/lab",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      exact: true,
    },
    {
      id: "/clinic/lab/pending-pets",
      label: "Pending Requisitions",
      icon: <FlaskConical className="w-5 h-5" />,
      exact: false,
    },
    {
      id: "/clinic/lab/upload",
      label: "Lab Reports",
      icon: <FileText className="w-5 h-5" />,
      exact: false,
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-slate-950 px-5 py-4 text-white shadow-md lg:hidden border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <FlaskConical className="w-6 h-6 text-orange-400" />
          <h2 className="font-extrabold text-base tracking-wide text-white">Lab Diagnostics Panel</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 transition cursor-pointer border-none"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 left-0 z-50 h-screen w-[260px] bg-slate-950 text-white flex flex-col justify-between transition-transform duration-300 border-r border-slate-800 shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div>
          {/* Sidebar Header / Logo */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-orange-400" />
                <h2 className="text-xl font-black tracking-tight text-white">
                  <span className="text-orange-400">Lab</span> Panel
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold mt-1 tracking-wider uppercase">
                Veterinary SaaS HMS
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white border-none bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5 mt-2">
            {menus.map((item) => {
              // FIX Bug 1: exact match for dashboard index, startsWith for child routes
              const isActive = item.exact
                ? location.pathname === item.id
                : location.pathname.startsWith(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    navigate(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3.5 w-full px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer text-left border-none ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Profile & Logout Section */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/40">
          <div className="rounded-2xl bg-slate-900 p-3.5 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs text-white truncate">{profile.name}</p>
              <p className="text-[10px] text-orange-300 font-bold uppercase tracking-wide truncate mt-0.5">{profile.role}</p>
              <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-100/75 truncate">
                <Building2 className="h-3 w-3 shrink-0" /> {profile.clinicName}
              </p>
              <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-100/75 truncate" title={profile.email}>
                <Mail className="h-3 w-3 shrink-0" /> {profile.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-3 text-xs font-bold text-red-400 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
