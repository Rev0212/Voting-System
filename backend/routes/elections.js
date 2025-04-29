console.log('Loaded election routes');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all elections
router.get('/', async (req, res) => {
  try {
    const elections = await Election.find()
      .sort({ startDate: -1 })
      .populate('createdBy', 'name');
    res.json(elections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get eligible elections — moved up
router.get('/eligible', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('eligibleElections');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.eligibleElections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create election - admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const newElection = new Election({
      ...req.body,
      createdBy: req.user.id,
    });
    await newElection.save();
    res.status(201).json(newElection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get live vote counts - admin only
router.get('/live/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const electionId = req.params.id;

    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const voteCounts = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      { $group: { _id: '$candidateId', count: { $sum: 1 } } }
    ]);

    const candidates = await Candidate.find({ 
      electionId, 
      status: 'Verified' 
    }).populate('userId', 'name');

    const results = candidates.map(candidate => {
      const voteInfo = voteCounts.find(
        v => v._id.toString() === candidate._id.toString()
      );
      return {
        candidateId: candidate._id,
        candidateName: candidate.userId.name,
        votes: voteInfo ? voteInfo.count : 0
      };
    });

    res.json({
      electionId,
      electionTitle: election.title,
      totalVotes: voteCounts.reduce((sum, item) => sum + item.count, 0),
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single election
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'name');
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update election - admin only
router.put('/:id',
  [
    protect,
    authorize('admin'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('startDate').notEmpty().withMessage('Start date is required'),
    body('endDate').notEmpty().withMessage('End date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, description, startDate, endDate } = req.body;
      const election = await Election.findById(req.params.id);
      if (!election) return res.status(404).json({ message: 'Election not found' });
      if (election.status === 'Ended') {
        return res.status(400).json({ message: 'Cannot update an election that has already ended' });
      }

      election.title = title;
      election.description = description;
      election.startDate = startDate;
      election.endDate = endDate;
      await election.save();
      res.json(election);
    } catch (error) {
      console.error(error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Election not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// End election manually - admin only
router.patch('/:id/end', protect, authorize('admin'), async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    election.status = 'Ended';
    election.endDate = new Date();
    await election.save();
    res.json(election);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete election - admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const voteCount = await Vote.countDocuments({ electionId: req.params.id });
    if (voteCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete election with existing votes'
      });
    }

    await Candidate.deleteMany({ electionId: req.params.id });
    await User.updateMany(
      { eligibleElections: req.params.id },
      { $pull: { eligibleElections: req.params.id } }
    );
    await election.deleteOne();
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
