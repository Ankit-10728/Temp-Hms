import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserPlus,
  Users,
  X,
  Mail,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { getSessionProfile } from "../../../../shared/utils/sessionProfile";

const menuItems = [
  { name: "Dashboard", path: "", icon: LayoutDashboard, end: true },
  { name: "New Registration", path: "new-registration", icon: UserPlus },
  { name: "Existing Customer", path: "existing-customer", icon: Users },
];

export default function ReceptionSidebar({ isCollapsed = false, toggleCollapse }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const profile = getSessionProfile("RECEPTIONIST", "Reception Staff");

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="md:hidden fixed inset-x-0 top-0 z-[999] flex h-16 items-center justify-between border-b border-white/10 bg-[#0C3D2E] px-4 shadow-md">
        <div className="flex items-center gap-2"><ShieldCheck size={22} className="text-[#F7931E]" /><span className="text-lg font-bold text-white">Reception<span className="text-[#F7931E]">Desk</span></span></div>
        <button onClick={() => setIsOpen(true)} aria-label="Open navigation" className="grid size-10 place-items-center rounded-xl bg-white/10 text-white"><Menu size={20} /></button>
      </div>

      {isOpen && <button onClick={() => setIsOpen(false)} aria-label="Close navigation" className="md:hidden fixed inset-0 z-[1000] cursor-default bg-black/50" />}
      <aside
        className={`fixed inset-y-0 left-0 z-[1001] flex h-screen w-[260px] flex-col bg-[#0C3D2E] text-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-[122px] items-center justify-between border-b border-white/0 px-5">
          <div className="flex items-center gap-3"><ShieldCheck size={25} className="shrink-0 text-[#F7931E]" /><h2 className="text-lg font-bold tracking-tight">Reception<span className="text-[#F7931E]">Desk</span></h2></div>
          {isOpen && <button onClick={() => setIsOpen(false)} className="md:hidden grid size-9 place-items-center rounded-lg bg-white/10"><X size={17} /></button>}
        </div>

        <nav className="flex-1 px-4 py-4">
          <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35 ${isCollapsed ? "hidden" : ""}`}>Reception</p>
          <div className="space-y-1.5">
            {menuItems.map(({ name, path, icon: Icon, end }) => (
              <NavLink key={name} to={path} end={end} onClick={() => setIsOpen(false)} className={({ isActive }) => `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition ${isActive ? "bg-[#F7931E] text-white shadow-sm" : "text-white/65 hover:bg-white/8 hover:text-white"} ${isCollapsed ? "justify-center px-2" : ""}`}>
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span>{name}</span>}
                {isCollapsed && <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#073126] px-3 py-1.5 text-xs text-white shadow-xl group-hover:block">{name}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="mx-4 border-t border-white/15" />
        <div className="p-4">
          <button onClick={handleLogout} className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-rose-200 transition hover:bg-rose-400/10 hover:text-rose-100 ${isCollapsed ? "justify-center" : ""}`}><LogOut size={17} />{!isCollapsed && "Logout"}{isCollapsed && <span className="pointer-events-none absolute left-full ml-4 hidden whitespace-nowrap rounded-lg bg-[#073126] px-3 py-1.5 text-xs text-white shadow-xl group-hover:block">Logout</span>}</button>
          <div className={`mt-2 flex items-center gap-3 rounded-xl ${isCollapsed ? "justify-center" : "border border-white/10 bg-white/5 p-3"}`}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F7931E] text-xs font-black text-white">{profile.name?.[0]?.toUpperCase() || "R"}</span>
            {!isCollapsed && <div className="min-w-0"><p className="truncate text-xs font-bold text-white">{profile.name}</p><p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-white/45"><Mail size={11} />{profile.email}</p></div>}
          </div>
        </div>
      </aside>
    </>
  );
}
