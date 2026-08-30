const DoctorConsultation = require("../models/DoctorConsultationModdel");
const Visit = require("../models/visitModel");
const LabReport = require("../models/LabReport")
const PreConsultation = require("../models/PreConsultation")
const PetRegistration = require("../models/PetRegistration")

// ======================================================
// Dashboard
// ======================================================
exports.getDashboard = async (req, res) => {
    try {

        const totalPets = await Doctor.countDocuments();

        const pendingPets = await Doctor.countDocuments({
            status: "PENDING"
        });

        const completedPets = await Doctor.countDocuments({
            status: "COMPLETED"
        });

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const todaysVisits = await Doctor.countDocuments({
            createdAt: {
                $gte: today
            }
        });

        const recentActivity = await Doctor.find()
            .sort({
                updatedAt: -1
            })
            .limit(5);

        return res.status(200).json({
            success: true,
            dashboard: {
                totalPets,
                pendingPets,
                completedPets,
                todaysVisits,
                recentActivity
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ======================================================
// Pending Pets
// ======================================================
exports.getPendingPets = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;

        const visits = await Visit.find({
            clinicId,
            "workflow.preConsultationCompleted": true,
            "workflow.doctorCompleted": { $ne: true },
            status: { $ne: "CANCELLED" },
        })
            .populate("preConsultationId")
            .sort({ createdAt: -1 });

        // Fetch all owners containing these pets
        const owners = await PetRegistration.find({
            "pets._id": {
                $in: visits.map((visit) => visit.petId),
            },
        });

        // Fetch lab reports associated with these visits
        const visitIds = visits.map((v) => v._id);
        const labReports = await LabReport.find({ visitId: { $in: visitIds } });
        const labReportMap = {};
        labReports.forEach((r) => {
            if (r.visitId) {
                labReportMap[r.visitId.toString()] = r;
            }
        });

        // Create a lookup map: petId -> { owner, pet }
        const ownerPetMap = {};

        owners.forEach((owner) => {
            owner.pets.forEach((pet) => {
                ownerPetMap[pet._id.toString()] = {
                    owner,
                    pet,
                };
            });
        });

        // Attach owner, pet, and labReport status to each visit
        const data = visits.map((visit) => {
            const details = ownerPetMap[visit.petId.toString()];
            const labRep = labReportMap[visit._id.toString()] || null;

            return {
                ...visit.toObject(),
                owner: details?.owner || null,
                pet: details?.pet || null,
                labReport: labRep,
                hasLabReport: !!labRep,
                isSentToLab: visit.currentStage === "LAB" || visit.status === "LAB_TEST_RAISED",
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

// Delete a visit and records that belong exclusively to that visit.
exports.deletePatient = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;
        const visit = await Visit.findOne({ _id: req.params.id, clinicId });

        if (!visit) {
            return res.status(404).json({ success: false, message: "Visit record not found" });
        }

        await Promise.all([
            DoctorConsultation.deleteMany({ clinicId, $or: [{ visitId: visit._id }, ...(visit.doctorConsultationId ? [{ _id: visit.doctorConsultationId }] : [])] }),
            PreConsultation.deleteMany({ clinicId, $or: [{ visitId: visit._id }, ...(visit.preConsultationId ? [{ _id: visit.preConsultationId }] : [])] }),
            LabReport.deleteMany({ clinicId, visitId: visit._id }),
        ]);
        await Visit.deleteOne({ _id: visit._id, clinicId });

        return res.status(200).json({ success: true, message: "Visit record deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// ======================================================
// Get Completed Pets
// ======================================================

exports.getCompletedPets = async (req, res) => {
    try {
        console.log("reached");

        const clinicId = req.user.clinicId;

        // ==========================
        // Stats
        // ==========================

        const completedToday = await Visit.countDocuments({
            clinicId,
            "workflow.doctorCompleted": true,
            updatedAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
        });

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const completedThisWeek = await Visit.countDocuments({
            clinicId,
            "workflow.doctorCompleted": true,
            updatedAt: {
                $gte: startOfWeek
            }
        });

        const totalCompleted = await Visit.countDocuments({
            clinicId,
            "workflow.doctorCompleted": true
        });

        // ==========================
        // Completed Visits
        // ==========================

        const visits = await Visit.find({
            clinicId,
            "workflow.doctorCompleted": true
        })
            .populate({
                path: "doctorId",
                select: "name doctorId"
            })
            .sort({
                updatedAt: -1
            });

        // Lookup owners containing these pets
        const owners = await PetRegistration.find({
            "pets._id": {
                $in: visits.map((visit) => visit.petId),
            },
        });

        const ownerPetMap = {};
        owners.forEach((owner) => {
            owner.pets.forEach((pet) => {
                ownerPetMap[pet._id.toString()] = {
                    owner,
                    pet,
                };
            });
        });

        // Lookup consultations & pre-consultations
        const visitIds = visits.map((v) => v._id);
        const preConsultIds = visits.map((v) => v.preConsultationId).filter(Boolean);
        const docConsultIds = visits.map((v) => v.doctorId).filter(Boolean);

        const [consultations, preConsultations, labReports] = await Promise.all([
            DoctorConsultation.find({
                $or: [
                    { visitId: { $in: visitIds } },
                    { _id: { $in: docConsultIds } }
                ]
            }),
            PreConsultation.find({
                $or: [
                    { visitId: { $in: visitIds } },
                    { _id: { $in: preConsultIds } }
                ]
            }),
            LabReport.find({ visitId: { $in: visitIds } })
        ]);

        const consultMapByVisit = {};
        const consultMapById = {};
        consultations.forEach(c => {
            if (c.visitId) consultMapByVisit[c.visitId.toString()] = c.toObject();
            if (c._id) consultMapById[c._id.toString()] = c.toObject();
        });

        const preConsultMapByVisit = {};
        const preConsultMapById = {};
        preConsultations.forEach(pc => {
            if (pc.visitId) preConsultMapByVisit[pc.visitId.toString()] = pc.toObject();
            if (pc._id) preConsultMapById[pc._id.toString()] = pc.toObject();
        });

        const labReportMapByVisit = {};
        labReports.forEach(lr => {
            if (lr.visitId) labReportMapByVisit[lr.visitId.toString()] = lr.toObject();
        });

        const completedVisitsWithDetails = visits.map((visit) => {
            const details = ownerPetMap[visit.petId?.toString()];
            const rawObj = visit.toObject();
            const consult = consultMapByVisit[visit._id.toString()] || consultMapById[visit.doctorId?.toString()] || {};
            const preConsult = preConsultMapByVisit[visit._id.toString()] || preConsultMapById[visit.preConsultationId?.toString()] || {};
            const labRep = labReportMapByVisit[visit._id.toString()] || null;

            const vitals = {
                bodyTemperature: preConsult.bodyTemperature ?? consult.vitals?.bodyTemperature,
                temperature: preConsult.bodyTemperature ?? consult.vitals?.temperature,
                bodyWeight: preConsult.bodyWeight ?? consult.vitals?.bodyWeight ?? consult.petWeight,
                weight: preConsult.bodyWeight ?? consult.vitals?.weight ?? consult.petWeight,
                heartRate: preConsult.heartRate ?? consult.vitals?.heartRate,
                pulseRate: preConsult.heartRate ?? consult.vitals?.pulseRate,
                respiratoryRate: preConsult.respiratoryRate ?? consult.vitals?.respiratoryRate,
                bloodPressure: preConsult.bloodPressure ?? consult.vitals?.bloodPressure,
                spo2: preConsult.spo2 ?? consult.vitals?.spo2,
                bcs: preConsult.bcs ?? consult.vitals?.bcs,
                recordedBy: preConsult.recordedBy ?? consult.vitals?.recordedBy,
            };

            return {
                ...rawObj,
                owner: details?.owner || null,
                pet: details?.pet || null,
                ownerId: details?.owner || rawObj.ownerId || null,
                petId: details?.pet || rawObj.petId || null,
                vitals,
                history: consult.history || {},
                clinicalObservation: consult.clinicalObservation || {},
                diagnosis: consult.diagnosis || {},
                labRequisition: consult.labRequisition || {},
                treatment: consult.treatment || {},
                suggestion: consult.suggestion || {},
                consultationDetails: consult,
                preConsultationId: preConsult,
                labReport: labRep,
                hasLabReport: !!labRep,
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    completedToday,
                    completedThisWeek,
                    totalCompleted
                },
                pets: completedVisitsWithDetails
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ======================================================
// Doctor History
// ======================================================

exports.getHistory = async (req, res) => {

    try {

        const clinicId = req.user.clinicId;

        // ==========================
        // Statistics
        // ==========================

        const totalRecords = await Visit.countDocuments({
            clinicId
        });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonth = await Visit.countDocuments({
            clinicId,
            createdAt: {
                $gte: startOfMonth
            }
        });

        const doctorCompleted = await Visit.countDocuments({
            clinicId,
            "workflow.doctorCompleted": true
        });

        // ==========================
        // History
        // ==========================

        const history = await Visit.find({
            clinicId
        })
            .populate({
                path: "ownerId",
                select:
                    "ownerName mobileNumber email address city district state pincode pets"
            })
            .populate({
                path: "doctorId",
                select: "name doctorId"
            })
            .sort({
                createdAt: -1
            });

        // petId refs a top-level "Pet" collection that's never populated -
        // the real pet data is an embedded subdocument on the owner
        // (ownerId/PetRegistration), keyed by that same petId.
        const historyWithPets = history.map((visit) => ({
            ...visit.toObject(),
            pet: visit.ownerId?.pets?.id(visit.petId) || null,
        }));

        return res.status(200).json({

            success: true,

            data: {

                stats: {
                    totalRecords,
                    thisMonth,
                    doctorCompleted
                },

                records: historyWithPets

            }

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};
// ======================================================
// Get Single Patient
// ======================================================
exports.getPatient = async (req, res) => {

    try {

        const { id } = req.params;

        const patient = await Doctor.findById(id);

        if (!patient) {

            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });

        }

        return res.status(200).json({

            success: true,

            message: "Patient fetched successfully",

            data: patient

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
// ======================================================
// Update Patient (Part-1)
// ======================================================
exports.updatePatient = async (req, res) => {
    try {

        const clinicId = req.user.clinicId;
        const { id } = req.params;

        // ==========================================
        // Find Visit
        // ==========================================

        const visit = await Visit.findOne({
            _id: id,
            clinicId
        });

        if (!visit) {
            return res.status(404).json({
                success: false,
                message: "Visit not found"
            });
        }

        const raiseLab = req.body.diagnosis?.raiseLab === true;

        // ==========================================
        // Create / Update Doctor Consultation
        // ==========================================

        let consultation;

        const consultationData = {
            ...req.body,

            clinicId,
            visitId: visit._id,
            petId: visit.petId,
            ownerId: visit.ownerId,

            status: raiseLab
                ? "LAB_PENDING"
                : "COMPLETED"
        };

        if (!visit.doctorId) {

            consultation = await DoctorConsultation.create(consultationData);

            visit.doctorId = consultation._id;

        } else {

            consultation = await DoctorConsultation.findOneAndUpdate(
                {
                    _id: visit.doctorId,
                    clinicId
                },
                consultationData,
                {
                    new: true,
                    runValidators: true
                }
            );

        }

        // ==========================================
        // Update Lab Status
        // ==========================================

        if (raiseLab) {

            consultation.labRequisition.status = "PENDING";

        } else {

            consultation.labRequisition.status = "COMPLETED";

        }

        await consultation.save();

        // ==========================================
        // Update Visit Workflow
        // ==========================================

        if (raiseLab) {
            visit.currentStage = "LAB";
            visit.status = "WAITING";
            visit.workflow.doctorCompleted = false;
            visit.workflow.labCompleted = false;
        } else {
            visit.currentStage = "COMPLETED";
            visit.status = "COMPLETED";
            visit.workflow.doctorCompleted = true;
        }

        await visit.save();

        return res.status(200).json({
            success: true,
            message: raiseLab
                ? "Patient referred to Lab successfully."
                : "Doctor consultation completed successfully.",
            data: consultation
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

exports.getLabReportByVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinicId;

        const labReport = await LabReport.findOne({
            visitId: id,
            clinicId,
        })
            .populate("petId")
            .populate("visitId");

        if (!labReport) {
            return res.status(404).json({
                success: false,
                message: "Lab report not found.",
                hasLabReport: false
            });
        }

        const visit = await Visit.findById(id);
        let owner = null;
        let pet = null;

        if (visit && visit.petId) {
            const ownerDoc = await PetRegistration.findOne({ "pets._id": visit.petId });
            if (ownerDoc) {
                owner = ownerDoc;
                pet = ownerDoc.pets.id(visit.petId);
            }
        }

        const responseData = {
            ...labReport.toObject(),
            pet: pet || labReport.petId || null,
            owner: owner || null,
            tokenNumber: visit?.tokenNumber || labReport.visitId?.tokenNumber || "N/A"
        };

        return res.status(200).json({
            success: true,
            message: "Lab report fetched successfully.",
            data: responseData,
            hasLabReport: true
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            hasLabReport: false
        });
    }
};

exports.getPreConsultationByVisit = async (req, res) => {
    try {

        const { id } = req.params;
        const clinicId = req.user.clinicId;

        const preConsultation = await PreConsultation.findOne({
            visitId: id,
            clinicId,
        })
            .populate("petId")
            .populate("visitId")
            .populate("ownerId");

        if (!preConsultation) {
            return res.status(404).json({
                success: false,
                message: "Pre-consultation report not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pre-consultation report fetched successfully.",
            data: preConsultation,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.getLabPets = async (req, res) => {
    try {

        const labPets = await Doctor.find({
            status: "LAB_PENDING"
        }).sort({
            updatedAt: -1
        });

        return res.status(200).json({
            success: true,
            total: labPets.length,
            data: labPets
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

//  Delete after refrence will create
exports.createPatient = async (req, res) => {
    try {
        const patient = await Doctor.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Patient Created Successfully",
            data: patient
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Download Lab Report Proxy (Forces PDF Download)
// ======================================================
const axios = require("axios");

// Deliberately unauthenticated (links inside generated PDFs can't carry an
// Authorization header), but that means url must be tightly restricted to
// our own file storage - otherwise this becomes an open SSRF proxy that
// lets anyone make the server fetch arbitrary URLs, including AWS's
// instance-metadata endpoint (a well-known path to stealing the EC2
// instance's IAM credentials).
const ALLOWED_DOWNLOAD_HOSTS = [/\.cloudinary\.com$/i, /\.amazonaws\.com$/i];

const isAllowedDownloadUrl = (rawUrl) => {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        return false;
    }

    return (
        parsed.protocol === "https:" &&
        ALLOWED_DOWNLOAD_HOSTS.some((pattern) => pattern.test(parsed.hostname))
    );
};

exports.downloadLabFile = async (req, res) => {
    try {
        const { url, name } = req.query;
        if (!url) {
            return res.status(400).send("Missing file URL.");
        }

        if (!isAllowedDownloadUrl(url)) {
            return res.status(400).send("URL is not an allowed file host.");
        }

        const safeFilename = (name || "Lab_Report").replace(/[^a-zA-Z0-9_\-]/g, "_");
        const finalFilename = safeFilename.toLowerCase().endsWith(".pdf") ? safeFilename : `${safeFilename}.pdf`;

        const response = await axios({
            method: "get",
            url: url,
            responseType: "stream"
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${finalFilename}"`);

        response.data.pipe(res);
    } catch (error) {
        console.error("Lab file download proxy error:", error.message);
        if (req.query.url) {
            return res.redirect(req.query.url);
        }
        return res.status(500).send("Failed to download lab report PDF file.");
    }
};
