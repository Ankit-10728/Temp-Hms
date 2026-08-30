import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
};

const getBadgeClass = (value, tone) => {
    const base = "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold";

    const toneMap = {
        green: "bg-[#D9E8E3] text-[#0C3D2E]",
        amber: "bg-orange-50 text-orange-600 border border-orange-100",
        rose: "bg-rose-50 text-rose-700",
        blue: "bg-emerald-50 text-emerald-800",
        slate: "bg-slate-100 text-slate-600",
    };

    return `${base} ${toneMap[tone] || toneMap.slate}`;
};

const getSubscriptionTone = (status) => {
    if (status === "ACTIVE") return "green";
    if (status === "SUSPENDED") return "amber";
    if (status === "EXPIRED") return "rose";
    return "slate";
};

const getVerificationTone = (status) => {
    if (status === "APPROVED") return "green";
    if (status === "REJECTED") return "rose";
    if (status === "DOCS_VERIFIED") return "blue";
    if (status === "UNDER_REVIEW") return "amber";
    return "slate";
};

const getInitials = (name) => {
    const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!parts.length) return "C";

    return parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");
};

const getClinicDisplayId = (clinic) =>
    clinic?.displayId || clinic?.clinicCode || (clinic?._id ? `CLINIC-${clinic._id.slice(-6).toUpperCase()}` : "#---");

function ClientActivity({ summary = {}, clinics = [] }) {
    const navigate = useNavigate();

    const visibleClinics = Array.isArray(clinics) ? clinics : [];

    const metricCards = useMemo(
        () => [
            {
                num: summary.submittedClinics || 0,
                label: "Submitted",
                bg: "#0C3D2E",
                iconColor: "#FFFFFF",
            },
            {
                num: summary.totalClinics || 0,
                label: "Total Clinic",
                bg: "#FFF4E5",
                iconColor: "#F7931E",
            },
            {
                num: summary.activeClinics || 0,
                label: "Active Clinics",
                bg: "#D9E8E3",
                iconColor: "#0C3D2E",
            },
        ],
        [summary]
    );

    return (
        <div className="bg-[#D9E8E3]/20 rounded-2xl p-4 md:p-6 shadow-xs border border-[#0C3D2E]/15 my-2 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
                <div>
                    <h2 className="text-base font-bold text-[#0C3D2E]">
                        Clinic Activity
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Pending reviews: <span className="font-semibold text-[#F7931E]">{summary.pendingReviews || 0}</span>
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/superadmin/clinics")}
                    className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 hover:border-[#F7931E] hover:text-[#F7931E] hover:bg-orange-50/50 transition-all shadow-xs cursor-pointer"
                >
                    View All Clinics
                    <svg
                        className="w-3.5 h-3.5 text-[#F7931E]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-5 mb-5 border-b border-[#0C3D2E]/10">
                {metricCards.map((metric, index) => (
                    <div key={index} className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-gray-100 shadow-xs">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                            style={{ background: metric.bg }}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke={metric.iconColor}
                                strokeWidth={2}
                            >
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>

                        <div>
                            <div className="text-xl font-bold text-[#0C3D2E]">
                                {metric.num}
                            </div>
                            <div className="text-xs font-medium text-gray-500">
                                {metric.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-xs">
                <table className="min-w-[800px] w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-slate-50/50">
                            <th className="py-2.5 px-3 text-left text-xs font-bold text-[#0C3D2E] uppercase tracking-wider">
                                Clinic ID
                            </th>
                            <th className="py-2.5 px-3 text-left text-xs font-bold text-[#0C3D2E] uppercase tracking-wider">
                                Clinic Name
                            </th>
                            <th className="py-2.5 px-3 text-left text-xs font-bold text-[#0C3D2E] uppercase tracking-wider">
                                Email
                            </th>
                            <th className="py-2.5 px-3 text-left text-xs font-bold text-[#0C3D2E] uppercase tracking-wider">
                                Subscription
                            </th>
                            <th className="py-2.5 px-3 text-left text-xs font-bold text-[#0C3D2E] uppercase tracking-wider">
                                Verification
                            </th>
                            <th className="py-2.5 px-3 text-left text-xs font-bold text-[#0C3D2E] uppercase tracking-wider">
                                Joined On
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {visibleClinics.length ? (
                            visibleClinics.map((clinic) => {
                                const displayId = getClinicDisplayId(clinic);
                                const rowKey =
                                    displayId ||
                                    clinic._id ||
                                    clinic.name ||
                                    clinic.contactEmail;

                                return (
                                    <tr
                                        key={rowKey}
                                        className="hover:bg-[#D9E8E3]/20 transition-colors"
                                    >
                                        <td className="py-3 px-3 text-[#F7931E] font-semibold text-xs">
                                            {displayId}
                                        </td>

                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-[#0C3D2E]">
                                                    {getInitials(clinic.name)}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="text-[#0C3D2E] font-semibold truncate">
                                                        {clinic.name}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 truncate">
                                                        {clinic.subscriptionStatus || "Unknown subscription"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3 px-3 text-gray-500">
                                            {clinic.contactEmail || "-"}
                                        </td>

                                        <td className="py-3 px-3">
                                            <span className={getBadgeClass(clinic.subscriptionStatus, getSubscriptionTone(clinic.subscriptionStatus))}>
                                                {clinic.subscriptionStatus || "Unknown"}
                                            </span>
                                        </td>

                                        <td className="py-3 px-3">
                                            <span className={getBadgeClass(clinic.verificationStatus, getVerificationTone(clinic.verificationStatus))}>
                                                {clinic.verificationStatus || "Unknown"}
                                            </span>
                                        </td>

                                        <td className="py-3 px-3 text-gray-500 text-xs">
                                            {formatDate(clinic.createdAt)}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="py-8 text-center text-sm text-gray-400 font-medium"
                                >
                                    No recent clinic records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ClientActivity;
