const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    manifesto: {
      type: String,
      required: [true, 'Manifesto is required'],
    },
    profileImage: {
      type: String,
    },
  },
  { timestamps: true }
);

// Make sure a user can only apply once per election
candidateSchema.index({ userId: 1, electionId: 1 }, { unique: true });

module.exports = mongoose.model('Candidate', candidateSchema);