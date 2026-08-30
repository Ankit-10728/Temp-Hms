const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const PetRegistration = require("../models/PetRegistration");
const Pet = require("../models/Pet");

async function migratePets() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ Connected");

        // Optional
        await Pet.deleteMany({});

        const owners = await PetRegistration.find();

        const pets = [];

        for (const owner of owners) {
            for (const pet of owner.pets) {
                pets.push({
                    _id: pet._id,                 // SAME PET ID
                    ownerId: owner._id,           // Reference to owner

                    name: pet.petName,
                    species: pet.species.toUpperCase(),
                    breed: pet.breed,
                    dob: pet.dob,
                    gender: pet.gender,
                    color: pet.color,

                    identificationMarks: pet.identificationArea,
                    photoUrl: pet.petPhoto,

                    isSterilised: pet.sterilized,

                    allergies: pet.history?.allergies
                        ? [pet.history.allergies]
                        : [],

                    rfidTag: pet.rfid,

                    weightTracker: []
                });
            }
        }

        await Pet.insertMany(pets);

        console.log(`✅ ${pets.length} pets migrated successfully`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

migratePets();