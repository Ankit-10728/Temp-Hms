const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const bcrypt = require("bcryptjs");

const Clinic = require("../models/Clinic");
const ClinicAdmin = require("../models/ClinicAdmin");

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

const seedClinicAdmin = async () => {
    try {
        await connectDB();

        // ==========================================
        // USE THE SAME CREDENTIALS YOU PROVIDED
        // ==========================================

        const email = "ak16012006@gmail.com";
        const password = "123456789";

        // ==========================================
        // 1. CREATE CLINIC
        // ==========================================

        let clinic = await Clinic.findOne({
            email: email.toLowerCase(),
        });

        if (!clinic) {
            clinic = await Clinic.create({
                clinicCode: "CLINIC001",

                name: "Test Veterinary Clinic",

                facilityType: "Veterinary Clinic",

                yearOfEstablishment: "2026",

                address: "Test Address",

                contactEmail: email,

                email: email,

                phone: "6299742423",

                subscriptionType: "TRIAL",

                subscriptionStatus: "ACTIVE",

                trialDays: 30,

                planStartDate: new Date(),

                planEndDate: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                ),

                adminDetails: {
                    adminName: "Clinic Admin",
                    adminEmail: email,
                    adminPhone: "6299742423",
                    designation: "Clinic Administrator",
                },

                verificationStatus: "APPROVED",

                isActive: true,
            });

            console.log("✅ Clinic created");
        } else {
            console.log("ℹ️ Clinic already exists");
        }

        // ==========================================
        // 2. HASH PASSWORD
        // ==========================================

        const hashedPassword = await bcrypt.hash(password, 10);

        // ==========================================
        // 3. CREATE / UPDATE CLINIC ADMIN
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
            // Update password so the credential you specified
            // definitely works for login.
            clinicAdmin.clinicId = clinic._id;
            clinicAdmin.password = hashedPassword;
            clinicAdmin.role = "CLINIC_ADMIN";
            clinicAdmin.forcePasswordReset = false;
            clinicAdmin.failedPasswordAttempts = 0;
            clinicAdmin.passwordLockUntil = null;
            clinicAdmin.failedOtpAttempts = 0;
            clinicAdmin.otpLockUntil = null;

            await clinicAdmin.save();

            console.log("✅ Clinic Admin already existed — credentials updated");
        }

        // ==========================================
        // 4. PRINT CLINIC ADMIN INFO
        // ==========================================

        const adminInfo = await ClinicAdmin.findById(
            clinicAdmin._id
        )
            .select("+password")
            .lean();

        console.log("\n========================================");
        console.log("       CLINIC ADMIN SEEDED");
        console.log("========================================");

        console.log({
            id: adminInfo._id,
            clinicId: adminInfo.clinicId,
            email: adminInfo.email,
            password: password,
            role: adminInfo.role,
            forcePasswordReset: adminInfo.forcePasswordReset,
            failedPasswordAttempts: adminInfo.failedPasswordAttempts,
            passwordLockUntil: adminInfo.passwordLockUntil,
        });

        console.log("========================================\n");

        console.log("🔐 LOGIN CREDENTIALS");
        console.log("Email:", adminInfo.email);
        console.log("Password:", password);

    } catch (error) {
        console.error("❌ Seed Failed");
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 MongoDB Connection Closed");
    }
};

seedClinicAdmin();