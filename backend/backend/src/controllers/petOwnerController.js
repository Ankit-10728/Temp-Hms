const OwnerReport = require("../models/OwnerReport");
const MedicalRecord = require("../models/MedicalRecord");
const LabReport = require("../models/LabReport");
const Pet = require("../models/Pet");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const Appointment = require("../models/Appointment");
// const Vaccine = require("../models/Vaccine");

// ======================================
// Upload Owner Report
// POST /api/pet-owner/report/upload
// ======================================

exports.uploadOwnerReport = async (req, res) => {
    try {
        const { petId, labName, reportTitle, reportDate, notes } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload report file",
            });
        }

        const pet = await Pet.findById(petId);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        
        const ownerReport = await OwnerReport.create({
            owner: req.user.ownerId,
            pet: petId,
            labName,
            reportTitle,
            reportDate,
            notes,
            fileUrl: req.file.path,
            publicId: req.file.filename,
            fileType: req.file.mimetype.includes("pdf")
                ? "PDF"
                : "IMAGE",
        });

        res.status(201).json({
            success: true,
            message: "Report uploaded successfully",
            data: ownerReport,
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ======================================
// Get All Owner Reports
// GET /api/pet-owner/report
// ======================================

exports.getOwnerReports = async (req, res) => {
    try {

        const reports = await OwnerReport.find({
            owner: req.user.ownerId,
            isDeleted: false,
        })
            .populate("pet", "petName species breed")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: reports.length,
            data: reports,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ======================================
// Get Single Report
// GET /api/pet-owner/report/:id
// ======================================

exports.getReportById = async (req, res) => {

    try {

        const report = await OwnerReport.findById(req.params.id)
            .populate("pet")
            .populate("doctor");

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        res.status(200).json({
            success: true,
            data: report,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// ======================================
// Delete Report
// DELETE /api/pet-owner/report/:id
// ======================================

exports.deleteOwnerReport = async (req, res) => {

    try {

        const report = await OwnerReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        if (report.status !== "OWNER_SUBMITTED") {
            return res.status(400).json({
                success: false,
                message: "Reviewed reports cannot be deleted",
            });
        }

        await cloudinary.uploader.destroy(report.publicId);

        report.isDeleted = true;

        await report.save();

        res.status(200).json({
            success: true,
            message: "Report deleted successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// ======================================
// Download Report
// GET /api/pet-owner/report/download/:id
// ======================================

exports.downloadReport = async (req, res) => {

    try {

        const report = await OwnerReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        res.status(200).json({
            success: true,
            downloadUrl: report.fileUrl,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

exports.getDashboard = async (req, res) => {
    try {
console.log("Dashboard API Hit");
console.log(Appointment);
        // const ownerId = req.user.ownerId;
        const ownerId = "6860f82f9d8d0a12d5d0b4f1";

        const totalVisits = await Appointment.countDocuments({
            ownerId: ownerId
        });

        const totalLabReports = await LabReport.countDocuments({
            ownerId: ownerId
        });

        // Temporary
        const totalVaccinations = 0;

        const totalDocuments = await OwnerReport.countDocuments({
            ownerId: ownerId,
            isDeleted: false
        });

        const recentActivities = await Promise.all([

            Appointment.find({ ownerId: ownerId })
                .sort({ createdAt: -1 })
                .limit(2)
                .select("createdAt status"),

            LabReport.find({ ownerId: ownerId })
                .sort({ createdAt: -1 })
                .limit(2)
                .select("reportName createdAt"),

            OwnerReport.find({
                owner: ownerId,
                isDeleted: false
            })
                .sort({ createdAt: -1 })
                .limit(2)
                .select("labName createdAt status")

        ]);

        const activities = recentActivities
            .flat()
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);

        // Temporary
        const upcomingVaccination = null;

        res.status(200).json({
            success: true,
            dashboard: {
                cards: {
                    totalVisits,
                    totalLabReports,
                    totalVaccinations,
                    totalDocuments
                },
                recentActivities: activities,
                upcomingVaccination
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
exports.getPetHistory = async (req, res) => {
  try {
    const { petId } = req.params;

    // Pet Details
    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    // Latest Medical Record
    const medicalRecord = await MedicalRecord.findOne({
      pet: petId,
    })
      .populate("doctor")
      .sort({ createdAt: -1 });

    // Lab Reports
    const labReports = await LabReport.find({
      pet: petId,
    }).sort({ reportDate: -1 });

    // Owner Uploaded Reports
    const ownerReports = await OwnerReport.find({
      pet: petId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        petProfile: pet,

        vitals: medicalRecord
          ? medicalRecord.vitals
          : null,

        diagnosis: medicalRecord
          ? medicalRecord.diagnosis
          : "",

        prescription: medicalRecord
          ? medicalRecord.prescription
          : [],

        followUpDate: medicalRecord
          ? medicalRecord.followUpDate
          : null,

        nextVaccination: medicalRecord
          ? medicalRecord.nextVaccination
          : null,

        treatmentHistory: medicalRecord
          ? medicalRecord.treatmentHistory
          : [],

        labReports,

        ownerReports,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Owner Pets
// GET /api/v1/pet-owner/pets
// ======================================

exports.getOwnerPets = async (req, res) => {
  try {
    const pets = [
      {
        _id: "pet001",
        petName: "Bruno",
        breed: "Golden Retriever",
        species: "Dog",
        age: 4,
        gender: "Male",
        weight: 28,
        status: "Healthy",
      },
      {
        _id: "pet002",
        petName: "Milo",
        breed: "Persian",
        species: "Cat",
        age: 2,
        gender: "Female",
        weight: 5,
        status: "Healthy",
      },
    ];

    res.status(200).json({
      success: true,
      count: pets.length,
      data: pets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};