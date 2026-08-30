// getClinicSubscriptionTrackers.js

const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

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

const getClinicSubscriptionTrackers = async () => {
    try {
        await connectDB();

        const trackers = await ClinicSubscriptionTracker.find();

        console.dir(trackers, { depth: null });

        console.log(`\n✅ Total Trackers: ${trackers.length}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

getClinicSubscriptionTrackers();