// seedPlan.js

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
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

const plans = [
    // =========================
    // BASIC
    // =========================
    {
        planType: "Clinic",
        planCode: "BASIC001",
        price: 1999,
        subscriptionPlan: "Basic",
        billingCycle: "Monthly",

        planStartDate: new Date("2026-08-30T00:00:00.000Z"),
        planEndRenewalDate: new Date("2026-09-30T00:00:00.000Z"),

        trialPeriodDays: 10,

        featureLimits: {
            maxStaffAccounts: 5,
            maxDoctors: 2,
            maxPetRecords: 1000,
            maxPetRecordsUnlimited: false,
            storageLimitGb: 10,
        },

        modules: {
            lab: false,
            grooming: false,
            kennel: false,
            onlinePharmacy: false,
            apiAccess: false,
            whiteLabelBranding: false,
        },

        subscriptionInvoice: "Auto-generated PDF",
        status: "Active",
    },

    // =========================
    // STANDARD - 6 MONTHS
    // =========================
    {
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
    },

    // =========================
    // PROFESSIONAL
    // =========================
    {
        planType: "Clinic",
        planCode: "PROF001",
        price: 8999,
        subscriptionPlan: "Professional",
        billingCycle: "12_MONTHS",

        planStartDate: new Date("2026-08-30T00:00:00.000Z"),
        planEndRenewalDate: new Date("2027-08-30T00:00:00.000Z"),

        trialPeriodDays: 10,

        featureLimits: {
            maxStaffAccounts: 25,
            maxDoctors: 10,
            maxPetRecords: 20000,
            maxPetRecordsUnlimited: false,
            storageLimitGb: 100,
        },

        modules: {
            lab: true,
            grooming: true,
            kennel: true,
            onlinePharmacy: true,
            apiAccess: true,
            whiteLabelBranding: false,
        },

        subscriptionInvoice: "Auto-generated PDF",
        status: "Active",
    },

    // =========================
    // ENTERPRISE
    // =========================
    {
        planType: "Clinic",
        planCode: "ENT001",
        price: 14999,
        subscriptionPlan: "Enterprise",
        billingCycle: "12_MONTHS",

        planStartDate: new Date("2026-08-30T00:00:00.000Z"),
        planEndRenewalDate: new Date("2027-08-30T00:00:00.000Z"),

        trialPeriodDays: 10,

        featureLimits: {
            maxStaffAccounts: 100,
            maxDoctors: 50,
            maxPetRecords: 100000,
            maxPetRecordsUnlimited: false,
            storageLimitGb: 500,
        },

        modules: {
            lab: true,
            grooming: true,
            kennel: true,
            onlinePharmacy: true,
            apiAccess: true,
            whiteLabelBranding: true,
        },

        subscriptionInvoice: "Auto-generated PDF",
        status: "Active",
    },

    // =========================
    // SOLO BASIC
    // =========================
    {
        planType: "Solo Doctor",
        planCode: "SOLOB001",
        price: 999,
        subscriptionPlan: "Solo Basic",
        billingCycle: "Monthly",

        planStartDate: new Date("2026-08-30T00:00:00.000Z"),
        planEndRenewalDate: new Date("2026-09-30T00:00:00.000Z"),

        trialPeriodDays: 10,

        featureLimits: {
            maxStaffAccounts: 1,
            maxDoctors: 1,
            maxPetRecords: 1000,
            maxPetRecordsUnlimited: false,
            storageLimitGb: 5,
        },

        modules: {
            lab: false,
            grooming: false,
            kennel: false,
            onlinePharmacy: false,
            apiAccess: false,
            whiteLabelBranding: false,
        },

        subscriptionInvoice: "Auto-generated PDF",
        status: "Active",
    },

    // =========================
    // SOLO PRO
    // =========================
    {
        planType: "Solo Doctor",
        planCode: "SOLOP001",
        price: 2999,
        subscriptionPlan: "Solo Pro",
        billingCycle: "12_MONTHS",

        planStartDate: new Date("2026-08-30T00:00:00.000Z"),
        planEndRenewalDate: new Date("2027-08-30T00:00:00.000Z"),

        trialPeriodDays: 10,

        featureLimits: {
            maxStaffAccounts: 3,
            maxDoctors: 1,
            maxPetRecords: 5000,
            maxPetRecordsUnlimited: false,
            storageLimitGb: 25,
        },

        modules: {
            lab: true,
            grooming: true,
            kennel: false,
            onlinePharmacy: false,
            apiAccess: true,
            whiteLabelBranding: false,
        },

        subscriptionInvoice: "Auto-generated PDF",
        status: "Active",
    },
];

const seedPlans = async () => {
    try {
        await connectDB();

        console.log("🌱 Starting subscription plan seed...\n");

        for (const planData of plans) {
            const existingPlan = await SubscriptionPlan.findOne({
                planCode: planData.planCode,
            });

            if (existingPlan) {
                await SubscriptionPlan.updateOne(
                    { planCode: planData.planCode },
                    { $set: planData }
                );

                console.log(`🔄 Updated: ${planData.planCode}`);
            } else {
                await SubscriptionPlan.create(planData);

                console.log(`✅ Created: ${planData.planCode}`);
            }
        }

        console.log("\n🎉 Subscription plans seeded successfully!");

        const allPlans = await SubscriptionPlan.find({}).lean();

        console.log("\n📋 Current subscription plans:\n");

        allPlans.forEach((plan) => {
            console.log(
                `${plan.planCode} | ${plan.planType} | ${plan.subscriptionPlan} | ₹${plan.price} | ${plan.billingCycle}`
            );
        });

        await mongoose.connection.close();

        console.log("\n🔌 MongoDB connection closed.");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Seed Error:");
        console.error(error);

        try {
            await mongoose.connection.close();
        } catch (closeError) {
            console.error("❌ Error closing MongoDB:", closeError.message);
        }

        process.exit(1);
    }
};

seedPlans();