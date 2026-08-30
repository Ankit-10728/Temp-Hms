const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema(
    {
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
            default: "SUPER_ADMIN",
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

module.exports = mongoose.model("SuperAdmin", superAdminSchema);