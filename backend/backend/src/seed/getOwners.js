// getOwners.js

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const Owner = require("../models/Owner");
const Preconsultation = require("../models/PreConsultation")
const PetRegistration = require("../models/PetRegistration")
const getOwners = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB.\n");

        const owners = await PetRegistration.find()
            .select("_id ownerName mobileNumber email pets");

        if (owners.length === 0) {
            console.log("No owners found.");
            process.exit(0);
        }

        console.log("========== OWNERS WITH PETS ==========\n");

        owners.forEach((owner, index) => {
            console.log(`Owner ${index + 1}`);
            console.log(`Owner ID : ${owner._id}`);
            console.log(`Name     : ${owner.ownerName}`);
            console.log(`Mobile   : ${owner.mobileNumber}`);
            console.log(`Email    : ${owner.email || "N/A"}`);

            console.log("Pets:");

            owner.pets.forEach((pet, i) => {
                console.log(`   Pet ${i + 1}`);
                console.log(`   Pet ID   : ${pet._id}`);  // 🔥 IMPORTANT
                console.log(`   Name     : ${pet.petName}`);
                console.log(`   Species  : ${pet.species}`);
                console.log(`   Breed    : ${pet.breed}`);
                console.log("----------------------");
            });

            console.log("----------------------------------");
        });

        process.exit(0);
    } catch (error) {
        console.error("Error fetching owners:", error);
        process.exit(1);
    }
};


getOwners();