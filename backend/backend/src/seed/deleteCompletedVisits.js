// scripts/deleteCompletedVisits.js

const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

// ======================
// Import Models
// ======================
const Visit = require("../models/visitModel");

async function deleteCompletedVisits() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ Connected to MongoDB\n");

        // 🔥 Delete only completed visits
        const result = await Visit.deleteMany({
            status: "COMPLETED"
        });

        console.log(`✅ Deleted ${result.deletedCount} completed visits.`);
    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 MongoDB disconnected.");
        process.exit();
    }
}

deleteCompletedVisits();