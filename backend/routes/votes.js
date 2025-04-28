const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/votes
// @desc    Cast a vote
// @access  Private
router.post(
  '/',
  [
    protect,
    body('electionId').notEmpty().withMessage('Election ID is required'),
    body('candidateId').notEmpty().withMessage('Candidate ID is required'),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { electionId, candidateId } = req.body;

    try {
      // Check if election exists and is ongoing
      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ message: 'Election not found' });
      }
      
      if (election.status !== 'Ongoing') {
        return res.status(400).json({ 
          message: 'Voting is only allowed during ongoing elections' 
        });
      }

      // Check if user is eligible to vote in this election
      const user = await User.findById(req.user._id);
      if (!user.eligibleElections.includes(electionId)) {
        return res.status(401).json({ 
          message: 'You are not eligible to vote in this election' 
        });
      }

      // Check if candidate is verified and belongs to this election
      const candidate = await Candidate.findById(candidateId);
      if (!candidate || candidate.status !== 'Verified' || 
          candidate.electionId.toString() !== electionId) {
        return res.status(400).json({ message: 'Invalid candidate' });
      }

      // Check if user has already voted in this election
      const existingVote = await Vote.findOne({
        electionId,
        voterId: req.user._id,
      });
      
      if (existingVote) {
        return res.status(400).json({ 
          message: 'You have already voted in this election' 
        });
      }

      // Create vote
      const vote = new Vote({
        electionId,
        voterId: req.user._id,
        candidateId,
      });

      await vote.save();
      
      res.status(201).json({ message: 'Vote cast successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/votes/user
// @desc    Get user's votes
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const votes = await Vote.find({ voterId: req.user._id })
      .populate('electionId', 'title')
      .populate({
        path: 'candidateId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });
      
    res.json(votes);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/votes/results/:electionId
// @desc    Get election results (full tally)
// @access  Public (only for ended elections, otherwise admin only)
router.get('/results/:electionId', async (req, res) => {
  try {
    const electionId = req.params.electionId;
    
    // Verify election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // If election is not ended and user is not admin, restrict access
    if (election.status !== 'Ended' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ 
        message: 'Results are only available after the election has ended' 
      });
    }
    
    // Get vote counts for each candidate
    const voteCounts = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      { $group: { _id: '$candidateId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get candidate details
    const candidates = await Candidate.find({ 
      electionId, 
      status: 'Verified' 
    }).populate('userId', 'name');
    
    // Combine candidate details with vote counts
    const results = candidates.map(candidate => {
      const voteInfo = voteCounts.find(
        v => v._id.toString() === candidate._id.toString()
      );
      
      return {
        candidateId: candidate._id,
        candidateName: candidate.userId.name,
        manifesto: candidate.manifesto,
        profileImage: candidate.profileImage,
        votes: voteInfo ? voteInfo.count : 0
      };
    });
    
    // Sort by vote count descending
    results.sort((a, b) => b.votes - a.votes);
    
    const totalVotes = voteCounts.reduce((sum, item) => sum + item.count, 0);
    const totalEligibleVoters = await User.countDocuments({
      eligibleElections: electionId
    });
    
    res.json({
      electionId,
      electionTitle: election.title,
      electionStatus: election.status,
      startDate: election.startDate,
      endDate: election.endDate,
      totalVotes,
      totalEligibleVoters,
      turnoutPercentage: totalEligibleVoters > 0 
        ? (totalVotes / totalEligibleVoters * 100).toFixed(2) + '%' 
        : '0%',
      results
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;