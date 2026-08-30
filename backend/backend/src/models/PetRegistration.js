const mongoose = require("mongoose");
const { petSchema } = require("./Pet");

const vaccinationSchema = new mongoose.Schema({
    vaccineName: String,
    vaccinationDate: Date,
    batchNumber: String,
    clinicName: String
});

const dewormingSchema = new mongoose.Schema({
    product: String,
    dewormingDate: Date,
    dose: String
});

const surgerySchema = new mongoose.Schema({
    procedure: String,
    surgeryDate: Date,
    hospital: String
});

const treatmentSchema = new mongoose.Schema({
    condition: String,
    treatment: String,
    treatmentDate: Date
});

const visitSchema = new mongoose.Schema({
    primaryReason: {
        type: String,
        enum: ["Treatment", "Vaccination", "Checkup", "Certificate"],
        required: true
    },

    assignedDoctor: {
        type: String,
        required: true
    },
    complaint: {
        type: String,
        required: true
    },
    tokenNumber: String,
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    }
});



const ownerSchema = new mongoose.Schema(
    {
        clinicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clinic",
            required: true
        },
        mobileNumber: {
            type: String,
            required: true,
            trim: true,
            match: /^[6-9]\d{9}$/
        },
        isMobileVerified: {
            type: Boolean,
            default: false
        },

        ownerName: {
            type: String,
            required: true
        },

        visitType: {
            type: String,
            enum: ["New", "Follow-up"]
        },

        ownerIdType: String,
        ownerOtherIdType: String,
        ownerIdNumber: String,
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        address: String,
        state: String,
        city: String,
        district: String,
        pincode: String,

        pets: [petSchema]
    },
    {
        timestamps: true
    });

ownerSchema.index({ clinicId: 1, mobileNumber: 1 }, { unique: true });

module.exports = mongoose.model(
    "PetRegistration",
    ownerSchema
);
