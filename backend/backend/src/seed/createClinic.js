const path = require("path");

console.log("🚀 seedClinicAdmin.js STARTED");

console.log("📍 __dirname:", __dirname);

const envPath = path.resolve(__dirname, "../../.env");

console.log("📁 ENV PATH:", envPath);

const dotenv = require("dotenv");

console.log("📦 dotenv loaded");

const result = dotenv.config({
    path: envPath,
});

console.log("🔧 dotenv config finished");

if (result.error) {
    console.log("❌ dotenv error:", result.error);
} else {
    console.log("✅ .env loaded");
}

console.log(
    "🔑 MONGO_URI:",
    process.env.MONGO_URI ? "FOUND" : "NOT FOUND"
);

const mongoose = require("mongoose");

console.log("📦 mongoose loaded");

const bcrypt = require("bcryptjs");

console.log("📦 bcrypt loaded");

const Clinic = require("../models/Clinic");

console.log("📦 Clinic model loaded");

const ClinicAdmin = require("../models/ClinicAdmin");

console.log("📦 ClinicAdmin model loaded");

const SubscriptionPlan = require("../models/SubscriptionPlan");

console.log("📦 SubscriptionPlan model loaded");

console.log("🎯 ALL IMPORTS COMPLETED");

// ==========================================
// DATABASE CONNECTION
// ==========================================

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        console.error(error.message);
        process.exit(1);
    }
};

// ==========================================
// SEED CLINIC + ADMIN
// ==========================================

const seedClinicAdmin = async () => {
    try {
        await connectDB();

        // ==========================================
        // LOGIN CREDENTIALS
        // ==========================================

        const email = "ak16012006@gmail.com";
        const password = "123456789";

        // ==========================================
        // FIND SUBSCRIPTION PLAN
        // ==========================================

        const planCode = "STD6M001";

        const subscriptionPlan = await SubscriptionPlan.findOne({
            planCode: planCode,
            status: "Active",
        });

        if (!subscriptionPlan) {
            console.error(`❌ Plan ${planCode} not found.`);
            console.error("👉 Run seedPlan.js first.");
            return;
        }

        console.log(
            `✅ Subscription Plan Found: ${subscriptionPlan.subscriptionPlan}`
        );



        // ==========================================
        // SUBSCRIPTION DATES
        // ==========================================

        const planStartDate = new Date();

        const planEndDate = new Date(planStartDate);
        planEndDate.setMonth(planEndDate.getMonth() + 6);

        const trialDays = subscriptionPlan.trialPeriodDays || 10;

        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword = await bcrypt.hash(password, 10);

        // ==========================================
        // COMPLETE CLINIC DATA
        // ==========================================

        const clinicData = {
            clinicCode: "CLINIC001",

            name: "Test Veterinary Clinic",

            facilityType: "Veterinary Clinic",

            yearOfEstablishment: "2026",

            address:
                "Plot No. 123, Fraser Road, Near Gandhi Maidan, Patna, Bihar - 800001",

            contactEmail: email,

            email: email,

            phone: "6299742423",

            altPhone: "9876543210",

            website: "https://testveterinaryclinic.example.com",

            // ==========================================
            // PLAN
            // ==========================================

            // Your Clinic schema defines this as String
            plan: subscriptionPlan.subscriptionPlan,

            trialDays: trialDays,

            customPlanPrice: subscriptionPlan.price,

            discountCode: "WELCOME10",

            notes:
                "Test veterinary clinic created using seed script.",

            subscriptionType:
                subscriptionPlan.billingCycle,

            subscriptionStatus: "ACTIVE",

            expiryDate: planEndDate,

            planStartDate: planStartDate,

            planEndDate: planEndDate,

            billingCycle:
                subscriptionPlan.billingCycle,

            // ==========================================
            // LICENSE LIMITS
            // ==========================================

            licenseLimits: {
                maxDoctors:
                    subscriptionPlan.featureLimits.maxDoctors,

                maxStaff:
                    subscriptionPlan.featureLimits.maxStaffAccounts,

                maxPets:
                    subscriptionPlan.featureLimits.maxPetRecords,

                maxPetsUnlimited:
                    subscriptionPlan.featureLimits.maxPetRecordsUnlimited,

                storageLimit:
                    subscriptionPlan.featureLimits.storageLimitGb,
            },

            // ==========================================
            // LOCATION
            // ==========================================

            location: {
                type: "Point",

                coordinates: [
                    85.1376,
                    25.5941,
                ],
            },

            // ==========================================
            // ADDRESS DETAILS
            // ==========================================

            addressDetails: {
                addressLine1:
                    "Plot No. 123, Fraser Road",

                addressLine2:
                    "Near Gandhi Maidan",

                city: "Patna",

                district: "Patna",

                state: "Bihar",

                pincode: "800001",

                serviceAreas: [
                    "Patna",
                    "Danapur",
                    "Phulwari Sharif",
                    "Kankarbagh",
                    "Rajendra Nagar",
                ],
            },

            // ==========================================
            // ADMIN DETAILS
            // ==========================================

            adminDetails: {
                adminName: "Clinic Admin",

                adminEmail: email,

                adminPhone: "6299742423",

                designation: "Clinic Administrator",

                govtIdType: "Aadhaar",

                govtIdNumber: "XXXX-XXXX-1234",
            },

            // ==========================================
            // TAX DETAILS
            // ==========================================

            taxDetails: {
                gstNumber: "10ABCDE1234F1Z5",

                panNumber: "ABCDE1234F",

                bankName: "State Bank of India",

                accountNumber: "123456789012",

                ifscCode: "SBIN0001234",
            },

            // ==========================================
            // REGISTRATION DETAILS
            // ==========================================

            registrationDetails: {
                vetRegistrationNumber:
                    "BR-VET-2026-001",

                stateCouncil:
                    "Bihar Veterinary Council",

                vetExpiry:
                    new Date("2028-12-31"),

                tradeLicenseNumber:
                    "TRADE-BR-2026-001",

                tradeExpiry:
                    new Date("2027-12-31"),

                drugLicenseNumber:
                    "DRUG-BR-2026-001",

                drugExpiry:
                    new Date("2027-12-31"),
            },

            // ==========================================
            // FEATURES
            // ==========================================

            features: {
                labModule:
                    subscriptionPlan.modules.lab,

                groomingModule:
                    subscriptionPlan.modules.grooming,

                kennelModule:
                    subscriptionPlan.modules.kennel,

                pharmacyModule:
                    subscriptionPlan.modules.onlinePharmacy,

                inventoryModule: true,

                telemedicineModule: false,

                apiAccess:
                    subscriptionPlan.modules.apiAccess,

                whiteLabel:
                    subscriptionPlan.modules.whiteLabelBranding,
            },

            // ==========================================
            // SERVICES
            // ==========================================

            servicesOffered: [
                "General Veterinary Consultation",
                "Pet Vaccination",
                "Pet Surgery",
                "Diagnostic Laboratory",
                "Pet Grooming",
                "Kennel Boarding",
                "Dental Care",
                "Emergency Veterinary Care",
                "Deworming",
                "Parasite Control",
                "Microchipping",
                "Health Checkup",
            ],

            // ==========================================
            // LEGAL DOCUMENTS
            // ==========================================

            legalDocuments: {
                clinicLogoUrl:
                    "https://example.com/documents/clinic-logo.png",

                clinicLogoName:
                    "test-veterinary-clinic-logo.png",

                vetCouncilCertificateUrl:
                    "https://example.com/documents/vet-council-certificate.pdf",

                vetCouncilCertificateName:
                    "vet-council-certificate.pdf",

                tradeLicenseUrl:
                    "https://example.com/documents/trade-license.pdf",

                tradeLicenseName:
                    "trade-license.pdf",

                drugLicenseUrl:
                    "https://example.com/documents/drug-license.pdf",

                drugLicenseName:
                    "drug-license.pdf",

                cancelledChequeUrl:
                    "https://example.com/documents/cancelled-cheque.pdf",

                cancelledChequeName:
                    "cancelled-cheque.pdf",

                adminProfileUrl:
                    "https://example.com/documents/admin-profile.jpg",

                adminProfileName:
                    "admin-profile.jpg",

                idDocumentUrl:
                    "https://example.com/documents/admin-id.pdf",

                idDocumentName:
                    "admin-id.pdf",
            },

            // ==========================================
            // VERIFICATION
            // ==========================================

            verificationStatus: "APPROVED",

            isActive: true,

            rejectionReason: null,
        };

        // ==========================================
        // CREATE / UPDATE CLINIC
        // ==========================================

        let clinic = await Clinic.findOne({
            email: email.toLowerCase(),
        });

        if (!clinic) {
            clinic = await Clinic.create(clinicData);

            console.log("✅ Clinic created");
        } else {
            await Clinic.updateOne(
                { _id: clinic._id },
                { $set: clinicData }
            );

            clinic = await Clinic.findById(
                clinic._id
            );

            console.log("🔄 Clinic updated");
        }

        // ==========================================
        // CREATE / UPDATE ADMIN
        // ==========================================

        let clinicAdmin = await ClinicAdmin.findOne({
            email: email.toLowerCase(),
        }).select("+password");

        if (!clinicAdmin) {
            clinicAdmin = await ClinicAdmin.create({
                clinicId: clinic._id,

                email: email.toLowerCase(),

                password: hashedPassword,

                role: "CLINIC_ADMIN",

                forcePasswordReset: false,

                failedPasswordAttempts: 0,

                passwordLockUntil: null,

                failedOtpAttempts: 0,

                otpLockUntil: null,

                lastLoginAt: null,

                lastLoginIp: null,

                lastLoginDevice: null,
            });

            console.log("✅ Clinic Admin created");
        } else {
            clinicAdmin.clinicId = clinic._id;

            clinicAdmin.password = hashedPassword;

            clinicAdmin.role = "CLINIC_ADMIN";

            clinicAdmin.forcePasswordReset = false;

            clinicAdmin.failedPasswordAttempts = 0;

            clinicAdmin.passwordLockUntil = null;

            clinicAdmin.failedOtpAttempts = 0;

            clinicAdmin.otpLockUntil = null;

            clinicAdmin.lastLoginAt = null;

            clinicAdmin.lastLoginIp = null;

            clinicAdmin.lastLoginDevice = null;

            await clinicAdmin.save();

            console.log("🔄 Clinic Admin updated");
        }

        // ==========================================
        // OUTPUT
        // ==========================================

        console.log("\n========================================");
        console.log("       CLINIC SEEDED SUCCESSFULLY");
        console.log("========================================");

        console.log("\n🏥 CLINIC");
        console.log("----------------------------------------");

        console.log("Clinic ID:", clinic._id);
        console.log("Clinic Code:", clinic.clinicCode);
        console.log("Clinic Name:", clinic.name);
        console.log("Email:", clinic.email);
        console.log("Plan:", clinic.plan);
        console.log(
            "Subscription:",
            clinic.subscriptionType
        );
        console.log(
            "Billing Cycle:",
            clinic.billingCycle
        );
        console.log(
            "Subscription Status:",
            clinic.subscriptionStatus
        );
        console.log(
            "Plan Start:",
            clinic.planStartDate
        );
        console.log(
            "Plan End:",
            clinic.planEndDate
        );

        console.log("\n💳 PLAN");
        console.log("----------------------------------------");

        console.log("Plan ID:", subscriptionPlan._id);
        console.log("Plan Code:", subscriptionPlan.planCode);
        console.log(
            "Plan Name:",
            subscriptionPlan.subscriptionPlan
        );
        console.log("Price:", subscriptionPlan.price);
        console.log(
            "Billing:",
            subscriptionPlan.billingCycle
        );

        console.log("\n👤 ADMIN");
        console.log("----------------------------------------");

        console.log("Admin ID:", clinicAdmin._id);
        console.log("Clinic ID:", clinicAdmin.clinicId);
        console.log("Email:", clinicAdmin.email);
        console.log("Password:", password);
        console.log("Role:", clinicAdmin.role);

        console.log("\n========================================");
        console.log("          🔐 LOGIN CREDENTIALS");
        console.log("========================================");
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("========================================\n");

    } catch (error) {
        console.error("\n❌ Seed Failed");
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 MongoDB Connection Closed");
    }
};

console.log("🔥 About to start seedClinicAdmin()");

seedClinicAdmin();

console.log("🔥 seedClinicAdmin() was called");