const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const LabReport = require("../models/LabReport");

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected");

        // Show existing indexes
        const indexes = await LabReport.collection.indexes();
        console.log(indexes);

        // Remove the old index
        await LabReport.collection.dropIndex("reportId_1");
        console.log("✅ reportId_1 index dropped");

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

fix();