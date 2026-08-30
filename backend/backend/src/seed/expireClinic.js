// scripts/expireClinic.js

const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const Clinic = require("../models/Clinic");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        process.exit(1);
    }
};

const expireClinic = async () => {
    try {
        await connectDB();

        const clinicId = "6a563353f8b2d9067b35bd28";

        const clinic = await Clinic.findByIdAndUpdate(
            clinicId,
            {
                subscriptionStatus: "EXPIRED",
                expiryDate: new Date(),
            },
            {
                new: true,
            }
        );

        if (!clinic) {
            console.log("❌ Clinic not found");
            process.exit(1);
        }

        console.log("------------------------------------------");
        console.log("✅ Clinic subscription expired successfully");
        console.log("Clinic ID :", clinic._id.toString());
        console.log("Clinic    :", clinic.name);
        console.log("Status    :", clinic.subscriptionStatus);
        console.log("Expiry    :", clinic.expiryDate);
        console.log("------------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

expireClinic();