const mongoose = require("mongoose")

const labTechnicianSchema = new mongoose.Schema(
    {

        clinicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clinic",
            required: true
        },
        employeeId: {
            type: String,
            required: true,
            unique: true,
        },

        qualification: {
            type: String,
            required: true,
            trim: true,
        },

        diploma: {
            type: String,
            trim: true,
        },

        licenseNumber: {
            type: String,
            trim: true,
        },

        experience: {
            type: Number,
            required: true,
        },

        certificate: {
            public_id: String,
            url: String,
        },

        idProof: {
            public_id: String,
            url: String,
        },

        previousInstitution: {
            type: String,
            trim: true,
        },

        dateOfJoining: {
            type: Date,
        },

        specializedTests: [
            {
                type: String,
            },
        ],

        shift: {
            type: String,
            enum: [
                "Morning",
                "Afternoon",
                "Evening",
                "24 Hours",
            ],
        },

        shiftStart: String,

        shiftEnd: String,

        weeklyDays: String,

        onCall: String,

        instruments: String,

        lims: String,

        status: {
            type: String,
            enum: [
                "Active",
                "Inactive",
                "On Leave",
                "Probation",
            ],
            default: "Active",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        verifiedAt: Date,

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ClinicAdmin",
        },

        department: String,

        supervisor: String,

        notes: String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "LabTechnician",
    labTechnicianSchema
)