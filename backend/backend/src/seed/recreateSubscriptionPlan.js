// recreateSubscriptionPlan.js

const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const SubscriptionPlan = require("../models/SubscriptionPlan");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        process.exit(1);
    }
};

const recreateSubscriptionPlan = async () => {
    try {
        await connectDB();

        // Replace this with the planId from ClinicSubscriptionTracker
        const planId = "6a58d5c3462e3f852ac45fd5";

        // Check if plan already exists
        const existingPlan = await SubscriptionPlan.findById(planId);

        if (existingPlan) {
            console.log("⚠️ Subscription Plan already exists.");
            console.log(existingPlan);

            await mongoose.connection.close();
            process.exit(0);
        }

        const plan = await SubscriptionPlan.create({
            _id: new mongoose.Types.ObjectId(planId),

            planType: "Clinic",

            planCode: "STD6M001",

            price: 4999,

            subscriptionPlan: "Standard",

            billingCycle: "6_MONTHS",

            planStartDate: new Date("2026-07-13T18:21:27.463Z"),

            planEndRenewalDate: new Date("2027-01-13T18:21:27.463Z"),

            trialPeriodDays: 10,

            featureLimits: {
                maxStaffAccounts: 10,
                maxDoctors: 5,
                maxPetRecords: 5000,
                maxPetRecordsUnlimited: false,
                storageLimitGb: 50,
            },

            modules: {
                lab: true,
                grooming: true,
                kennel: true,
                onlinePharmacy: false,
                apiAccess: false,
                whiteLabelBranding: false,
            },

            subscriptionInvoice: "Auto-generated PDF",

            status: "Active",
        });

        console.log("✅ Subscription Plan recreated successfully.\n");
        console.log(plan);

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);

        await mongoose.connection.close();
        process.exit(1);
    }
};

recreateSubscriptionPlan();