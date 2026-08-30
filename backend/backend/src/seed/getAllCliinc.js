// getAllClinics.js

const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const Clinic = require("../models/Clinic");
const ClinicAdmin = require("../models/ClinicAdmin")

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        process.exit(1);
    }
};

const getAllClinics = async () => {
    try {
        await connectDB();

        const clinics = await ClinicAdmin.find().lean();

        if (clinics.length === 0) {
            console.log("❌ No clinics found.");
        } else {
            console.log(`\n🏥 Total Clinics: ${clinics.length}\n`);

            clinics.forEach((clinic, index) => {
                console.log(`========== Clinic ${index + 1} ==========`);

                console.log("ID                  :", clinic._id);
                console.log("Name                :", clinic.name);
                console.log("Email               :", clinic.email);
                console.log(clinic);

                // console.log("Address             :", clinic.address);
                // console.log("Subscription Type   :", clinic.subscriptionType);
                // console.log("phone               :", clinic.phone);
                // console.log("Subscription Status :", clinic.subscriptionStatus);
                // console.log("Verification Status :", clinic.verificationStatus);

                console.log("----------------------------------------");
            });
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

getAllClinics();