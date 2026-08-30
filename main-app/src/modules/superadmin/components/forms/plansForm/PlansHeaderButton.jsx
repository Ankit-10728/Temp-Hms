import { Plus, CreditCard } from "lucide-react";

export default function PlansHeaderButton({ onAdd }) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-[#EEF6F3] p-5 md:p-6 rounded-2xl shadow-xs border border-[#0C3D2E]/15 transition-all">

            {/* LEFT SECTION WITH ICON */}
            <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#0C3D2E] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CreditCard size={22} />
                </div>

                <div>
                    <h1 className="text-xl md:text-2xl font-black text-[#0C3D2E] tracking-tight">
                        Clinic and Solo Doctor Plans
                    </h1>
                    <p className="text-xs md:text-sm font-semibold text-[#0C3D2E]/70 mt-0.5">
                        Manage the plan catalogue for clinics and independent doctors
                    </p>
                </div>
            </div>

            {/* RIGHT BUTTON */}
            <button
                type="button"
                onClick={onAdd}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#F7931E] hover:bg-[#e08319] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
                <Plus size={16} />
                Add Plan
            </button>

        </div>
    );
}