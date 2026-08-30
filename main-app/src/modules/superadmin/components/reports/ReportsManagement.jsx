import { useEffect, useState } from "react";

import ReportsHeader from "./ReportHeader";
import ReportModal from "./ReportModal";
import ReportsGrid from "./ReportsGrid";

import { reportCategories } from "./ReportCategories";
import { fetchSuperAdminReportCatalog } from "./reportsApi";

function ReportsManagement() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [reportCatalog, setReportCatalog] = useState(null);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogError, setCatalogError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadCatalog = async () => {
            try {
                setCatalogLoading(true);
                setCatalogError("");

                const data = await fetchSuperAdminReportCatalog();

                if (cancelled) return;

                setReportCatalog(data);
            } catch (error) {
                if (cancelled) return;
                setCatalogError(
                    error?.response?.data?.message ||
                        error.message ||
                        "Failed to load backend report data."
                );
            } finally {
                if (!cancelled) {
                    setCatalogLoading(false);
                }
            }
        };

        loadCatalog();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 md:space-y-8">

            <ReportsHeader />

            {catalogError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {catalogError}
                </div>
            ) : null}

            <ReportsGrid
                categories={reportCategories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
            />

            {selectedCategory && (
                <ReportModal
                    category={selectedCategory}
                    catalog={reportCatalog}
                    catalogLoading={catalogLoading}
                    onClose={() => setSelectedCategory(null)}
                />
            )}
        </div>
    );
}

export default ReportsManagement;
