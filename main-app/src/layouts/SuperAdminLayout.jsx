import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../modules/superadmin/components/Sidebar";
import TopBar from "../modules/superadmin/components/TopBar";

function SuperAdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 min-w-0 overflow-y-auto h-screen">
                <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="p-4 sm:p-5 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default SuperAdminLayout;
