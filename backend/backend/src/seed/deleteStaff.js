const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const Staff = require("../models/Staff"); // Adjust path if needed

const STAFF_ID = "6a5a3b6ca9fc08b75acddbc7";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed", error);
        process.exit(1);
    }
};

const deleteStaff = async () => {
    try {
        await connectDB();

        // const staff = await Staff.findById(STAFF_ID);

        // if (!staff) {
        //     console.log("❌ Staff not found.");
        //     process.exit(0);
        // }

        const staff = await Staff.findOneAndDelete({
            'personalInfo.email': "kumarkaraan.dev@gmail.com",
        });

        // console.log(
        //     `✅ Staff "${staff.personalInfo.fullName}" deleted successfully.`
        // );

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

deleteStaff();