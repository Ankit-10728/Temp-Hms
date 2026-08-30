const mongoose = require("mongoose");

const clinicAdminSchema = new mongoose.Schema(
    {
        clinicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clinic",
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            default: "CLINIC_ADMIN",
        },
        forcePasswordReset: {
            type: Boolean,
            default: true,
        },
        failedPasswordAttempts: { type: Number, default: 0 },
        passwordLockUntil: { type: Date, default: null },
        failedOtpAttempts: { type: Number, default: 0 },
        otpLockUntil: { type: Date, default: null },
        lastLoginAt: { type: Date, default: null },
        lastLoginIp: { type: String, default: null },
        lastLoginDevice: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ClinicAdmin", clinicAdminSchema);