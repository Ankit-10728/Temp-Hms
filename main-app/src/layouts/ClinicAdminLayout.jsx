import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../modules/clinicadmin/components";

function ClinicAdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const pageTitle = useMemo(() => {
        const titles = {
            "/clinic": "Dashboard",
            "/clinic/staff": "Staff",
            "/clinic/doctors": "Doctors",
            "/clinic/lab-technician": "Lab Technician",
            "/clinic/groomer": "Groomer",
            "/clinic/kennel": "Kennel",
            "/clinic/reports": "Reports",
            "/clinic/settings": "Settings",
        };

        return titles[location.pathname] || "Clinic Admin";
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 min-w-0 overflow-y-auto h-screen">
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#EAE5DC] bg-white px-4 py-3 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EAE5DC] bg-white text-[#1A1D2E]"
                        aria-label="Open clinic admin menu"
                    >
                        <Menu size={22} />
                    </button>

                    <div className="min-w-0 px-3 text-center">
                        <p className="truncate font-['Syne'] text-base font-bold text-[#1A1D2E]">
                            {pageTitle}
                        </p>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#E8630A]">
                            Clinic Admin
                        </p>
                    </div>

                    <div className="h-10 w-10" />
                </div>

                <div className="p-4 sm:p-5 lg:p-6">
                <Outlet />
                </div>
            </div>
        </div>
    );
}

export default ClinicAdminLayout;
