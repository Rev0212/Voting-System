require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

const regularUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'user'
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    const createdAdmin = await User.create({
      ...adminUser,
      password: hashedPassword
    });
    
    console.log(`Created admin user: ${createdAdmin.email}`);

    // Create regular users
    for (const userData of regularUsers) {
      const userSalt = await bcrypt.genSalt(10);
      const userHashedPassword = await bcrypt.hash(userData.password, userSalt);
      
      const user = await User.create({
        ...userData,
        password: userHashedPassword
      });
      
      console.log(`Created user: ${user.email}`);
    }

    console.log('All users created successfully!');
    console.log('\nUse these credentials to login:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: john@example.com / password123');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the seed function
seedUsers();