// getSubscriptionPlans.js

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

const getPlans = async () => {
    try {
        await connectDB();

        const plans = await SubscriptionPlan.find().lean();

        console.log("📦 Subscription Plans:", plans.length);
        console.log(JSON.stringify(plans, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("❌ Error fetching plans:", error);
        process.exit(1);
    }
};

getPlans();