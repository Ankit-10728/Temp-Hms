import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

const Topbar = ({ onMenuClick }) => {
    const location = useLocation();

    const routeTitles = {
        "/superadmin": "Dashboard",
        "/superadmin/clinics": "Clinics",
        "/superadmin/veterinarian": "Veterinarian",
        "/superadmin/plans": "Plans",
        "/superadmin/verification": "Verification",
        "/superadmin/reports": "Reports",
        "/superadmin/settings": "Settings",
    };

    const title = routeTitles[location.pathname.toLowerCase()] || "Dashboard";

    return (
        <div className="sticky top-0 z-30 flex min-h-17.5 flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-[#0C3D2E] hover:bg-[#D9E8E3]/30 transition-colors lg:hidden"
                    aria-label="Open super admin menu"
                >
                    <Menu size={22} />
                </button>

                <h2 className="truncate font-bold text-lg text-[#0C3D2E] sm:text-xl tracking-tight">
                    {title}
                </h2>
            </div>

           
        </div>
    );
};

export default Topbar;