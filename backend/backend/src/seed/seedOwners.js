// seedPetRegistration.js

const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const PetRegistration = require("../models/PetRegistration");

const seedPetRegistrations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB");

        // Uncomment if you want fresh data
        // await PetRegistration.deleteMany({});

        const clinicId = new mongoose.Types.ObjectId("6a4d02d322b758362ceda689");

        const registrations = [
            {
                clinicId,
                ownerName: "Rahul Verma",
                mobileNumber: "9876543210",
                isMobileVerified: true,
                visitType: "New",
                ownerIdType: "Aadhar",
                email: "rahul.verma@example.com",
                address: "45 MG Road",
                city: "Bengaluru",
                district: "Bengaluru Urban",
                state: "Karnataka",
                pincode: "560001",

                pets: [
                    {
                        petName: "Bruno",
                        species: "Dog",
                        breed: "Labrador Retriever",
                        gender: "Male",
                        dob: new Date("2021-05-10"),
                        age: 5,
                        color: "Golden",
                        rfid: "RF1001",
                        identificationArea: "Neck",
                        petPhoto: "",
                        sterilized: true,
                        uniquePetId: "PET001",

                        history: {
                            vaccinations: [
                                {
                                    vaccineName: "Rabies",
                                    vaccinationDate: new Date("2025-01-15"),
                                    batchNumber: "RB001",
                                    clinicName: "City Vet Clinic",
                                },
                            ],
                            dewormings: [
                                {
                                    product: "Drontal",
                                    dewormingDate: new Date("2025-02-01"),
                                    dose: "1 Tablet",
                                },
                            ],
                            surgeries: [],
                            treatments: [],
                            allergies: "None",
                            currentMedications: "None",
                        },

                        visits: [
                            {
                                primaryReason: "Checkup",
                                assignedDoctor: "Dr. Sharma",
                                complaint: "Routine Checkup",
                                tokenNumber: "T001",
                                appointmentDate: new Date(),
                                appointmentTime: "10:00 AM",
                                status: "Pending",
                            },
                        ],
                    },
                ],
            },

            {
                clinicId,
                ownerName: "Sneha Kapoor",
                mobileNumber: "9876543211",
                isMobileVerified: true,
                visitType: "Follow-up",
                ownerIdType: "Driving License",
                email: "sneha.kapoor@example.com",
                address: "22 Lake View",
                city: "Pune",
                district: "Pune",
                state: "Maharashtra",
                pincode: "411001",

                pets: [
                    {
                        petName: "Milo",
                        species: "Cat",
                        breed: "Persian",
                        gender: "Male",
                        dob: new Date("2022-03-18"),
                        age: 3,
                        color: "White",
                        rfid: "RF1002",
                        identificationArea: "Chest",
                        petPhoto: "",
                        sterilized: false,
                        uniquePetId: "PET002",

                        history: {
                            vaccinations: [],
                            dewormings: [],
                            surgeries: [],
                            treatments: [],
                            allergies: "Fish",
                            currentMedications: "",
                        },

                        visits: [
                            {
                                primaryReason: "Vaccination",
                                assignedDoctor: "Dr. Mehta",
                                complaint: "Annual Vaccine",
                                tokenNumber: "T002",
                                appointmentDate: new Date(),
                                appointmentTime: "11:30 AM",
                                status: "Pending",
                            },
                        ],
                    },
                ],
            },

            {
                clinicId,
                ownerName: "Arjun Nair",
                mobileNumber: "9876543212",
                isMobileVerified: true,
                visitType: "New",
                ownerIdType: "Passport",
                email: "arjun.nair@example.com",
                address: "18 Green Park",
                city: "Kochi",
                district: "Ernakulam",
                state: "Kerala",
                pincode: "682001",

                pets: [
                    {
                        petName: "Rocky",
                        species: "Dog",
                        breed: "German Shepherd",
                        gender: "Male",
                        dob: new Date("2020-08-22"),
                        age: 5,
                        color: "Black & Tan",
                        rfid: "RF1003",
                        identificationArea: "Back",
                        petPhoto: "",
                        sterilized: true,
                        uniquePetId: "PET003",

                        history: {
                            vaccinations: [],
                            dewormings: [],
                            surgeries: [],
                            treatments: [],
                            allergies: "",
                            currentMedications: "",
                        },

                        visits: [
                            {
                                primaryReason: "Treatment",
                                assignedDoctor: "Dr. Joseph",
                                complaint: "Vomiting",
                                tokenNumber: "T003",
                                appointmentDate: new Date(),
                                appointmentTime: "2:00 PM",
                                status: "Pending",
                            },
                        ],
                    },
                ],
            },
        ];

        const result = await PetRegistration.insertMany(registrations);

        console.log("Seed completed successfully.\n");

        result.forEach((owner, index) => {
            console.log(`Owner ${index + 1}`);
            console.log("Mongo ID :", owner._id);
            console.log("Owner    :", owner.ownerName);
            console.log("Pet      :", owner.pets[0].petName);
            console.log("Pet ID   :", owner.pets[0].uniquePetId);
            console.log("--------------------------------------");
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedPetRegistrations();