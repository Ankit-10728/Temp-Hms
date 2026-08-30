import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import AddClinicModal from "../components/forms/clinicForm/AddClinicModal";
import LatestClinicRequests from "../components/LatestClinicRequests";

function Clinics() {
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <AddClinicModal />

            <div className="rounded-2xl border border-[#F7931E]/30 bg-[#FFF4E5] px-5 py-4 shadow-xs sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-bold text-[#0C3D2E] tracking-tight">
                            Live Clinic Registry
                        </h2>

                        <p className="mt-0.5 text-xs md:text-sm font-medium text-gray-400">
                            Search and manage clinics synced from the backend.
                        </p>
                    </div>

                    <div className="w-full sm:max-w-sm">
                        <label htmlFor="clinic-search" className="sr-only">
                            Search clinics
                        </label>

                        <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 transition-all focus-within:border-[#F7931E] focus-within:ring-1 focus-within:ring-[#F7931E] shadow-2xs">
                            <Search size={18} className="text-gray-400 shrink-0" />

                            <input
                                id="clinic-search"
                                type="search"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Search by name, email, city, type, or plan..."
                                className="w-full bg-transparent text-xs sm:text-sm font-medium outline-none text-gray-800 placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <LatestClinicRequests searchTerm={searchTerm} />

            {/* <ClinicForm /> */}
        </div>
    );
}

export default Clinics;
