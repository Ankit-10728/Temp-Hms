const mongoose = require("mongoose");

const clinicCodeReservationSchema = new mongoose.Schema(
  {
    clinicCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reservationToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reservedBy: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ClinicCodeReservation ||
  mongoose.model("ClinicCodeReservation", clinicCodeReservationSchema);
