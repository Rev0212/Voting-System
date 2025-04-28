require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

async function seedCandidates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Clear existing candidates
    await Candidate.deleteMany({});
    console.log('Cleared existing candidates');

    // Get users and elections
    const users = await User.find({ role: 'user' });
    const elections = await Election.find({});
    
    if (users.length < 2 || elections.length === 0) {
      console.error('Not enough users or no elections found. Run seedUsers.js and seedElections.js first.');
      process.exit(1);
    }

    // Create candidate applications
    const manifestos = [
      "I promise to represent student interests and improve campus facilities. My focus will be on creating more study spaces and extending library hours.",
      "My goal is to enhance the learning experience by advocating for more interactive classes and better resources for students.",
      "If elected, I will work on improving communication between students and faculty, and organize more social events to build our community."
    ];

    // Create candidates for each election (2 per election)
    for (const election of elections) {
      // Select 2 random users for each election
      const randomUsers = users.sort(() => 0.5 - Math.random()).slice(0, 2);
      
      for (let i = 0; i < randomUsers.length; i++) {
        const candidate = await Candidate.create({
          userId: randomUsers[i]._id,
          electionId: election._id,
          manifesto: manifestos[Math.floor(Math.random() * manifestos.length)],
          status: election.status === 'Ended' ? 'Verified' : ['Pending', 'Verified'][Math.floor(Math.random() * 2)]
        });
        
        console.log(`Created candidate for ${randomUsers[i].name} in election: ${election.title}`);
      }
    }

    console.log('All candidates created successfully!');
    
  } catch (error) {
    console.error('Error seeding candidates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the seed function
seedCandidates();