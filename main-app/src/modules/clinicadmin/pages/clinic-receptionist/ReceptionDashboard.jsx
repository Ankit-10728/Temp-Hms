import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  MoreHorizontal,
  PawPrint,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { getDashboardStats, getExistingCustomers } from "../../api/receptionApi";

const initials = (value = "Pet") =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const dateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? [];

export default function ReceptionDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    let active = true;

    Promise.allSettled([getDashboardStats(), getExistingCustomers()]).then(([statsResult, customersResult]) => {
      if (!active) return;
      if (statsResult.status === "fulfilled") setStats(unwrap(statsResult.value) || {});
      if (customersResult.status === "fulfilled") {
        const items = unwrap(customersResult.value);
        setCustomers(Array.isArray(items) ? items : []);
      }
      setLoading(false);
    });

    return () => { active = false; };
  }, []);

  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const newToday = customers.filter((item) => (item?.owner?.createdAt || item?.createdAt || "").slice(0, 10) === today).length;
    return {
      records: customers.length || Number(stats.totalCustomers || stats.totalPets || 0),
      newToday: newToday || Number(stats.newPets || 0),
      activeVisits: Number(stats.activeVisits || 0),
      pending: Number(stats.pendingVisits || 0),
    };
  }, [customers, stats]);

  const cards = [
    { label: "Patient Records", value: summary.records, note: `${summary.records ? "+" : ""}${summary.records} total records`, icon: Users, tone: "green" },
    { label: "New Registrations", value: summary.newToday, note: "Today", icon: UserPlus, tone: "orange" },
    { label: "Active Visits", value: summary.activeVisits, note: "Currently in clinic", icon: CalendarCheck, tone: "green" },
    { label: "Pending Queue", value: summary.pending, note: summary.pending ? "Needs attention" : "Queue is clear", icon: ClipboardList, tone: "orange" },
  ];

  if (loading) {
    return <div className="min-h-[60vh] grid place-items-center text-sm font-semibold text-[#0C3D2E]/70">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, note, icon: Icon, tone }) => {
          const orange = tone === "orange";
          return (
            <article key={label} className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${orange ? "bg-[#FFF4E5] border-[#F7931E]/25" : "bg-[#D9E8E3]/30 border-[#0C3D2E]/15"}`}>
              <div className="flex gap-4">
                <div className={`grid size-12 place-items-center rounded-xl text-white shrink-0 ${orange ? "bg-[#F7931E]" : "bg-[#0C3D2E]"}`}><Icon size={22} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><p className={`text-xs font-bold uppercase tracking-wider ${orange ? "text-amber-900/80" : "text-[#0C3D2E]/80"}`}>{label}</p><MoreHorizontal size={16} className="text-slate-400" /></div>
                  <p className="mt-1 text-3xl leading-none font-black text-[#073E30]">{value}</p>
                  <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${orange ? "bg-[#F7931E]/15 text-[#D76D0B]" : "bg-[#0C3D2E]/10 text-[#0C3D2E]"}`}>{note}</span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#0C3D2E]/15 bg-[#D9E8E3]/20 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-base font-bold text-[#0C3D2E]">Reception Activity</h1><p className="mt-2 text-xs text-slate-500">Pending visits: <span className="font-bold text-[#F7931E]">{summary.pending}</span></p></div>
          <button onClick={() => navigate("existing-customer")} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#F7931E] hover:text-[#F7931E]">View all patients <ChevronRight size={15} /></button>
        </div>


        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-[760px] w-full text-sm"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-left text-[11px] font-bold uppercase tracking-wider text-[#0C3D2E]"><th className="px-4 py-3">Patient ID</th><th className="px-4 py-3">Pet & owner</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Species</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Registered</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {customers.slice(0, 6).map((item, index) => {
                const owner = item.owner || item;
                const pet = item.pet || item.pets?.[0] || {};
                const name = pet.name || pet.petName || "Unnamed pet";
                return <tr key={item._id || pet._id || index} className="transition hover:bg-[#D9E8E3]/20"><td className="px-4 py-3 text-xs font-semibold text-[#F7931E]">{pet.petId || owner.ownerId || `PT-${String(index + 1).padStart(3, "0")}`}</td><td className="px-4 py-3"><div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-full bg-[#0C3D2E] text-xs font-bold text-white">{initials(name)}</span><div><p className="font-semibold text-[#0C3D2E]">{name}</p><p className="text-[11px] text-slate-400">{owner.ownerName || owner.name || "Pet owner"}</p></div></div></td><td className="px-4 py-3 text-slate-500">{owner.mobileNumber || owner.phone || owner.email || "—"}</td><td className="px-4 py-3 text-slate-500">{pet.species || "—"}</td><td className="px-4 py-3"><span className="rounded-full bg-[#D9E8E3] px-2.5 py-1 text-[11px] font-bold text-[#0C3D2E]">ACTIVE</span></td><td className="px-4 py-3 text-xs text-slate-500">{dateLabel(owner.createdAt || item.createdAt)}</td></tr>;
              })}
              {!customers.length && <tr><td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-500">No patient records available yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionCard icon={Plus} title="New Patient Registration" copy="Create a pet and owner profile, then start their visit." action="Start registration" onClick={() => navigate("new-registration")} tone="orange" />
        <ActionCard icon={Users} title="Existing Customer" copy="Find an owner, review patient details, or begin a follow-up visit." action="Open patient records" onClick={() => navigate("existing-customer")} tone="green" />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, value, label, tone }) {
  const styles = tone === "orange" ? "bg-[#FFF4E5] text-[#F7931E]" : tone === "light" ? "bg-[#D9E8E3] text-[#0C3D2E]" : "bg-[#0C3D2E] text-white";
  return <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"><span className={`grid size-10 place-items-center rounded-xl ${styles}`}><Icon size={19} /></span><div><p className="text-xl font-bold text-[#0C3D2E]">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div>;
}

function ActionCard({ icon: Icon, title, copy, action, onClick, tone }) {
  const orange = tone === "orange";
  return <button onClick={onClick} className="group flex items-center gap-4 rounded-2xl border border-[#0C3D2E]/15 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className={`grid size-12 place-items-center rounded-xl text-white ${orange ? "bg-[#F7931E]" : "bg-[#0C3D2E]"}`}><Icon size={22} /></span><span className="min-w-0 flex-1"><span className="block font-bold text-[#0C3D2E]">{title}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{copy}</span><span className={`mt-3 inline-flex items-center gap-1 text-xs font-bold ${orange ? "text-[#F7931E]" : "text-[#0C3D2E]"}`}>{action} <ChevronRight size={14} /></span></span></button>;
}
