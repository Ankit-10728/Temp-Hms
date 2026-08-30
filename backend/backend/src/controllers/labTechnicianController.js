const LabTechnician = require("../models/LabTechnician");
const Staff = require("../models/Staff");
const Visit = require("../models/visitModel");
const PetRegistration = require("../models/PetRegistration");
const DoctorConsultation = require("../models/DoctorConsultationModdel");
const LabReport = require("../models/LabReport");

// LabTechnician only stores employeeId (a staffId string, e.g. "STF0027"),
// not the person's actual name - the UI was displaying the qualification
// field as if it were the name. Resolve the real name from the linked
// Staff record here so every consumer gets it for free.
const attachStaffNames = async (technicians, clinicId) => {
    const staffIds = technicians
        .map((technician) => technician.employeeId)
        .filter(Boolean);

    const staffRecords = staffIds.length
        ? await Staff.find({
              clinicId,
              "employmentInfo.staffId": { $in: staffIds },
          })
              .select("employmentInfo.staffId personalInfo.fullName")
              .lean()
        : [];

    const nameByStaffId = new Map(
        staffRecords.map((staff) => [
            staff.employmentInfo?.staffId,
            staff.personalInfo?.fullName,
        ])
    );

    return technicians.map((technician) => {
        const plain = technician.toObject ? technician.toObject() : technician;
        return {
            ...plain,
            name: nameByStaffId.get(plain.employeeId) || plain.employeeId,
        };
    });
};

const resolveUploadedFile = (file) => ({
    public_id: file.key || file.filename,
    url: file.location || (file.filename ? `/uploads/${file.filename}` : file.path),
});

const parseJsonArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const normalizeShift = (value) => {
    if (value === "24h") return "24 Hours";
    return value;
};

const handleLabTechnicianError = (res, error) => {
    if (error?.code === 11000 && error?.keyPattern?.employeeId) {
        return res.status(409).json({
            success: false,
            message: "Lab technician details already exist for this staff member.",
        });
    }

    if (error?.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    return res.status(500).json({
        success: false,
        message: error.message,
    });
};


exports.getLabDashboard = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalReports = await LabReport.countDocuments({ clinicId });
        const pendingUploads = await Visit.countDocuments({
            clinicId,
            currentStage: "LAB",
            status: "WAITING"
        });
        const criticalCases = await LabReport.countDocuments({
            clinicId,
            status: "Critical"
        });
        const todayReports = await LabReport.countDocuments({
            clinicId,
            createdAt: { $gte: today }
        });

        const recentReports = await LabReport.find({ clinicId })
            .sort({ createdAt: -1 })
            .limit(5);

        const pendingVisits = await Visit.find({
            clinicId,
            currentStage: "LAB",
            status: "WAITING"
        }).limit(5);

        const owners = await PetRegistration.find({
            clinicId,
            "pets._id": {
                $in: pendingVisits.map(v => v.petId)
            }
        });

        const ownerPetMap = {};
        owners.forEach(owner => {
            owner.pets.forEach(pet => {
                ownerPetMap[pet._id.toString()] = { owner, pet };
            });
        });

        const pendingSummary = pendingVisits.map(v => {
            const details = ownerPetMap[v.petId?.toString()];
            return {
                _id: v._id,
                tokenNumber: v.tokenNumber,
                chiefComplaint: v.chiefComplaint,
                ownerName: details?.owner?.ownerName || "Owner",
                petName: details?.pet?.petName || details?.pet?.name || "Pet",
                species: details?.pet?.species || "Pet",
                breed: details?.pet?.breed || "",
                createdAt: v.createdAt
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                totalReports,
                pendingUploads,
                criticalCases,
                todayReports,
                recentActivities: recentReports,
                pendingSummary
            }
        });
    } catch (error) {
        console.error("Lab Dashboard Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch lab dashboard."
        });
    }
};

exports.getAllPatientReports = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;

        // Get all reports
        const labReports = await LabReport.find({ clinicId })
            .sort({ createdAt: -1 });

        if (!labReports.length) {
            return res.status(200).json({
                success: true,
                totalReports: 0,
                todayReports: 0,
                completedReports: 0,
                criticalReports: 0,
                data: [],
            });
        }

        // Find owners containing these pets
        const owners = await PetRegistration.find({
            clinicId,
            "pets._id": {
                $in: labReports.map(report => report.petId),
            },
        });

        // petId -> owner + pet
        const petMap = {};

        owners.forEach(owner => {
            owner.pets.forEach(pet => {
                petMap[pet._id.toString()] = {
                    owner,
                    pet,
                };
            });
        });

        // Attach owner and pet
        const data = labReports.map(report => {
            const details = petMap[report.petId.toString()] || {};

            return {
                _id: report._id,
                clinicId: report.clinicId,
                petId: report.petId,
                visitId: report.visitId,
                consultationId: report.consultationId,
                reports: report.reports,
                status: report.status,
                remarks: report.remarks,
                createdAt: report.createdAt,
                updatedAt: report.updatedAt,

                owner: details.owner || null,
                pet: details.pet || null,
            };
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        res.status(200).json({
            success: true,
            totalReports: data.length,
            todayReports: data.filter(
                r => new Date(r.createdAt) >= today
            ).length,
            completedReports: data.filter(
                r => r.status === "Completed"
            ).length,
            criticalReports: data.filter(
                r => r.status === "Critical"
            ).length,
            data,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.uploadLabReports = async (req, res) => {
    try {
        const { petId, visitId } = req.body;

        const files = req.files;

        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        let reportsArray = [];

        // 🔥 Convert files into structured array
        Object.keys(files).forEach((testName) => {
            const file = files[testName][0];

            reportsArray.push({
                testName,
                fileUrl: file.path,
                fileName: file.originalname,
            });
        });

        // 🔥 Create Lab Report
        const labReport = await LabReport.create({
            clinicId: req.user.clinicId,
            petId,
            visitId,
            reports: reportsArray,
            status: "Completed",

        });


        await Visit.findByIdAndUpdate(visitId, {
            currentStage: "DOCTOR",

            status: "WAITING",

            "workflow.labCompleted": true,

            labTechnicianId: req.user._id
        });

        await DoctorConsultation.findOneAndUpdate(
            { visitId },
            {
                $push: { labReports: labReport._id }
            }
        );

        res.status(200).json({
            message: "Lab reports uploaded successfully",
            data: labReport,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Upload failed" });
    }
};

exports.getLabPendingPets = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;

        const visits = await Visit.find({
            clinicId,
            currentStage: "LAB",
            status: "WAITING",
        })
            .populate("doctorId") // contains labRequisition
            .sort({ createdAt: -1 });

        // get owners with pets
        const owners = await PetRegistration.find({
            "pets._id": {
                $in: visits.map(v => v.petId),
            },
        });

        // map petId → owner + pet
        const ownerPetMap = {};

        owners.forEach(owner => {
            owner.pets.forEach(pet => {
                ownerPetMap[pet._id.toString()] = {
                    owner,
                    pet,
                };
            });
        });

        // attach data
        const data = visits.map(visit => {
            const details = ownerPetMap[visit.petId.toString()];

            return {
                ...visit.toObject(),
                owner: details?.owner || null,
                pet: details?.pet || null,
                labRequisition: visit.doctorId?.labRequisition || null,
            };
        });

        return res.status(200).json({
            success: true,
            count: data.length,
            data,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateLabResults = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;
        const { id } = req.params;

        const visit = await Visit.findOne({
            _id: id,
            clinicId,
        });

        if (!visit) {
            return res.status(404).json({
                success: false,
                message: "Visit not found",
            });
        }

        // get consultation
        const consultation = await DoctorConsultation.findOne({
            _id: visit.doctorId,
            clinicId,
        });

        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: "Consultation not found",
            });
        }

        // ==========================================
        // UPDATE LAB DATA
        // ==========================================

        consultation.labRequisition.results = req.body.results;
        consultation.labRequisition.remarks = req.body.remarks;
        consultation.labRequisition.status = "COMPLETED";

        await consultation.save();

        // ==========================================
        // MOVE WORKFLOW
        // ==========================================

        visit.currentStage = "DOCTOR"; // back to doctor
        visit.status = "WAITING";

        await visit.save();

        return res.status(200).json({
            success: true,
            message: "Lab results submitted successfully",
            data: consultation,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getRequiredLabTests = async (req, res) => {
    try {

        console.log("lab reached");

        const { petId, visitId } = req.query;

        // 🔴 validation
        if (!petId || !visitId) {
            return res.status(400).json({
                success: false,
                message: "petId and visitId are required",
            });
        }

        // 🔍 find consultation
        const consultation = await DoctorConsultation.findOne({
            petId,
            visitId,
        });

        console.log("Consultation:", JSON.stringify(consultation, null, 2));

        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: "No consultation found",
            });
        }

        // ❗ check if lab was even raised
        if (!consultation.diagnosis?.raiseLab) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No lab tests required",
            });
        }

        // 🧪 extract tests
        const tests = consultation.labRequisition?.tests || [];

        console.log(tests);

        return res.status(200).json({
            success: true,
            data: tests,
            status: consultation.labRequisition?.status
        });

    } catch (error) {
        console.error("Error in getRequiredLabTests:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

exports.getCompletedLabPets = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;

        const visits = await Visit.find({
            clinicId,
            currentStage: "DOCTOR",
            status: "WAITING",
        })
            .populate("doctorId")
            .sort({ updatedAt: -1 });

        const data = visits.filter(
            v => v.doctorId?.labRequisition?.status === "COMPLETED"
        );

        return res.status(200).json({
            success: true,
            count: data.length,
            data,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.createLabTechnician = async (
    req,
    res
) => {
    try {
        let certificate = null;
        let idProof = null;

        if (
            req.files &&
            req.files.certificate
        ) {
            certificate =
                resolveUploadedFile(
                    req.files.certificate[0]
                );
        }

        if (
            req.files &&
            req.files.idProof
        ) {
            idProof =
                resolveUploadedFile(
                    req.files.idProof[0]
                );
        }
        const clinicId = req.user.clinicId;
        const employeeId = String(req.body.employeeId || "").trim();

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Please select a lab technician staff member.",
            });
        }

        const technician =
            await LabTechnician.create({
                clinicId,
                employeeId,

                qualification:
                    req.body.qualification,

                diploma:
                    req.body.diploma,

                licenseNumber:
                    req.body.licenseNumber,

                experience:
                    req.body.experience,

                certificate,

                idProof,

                previousInstitution:
                    req.body.previousInstitution,

                dateOfJoining:
                    req.body.dateOfJoining,

                specializedTests:
                    parseJsonArray(
                        req.body.specializedTests
                    ),

                shift: normalizeShift(req.body.shift),

                shiftStart:
                    req.body.shiftStart,

                shiftEnd:
                    req.body.shiftEnd,

                weeklyDays:
                    req.body.weeklyDays,

                onCall:
                    req.body.onCall,

                instruments:
                    req.body.instruments,

                lims: req.body.lims,

                status:
                    req.body.status,

                department:
                    req.body.department,

                supervisor:
                    req.body.supervisor,

                notes:
                    req.body.notes,
            });

        res.status(201).json({
            success: true,
            data: technician,
        });
    } catch (error) {
        handleLabTechnicianError(res, error);
    }
};

exports.getAllLabTechnicians =
    async (req, res) => {
        try {
            const clinicId = req.user.clinicId;

            const technicians = await LabTechnician.find({
                clinicId,
            }).sort({
                createdAt: -1,
            });

            const withNames = await attachStaffNames(technicians, clinicId);

            res.status(200).json({
                success: true,
                count:
                    withNames.length,
                data: withNames,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

exports.getSingleLabTechnician =
    async (req, res) => {
        try {
            const clinicId = req.user.clinicId;

            const technician =
                await LabTechnician.findOne({
                    _id: req.params.id,
                    clinicId,
                });

            if (!technician) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Lab Technician not found",
                });
            }

            const [withName] = await attachStaffNames([technician], clinicId);

            res.status(200).json({
                success: true,
                data: withName,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    }

exports.updateLabTechnician =
    async (req, res) => {
        try {
            const clinicId = req.user.clinicId;
            const updateData = {
                employeeId: req.body.employeeId,
                qualification: req.body.qualification,
                diploma: req.body.diploma,
                licenseNumber: req.body.licenseNumber,
                experience: req.body.experience,
                previousInstitution: req.body.previousInstitution,
                dateOfJoining: req.body.dateOfJoining,
                specializedTests: parseJsonArray(req.body.specializedTests),
                shift: normalizeShift(req.body.shift),
                shiftStart: req.body.shiftStart,
                shiftEnd: req.body.shiftEnd,
                weeklyDays: req.body.weeklyDays,
                onCall: req.body.onCall,
                instruments: req.body.instruments,
                lims: req.body.lims,
                status: req.body.status,
                department: req.body.department,
                supervisor: req.body.supervisor,
                notes: req.body.notes,
            };

            Object.keys(updateData).forEach((key) => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            if (
                req.files &&
                req.files.certificate
            ) {
                updateData.certificate =
                    resolveUploadedFile(
                        req.files.certificate[0]
                    );
            }

            if (
                req.files &&
                req.files.idProof
            ) {
                updateData.idProof =
                    resolveUploadedFile(
                        req.files.idProof[0]
                    );
            }

            const technician =
                await LabTechnician.findOneAndUpdate(
                    {
                        _id: req.params.id,
                        clinicId,
                    },
                    updateData,
                    {
                        new: true,
                        runValidators: true,
                    }
                );

            res.status(200).json({
                success: true,
                data: technician,
            });
        } catch (error) {
            handleLabTechnicianError(res, error);
        }
    };
exports.deleteLabTechnician =
    async (req, res) => {
        try {
            const clinicId = req.user.clinicId;

            await LabTechnician.findOneAndDelete({
                _id: req.params.id,
                clinicId,
            });

            res.status(200).json({
                success: true,
                message:
                    "Lab Technician deleted successfully",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

// ============================
// Lab workflow endpoints
// ============================
const Appointment = require('../models/Appointment');
const LabRecord = require('../models/LabRecord');

// GET /api/lab/queue-pending
// Lists appointments waiting for lab results.
exports.getLabPendingQueue = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;
        const pending = await Appointment.find({
            clinicId,
            status: 'LAB_PENDING'
        }).populate('petId ownerId doctorId');

        res.status(200).json({ success: true, count: pending.length, data: pending });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/lab/records/:appointmentId/results
// Saves lab results in LabRecord and moves appointment back to doctor.
exports.uploadLabResults = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const clinicId = req.user.clinicId;

        const appointment = await Appointment.findOne({ _id: appointmentId, clinicId });
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        if (appointment.status !== 'LAB_PENDING') {
            return res.status(400).json({ success: false, message: 'Appointment is not waiting for lab' });
        }

        const { testsCompleted, reportFiles, sampleCollectedAt, reportDate, externalLabName, criticalValuesFlag, criticalNotes, remarks, uploadedByRole } = req.body;

        const up = await LabRecord.findOneAndUpdate(
            { appointmentId, clinicId, },
            {
                results: {
                    testsCompleted: testsCompleted || [],
                    reportFiles: reportFiles || [],
                    sampleCollectedAt,
                    reportDate,
                    externalLabName,
                    criticalValuesFlag,
                    criticalNotes,
                    remarks,
                    uploadedByRole: uploadedByRole || 'LAB_TECH'
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        await Appointment.findByIdAndUpdate(appointmentId, { status: 'LAB_COMPLETED' });

        res.status(200).json({ success: true, labRecord: up });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyLabTechnician = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user?._id;

        const technician = await LabTechnician.findByIdAndUpdate(
            id,
            {
                isVerified: true,
                verifiedAt: new Date(),
                verifiedBy: adminId,
            },
            { new: true }
        );

        if (!technician) {
            return res.status(404).json({
                success: false,
                message: "Lab technician not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Lab technician verified successfully.",
            technician,
        });
    } catch (error) {
        handleLabTechnicianError(res, error);
    }
};

exports.rejectLabTechnician = async (req, res) => {
    try {
        const { id } = req.params;

        await LabTechnician.findByIdAndUpdate(
            id,
            { isVerified: false },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Lab technician verification rejected.",
        });
    } catch (error) {
        handleLabTechnicianError(res, error);
    }
};
