import { FileText, Download, CheckCircle, X, PawPrint, User, ShieldCheck } from "lucide-react";

export default function LabReportModal({
    open,
    onClose,
    report,
}) {
    if (!open || !report) return null;

    const petName = report.pet?.petName || report.pet?.name || "Patient";
    const ownerName = report.owner?.ownerName || "Owner";
    const mobile = report.owner?.mobileNumber || "N/A";
    const uniqueId = report.pet?.uniquePetId || "N/A";
    const species = report.pet?.species || "Pet";
    const breed = report.pet?.breed || "N/A";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 p-4 md:p-6 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="max-h-[92vh] w-[950px] max-w-[96%] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between bg-slate-900 px-6 md:px-8 py-5 text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-white">
                                Laboratory Diagnostic Report File
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-300">
                                Patient: <span className="text-white font-semibold">{petName}</span> • Owner: <span className="text-white font-semibold">{ownerName}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center font-bold text-lg transition-all border-none cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6 md:p-8 flex-1 text-xs">
                    {/* Patient Information Grid */}
                    <div>
                        <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <PawPrint className="w-4 h-4 text-orange-500" /> Patient & Case Metadata
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Unique Pet ID</p>
                                <p className="font-mono font-bold text-slate-800 mt-0.5">{uniqueId}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Pet Name</p>
                                <p className="font-bold text-slate-800 mt-0.5">{petName}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Owner Name</p>
                                <p className="font-bold text-slate-800 mt-0.5">{ownerName}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</p>
                                <p className="font-mono font-bold text-slate-800 mt-0.5">{mobile}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Report Status</p>
                                <span
                                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold mt-0.5 border ${
                                        report.status === "Completed"
                                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                            : report.status === "Critical"
                                                ? "bg-red-100 text-red-800 border-red-300"
                                                : "bg-amber-100 text-amber-800 border-amber-300"
                                    }`}
                                >
                                    {report.status || "Completed"}
                                </span>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Species / Breed</p>
                                <p className="font-bold text-slate-800 mt-0.5">{species} ({breed})</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Gender / Age</p>
                                <p className="font-bold text-slate-800 mt-0.5">{report.pet?.gender || "N/A"} / {report.pet?.age ? `${report.pet.age} yrs` : "N/A"}</p>
                            </div>

                            <div className="col-span-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Uploaded Timestamp</p>
                                <p className="font-bold text-slate-800 mt-0.5">
                                    {new Date(report.createdAt).toLocaleString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Uploaded Diagnostic Reports */}
                    <div>
                        <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-600" /> Uploaded Test Reports & Document Attachments
                        </h3>

                        <div className="space-y-3">
                            {report.reports?.length ? (
                                report.reports.map((item, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-slate-900 text-sm">
                                                    {item.testName || `Diagnostic Test #${index + 1}`}
                                                </h4>
                                                <p className="text-slate-500 text-[11px] font-medium mt-0.5">
                                                    File: <span className="text-slate-700 font-mono">{item.fileName || "Uploaded Document"}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {item.fileUrl && (
                                            <a
                                                href={item.fileUrl}
                                                download={`${item.fileName || item.testName || "Lab_Report"}.pdf`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 transition text-xs shadow-xs border-none cursor-pointer shrink-0"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>View / Download PDF Document</span>
                                            </a>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl">
                                    No diagnostic reports attached.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Remarks */}
                    {report.remarks && (
                        <div>
                            <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                                Technician Diagnostic Remarks
                            </h3>

                            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-slate-800 font-medium italic">
                                "{report.remarks}"
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition cursor-pointer border-none"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        </div>
    );
}