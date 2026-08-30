import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2, Layers, CheckCircle2, Building, UserCheck } from "lucide-react";
import { deletePlan, getPlans } from "../api/planApi";
import { showToast } from "../../../shared/components/toast";

const SOLO_DOCTOR_PLAN_NAMES = new Set(["Solo Basic", "Solo Pro"]);

const resolvePlanType = (plan) => {
    if (plan?.planType === "Solo Doctor") return "Solo Doctor";
    if (SOLO_DOCTOR_PLAN_NAMES.has(plan?.subscriptionPlan)) return "Solo Doctor";
    return "Clinic";
};

const FILTER_OPTIONS = ["All", "Clinic", "Solo Doctor"];

const getStatusClassName = (status) => {
    switch (status) {
        case "Inactive":
            return "bg-amber-100 text-amber-700";
        case "Archived":
            return "bg-slate-100 text-slate-600";
        default:
            return "bg-emerald-100 text-emerald-800";
    }
};

export default function ActivePlans({ refreshKey = 0, onViewPlan, onEditPlan, onChanged }) {
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadPlans = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getPlans();
                if (active) setPlans(response.data || []);
            } catch (err) {
                if (active) setError(err.response?.data?.message || "Unable to load plans");
            } finally {
                if (active) setLoading(false);
            }
        };

        loadPlans();

        return () => {
            active = false;
        };
    }, [refreshKey]);

    const stats = useMemo(() => {
        const typeCounts = plans.reduce(
            (accumulator, plan) => {
                const planType = resolvePlanType(plan);
                accumulator.total += 1;
                accumulator.active += !plan.status || plan.status === "Active" ? 1 : 0;
                accumulator[planType === "Solo Doctor" ? "soloDoctor" : "clinic"] += 1;
                return accumulator;
            },
            {
                total: 0,
                active: 0,
                clinic: 0,
                soloDoctor: 0,
            }
        );

        return typeCounts;
    }, [plans]);

    const visiblePlans = useMemo(
        () =>
            plans.filter((plan) => {
                const planType = resolvePlanType(plan);
                return selectedFilter === "All" || selectedFilter === planType;
            }),
        [plans, selectedFilter]
    );

    const formatDate = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString("en-IN");
    };

    const formatPrice = (value) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(Number(value || 0));

    const handleDelete = async (plan) => {
        const confirmed = window.confirm(
            `Delete ${plan.subscriptionPlan} (${resolvePlanType(plan)})? This cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deletePlan(plan._id);
            showToast({
                type: "success",
                title: "Plan Deleted",
                description: `${plan.subscriptionPlan} was removed successfully.`,
            });
            onChanged?.();
        } catch (err) {
            showToast({
                type: "error",
                title: "Delete Failed",
                description: err.response?.data?.message || "Unable to delete plan",
            });
        }
    };

    return (
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xs border border-gray-100 overflow-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
                <div>
                    <h2 className="text-base font-bold text-[#0C3D2E] tracking-tight">
                        Active Subscription Plans
                    </h2>
                    <p className="text-xs font-medium text-gray-400 mt-0.5">
                        Manage clinic and solo doctor plan definitions from one place
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS.map((option) => {
                        const count = option === "All"
                            ? stats.total
                            : option === "Solo Doctor"
                                ? stats.soloDoctor
                                : stats.clinic;

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setSelectedFilter(option)}
                                className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                                    selectedFilter === option
                                        ? "border-[#F7931E]/30 bg-[#FFF4E5] text-[#F7931E] shadow-xs"
                                        : "border-gray-200 text-gray-500 hover:bg-slate-50"
                                }`}
                            >
                                {option} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* DASHBOARD STATS CARDS WITH EXACT CARD COLOR STYLING */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-5 mb-4 border-b border-gray-100">
                {[
                    {
                        num: stats.total,
                        label: "TOTAL PLANS",
                        badge: `+${stats.total} total`,
                        theme: "mint",
                        icon: Layers,
                    },
                    {
                        num: stats.active,
                        label: "ACTIVE PLANS",
                        badge: `${stats.active} active`,
                        theme: "orange",
                        icon: CheckCircle2,
                    },
                    {
                        num: stats.clinic,
                        label: "CLINIC PLANS",
                        badge: `${stats.clinic} clinic`,
                        theme: "mint",
                        icon: Building,
                    },
                    {
                        num: stats.soloDoctor,
                        label: "SOLO DOCTOR PLANS",
                        badge: `${stats.soloDoctor} solo`,
                        theme: "orange",
                        icon: UserCheck,
                    },
                ].map((item) => {
                    const isOrange = item.theme === "orange";
                    const cardBg = isOrange ? "bg-[#FFF4E5]/60 border-[#F7931E]/20" : "bg-[#D9E8E3]/25 border-[#0C3D2E]/10";
                    const iconBoxBg = isOrange ? "bg-[#F7931E] text-white" : "bg-[#0C3D2E] text-white";
                    const badgeBg = isOrange ? "bg-[#F7931E]/15 text-[#F7931E]" : "bg-[#0C3D2E]/10 text-[#0C3D2E]";
                    const IconComponent = item.icon;

                    return (
                        <div key={item.label} className={`flex items-center gap-3 p-3 rounded-2xl border ${cardBg} shadow-xs`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${iconBoxBg}`}>
                                <IconComponent size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-lg font-extrabold text-[#0C3D2E] tracking-tight">{item.num}</div>
                                <div className="text-[11px] font-medium text-gray-400">{item.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-[1350px] w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <Header>Plan ID</Header>
                            <Header>Type</Header>
                            <Header>Subscription Plan</Header>
                            <Header>Billing</Header>
                            <Header>Price</Header>
                            <Header>Renewal</Header>
                            <Header>Doctors</Header>
                            <Header>Staff</Header>
                            <Header>Pet Records</Header>
                            <Header>Storage</Header>
                            <Header>Trial</Header>
                            <Header>Modules</Header>
                            <Header>Status</Header>
                            <Header>Actions</Header>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={14} className="py-8 px-3 text-center text-xs font-medium text-gray-400">
                                    Loading plans...
                                </td>
                            </tr>
                        )}

                        {!loading && visiblePlans.length === 0 && (
                            <tr>
                                <td colSpan={14} className="py-8 px-3 text-center text-xs font-medium text-gray-400">
                                    No {selectedFilter === "All" ? "" : `${selectedFilter.toLowerCase()} `}plans found.
                                </td>
                            </tr>
                        )}

                        {visiblePlans.map((plan) => {
                            const planType = resolvePlanType(plan);

                            return (
                                <tr key={plan._id} className="border-b border-gray-50 hover:bg-slate-50/60 transition-colors">
                                    <td className="py-3 px-3 text-[#F7931E] font-bold text-xs">
                                        #{plan.planCode || plan._id?.slice(-6)}
                                    </td>

                                    <td className="py-3 px-3">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${planType === "Solo Doctor" ? "bg-[#FFF4E5] text-[#F7931E]" : "bg-[#D9E8E3] text-[#0C3D2E]"}`}>
                                            {planType}
                                        </span>
                                    </td>

                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0 bg-[#0C3D2E]">
                                                {plan.subscriptionPlan?.slice(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-[#0C3D2E] text-xs whitespace-nowrap">
                                                {plan.subscriptionPlan}
                                            </span>
                                        </div>
                                    </td>

                                    <Cell>{plan.billingCycle}</Cell>
                                    <Cell>{formatPrice(plan.price)}</Cell>
                                    <Cell>{formatDate(plan.planEndRenewalDate)}</Cell>
                                    <Cell>{plan.featureLimits?.maxDoctors}</Cell>
                                    <Cell>{plan.featureLimits?.maxStaffAccounts}</Cell>
                                    <Cell>{plan.featureLimits?.maxPetRecordsUnlimited ? "Unlimited" : plan.featureLimits?.maxPetRecords}</Cell>
                                    <Cell>{plan.featureLimits?.storageLimitGb} GB</Cell>
                                    <Cell>{plan.trialPeriodDays || 0} days</Cell>
                                    <Cell>{Object.values(plan.modules || {}).filter(Boolean).length}</Cell>

                                    <td className="py-3 px-3">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${getStatusClassName(plan.status)}`}>
                                            {plan.status}
                                        </span>
                                    </td>

                                    <td className="py-3 px-3">
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => onViewPlan?.(plan)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#0C3D2E] transition hover:bg-[#D9E8E3]/40 cursor-pointer"
                                                title="View plan"
                                                aria-label="View plan"
                                            >
                                                <Eye size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onEditPlan?.(plan)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#F7931E]/30 bg-[#FFF4E5] text-[#F7931E] transition hover:bg-[#F7931E] hover:text-white cursor-pointer"
                                                title="Edit plan"
                                                aria-label="Edit plan"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(plan)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white cursor-pointer"
                                                title="Delete plan"
                                                aria-label="Delete plan"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Header({ children }) {
    return (
        <th className="py-3 px-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
            {children}
        </th>
    );
}

function Cell({ children }) {
    return <td className="py-3 px-3 text-xs font-medium text-gray-700 whitespace-nowrap">{children}</td>;
}