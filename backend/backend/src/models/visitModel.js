const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
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
            required: true
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PetRegistration",
            required: true
        },

        receptionistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reception"
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor"
        },

        preConsultationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PreConsultation"
        },

        labTechnicianId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LabTechnician"
        },

        groomerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Groomer"
        },

        kennelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Kennel"
        },

        visitType: {
            type: String,
            enum: [
                "CONSULTATION",
                "VACCINATION",
                "GROOMING",
                "SURGERY",
                "KENNEL",
                "FOLLOW_UP",
                "EMERGENCY"
            ],
            default: "CONSULTATION"
        },

        tokenNumber: mongoose.Schema.Types.Mixed,

        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment"
        },

      currentStage: {
    type: String,
    enum: [
        "RECEPTION",
        "PRE_CONSULTATION",
        "DOCTOR",
        "LAB",
        "COMPLETED"
    ],
    default: "RECEPTION"
},

        status: {
            type: String,
            enum: [
                "WAITING",
                "IN_PROGRESS",
                "COMPLETED",
                "CANCELLED"
            ],
            default: "WAITING"
        },
        workflow: {

            receptionCompleted: {
                type: Boolean,
                default: false
            },

            preConsultationCompleted: {
                type: Boolean,
                default: false
            },

            doctorCompleted: {
                type: Boolean,
                default: false
            },

            labCompleted: {
                type: Boolean,
                default: false
            },

            groomingCompleted: {
                type: Boolean,
                default: false
            },

            kennelCompleted: {
                type: Boolean,
                default: false
            },

            billingCompleted: {
                type: Boolean,
                default: false
            }

        },

        priority: {
            type: String,
            enum: [
                "NORMAL",
                "URGENT",
                "EMERGENCY"
            ],
            default: "NORMAL"
        },


        primaryReason: {
            type: String,
            enum: ["Treatment", "Vaccination", "Checkup", "Certificate"]
        },

        assignedDoctor: String,

        appointmentDate: Date,

        appointmentTime: String,

        chiefComplaint: String,

        notes: String,

        cancelledReason: String

    },
    {
        timestamps: true
    });

module.exports = mongoose.model("Visit", visitSchema);
