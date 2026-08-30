const Doctor = require("../models/DoctorDetails.js");
const Staff = require("../models/Staff.js");
const Clinic = require("../models/Clinic.js");

const generateDoctorId = require("../utils/generateDoctorId.js");

const isPastDate = (value) => {
    if (!value) return false;
    const selected = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
};

const createDoctor = async (req, res) => {
    try {
        console.log(req.files);
        const {
            staff,
            staffCode,
            experience,
            name,
            registrationNumber,
            stateVetCouncil,
            certificateValidityDate,
            renewalReminderDays,
            consultationFees,
            avgConsultationDuration,
            emergencyAvailability
        } = req.body;

        const clinicId = req.user.clinicId;

        const clinicForLimit = await Clinic.findById(clinicId).select("licenseLimits");
        const maxDoctors = clinicForLimit?.licenseLimits?.maxDoctors;
        if (Number.isFinite(maxDoctors)) {
            const currentDoctorCount = await Doctor.countDocuments({ clinicId });
            if (currentDoctorCount >= maxDoctors) {
                return res.status(403).json({
                    success: false,
                    message: `This clinic's plan allows a maximum of ${maxDoctors} veterinarian(s). Upgrade the plan to add more.`,
                });
            }
        }

        if (!/^[A-Za-z0-9/-]{5,30}$/.test(registrationNumber || "")) {
            return res.status(400).json({
                success: false,
                message: "Registration number must be 5-30 characters and can contain letters, numbers, / or -",
            });
        }

        if (!experience || Number(experience) <= 0 || Number(experience) > 70) {
            return res.status(400).json({
                success: false,
                message: "Experience must be between 1 and 70 years",
            });
        }

        if (!consultationFees || Number(consultationFees) <= 0 || Number(consultationFees) > 100000) {
            return res.status(400).json({
                success: false,
                message: "Consultation fees must be between 1 and 100000",
            });
        }

        if (!avgConsultationDuration || Number(avgConsultationDuration) < 5 || Number(avgConsultationDuration) > 240) {
            return res.status(400).json({
                success: false,
                message: "Average consultation duration must be between 5 and 240 minutes",
            });
        }

        if (certificateValidityDate && isPastDate(certificateValidityDate)) {
            return res.status(400).json({
                success: false,
                message: "Certificate validity date cannot be in the past",
            });
        }

        if (renewalReminderDays === "" || Number(renewalReminderDays) < 0 || Number(renewalReminderDays) > 365) {
            return res.status(400).json({
                success: false,
                message: "Renewal reminder days must be between 0 and 365",
            });
        }

        const selectedStaff = await Staff.findOne({
            _id: staff,
            clinicId,
            isDeleted: false,
            "employmentInfo.role": "Doctor",
        }).select("employmentInfo.staffId personalInfo.fullName");

        if (!selectedStaff) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid doctor staff member",
            });
        }

        let degrees = [];
        let specializations = [];
        let prescriptionLanguages = [];

        if (req.body.degrees) {
            degrees = JSON.parse(req.body.degrees);
        }

        if (!degrees.some((degree) => degree.degreeName)) {
            return res.status(400).json({
                success: false,
                message: "Select at least one degree type",
            });
        }

        if (req.body.specializations) {
            specializations = JSON.parse(req.body.specializations);
        }

        if (req.body.prescriptionLanguages) {
            prescriptionLanguages = JSON.parse(
                req.body.prescriptionLanguages
            );
        }

        const existingDoctor = await Doctor.findOne({
            registrationNumber,
        });

        if (existingDoctor) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor with this registration number already exists",
            });
        }

        const doctorId = await generateDoctorId();

        const degreeFiles =
            req.files?.degreeCertificates || [];

        degrees = degrees.map((degree, index) => ({
            ...degree,
            clinicId,
            degreeCertificate:
                degreeFiles[index]?.path || "",
        }));

        const doctor = await Doctor.create({
            clinicId,
            doctorId,

            degrees,
            name,
            staff: selectedStaff._id,
            staffCode:
                staffCode ||
                selectedStaff.employmentInfo?.staffId,


            specializations,

            experience,

            registrationNumber,

            stateVetCouncil,

            registrationCertificate:
                req.files?.registrationCertificate?.[0]
                    ?.path || "",

            certificateValidityDate,

            renewalReminderDays,

            consultationFees,

            avgConsultationDuration,

            emergencyAvailability,

            digitalSignature:
                req.files?.digitalSignature?.[0]?.path ||
                "",

            doctorLetterhead:
                req.files?.doctorLetterhead?.[0]?.path ||
                "",

            prescriptionLanguages,
        });




        return res.status(201).json({
            success: true,
            message: "Doctor created successfully",
            doctor,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
        });
    }
};

const getAllDoctors = async (req, res) => {
    try {
        console.log("reached");

        const clinicId = req.user.clinicId;

        const doctors = await Doctor.find({
            clinicId
        })
            .populate('staff', 'personalInfo.fullName')
            .sort({ createdAt: -1 });

        const doctorsWithLiveNames = doctors.map((doc) => {
            const obj = doc.toObject();
            if (obj.staff?.personalInfo?.fullName) {
                obj.name = obj.staff.personalInfo.fullName;
            }
            return obj;
        });

        return res.status(200).json({
            success: true,
            count: doctorsWithLiveNames.length,
            doctors: doctorsWithLiveNames,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getDoctorById = async (req, res) => {
    try {

        const clinicId = req.user.clinicId;

        const doctor = await Doctor.findOne({
            _id: req.params.id,
            clinicId,
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        return res.status(200).json({
            success: true,
            doctor,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const updateDoctor = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;

        const doctor = await Doctor.findOne({
            _id: req.params.id,
            clinicId,
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        const {
            staff,
            staffCode,
            experience,
            name,
            registrationNumber,
            stateVetCouncil,
            certificateValidityDate,
            renewalReminderDays,
            consultationFees,
            avgConsultationDuration,
            emergencyAvailability,
        } = req.body;

        // ---------- Basic Fields ----------
        doctor.staff = staff;
        doctor.staffCode = staffCode;
        doctor.name = name;
        doctor.experience = experience;
        doctor.registrationNumber = registrationNumber;
        doctor.stateVetCouncil = stateVetCouncil;
        doctor.certificateValidityDate = certificateValidityDate;
        doctor.renewalReminderDays = renewalReminderDays;
        doctor.consultationFees = consultationFees;
        doctor.avgConsultationDuration = avgConsultationDuration;
        doctor.emergencyAvailability =
            emergencyAvailability === "true" || emergencyAvailability === true;

        // ---------- Arrays ----------
        doctor.specializations = req.body.specializations
            ? JSON.parse(req.body.specializations)
            : [];

        doctor.prescriptionLanguages = req.body.prescriptionLanguages
            ? JSON.parse(req.body.prescriptionLanguages)
            : [];

        // ---------- Degrees ----------
        let degrees = [];

        if (req.body.degrees) {
            degrees = JSON.parse(req.body.degrees);
        }

        const uploadedDegreeFiles =
            req.files?.degreeCertificates || [];

        let fileIndex = 0;

        doctor.degrees = degrees.map((degree, index) => ({
            clinicId,
            degreeName: degree.degreeName,
            degreeCertificate:
                uploadedDegreeFiles[fileIndex]
                    ? uploadedDegreeFiles[fileIndex++].path
                    : doctor.degrees[index]?.degreeCertificate || "",
        }));

        // ---------- Optional Files ----------
        if (req.files?.registrationCertificate?.length) {
            doctor.registrationCertificate =
                req.files.registrationCertificate[0].path;
        }

        if (req.files?.digitalSignature?.length) {
            doctor.digitalSignature =
                req.files.digitalSignature[0].path;
        }

        if (req.files?.doctorLetterhead?.length) {
            doctor.doctorLetterhead =
                req.files.doctorLetterhead[0].path;
        }

        await doctor.save();

        return res.status(200).json({
            success: true,
            message: "Doctor updated successfully",
            doctor,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteDoctor = async (req, res) => {
    try {

        const clinicId = req.user.clinicId;

        const doctor = await Doctor.findOneAndDelete({
            _id: req.params.id,
            clinicId,
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const verifyDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user?._id;
        const clinicId = req.user?.clinicId;

        const doctor = await Doctor.findOneAndUpdate(
            { _id: id, clinicId },
            {
                isVerified: true,
                verifiedAt: new Date(),
                verifiedBy: adminId,
            },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor verified successfully",
            doctor,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const rejectDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const clinicId = req.user?.clinicId;

        const doctor = await Doctor.findOneAndUpdate(
            { _id: id, clinicId },
            { isVerified: false },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor verification rejected",
            doctor,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.createDoctor = createDoctor;
exports.getDoctorById = getDoctorById;
exports.getAllDoctors = getAllDoctors;
exports.updateDoctor = updateDoctor;
exports.deleteDoctor = deleteDoctor;
exports.verifyDoctor = verifyDoctor;
exports.rejectDoctor = rejectDoctor;
