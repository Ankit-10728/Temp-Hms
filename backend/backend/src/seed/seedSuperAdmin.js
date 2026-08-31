const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const bcrypt = require("bcryptjs");

// Import your SuperAdmin model
const SuperAdmin = require("../models/SuperAdmin");

const seedDb = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/your_hms_db"
    );

    console.log("Connected to MongoDB.");

    const name = "Ankit Kumar";
    const email = "ankitt16kr@gmail.com";
    const plainPassword = "123456789";

    // 1. Check if admin already exists
    const existingAdmin = await SuperAdmin.findOne({ email });

    if (existingAdmin) {
      console.log(
        "Superadmin with this email already exists in the database."
      );
      process.exit();
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 3. Create SuperAdmin
    await SuperAdmin.create({
      name,
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    });

    console.log("Successfully created Superadmin credentials!");
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${plainPassword}`);

    process.exit();
  } catch (error) {
    console.error("Error seeding Superadmin:", error);
    process.exit(1);
  }
};

seedDb();