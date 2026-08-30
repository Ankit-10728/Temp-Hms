import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getSessionProfile } from "../../../../shared/utils/sessionProfile";

const PetOwnerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const profile = getSessionProfile("OWNER", "Pet Owner");

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/clinic/owner",
      icon: "🏠",
    },
    {
      name: "History",
      path: "/clinic/owner/history",
      icon: "📋",
    },
    {
      name: "Upload Documents",
      path: "/clinic/owner/upload",
      icon: "📄",
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-[#020B2D] px-4 py-4 text-white shadow-lg lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-blue-500">
            🐾
          </div>

          <div>
            <h2 className="text-lg font-bold">
              Pet Owner
            </h2>
            <p className="text-xs text-slate-400">
              Healthcare Portal
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-white/10 p-2 text-xl"
        >
          ☰
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
  className={`fixed top-0 left-0 z-50 h-screen w-[85%] max-w-[280px] bg-[#020B2D] text-white shadow-2xl transition-transform duration-300 lg:hidden ${
    isOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-[55px] w-[55px] items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-500 text-2xl">
                🐾
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Pet Owner
                </h2>

                <p className="text-xs text-slate-400">
                  Healthcare Portal
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="p-4">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`mb-3 flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-300 ${
                  active
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <span>{item.icon}</span>

                <span className="font-medium">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#042B22] p-4">
          <p className="truncate text-xs font-bold text-white">{profile.name}</p>
          <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wide text-orange-300">{profile.role}</p>
          <p className="mt-1 truncate text-[10px] text-emerald-100/75">{profile.clinicName}</p>
          <p className="mt-1 truncate text-[10px] text-emerald-100/75" title={profile.email}>{profile.email}</p>
          <button onClick={handleLogout} className="mt-3 w-full rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20">Logout</button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-[280px] flex-col bg-[#020B2D] text-white shadow-2xl lg:flex">
        {/* Logo */}
        <div className="border-b border-white/10 p-6">
          <div className="mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-500 text-3xl">
            🐾
          </div>

          <h2 className="text-2xl font-bold">
            Pet Owner
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Healthcare Portal
          </p>
        </div>

        {/* Menu */}
        <div className="flex-1 p-4">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mb-3 flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-300 ${
                  active
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <span>{item.icon}</span>

                <span className="font-medium">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-white/10 bg-[#042B22] p-4">
          <p className="truncate text-sm font-bold text-white">{profile.name}</p>
          <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wide text-orange-300">{profile.role}</p>
          <p className="mt-1 truncate text-[11px] text-emerald-100/75">{profile.clinicName}</p>
          <p className="mt-1 truncate text-[11px] text-emerald-100/75" title={profile.email}>{profile.email}</p>
          <button onClick={handleLogout} className="mt-3 w-full rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-xs font-bold text-red-300 hover:bg-red-500/20">Logout</button>
        </div>
      </aside>
    </>
  );
};

export default PetOwnerSidebar;
