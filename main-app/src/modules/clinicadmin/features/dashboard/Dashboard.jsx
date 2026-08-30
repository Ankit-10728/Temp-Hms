import { useEffect, useRef, useState } from "react";
import {
  Users,
  UserCheck,
  CalendarDays,
  IndianRupee,
} from "lucide-react";
import Loader from "../../../../shared/components/Loader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { fetchClinicDashboard } from "../../api/dashboardApi";

const DEFAULT_DASHBOARD = {
  metrics: {
    totalStaff: 0,
    activeDoctors: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    pendingAppointments: 0,
    newRegistrationsToday: 0,
    staffThisMonth: 0,
    doctorJoiningsThisMonth: 0,
  },
  revenueData: [],
  appointmentTrend: [],
  recentEnrollments: [],
  roleDistribution: [],
  todayAppointments: [],
};

const ROLE_COLORS = {
  Doctor: "#2D7C6B",
  "Lab Technician": "#E8A145",
  Groomer: "#7B5BA8",
  "Kennel Staff": "#D67C3D",
  Receptionist: "#D64D7B",
  default: "#8B9BA8",
};

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

// BUG 4 FIX: Smart Y-axis formatter — shows plain 0 instead of 0k
const revenueYAxisFormatter = (value) => {
  const num = Number(value);
  if (num === 0) return "0";
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return `${num}`;
};

const getStatusClass = (status = "") => {
  if (status === "In Progress") return "bg-amber-100 text-amber-700";
  if (status === "Pending") return "bg-red-100 text-red-700";
  if (status === "Completed") return "bg-green-100 text-green-700";
  if (status === "Cancelled") return "bg-gray-100 text-gray-600";
  if (status === "Lab Pending") return "bg-orange-100 text-orange-700";
  return "bg-gray-100 text-gray-600";
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "NA";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const value = item?.value ?? 0;
  const isRevenue = item?.dataKey === "revenue";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 px-4 shadow-md">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-gray-900 text-sm font-bold">
        {isRevenue ? `INR ${formatINR(value)}` : value}
      </p>
    </div>
  );
};

const normalizeDashboard = (payload = {}) => {
  const data = payload?.data || payload;
  const metrics = data?.metrics || {};

  return {
    metrics: {
      totalStaff: Number(metrics.totalStaff || 0),
      activeDoctors: Number(metrics.activeDoctors || 0),
      todayAppointments: Number(metrics.todayAppointments || 0),
      monthlyRevenue: Number(metrics.monthlyRevenue || 0),
      pendingAppointments: Number(metrics.pendingAppointments || 0),
      newRegistrationsToday: Number(metrics.newRegistrationsToday || 0),
      staffThisMonth: Number(metrics.staffThisMonth || 0),
      doctorJoiningsThisMonth: Number(metrics.doctorJoiningsThisMonth || 0),
    },
    revenueData: Array.isArray(data?.revenueData) ? data.revenueData : [],
    appointmentTrend: Array.isArray(data?.appointmentTrend) ? data.appointmentTrend : [],
    recentEnrollments: Array.isArray(data?.recentEnrollments) ? data.recentEnrollments : [],
    roleDistribution: Array.isArray(data?.roleDistribution)
      ? data.roleDistribution.map((item) => ({
          ...item,
          count: Number(item.count || 0),
          total: Number(item.total || 0),
        }))
      : [],
    todayAppointments: Array.isArray(data?.todayAppointments) ? data.todayAppointments : [],
  };
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(DEFAULT_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(false);

  const cards = [
    {
      label: "Total Staff",
      value: dashboard.metrics.totalStaff,
      change: `+${dashboard.metrics.staffThisMonth} this month`,
      theme: "green",
      icon: Users,
    },
    {
      label: "Active Doctors",
      value: dashboard.metrics.activeDoctors,
      change: `+${dashboard.metrics.doctorJoiningsThisMonth} this month`,
      theme: "orange",
      icon: UserCheck,
    },
    {
      label: "Today's Appointments",
      value: dashboard.metrics.todayAppointments,
      change: `${dashboard.metrics.pendingAppointments} waiting`,
      theme: "green",
      icon: CalendarDays,
    },
    {
      label: "Monthly Revenue",
      value: `₹${formatINR(dashboard.metrics.monthlyRevenue)}`,
      change: "From completed visits",
      theme: "orange",
      icon: IndianRupee,
    },
  ];

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchClinicDashboard();

      if (!mountedRef.current) return;

      setDashboard(normalizeDashboard(response));
    } catch (err) {
      if (!mountedRef.current) return;

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load clinic dashboard"
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadDashboard();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-sm px-8 py-10 flex flex-col items-center border border-gray-200">
          <Loader />
          <h3 className="mt-6 text-lg font-semibold text-gray-900">
            Loading Dashboard
          </h3>
          <p className="mt-2 text-sm text-gray-500 text-center">
            Please wait while we prepare your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl p-6 shadow-sm border border-red-100">
          <div className="text-sm font-semibold text-red-600">
            Dashboard unavailable
          </div>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Metric Cards */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            const isGreen = card.theme === "green";

            return (
              <div
                key={card.label}
                className={`
                  rounded-2xl p-5 flex items-start gap-4
                  border transition-all duration-200
                  shadow-sm hover:shadow-md
                  ${
                    isGreen
                      ? "bg-[#D9E8E3]/40 border-[#0C3D2E]/10 hover:border-[#0C3D2E]/30"
                      : "bg-[#FFF4E5] border-[#F7931E]/20 hover:border-[#F7931E]/40"
                  }
                `}
              >
                <div
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${isGreen ? "bg-[#0C3D2E] text-white" : "bg-[#F7931E] text-white"}
                  `}
                >
                  <Icon size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* BUG 3 FIX: Removed MoreVertical icon — was static with no functionality */}
                  <p className="text-xs font-medium text-gray-600 truncate">
                    {card.label}
                  </p>

                  <h3 className="text-2xl font-bold mt-1 text-[#0C3D2E]">
                    {card.value}
                  </h3>

                  <p
                    className={`
                      text-xs font-medium mt-2
                      ${isGreen ? "text-[#0C3D2E]" : "text-[#F7931E]"}
                    `}
                  >
                    {card.change}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-gray-900 font-bold text-base mb-1">
            Revenue Overview
          </h3>
          <p className="text-gray-600 text-xs mb-5">
            Monthly revenue from completed appointments
          </p>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dashboard.revenueData} barSize={24}>
              <XAxis
                dataKey="month"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              {/* BUG 4 FIX: Smart formatter — 0 stays "0", values show k/L */}
              <YAxis
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={revenueYAxisFormatter}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(234, 179, 8, 0.05)" }}
              />
              <Bar dataKey="revenue" fill="#E8A145" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-gray-900 font-bold text-base mb-1">
            Weekly Appointments
          </h3>
          <p className="text-gray-600 text-xs mb-5">
            Last 7 days from the clinic queue
          </p>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dashboard.appointmentTrend}>
              <XAxis
                dataKey="day"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="appts"
                stroke="#2D7C6B"
                strokeWidth={2}
                dot={{ fill: "#2D7C6B", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-[1fr_1fr_1.2fr] gap-6">

        {/* Recent Staff Enrollments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-gray-900 font-bold text-base mb-4">
            Recent Staff Enrollments
          </h3>

          <div className="flex flex-col gap-3">
            {dashboard.recentEnrollments.length > 0 ? (
              dashboard.recentEnrollments.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: `${staff.color || ROLE_COLORS.default}22`,
                        color: staff.color || ROLE_COLORS.default,
                      }}
                    >
                      {getInitials(staff.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {staff.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {staff.role} - {staff.dept}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {staff.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                No recent staff enrollments found.
              </div>
            )}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-gray-900 font-bold text-base mb-4">
            Staff Role Distribution
          </h3>

          <div className="flex flex-col gap-4 mb-5">
            {dashboard.roleDistribution.length > 0 ? (
              dashboard.roleDistribution.map((role) => (
                <div key={role.role}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-gray-600 font-medium">
                      {role.role}
                    </span>
                    <span className="text-xs text-gray-600 font-semibold">
                      {role.count} staff
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${role.total ? (role.count / role.total) * 100 : 0}%`,
                        backgroundColor: role.color || ROLE_COLORS.default,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                No staff roles found yet.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="text-gray-500 text-xs">New Registrations</div>
              <div className="text-lg font-bold text-orange-600 mt-1">
                {dashboard.metrics.newRegistrationsToday}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="text-gray-500 text-xs">Pending Queue</div>
              <div className="text-lg font-bold text-red-600 mt-1">
                {dashboard.metrics.pendingAppointments}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-bold text-base">
              Today's Appointments
            </h3>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {dashboard.metrics.todayAppointments} total
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {dashboard.todayAppointments.length > 0 ? (
              dashboard.todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 items-center"
                >
                  <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-orange-600 whitespace-nowrap">
                    {appointment.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">
                      {appointment.pet}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appointment.doctor} - {appointment.type}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${getStatusClass(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                No appointments scheduled for today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
