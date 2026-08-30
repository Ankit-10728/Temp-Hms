const mongoose = require("mongoose");

const labRecordSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true
    },
    labOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    petName: {
      type: String,
      required: true,
    },

    ownerName: {
      type: String,
      required: true,
    },

    ownerPhone: {
      type: String,
      required: true,
    },

    reportType: {
      type: String,
      required: true,
    },

    appointmentId: String,

    clinicId: String,

    petId: String,

    ownerId: String,

    doctorId: String,

    labTechnicianId: String,

    testsRequired: [String],

    testsCompleted: [String],

    reportFiles: [String], // Cloudinary URLs

    sampleCollectedAt: Date,

    reportDate: Date,

    externalLabName: String,

    criticalValuesFlag: {
      type: Boolean,
      default: false,
    },

    criticalNotes: String,

    remarks: String,

    status: {
      type: String,
      enum: [
        "Pending",
        "Sample Collected",
        "Processing",
        "Completed",
      ],
      default: "Pending",
    },


    doctorTreatmentUnlocked: {
      type: Boolean,
      default: false,
    },

    uploadedBy: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LabRecord", labRecordSchema);