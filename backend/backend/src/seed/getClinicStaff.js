const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const Staff = require("../models/Staff"); // Adjust path if needed

const CLINIC_ID = "6a563353f8b2d9067b35bd28";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed", error);
        process.exit(1);
    }
};

const getClinicStaff = async () => {
    try {
        await connectDB();

        const staffs = await Staff.find({

        }).sort({
            "employmentInfo.role": 1,
            "personalInfo.fullName": 1,
        });

        console.log(`\nTotal Staff: ${staffs.length}\n`);

        staffs.forEach((staff, index) => {
            console.log({
                srNo: index + 1,
                id: staff._id,
                name: staff.personalInfo.fullName,
                role: staff.employmentInfo.role,
                email: staff.personalInfo.email,
                mobile: staff.personalInfo.mobileNumber,
                username: staff.accountInfo.username,
                active: staff.accountInfo.accountActive,
                reportTo: staff.employmentInfo.reportingTo,
            });
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

getClinicStaff();