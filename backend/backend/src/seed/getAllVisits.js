const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const Visit = require("../models/visitModel");

const getVisits = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const visits = await Visit.find({})
        console.log(visits.map(v => ({
            _id: v._id.toString(),
            clinicId: v.clinicId.toString(),
            currentStage: v.currentStage,
            status: v.status,
        })));

        console.log(`\nTotal Visits: ${visits.length}\n`);

        console.dir(visits, { depth: null, colors: true });

        await mongoose.disconnect();
        console.log("\n✅ MongoDB Disconnected");
    } catch (error) {
        console.error("❌ Error:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

getVisits();