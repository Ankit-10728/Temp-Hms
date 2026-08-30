import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ReceptionSidebar } from "../modules/clinicadmin/components";

export default function ReceptionLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("reception-sidebar-collapsed") === "true";
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newVal = !prev;
      localStorage.setItem("reception-sidebar-collapsed", String(newVal));
      return newVal;
    });
  };

  const pageTitles = {
    "/clinic/reception": "Dashboard",
    "/clinic/reception/new-registration": "New Patient Registration",
    "/clinic/reception/existing-customer": "Existing Customer",
  };
  const pageTitle = pageTitles[location.pathname] || "Reception Desk";

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex overflow-hidden">
      <ReceptionSidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />

      <main
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out bg-[#F7F9F9] overflow-y-auto pt-16 md:pt-0 ${
          isCollapsed ? "md:pl-20" : "md:pl-[260px]"
        }`}
      >
        <header className="hidden md:flex h-[72px] items-center border-b border-slate-100 bg-white px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight text-[#0C3D2E]">{pageTitle}</h1>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

