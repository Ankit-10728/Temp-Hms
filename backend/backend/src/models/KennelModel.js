const mongoose = require("mongoose");

const kennelSchema = new mongoose.Schema(
    {
        clinicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clinic",
            required: true
        },
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            required: [true, "Staff ID is required"],
        },

        experience: {
            type: Number,
            required: [true, "Experience is required"],
            min: 0,
        },

        shift: {
            type: String,
            enum: ["Day", "Night", "Rotating"],
            required: [true, "Shift is required"],
        },

        firstAidCertified: {
            type: Boolean,
            default: false,
        },

        firstAidCertificate: {
            secure_url: {
                type: String,
                default: "",
            },
            public_id: {
                type: String,
                default: "",
            },
        },

        canAdministerMedication: {
            type: Boolean,
            default: false,
        },

        speciesComfortableWith: [
            {
                type: String,
                enum: [
                    "Dog",
                    "Cat",
                    "Bird",
                    "Rabbit",
                    "Hamster",
                    "Guinea Pig",
                    "Reptile",
                    "Fish",
                ],
            },
        ],

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Kennel", kennelSchema);