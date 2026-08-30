const mongoose = require("mongoose");

const emergencyContactSchema =
    new mongoose.Schema(
        {
            contactPersonName: {
                type: String,
            },

            contactNumber: {
                type: String,
            },
        },
        { _id: false }
    );

const staffSchema = new mongoose.Schema(
    {
        clinicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clinic",
            required: true
        },
        personalInfo: {
            fullName: {
                type: String,
                required: true,
            },

            profilePhoto: {
                type: String,
            },

            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
            },

            mobileNumber: {
                type: String,
                required: true,
            },

            dateOfBirth: {
                type: Date,
                required: true,
            },

            gender: {
                type: String,
                enum: [
                    "Male",
                    "Female",
                    "Other",
                ],
            },

            emergencyContacts: [
                emergencyContactSchema,
            ],
        },

        employmentInfo: {
            role: {
                type: String,
                required: true,
            },

            roles: {
                type: [String],
                default: [],
            },

            dateOfJoining: Date,

            staffId: {
                type: String,
                unique: true,
            },

            reportingTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Staff",
                default: null,
            },

            department: String,

            employmentType: String,

            accessLevel: String,
        },

        moduleAccess: {
            opd: {
                type: Boolean,
                default: false,
            },

            surgery: {
                type: Boolean,
                default: false,
            },

            lab: {
                type: Boolean,
                default: false,
            },

            icu: {
                type: Boolean,
                default: false,
            },

            grooming: {
                type: Boolean,
                default: false,
            },

            kennel: {
                type: Boolean,
                default: false,
            },

            pharmacy: {
                type: Boolean,
                default: false,
            },

            reports: {
                type: Boolean,
                default: false,
            },

            settings: {
                type: Boolean,
                default: false,
            },
        },

        bankDetails: {
            bankName: {
                type: String,
                default: "",
            },

            accountHolderName: {
                type: String,
                default: "",
            },

            accountNumber: {
                type: String,
                default: "",
            },

            ifscCode: {
                type: String,
                default: "",
            },

            branchName: {
                type: String,
                default: "",
            },

            upiId: {
                type: String,
                default: "",
            },
        },
        accountInfo: {
            username: {
                type: String,
                unique: true,
            },

            password: {
                type: String,
                required: true,
            },

            temporaryPassword: String,

            accountExpiryDate: Date,

            accountActive: {
                type: Boolean,
                default: true,
            },

            forcePasswordReset: {
                type: Boolean,
                default: true,
            },

            twoFactorEnabled: {
                type: Boolean,
                default: false,
            },

            // Keep secret server-side. (Consider encrypting before production.)
            twoFactorSecret: {
                type: String,
                default: '',
            },

            twoFactorVerifiedAt: {
                type: Date,
                default: null,
            },

            // Optional helper flag during setup
            forceTotpSetup: {
                type: Boolean,
                default: false,
            },

            failedPasswordAttempts: { type: Number, default: 0 },
            passwordLockUntil: { type: Date, default: null },
            failedOtpAttempts: { type: Number, default: 0 },
            otpLockUntil: { type: Date, default: null },
            lastLoginAt: { type: Date, default: null },
            lastLoginIp: { type: String, default: null },
            lastLoginDevice: { type: String, default: null },
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

module.exports =
    mongoose.models.Staff ||
    mongoose.model("Staff", staffSchema);
