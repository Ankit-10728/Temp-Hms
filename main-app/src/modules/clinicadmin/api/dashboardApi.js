import API from "../../../shared/api/axios";

const BASE_URL = "/clinic";

export async function fetchClinicDashboard() {
  const res = await API.get(`${BASE_URL}/dashboard`);
  return res.data;
}
