import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, getPendingPets, getCompletedPets } from "../../api/preConsultationApi";
import PetRegistrationWizard from "./PetRegistrationWizard";
import {
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronRight,
  ClipboardList,
  Stethoscope,
  FileText,
  PawPrint,
  Cat,
  Bird,
  Rabbit,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const formatToken = (val) => {
  if (val === null || val === undefined || val === "" || val === "—") return "—";
  const str = String(val).trim();
  if (str.toUpperCase().startsWith("TK-")) return str.toUpperCase();
  return `TK-${str}`;
};

export default function PreConsultationDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayPatients: 0,
    vitalsPending: 0,
    observations: 0,
    completed: 0,
  });
  const [todaysQueue, setTodaysQueue] = useState([]);
  const [recentCompleted, setRecentCompleted] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPetForAssessment, setSelectedPetForAssessment] = useState(null);
  const [openAssessmentModal, setOpenAssessmentModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const dashRes = await getDashboard().catch(() => null);

      const pendingRes = await getPendingPets().catch(() => ({ data: [] }));
      const pendingList = pendingRes.data || [];

      const completedRes = await getCompletedPets().catch(() => ({ data: { pets: [], stats: {} } }));
      const completedList = completedRes.data?.pets || [];
      const completedStats = completedRes.data?.stats || {};

      let todayPatientsCount = pendingList.length + (completedStats.completedToday || 0);
      let vitalsPendingCount = pendingList.length;
      let severeObservationsCount = pendingList.filter(
        (p) => p.priority === "High" || p.severity === "Severe"
      ).length;
      let completedTodayCount = completedStats.completedToday || 0;

      if (dashRes?.data?.cards) {
        todayPatientsCount = dashRes.data.cards.todayPatients || todayPatientsCount;
        vitalsPendingCount = dashRes.data.cards.vitalsPending || vitalsPendingCount;
        severeObservationsCount = dashRes.data.cards.observations || severeObservationsCount;
        completedTodayCount = dashRes.data.cards.completed || completedTodayCount;
      }

      setStats({
        todayPatients: todayPatientsCount,
        vitalsPending: vitalsPendingCount,
        observations: severeObservationsCount,
        completed: completedTodayCount,
      });

      setTodaysQueue(pendingList);
      setRecentCompleted(completedList.slice(0, 5));
    } catch (err) {
      console.error("Error loading pre-consultation dashboard data:", err);
      toast.error("Could not sync dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const filteredQueue = useMemo(() => {
    if (!search.trim()) return todaysQueue;
    const query = search.toLowerCase().trim();
    return todaysQueue.filter((item) => {
      const token     = String(item.tokenNumber ?? "").toLowerCase();
      const ownerName = String(item.owner?.ownerName || item.ownerName || "").toLowerCase();
      const petName   = String(item.pet?.petName || item.petName || "").toLowerCase();
      const phone     = String(item.owner?.mobileNumber || item.phoneNumber || "").toLowerCase();
      return (
        token.includes(query) ||
        ownerName.includes(query) ||
        petName.includes(query) ||
        phone.includes(query)
      );
    });
  }, [search, todaysQueue]);

  const getSpeciesIcon = (species) => {
    const s = (species || "").toLowerCase();
    if (s.includes("cat")) return <Cat className="w-6 h-6 text-orange-600" />;
    if (s.includes("bird") || s.includes("parrot")) return <Bird className="w-6 h-6 text-blue-600" />;
    if (s.includes("rabbit")) return <Rabbit className="w-6 h-6 text-purple-600" />;
    return <PawPrint className="w-6 h-6 text-orange-600" />;
  };

  return (
    <div className="space-y-[20px]">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] bg-[#D9E8E3]/30 p-[20px] md:p-[24px] rounded-[16px] border border-[#0C3D2E]/15 shadow-sm transition-all duration-200">
        <div className="flex items-center gap-[16px]">
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#0C3D2E] text-white flex items-center justify-center shrink-0">
            <Stethoscope className="w-[22px] h-[22px]" />
          </div>
          <div>
            <h1 className="text-[20px] md:text-[24px] font-[900] tracking-tight text-[#0C3D2E]">
              Pre-Consultation Station
            </h1>
            <p className="text-[12px] md:text-[14px] font-[600] text-[#0C3D2E]/70 mt-[2px]">
              Real-time management of pet vitals, health histories, primary complaints, and doctor workflow queue.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-[12px] w-full md:w-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full md:w-auto flex items-center justify-center gap-[8px] bg-white hover:bg-slate-50 text-[#0C3D2E] border border-[#0C3D2E]/15 px-[20px] py-[10px] rounded-[12px] text-[12px] font-[700] shadow-sm transition-all duration-200 hover:-translate-y-[2px] cursor-pointer"
          >
            <RefreshCw className={`w-[16px] h-[16px] text-[#F7931E] ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync Queue</span>
          </button>

          <button
            onClick={() => navigate("/clinic/preconsultation/pending")}
            className="w-full md:w-auto flex items-center justify-center gap-[8px] bg-[#F7931E] hover:bg-[#E08319] text-white px-[20px] py-[10px] rounded-[12px] text-[12px] font-[700] shadow-sm transition-all duration-200 hover:-translate-y-[2px] cursor-pointer border-none"
          >
            <span>Assess Patients ({stats.vitalsPending})</span>
            <ChevronRight className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[16px]">

        <div className="bg-[#D9E8E3]/35 rounded-[16px] p-[16px] md:p-[20px] border border-[#0C3D2E]/15 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-between gap-[16px]">
          <div>
            <p className="text-[12px] font-[700] tracking-wider text-[#0C3D2E]/80">Today's Patients</p>
            <h2 className="text-[24px] md:text-[32px] font-[900] text-[#0C3D2E] mt-[4px] tracking-tight">
              {loading ? "..." : stats.todayPatients}
            </h2>
            <span className="inline-block rounded-full px-[10px] py-[2px] text-[11px] font-[700] bg-[#0C3D2E]/10 text-[#0C3D2E] mt-[6px]">
              Total Intake
            </span>
          </div>
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#0C3D2E] text-white flex items-center justify-center shrink-0">
            <Activity className="w-[22px] h-[22px]" />
          </div>
        </div>

        <div className="bg-[#FFF4E5] rounded-[16px] p-[16px] md:p-[20px] border border-[#F7931E]/20 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-between gap-[16px]">
          <div>
            <p className="text-[12px] font-[700] tracking-wider text-[#F7931E]">Vitals Pending</p>
            <h2 className="text-[24px] md:text-[32px] font-[900] text-[#0C3D2E] mt-[4px] tracking-tight">
              {loading ? "..." : stats.vitalsPending}
            </h2>
            <span className="inline-block rounded-full px-[10px] py-[2px] text-[11px] font-[700] bg-[#F7931E]/10 text-[#F7931E] mt-[6px]">
              Action Required
            </span>
          </div>
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#F7931E] text-white flex items-center justify-center shrink-0">
            <Clock className="w-[22px] h-[22px]" />
          </div>
        </div>

        <div className="bg-[#FFF4E5] rounded-[16px] p-[16px] md:p-[20px] border border-[#F7931E]/20 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-between gap-[16px]">
          <div>
            <p className="text-[12px] font-[700] tracking-wider text-[#F7931E]">Severe / Observations</p>
            <h2 className="text-[24px] md:text-[32px] font-[900] text-[#0C3D2E] mt-[4px] tracking-tight">
              {loading ? "..." : stats.observations}
            </h2>
            <span className="inline-block rounded-full px-[10px] py-[2px] text-[11px] font-[700] bg-[#F7931E]/10 text-[#F7931E] mt-[6px]">
              High Priority
            </span>
          </div>
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#F7931E] text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-[22px] h-[22px]" />
          </div>
        </div>

        <div className="bg-[#D9E8E3]/35 rounded-[16px] p-[16px] md:p-[20px] border border-[#0C3D2E]/15 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px] flex items-center justify-between gap-[16px]">
          <div>
            <p className="text-[12px] font-[700] tracking-wider text-[#0C3D2E]/80">Completed</p>
            <h2 className="text-[24px] md:text-[32px] font-[900] text-[#0C3D2E] mt-[4px] tracking-tight">
              {loading ? "..." : stats.completed}
            </h2>
            <span className="inline-block rounded-full px-[10px] py-[2px] text-[11px] font-[700] bg-[#0C3D2E]/10 text-[#0C3D2E] mt-[6px]">
              Sent to Doctor
            </span>
          </div>
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#0C3D2E] text-white flex items-center justify-center shrink-0">
            <CheckCircle className="w-[22px] h-[22px]" />
          </div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Live Queue */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Live Pending Assessment Queue
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pets waiting for pre-consultation vitals recording
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} role="search" className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter queue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-orange-500 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
                <p className="text-sm">Loading pending queue...</p>
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="flex justify-center mb-3">
                  <PawPrint className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="font-bold text-slate-700">No Patients in Pending Queue</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All registered pets have completed pre-consultation assessments.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQueue.slice(0, 6).map((item) => {
                  const petName   = item.pet?.petName || item.petName || "Pet";
                  const species   = item.pet?.species || item.species || "Dog";
                  const ownerName = item.owner?.ownerName || item.ownerName || "Owner";
                  const token     = formatToken(item.tokenNumber);

                  return (
                    <div
                      key={item._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-orange-50/40 rounded-2xl border border-slate-100 transition-all gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-2xl shrink-0">
                          {getSpeciesIcon(species)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-base">{petName}</span>
                            <span className="bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-md font-mono font-semibold">
                              {token}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Owner: <span className="font-medium text-slate-700">{ownerName}</span>{" "}
                            ({item.owner?.mobileNumber || item.phoneNumber || "N/A"})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                          Pending Vitals
                        </span>
                        <button
                          onClick={() => {
                            setSelectedPetForAssessment(item);
                            setOpenAssessmentModal(true);
                          }}
                          className="bg-slate-900 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          Take Assessment
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Shortcuts & Recent */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-orange-500" />
              Quick Navigation
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/clinic/preconsultation/pending")}
                className="w-full flex items-center justify-between bg-orange-50 hover:bg-orange-100 border border-orange-200 p-4 rounded-2xl text-orange-900 font-semibold transition-all"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <div className="text-left">
                    <p className="text-sm font-bold">Pending Assessments</p>
                    <p className="text-xs text-orange-700 font-normal">View waiting room list</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-600" />
              </button>

              <button
                onClick={() => navigate("/clinic/preconsultation/completed")}
                className="w-full flex items-center justify-between bg-green-50 hover:bg-green-100 border border-green-200 p-4 rounded-2xl text-green-900 font-semibold transition-all"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-bold">Completed Cases</p>
                    <p className="text-xs text-green-700 font-normal">Vitals recorded & submitted</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-green-600" />
              </button>

              <button
                onClick={() => navigate("/clinic/preconsultation/history")}
                className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 border border-blue-200 p-4 rounded-2xl text-blue-900 font-semibold transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-bold">Pet History Archive</p>
                    <p className="text-xs text-blue-700 font-normal">Search past visits</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Recent Completed */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recent Completed Assessments
            </h2>
            {recentCompleted.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 bg-slate-50 rounded-xl">
                No completed assessments recorded today yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentCompleted.slice(0, 4).map((record, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
                        <CheckCircle className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {record.petId?.name || record.petName || "Pet"}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Token: {formatToken(record.tokenNumber)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Assessment Modal */}
      {openAssessmentModal && (
        <PetRegistrationWizard
          petData={selectedPetForAssessment}
          onClose={() => {
            setOpenAssessmentModal(false);
            setSelectedPetForAssessment(null);
          }}
          onCompleted={() => {
            fetchDashboardData();
          }}
        />
      )}

    </div>
  );
}
