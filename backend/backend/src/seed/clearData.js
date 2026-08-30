



// scripts/clearDatabase.js

const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"), // adjust if needed
});

// ======================
// Import Models
// ======================
const Doctor = require("../models/DoctorDetails");
// const DoctorModule = require("../models/DoctorModuleModel");
const Groomer = require("../models/GroomerModel");
const Kennel = require("../models/KennelModel");
const LabRecord = require("../models/LabRecord");
const LabReport = require("../models/LabReport");
const LabTechnician = require("../models/LabTechnician");
const PetRegistration = require("../models/PetRegistration");
const PreConsultation = require("../models/PreConsultation");
const Staff = require("../models/Staff");
const Clinic = require("../models/Clinic")
const ClinicAdmin = require("../models/ClinicAdmin")
// const Appointment = require("../models/Appointment");
// const User = require("../models/User");
// const Clinic = require("../models/Clinic");

async function clearDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ Connected to MongoDB\n");

        await Promise.all([
            Doctor.deleteMany({}),
            // DoctorModule.deleteMany({}),
            Groomer.deleteMany({}),
            Kennel.deleteMany({}),
            LabRecord.deleteMany({}),
            LabReport.deleteMany({}),
            LabTechnician.deleteMany({}),
            PetRegistration.deleteMany({}),
            PreConsultation.deleteMany({}),
            Staff.deleteMany({}),

            ClinicAdmin.deleteMany({}),
            Clinic.deleteMany({}),
            // Appointment.deleteMany({}),
            // User.deleteMany({}),
            // Clinic.deleteMany({})
        ]);

        console.log("✅ Database cleaned successfully.");
    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 MongoDB disconnected.");
        process.exit();
    }
}

clearDatabase();