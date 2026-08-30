import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    FlaskConical,
    CreditCard,
    Scissors,
    PawPrint,
    BarChart3,
    Settings,
    LogOut,
    X,
    ShieldCheck,
} from "lucide-react";
import { showToast } from "../../../../shared/components/toast";
import { getSessionProfile } from "../../../../shared/utils/sessionProfile";


const getStoredUserEmail = () => {
    const storedEmail = localStorage.getItem("userEmail");

    if (storedEmail) return storedEmail;

    try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        return storedUser.email || "";
    } catch {
        return "";
    }
};


export default function Sidebar({ isOpen = false, onClose }) {

    const navigate = useNavigate();

    const profile = getSessionProfile("CLINIC_ADMIN", "Clinic Admin");
    const userInitial = (profile.name?.[0] || "C").toUpperCase();


    const menu = [
        {
            name: "Dashboard",
            path: "/clinic",
            icon: LayoutDashboard,
            end: true
        },
        {
            name: "Staff",
            path: "/clinic/staff",
            icon: Users
        },
        {
            name: "Doctors",
            path: "/clinic/doctors",
            icon: Stethoscope
        },
        {
            name: "Lab Technician",
            path: "/clinic/lab-technician",
            icon: FlaskConical
        },
        {
            name: "Subscription",
            path: "/clinic/subscription",
            icon: CreditCard
        },
        {
            name: "Groomer",
            path: "/clinic/groomer",
            icon: Scissors,
            disabled: true
        },
        {
            name: "Kennel",
            path: "/clinic/kennel",
            icon: PawPrint,
            disabled: true
        },
        {
            name: "Reports",
            path: "/clinic/reports",
            icon: BarChart3,
            disabled: true
        },
        {
            name: "Settings",
            path: "/clinic/settings",
            icon: Settings,
            disabled: true
        },
    ];


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("passwordResetRequired");
        localStorage.removeItem("userEmail");


        showToast({
            type: "success",
            title: "Logout Successful",
            description: "You have been logged out",
        });


        navigate("/login", {
            replace: true
        });

        onClose?.();
    };


    return (
        <>


            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 lg:hidden ${
                    isOpen
                        ? "opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
                onClick={onClose}
            />



            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 h-screen w-65 
                bg-[#0C3D2E] text-white
                transition-transform duration-300 ease-out
                lg:sticky lg:top-0 lg:z-auto
                lg:translate-x-0
                ${
                    isOpen
                    ? "translate-x-0"
                    : "-translate-x-full"
                }
                flex flex-col
                px-4 py-5 shadow-xl`}
            >


                <div className="flex flex-col min-h-0 flex-1">

                    {/* Header */}
                    <div className="flex items-center justify-between px-2 shrink-0">

                        <h2 className="flex items-center gap-2.5 text-lg font-bold">

                            <ShieldCheck
                                size={24}
                                className="text-[#F7931E]"
                            />

                            Clinic Admin

                        </h2>


                        <button
                            onClick={onClose}
                            className="
                            lg:hidden
                            flex h-8 w-8 items-center justify-center
                            rounded-lg bg-white/10
                            hover:bg-white/20
                            "
                        >
                            <X size={18}/>
                        </button>


                    </div>



                    {/* Menu */}

                    <nav className="mt-8 space-y-1.5 flex-1 min-h-0 overflow-y-auto">


                        {menu.map((item)=>{


                            const Icon=item.icon;



                            if(item.disabled){

                                return (

                                    <div
                                        key={item.name}
                                        className="
                                        flex items-center justify-between
                                        px-4 py-3 rounded-xl
                                        text-xs font-semibold
                                        text-white/40
                                        cursor-not-allowed
                                        "
                                    >

                                        <div className="flex items-center gap-3">

                                            <Icon size={18}/>

                                            {item.name}

                                        </div>



                                        <span
                                            className="
                                            rounded-full
                                            bg-white/10
                                            px-2 py-0.5
                                            text-[10px]
                                            font-bold
                                            text-[#F7931E]
                                            border
                                            border-[#F7931E]/30
                                            "
                                        >
                                            Soon
                                        </span>


                                    </div>

                                )

                            }




                            return (

                                <NavLink

                                    key={item.name}

                                    to={item.path}

                                    end={item.end}

                                    onClick={onClose}


                                    className={({isActive})=>

                                    `
                                    flex items-center gap-3
                                    px-4 py-3 rounded-xl
                                    text-xs font-bold
                                    transition-all duration-200

                                    ${
                                        isActive
                                        ?
                                        "bg-[#F7931E] text-white shadow-sm"
                                        :
                                        "text-white/70 hover:bg-white/10 hover:text-white"
                                    }
                                    `
                                    }

                                >

                                    <Icon size={18}/>

                                    {item.name}


                                </NavLink>

                            )

                        })}


                    </nav>


                </div>



                {/* Footer */}

                <div className="
                shrink-0
                space-y-3
                pt-4
                border-t
                border-white/10
                ">


                    <div
                        className="
                        flex items-center gap-3
                        px-3 py-2
                        bg-white/5
                        rounded-xl
                        border border-white/10
                        "
                    >

                        <div
                            className="
                            w-9 h-9 rounded-full
                            bg-[#F7931E]
                            flex items-center justify-center
                            font-black text-xs
                            "
                        >
                            {userInitial}
                        </div>



                        <div className="min-w-0">

                            <p className="
                            text-xs
                            font-bold
                            ">
                                {profile.name}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-white/60" title={profile.email}>
                                {profile.email}
                            </p>


                        </div>


                    </div>

                    <button
                        onClick={handleLogout}
                        className="
                        w-full flex items-center justify-center
                        gap-2.5 px-4 py-2.5
                        rounded-xl
                        text-xs font-bold
                        text-rose-300
                        hover:bg-rose-500/10
                        hover:text-rose-200
                        transition
                        "
                    >

                        <LogOut size={16}/>

                        Logout

                    </button>


                </div>



            </aside>

        </>
    );
}
