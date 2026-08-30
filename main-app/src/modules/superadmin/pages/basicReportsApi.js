import API from "../../../shared/api/axios";

export async function fetchSuperAdminBasicReports() {
  const res = await API.get("/super-admin-reports/basic");
  return res?.data?.data || res?.data || {};
}

export async function downloadSuperAdminBasicReport(format = "pdf") {
  const res = await API.get("/super-admin-reports/basic/download", {
    params: { format },
    responseType: "blob",
  });

  return res;
}

export async function shareSuperAdminBasicReport(payload) {
  const res = await API.post("/super-admin-reports/basic/share", payload);
  return res?.data || {};
}

