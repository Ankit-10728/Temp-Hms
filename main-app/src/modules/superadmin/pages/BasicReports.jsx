import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Building2, CheckCircle2, AlertCircle, IndianRupee } from "lucide-react";
import {
  downloadSuperAdminBasicReport,
  fetchSuperAdminBasicReports,
  shareSuperAdminBasicReport,
} from "./basicReportsApi";

const PRIMARY_GREEN = "#0C3D2E";
const ORANGE_ACCENT = "#F7931E";
const LIGHT_GREEN = "#10B981";
const AMBER_GOLD = "#F59E0B";

const CHART_COLORS = [PRIMARY_GREEN, ORANGE_ACCENT, LIGHT_GREEN, AMBER_GOLD];

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-xs ${className}`}>
    {children}
  </div>
);

const KPI = ({ label, value, sub, theme = "mint", icon: Icon }) => {
  const isOrange = theme === "orange";
  const cardBg = isOrange ? "bg-[#FFF4E5] border-[#F7931E]/30" : "bg-[#EEF6F3] border-[#0C3D2E]/20";
  const iconBoxBg = isOrange ? "bg-[#F7931E] text-white" : "bg-[#0C3D2E] text-white";

  return (
    <div className={`flex flex-col justify-between p-4 rounded-2xl border ${cardBg} shadow-2xs transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${iconBoxBg}`}>
            <Icon size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</div>
            <div className="text-2xl font-black text-[#0C3D2E] tracking-tight mt-0.5">{value}</div>
          </div>
        </div>
        <span className="text-gray-300 text-xs tracking-widest font-bold">•••</span>
      </div>

      {sub ? <div className="mt-3 text-xs font-semibold text-[#0C3D2E]/70">{sub}</div> : null}
    </div>
  );
};

const formatDownloadName = (format) => {
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    return `superadmin-basic-report-${stamp}.csv`;
  }

  if (format === "xls" || format === "xlsx" || format === "excel") {
    return `superadmin-basic-report-${stamp}.xls`;
  }

  return `superadmin-basic-report-${stamp}.pdf`;
};

const parseFilename = (contentDisposition, fallbackName) => {
  if (!contentDisposition) return fallbackName;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }

  return fallbackName;
};

const triggerDownload = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 0);
};

const toBlob = (data, contentType = "application/octet-stream") => {
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return data;
  }

  return new Blob([data], { type: contentType });
};

const formatDateTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function BasicReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalClinics, setTotalClinics] = useState(0);
  const [activeClinics, setActiveClinics] = useState(0);
  const [inactiveClinics, setInactiveClinics] = useState(0);
  const [totalPaymentCollected, setTotalPaymentCollected] = useState(0);
  const [generatedAt, setGeneratedAt] = useState("");
  const [revenueData, setRevenueData] = useState([]);
  const [clinicTrendData, setClinicTrendData] = useState([]);
  const [clinicDistribution, setClinicDistribution] = useState([]);
  const [downloadingFormat, setDownloadingFormat] = useState("");
  const [downloadFeedback, setDownloadFeedback] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareSubject, setShareSubject] = useState("Super Admin Basic Report");
  const [shareMessage, setShareMessage] = useState(
    "Please find attached the latest super admin report."
  );
  const [shareFormat, setShareFormat] = useState("pdf");
  const [sharing, setSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(null);

  const fmtINR = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }),
    []
  );

  const generatedAtLabel = useMemo(() => formatDateTime(generatedAt), [generatedAt]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchSuperAdminBasicReports();

        if (cancelled) return;

        const fetchedTotalClinics = Number(data?.totalClinics ?? data?.totalClinicOnboarded ?? 0);
        const fetchedActiveClinics = Number(data?.activeClinics ?? 0);
        const fetchedInactiveClinics = Number(data?.suspendedClinics ?? 0);
        const fetchedTotalPayment = Number(data?.totalPaymentCollected ?? data?.totalPayment ?? 0);

        setTotalClinics(fetchedTotalClinics);
        setActiveClinics(fetchedActiveClinics);
        setInactiveClinics(fetchedInactiveClinics);
        setTotalPaymentCollected(fetchedTotalPayment);
        setGeneratedAt(data?.generatedAt || "");
        setRevenueData(Array.isArray(data?.revenueTrend) ? data.revenueTrend : []);
        setClinicTrendData(Array.isArray(data?.clinicTrend) ? data.clinicTrend : []);
        setClinicDistribution(Array.isArray(data?.clinicDistribution) ? data.clinicDistribution : []);
        setLoading(false);
      } catch (fetchError) {
        if (cancelled) return;
        setLoading(false);
        setError(fetchError?.response?.data?.message || fetchError.message || "Failed to load reports");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = async (format) => {
    setDownloadingFormat(format);
    setDownloadFeedback(null);

    try {
      const res = await downloadSuperAdminBasicReport(format);
      const blob = toBlob(res?.data, res?.headers?.["content-type"] || "application/octet-stream");
      const contentDisposition =
        res?.headers?.["content-disposition"] ||
        res?.headers?.["Content-Disposition"] ||
        res?.request?.getResponseHeader?.("content-disposition") ||
        "";
      const fileName = parseFilename(contentDisposition, formatDownloadName(format));

      triggerDownload(blob, fileName);
      setDownloadFeedback({
        type: "success",
        message: `Downloaded ${fileName}.`,
      });
    } catch (downloadError) {
      setDownloadFeedback({
        type: "error",
        message:
          downloadError?.response?.data?.message ||
          downloadError.message ||
          "Failed to download the report.",
      });
    } finally {
      setDownloadingFormat("");
    }
  };

  const handleShare = async (event) => {
    event.preventDefault();

    const recipientEmails = shareEmail.trim();
    if (!recipientEmails) {
      setShareFeedback({
        type: "error",
        message: "Please enter at least one recipient email.",
      });
      return;
    }

    setSharing(true);
    setShareFeedback(null);

    try {
      const result = await shareSuperAdminBasicReport({
        recipientEmail: recipientEmails,
        subject: shareSubject,
        message: shareMessage,
        format: shareFormat,
      });

      setShareFeedback({
        type: "success",
        message: result?.message || "Report shared successfully.",
      });
    } catch (shareError) {
      setShareFeedback({
        type: "error",
        message:
          shareError?.response?.data?.message ||
          shareError.message ||
          "Failed to share the report.",
      });
    } finally {
      setSharing(false);
    }
  };

  const actionButtons = [
    { format: "pdf", label: "Download PDF", bgClass: "bg-[#F7931E] hover:bg-[#e08319]" },
    { format: "xls", label: "Download Excel", bgClass: "bg-[#0C3D2E] hover:bg-[#08281E]" },
    { format: "csv", label: "Download CSV", bgClass: "bg-emerald-600 hover:bg-emerald-700" },
  ];

  return (
    <div className="bg-slate-50/50 min-h-screen p-4 sm:p-6 md:p-8 max-w-7xl mx-auto text-gray-800">
      {/* Header with Mint Background Style Matching Clinic Management */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-[#EEF6F3] p-5 md:p-6 rounded-2xl shadow-xs border border-[#0C3D2E]/15 transition-all">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#0C3D2E] tracking-tight">
            Basic Reports
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#0C3D2E]/70 mt-0.5">
            Live database-backed analytics for the super admin.
          </p>
          <div className="mt-2 text-xs font-semibold text-[#F7931E]">
            {generatedAtLabel ? `Last refreshed: ${generatedAtLabel}` : "Refreshing live data from the database."}
          </div>
        </div>
      </div>

      {/* Action Sections: Export & Share with Pure White Backgrounds Restored */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Export Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="text-sm font-bold text-[#0C3D2E] mb-3">
              Export report
            </div>
            <div className="flex flex-wrap gap-2.5">
              {actionButtons.map((button) => {
                const isBusy = downloadingFormat === button.format || sharing;

                return (
                  <button
                    key={button.label}
                    type="button"
                    onClick={() => handleDownload(button.format)}
                    disabled={isBusy}
                    className={`
                      ${button.bgClass}
                      text-white
                      px-4 py-2.5
                      rounded-xl
                      text-xs font-bold
                      transition-all duration-200
                      shadow-xs
                      cursor-pointer
                      disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                  >
                    {downloadingFormat === button.format ? "Preparing..." : button.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs font-medium text-gray-400">
              Each export is generated from the latest data stored in the database.
            </p>
          </div>

          {downloadFeedback?.message ? (
            <div
              className={`mt-3 text-xs font-bold ${
                downloadFeedback.type === "success" ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {downloadFeedback.message}
            </div>
          ) : null}
        </Card>

        {/* Share Form Card */}
        <Card>
          <form onSubmit={handleShare}>
            <div className="text-sm font-bold text-[#0C3D2E] mb-3">
              Share by email
            </div>

            <div className="grid gap-3">
              <label className="text-xs font-semibold text-[#0C3D2E]">
                Recipient email(s)
                <input
                  type="text"
                  value={shareEmail}
                  onChange={(event) => setShareEmail(event.target.value)}
                  placeholder="admin@example.com, accounts@example.com"
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-hidden focus:border-[#0C3D2E] bg-white"
                />
              </label>

              <label className="text-xs font-semibold text-[#0C3D2E]">
                Subject
                <input
                  type="text"
                  value={shareSubject}
                  onChange={(event) => setShareSubject(event.target.value)}
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-hidden focus:border-[#0C3D2E] bg-white"
                />
              </label>

              <label className="text-xs font-semibold text-[#0C3D2E]">
                Message
                <textarea
                  value={shareMessage}
                  onChange={(event) => setShareMessage(event.target.value)}
                  rows={3}
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-hidden focus:border-[#0C3D2E] bg-white resize-y"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <label className="text-xs font-semibold text-[#0C3D2E]">
                  Report format
                  <select
                    value={shareFormat}
                    onChange={(event) => setShareFormat(event.target.value)}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-hidden focus:border-[#0C3D2E] bg-white cursor-pointer"
                  >
                    <option value="pdf">PDF</option>
                    <option value="xls">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={sharing}
                  className="w-full bg-[#F7931E] hover:bg-[#e08319] text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed h-[36px]"
                >
                  {sharing ? "Sharing..." : "Share report"}
                </button>
              </div>
            </div>

            {shareFeedback?.message ? (
              <div
                className={`mt-3 text-xs font-bold ${
                  shareFeedback.type === "success" ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {shareFeedback.message}
              </div>
            ) : null}

            <p className="mt-2 text-[11px] font-medium text-gray-400">
              You can separate multiple emails with commas or semicolons.
            </p>
          </form>
        </Card>
      </div>

      {loading ? (
        <Card className="py-12 text-center text-sm font-medium text-gray-400">
          Loading platform analytics...
        </Card>
      ) : error ? (
        <Card className="border-rose-100 bg-rose-50/50">
          <div className="font-bold text-rose-700 text-sm">Error</div>
          <div className="mt-1 text-xs text-rose-600 font-medium">{error}</div>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <KPI
              label="TOTAL CLINICS"
              value={totalClinics}
              sub="Registered clinics in the system"
              theme="mint"
              icon={Building2}
            />
            <KPI
              label="ACTIVE CLINICS"
              value={activeClinics}
              sub="Clinics with active subscriptions"
              theme="orange"
              icon={CheckCircle2}
            />
            <KPI
              label="INACTIVE CLINICS"
              value={inactiveClinics}
              sub="Suspended or expired clinics"
              theme="mint"
              icon={AlertCircle}
            />
            <KPI
              label="TOTAL PAYMENT COLLECTED"
              value={`₹${fmtINR.format(totalPaymentCollected)}`}
              sub="Completed consultation revenue"
              theme="orange"
              icon={IndianRupee}
            />
          </div>

          {/* Charts Row 1: Revenue Trend (Green BG) & Clinic Onboarding Rate (White BG) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div className="bg-[#EEF6F3] border border-[#0C3D2E]/15 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-4">
              <div>
                <div className="text-sm font-bold text-[#0C3D2E]">Revenue Trend</div>
                <div className="text-xs font-semibold text-[#0C3D2E]/70 mt-0.5">Monthly payment collection overview</div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0C3D2E]/10" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#0C3D2E" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#0C3D2E" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => {
                        const num = Number(value || 0);
                        if (num === 0) return "₹0";
                        if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
                        if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
                        return `₹${num}`;
                      }}
                    />
                    <Tooltip formatter={(value) => [`₹${fmtINR.format(Number(value || 0))}`, "Revenue"]} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={ORANGE_ACCENT}
                      strokeWidth={3}
                      dot={{ r: 4, fill: ORANGE_ACCENT }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Card className="flex flex-col gap-4">
              <div>
                <div className="text-sm font-bold text-[#0C3D2E]">Clinic Onboarding Rate</div>
                <div className="text-xs font-medium text-gray-400 mt-0.5">New clinics registered per month</div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clinicTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip formatter={(value) => [value, "New clinics"]} cursor={{ fill: "#F8FAFC" }} />
                    <Bar dataKey="clinics" fill={PRIMARY_GREEN} radius={[6, 6, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Charts Row 2: Clinic Status Distribution (Orange BG) & Data Summary (White BG) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div className="bg-[#FFF4E5] border border-[#F7931E]/30 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-4">
              <div>
                <div className="text-sm font-bold text-[#0C3D2E]">Clinic Status Distribution</div>
                <div className="text-xs font-semibold text-[#0C3D2E]/70 mt-0.5">Breakdown by subscription states</div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clinicDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {clinicDistribution.map((entry, index) => (
                        <Cell key={`cell-${entry.name || index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Clinics"]} />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      wrapperStyle={{ fontSize: "11px", color: "#0C3D2E" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Card className="flex flex-col gap-4">
              <div>
                <div className="text-sm font-bold text-[#0C3D2E]">Data Summary & Details</div>
                <div className="text-xs font-medium text-gray-400 mt-0.5">What these metrics represent</div>
              </div>

              <div className="flex flex-col gap-3.5 mt-2">
                <div className="p-3.5 bg-[#EEF6F3] rounded-2xl border border-[#0C3D2E]/15 border-l-4 border-l-[#0C3D2E] shadow-2xs">
                  <div className="text-xs font-bold text-[#0C3D2E]">Clinic Acquisition</div>
                  <div className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                    The bar chart illustrates monthly growth. The current total base stands at{" "}
                    <strong className="text-[#0C3D2E] font-bold">{totalClinics}</strong> clinics system-wide.
                  </div>
                </div>

                <div className="p-3.5 bg-[#FFF4E5]/60 rounded-2xl border border-[#F7931E]/20 border-l-4 border-l-[#F7931E] shadow-2xs">
                  <div className="text-xs font-bold text-[#F7931E]">Financial Performance</div>
                  <div className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                    The line chart tracks the revenue stream. Platform aggregate revenue is currently{" "}
                    <strong className="text-[#F7931E] font-bold">₹{fmtINR.format(totalPaymentCollected)}</strong>.
                  </div>
                </div>

                <div className="p-3.5 bg-[#EEF6F3] rounded-2xl border border-[#0C3D2E]/15 border-l-4 border-l-emerald-600 shadow-2xs">
                  <div className="text-xs font-bold text-emerald-800">Account Health</div>
                  <div className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                    The donut chart segments the active, suspended and expired clinic states so you can spot churn at a glance.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      <div className="mt-4 text-xs font-medium text-gray-400 text-center sm:text-left">
        Reports are generated live from <code className="bg-gray-100 px-1.5 py-0.5 rounded-md text-[#0C3D2E] font-semibold">/super-admin-reports/basic</code>, with download and email sharing available above.
      </div>
    </div>
  );
}