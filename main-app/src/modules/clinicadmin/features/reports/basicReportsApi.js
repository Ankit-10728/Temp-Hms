import API from "../../../../shared/api/axios";

export async function fetchClinicBasicDashboardSummary() {
  const res = await API.get("/clinic/reports/dashboard-summary");
  return res?.data || {};
}

export async function fetchClinicStaffRoleReport() {
  const res = await API.get("/clinic/reports/staff-role");
  return res?.data || [];
}

