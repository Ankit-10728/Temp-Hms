import API from "../../../shared/api/axios";

const BASE_URL = "/pet-owner";


export const getMyPets = async () => {
    const res = await API.get(`${BASE_URL}/pets`);
    return res.data;
};

export const getPetHistory = async (petId) => {
    const res = await API.get(
        `${BASE_URL}/history/${petId}`
    );
    return res.data;
};

export const uploadOwnerReport = async (formData) => {
    const res = await API.post(
        `${BASE_URL}/report/upload`,
        formData
    );

    return res.data;
};

export const getOwnerReports = async () => {
    const res = await API.get(
        `${BASE_URL}/report`
    );

    return res.data;
};

export const getReportById = async (id) => {
    const res = await API.get(
        `${BASE_URL}/report/${id}`
    );

    return res.data;
};

export const downloadReport = async (id) => {
    const res = await API.get(
        `${BASE_URL}/report/download/${id}`,
        {
            responseType: "blob",
        }
    );

    return res;
};

export const deleteOwnerReport = async (id) => {
    const res = await API.delete(
        `${BASE_URL}/report/${id}`
    );

    return res.data;
};