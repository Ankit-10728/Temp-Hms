import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock3, History, LayoutDashboard, LogOut, Mail, Menu, ShieldCheck, User, X } from "lucide-react";
import { getSessionProfile } from "../../../../../shared/utils/sessionProfile";

const menuItems = [
  { name: "Dashboard", path: "", icon: LayoutDashboard, end: true },
  { name: "Pending Patients", path: "pending", icon: Clock3 },
  { name: "Completed Cases", path: "completed", icon: CheckCircle2 },
  { name: "Patient History", path: "history", icon: History },
];

export default function DoctorSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const profile = getSessionProfile("DOCTOR", "Doctor");

  const logout = () => { localStorage.clear(); sessionStorage.clear(); navigate("/login", { replace: true }); };

  return <>
    <div className="fixed inset-x-0 top-0 z-[999] flex h-16 items-center justify-between border-b border-white/10 bg-[#0C3D2E] px-4 md:hidden">
      <div className="flex items-center gap-2"><ShieldCheck size={22} className="text-[#F7931E]" /><span className="text-lg font-bold text-white">Care<span className="text-[#F7931E]">Desk</span></span></div>
      <button onClick={() => setIsOpen(true)} className="grid size-10 place-items-center rounded-xl bg-white/10 text-white" aria-label="Open navigation"><Menu size={20} /></button>
    </div>
    {isOpen && <button aria-label="Close navigation" onClick={() => setIsOpen(false)} className="fixed inset-0 z-[1000] bg-black/50 md:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-[1001] flex h-screen w-[260px] flex-col bg-[#0C3D2E] text-white shadow-xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
      <div className="flex h-[122px] items-center justify-between px-5"><div className="flex items-center gap-3"><ShieldCheck size={25} className="text-[#F7931E]" /><div><p className="text-lg font-bold">Care<span className="text-[#F7931E]">Desk</span></p><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">Doctor station</p></div></div>{isOpen && <button onClick={() => setIsOpen(false)} className="grid size-9 place-items-center rounded-lg bg-white/10 md:hidden" aria-label="Close navigation"><X size={17} /></button>}</div>
      <nav className="flex-1 px-4 py-4"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Consultation</p><div className="space-y-1.5">{menuItems.map(({ name, path, icon: Icon, end }) => <NavLink key={name} to={path} end={end} onClick={() => setIsOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition ${isActive ? "bg-[#F7931E] text-white shadow-sm" : "text-white/65 hover:bg-white/8 hover:text-white"}`}><Icon size={18} />{name}</NavLink>)}</div></nav>
      <div className="mx-4 border-t border-white/15" /><div className="p-4"><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-rose-200 transition hover:bg-rose-400/10"><LogOut size={17} />Logout</button><div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"><span className="grid size-9 place-items-center rounded-full bg-[#F7931E] text-white"><User size={17} /></span><div className="min-w-0"><p className="truncate text-xs font-bold">{profile.name}</p><p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-white/45"><Mail size={11} />{profile.email}</p></div></div></div>
    </aside>
  </>;
}
