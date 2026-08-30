import { Outlet } from "react-router-dom";
import LabSidebar from "../modules/clinicadmin/pages/lab_pages/LabSidebar";

export default function LabLayout() {
    return (
        <div className="role-reception-theme min-h-screen bg-slate-50">
            <LabSidebar />

            <main className="lg:ml-[260px] min-h-screen pt-16 lg:pt-0">
                <Outlet />
            </main>
        </div>
    );
}
