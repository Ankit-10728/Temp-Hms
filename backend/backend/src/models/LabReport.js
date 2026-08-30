const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema(
    {
        clinicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clinic",
            required: true,
            index: true
        },

        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },

        visitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Visit",
            required: true,
        },

        consultationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Consultation",
        },

        reports: [
            {
                testName: {
                    type: String,
                    enum: [
                        "CBC",
                        "Biochemistry",
                        "Urinalysis",
                        "Culture & Sensitivity",
                        "X-Ray",
                        "USG",
                        "Cytology",
                        "ELISA",
                        "PCR",
                        "Blood",
                        "Urine",
                        "Stool",
                        "Swab",
                        "Biopsy"
                    ],
                },

                fileUrl: String,
                fileName: String,
            }
        ],

        status: {
            type: String,
            enum: ["Pending", "Completed", "Critical"],
            default: "Pending",
        },

        remarks: String,

    },
    { timestamps: true }
);

module.exports = mongoose.model("LabReport", labReportSchema);