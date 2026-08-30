const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

// ======================
// Import Model
// ======================
const Pet = require("../models/Pet");

async function getAllPets() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ Connected to MongoDB\n");

        const pets = await Pet.find({})


        console.log(`🐶 Total Pets: ${pets.length}\n`);

        console.log(JSON.stringify(pets, null, 2));

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 MongoDB disconnected.");
        process.exit();
    }
}

getAllPets();