import API from "../../../shared/api/axios";

const BASE_URL = "/clinic/doctors";

/* GET ALL DOCTORS */
export const getDoctors = async () => {
    const res = await API.get(BASE_URL);
    console.log("form data ***************");
    console.log(res.data);
    return res.data;
};

/* GET SINGLE DOCTOR */
export const getDoctorById = async (id) => {
    const res = await API.get(`${BASE_URL}/${id}`);
    return res.data;
};

/* CREATE DOCTOR */
export const createDoctor = async (doctorData) => {
    const formData = buildDoctorFormData(doctorData);

    console.log("===== FORM DATA =====");

    const res = await API.post(
        `${BASE_URL}/create`,
        formData,

    );

    return res.data;
};

/* UPDATE DOCTOR */
export const updateDoctor = async (id, doctorData) => {
    const formData = buildDoctorFormData(doctorData);

    const res = await API.put(
        `${BASE_URL}/${id}`,
        formData
    );

    return res.data;
};
/* DELETE DOCTOR */
export const deleteDoctor = async (id) => {
    const res = await API.delete(`${BASE_URL}/${id}`);
    return res.data;
};

const buildDoctorFormData = (doctorData) => {
    const formData = new FormData();

    formData.append(
        "registrationNumber",
        doctorData.regNumber
    );


    formData.append(
        "name",
        doctorData.name
    );
    formData.append(
        "staff",
        doctorData.staff || doctorData.staffId
    );

    formData.append(
        "staffCode",
        doctorData.staffCode
    );
    formData.append(
        "stateVetCouncil",
        doctorData.state
    );

    formData.append(
        "certificateValidityDate",
        doctorData.certValidity
    );

    formData.append(
        "renewalReminderDays",
        doctorData.reminderDays
    );
    formData.append(
        "experience",
        doctorData.experience
    );

    formData.append(
        "consultationFees",
        doctorData.fees
    );

    formData.append(
        "avgConsultationDuration",
        doctorData.avgDuration
    );

    formData.append(
        "emergencyAvailability",
        doctorData.emergency
    );

    formData.append(
        "specializations",
        JSON.stringify(
            doctorData.selectedSpecs || []
        )
    );

    formData.append(
        "prescriptionLanguages",
        JSON.stringify(
            doctorData.selectedLangs || []
        )
    );

    formData.append(
        "degrees",
        JSON.stringify(
            (doctorData.degrees || []).map(
                (d) => ({
                    degreeName: d.degree || d.degreeName
                })
            )
        )
    );

    doctorData.degrees?.forEach((degree) => {
        if (degree.certificate) {
            formData.append(
                "degreeCertificates",
                degree.certificate
            );
        }
    });

    if (doctorData.registrationCertificate) {
        formData.append(
            "registrationCertificate",
            doctorData.registrationCertificate
        );
    }

    if (doctorData.digitalSignature) {
        formData.append(
            "digitalSignature",
            doctorData.digitalSignature
        );
    }

    if (doctorData.doctorLetterhead) {
        formData.append(
            "doctorLetterhead",
            doctorData.doctorLetterhead
        );
    }

    return formData;
};
