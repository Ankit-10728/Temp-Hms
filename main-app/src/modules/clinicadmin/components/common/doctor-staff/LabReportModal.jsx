export default function LabReportModal({
    open,
    onClose,
    report,
    onCompleteCase
}) {
    if (!open) return null;

    const petName = report?.pet?.petName || report?.pet?.name || report?.petId?.name || report?.petName || "Patient";
    const ownerName = report?.owner?.ownerName || report?.petId?.ownerId?.ownerName || report?.ownerName || "Owner";
    const tokenNumber = report?.tokenNumber || report?.visit?.tokenNumber || report?.visitId?.tokenNumber || "N/A";

    const handleDownloadPDF = async (fileUrl, testName, fileName) => {
        if (!fileUrl) return;
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            const safeName = fileName || `${testName || "Lab_Report"}.pdf`;
            link.download = safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Blob download error:", error);
            window.open(fileUrl, "_blank");
        }
    };

    return (
        <>
            {open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999]">
                    <div className="bg-white w-[1000px] max-w-[96%] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-5 flex justify-between items-center shadow-sm">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">
                                    Laboratory Reports & Diagnostic Results
                                </h2>
                                <p className="text-sm opacity-90 mt-1 font-medium">
                                    Pet: <span className="font-bold text-white">{petName}</span> • Owner: <span className="font-bold text-white">{ownerName}</span>
                                </p>
                            </div>

                            <button
                                onClick={() => onClose(false)}
                                className="text-2xl hover:opacity-80 cursor-pointer border-none bg-transparent text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 max-h-[75vh] overflow-y-auto space-y-6">
                            {/* Patient Info Summary Card */}
                            <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-5 shadow-xs">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Token Number</p>
                                        <p className="font-bold text-slate-800 text-base">{tokenNumber}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Owner Name</p>
                                        <p className="font-bold text-slate-800 text-base">{ownerName}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Pet Name</p>
                                        <p className="font-bold text-slate-800 text-base">{petName}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Lab Status</p>
                                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs mt-1 border border-emerald-300/60">
                                            <span>✓</span> Completed
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-slate-800">Uploaded Lab Reports & Tests</h3>

                            <div className="space-y-4">
                                {report?.reports && report.reports.length > 0 ? (
                                    report.reports.map((item, index) => (
                                        <div
                                            key={index}
                                            className="border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div>
                                                <h4 className="font-bold text-orange-600 text-base">
                                                    {item.testName || `Test #${index + 1}`}
                                                </h4>
                                                <p className="text-sm text-slate-600 mt-1 font-medium">
                                                    <span className="text-slate-400">File Name:</span> {item.fileName || "Uploaded Attachment"}
                                                </p>
                                            </div>
                                            {item.fileUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownloadPDF(item.fileUrl, item.testName, item.fileName)}
                                                    className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-sm border-none text-xs cursor-pointer shrink-0"
                                                >
                                                    View / Download PDF
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm text-center">
                                        No attachment files uploaded for this report.
                                    </div>
                                )}
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="font-bold text-slate-800 text-sm block mb-2">Lab Technician Remarks</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 text-sm font-medium">
                                    {report?.remarks || "No additional lab remarks provided."}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer with "Completed Case" Button */}
                        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => onClose(false)}
                                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    onClose(false);
                                    if (onCompleteCase) onCompleteCase();
                                }}
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5 border-none"
                            >
                                <span>✅</span> Completed Case
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}