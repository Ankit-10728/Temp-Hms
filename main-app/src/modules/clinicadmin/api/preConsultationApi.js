import API from "../../../shared/api/axios";

const BASE_URL = "/clinic/pre-consultation";

/* GET ALL PENDING PETS */
export const getPendingPets = async () => {
    const res = await API.get(`${BASE_URL}/pending`);
    console.log("Pending Pets");
    console.log(res.data);
    return res.data;
};

export const completePreConsultation = async ({
    visitId,
    preConsultationData,
}) => {

    const res = await API.put(
        `${BASE_URL}/${visitId}`,
        preConsultationData
    );

    return res.data;
};

export const getCompletedPets = async () => {
    const res = await API.get(`${BASE_URL}/completed`);
    return res.data;
};

export const getHistoryPets = async () => {
    const res = await API.get(`${BASE_URL}/history`);
    return res.data;
};

export const getDashboard = async () => {
    const res = await API.get(`${BASE_URL}/dashboard`);
    return res.data;
};

export const deletePreConsultationVisit = async (visitId) => {
    const res = await API.delete(`${BASE_URL}/${visitId}`);
    return res.data;
};

// /* GET SINGLE PENDING PET */
// export const getPendingPetById = async (id) => {
//     const res = await API.get(`${BASE_URL}/${id}`);
//     return res.data;
// };

// /* UPDATE PRE CONSULTATION */
// export const updatePreConsultation = async (id, data) => {
//     const res = await API.put(`${BASE_URL}/${id}`, data);
//     return res.data;
// };


