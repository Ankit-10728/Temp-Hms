const mongoose = require("mongoose");

const preConsultationSchema = new mongoose.Schema(
  {
    // ======================================================
    // APPOINTMENT INFORMATION
    // ======================================================
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visit",
      required: true,
    },

    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },

    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    // ======================================================
    // PET INFORMATION
    // ======================================================
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PetRegistration",
    },

    uniquePetId: {
      type: String,
      trim: true,
    },

    tokenNumber: {
      type: String,
      trim: true,
    },

    // ======================================================
    // STEP 1 : VITALS & INITIAL ASSESSMENT
    // ======================================================
    bodyTemperature: {
      type: Number,
    },

    bodyTemperatureUnit: {
      type: String,
      enum: ["F", "C"],
      default: "F",
    },

    heartRate: {
      type: Number,
    },

    respiratoryRate: {
      type: Number,
    },

    bloodPressure: {
      systolic: {
        type: Number,
        min: 0,
      },
      diastolic: {
        type: Number,
        min: 0,
      },
    },

    spo2: {
      type: Number,
      min: 0,
      max: 100,
    },

    bodyWeight: {
      type: Number,
    },

    bcs: {
      type: Number,
      min: 1,
      max: 9,
    },

    recordedBy: {
      type: String,
      trim: true,
    },

    vitalsRecordedAt: {
      type: Date,
      default: Date.now,
    },

    // ======================================================
    // STEP 2 : BRIEF HISTORY OF PROBLEM
    // ======================================================
    durationOfIllness: {
      value: {
        type: Number,
      },
      unit: {
        type: String,
        enum: ["Days", "Weeks", "Months", "Years", "days", "weeks", "months", "years"],
      },
    },

    onset: {
      type: String,
      enum: ["Sudden", "Gradual"],
    },

    progression: {
      type: String,
      enum: ["Improving", "Worsening", "Stable"],
    },

    previousEpisodes: {
      hasPreviousEpisodes: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        trim: true,
        default: "",
      },
    },

    recentTravel: {
      hasTravel: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        trim: true,
        default: "",
      },
    },

    animalContact: {
      hasContact: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        trim: true,
        default: "",
      },
    },
    // ======================================================
    // STEP 3 : PROBLEM DESCRIPTION
    // ======================================================
    primaryComplaint: {
      type: String,
      trim: true,
    },

    associatedSymptoms: [
      {
        type: String,
        enum: [
          "Vomiting",
          "Diarrhea",
          "Lethargy",
          "Coughing",
          "Sneezing",
          "Discharge",
          "Skin Lesion",
          "Lameness",
          "Other",
        ],
      },
    ],

    severity: {
      type: String,
      enum: ["Mild", "Moderate", "Severe"],
    },

    // ======================================================
    // STEP 4 : OBSERVATION
    // ======================================================
    generalDemeanour: {
      type: String,
      enum: [
        "Alert",
        "Depressed",
        "Anxious",
        "Unconscious",
      ],
    },

    gaitAndPosture: {
      type: String,
      trim: true,
      default: "",
    },

    visibleLesions: {
      type: String,
      trim: true,
      default: "",
    },

    eyesAbnormality: {
      type: String,
      trim: true,
      default: "",
    },

    noseAbnormality: {
      type: String,
      trim: true,
      default: "",
    },

    earAbnormality: {
      type: String,
      trim: true,
      default: "",
    },

    skinCondition: {
      type: String,
      trim: true,
      default: "",
    },

    staffNotes: {
      type: String,
      trim: true,
      default: "",
    },

    // ======================================================
    // WORKFLOW STATUS
    // ======================================================
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PreConsultation",
  preConsultationSchema
);