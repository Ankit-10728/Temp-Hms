import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

function ReportsHeader() {
    return (
        <div className="mb-6 md:mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-[#EEF6F3] p-5 md:p-6 rounded-2xl shadow-xs border border-[#0C3D2E]/15 transition-all">
            
            {/* LEFT SECTION WITH ICON */}
            <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#0C3D2E] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BarChart3 size={22} />
                </div>

                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl sm:text-2xl font-black text-[#0C3D2E] tracking-tight">
                        Reports & Analytics
                    </h1>

                    <p className="max-w-2xl text-xs sm:text-sm font-semibold text-[#0C3D2E]/70">
                        Generate, export and analyze platform reports across clinics,
                        veterinarians, subscriptions, revenue and verification data.
                    </p>
                </div>
            </div>

            {/* RIGHT BUTTON */}
            <Link
                to="/superadmin/reports/basic"
                className="w-full lg:w-auto inline-flex items-center justify-center rounded-xl bg-[#F7931E] hover:bg-[#e08319] px-5 py-2.5 text-xs font-bold text-white transition-all duration-200 shadow-xs transform hover:-translate-y-0.5 cursor-pointer"
            >
                Open Basic Reports
            </Link>
        </div>
    );
}

export default ReportsHeader;