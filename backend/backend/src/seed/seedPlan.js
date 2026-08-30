// resetStandard6MonthsPlan.js

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

const resetPlan = async () => {
    try {
        await connectDB();

        // Delete existing plan
        await SubscriptionPlan.deleteOne({ planCode: "STD6M001" });
        console.log("🗑️ Existing STD6M001 plan deleted.");

        // Create same plan with 10-day trial
        const plan = await SubscriptionPlan.create({
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

        console.log("✅ Plan recreated successfully.");
        console.log(plan);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

resetPlan();