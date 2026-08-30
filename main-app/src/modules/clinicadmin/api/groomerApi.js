import API from "../../../shared/api/axios";

const BASE_URL = "/clinic/groomers";

export const getGroomers = async () => {
    const res = await API.get(BASE_URL);
    return res.data;
};

export const getGroomerById = async (id) => {
    const res = await API.get(`${BASE_URL}/${id}`);
    return res.data;
};

export const createGroomer = async (groomerData) => {

    const formData = buildGroomerFormData(groomerData);

    console.log(Object.fromEntries(formData));

    const res = await API.post(
        `${BASE_URL}/create`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return res.data;
};

export const updateGroomer = async (id, groomerData) => {
    const formData = buildGroomerFormData(groomerData);

    const res = await API.put(
        `${BASE_URL}/${id}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return res.data;
};

export const deleteGroomer = async (id) => {
    const res = await API.delete(`${BASE_URL}/${id}`);
    return res.data;
};

const buildGroomerFormData = (groomer) => {
    const formData = new FormData();

    // Basic details
    formData.append(
        "experience",
        Number(groomer.experience) || 0
    );

    formData.append(
        "previousSalon",
        groomer.previousSalon || ""
    );

    formData.append(
        "licenseNumber",
        groomer.licenseNumber || ""
    );

    formData.append(
        "dateOfJoining",
        groomer.dateOfJoining || ""
    );

    // Certificates
    formData.append(
        "certificates",
        JSON.stringify(groomer.certificates || [])
    );

    // Certificate documents (multiple files)
    if (groomer.documents?.length > 0) {
        groomer.documents.forEach((file) => {
            formData.append("certificateDocument", file);
        });
    }


    if (groomer.certified) {
        formData.append("certified", groomer.certified);
    }


    // Arrays
    formData.append(
        "species",
        JSON.stringify(groomer.species || [])
    );

    formData.append(
        "services",
        JSON.stringify(groomer.services || [])
    );

    // Shift details
    formData.append(
        "shift",
        groomer.shift || ""
    );

    formData.append(
        "shiftStart",
        groomer.shiftStart || ""
    );

    formData.append(
        "shiftEnd",
        groomer.shiftEnd || ""
    );

    // Other details
    formData.append(
        "weeklyDays",
        JSON.stringify(groomer.weeklyDays || [])
    );

    formData.append(
        "onCall",
        groomer.onCall || ""
    );

    formData.append(
        "tools",
        groomer.tools || ""
    );

    formData.append(
        "specialBreeds",
        groomer.specialBreeds || ""
    );

    formData.append(
        "status",
        groomer.status || "Active"
    );

    if (groomer.department) {
        formData.append("department", groomer.department);
    }

    formData.append(
        "supervisor",
        groomer.supervisor || ""
    );

    formData.append(
        "notes",
        groomer.notes || ""
    );

    return formData;
};