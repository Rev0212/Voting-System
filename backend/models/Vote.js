const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
    },
    voterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only vote once per election
voteSchema.index({ electionId: 1, voterId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);