import API from "../../../shared/api/axios";

const BASE_URL = "/clinic/reception";

export const createVisit = async (data) => {
    const res = await API.post(`${BASE_URL}/visits/create`, data);
    return res.data;
};

export const sendRegistrationOtp = async (mobileNumber) => {
    const response = await API.post(`${BASE_URL}/new-registration/send-otp`, {
        mobileNumber,
    });

    return response.data;
};

// Create Registration
export const registerOwnerAndPet = async (data) => {
    console.log("RAW FORM DATA:", data);

    const petsArray = Array.isArray(data.pets) && data.pets.length > 0
        ? data.pets.map(p => ({
            ...p,
            name: p.name || p.petName,
            petName: p.petName || p.name,
            species: p.species,
            breed: p.breed,
            gender: p.gender,
            dob: p.dob,
            age: p.age,
            color: p.color,
            rfid: p.rfid,
            identificationArea: p.identificationArea,
            sterilized: p.sterilized === "Yes" || p.sterilized === true,
            history: p.history || {},
            visit: p.visit || {}
        }))
        : [{
            name: data.petName || data.name,
            petName: data.petName || data.name,
            species: data.species,
            breed: data.breed,
            gender: data.gender,
            dob: data.dob,
            age: data.age,
            color: data.color,
            rfid: data.rfid,
            identificationArea: data.identificationArea,
            sterilized: data.sterilized === "Yes" || data.sterilized === true,
            history: data.history || {},
            visit: data.visit || {}
        }];

    const formData = {
        mobileNumber: data.mobileNumber,
        ownerName: data.ownerName,
        visitType: data.visitType,
        ownerIdType: data.ownerIdType,
        ownerOtherIdType: data.ownerOtherIdType,
        ownerIdNumber: data.ownerIdNumber,
        email: data.email,
        address: data.address,
        state: data.state,
        city: data.city,
        district: data.district,
        pincode: data.pincode,
        pets: petsArray,
        pet: petsArray[0],
        visit: petsArray[0]?.visit || {},
        history: petsArray[0]?.history || {}
    };

    console.log("FINAL PAYLOAD:", formData);

    const response = await API.post(
        `${BASE_URL}/new-registration`,
        formData
    );

    return response.data;
};
// Existing Customers List
export const getExistingCustomers = async (params = {}) => {
    const response = await API.get(
        `${BASE_URL}/existing-customers`,
        {
            params,
        }
    );

    return response.data;
};

// Get Owner Details by Owner ID
export const searchOwner = async (ownerId) => {
    const response = await API.get(
        `${BASE_URL}/new-registration/owner/${ownerId}`
    );

    return response.data;
};

export const updateOwner = async (ownerId, ownerData) => {
    const response = await API.put(
        `${BASE_URL}/new-registration/owner/${ownerId}`,
        ownerData
    );

    return response.data;
};

// Get Customer Details by Mobile Number
export const searchCustomer = async (mobileNumber) => {
    const response = await API.get(
        `${BASE_URL}/new-registration/mobile/${mobileNumber}`
    );

    return response.data;
};

// Add New Pet for Existing Owner
export const addPet = async (ownerId, petData) => {
    const payload = {
        ...petData,
        name: petData.name || petData.petName,
        petName: petData.petName || petData.name,
    };
    const response = await API.post(
        `${BASE_URL}/new-registration/owner/${ownerId}/pets`,
        payload
    );

    return response.data;
};

export const updatePet = async (ownerId, petId, petData) => {
    const response = await API.put(
        `${BASE_URL}/new-registration/owner/${ownerId}/pets/${petId}`,
        petData
    );

    return response.data;
};

export const verifyRegistrationOtp = async (mobileNumber, otp) => {
    const response = await API.post(`${BASE_URL}/new-registration/verify-otp`, { mobileNumber, otp });
    return response.data;
};

export const deletePet = async (ownerId, petId) => {
    const response = await API.delete(`${BASE_URL}/new-registration/owner/${ownerId}/pets/${petId}`);
    return response.data;
};

export const deletePetVisit = async (ownerId, petId, visitId) => {
    const response = await API.delete(`${BASE_URL}/new-registration/owner/${ownerId}/pets/${petId}/visits/${visitId}`);
    return response.data;
};

export const updatePetVisit = async (ownerId, petId, visitId, visitData) => {
    const response = await API.put(
        `${BASE_URL}/new-registration/owner/${ownerId}/pets/${petId}/visits/${visitId}`,
        visitData
    );
    return response.data;
};

// Add Visit for Existing Pet
export const addVisit = async (ownerId, petId, visitData) => {
    const response = await API.post(
        `${BASE_URL}/new-registration/owner/${ownerId}/pets/${petId}/visit`,
        visitData
    );

    return response.data;
};

// To Get Pet History
export const getPetHistory = async () => {
    console.log("API reached ...")
    const response = await API.get(
        `${BASE_URL}/petHistory`
    );

    return response.data;
};

// Dashboard Stats
export const getDashboardStats = async () => {
    const response = await API.get(
        `${BASE_URL}/existing-customers/stats`
    );

    return response.data;
};

// Single Pet Details
export const getPetDetails = async (ownerId, petId) => {
    const response = await API.get(
        `${BASE_URL}/existing-customers/${ownerId}/pets/${petId}`
    );

    return response.data;
};

// Get Clinic Queue
export const getClinicQueue = async () => {
    const response = await API.get(
        `${BASE_URL}/appointments/queue`
    );

    return response.data;
};

// Book Appointment
export const bookAppointment = async (appointmentData) => {
    const response = await API.post(
        `${BASE_URL}/appointments/book`,
        appointmentData
    );

    return response.data;
};

// Update Appointment Status
export const updateAppointmentStatus = async (
    appointmentId,
    statusData
) => {
    const response = await API.put(
        `${BASE_URL}/appointments/${appointmentId}/status`,
        statusData
    );

    return response.data;
};
