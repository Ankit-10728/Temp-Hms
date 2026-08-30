const mongoose = require("mongoose");

const ownerReportSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true
    },
    // Owner
    ownerId: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerMobile: {
      type: String,
      required: true,
      trim: true,
    },

    // Pet
    petId: {
      type: String,
      required: true,
      trim: true,
    },

    petName: {
      type: String,
      required: true,
      trim: true,
    },

    breed: {
      type: String,
      default: "",
    },

    species: {
      type: String,
      default: "",
    },

    age: {
      type: Number,
      default: 0,
    },

    gender: {
      type: String,
      default: "",
    },

    weight: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "Healthy",
    },

    // Visit Summary
    appointmentId: {
      type: String,
      default: "",
    },

    visitDate: {
      type: Date,
      default: Date.now,
    },

    visitReason: {
      type: String,
      default: "",
    },

    doctorName: {
      type: String,
      default: "",
    },

    // Vitals
    vitals: {
      temperature: {
        type: Number,
        default: 0,
      },
      heartRate: {
        type: Number,
        default: 0,
      },
      respiratoryRate: {
        type: Number,
        default: 0,
      },
      weight: {
        type: Number,
        default: 0,
      },
    },

    // Doctor Notes
    observation: {
      type: String,
      default: "",
    },

    diagnosis: {
      type: String,
      default: "",
    },

    // Prescription
    prescription: {
      title: {
        type: String,
        default: "",
      },

      pdfUrl: {
        type: String,
        default: "",
      },

      issuedDate: {
        type: Date,
        default: null,
      },
    },

    // Lab Reports
    labReports: [
      {
        reportName: String,
        reportDate: Date,
        reportUrl: String,
        uploadedBy: {
          type: String,
          enum: ["LAB", "OWNER"],
          default: "OWNER",
        },
      },
    ],

    // Upload By Owner
    externalLabReport: {
      labName: {
        type: String,
        required: true,
      },

      reportTitle: {
        type: String,
        default: "",
      },

      reportDate: {
        type: Date,
        required: true,
      },

      notes: {
        type: String,
        default: "",
      },

      fileUrl: {
        type: String,
        required: true,
      },

      publicId: {
        type: String,
        required: true,
      },

      fileType: {
        type: String,
        enum: ["PDF", "IMAGE"],
        required: true,
      },
    },

    // Follow Up
    followUpDate: {
      type: Date,
      default: null,
    },

    // Vaccination
    vaccination: {
      vaccineName: {
        type: String,
        default: "",
      },

      nextVaccinationDate: {
        type: Date,
        default: null,
      },
    },

    // Timeline
    treatmentHistory: [
      {
        title: String,
        description: String,
        date: Date,
      },
    ],

    // Doctor Review
    reviewStatus: {
      type: String,
      enum: [
        "OWNER_SUBMITTED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
      ],
      default: "OWNER_SUBMITTED",
    },

    doctorComment: {
      type: String,
      default: "",
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ownerReportSchema.index({ ownerId: 1 });
ownerReportSchema.index({ petId: 1 });
ownerReportSchema.index({ reviewStatus: 1 });
ownerReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model("OwnerReport", ownerReportSchema);