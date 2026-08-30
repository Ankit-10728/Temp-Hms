import { X } from "lucide-react";
import ReportList from "./ReportLists";

function ReportModal({ category, catalog, catalogLoading, onClose }) {
    if (!category) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-0 md:p-4">

            <div
                className="
                    bg-white
                    w-full
                    md:w-[95%]
                    max-w-6xl
                    h-screen
                    md:h-[90vh]
                    rounded-none
                    md:rounded-3xl
                    shadow-2xl
                    overflow-hidden
                    flex
                    flex-col
                    border
                    border-gray-100
                "
            >
                {/* Header with Mint Background Style Matching Clinic Modal */}
                <div className="flex items-center justify-between border-b border-[#0C3D2E]/15 px-6 md:px-8 py-5 bg-[#EEF6F3] shrink-0">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0C3D2E] tracking-tight">
                            {category.title}
                        </h2>

                        <p className="text-[#0C3D2E]/70 text-xs md:text-sm mt-0.5 font-semibold">
                            Available reports for export
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            w-10 h-10
                            rounded-full
                            flex items-center justify-center
                            text-gray-400
                            hover:bg-[#0C3D2E]/10
                            hover:text-[#0C3D2E]
                            transition-colors
                            font-bold
                            cursor-pointer
                        "
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
                    <ReportList
                        category={category}
                        catalog={catalog}
                        catalogLoading={catalogLoading}
                    />
                </div>
            </div>

        </div>
    );
}

export default ReportModal;