import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FlaskConical,
  Clock,
  AlertTriangle,
  FileText,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  PawPrint,
  User,
  Calendar,
  Activity,
} from "lucide-react";
import { getLabDashboard } from "../../api/labApi";

export default function LabDashboard() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalReports: 0,
    pendingUploads: 0,
    criticalCases: 0,
    todayReports: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingSummary, setPendingSummary] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getLabDashboard();
      if (res?.data) {
        setStatsData({
          totalReports: res.data.totalReports || 0,
          pendingUploads: res.data.pendingUploads || 0,
          criticalCases: res.data.criticalCases || 0,
          todayReports: res.data.todayReports || 0,
        });
        setRecentActivities(res.data.recentActivities || []);
        setPendingSummary(res.data.pendingSummary || []);
      }
    } catch (error) {
      console.error("Lab Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Lab Reports",
      value: statsData.totalReports,
      icon: <FlaskConical className="w-6 h-6 text-orange-500" />,
      bg: "bg-orange-500/10 border-orange-200 text-orange-600",
    },
    {
      title: "Pending Requisitions",
      value: statsData.pendingUploads,
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      bg: "bg-amber-500/10 border-amber-200 text-amber-600",
    },
    {
      title: "Critical Findings",
      value: statsData.criticalCases,
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      bg: "bg-red-500/10 border-red-200 text-red-600",
    },
    {
      title: "Today's Uploads",
      value: statsData.todayReports,
      icon: <FileText className="w-6 h-6 text-emerald-500" />,
      bg: "bg-emerald-500/10 border-emerald-200 text-emerald-600",
    },
  ];

  return (
    <div className="lab-workspace min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-200/70 overflow-hidden flex flex-col">
        {/* Sleek Dark Header Hero Section */}
        <div className="lab-hero bg-gradient-to-r from-[#063D31] via-[#075443] to-[#063D31] p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#042B22]">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Laboratory Dashboard</h1>
              <Sparkles className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
              Live diagnostic stats, pending requisitions, and historical report feeds
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/clinic/lab/pending-pets")}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition cursor-pointer border-none flex items-center gap-2"
            >
              <span>View Pending Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8 flex-1">
          {/* Stat KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {statCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition"
              >
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{card.title}</p>
                  <h2 className="text-3xl font-black text-slate-800 mt-1">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : card.value}
                  </h2>
                </div>
                <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center font-bold ${card.bg}`}>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Main Dashboard Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Pending Requisitions Queue (2 Columns) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-slate-800">Pending Requisitions Queue</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/clinic/lab/pending-pets")}
                  className="text-xs font-bold text-orange-600 hover:underline cursor-pointer border-none bg-transparent flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {loading ? (
                  <div className="p-8 text-center text-slate-400 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                ) : pendingSummary.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {pendingSummary.map((item) => (
                      <div key={item._id} className="p-4 sm:p-5 hover:bg-orange-50/40 transition flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                            TK-{item.tokenNumber || "N/A"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{item.petName || "Pet"} ({item.species})</p>
                            <p className="text-xs text-slate-400 font-medium">Owner: {item.ownerName || "Owner"}</p>
                            {item.chiefComplaint && (
                              <p className="text-xs text-slate-500 mt-1 italic font-medium">" {item.chiefComplaint} "</p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate("/clinic/lab/pending-pets")}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs border-none shrink-0"
                        >
                          Upload Report
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm font-medium">
                    No pending requisitions in queue right now.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Lab Activity Feed (1 Column) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                {loading ? (
                  <div className="p-6 text-center text-slate-400 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-3 border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs text-slate-800 truncate">{act.reports?.[0]?.testName || "Diagnostic Test Uploaded"}</p>
                        <p className="text-[11px] text-slate-400 font-medium">Status: {act.status || "Completed"}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(act.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium">
                    No recent lab activity recorded today.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
