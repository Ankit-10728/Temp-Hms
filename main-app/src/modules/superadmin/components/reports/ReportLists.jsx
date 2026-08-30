import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { downloadReportSnapshot } from "./reportDownload";

function ReportList({ category, catalog, catalogLoading = false }) {
    const [downloadingReport, setDownloadingReport] = useState("");

    const reports = category?.reports ?? [];

    const handleExport = async (report) => {
        if (!catalog) {
            return;
        }

        setDownloadingReport(report.key);

        try {
            downloadReportSnapshot({
                category,
                report,
                catalog,
            });
        } catch (error) {
            console.error("Failed to export backend report:", error);
        } finally {
            setDownloadingReport("");
        }
    };

    return (
        <div className="space-y-4">
            {catalogLoading ? (
                <div className="rounded-2xl border border-[#F7931E]/20 bg-[#FFF4E5] px-4 py-3 text-xs font-bold text-[#F7931E]">
                    Loading backend report data...
                </div>
            ) : null}

            {reports.map((report) => (
                <div
                    key={report.key}
                    className="
                        bg-white
                        border
                        border-gray-100
                        rounded-2xl
                        p-4 md:p-5
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-4
                        shadow-xs
                        hover:shadow-md
                        hover:border-[#F7931E]/40
                        transition-all
                        duration-200
                    "
                >
                    {/* Left */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-2xl bg-[#FFF4E5] flex items-center justify-center shrink-0">
                            <FileText
                                size={20}
                                className="text-[#F7931E]"
                            />
                        </div>

                        <div className="min-w-0">
                            <h3 className="font-bold text-sm md:text-base text-[#0C3D2E] break-words tracking-tight">
                                {report.title}
                            </h3>

                            <p className="text-xs font-medium text-gray-400 mt-0.5">
                                Download a backend-backed PDF report
                            </p>
                        </div>
                    </div>

                    {/* Right */}
                    <button
                        type="button"
                        onClick={() => handleExport(report)}
                        disabled={catalogLoading || !catalog || downloadingReport === report.key}
                        className="
                            w-full
                            sm:w-auto
                            flex
                            items-center
                            justify-center
                            gap-2
                            bg-[#F7931E]
                            hover:bg-[#e08319]
                            text-white
                            px-5
                            py-2.5
                            rounded-xl
                            text-xs
                            font-bold
                            transition-all
                            duration-200
                            shadow-xs
                            shrink-0
                            cursor-pointer
                            disabled:opacity-60
                            disabled:cursor-not-allowed
                        "
                    >
                        <Download size={15} />
                        {downloadingReport === report.key ? "Preparing..." : "Export PDF"}
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ReportList;