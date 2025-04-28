require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Election = require('../models/Election');

const sampleElections = [
  {
    title: 'Student Council President 2025',
    description: 'Election for the student council president position for the academic year 2025.',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),   // 5 days from now
    status: 'Ongoing'
  },
  {
    title: 'Classroom Representative',
    description: 'Select your class representative for the current semester.',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),  // 2 days from now
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),    // 9 days from now
    status: 'Upcoming'
  },
  {
    title: 'Best Faculty Award',
    description: 'Vote for the best faculty member of the year.',
    startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),    // 5 days ago
    status: 'Ended'
  }
];

async function seedElections() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Find admin user to set as creator
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.error('No admin user found. Run seedUsers.js first.');
      process.exit(1);
    }

    // Clear existing elections
    await Election.deleteMany({});
    console.log('Cleared existing elections');

    // Create elections
    for (const electionData of sampleElections) {
      const election = await Election.create({
        ...electionData,
        createdBy: admin._id
      });
      
      console.log(`Created election: ${election.title}`);
    }

    // Assign all users to be eligible for all elections
    const regularUsers = await User.find({ role: 'user' });
    const elections = await Election.find({});
    
    for (const user of regularUsers) {
      user.eligibleElections = elections.map(e => e._id);
      await user.save();
      console.log(`Assigned all elections to user: ${user.email}`);
    }

    console.log('All elections created and assigned successfully!');
    
  } catch (error) {
    console.error('Error seeding elections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the seed function
seedElections();