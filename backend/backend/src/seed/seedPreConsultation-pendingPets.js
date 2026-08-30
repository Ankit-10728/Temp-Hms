const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

// Import your model
const PreConsultation = require("../models/PreConsultation");

const seedDb = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(
            process.env.MONGO_URI || "mongodb://localhost:27017/your_hms_db",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );

        console.log("Connected to MongoDB.");

        // await PreConsultation.deleteMany({});

        const pendingPets = [
            {
                ownerId: "6a46a0b7e079bd5e161fcadc",
                uniquePetId: "PET007",
                tokenNumber: "T007",

                bodyTemperature: 101.5,
                heartRate: 92,
                respiratoryRate: 24,
                bloodPressure: "Normal",
                spo2: 98,
                bodyWeight: 18.5,
                bcs: 3,
                recordedBy: "Reception",

                durationOfIllness: {
                    value: 2,
                    unit: "Days",
                },

                onset: "Sudden",
                progression: "Stable",

                previousEpisodes: {
                    hasPreviousEpisodes: false,
                    description: "",
                },

                recentTravel: false,
                animalContact: true,

                primaryComplaint: "Vomiting",

                associatedSymptoms: ["Vomiting", "Lethargy"],

                severity: "Moderate",

                generalDemeanour: "Alert",

                gaitAndPosture: "",
                visibleLesions: "",
                eyesAbnormality: "",
                noseAbnormality: "",
                earAbnormality: "",
                skinCondition: "",
                staffNotes: "",

                status: "PENDING",
            },


        ];



        await PreConsultation.insertMany(pendingPets);

        console.log(`${pendingPets.length} pending pets inserted successfully.`);
        process.exit();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedDb();