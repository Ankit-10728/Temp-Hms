import API from "../../../shared/api/axios";

const buildFormData = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    return formData;
};

export const createClinic = async (clinicData) => {
    const subscriptionTypesByBillingCycle = {
        Monthly: "Monthly",
        Quarterly: "Quarterly",
        "Half-Yearly": "6_MONTHS",
        Annual: "12_MONTHS",
    };
    const subscriptionType = subscriptionTypesByBillingCycle[clinicData.billing] || "FREE_TIER";

    const addressString = `${clinicData.address1 || ""}, ${clinicData.city || ""}, ${clinicData.state || ""}`;

    const jsonPayload = {
        name: clinicData.clinicName,
        facilityType: clinicData.facilityType,
        yearOfEstablishment: clinicData.year,
        address: addressString,
        contactEmail: clinicData.email,
        email: clinicData.email,
        // The clinic onboarding endpoint reads the account owner details from
        // the request body, not from the nested adminDetails object.
        adminName: clinicData.adminName,
        adminEmail: clinicData.adminEmail,
        adminPhone: clinicData.adminPhone,
        phone: clinicData.phone,
        altPhone: clinicData.altPhone,
        website: clinicData.website,
        plan: clinicData.plan,
        trialDays: clinicData.trialDays,
        customPlanPrice: clinicData.customPlanPrice,
        discountCode: clinicData.discountCode,
        notes: clinicData.notes,
        subscriptionType,
        billingCycle: clinicData.billing,
        planStartDate: clinicData.startDate,
        planEndDate: clinicData.endDate,
        
        licenseLimits: {
            maxDoctors: clinicData.maxDoctors || 5,
            maxStaff: clinicData.maxStaff || 10,
            maxPets: clinicData.maxPets,
            maxPetsUnlimited: String(clinicData.maxPets || "").trim().toLowerCase() === "unlimited",
            storageLimit: clinicData.storageLimit
        },
        addressDetails: {
            addressLine1: clinicData.address1,
            addressLine2: clinicData.address2,
            city: clinicData.city,
            district: clinicData.district,
            state: clinicData.state,
            pincode: clinicData.pincode,
            serviceAreas: clinicData.serviceAreas
        },
        adminDetails: {
            adminName: clinicData.adminName,
            adminEmail: clinicData.adminEmail,
            adminPhone: clinicData.adminPhone,
            designation: clinicData.designation,
            govtIdType: clinicData.govtIdType,
            govtIdNumber: clinicData.govtIdNumber
        },
        taxDetails: {
            gstNumber: clinicData.gst,
            panNumber: clinicData.pan,
            bankName: clinicData.bankName,
            accountNumber: clinicData.accountNumber,
            ifscCode: clinicData.ifsc
        },
        registrationDetails: {
            vetRegistrationNumber: clinicData.vetReg,
            stateCouncil: clinicData.stateCouncil,
            vetExpiry: clinicData.vetExpiry,
            tradeLicenseNumber: clinicData.tradeLicense,
            tradeExpiry: clinicData.tradeExpiry,
            drugLicenseNumber: clinicData.drugLicense,
            drugExpiry: clinicData.drugExpiry
        },
        features: {
            labModule: clinicData.labModule,
            groomingModule: clinicData.groomingModule,
            kennelModule: clinicData.kennelModule,
            pharmacyModule: clinicData.pharmacyModule,
            inventoryModule: clinicData.inventoryModule,
            telemedicineModule: clinicData.telemedicineModule,
            apiAccess: clinicData.apiAccess,
            whiteLabel: clinicData.whiteLabel
        }
    };

    const createRes = await API.post("/super-admin/clinics", jsonPayload);
    const clinic = createRes.data?.data;
    const clinicId = clinic?._id;

    if (!clinicId) {
        throw new Error("Failed to retrieve clinic ID from response");
    }

    await uploadClinicDocuments(clinicId, clinicData);

    return createRes.data;
};

export const getNextClinicCode = async () => {
    const res = await API.get("/super-admin/clinics/next-code");
    return res.data;
};

export const sendClinicAdminOtp = async (adminPhone) => {
    const res = await API.post("/super-admin/clinics/admin-otp/send", { adminPhone });
    return res.data;
};

export const verifyClinicAdminOtp = async (adminPhone, otp) => {
    const res = await API.post("/super-admin/clinics/admin-otp/verify", { adminPhone, otp });
    return res.data;
};

export const getClinics = async (params = {}) => {
    const res = await API.get("/super-admin/clinics", { params });
    return res.data;
};

export const updateClinic = async (id, clinicData) => {
    const res = await API.put(`/super-admin/clinics/${id}`, clinicData);
    return res.data;
};

export const updateClinicVerification = async (id, status) => {
    const res = await API.put(`/super-admin/clinics/${id}/verification`, { status });
    return res.data;
};

export const checkClinicContactAvailability = async ({ email, phone }) => {
    const res = await API.get("/super-admin/clinics/contact-availability", { params: { email, phone } });
    return res.data;
};

export const updateClinicActivity = async (id, isActive) => {
    const res = await API.put(`/super-admin/clinics/${id}/activity`, { isActive });
    return res.data;
};

export const deleteClinic = async (id) => {
    const res = await API.delete(`/super-admin/clinics/${id}`);
    return res.data;
};

export const uploadClinicDocuments = async (clinicId, clinicData) => {
    const documentFields = {
        clinicLogo: clinicData.logo,
        vetCouncilCertificate: clinicData.vetCert,
        tradeLicense: clinicData.tradeDoc,
        drugLicense: clinicData.drugDoc,
        cancelledCheque: clinicData.cheque,
        adminProfile: clinicData.profile,
        idDocument: clinicData.idDoc,
    };
    const filesToUpload = Object.fromEntries(
        Object.entries(documentFields).filter(([, file]) => file instanceof File)
    );

    if (!Object.keys(filesToUpload).length) return null;

    const response = await API.post(
        `/super-admin/clinics/${clinicId}/documents`,
        buildFormData(filesToUpload),
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
};
    
