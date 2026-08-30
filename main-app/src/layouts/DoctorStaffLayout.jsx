import { Outlet, useLocation } from "react-router-dom";
import { DoctorSidebar } from "../modules/clinicadmin/components";

function DoctorLayout() {
  const location = useLocation();
  const pageTitles = {
    "/clinic/doctor": "Dashboard",
    "/clinic/doctor/pending": "Pending Patients",
    "/clinic/doctor/completed": "Completed Cases",
    "/clinic/doctor/history": "Patient History",
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#F7F9F9]">
      <DoctorSidebar />
      <main className="min-h-screen flex-1 overflow-y-auto bg-[#F7F9F9] pt-16 md:pl-[260px] md:pt-0">
        <header className="hidden h-[72px] items-center border-b border-slate-100 bg-white px-6 lg:flex lg:px-8">
          <h1 className="text-xl font-bold tracking-tight text-[#0C3D2E]">{pageTitles[location.pathname] || "Doctor Station"}</h1>
        </header>
        <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}

export default DoctorLayout;
