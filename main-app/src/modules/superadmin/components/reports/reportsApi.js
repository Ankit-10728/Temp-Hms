import API from "../../../../shared/api/axios";

export async function fetchSuperAdminReportCatalog() {
  const res = await API.get("/super-admin-reports/catalog");
  return res?.data?.data || {};
}
