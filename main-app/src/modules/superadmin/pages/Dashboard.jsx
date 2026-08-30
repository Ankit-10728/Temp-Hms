import { useEffect, useState } from "react";
import { Building2, ClipboardList, IndianRupee, Users } from "lucide-react";

import BottomGrid from "../components/BottomGrid";
import ClientActivity from "../components/ClientActivity";
import StatsCards from "../components/Statscards";
import { fetchSuperAdminDashboard } from "../api/dashboardApi";

const EMPTY_DASHBOARD = {
    recentClinics: [],
    revenueTrend: [],
    verificationDistribution: [],
    verificationSummary: {},
    revenueComparison: {},
};

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
        Number(value || 0)
    );

const formatCurrency = (value) =>
    `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
        Number(value || 0)
    )}`;

const formatRevenueChange = (comparison = {}) => {
    const current = Number(comparison.currentMonthRevenue || 0);
    const previous = Number(comparison.previousMonthRevenue || 0);

    if (!previous) {
        return current ? `${formatCurrency(current)} this month` : "No revenue yet";
    }

    const difference = current - previous;
    const prefix = difference >= 0 ? "+" : "-";

    return `${prefix}${formatCurrency(Math.abs(difference))} vs last month`;
};

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await fetchSuperAdminDashboard();

                if (cancelled) return;

                setDashboardData({
                    ...EMPTY_DASHBOARD,
                    ...data,
                    recentClinics: Array.isArray(data?.recentClinics)
                        ? data.recentClinics
                        : [],
                    revenueTrend: Array.isArray(data?.revenueTrend)
                        ? data.revenueTrend
                        : [],
                    verificationDistribution: Array.isArray(
                        data?.verificationDistribution
                    )
                        ? data.verificationDistribution
                        : [],
                });
            } catch (requestError) {
                if (cancelled) return;

                setError(
                    requestError?.response?.data?.error ||
                        requestError?.response?.data?.message ||
                        requestError.message ||
                        "Failed to load super admin dashboard."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="p-4 sm:p-6">
                <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                    Loading super admin dashboard...
                </div>
            </div>
        );
    }

    const verificationSummary = dashboardData.verificationSummary || {};
    const pendingReviews =
        Number(verificationSummary.SUBMITTED || 0) +
        Number(verificationSummary.UNDER_REVIEW || 0) +
        Number(verificationSummary.DOCS_VERIFIED || 0);

    const cards = [
        {
            label: "Total Clinics",
            value: formatNumber(dashboardData.totalClinics),
            change: `+${formatNumber(dashboardData.newClinicsThisMonth)} this month`,
            bg: "#3b82f6",
            icon: Building2,
        },
        {
            label: "Total Veterinarians",
            value: formatNumber(dashboardData.totalDoctors),
            change: `+${formatNumber(dashboardData.newDoctorsThisMonth)} this month`,
            bg: "#22c55e",
            icon: Users,
        },
        {
            label: "Active Plans",
            value: formatNumber(dashboardData.activePlans),
            change: `+${formatNumber(dashboardData.newPlansThisMonth)} this month`,
            bg: "#f97316",
            icon: ClipboardList,
        },
        {
            label: "Total Revenue",
            value: formatCurrency(dashboardData.totalRevenue),
            change: formatRevenueChange(dashboardData.revenueComparison),
            bg: "#8b5cf6",
            icon: IndianRupee,
        },
    ];

    const clinicSummary = {
        totalClinics: dashboardData.totalClinics || 0,
        submittedClinics: Number(verificationSummary.SUBMITTED || 0),
        activeClinics: dashboardData.activeClinics || 0,
        pendingReviews,
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            <StatsCards cards={cards} />

            <ClientActivity
                summary={clinicSummary}
                clinics={dashboardData.recentClinics}
            />

            <BottomGrid
                verificationData={dashboardData.verificationDistribution}
                revenueData={dashboardData.revenueTrend}
            />
        </div>
    );
};

export default Dashboard;
