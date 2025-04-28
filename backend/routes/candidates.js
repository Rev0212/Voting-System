const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/candidates
// @desc    Get all candidates
// @access  Public
router.get('/', async (req, res) => {
  try {
    const filter = {};
    
    // Filter by election if provided
    if (req.query.electionId) {
      filter.electionId = req.query.electionId;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const candidates = await Candidate.find(filter)
      .populate('userId', 'name email')
      .populate('electionId', 'title');
      
    res.json(candidates);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/candidates/:id
// @desc    Get candidate by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('electionId', 'title description startDate endDate status');
      
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/candidates/apply
// @desc    Apply as a candidate
// @access  Private
router.post(
  '/apply',
  [
    protect,
    body('electionId').notEmpty().withMessage('Election ID is required'),
    body('manifesto').notEmpty().withMessage('Manifesto is required'),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { electionId, manifesto, profileImage } = req.body;

    try {
      // Check if election exists
      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ message: 'Election not found' });
      }
      
      // Check if election is still open for applications
      if (election.status === 'Ended') {
        return res.status(400).json({ 
          message: 'This election has ended and is not accepting applications' 
        });
      }
      
      // Check if user is already a candidate for this election
      const existingCandidate = await Candidate.findOne({
        userId: req.user._id,
        electionId,
      });
      
      if (existingCandidate) {
        return res.status(400).json({ 
          message: 'You have already applied for this election' 
        });
      }

      // Create candidate
      const candidate = new Candidate({
        userId: req.user._id,
        electionId,
        manifesto,
        profileImage: profileImage || '',
      });

      await candidate.save();
      
      res.status(201).json(candidate);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PATCH /api/candidates/:id/verify
// @desc    Verify/approve a candidate
// @access  Private/Admin
router.patch(
  '/:id/verify',
  [
    protect,
    authorize('admin'),
    body('status')
      .isIn(['Verified', 'Rejected'])
      .withMessage('Status must be Verified or Rejected'),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const candidate = await Candidate.findById(req.params.id);
      if (!candidate) {
        return res.status(404).json({ message: 'Candidate not found' });
      }

      const { status } = req.body;
      candidate.status = status;
      
      await candidate.save();
      
      res.json(candidate);
    } catch (error) {
      console.error(error.message);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Candidate not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/candidates/:id
// @desc    Delete a candidate application
// @access  Private/Admin or Owner
router.delete('/:id', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if user is admin or the candidate owner
    if (
      req.user.role !== 'admin' && 
      candidate.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ 
        message: 'Not authorized to delete this application' 
      });
    }

    await candidate.deleteOne();
    res.json({ message: 'Candidate application removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;