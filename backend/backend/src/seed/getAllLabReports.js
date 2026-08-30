const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

// ======================
// Import Model
// ======================
const LabReport = require("../models/LabReport");

async function getAllLabReports() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ Connected to MongoDB\n");

        const reports = await LabReport.find({})


        console.log(`📊 Total Reports: ${reports.length}\n`);

        console.log(JSON.stringify(reports, null, 2));

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 MongoDB disconnected.");
        process.exit();
    }
}

getAllLabReports();