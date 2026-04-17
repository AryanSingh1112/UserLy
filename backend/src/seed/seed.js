const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing users
    await User.deleteMany();

    // Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@userly.com',
      password: 'password123',
      role: 'admin',
      status: 'active',
    });

    // Create Normal User
    await User.create({
      name: 'John Doe',
      email: 'user@userly.com',
      password: 'password123',
      role: 'user',
      status: 'active',
      createdBy: admin._id,
      updatedBy: admin._id,
    });

    console.log('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
