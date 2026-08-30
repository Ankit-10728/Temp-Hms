import API from "../../../shared/api/axios";

const BASE_URL = "/clinic/lab-module";

const buildLabTechnicianFormData = (data = {}) => {
  const formData = new FormData();

  formData.append("employeeId", data.employeeId || "");
  formData.append("qualification", data.qualification || "");
  formData.append("diploma", data.diploma || "");
  formData.append("experience", data.experience || "");
  formData.append("specializedTests", JSON.stringify(data.specializedTests || []));
  formData.append("shift", data.shift || "");
  formData.append("status", data.status || "Active");

  if (data.certificate) {
    formData.append("certificate", data.certificate);
  }

  return formData;
};

export const getLabTechnicians = async () => {
  const res = await API.get(BASE_URL);
  return res.data;
};

export const createLabTechnician = async (data) => {
  const res = await API.post(`${BASE_URL}/create`, buildLabTechnicianFormData(data));
  return res.data;
};

export const updateLabTechnician = async (id, data) => {
  const res = await API.put(`${BASE_URL}/${id}`, buildLabTechnicianFormData(data));
  return res.data;
};

export const deleteLabTechnician = async (id) => {
  const res = await API.delete(`${BASE_URL}/${id}`);
  return res.data;
};

export const verifyLabTechnician = async (id) => {
  const res = await API.post(`${BASE_URL}/${id}/verify`);
  return res.data;
};
