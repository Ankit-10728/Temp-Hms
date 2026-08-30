import { BriefcaseBusiness, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../shared/api/axios";
import { getDashboardPathForRole, normalizeRole } from "../../../shared/utils/roleRedirects";

const labelForRole = (role) => String(role).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function RoleSelection() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("roleSelectionToken");
  const [roles] = useState(() => JSON.parse(sessionStorage.getItem("availableRoles") || "[]"));
  const [loadingRole, setLoadingRole] = useState("");

  const chooseRole = async (role) => {
    setLoadingRole(role);
    try {
      const { data } = await API.post("/auth/select-role", { roleSelectionToken: token, role });
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", normalizeRole(data.role));
      localStorage.setItem("availableRoles", JSON.stringify(data.roles || roles));
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      sessionStorage.removeItem("roleSelectionToken");
      sessionStorage.removeItem("availableRoles");
      const dashboard = getDashboardPathForRole(data.role);
      navigate(dashboard || "/unauthorized", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Unable to select this role.");
      if (error.response?.status === 401) navigate("/login", { replace: true });
    } finally {
      setLoadingRole("");
    }
  };

  if (!token || !roles.length) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 flex items-center justify-center">
      <section className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <BriefcaseBusiness className="h-10 w-10 text-emerald-700" />
        <h1 className="mt-5 text-3xl font-bold text-slate-900">Choose a dashboard</h1>
        <p className="mt-2 text-slate-600">Select the role you want to use for this session.</p>
        <div className="mt-7 space-y-3">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => chooseRole(role)}
              disabled={Boolean(loadingRole)}
              className="w-full rounded-2xl border border-slate-200 p-5 text-left flex items-center gap-4 hover:border-emerald-600 hover:bg-emerald-50 disabled:opacity-60"
            >
              <span className="flex-1">
                <span className="block font-semibold text-slate-900">Continue as {labelForRole(role)}</span>
                <span className="mt-1 block text-sm text-slate-500">Open {labelForRole(role)} Dashboard</span>
              </span>
              <ChevronRight className="text-emerald-700" />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
