const mongoose = require("mongoose");

const clinicSettingsSchema = new mongoose.Schema(
  {
    clinicName: {
      type: String,
      required: true,
      trim: true,
    },

    tagline: {
      type: String,
      default: "",
    },

    logo: {
      url: String,
      public_id: String,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    workingHours: {
      start: {
        type: String,
        default: "09:00",
      },
      end: {
        type: String,
        default: "18:00",
      },
    },

    holidays: [
      {
        type: Date,
      },
    ],

    opdCapacity: {
      type: Number,
      default: 50,
    },

    consultationDuration: {
      type: Number,
      default: 15,
    },

    bookingMode: {
      type: String,
      enum: [
        "Only offline booking",
        "Only online booking",
        "Both booking is available",
      ],
      default: "Both booking is available",
    },

    primaryLanguage: {
      type: String,
      default: "English",
    },

    currency: {
      type: String,
      default: "INR",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ClinicSettings",
  clinicSettingsSchema
);