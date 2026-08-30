import API from "../../../shared/api/axios";

const appendValue = (formData, key, value) => {
    if (value === undefined || value === null || value === "") {
        return;
    }

    if (Array.isArray(value) || (typeof value === "object" && !(value instanceof File))) {
        formData.append(key, JSON.stringify(value));
        return;
    }

    formData.append(key, value);
};

const buildDoctorFormData = (doctorData = {}) => {
    const formData = new FormData();

    [
        "fullName",
        "gender",
        "dob",
        "mobile",
        "email",
        "address",
        "city",
        "state",
        "pincode",
        "govtIdType",
        "govtIdNumber",
        "experience",
        "vetCouncilRegistrationNumber",
        "stateVetCouncil",
        "certificateValidityDate",
        "isRenewable",
        "practiceType",
        "consultationFee",
        "emergencyAvailable",
        "gstPan",
        "accountName",
        "accountNumber",
        "ifsc",
        "bankName",
        "branch",
        "plan",
    ].forEach((key) => appendValue(formData, key, doctorData[key]));

    appendValue(formData, "languages", doctorData.languages || []);
    appendValue(formData, "specializations", doctorData.specializations || []);
    appendValue(formData, "serviceAreas", doctorData.serviceAreas || []);
    appendValue(formData, "qualifications", doctorData.qualifications || []);
    appendValue(formData, "bankDetails", doctorData.bankDetails || {});

    if (doctorData.profilePhoto) {
        formData.append("profilePhoto", doctorData.profilePhoto);
    }

    if (doctorData.govtIdDocument) {
        formData.append("govtIdDocument", doctorData.govtIdDocument);
    }

    if (doctorData.registrationCertificate) {
        formData.append("registrationCertificate", doctorData.registrationCertificate);
    }

    if (doctorData.degreeCertificates) {
        const certificates = Array.isArray(doctorData.degreeCertificates)
            ? doctorData.degreeCertificates
            : [doctorData.degreeCertificates];
        certificates.forEach((file) => formData.append("degreeCertificates", file));
    }

    return formData;
};

export const createDoctor = async (doctorData) => {
    const formData = buildDoctorFormData(doctorData);
    const res = await API.post("/super-admin/veterinarians", formData);
    return res.data;
};

export const getDoctors = async (params = {}) => {
    const res = await API.get("/super-admin/veterinarians", { params });
    return res.data;
};

export const deleteDoctor = async (id) => {
    const res = await API.delete(`/super-admin/veterinarians/${id}`);
    return res.data;
};

export const updateDoctorStatus = async (id, status) => {
    const res = await API.put(`/super-admin/veterinarians/${id}/status`, { status });
    return res.data;
};

export const updateDoctor = async (id, doctorData) => {
    const formData = buildDoctorFormData(doctorData);
    const res = await API.put(`/super-admin/veterinarians/${id}`, formData);
    return res.data;
};
