const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});
const bcrypt = require('bcryptjs');


// Import your SuperAdmin model
const SuperAdmin = require('../models/SuperAdmin');

const seedDb = async () => {
  try {
    // Connect to your MongoDB database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/your_hms_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    const email = 'ankursati75956@gmail.com';
    const plainPassword = 'Superadmin@123';

    // 1. Check if the admin already exists
    const existingAdmin = await SuperAdmin.findOne({ email });
    if (existingAdmin) {
      console.log('Superadmin with this email already exists in the database.');
      process.exit();
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 3. Create the SuperAdmin record
    await SuperAdmin.create({
      email: email,
      password: hashedPassword,
      role: 'SUPER_ADMIN' // Default from schema
    });

    console.log('Successfully created Superadmin credentials!');
    process.exit();
  } catch (error) {
    console.error('Error seeding Superadmin:', error);
    process.exit(1);
  }
};

seedDb();