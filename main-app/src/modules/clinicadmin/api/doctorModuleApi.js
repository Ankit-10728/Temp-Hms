import API from "../../../shared/api/axios";

const BASE_URL = "/clinic/doctor-module";

export const getLabReportByVisit = async (visitId) => {

    console.log(visitId);

    const res = await API.get(
        `${BASE_URL}/report/lab/${visitId}`
    );

    return res.data;
};

export const getPreConsultationByVisit = async (visitId) => {
    const res = await API.get(
        `${BASE_URL}/report/pre-consultation/${visitId}`
    );

    return res.data;
};

/* GET PENDING PETS */
export const getPendingPets = async () => {
    const res = await API.get(`${BASE_URL}/pending-pets`);
    return res.data;
};

/* GET COMPLETED PETS */
export const getCompletedPets = async () => {
    const res = await API.get(`${BASE_URL}/completed-pets`);
    return res.data;
};

/* GET DASHBOARD */
export const getDashboard = async () => {
    const res = await API.get(`${BASE_URL}/dashboard`);
    return res.data;
};

/* GET HISTORY */
export const getHistory = async () => {
    const res = await API.get(`${BASE_URL}/history`);
    return res.data;
};

/* GET SINGLE PATIENT */
export const getPatient = async (id) => {
    const res = await API.get(`${BASE_URL}/patient/${id}`);
    return res.data;
};

/* UPDATE PATIENT */
export const updatePatient = async (id, patientData) => {
    console.log("from update patient from doctor : ", patientData);
    console.log(id);

    const res = await API.put(
        `${BASE_URL}/patient/${id}`,
        patientData
    );

    return res.data;
};

/* CREATE PATIENT */
export const createPatient = async (patientData) => {
    const res = await API.post(
        `${BASE_URL}/patient`,
        patientData
    );

    return res.data;
};

export const deletePatient = async (id) => {
    const res = await API.delete(`${BASE_URL}/patient/${id}`);
    return res.data;
};
