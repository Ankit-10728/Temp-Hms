import API from "../../../shared/api/axios";
import { MODULE_OPTIONS } from "../data/staff";

const BASE_URL = "/clinic/staff";

export const getStaff = async () => {
    const res = await API.get(BASE_URL);

    console.log("Fetched staff:");
    console.log(res.data);

    return res.data;
};


export const getStaffById = async (id) => {
    const res = await API.get(
        `${BASE_URL}/${id}`
    );

    return res.data;
};

export const getManagers = async () => {
    const res = await API.get(
        `${BASE_URL}/managers`
    );

    return res.data;
};

export const checkStaffContactAvailability = async ({ email, mobileNumber }) => {
    const res = await API.get(`${BASE_URL}/contact-availability`, {
        params: { email, phone: mobileNumber },
    });

    return res.data;
};

export const createStaff = async (
    staffData
) => {

    const formData =
        buildStaffFormData(
            staffData
        );

    console.log(
        "Creating Staff"
    );
    console.log(staffData);


    const res =
        await API.post(
            BASE_URL,
            formData
        );

    return res.data;
};

export const updateStaff = async (
    id,
    staffData
) => {

    const formData =
        buildStaffFormData(
            staffData
        );

    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
        console.log(key, value);
    }


    const res =
        await API.put(
            `${BASE_URL}/${id}`,
            formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
        );

    return res.data;
};

export const deleteStaff =
    async (id) => {

        const res =
            await API.delete(
                `${BASE_URL}/${id}`
            );

        return res.data;
    };



const buildStaffFormData = (staff) => {
    const formData = new FormData();

    formData.append(
        "personalInfo",
        JSON.stringify({
            fullName: staff.fullName,
            gender: staff.gender,
            dateOfBirth: staff.dateOfBirth,
            email: staff.email,
            mobileNumber: staff.mobileNumber,

            emergencyContacts: [
                {
                    contactPersonName:
                        staff.emergencyContacts?.[0]
                            ?.contactPersonName || "",

                    contactNumber:
                        staff.emergencyContacts?.[0]
                            ?.contactNumber || "",
                },
            ],
        })
    );

    formData.append(
        "employmentInfo",
        JSON.stringify({
            role: staff.role,
            roles: staff.roles?.length ? staff.roles : [staff.role].filter(Boolean),
            department: staff.department,
            reportingTo: staff.reportingTo,
            staffId: staff.staffId,
            dateOfJoining: staff.dateOfJoining,
            employmentType: staff.employmentType,
        })
    );

    formData.append(
        "accountInfo",
        JSON.stringify({
            accountActive: staff.accountActive,
            accountExpiryDate:
                staff.accountExpiryDate,
            forcePasswordReset:
                staff.forcePasswordReset,
        })
    );
    formData.append(
        "bankDetails",
        JSON.stringify({
            bankName: staff.bankName,
            accountHolderName: staff.accountHolderName,
            accountNumber: staff.accountNumber,
            ifscCode: staff.ifscCode,
            branchName: staff.branchName,
            upiId: staff.upiId,
        })
    );


    // Explicitly set every known module to true/false rather than only
    // including selected ones - an omitted key can't reliably clear a
    // previously-true permission on an edit/update.
    const selectedModules = staff.modules || [];
    const moduleAccess = {};
    MODULE_OPTIONS.forEach(module => {
        moduleAccess[module] = selectedModules.includes(module);
    });

    formData.append(
        "moduleAccess",
        JSON.stringify(moduleAccess)
    );

    if (staff.profilePhoto) {
        formData.append(
            "profilePhoto",
            staff.profilePhoto
        );
    }

    return formData;
};
/* GET ONLY DOCTOR STAFF */
export const getDoctorStaff = async (excludeDoctorId) => {
    const res = await API.get("/clinic/staff/doctor-list", {
        params: excludeDoctorId ? { excludeDoctorId } : undefined,
    });
    return res.data?.data || [];
};

export const getLabTechnicianStaff = async () => {
    const res = await API.get(`${BASE_URL}?role=${encodeURIComponent("Lab Technician")}&limit=1000`);
    return res.data?.data || [];
};
