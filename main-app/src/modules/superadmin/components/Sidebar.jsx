import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    Users,
    ClipboardList,
    ShieldCheck,
    BarChart3,
    Settings,
    LogOut,
    X,
} from "lucide-react";
import { showToast } from "../../../shared/components/toast";

const getStoredAdminEmail = () => {
    const storedEmail = localStorage.getItem("userEmail");

    if (storedEmail) {
        return storedEmail;
    }

    try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        return storedUser.email || "";
    } catch {
        // Keep trying the token fallback below.
    }

    const token = localStorage.getItem("token");

    if (!token) {
        return "";
    }

    try {
        const [, payload] = token.split(".");
        const decodedPayload = JSON.parse(window.atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return decodedPayload.email || decodedPayload.sub || "";
    } catch {
        return "";
    }
};

export default function Sidebar({ isOpen = false, onClose }) {
    const navigate = useNavigate();
    const adminEmail = getStoredAdminEmail();
    const adminInitial = (adminEmail?.[0] || "A").toUpperCase();

    const menu = [
        { name: "Dashboard", path: "/superadmin", icon: LayoutDashboard, end: true },
        { name: "Clinics", path: "/superadmin/clinics", icon: Building2 },
        { name: "Veterinarian", path: "/superadmin/Veterinarian", icon: Users },
        { name: "Plans", path: "/superadmin/plans", icon: ClipboardList },
        { name: "Verification", path: "/superadmin/verification", icon: ShieldCheck, disabled: true },
        { name: "Reports", path: "/superadmin/reports", icon: BarChart3 },
        { name: "Settings", path: "/superadmin/settings", icon: Settings, disabled: true },
    ];

    const handleLogout = () => {
        console.log("Logout clicked");

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("passwordResetRequired");
        localStorage.removeItem("userEmail");

        showToast({
            type: "success",
            title: "Logout Successful",
            description: "You have been logged out",
        });

        navigate("/login", { replace: true });
        onClose?.();
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 lg:hidden ${
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={onClose}
            />

            {/* Sidebar Drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 h-screen w-65 shrink-0 transform bg-[#0C3D2E] text-white transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } flex flex-col justify-between px-4 py-5 shadow-xl`}
            >
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 px-2 pt-1">
                        <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white">
                            <ShieldCheck size={24} className="text-[#F7931E]" />
                            <span>
                                Super<span className="text-[#F7931E]">Admin</span>
                            </span>
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white lg:hidden"
                            aria-label="Close super admin menu"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="mt-8 space-y-1.5">
                        {menu.map((item) => {
                            const Icon = item.icon;

                            if (item.disabled) {
                                return (
                                    <div
                                        key={item.name}
                                        className="flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold text-white/40 cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={18} />
                                            {item.name}
                                        </div>

                                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-[#F7931E] border border-[#F7931E]/30">
                                            Soon
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    end={item.end}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                                            isActive
                                                ? "bg-[#F7931E] text-white shadow-xs"
                                                : "text-white/70 hover:bg-white/10 hover:text-white"
                                        }`
                                    }
                                >
                                    <Icon size={18} />
                                    {item.name}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Section */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors cursor-pointer"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>

                    <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                        <div className="w-9 h-9 rounded-full bg-[#F7931E] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                            {adminInitial}
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs font-bold text-white leading-snug">Super Admin</p>
                            <p className="truncate text-[11px] font-medium text-white/50">
                                {adminEmail || "Email unavailable"}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}