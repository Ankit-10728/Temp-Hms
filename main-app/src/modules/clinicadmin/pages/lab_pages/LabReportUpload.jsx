import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  FlaskConical,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileText,
  Clock,
  PawPrint,
  Loader2,
} from "lucide-react";
import LabReportModal from "./LabReportCard";
import { getAllPatientReports } from "../../api/labApi";

export default function LabReports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    completed: 0,
    critical: 0,
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await getAllPatientReports();
      const reportList = res?.data || (Array.isArray(res) ? res : []);
      setReports(reportList);
      setFilteredReports(reportList);

      // FIX Bug 6: use ?? instead of || so 0 values are preserved correctly
      setStats({
        total:     res?.totalReports     ?? reportList.length,
        today:     res?.todayReports     ?? 0,
        completed: res?.completedReports ?? reportList.filter((r) => r.status === "Completed").length,
        critical:  res?.criticalReports  ?? reportList.filter((r) => r.status === "Critical").length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const value = search.toLowerCase().trim();
    setFilteredReports(
      reports.filter(
        (item) =>
          !value ||
          item.pet?.petName?.toLowerCase().includes(value) ||
          item.pet?.name?.toLowerCase().includes(value) ||
          item.pet?.uniquePetId?.toLowerCase().includes(value) ||
          item.owner?.ownerName?.toLowerCase().includes(value) ||
          item.owner?.mobileNumber?.includes(value)
      )
    );
  }, [search, reports]);

  const openReport = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-200/70 overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Laboratory Diagnostic Reports</h1>
              <Sparkles className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
              View, verify, and review completed laboratory reports and patient test attachments
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Lab Archives</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8 flex-1">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard title="Total Lab Reports"  value={stats.total}     icon={<FlaskConical className="w-6 h-6" />}   color="orange"  />
            <StatCard title="Today's Uploads"    value={stats.today}     icon={<Calendar className="w-6 h-6" />}       color="blue"    />
            <StatCard title="Critical Findings"  value={stats.critical}  icon={<AlertTriangle className="w-6 h-6" />}  color="red"     />
            <StatCard title="Completed Tests"    value={stats.completed} icon={<CheckCircle2 className="w-6 h-6" />}   color="emerald" />
          </div>

          {/* Search */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search report by Pet Name, Pet ID, Owner Name, or Mobile Number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 bg-white text-slate-700 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none text-sm shadow-xs"
              />
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Completed Diagnostic Reports</h3>
                <p className="text-xs text-slate-400 font-medium">Historical lab results and PDF attachments</p>
              </div>
              <span className="bg-slate-100 text-slate-700 px-3.5 py-1 rounded-full text-xs font-bold border border-slate-200">
                {filteredReports.length} Records
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 font-semibold flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span>Loading laboratory reports...</span>
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                      <th className="py-3.5 px-4">Unique Pet ID</th>
                      <th className="py-3.5 px-4">Pet Patient</th>
                      <th className="py-3.5 px-4">Owner Details</th>
                      <th className="py-3.5 px-4">Attached Tests</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Report Date</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {filteredReports.map((item) => (
                      <tr key={item._id} className="hover:bg-orange-50/40 transition-colors">
                        <td className="py-4 px-4 font-black text-slate-800">
                          <span className="inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded-xl border border-slate-200">
                            {item.pet?.uniquePetId || "PET-ID"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <PawPrint className="w-4 h-4 text-orange-500 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-800">{item.pet?.petName || item.pet?.name || "Pet"}</p>
                              <p className="text-xs text-slate-400">{item.pet?.species || "Species"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-800">{item.owner?.ownerName || "Owner"}</p>
                          <p className="text-xs text-slate-400">{item.owner?.mobileNumber || "N/A"}</p>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-800">
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-200">
                            <FileText className="w-3.5 h-3.5" />
                            {item.reports?.length || 0} Test File(s)
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1 ${
                              item.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : item.status === "Critical"
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {item.status || "Completed"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => openReport(item)}
                            className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-xl transition cursor-pointer border-none inline-flex items-center justify-center shadow-sm"
                            title="View Report Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <FlaskConical className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-base">No Lab Reports Found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No completed lab report records match your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <LabReportModal open={showModal} onClose={() => setShowModal(false)} report={selectedReport} />
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const styles = {
    orange:  "bg-orange-500/10 text-orange-600 border-orange-200",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    red:     "bg-red-500/10 text-red-600 border-red-200",
    blue:    "bg-blue-500/10 text-blue-600 border-blue-200",
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <h2 className="text-3xl font-extrabold text-slate-800 mt-1">{value}</h2>
      </div>
      <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center font-bold ${styles[color] || styles.orange}`}>
        {icon}
      </div>
    </div>
  );
}
