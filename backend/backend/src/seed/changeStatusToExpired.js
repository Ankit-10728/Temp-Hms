// expireClinicAndSubscription.js

const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const Clinic = require("../models/Clinic");
const ClinicSubscriptionTracker = require("../models/ClinicSubscriptionTracker");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        process.exit(1);
    }
};

const expireClinicSubscription = async () => {
    try {
        await connectDB();

        const clinicId = "6a563353f8b2d9067b35bd28";

        // Expire it 30 days ago
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 30);

        // ------------------------------------
        // EXPIRE CLINIC
        // ------------------------------------

        const clinic = await Clinic.findById(clinicId);

        if (!clinic) {
            console.log("❌ Clinic not found");
            process.exit(1);
        }

        clinic.subscriptionStatus = "EXPIRED";
        clinic.expiryDate = expiredDate;

        await clinic.save();

        console.log("✅ Clinic expired.");

        // ------------------------------------
        // EXPIRE SUBSCRIPTION TRACKER
        // ------------------------------------

        const tracker = await ClinicSubscriptionTracker.findOne({ clinicId });

        if (!tracker) {
            console.log("⚠️ Subscription tracker not found.");
        } else {
            tracker.status = "EXPIRED";
            tracker.planEndRenewalDate = expiredDate;

            // Optional if you want to expire the trial too
            tracker.trialEndDate = expiredDate;

            await tracker.save();

            console.log("✅ Subscription tracker expired.");

            console.log({
                trackerId: tracker._id,
                clinicId: tracker.clinicId,
                status: tracker.status,
                paymentStatus: tracker.paymentStatus,
                trialEndDate: tracker.trialEndDate,
                planEndRenewalDate: tracker.planEndRenewalDate,
            });
        }

        console.log("\n========== FINAL STATUS ==========");

        console.log({
            clinicId: clinic._id,
            clinicName: clinic.name,
            subscriptionStatus: clinic.subscriptionStatus,
            expiryDate: clinic.expiryDate,
        });

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

expireClinicSubscription();