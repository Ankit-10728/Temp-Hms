const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const Owner = require("../models/Owner");
const Preconsultation = require("../models/PreConsultation");
const PetRegistration = require("../models/PetRegistration");

const clearDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB.\n");

        // Delete all records
        const petResult = await PetRegistration.deleteMany({});
        console.log(`Deleted ${petResult.deletedCount} PetRegistration records`);

        const preResult = await Preconsultation.deleteMany({});
        console.log(`Deleted ${preResult.deletedCount} PreConsultation records`);

        const ownerResult = await Owner.deleteMany({});
        console.log(`Deleted ${ownerResult.deletedCount} Owner records`);

        console.log("\nDatabase cleared successfully.");

        process.exit(0);
    } catch (error) {
        console.error("Error clearing database:", error);
        process.exit(1);
    }
};

clearDatabase();