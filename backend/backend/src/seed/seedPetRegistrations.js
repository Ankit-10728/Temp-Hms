const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const PetRegistration = require("../models/PetRegistration");

const sampleData = [
    {
        mobileNumber: "9876543210",
        ownerName: "Rahul Verma",
        visitType: "New",
        ownerIdType: "Aadhaar Card",
        email: "rahul.verma@example.com",
        address: "12 MG Road",
        state: "Delhi",
        city: "New Delhi",
        district: "Central Delhi",
        pincode: "110001",
        pets: [
            {
                petName: "Bruno",
                species: "Dog",
                breed: "Labrador",
                gender: "Male",
                dob: new Date("2021-05-10"),
                age: 5,
                color: "Golden",
                rfid: "RF1001",
                identificationArea: "Neck",
                sterilized: true,
                uniquePetId: `PET-${Date.now()}-1`,
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
        mobileNumber: "9876543211",
        ownerName: "Sneha Kapoor",
        visitType: "Follow-up",
        ownerIdType: "PAN Card",
        email: "sneha.kapoor@example.com",
        address: "45 Park Street",
        state: "West Bengal",
        city: "Kolkata",
        district: "Kolkata",
        pincode: "700016",
        pets: [
            {
                petName: "Milo",
                species: "Cat",
                breed: "Persian",
                gender: "Male",
                dob: new Date("2022-01-12"),
                age: 4,
                color: "White",
                sterilized: false,
                uniquePetId: `PET-${Date.now()}-2`,
                history: {
                    vaccinations: [],
                    dewormings: [],
                    surgeries: [],
                    treatments: [],
                    allergies: "Dust",
                    currentMedications: "",
                },
                visits: [
                    {
                        primaryReason: "Vaccination",
                        assignedDoctor: "Dr. Mehta",
                        complaint: "Annual vaccine",
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
        mobileNumber: "9876543212",
        ownerName: "Arjun Nair",
        visitType: "New",
        ownerIdType: "Passport",
        email: "arjun.nair@example.com",
        address: "18 Green Park",
        state: "Kerala",
        city: "Kochi",
        district: "Ernakulam",
        pincode: "682001",
        pets: [
            {
                petName: "Rocky",
                species: "Dog",
                breed: "German Shepherd",
                gender: "Male",
                dob: new Date("2020-08-22"),
                age: 6,
                color: "Black & Tan",
                sterilized: true,
                uniquePetId: `PET-${Date.now()}-3`,
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

    {
        mobileNumber: "9876543213",
        ownerName: "Priya Singh",
        visitType: "New",
        ownerIdType: "Voter ID",
        email: "priya.singh@example.com",
        address: "22 Civil Lines",
        state: "Uttar Pradesh",
        city: "Lucknow",
        district: "Lucknow",
        pincode: "226001",
        pets: [
            {
                petName: "Coco",
                species: "Dog",
                breed: "Pug",
                gender: "Female",
                dob: new Date("2023-02-11"),
                age: 3,
                color: "Fawn",
                sterilized: false,
                uniquePetId: `PET-${Date.now()}-4`,
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
                        primaryReason: "Checkup",
                        assignedDoctor: "Dr. Khan",
                        complaint: "Loss of appetite",
                        tokenNumber: "T004",
                        appointmentDate: new Date(),
                        appointmentTime: "3:30 PM",
                        status: "Pending",
                    },
                ],
            },
        ],
    },

    {
        mobileNumber: "9876543214",
        ownerName: "Amit Das",
        visitType: "Follow-up",
        ownerIdType: "Driving License",
        email: "amit.das@example.com",
        address: "8 Lake View",
        state: "Assam",
        city: "Guwahati",
        district: "Kamrup",
        pincode: "781001",
        pets: [
            {
                petName: "Leo",
                species: "Cat",
                breed: "Siamese",
                gender: "Male",
                dob: new Date("2021-09-20"),
                age: 5,
                color: "Cream",
                sterilized: true,
                uniquePetId: `PET-${Date.now()}-5`,
                history: {
                    vaccinations: [],
                    dewormings: [],
                    surgeries: [],
                    treatments: [],
                    allergies: "Food allergy",
                    currentMedications: "Vitamin supplements",
                },
                visits: [
                    {
                        primaryReason: "Checkup",
                        assignedDoctor: "Dr. Roy",
                        complaint: "Skin irritation",
                        tokenNumber: "T005",
                        appointmentDate: new Date(),
                        appointmentTime: "5:00 PM",
                        status: "Pending",
                    },
                ],
            },
        ],
    },

    {
        mobileNumber: "9876543215",
        ownerName: "Neha Gupta",
        visitType: "New",
        ownerIdType: "Aadhaar Card",
        email: "neha.gupta@example.com",
        address: "55 Ring Road",
        state: "Punjab",
        city: "Ludhiana",
        district: "Ludhiana",
        pincode: "141001",
        pets: [
            {
                petName: "Bella",
                species: "Dog",
                breed: "Beagle",
                gender: "Female",
                dob: new Date("2022-07-18"),
                age: 4,
                color: "Brown White",
                sterilized: false,
                uniquePetId: `PET-${Date.now()}-6`,
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
                        primaryReason: "Vaccination",
                        assignedDoctor: "Dr. Patel",
                        complaint: "Booster dose",
                        tokenNumber: "T006",
                        appointmentDate: new Date(),
                        appointmentTime: "6:30 PM",
                        status: "Pending",
                    },
                ],
            },
        ],
    },
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        await PetRegistration.insertMany(sampleData);

        console.log("6 sample records inserted successfully");
        process.exit(0);
    } catch (error) {
        console.error("Seed Error:", error);
        process.exit(1);
    }
};

seedData();