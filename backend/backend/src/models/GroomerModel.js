const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: [
                "Certificate",
                "Diploma",
                "Training Course",
                "Workshop",
                "Other",
            ],
        },

        name: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const groomerSchema = new mongoose.Schema(
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
            trim: true,
        },

        experience: {
            type: Number,
            default: 0,
        },

        previousSalon: {
            type: String,
            trim: true,
        },

        licenseNumber: {
            type: String,
            trim: true,
        },

        dateOfJoining: {
            type: Date,
        },

        certificates: [certificateSchema],

        certificateDocument: {
            type: String,
        },

        profilePhoto: {
            type: String,
        },

        certified: {
            type: Boolean,
            default: true,
        },

        species: [
            {
                type: String,
                enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Guinea Pig', 'Reptile'],
            },
        ],

        services: [
            {
                type: String,
                enum: ['Bath & Dry', 'Haircut', 'Nail Trim', 'Ear Cleaning', 'Teeth Brushing', 'De-shedding', 'Flea Treatment', 'Full Groom'],
            },
        ],

        shift: {
            type: String,
            enum: ["Full Day", "Half Day", "Weekends"],
        },

        shiftStart: String,

        shiftEnd: String,

        weeklyDays: String,

        onCall: String,

        tools: String,

        specialBreeds: String,

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

        department: {
            type: String,
            enum: [
                "Grooming Studio",
                "Mobile Grooming",
                "Spa & Wellness",
                "General Grooming",
            ],
            default: "General Grooming"
        },

        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Groomer", groomerSchema);