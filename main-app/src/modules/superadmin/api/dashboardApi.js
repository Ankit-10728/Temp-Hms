import API from "../../../shared/api/axios";

export async function fetchSuperAdminDashboard() {
    const response = await API.get("/super-admin/dashboard");
    return response?.data?.data || {};
}
